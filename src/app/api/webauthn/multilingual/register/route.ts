// =============================================================================
// 🌍 다국어 WebAuthn 등록 API 라우트
// src/app/api/webauthn/multilingual/register/route.ts
// 언어 감지 + 문화적 컨텍스트 + Cue 추출이 통합된 WebAuthn 등록
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { WebAuthnMultilingualService } from '@/auth/webauthn/WebAuthnMultilingualService';
import { WebAuthnService } from '@/auth/webauthn/WebAuthnService';
import { DIDService } from '@/identity/did/DIDService';
import { SupabaseAdapter } from '@/integration/database/SupabaseAdapter';
import { 
  MultilingualAuthRequest, 
  SupportedLanguage,
  AuthInteractionMessage 
} from '@/types/multilingual-cue.types';

// =============================================================================
// 🎯 요청/응답 인터페이스
// =============================================================================

interface MultilingualWebAuthnRegisterRequest {
  // 사용자 정보
  displayName?: string;
  userEmail?: string;
  
  // 언어 및 문화 설정
  userLanguage?: SupportedLanguage;
  deviceLanguage?: SupportedLanguage;
  timezone?: string;
  region?: string;
  
  // 상호작용 히스토리 (Cue 추출용)
  interactionHistory?: AuthInteractionMessage[];
  
  // WebAuthn 옵션
  webauthnOptions?: {
    authenticatorSelection?: AuthenticatorSelectionCriteria;
    attestation?: AttestationConveyancePreference;
    timeout?: number;
  };
  
  // 개인화 설정
  culturalPreferences?: {
    communicationStyle?: string;
    formalityPreference?: string;
    guidanceLevel?: 'minimal' | 'moderate' | 'detailed' | 'comprehensive';
  };
}

interface MultilingualWebAuthnRegisterResponse {
  success: boolean;
  
  // WebAuthn 응답
  challenge?: string;
  credentialCreationOptions?: PublicKeyCredentialCreationOptions;
  
  // 다국어 분석 결과
  detectedLanguage?: SupportedLanguage;
  culturalProfile?: {
    primaryLanguage: SupportedLanguage;
    communicationStyle: string;
    formalityPreference: string;
    techComfortLevel: number;
  };
  
  // 추출된 개인화 정보
  extractedCues?: Array<{
    type: string;
    key: string;
    value: string;
    description: string;
    confidence: number;
    language: SupportedLanguage;
  }>;
  
  // 추천사항
  recommendations?: Array<{
    type: string;
    priority: string;
    message: string;
    actionable: boolean;
  }>;
  
  // 에러 정보
  error?: {
    code: string;
    message: string;
    localizedMessage?: Record<SupportedLanguage, string>;
    details?: any;
  };
}

// =============================================================================
// 🚀 서비스 인스턴스 초기화
// =============================================================================

let multilingualWebAuthnService: WebAuthnMultilingualService | null = null;

function getMultilingualWebAuthnService(): WebAuthnMultilingualService {
  if (!multilingualWebAuthnService) {
    const webAuthnService = new WebAuthnService();
    const didService = new DIDService();
    const databaseAdapter = new SupabaseAdapter();
    
    multilingualWebAuthnService = new WebAuthnMultilingualService(
      webAuthnService,
      didService,
      databaseAdapter,
      {
        method: 'hybrid',
        confidenceThreshold: 0.6,
        enableDialectDetection: true,
        enableFormalityDetection: true,
        fallbackBehavior: 'default_language'
      }
    );
  }
  
  return multilingualWebAuthnService;
}

// =============================================================================
// 🔐 POST - 다국어 WebAuthn 등록 시작
// =============================================================================

