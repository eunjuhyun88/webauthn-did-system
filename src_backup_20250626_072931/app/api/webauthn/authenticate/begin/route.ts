// =============================================================================
// 🔌 WebAuthn Authentication Begin API Route (완성)
// 파일 경로: src/app/api/webauthn/authenticate/begin/route.ts
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { WebAuthnAdapter } from '@simplewebauthn/server';
import crypto from 'crypto';

// =============================================================================
// 🔧 환경 설정 및 초기화
// =============================================================================

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// =============================================================================
// 📋 타입 정의
// =============================================================================

interface AuthenticationBeginRequest {
  email: string;
}

interface AuthenticationBeginResponse {
  success: boolean;
  challengeData?: {
    challenge: string;
    rpId: string;
    userVerification: UserVerificationRequirement;
    allowCredentials: PublicKeyCredentialDescriptor[];
    timeout: number;
  };
  error?: string;
}

interface StoredCredential {
  credential_id: string;
  transports: AuthenticatorTransport[];
  device_name: string;
  is_active: boolean;
}

// =============================================================================
// 🛠️ 유틸리티 함수들
// =============================================================================

/**
 * 안전한 랜덤 챌린지 생성
 */
function generateChallenge(): string {
  return crypto.randomBytes(32).toString('base64url');
}

/**
 * Base64URL 인코딩
 */
function toBase64URL(buffer: ArrayBuffer | string): string {
  if (typeof buffer === 'string') {
    buffer = Buffer.from(buffer, 'utf-8');
  }
  return Buffer.from(buffer).toString('base64url');
}

