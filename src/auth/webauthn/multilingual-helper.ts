// =============================================================================
// 🌍 WebAuthn 다국어 헬퍼 (실제 동작 버전)
// src/auth/webauthn/multilingual-helper.ts
// =============================================================================

import { SupportedLanguage } from '@/types/multilingual-cue';

// 기본 언어 감지 함수
export function detectLanguageFromText(text: string): SupportedLanguage {
  // 한글
  if (/[가-힣]/.test(text)) return 'korean';
  
  // 일본어 (히라가나, 가타카나)
  if (/[ひらがなカタカナ]/.test(text)) return 'japanese';
  
  // 중국어 (한자)
  if (/[一-龯]/.test(text)) return 'chinese';
  
  // 아랍어
  if (/[\u0600-\u06FF]/.test(text)) return 'arabic';
  
  // 러시아어 (키릴 문자)
  if (/[а-яё]/i.test(text)) return 'russian';
  
  // 스페인어 특수문자
  if (/[ñáéíóúü]/i.test(text)) return 'spanish';
  
  // 프랑스어 특수문자
  if (/[àâäçéèêëïîôùûüÿ]/i.test(text)) return 'french';
  
  // 독일어 특수문자
  if (/[äöüß]/i.test(text)) return 'german';
  
  // 기본값: 영어
  return 'english';
}

// 다국어 WebAuthn 메시지
export function getWebAuthnMessages(language: SupportedLanguage) {
  const messages = {
    korean: {
      registration: {
        title: '생체 인증 등록',
        description: '기기의 생체 인증을 사용하여 안전하게 계정을 등록하세요.',
        button: '등록하기',
        success: '생체 인증 등록이 완료되었습니다.',
        error: '등록 중 오류가 발생했습니다.'
      },
      authentication: {
        title: '생체 인증',
        description: '등록된 생체 인증으로 로그인하세요.',
        button: '인증하기',
        success: '인증이 완료되었습니다.',
        error: '인증 중 오류가 발생했습니다.'
      }
    },
    english: {
      registration: {
        title: 'Biometric Registration',
        description: 'Register your account securely using biometric authentication.',
        button: 'Register',
        success: 'Biometric registration completed successfully.',
        error: 'An error occurred during registration.'
      },
      authentication: {
        title: 'Biometric Authentication',
        description: 'Sign in using your registered biometric authentication.',
        button: 'Authenticate',
        success: 'Authentication completed successfully.',
        error: 'An error occurred during authentication.'
      }
    },
    japanese: {
      registration: {
        title: '生体認証登録',
        description: '生体認証を使用してアカウントを安全に登録してください。',
        button: '登録',
        success: '生体認証の登録が完了しました。',
        error: '登録中にエラーが発生しました。'
      },
      authentication: {
        title: '生体認証',
        description: '登録された生体認証でサインインしてください。',
        button: '認証',
        success: '認証が完了しました。',
        error: '認証中にエラーが発生しました。'
      }
    },
    chinese: {
      registration: {
        title: '生物识别注册',
        description: '使用生物识别认证安全地注册您的账户。',
        button: '注册',
        success: '生物识别注册已完成。',
        error: '注册过程中发生错误。'
      },
      authentication: {
        title: '生物识别认证',
        description: '使用您注册的生物识别认证登录。',
        button: '认证',
        success: '认证已完成。',
        error: '认证过程中发生错误。'
      }
    }
  };
  
  return messages[language] || messages.english;
}

// 브라우저 언어 감지
export function detectBrowserLanguage(acceptLanguage?: string): SupportedLanguage {
  if (!acceptLanguage) return 'english';
  
  const langCode = acceptLanguage.split(',')[0].split('-')[0].toLowerCase();
  
  const langMap: Record<string, SupportedLanguage> = {
    'ko': 'korean',
    'ja': 'japanese', 
    'zh': 'chinese',
    'es': 'spanish',
    'fr': 'french',
    'de': 'german',
    'it': 'italian',
    'pt': 'portuguese',
    'ru': 'russian',
    'ar': 'arabic',
    'en': 'english'
  };
  
  return langMap[langCode] || 'english';
}

// 다국어 에러 메시지 생성
export function createMultilingualError(
  errorCode: string,
  language: SupportedLanguage,
  details?: string
) {
  const errorMessages = {
    korean: {
      'not_supported': '이 기기에서는 생체 인증을 지원하지 않습니다.',
      'permission_denied': '생체 인증 권한이 거부되었습니다.',
      'network_error': '네트워크 연결을 확인해주세요.',
      'unknown_error': '알 수 없는 오류가 발생했습니다.'
    },
    english: {
      'not_supported': 'Biometric authentication is not supported on this device.',
      'permission_denied': 'Permission for biometric authentication was denied.',
      'network_error': 'Please check your network connection.',
      'unknown_error': 'An unknown error occurred.'
    },
    japanese: {
      'not_supported': 'このデバイスでは生体認証がサポートされていません。',
      'permission_denied': '生体認証の許可が拒否されました。',
      'network_error': 'ネットワーク接続をご確認ください。',
      'unknown_error': '不明なエラーが発生しました。'
    }
  };
  
  const messages = errorMessages[language] || errorMessages.english;
  
  return {
    code: errorCode,
    message: messages[errorCode] || messages.unknown_error,
    language,
    details
  };
}

export default {
  detectLanguageFromText,
  getWebAuthnMessages,
  detectBrowserLanguage,
  createMultilingualError
};