export async function POST(request: NextRequest) {
  try {
    console.log('🌍 Starting multilingual WebAuthn registration...');
    
    // 1. 요청 데이터 파싱 및 검증
    const body: MultilingualWebAuthnRegisterRequest = await request.json();
    
    const validationResult = validateRegistrationRequest(body);
    if (!validationResult.isValid) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'INVALID_REQUEST',
          message: 'Invalid registration request',
          details: validationResult.errors
        }
      } as MultilingualWebAuthnRegisterResponse, { status: 400 });
    }

    // 2. 브라우저 정보 및 클라이언트 컨텍스트 수집
    const clientContext = extractClientContext(request, body);
    
    // 3. 다국어 인증 요청 구성
    const multilingualRequest: MultilingualAuthRequest = {
      operation: 'register',
      userLanguage: body.userLanguage || clientContext.detectedLanguage,
      deviceLanguage: body.deviceLanguage || clientContext.deviceLanguage,
      timezone: body.timezone || clientContext.timezone,
      culturalPreferences: body.culturalPreferences,
      interactionHistory: body.interactionHistory || []
    };

    // 4. 다국어 WebAuthn 서비스로 등록 처리
    const service = getMultilingualWebAuthnService();
    const result = await service.registerWithMultilingualAnalysis(multilingualRequest);

    // 5. 에러 처리
    if (!result.success) {
      console.error('Multilingual WebAuthn registration failed:', result.error);
      return NextResponse.json({
        success: false,
        error: result.error
      } as MultilingualWebAuthnRegisterResponse, { status: 400 });
    }

    // 6. 성공 응답 구성
    const response: MultilingualWebAuthnRegisterResponse = {
      success: true,
      detectedLanguage: result.detectedLanguage,
      culturalProfile: result.culturalProfile ? {
        primaryLanguage: result.culturalProfile.primaryLanguage,
        communicationStyle: result.culturalProfile.communicationStyle,
        formalityPreference: result.culturalProfile.formalityPreference,
        techComfortLevel: result.culturalProfile.authenticationPreferences.comfortWithTechnology
      } : undefined,
      extractedCues: result.extractedCues?.map(cue => ({
        type: cue.cueType,
        key: cue.key,
        value: cue.value,
        description: cue.description,
        confidence: cue.confidenceScore,
        language: cue.language
      })),
      recommendations: result.recommendations?.map(rec => ({
        type: rec.type,
        priority: rec.priority,
        message: getLocalizedMessage(rec, result.detectedLanguage || 'english'),
        actionable: rec.actionable
      }))
    };

    // 7. 응답 헤더에 문화적 컨텍스트 정보 추가
    const responseHeaders = new Headers();
    responseHeaders.set('X-Detected-Language', result.detectedLanguage || 'unknown');
    responseHeaders.set('X-Cultural-Context', JSON.stringify({
      communicationStyle: result.culturalProfile?.communicationStyle,
      formalityLevel: result.culturalProfile?.formalityPreference
    }));

    console.log(`✅ Multilingual WebAuthn registration successful for language: ${result.detectedLanguage}`);
    
    return NextResponse.json(response, { 
      status: 200,
      headers: responseHeaders
    });

  } catch (error) {
    console.error('Multilingual WebAuthn registration error:', error);
    
    return NextResponse.json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Internal server error during multilingual registration',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      }
    } as MultilingualWebAuthnRegisterResponse, { status: 500 });
  }
}

// =============================================================================
// 🔓 GET - 등록 옵션 조회 (다국어 지원)
// =============================================================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const language = searchParams.get('language') as SupportedLanguage || 'english';
    const formality = searchParams.get('formality') || 'neutral';
    
    // 언어별 등록 옵션 메시지
    const registrationOptions = {
      title: getLocalizedRegistrationTitle(language),
      description: getLocalizedRegistrationDescription(language, formality),
      steps: getLocalizedRegistrationSteps(language, formality),
      troubleshooting: getLocalizedTroubleshooting(language),
      supportedAuthenticators: getSupportedAuthenticators(language)
    };

    return NextResponse.json({
      success: true,
      language,
      formality,
      options: registrationOptions
    });

  } catch (error) {
    console.error('Error getting multilingual registration options:', error);
    
    return NextResponse.json({
      success: false,
      error: {
        code: 'OPTIONS_ERROR',
        message: 'Failed to get registration options'
      }
    }, { status: 500 });
  }
}