/**
 * 이메일 형식 검증
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// =============================================================================
// 🔌 API 핸들러
// =============================================================================

export async function POST(req: NextRequest): Promise<NextResponse<AuthenticationBeginResponse>> {
  try {
    const body = await req.json() as AuthenticationBeginRequest;
    const { email } = body;

    console.log('📥 WebAuthn 인증 시작 요청 수신:', {
      email: email?.replace(/(.{2}).*(@.*)/, '$1***$2'), // 이메일 마스킹
      timestamp: new Date().toISOString(),
      ip: req.headers.get('x-forwarded-for') || 'unknown'
    });

    // =============================================================================
    // 1. 입력 검증
    // =============================================================================

    if (!email) {
      return NextResponse.json({
        success: false,
        error: '이메일 주소가 필요합니다.'
      }, { status: 400 });
    }

    if (!isValidEmail(email)) {
      return NextResponse.json({
        success: false,
        error: '유효하지 않은 이메일 형식입니다.'
      }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // =============================================================================
    // 2. 사용자 존재 확인
    // =============================================================================

    try {
      const { data: user, error: userError } = await supabaseAdmin
        .from('users')
        .select('id, email, display_name, is_active')
        .eq('email', normalizedEmail)
        .eq('auth_method', 'webauthn')
        .single();

      if (userError || !user) {
        console.log('❌ 사용자 찾을 수 없음:', normalizedEmail);
        return NextResponse.json({
          success: false,
          error: '등록되지 않은 사용자입니다. 먼저 회원가입을 진행해주세요.'
        }, { status: 404 });
      }

      if (!user.is_active) {
        console.log('❌ 비활성화된 사용자:', normalizedEmail);
        return NextResponse.json({
          success: false,
          error: '비활성화된 계정입니다. 관리자에게 문의하세요.'
        }, { status: 403 });
      }

      console.log('✅ 사용자 확인 완료:', user.id);

    } catch (error) {
      console.error('❌ 사용자 조회 오류:', error);
      return NextResponse.json({
        success: false,
        error: '사용자 조회 중 오류가 발생했습니다.'
      }, { status: 500 });
    }

    // =============================================================================
    // 3. 등록된 Credential 조회
    // =============================================================================

    let allowCredentials: PublicKeyCredentialDescriptor[] = [];

    try {
      const { data: credentials, error: credentialError } = await supabaseAdmin
        .from('webauthn_credentials')
        .select('credential_id, transports, device_name, is_active')
        .eq('user_email', normalizedEmail)
        .eq('is_active', true);

      if (credentialError) {
        console.error('❌ Credential 조회 실패:', credentialError);
        return NextResponse.json({
          success: false,
          error: 'Credential 조회 중 오류가 발생했습니다.'
        }, { status: 500 });
      }

      if (!credentials || credentials.length === 0) {
        console.log('❌ 등록된 credential 없음:', normalizedEmail);
        return NextResponse.json({
          success: false,
          error: '등록된 인증기가 없습니다. 먼저 인증기를 등록해주세요.'
        }, { status: 404 });
      }

      // PublicKeyCredentialDescriptor 형식으로 변환
      allowCredentials = credentials.map((cred: StoredCredential) => ({
        id: cred.credential_id,
        type: 'public-key' as const,
        transports: cred.transports.length > 0 ? cred.transports : ['internal', 'hybrid']
      }));

      console.log('✅ Credential 조회 완료:', {
        count: credentials.length,
        devices: credentials.map(c => c.device_name)
      });

    } catch (error) {
      console.error('❌ Credential 조회 오류:', error);
      return NextResponse.json({
        success: false,
        error: 'Credential 조회 중 오류가 발생했습니다.'
      }, { status: 500 });
    }

    // =============================================================================
    // 4. 챌린지 생성 및 저장
    // =============================================================================

    const challenge = generateChallenge();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5분 후 만료

    try {
      // 기존 인증 챌린지 정리 (같은 사용자의 만료되지 않은 챌린지들)
      await supabaseAdmin
        .from('webauthn_challenges')
        .delete()
        .eq('username', normalizedEmail)
        .eq('type', 'authentication');

      // 새 챌린지 저장
      const { error: challengeError } = await supabaseAdmin
        .from('webauthn_challenges')
        .insert({
          challenge,
          username: normalizedEmail,
          type: 'authentication',
          expires_at: expiresAt.toISOString(),
          created_at: new Date().toISOString()
        });

      if (challengeError) {
        console.error('❌ 챌린지 저장 실패:', challengeError);
        return NextResponse.json({
          success: false,
          error: '챌린지 생성 중 오류가 발생했습니다.'
        }, { status: 500 });
      }

      console.log('✅ 챌린지 생성 및 저장 완료');

    } catch (error) {
      console.error('❌ 챌린지 생성 오류:', error);
      return NextResponse.json({
        success: false,
        error: '챌린지 생성 중 오류가 발생했습니다.'
      }, { status: 500 });
    }

    // =============================================================================
    // 5. WebAuthn 챌린지 데이터 구성
    // =============================================================================

    const challengeData = {
      challenge,
      rpId: process.env.WEBAUTHN_RP_ID || 'localhost',
      userVerification: 'preferred' as UserVerificationRequirement,
      allowCredentials,
      timeout: 300000 // 5분 (300초)
    };

    // =============================================================================
    // 6. 활동 로그 기록
    // =============================================================================

    try {
      await supabaseAdmin
        .from('user_activity_logs')
        .insert({
          user_id: null, // 인증 전이므로 user_id는 null
          activity_type: 'webauthn_auth_attempt',
          activity_data: {
            email: normalizedEmail,
            credentialCount: allowCredentials.length,
            challengeId: challenge.substring(0, 8),
            userAgent: req.headers.get('user-agent') || 'unknown'
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
    // 7. 성공 응답
    // =============================================================================

    console.log(`🎯 WebAuthn 인증 시작 완료: ${normalizedEmail}`);

    return NextResponse.json({
      success: true,
      challengeData
    }, {
      headers: {
        'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff',
        'X-Challenge-ID': challenge.substring(0, 8)
      }
    });

  } catch (error) {
    console.error('❌ WebAuthn 인증 시작 API 오류:', error);
    
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