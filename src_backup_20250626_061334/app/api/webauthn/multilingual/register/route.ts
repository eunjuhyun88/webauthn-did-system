// =============================================================================
// 🌍 다국어 WebAuthn 등록 API
// src/app/api/webauthn/multilingual/register/route.ts
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { detectLanguageFromText, getWebAuthnMessages, detectBrowserLanguage } from '@/auth/webauthn/multilingual-helper';
import { SupportedLanguage } from '@/types/multilingual-cue';
import { WebAuthnAdapter } from '@/integration-layer/webauthn/WebAuthnAdapter';

interface MultilingualWebAuthnRequest {
  displayName?: string;
  userLanguage?: SupportedLanguage;
  interactionHistory?: Array<{
    id: string;
    content: string;
    timestamp: string;
    type: string;
    context: string;
  }>;
}

export async function POST(request: NextRequest) {
  try {
    console.log('🌍 다국어 WebAuthn 등록 요청 수신...');
    
    // 1. 요청 데이터 파싱
    const body: MultilingualWebAuthnRequest = await request.json();
    console.log('📝 요청 데이터:', body);
    
    // 2. 언어 감지
    let detectedLanguage: SupportedLanguage = 'english';
    
    // 사용자가 지정한 언어가 있으면 우선 사용
    if (body.userLanguage) {
      detectedLanguage = body.userLanguage;
      console.log(`🎯 사용자 지정 언어: ${detectedLanguage}`);
    }
    // 상호작용 히스토리에서 언어 감지
    else if (body.interactionHistory && body.interactionHistory.length > 0) {
      const recentText = body.interactionHistory
        .slice(-2)
        .map(msg => msg.content)
        .join(' ');
      
      detectedLanguage = detectLanguageFromText(recentText);
      console.log(`🔍 텍스트에서 감지된 언어: ${detectedLanguage}`);
      console.log(`📄 분석된 텍스트: "${recentText}"`);
    }
    // 브라우저 Accept-Language 헤더에서 감지
    else {
      const acceptLanguage = request.headers.get('accept-language');
      detectedLanguage = detectBrowserLanguage(acceptLanguage || undefined);
      console.log(`🌐 브라우저 언어: ${detectedLanguage}`);
    }
    
    // 3. 다국어 메시지 가져오기
    const messages = getWebAuthnMessages(detectedLanguage);
    
    // 4. 모의 WebAuthn 등록 처리 (실제 구현에서는 WebAuthn 라이브러리 사용)
    const mockChallenge = {
      challenge: Buffer.from(`challenge-${Date.now()}`).toString('base64'),
      user: {
        id: Buffer.from(`user-${Date.now()}`).toString('base64'),
        name: body.displayName || 'Anonymous User',
        displayName: body.displayName || 'Anonymous User'
      },
      pubKeyCredParams: [
        { alg: -7, type: 'public-key' },
        { alg: -257, type: 'public-key' }
      ],
      authenticatorSelection: {
        authenticatorAttachment: 'platform',
        userVerification: 'required'
      }
    };
    
    // 5. 응답 생성
    const response = {
      success: true,
      detectedLanguage,
      messages: messages.registration,
      webauthnOptions: mockChallenge,
      metadata: {
        timestamp: new Date().toISOString(),
        userAgent: request.headers.get('user-agent'),
        clientIP: request.headers.get('x-forwarded-for') || 'unknown'
      }
    };
    
    console.log('✅ 다국어 WebAuthn 등록 응답 생성 완료');
    console.log(`🌍 감지된 언어: ${detectedLanguage}`);
    console.log(`📋 메시지 제목: ${messages.registration.title}`);
    
    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'X-Detected-Language': detectedLanguage,
        'X-WebAuthn-Status': 'registration-ready'
      }
    });
    
  } catch (error) {
    console.error('❌ 다국어 WebAuthn 등록 오류:', error);
    
    return NextResponse.json({
      success: false,
      error: {
        code: 'MULTILINGUAL_REGISTRATION_ERROR',
        message: 'Failed to process multilingual WebAuthn registration',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  // 등록 옵션 조회
  const searchParams = new URL(request.url).searchParams;
  const language = (searchParams.get('language') as SupportedLanguage) || 'english';
  
  const messages = getWebAuthnMessages(language);
  
  return NextResponse.json({
    success: true,
    language,
    messages: messages.registration,
    supportedLanguages: ['korean', 'english', 'japanese', 'chinese', 'spanish', 'french', 'german']
  });
}
