// =============================================================================
// 🔧 WebAuthn 유틸리티 함수들
// =============================================================================

import type { 
  WebAuthnSupport, 
  WebAuthnError, 
  WebAuthnErrorType,
  ParsedCredentialResponse,
  ChallengeData 
} from '@/types/webauthn';

// =============================================================================
// Base64URL 인코딩/디코딩 함수들
// =============================================================================

/**
 * ArrayBuffer를 Base64URL 문자열로 인코딩
 */
export function arrayBufferToBase64URL(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

/**
 * Base64URL 문자열을 ArrayBuffer로 디코딩
 */
export function base64URLToArrayBuffer(str: string): ArrayBuffer {
  // Base64URL을 Base64로 변환
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  
  // 패딩 추가
  while (str.length % 4) {
    str += '=';
  }
  
  const binary = atob(str);
  const bytes = new Uint8Array(binary.length);
  
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  
  return bytes.buffer;
}

/**
 * 문자열을 ArrayBuffer로 변환
 */
export function stringToArrayBuffer(str: string): ArrayBuffer {
  const encoder = new TextEncoder();
  return encoder.encode(str).buffer;
}

/**
 * ArrayBuffer를 문자열로 변환
 */
export function arrayBufferToString(buffer: ArrayBuffer): string {
  const decoder = new TextDecoder();
  return decoder.decode(buffer);
}

// =============================================================================
// 랜덤 생성 함수들
// =============================================================================

/**
 * 암호학적으로 안전한 랜덤 챌린지 생성
 */
export function generateChallenge(length: number = 32): ArrayBuffer {
  const challenge = new Uint8Array(length);
  crypto.getRandomValues(challenge);
  return challenge.buffer;
}

/**
 * 사용자 ID 생성
 */
export function generateUserID(username?: string): ArrayBuffer {
  if (username) {
    // 사용자명 기반 ID 생성 (해시 사용)
    return stringToArrayBuffer(username + Date.now().toString());
  }
  
  // 랜덤 ID 생성
  const userId = new Uint8Array(16);
  crypto.getRandomValues(userId);
  return userId.buffer;
}

/**
 * 고유 식별자 생성
 */
export function generateUniqueId(): string {
  return crypto.randomUUID();
}

// =============================================================================
// WebAuthn 브라우저 지원 확인
// =============================================================================

/**
 * WebAuthn 브라우저 지원 상태 확인
 */
export async function checkWebAuthnSupport(): Promise<WebAuthnSupport> {
  const support: WebAuthnSupport = {
    basic: false,
    platform: false,
    crossPlatform: false,
    conditionalUI: false,
    userVerifyingPlatformAuthenticator: false
  };

  try {
    // 기본 WebAuthn 지원 확인
    support.basic = !!(window.PublicKeyCredential && navigator.credentials);

    if (support.basic) {
      // Platform authenticator 지원 확인
      try {
        support.platform = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      } catch (error) {
        console.warn('Platform authenticator 확인 실패:', error);
      }

      // Cross-platform authenticator 지원 (일반적으로 지원됨)
      support.crossPlatform = true;

      // Conditional UI 지원 확인 (Chrome 108+)
      try {
        if ('isConditionalMediationAvailable' in PublicKeyCredential) {
          support.conditionalUI = await PublicKeyCredential.isConditionalMediationAvailable();
        }
      } catch (error) {
        console.warn('Conditional UI 확인 실패:', error);
      }

      // User-verifying platform authenticator 확인
      support.userVerifyingPlatformAuthenticator = support.platform;
    }
  } catch (error) {
    console.error('WebAuthn 지원 확인 중 오류:', error);
  }

  return support;
}

/**
 * 특정 기능 지원 여부 확인
 */
export function isFeatureSupported(feature: keyof WebAuthnSupport): Promise<boolean> {
  return checkWebAuthnSupport().then(support => support[feature]);
}

// =============================================================================
// Credential 응답 파싱
// =============================================================================

/**
 * PublicKeyCredential 응답 파싱
 */
export function parseCredentialResponse(credential: PublicKeyCredential): ParsedCredentialResponse {
  const response = credential.response;
  
  if (response instanceof AuthenticatorAttestationResponse) {
    // 등록 응답 파싱
    return {
      type: 'registration',
      id: credential.id,
      rawId: credential.rawId,
      clientDataJSON: response.clientDataJSON,
      attestationObject: response.attestationObject,
      transports: response.getTransports?.() || []
    };
  } else if (response instanceof AuthenticatorAssertionResponse) {
    // 인증 응답 파싱
    return {
      type: 'authentication',
      id: credential.id,
      rawId: credential.rawId,
      clientDataJSON: response.clientDataJSON,
      authenticatorData: response.authenticatorData,
      signature: response.signature,
      userHandle: response.userHandle
    };
  }
  
  throw new Error('알 수 없는 credential 응답 타입');
}

/**
 * ClientDataJSON 파싱
 */
export function parseClientDataJSON(clientDataJSON: ArrayBuffer): {
  type: string;
  challenge: string;
  origin: string;
  crossOrigin?: boolean;
} {
  const decoder = new TextDecoder();
  const clientDataString = decoder.decode(clientDataJSON);
  return JSON.parse(clientDataString);
}

// =============================================================================
// 에러 처리
// =============================================================================

/**
 * WebAuthn 에러 생성
 */
export function createWebAuthnError(
  type: WebAuthnErrorType, 
  message: string, 
  originalError?: Error
): WebAuthnError {
  return {
    type,
    message,
    originalError
  };
}

/**
 * 브라우저 에러를 WebAuthn 에러로 변환
 */
export function convertBrowserError(error: any): WebAuthnError {
  const errorName = error?.name || 'UnknownError';
  
  const errorMessages: Record<string, string> = {
    'NotAllowedError': '사용자가 요청을 거부했거나 타임아웃이 발생했습니다.',
    'SecurityError': '보안 요구사항을 만족하지 않습니다.',
    'NetworkError': '네트워크 오류가 발생했습니다.',
    'InvalidStateError': '인증기가 이미 등록되어 있습니다.',
    'ConstraintError': '요청된 제약 조건을 만족할 수 없습니다.',
    'NotSupportedError': '이 브라우저에서는 지원되지 않는 기능입니다.',
    'AbortError': '요청이 중단되었습니다.',
    'UnknownError': '알 수 없는 오류가 발생했습니다.'
  };

  const message = errorMessages[errorName] || errorMessages['UnknownError'];
  
  return createWebAuthnError(
    errorName as WebAuthnErrorType, 
    message, 
    error
  );
}

/**
 * 사용자 친화적 에러 메시지 생성
 */
export function getHumanReadableError(error: WebAuthnError): string {
  const baseMessage = error.message;
  
  // 추가 컨텍스트 제공
  const contextualMessages: Record<WebAuthnErrorType, string> = {
    'NotAllowedError': `${baseMessage} 생체 인증을 다시 시도하거나 다른 방법을 사용해보세요.`,
    'SecurityError': `${baseMessage} HTTPS 연결을 확인하고 다시 시도해주세요.`,
    'NetworkError': `${baseMessage} 인터넷 연결을 확인하고 다시 시도해주세요.`,
    'InvalidStateError': `${baseMessage} 이미 등록된 인증기를 사용하고 있습니다.`,
    'ConstraintError': `${baseMessage} 다른 인증기를 사용해보세요.`,
    'NotSupportedError': `${baseMessage} 최신 브라우저를 사용해주세요.`,
    'AbortError': `${baseMessage} 처음부터 다시 시도해주세요.`,
    'UnknownError': `${baseMessage} 문제가 지속되면 고객지원에 문의해주세요.`
  };

  return contextualMessages[error.type] || baseMessage;
}

// =============================================================================
// 챌린지 관리
// =============================================================================

/**
 * 챌린지 데이터 생성
 */
export function createChallengeData(
  challenge: ArrayBuffer,
  username?: string,
  displayName?: string,
  userID?: string,
  expirationMinutes: number = 5
): ChallengeData {
  const now = Date.now();
  
  return {
    challenge: arrayBufferToBase64URL(challenge),
    username,
    displayName,
    userID,
    timestamp: now,
    expiresAt: now + (expirationMinutes * 60 * 1000)
  };
}

/**
 * 챌린지 유효성 검증
 */
export function validateChallenge(challengeData: ChallengeData): {
  valid: boolean;
  error?: string;
} {
  const now = Date.now();
  
  if (now > challengeData.expiresAt) {
    return {
      valid: false,
      error: '챌린지가 만료되었습니다. 다시 시도해주세요.'
    };
  }
  
  if (!challengeData.challenge || challengeData.challenge.length === 0) {
    return {
      valid: false,
      error: '유효하지 않은 챌린지입니다.'
    };
  }
  
  return { valid: true };
}

// =============================================================================
// 디바이스 정보 추출
// =============================================================================

/**
 * User Agent에서 디바이스 정보 추출
 */
export function getDeviceInfo(userAgent?: string): {
  platform?: string;
  browser?: string;
  isMobile?: boolean;
  isIOS?: boolean;
  isAndroid?: boolean;
} {
  if (!userAgent) {
    userAgent = navigator.userAgent;
  }

  const info: any = {};

  // Platform 감지
  if (userAgent.includes('Windows')) info.platform = 'Windows';
  else if (userAgent.includes('Mac')) info.platform = 'macOS';
  else if (userAgent.includes('Linux')) info.platform = 'Linux';
  else if (userAgent.includes('Android')) info.platform = 'Android';
  else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) info.platform = 'iOS';

  // Browser 감지
  if (userAgent.includes('Chrome')) info.browser = 'Chrome';
  else if (userAgent.includes('Firefox')) info.browser = 'Firefox';
  else if (userAgent.includes('Safari')) info.browser = 'Safari';
  else if (userAgent.includes('Edge')) info.browser = 'Edge';

  // Mobile 감지
  info.isMobile = /Mobi|Android/i.test(userAgent);
  info.isIOS = /iPhone|iPad|iPod/i.test(userAgent);
  info.isAndroid = /Android/i.test(userAgent);

  return info;
}

