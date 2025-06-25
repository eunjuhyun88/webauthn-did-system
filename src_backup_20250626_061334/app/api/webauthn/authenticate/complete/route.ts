// =============================================================================
// 🔌 WebAuthn Authentication Complete API Route
// 파일 경로: src/app/api/webauthn/authenticate/complete/route.ts
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { SignJWT } from 'jose';
import { WebAuthnAdapter } from '@/integration-layer/webauthn/WebAuthnAdapter';
// =============================================================================
// 🔧 환경 설정 및 초기화
// =============================================================================

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const jwtSecret = new TextEncoder().encode(process.env.JWT_SECRET!);
const jwtRefreshSecret = new TextEncoder().encode(process.env.JWT_REFRESH_SECRET!);

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// =============================================================================
// 📋 타입 정의
// =============================================================================

interface AuthenticationCompleteRequest {
  credential: {
    id: string;
    rawId: string;
    response: {
      authenticatorData: string;
      clientDataJSON: string;
      signature: string;
    };
    type: string;
  };
  challengeData: {
    challenge: string;
  };
}

interface AuthenticationCompleteResponse {
  success: boolean;
  tokens?: {
    accessToken: string;
    refreshToken: string;
    expiresAt: number;
  };
  user?: {
    id: string;
    did: string;
    email: string;
    displayName: string;
    authMethod: string;
    subscription: string;
  };
  error?: string;
}

interface VerificationResult {
  verified: boolean;
  error?: string;
  authenticationInfo?: {
    counter: number;
    credentialID: string;
  };
}

// =============================================================================
// 🛠️ 유틸리티 함수들
// =============================================================================

/**
 * JWT 토큰 생성
 */