// =============================================================================
// 🔧 헬퍼 함수들
// =============================================================================

function validateRegistrationRequest(body: MultilingualWebAuthnRegisterRequest): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // 기본 검증
  if (!body.displayName && !body.userEmail) {
    errors.push('Either displayName or userEmail is required');
  }

  // 언어 코드 검증
  if (body.userLanguage && !isValidLanguageCode(body.userLanguage)) {
    errors.push(`Invalid user language code: ${body.userLanguage}`);
  }

  if (body.deviceLanguage && !isValidLanguageCode(body.deviceLanguage)) {
    errors.push(`Invalid device language code: ${body.deviceLanguage}`);
  }

  // 상호작용 히스토리 검증
  if (body.interactionHistory) {
    for (let i = 0; i < body.interactionHistory.length; i++) {
      const interaction = body.interactionHistory[i];
      if (!interaction.id || !interaction.content || !interaction.timestamp) {
        errors.push(`Invalid interaction at index ${i}: missing required fields`);
      }
    }
  }

  // 타임존 검증
  if (body.timezone && !isValidTimezone(body.timezone)) {
    errors.push(`Invalid timezone: ${body.timezone}`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

function extractClientContext(
  request: NextRequest, 
  body: MultilingualWebAuthnRegisterRequest
): {
  detectedLanguage: SupportedLanguage;
  deviceLanguage: SupportedLanguage;
  timezone: string;
  userAgent: string;
  ipRegion?: string;
} {
  const headers = request.headers;
  
  // Accept-Language 헤더에서 언어 추출
  const acceptLanguage = headers.get('accept-language') || '';
  const detectedLanguage = parseAcceptLanguage(acceptLanguage);
  
  // User-Agent에서 디바이스 정보 추출
  const userAgent = headers.get('user-agent') || '';
  const deviceLanguage = extractDeviceLanguage(userAgent) || detectedLanguage;
  
  // 타임존 추정 (IP 기반 또는 기본값)
  const timezone = body.timezone || estimateTimezoneFromIP(request) || 'UTC';
  
  return {
    detectedLanguage,
    deviceLanguage,
    timezone,
    userAgent,
    ipRegion: extractRegionFromIP(request)
  };
}

function parseAcceptLanguage(acceptLanguage: string): SupportedLanguage {
  // Accept-Language: ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7
  const languages = acceptLanguage
    .split(',')
    .map(lang => {
      const [code, q] = lang.trim().split(';q=');
      return {
        code: code.split('-')[0].toLowerCase(),
        quality: q ? parseFloat(q) : 1.0
      };
    })
    .sort((a, b) => b.quality - a.quality);

  for (const lang of languages) {
    if (isValidLanguageCode(lang.code as SupportedLanguage)) {
      return lang.code as SupportedLanguage;
    }
  }

  return 'english';
}

function extractDeviceLanguage(userAgent: string): SupportedLanguage | null {
  // 간단한 User-Agent 기반 언어 추정
  if (userAgent.includes('ko-KR') || userAgent.includes('Korea')) return 'korean';
  if (userAgent.includes('ja-JP') || userAgent.includes('Japan')) return 'japanese';
  if (userAgent.includes('zh-CN') || userAgent.includes('China')) return 'chinese';
  if (userAgent.includes('es-ES') || userAgent.includes('Spain')) return 'spanish';
  
  return null;
}

function estimateTimezoneFromIP(request: NextRequest): string | null {
  // 실제 구현에서는 IP 지오로케이션 서비스 사용
  // 여기서는 간단한 추정
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (!forwardedFor) return null;
  
  // 예시 IP 기반 타임존 매핑
  // 실제로는 더 정교한 IP-to-timezone 서비스 필요
  return 'Asia/Seoul'; // 기본값
}

function extractRegionFromIP(request: NextRequest): string | undefined {
  // IP 기반 지역 추출 (실제로는 지오로케이션 서비스 사용)
  return 'Korea'; // 기본값
}

function isValidLanguageCode(code: string): boolean {
  const supportedCodes = [
    'korean', 'english', 'japanese', 'chinese', 'spanish', 'french',
    'german', 'italian', 'portuguese', 'russian', 'arabic', 'hindi',
    'thai', 'vietnamese', 'indonesian', 'malay', 'tagalog', 'unknown'
  ];
  return supportedCodes.includes(code);
}

function isValidTimezone(timezone: string): boolean {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: timezone });
    return true;
  } catch {
    return false;
  }
}

