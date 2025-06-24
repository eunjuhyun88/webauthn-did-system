/**
 * 🌐 DID 생성 API 라우트
 * src/app/api/did/create/route.ts
 * 
 * WebAuthn 인증 후 DID 생성을 처리하는 API 엔드포인트
 * POST /api/did/create
 */

import { NextRequest, NextResponse } from 'next/server';
import { createDID, addWebAuthnCredentialToDID } from '@/identity/did';
import { completeRegistration } from '@/auth/webauthn/server';
import { storeWebAuthnCredential } from '@/database/repositories/credentials';
import { headers } from 'next/headers';

// =============================================================================
// 📝 요청/응답 타입 정의
// =============================================================================

interface CreateDIDRequest {
  userDisplayName: string;
  userEmail?: string;
  webauthnResponse?: any; // WebAuthn registration response
  metadata?: Record<string, any>;
}

interface CreateDIDResponse {
  success: boolean;
  did?: string;
  document?: any;
  webauthnCredential?: {
    id: string;
    credentialId: string;
  };
  error?: string;
  errorCode?: string;
}

// =============================================================================
// 🎯 메인 DID 생성 핸들러
// =============================================================================

export async function POST(request: NextRequest): Promise<NextResponse<CreateDIDResponse>> {
  try {
    console.log('🆔 DID 생성 API 요청 시작');

    // 요청 데이터 파싱
    const body: CreateDIDRequest = await request.json();
    const { userDisplayName, userEmail, webauthnResponse, metadata } = body;

    // 입력 검증
    const validationError = validateCreateDIDRequest(body);
    if (validationError) {
      return NextResponse.json({
        success: false,
        error: validationError,
        errorCode: 'VALIDATION_ERROR'
      }, { status: 400 });
    }

    // 클라이언트 정보 추출
    const headersList = headers();
    const userAgent = headersList.get('user-agent') || '';
    const clientIP = headersList.get('x-forwarded-for') || 
                    headersList.get('x-real-ip') || 
                    'unknown';

    console.log(`📱 클라이언트 정보 - UA: ${userAgent.substring(0, 50)}..., IP: ${clientIP}`);

    let webauthnCredential: any = null;
    let publicKey: string | undefined;

    // WebAuthn 등록이 포함된 경우 처리
    if (webauthnResponse) {
      console.log('🔐 WebAuthn 등록 처리 중...');

      // 임시 DID 생성 (WebAuthn 검증을 위해)
      const tempDID = `temp:${Date.now()}:${Math.random().toString(36).substring(2)}`;

      // WebAuthn 등록 완료
      const registrationResult = await completeRegistration(tempDID, webauthnResponse);

      if (!registrationResult.success || !registrationResult.credential) {
        console.error('❌ WebAuthn 등록 실패:', registrationResult.error);
        return NextResponse.json({
          success: false,
          error: registrationResult.error || 'WebAuthn 등록 실패',
          errorCode: 'WEBAUTHN_REGISTRATION_FAILED'
        }, { status: 400 });
      }

      webauthnCredential = registrationResult.credential;
      publicKey = webauthnCredential.public_key;

      console.log('✅ WebAuthn 등록 완료');
    }

    // DID 생성
    console.log('🆔 DID 생성 중...');

    const didResult = await createDID({
      userDisplayName,
      userEmail,
      webauthnCredentialId: webauthnCredential?.credential_id,
      publicKey,
      metadata: {
        ...metadata,
        clientInfo: {
          userAgent,
          ip: clientIP,
          registrationDate: new Date().toISOString(),
        }
      }
    });

    if (!didResult.success || !didResult.did || !didResult.document) {
      console.error('❌ DID 생성 실패:', didResult.error);
      return NextResponse.json({
        success: false,
        error: didResult.error || 'DID 생성 실패',
        errorCode: 'DID_CREATION_FAILED'
      }, { status: 500 });
    }

    const { did, document } = didResult;
    console.log(`✅ DID 생성 완료: ${did}`);

    // WebAuthn 자격증명이 있는 경우 추가 처리
    if (webauthnCredential) {
      console.log('🔗 WebAuthn 자격증명을 DID에 연결 중...');

      // 1. 자격증명 저장소에 저장
      const storeResult = await storeWebAuthnCredential(
        did,
        {
          ...webauthnCredential,
          user_did: did, // 실제 DID로 업데이트
        },
        userAgent
      );

      if (!storeResult.success) {
        console.error('❌ 자격증명 저장 실패:', storeResult.error);
        // DID는 이미 생성되었으므로 경고만 로그
      }

      // 2. DID 문서에 WebAuthn 검증 방법 추가
      const addCredResult = await addWebAuthnCredentialToDID(
        did,
        webauthnCredential.credential_id,
        webauthnCredential.public_key
      );

      if (!addCredResult.success) {
        console.error('❌ DID에 WebAuthn 자격증명 추가 실패:', addCredResult.error);
        // 경고만 로그, 실패하지 않음
      }

      console.log('✅ WebAuthn 자격증명 DID 연결 완료');
    }

    // 성공 응답
    const response: CreateDIDResponse = {
      success: true,
      did,
      document,
      webauthnCredential: webauthnCredential ? {
        id: webauthnCredential.id,
        credentialId: webauthnCredential.credential_id
      } : undefined
    };

    console.log('🎉 DID 생성 API 요청 완료');

    return NextResponse.json(response, { 
      status: 201,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      }
    });

  } catch (error) {
    console.error('❌ DID 생성 API 오류:', error);

    const errorResponse: CreateDIDResponse = {
      success: false,
      error: error instanceof Error ? error.message : '서버 내부 오류',
      errorCode: 'INTERNAL_SERVER_ERROR'
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}

// =============================================================================
// 🛠️ 유틸리티 함수들
// =============================================================================

/**
 * 요청 데이터 검증
 */
function validateCreateDIDRequest(body: CreateDIDRequest): string | null {
  if (!body.userDisplayName || body.userDisplayName.trim().length === 0) {
    return '사용자 표시 이름이 필요합니다';
  }

  if (body.userDisplayName.length > 100) {
    return '사용자 표시 이름이 너무 깁니다 (최대 100자)';
  }

  if (body.userEmail && !isValidEmail(body.userEmail)) {
    return '유효하지 않은 이메일 형식입니다';
  }

  // WebAuthn 응답 기본 검증
  if (body.webauthnResponse) {
    if (!body.webauthnResponse.id || !body.webauthnResponse.response) {
      return '유효하지 않은 WebAuthn 응답입니다';
    }
  }

  return null;
}

/**
 * 이메일 형식 검증
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// =============================================================================
// 🔍 DID 조회 핸들러 (GET 요청)
// =============================================================================

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const userEmail = searchParams.get('email');
    const did = searchParams.get('did');

    if (!userEmail && !did) {
      return NextResponse.json({
        success: false,
        error: 'email 또는 did 파라미터가 필요합니다',
        errorCode: 'MISSING_PARAMETERS'
      }, { status: 400 });
    }

    // DID로 조회하는 경우
    if (did) {
      const { resolveDID } = await import('@/identity/did');
      const result = await resolveDID(did);

      if (!result.success) {
        return NextResponse.json({
          success: false,
          error: result.error,
          errorCode: 'DID_NOT_FOUND'
        }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        did,
        document: result.document
      });
    }

    // 이메일로 조회하는 경우
    if (userEmail) {
      const { getUserDIDs } = await import('@/identity/did');
      const dids = await getUserDIDs(userEmail);

      return NextResponse.json({
        success: true,
        email: userEmail,
        dids
      });
    }

    return NextResponse.json({
      success: false,
      error: '알 수 없는 요청입니다',
      errorCode: 'UNKNOWN_REQUEST'
    }, { status: 400 });

  } catch (error) {
    console.error('❌ DID 조회 API 오류:', error);

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '서버 내부 오류',
      errorCode: 'INTERNAL_SERVER_ERROR'
    }, { status: 500 });
  }
}

// =============================================================================
// 🔄 DID 업데이트 핸들러 (PUT 요청)
// =============================================================================

export async function PUT(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { did, updates } = body;

    if (!did || !updates) {
      return NextResponse.json({
        success: false,
        error: 'did와 updates가 필요합니다',
        errorCode: 'MISSING_PARAMETERS'
      }, { status: 400 });
    }

    const { updateDIDDocument } = await import('@/identity/did');
    const result = await updateDIDDocument(did, updates);

    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: result.error,
        errorCode: 'DID_UPDATE_FAILED'
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      did,
      document: result.document
    });

  } catch (error) {
    console.error('❌ DID 업데이트 API 오류:', error);

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '서버 내부 오류',
      errorCode: 'INTERNAL_SERVER_ERROR'
    }, { status: 500 });
  }
}

// =============================================================================
// 🗑️ DID 비활성화 핸들러 (DELETE 요청)
// =============================================================================

export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const did = searchParams.get('did');

    if (!did) {
      return NextResponse.json({
        success: false,
        error: 'did 파라미터가 필요합니다',
        errorCode: 'MISSING_PARAMETERS'
      }, { status: 400 });
    }

    const { deactivateDID } = await import('@/identity/did');
    const result = await deactivateDID(did);

    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: result.error,
        errorCode: 'DID_DEACTIVATION_FAILED'
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'DID가 성공적으로 비활성화되었습니다',
      did
    });

  } catch (error) {
    console.error('❌ DID 비활성화 API 오류:', error);

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '서버 내부 오류',
      errorCode: 'INTERNAL_SERVER_ERROR'
    }, { status: 500 });
  }
}