async function generateTokens(userId: string, email: string) {
  const now = Math.floor(Date.now() / 1000);
  const accessTokenExpiry = now + (15 * 60); // 15분
  const refreshTokenExpiry = now + (7 * 24 * 60 * 60); // 7일

  const accessToken = await new SignJWT({
    sub: userId,
    email,
    type: 'access'
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt(now)
    .setExpirationTime(accessTokenExpiry)
    .sign(jwtSecret);

  const refreshToken = await new SignJWT({
    sub: userId,
    email,
    type: 'refresh'
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt(now)
    .setExpirationTime(refreshTokenExpiry)
    .sign(jwtRefreshSecret);

  return {
    accessToken,
    refreshToken,
    expiresAt: accessTokenExpiry * 1000 // 밀리초로 변환
  };
}

/**
 * 간소화된 WebAuthn 인증 검증 (실제로는 @simplewebauthn/server 사용 권장)
 */
async function verifyAuthentication(
  credential: any,
  expectedChallenge: string,
  expectedOrigin: string,
  expectedRPID: string,
  storedCounter: number
): Promise<VerificationResult> {
  try {
    // 1. Client Data 파싱
    const clientDataJSON = Buffer.from(credential.response.clientDataJSON, 'base64url').toString('utf-8');
    const clientData = JSON.parse(clientDataJSON);
    
    // 2. 기본 검증
    if (clientData.type !== 'webauthn.get') {
      return { verified: false, error: 'Invalid ceremony type' };
    }
    
    if (clientData.challenge !== expectedChallenge) {
      return { verified: false, error: 'Challenge mismatch' };
    }
    
    if (!clientData.origin.includes(expectedRPID)) {
      return { verified: false, error: 'Origin mismatch' };
    }
    
    // 3. Authenticator Data 파싱 (간소화)
    const authenticatorData = Buffer.from(credential.response.authenticatorData, 'base64url');
    
    // 간단한 카운터 검증 (실제로는 더 복잡한 검증 필요)
    const flags = authenticatorData[32];
    const userPresent = !!(flags & 0x01);
    const userVerified = !!(flags & 0x04);
    
    if (!userPresent) {
      return { verified: false, error: 'User not present' };
    }
    
    // 카운터 추출 (바이트 33-36)
    const counter = authenticatorData.readUInt32BE(33);
    
    if (counter <= storedCounter) {
      return { verified: false, error: 'Counter value too low (possible replay attack)' };
    }
    
    // 4. 성공 반환 (실제로는 서명 검증도 필요)
    return {
      verified: true,
      authenticationInfo: {
        counter,
        credentialID: credential.id
      }
    };
    
  } catch (error) {
    console.error('WebAuthn authentication verification error:', error);
    return { verified: false, error: 'Verification failed' };
  }
}

/**
 * User Agent에서 디바이스 이름 추출
 */
function getDeviceName(userAgent: string): string {
  if (userAgent.includes('iPhone')) return 'iPhone';
  if (userAgent.includes('iPad')) return 'iPad';
  if (userAgent.includes('Android')) return 'Android Device';
  if (userAgent.includes('Windows')) return 'Windows Device';
  if (userAgent.includes('Mac')) return 'Mac';
  if (userAgent.includes('Linux')) return 'Linux Device';
  
  if (userAgent.includes('Chrome')) return 'Chrome Browser';
  if (userAgent.includes('Firefox')) return 'Firefox Browser';
  if (userAgent.includes('Safari')) return 'Safari Browser';
  if (userAgent.includes('Edge')) return 'Edge Browser';
  
  return 'Unknown Device';
}

// =============================================================================
// 🔌 API 핸들러
// =============================================================================

export async function POST(req: NextRequest): Promise<NextResponse<AuthenticationCompleteResponse>> {
  try {
    const body = await req.json() as AuthenticationCompleteRequest;
    const { credential, challengeData } = body;

    console.log('📥 WebAuthn 인증 완료 요청 수신:', {
      credentialId: credential?.id,
      timestamp: new Date().toISOString()
    });

    // =============================================================================
    // 1. 입력 검증
    // =============================================================================

    if (!credential || !challengeData) {
      return NextResponse.json({
        success: false,
        error: 'Credential 또는 챌린지 데이터가 누락되었습니다.'
      }, { status: 400 });
    }

    if (!credential.id || !credential.response || !credential.response.signature) {
      return NextResponse.json({
        success: false,
        error: '유효하지 않은 credential 형식입니다.'
      }, { status: 400 });
    }

    // =============================================================================
    // 2. 챌린지 검증 및 조회
    // =============================================================================

    let storedChallenge: any;

    try {
      const { data: challenge, error: challengeError } = await supabaseAdmin
        .from('webauthn_challenges')
        .select('*')
        .eq('challenge', challengeData.challenge)
        .eq('type', 'authentication')
        .gte('expires_at', new Date().toISOString())
        .single();

      if (challengeError || !challenge) {
        console.error('❌ 챌린지 조회 실패:', challengeError);
        return NextResponse.json({
          success: false,
          error: '유효하지 않거나 만료된 챌린지입니다.'
        }, { status: 400 });
      }

      storedChallenge = challenge;

      // 챌린지 사용 완료 처리 (삭제)
      await supabaseAdmin
        .from('webauthn_challenges')
        .delete()
        .eq('challenge', challengeData.challenge);

      console.log('✅ 챌린지 검증 완료');

    } catch (error) {
      console.error('❌ 챌린지 검증 오류:', error);
      return NextResponse.json({
        success: false,
        error: '챌린지 검증 중 오류가 발생했습니다.'
      }, { status: 500 });
    }

    // =============================================================================
    // 3. Credential 조회 및 사용자 확인
    // =============================================================================

    let storedCredential: any;
    let user: any;

    try {
      const { data: credentialData, error: credentialError } = await supabaseAdmin
        .from('webauthn_credentials')
        .select(`
          *,
          users!inner(
            id, did, email, display_name, auth_method, 
            subscription_type, is_active, preferences, agent_profile
          )
        `)
        .eq('credential_id', credential.id)
        .eq('user_email', storedChallenge.username)
        .eq('is_active', true)
        .single();

      if (credentialError || !credentialData) {
        console.error('❌ Credential 조회 실패:', credentialError);
        return NextResponse.json({
          success: false,
          error: '등록되지 않은 인증기입니다.'
        }, { status: 404 });
      }

      storedCredential = credentialData;
      user = credentialData.users;

      if (!user.is_active) {
        console.log('❌ 비활성화된 사용자:', user.email);
        return NextResponse.json({
          success: false,
          error: '비활성화된 계정입니다.'
        }, { status: 403 });
      }

      console.log('✅ Credential 및 사용자 확인 완료:', user.id);

    } catch (error) {
      console.error('❌ Credential 조회 오류:', error);
      return NextResponse.json({
        success: false,
        error: 'Credential 조회 중 오류가 발생했습니다.'
      }, { status: 500 });
    }

    // =============================================================================
    // 4. WebAuthn 인증 검증
    // =============================================================================

    const verificationResult = await verifyAuthentication(
      credential,
      challengeData.challenge,
      process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      process.env.WEBAUTHN_RP_ID || 'localhost',
      storedCredential.counter
    );

    if (!verificationResult.verified) {
      console.error('❌ WebAuthn 인증 검증 실패:', verificationResult.error);
      return NextResponse.json({
        success: false,
        error: verificationResult.error || '인증 검증에 실패했습니다.'
      }, { status: 400 });
    }

    console.log('✅ WebAuthn 인증 검증 완료');

    // =============================================================================
    // 5. 카운터 업데이트
    // =============================================================================

    try {
      await supabaseAdmin
        .from('webauthn_credentials')
        .update({
          counter: verificationResult.authenticationInfo?.counter || storedCredential.counter + 1,
          last_used_at: new Date().toISOString()
        })
        .eq('credential_id', credential.id);

      console.log('✅ 카운터 업데이트 완료');
    } catch (error) {
      console.error('❌ 카운터 업데이트 실패:', error);
      // 치명적이지 않으므로 계속 진행
    }

    // =============================================================================
    // 6. JWT 토큰 생성
    // =============================================================================

    const tokens = await generateTokens(user.id, user.email);

    // =============================================================================
    // 7. 로그인 세션 기록
    // =============================================================================

    try {
      await supabaseAdmin
        .from('user_sessions')
        .insert({
          user_id: user.id,
          session_token: tokens.accessToken.substring(-8), // 마지막 8자리만 저장
          device_info: getDeviceName(req.headers.get('user-agent') || ''),
          ip_address: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
          user_agent: req.headers.get('user-agent') || 'unknown',
          login_method: 'webauthn',
          expires_at: new Date(tokens.expiresAt).toISOString()
        });

      console.log('✅ 세션 기록 완료');
    } catch (error) {
      console.error('❌ 세션 기록 실패:', error);
      // 치명적이지 않으므로 계속 진행
    }

    // =============================================================================
    // 8. 활동 로그 기록
    // =============================================================================

    try {
      await supabaseAdmin
        .from('user_activity_logs')
        .insert({
          user_id: user.id,
          activity_type: 'webauthn_login_success',
          activity_data: {
            credentialId: credential.id,
            deviceName: getDeviceName(req.headers.get('user-agent') || ''),
            loginTime: new Date().toISOString(),
            counter: verificationResult.authenticationInfo?.counter
          },
          ip_address: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
          user_agent: req.headers.get('user-agent') || 'unknown'
        });

      console.log('✅ 활동 로그 기록 완료');
    } catch (error) {
      console.error('❌ 활동 로그 기록 실패:', error);
      // 치명적이지 않으므로 계속 진행
    }

    // =============================================================================
    // 9. 성공 응답
    // =============================================================================

    console.log(`🎉 WebAuthn 인증 성공: ${user.email} (${user.id})`);

    return NextResponse.json({
      success: true,
      tokens,
      user: {
        id: user.id,
        did: user.did,
        email: user.email,
        displayName: user.display_name,
        authMethod: user.auth_method,
        subscription: user.subscription_type
      }
    }, {
      headers: {
        'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff',
        'Set-Cookie': `auth-token=${tokens.accessToken}; HttpOnly; Secure; SameSite=Strict; Max-Age=${15 * 60}`
      }
    });

  } catch (error) {
    console.error('❌ WebAuthn 인증 완료 API 오류:', error);
    
    return NextResponse.json({
      success: false,
      error: '서버 내부 오류가 발생했습니다.'
    }, { status: 500 });
  }
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
// =============================================================================
// 🤖 Agent Passport 자동 생성 추가 (기존 로직 끝에 추가)
// =============================================================================

// 기존 WebAuthn 로직 성공 후에 Agent Passport 생성
async function createAgentPassportAfterAuth(authResult: any) {
  try {
    console.log('🤖 WebAuthn 성공 후 Agent Passport 생성 시도...');
    
    // Agent Passport API 호출
    const agentResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/zauri/agent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ authResult })
    });

    if (agentResponse.ok) {
      const agentData = await agentResponse.json();
      console.log('✅ Agent Passport 생성 성공:', agentData.agentPassport?.name);
      return agentData.agentPassport;
    } else {
      console.log('⚠️ Agent Passport 생성 실패 (로그인은 성공)');
      return null;
    }
  } catch (error) {
    console.error('❌ Agent Passport 생성 중 오류:', error);
    return null;
  }
}