function getLocalizedMessage(
  recommendation: any, 
  language: SupportedLanguage
): string {
  if (recommendation.localizedMessage && recommendation.localizedMessage[language]) {
    return recommendation.localizedMessage[language];
  }
  return recommendation.message;
}

// =============================================================================
// 🌐 다국어 메시지 함수들
// =============================================================================

function getLocalizedRegistrationTitle(language: SupportedLanguage): string {
  const titles: Record<SupportedLanguage, string> = {
    korean: '생체 인증 등록',
    english: 'Biometric Authentication Registration',
    japanese: '生体認証登録',
    chinese: '生物识别认证注册',
    spanish: 'Registro de Autenticación Biométrica',
    french: 'Enregistrement d\'Authentification Biométrique',
    german: 'Biometrische Authentifizierung Registrierung',
    portuguese: 'Registro de Autenticação Biométrica',
    russian: 'Регистрация биометрической аутентификации',
    arabic: 'تسجيل المصادقة البيومترية',
    unknown: 'Biometric Authentication Registration'
  };
  
  return titles[language] || titles.english;
}

function getLocalizedRegistrationDescription(
  language: SupportedLanguage, 
  formality: string
): string {
  const descriptions: Record<SupportedLanguage, Record<string, string>> = {
    korean: {
      formal: '귀하의 기기에서 지원하는 생체 인증 방법을 사용하여 안전하게 계정을 등록하실 수 있습니다.',
      polite: '기기에서 지원하는 생체 인증으로 안전하게 계정을 등록해주세요.',
      casual: '터치 ID, Face ID 등으로 쉽고 안전하게 계정을 만들어보세요.'
    },
    english: {
      formal: 'Please register your account securely using the biometric authentication methods supported by your device.',
      neutral: 'Register your account securely using biometric authentication like Touch ID or Face ID.',
      casual: 'Set up your account with Touch ID, Face ID, or other biometric methods for easy and secure access.'
    },
    japanese: {
      formal: 'お使いのデバイスでサポートされている生体認証方法を使用して、安全にアカウントをご登録ください。',
      polite: 'デバイスの生体認証を使って安全にアカウントを登録してください。',
      casual: 'Touch IDやFace IDなどで簡単・安全にアカウントを作成しよう。'
    }
  };
  
  const langDescriptions = descriptions[language] || descriptions.english;
  return langDescriptions[formality] || langDescriptions.neutral || langDescriptions.formal;
}