// =============================================================================
// 검증 유틸리티
// =============================================================================

/**
 * Origin 검증
 */
export function validateOrigin(origin: string, expectedOrigin: string): boolean {
  try {
    const originUrl = new URL(origin);
    const expectedUrl = new URL(expectedOrigin);
    
    return originUrl.origin === expectedUrl.origin;
  } catch (error) {
    return false;
  }
}

/**
 * RP ID 검증
 */
export function validateRPID(rpId: string, origin: string): boolean {
  try {
    const originUrl = new URL(origin);
    const hostname = originUrl.hostname;
    
    // RP ID는 origin의 hostname과 같거나 그 상위 도메인이어야 함
    return hostname === rpId || hostname.endsWith('.' + rpId);
  } catch (error) {
    return false;
  }
}

/**
 * 사용자명 검증
 */
export function validateUsername(username: string): {
  valid: boolean;
  error?: string;
} {
  if (!username || username.trim().length === 0) {
    return { valid: false, error: '사용자명이 필요합니다.' };
  }
  
  if (username.length < 3) {
    return { valid: false, error: '사용자명은 최소 3자 이상이어야 합니다.' };
  }
  
  if (username.length > 100) {
    return { valid: false, error: '사용자명은 최대 100자까지 가능합니다.' };
  }
  
  // 이메일 형식 검증 (선택적)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(username)) {
    return { valid: false, error: '유효한 이메일 주소를 입력해주세요.' };
  }
  
  return { valid: true };
}

