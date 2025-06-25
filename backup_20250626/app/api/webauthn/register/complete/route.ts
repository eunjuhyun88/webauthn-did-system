// =============================================================================
// 🔌 WebAuthn Registration Complete API Route
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { getWebAuthnService } from '@/auth/webauthn';
import { supabaseAdmin } from '@/database/supabase/client';
import { generateDID } from '@/services/ai';

interface RegistrationCompleteRequest {
  credential: {
    id: string;
    rawId: string;
    response: {
      attestationObject: string;
      clientDataJSON: string;
      transports?: AuthenticatorTransport[];
    };
    type: string;
  };
  challengeData: {
    challenge: string;
    username: string;
    displayName: string;
    timestamp: number;
    expiresAt: number;
  };
}

interface RegistrationCompleteResponse {
  success: boolean;
  user?: {
    id: string;
    did: string;
    email: string;
    displayName: string;
    authMethod: string;
  };
  error?: string;
}

export async function POST(req: NextRequest): Promise<NextResponse<RegistrationCompleteResponse>> {
  try {
    const body = await req.json() as RegistrationCompleteRequest;
    const { credential, challengeData } = body;

    // =============================================================================
    // 1. 입력 검증
    // =============================================================================

    if (!credential || !challengeData) {
      return NextResponse.json({
        success: false,
        error: 'Credential 또는 챌린지 데이터가 누락되었습니다.'
      }, { status: 400 });
    }

    if (!credential.id || !credential.response || !credential.response.attestationObject) {
      return NextResponse.json({
        success: false,
        error: '유효하지 않은 credential 형식입니다.'
      }, { status: 400 });
    }

    // =============================================================================
    // 2. 챌린지 검증 및 조회
    // =============================================================================

    try {
      // 데이터베이스에서 챌린지 조회
      const { data: storedChallenge, error: challengeError } = await supabaseAdmin
        .from('webauthn_challenges')
        .select('*')
        .eq('challenge', challengeData.challenge)
        .eq('username', challengeData.username.toLowerCase())
        .eq('type', 'registration')
        .gte('expires_at', new Date().toISOString())
        .single();

      if (challengeError || !storedChallenge) {
        console.error('챌린지 조회 실패:', challengeError);
        return NextResponse.json({
          success: false,
          error: '유효하지 않거나 만료된 챌린지입니다.'
        }, { status: 400 });
      }

      // 챌린지 사용 완료 처리 (삭제)
      await supabaseAdmin
        .from('webauthn_challenges')
        .delete()
        .eq('challenge', challengeData.challenge);

    } catch (error) {
      console.error('챌린지 검증 오류:', error);
      return NextResponse.json({
        success: false,
        error: '챌린지 검증 중 오류가 발생했습니다.'
      }, { status: 500 });
    }

    // =============================================================================
    // 3. Credential 중복 확인
    // =============================================================================

    try {
      const { data: existingCredential } = await supabaseAdmin
        .from('webauthn_credentials')
        .select('id')
        .eq('credential_id', credential.id)
        .single();

      if (existingCredential) {
        return NextResponse.json({
          success: false,
          error: '이미 등록된 인증기입니다.'
        }, { status: 409 });
      }
    } catch (error) {
      // 존재하지 않는 경우는 정상 (새 등록)
      console.log('새로운 credential 등록 진행');
    }

    // =============================================================================
    // 4. WebAuthn Credential 검증
    // =============================================================================

    const webauthnService = getWebAuthnService();

    // ArrayBuffer로 변환하여 검증
    const credentialForVerification = {
      ...credential,
      rawId: Buffer.from(credential.rawId, 'base64url'),
      response: {
        ...credential.response,
        attestationObject: Buffer.from(credential.response.attestationObject, 'base64url'),
        clientDataJSON: Buffer.from(credential.response.clientDataJSON, 'base64url')
      }
    } as unknown as PublicKeyCredential;

    const verificationResult = await webauthnService.verifyRegistration({
      credential: credentialForVerification,
      expectedChallenge: challengeData.challenge,
      expectedOrigin: process.env.WEBAUTHN_ORIGIN || 'http://localhost:3000',
      expectedRPID: process.env.WEBAUTHN_RP_ID || 'localhost'
    });

    if (!verificationResult.verified) {
      console.error('WebAuthn 검증 실패:', verificationResult.error);
      return NextResponse.json({
        success: false,
        error: verificationResult.error || 'Credential 검증에 실패했습니다.'
      }, { status: 400 });
    }

    // =============================================================================
    // 5. DID 생성
    // =============================================================================

    const did = generateDID('web', credential.id);

    // =============================================================================
    // 6. 데이터베이스에 사용자 및 Credential 저장
    // =============================================================================

    let userId: string;
    let newUser: any;

    try {
      // 트랜잭션으로 사용자와 credential 동시 생성
      const { data: userData, error: userError } = await supabaseAdmin
        .from('users')
        .insert({
          did,
          email: challengeData.username.toLowerCase(),
          display_name: challengeData.displayName,
          auth_method: 'webauthn',
          subscription_type: 'free',
          preferences: {},
          agent_profile: {},
          trust_score: 50,
          level: 1,
          is_active: true
        })
        .select()
        .single();

      if (userError || !userData) {
        console.error('사용자 생성 실패:', userError);
        return NextResponse.json({
          success: false,
          error: '사용자 생성에 실패했습니다.'
        }, { status: 500 });
      }

      userId = userData.id;
      newUser = userData;

      // WebAuthn Credential 저장
      const { error: credentialError } = await supabaseAdmin
        .from('webauthn_credentials')
        .insert({
          user_id: userId,
          user_email: challengeData.username.toLowerCase(),
          credential_id: credential.id,
          public_key: credential.response.attestationObject, // 실제로는 파싱된 공개키 저장
          counter: verificationResult.registrationInfo?.counter || 0,
          transports: credential.response.transports || [],
          aaguid: null, // 실제로는 attestationObject에서 추출
          device_name: getDeviceName(req.headers.get('user-agent') || ''),
          is_active: true
        });

      if (credentialError) {
        console.error('Credential 저장 실패:', credentialError);
        
        // 롤백: 생성된 사용자 삭제
        await supabaseAdmin
          .from('users')
          .delete()
          .eq('id', userId);

        return NextResponse.json({
          success: false,
          error: 'Credential 저장에 실패했습니다.'
        }, { status: 500 });
      }

    } catch (error) {
      console.error('데이터베이스 저장 오류:', error);
      return NextResponse.json({
        success: false,
        error: '데이터베이스 저장 중 오류가 발생했습니다.'
      }, { status: 500 });
    }

    // =============================================================================
    // 7. DID 문서 생성 및 저장
    // =============================================================================

    try {
      const didDocument = {
        '@context': [
          'https://www.w3.org/ns/did/v1',
          'https://w3id.org/security/suites/ed25519-2020/v1'
        ],
        id: did,
        controller: did,
        verificationMethod: [{
          id: `${did}#key-1`,
          type: 'Ed25519VerificationKey2020',
          controller: did,
          publicKeyMultibase: credential.response.attestationObject // 실제로는 적절히 변환
        }],
        authentication: [`${did}#key-1`],
        assertionMethod: [`${did}#key-1`],
        keyAgreement: [`${did}#key-1`],
        service: [{
          id: `${did}#webauthn`,
          type: 'WebAuthnService',
          serviceEndpoint: process.env.WEBAUTHN_ORIGIN || 'http://localhost:3000'
        }]
      };

      const { error: didError } = await supabaseAdmin
        .from('did_documents')
        .insert({
          did,
          user_id: userId,
          document: didDocument,
          version: 1,
          status: 'active'
        });

      if (didError) {
        console.error('DID 문서 저장 실패:', didError);
        // DID 문서 저장 실패는 치명적이지 않으므로 로그만 남기고 계속 진행
      }
    } catch (error) {
      console.error('DID 문서 생성/저장 오류:', error);
      // 계속 진행
    }

    // =============================================================================
    // 8. 활동 로그 기록
    // =============================================================================

    try {
      await supabaseAdmin
        .from('user_activity_logs')
        .insert({
          user_id: userId,
          activity_type: 'webauthn_registration',
          activity_data: {
            credentialId: credential.id,
            deviceName: getDeviceName(req.headers.get('user-agent') || ''),
            transports: credential.response.transports || [],
            registrationTime: new Date().toISOString()
          },
          ip_address: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
          user_agent: req.headers.get('user-agent') || 'unknown'
        });
    } catch (error) {
      console.error('활동 로그 기록 실패:', error);
      // 치명적이지 않으므로 계속 진행
    }

    // =============================================================================
    // 9. 성공 응답
    // =============================================================================

    console.log(`WebAuthn 등록 완료: ${challengeData.username} (${userId})`);

    return NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        did: newUser.did,
        email: newUser.email,
        displayName: newUser.display_name,
        authMethod: newUser.auth_method
      }
    }, {
      headers: {
        'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff'
      }
    });

  } catch (error) {
    console.error('WebAuthn 등록 완료 API 오류:', error);
    
    return NextResponse.json({
      success: false,
      error: '서버 내부 오류가 발생했습니다.'
    }, { status: 500 });
  }
}

// =============================================================================
// 헬퍼 함수들
// =============================================================================

/**
 * User Agent에서 디바이스 이름 추출
 */
function getDeviceName(userAgent: string): string {
  // 간단한 디바이스 이름 추출 로직
  if (userAgent.includes('iPhone')) return 'iPhone';
  if (userAgent.includes('iPad')) return 'iPad';
  if (userAgent.includes('Android')) return 'Android Device';
  if (userAgent.includes('Windows')) return 'Windows Device';
  if (userAgent.includes('Mac')) return 'Mac';
  if (userAgent.includes('Linux')) return 'Linux Device';
  
  // 브라우저 정보 포함
  if (userAgent.includes('Chrome')) return 'Chrome Browser';
  if (userAgent.includes('Firefox')) return 'Firefox Browser';
  if (userAgent.includes('Safari')) return 'Safari Browser';
  if (userAgent.includes('Edge')) return 'Edge Browser';
  
  return 'Unknown Device';
}

// =============================================================================
// OPTIONS 핸들러 (CORS 대응)
// =============================================================================

export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}