function getLocalizedRegistrationSteps(
  language: SupportedLanguage,
  formality: string
): string[] {
  const steps: Record<SupportedLanguage, Record<string, string[]>> = {
    korean: {
      formal: [
        '1. 등록 버튼을 클릭하여 시작하십시오',
        '2. 브라우저에서 생체 인증 허용을 선택하십시오',
        '3. 기기의 지시에 따라 지문 또는 얼굴을 인식시키십시오',
        '4. 등록 완료 후 로그인이 가능합니다'
      ],
      polite: [
        '1. 등록 버튼을 눌러 시작해주세요',
        '2. 브라우저에서 생체 인증을 허용해주세요',
        '3. 기기 안내에 따라 생체 정보를 등록해주세요',
        '4. 완료되면 바로 로그인할 수 있어요'
      ],
      casual: [
        '1. 등록 버튼 클릭',
        '2. 브라우저에서 허용 선택',
        '3. 지문/얼굴 인식',
        '4. 완료!'
      ]
    },
    english: {
      formal: [
        '1. Click the registration button to begin',
        '2. Allow biometric authentication in your browser',
        '3. Follow your device\'s instructions to register your biometric data',
        '4. You can log in immediately after completion'
      ],
      neutral: [
        '1. Click register to start',
        '2. Allow biometric access in browser',
        '3. Follow device prompts for biometric setup',
        '4. Login ready after completion'
      ],
      casual: [
        '1. Hit register',
        '2. Allow biometric access',
        '3. Scan your fingerprint/face',
        '4. Done!'
      ]
    }
  };
  
  const langSteps = steps[language] || steps.english;
  return langSteps[formality] || langSteps.neutral || langSteps.formal;
}

function getLocalizedTroubleshooting(language: SupportedLanguage): Record<string, string> {
  const troubleshooting: Record<SupportedLanguage, Record<string, string>> = {
    korean: {
      'not_supported': '기기에서 생체 인증을 지원하지 않습니다',
      'permission_denied': '생체 인증 권한이 거부되었습니다',
      'not_enrolled': '기기에 생체 정보가 등록되지 않았습니다',
      'security_error': '보안 오류가 발생했습니다',
      'network_error': '네트워크 연결을 확인해주세요'
    },
    english: {
      'not_supported': 'Biometric authentication is not supported on this device',
      'permission_denied': 'Permission for biometric authentication was denied',
      'not_enrolled': 'No biometric data is enrolled on this device',
      'security_error': 'A security error occurred',
      'network_error': 'Please check your network connection'
    },
    japanese: {
      'not_supported': 'このデバイスでは生体認証がサポートされていません',
      'permission_denied': '生体認証の許可が拒否されました',
      'not_enrolled': 'このデバイスに生体情報が登録されていません',
      'security_error': 'セキュリティエラーが発生しました',
      'network_error': 'ネットワーク接続をご確認ください'
    }
  };
  
  return troubleshooting[language] || troubleshooting.english;
}

function getSupportedAuthenticators(language: SupportedLanguage): Record<string, string> {
  const authenticators: Record<SupportedLanguage, Record<string, string>> = {
    korean: {
      'touch_id': 'Touch ID (iPhone/iPad)',
      'face_id': 'Face ID (iPhone/iPad)', 
      'windows_hello': 'Windows Hello (Windows)',
      'android_biometric': '안드로이드 생체 인증',
      'yubikey': 'YubiKey 보안 키',
      'platform_authenticator': '플랫폼 인증기'
    },
    english: {
      'touch_id': 'Touch ID (iPhone/iPad)',
      'face_id': 'Face ID (iPhone/iPad)',
      'windows_hello': 'Windows Hello (Windows)',
      'android_biometric': 'Android Biometric',
      'yubikey': 'YubiKey Security Key',
      'platform_authenticator': 'Platform Authenticator'
    },
    japanese: {
      'touch_id': 'Touch ID (iPhone/iPad)',
      'face_id': 'Face ID (iPhone/iPad)',
      'windows_hello': 'Windows Hello (Windows)',
      'android_biometric': 'Android生体認証',
      'yubikey': 'YubiKeyセキュリティキー',
      'platform_authenticator': 'プラットフォーム認証機'
    }
  };
  
  return authenticators[language] || authenticators.english;
}

// =============================================================================
// 🔧 OPTIONS - CORS 지원
// =============================================================================

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-User-Language, X-Cultural-Context',
      'Access-Control-Max-Age': '86400'
    }
  });
}