// =============================================================================
// 디버깅 및 로깅
// =============================================================================

/**
 * WebAuthn 이벤트 로깅
 */
export function logWebAuthnEvent(
  event: string, 
  data?: any, 
  level: 'info' | 'warn' | 'error' = 'info'
) {
  if (process.env.NODE_ENV === 'development') {
    const timestamp = new Date().toISOString();
    const logData = { timestamp, event, data };
    
    switch (level) {
      case 'error':
        console.error('[WebAuthn]', logData);
        break;
      case 'warn':
        console.warn('[WebAuthn]', logData);
        break;
      default:
        console.log('[WebAuthn]', logData);
    }
  }
}

/**
 * Credential 정보 요약 (디버깅용)
 */
export function summarizeCredential(credential: PublicKeyCredential): any {
  const response = credential.response;
  
  const summary = {
    id: credential.id,
    type: credential.type,
    rawId: arrayBufferToBase64URL(credential.rawId)
  };
  
  if (response instanceof AuthenticatorAttestationResponse) {
    return {
      ...summary,
      responseType: 'registration',
      attestationObject: arrayBufferToBase64URL(response.attestationObject),
      clientDataJSON: parseClientDataJSON(response.clientDataJSON),
      transports: response.getTransports?.() || []
    };
  } else if (response instanceof AuthenticatorAssertionResponse) {
    return {
      ...summary,
      responseType: 'authentication',
      authenticatorData: arrayBufferToBase64URL(response.authenticatorData),
      signature: arrayBufferToBase64URL(response.signature),
      userHandle: response.userHandle ? arrayBufferToBase64URL(response.userHandle) : null,
      clientDataJSON: parseClientDataJSON(response.clientDataJSON)
    };
  }
  
  return summary;
}