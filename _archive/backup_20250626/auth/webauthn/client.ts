// =============================================================================
// 🔐 WebAuthn 클라이언트 함수 - src/auth/webauthn/client.ts
// 브라우저에서 WebAuthn API를 호출하는 함수들
// =============================================================================

import { 
  WebAuthnRegistrationOptions,
  WebAuthnAuthenticationOptions,
  WebAuthnCredentialResponse,
  WebAuthnSupport,
  WebAuthnError
} from '@/types/webauthn';
import { 
  base64URLToArrayBuffer, 
  arrayBufferToBase64URL,
  logWebAuthnEvent,
  getWebAuthnErrorMessage 
} from './utils';

// =============================================================================
// 🔍 브라우저 지원 확인
// =============================================================================

/**
 * WebAuthn 지원 여부 확인
 */
export async function checkWebAuthnSupport(): Promise<WebAuthnSupport> {
  const support: WebAuthnSupport = {
    available: false,
    conditionalUI: false,
    userVerifying: false,
    residentKey: false,
    protocols: []
  };

  try {
    // 기본 WebAuthn API 지원 확인
    if (!window.PublicKeyCredential) {
      logWebAuthnEvent('WebAuthn API not supported', {}, 'warn');
      return support;
    }

    support.available = true;

    // Conditional UI 지원 확인
    if (PublicKeyCredential.isConditionalMediationAvailable) {
      support.conditionalUI = await PublicKeyCredential.isConditionalMediationAvailable();
    }

    // User Verifying Platform Authenticator 확인
    if (PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable) {
      support.userVerifying = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    }

    // 지원하는 프로토콜 확인
    support.protocols = ['fido2'];

    logWebAuthnEvent('WebAuthn support checked', support);
    return support;

  } catch (error) {
    logWebAuthnEvent('Error checking WebAuthn support', error, 'error');
    return support;
  }
}

/**
 * 디바이스 정보 수집
 */
export function getDeviceInfo(): {
  userAgent: string;
  platform: string;
  language: string;
  screen: string;
  timezone: string;
} {
  return {
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    language: navigator.language,
    screen: `${screen.width}x${screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  };
}

// =============================================================================
// 🔐 WebAuthn 등록 (Registration)
// =============================================================================

/**
 * WebAuthn 등록 옵션 준비
 */
function prepareRegistrationOptions(options: WebAuthnRegistrationOptions): CredentialCreationOptions {
  const publicKeyOptions: PublicKeyCredentialCreationOptions = {
    rp: options.rp,
    user: {
      id: base64URLToArrayBuffer(options.user.id),
      name: options.user.name,
      displayName: options.user.displayName
    },
    challenge: base64URLToArrayBuffer(options.challenge),
    pubKeyCredParams: options.pubKeyCredParams,
    timeout: options.timeout || 60000,
    attestation: options.attestation || 'none',
    authenticatorSelection: {
      authenticatorAttachment: options.authenticatorSelection?.authenticatorAttachment,
      userVerification: options.authenticatorSelection?.userVerification || 'preferred',
      residentKey: options.authenticatorSelection?.residentKey || 'preferred',
      requireResidentKey: options.authenticatorSelection?.requireResidentKey || false
    }
  };

  // excludeCredentials 처리
  if (options.excludeCredentials && options.excludeCredentials.length > 0) {
    publicKeyOptions.excludeCredentials = options.excludeCredentials.map(cred => ({
      id: base64URLToArrayBuffer(cred.id),
      type: cred.type,
      transports: cred.transports
    }));
  }

  // extensions 처리
  if (options.extensions) {
    publicKeyOptions.extensions = options.extensions;
  }

  return { publicKey: publicKeyOptions };
}

/**
 * WebAuthn 등록 실행
 */
export async function performRegistration(
  options: WebAuthnRegistrationOptions
): Promise<WebAuthnCredentialResponse> {
  try {
    logWebAuthnEvent('Starting WebAuthn registration', { 
      username: options.user.name,
      rpId: options.rp.id 
    });

    // 브라우저 지원 확인
    const support = await checkWebAuthnSupport();
    if (!support.available) {
      throw new Error('WebAuthn이 지원되지 않는 브라우저입니다.');
    }

    // 옵션 준비
    const credentialOptions = prepareRegistrationOptions(options);
    
    logWebAuthnEvent('Registration options prepared', credentialOptions);

    // WebAuthn credential 생성
    const credential = await navigator.credentials.create(credentialOptions) as PublicKeyCredential;

    if (!credential) {
      throw new Error('Credential 생성이 취소되었거나 실패했습니다.');
    }

    // 응답 데이터 처리
    const response = credential.response as AuthenticatorAttestationResponse;
    
    const credentialResponse: WebAuthnCredentialResponse = {
      id: credential.id,
      rawId: arrayBufferToBase64URL(credential.rawId),
      type: credential.type,
      response: {
        attestationObject: arrayBufferToBase64URL(response.attestationObject),
        clientDataJSON: arrayBufferToBase64URL(response.clientDataJSON),
        transports: response.getTransports?.() || []
      },
      clientExtensionResults: credential.getClientExtensionResults?.() || {},
      authenticatorAttachment: (credential as any).authenticatorAttachment || null
    };

    logWebAuthnEvent('Registration completed successfully', {
      credentialId: credential.id,
      transports: credentialResponse.response.transports
    });

    return credentialResponse;

  } catch (error: any) {
    const webauthnError: WebAuthnError = {
      name: error.name || 'UnknownError',
      message: error.message || '알 수 없는 오류가 발생했습니다.',
      code: error.code,
      stack: error.stack
    };

    logWebAuthnEvent('Registration failed', webauthnError, 'error');
    throw webauthnError;
  }
}

// =============================================================================
// 🔑 WebAuthn 인증 (Authentication)
// =============================================================================

/**
 * WebAuthn 인증 옵션 준비
 */
function prepareAuthenticationOptions(options: WebAuthnAuthenticationOptions): CredentialRequestOptions {
  const publicKeyOptions: PublicKeyCredentialRequestOptions = {
    challenge: base64URLToArrayBuffer(options.challenge),
    timeout: options.timeout || 60000,
    rpId: options.rpId,
    userVerification: options.userVerification || 'preferred'
  };

  // allowCredentials 처리
  if (options.allowCredentials && options.allowCredentials.length > 0) {
    publicKeyOptions.allowCredentials = options.allowCredentials.map(cred => ({
      id: base64URLToArrayBuffer(cred.id),
      type: cred.type,
      transports: cred.transports
    }));
  }

  // extensions 처리
  if (options.extensions) {
    publicKeyOptions.extensions = options.extensions;
  }

  return { 
    publicKey: publicKeyOptions,
    mediation: options.mediation || 'optional'
  };
}

/**
 * WebAuthn 인증 실행
 */
export async function performAuthentication(
  options: WebAuthnAuthenticationOptions
): Promise<WebAuthnCredentialResponse> {
  try {
    logWebAuthnEvent('Starting WebAuthn authentication', { 
      rpId: options.rpId,
      allowCredentialsCount: options.allowCredentials?.length || 0
    });

    // 브라우저 지원 확인
    const support = await checkWebAuthnSupport();
    if (!support.available) {
      throw new Error('WebAuthn이 지원되지 않는 브라우저입니다.');
    }

    // 옵션 준비
    const credentialOptions = prepareAuthenticationOptions(options);
    
    logWebAuthnEvent('Authentication options prepared', credentialOptions);

    // WebAuthn credential 요청
    const credential = await navigator.credentials.get(credentialOptions) as PublicKeyCredential;

    if (!credential) {
      throw new Error('인증이 취소되었거나 실패했습니다.');
    }

    // 응답 데이터 처리
    const response = credential.response as AuthenticatorAssertionResponse;
    
    const credentialResponse: WebAuthnCredentialResponse = {
      id: credential.id,
      rawId: arrayBufferToBase64URL(credential.rawId),
      type: credential.type,
      response: {
        authenticatorData: arrayBufferToBase64URL(response.authenticatorData),
        clientDataJSON: arrayBufferToBase64URL(response.clientDataJSON),
        signature: arrayBufferToBase64URL(response.signature),
        userHandle: response.userHandle ? arrayBufferToBase64URL(response.userHandle) : null
      },
      clientExtensionResults: credential.getClientExtensionResults?.() || {},
      authenticatorAttachment: (credential as any).authenticatorAttachment || null
    };

    logWebAuthnEvent('Authentication completed successfully', {
      credentialId: credential.id,
      userHandle: !!response.userHandle
    });

    return credentialResponse;

  } catch (error: any) {
    const webauthnError: WebAuthnError = {
      name: error.name || 'UnknownError',
      message: error.message || '알 수 없는 오류가 발생했습니다.',
      code: error.code,
      stack: error.stack
    };

    logWebAuthnEvent('Authentication failed', webauthnError, 'error');
    throw webauthnError;
  }
}

// =============================================================================
// 🔄 Conditional UI (자동 로그인)
// =============================================================================

/**
 * Conditional UI를 사용한 자동 인증 (PassKey)
 */
export async function performConditionalAuthentication(
  options: Omit<WebAuthnAuthenticationOptions, 'allowCredentials'>
): Promise<WebAuthnCredentialResponse | null> {
  try {
    // Conditional UI 지원 확인
    const support = await checkWebAuthnSupport();
    if (!support.conditionalUI) {
      logWebAuthnEvent('Conditional UI not supported', {}, 'warn');
      return null;
    }

    logWebAuthnEvent('Starting conditional authentication');

    // 옵션 준비 (allowCredentials 없이)
    const credentialOptions: CredentialRequestOptions = {
      publicKey: {
        challenge: base64URLToArrayBuffer(options.challenge),
        timeout: options.timeout || 60000,
        rpId: options.rpId,
        userVerification: options.userVerification || 'preferred'
      },
      mediation: 'conditional'
    };

    // WebAuthn credential 요청 (조건부)
    const credential = await navigator.credentials.get(credentialOptions) as PublicKeyCredential;

    if (!credential) {
      logWebAuthnEvent('Conditional authentication cancelled or failed');
      return null;
    }

    // 응답 처리 (일반 인증과 동일)
    const response = credential.response as AuthenticatorAssertionResponse;
    
    const credentialResponse: WebAuthnCredentialResponse = {
      id: credential.id,
      rawId: arrayBufferToBase64URL(credential.rawId),
      type: credential.type,
      response: {
        authenticatorData: arrayBufferToBase64URL(response.authenticatorData),
        clientDataJSON: arrayBufferToBase64URL(response.clientDataJSON),
        signature: arrayBufferToBase64URL(response.signature),
        userHandle: response.userHandle ? arrayBufferToBase64URL(response.userHandle) : null
      },
      clientExtensionResults: credential.getClientExtensionResults?.() || {},
      authenticatorAttachment: (credential as any).authenticatorAttachment || null
    };

    logWebAuthnEvent('Conditional authentication completed', {
      credentialId: credential.id
    });

    return credentialResponse;

  } catch (error: any) {
    // 조건부 인증에서는 에러를 던지지 않고 null 반환
    logWebAuthnEvent('Conditional authentication error', error, 'warn');
    return null;
  }
}

// =============================================================================
// 🛠 유틸리티 함수들
// =============================================================================

/**
 * WebAuthn 에러 메시지 한국어 변환
 */
export function translateWebAuthnError(error: WebAuthnError): string {
  return getWebAuthnErrorMessage(error.name);
}

/**
 * 플랫폼 인증기 사용 가능 여부 확인
 */
export async function isPlatformAuthenticatorAvailable(): Promise<boolean> {
  try {
    if (!PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable) {
      return false;
    }
    return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  } catch (error) {
    logWebAuthnEvent('Error checking platform authenticator', error, 'error');
    return false;
  }
}

/**
 * 등록된 자격증명 확인 (Credential Management API)
 */
export async function getStoredCredentials(): Promise<Credential[]> {
  try {
    if (!navigator.credentials || !navigator.credentials.preventSilentAccess) {
      return [];
    }

    // 실제로는 WebAuthn에서 직접 stored credentials를 가져올 수 없음
    // 이는 보안상의 이유로 서버에서 관리해야 함
    logWebAuthnEvent('Stored credentials check requested (server-side required)');
    return [];

  } catch (error) {
    logWebAuthnEvent('Error getting stored credentials', error, 'error');
    return [];
  }
}

/**
 * WebAuthn 디버그 정보 수집
 */
export async function getWebAuthnDebugInfo(): Promise<{
  support: WebAuthnSupport;
  device: any;
  userAgent: string;
  timestamp: string;
}> {
  return {
    support: await checkWebAuthnSupport(),
    device: getDeviceInfo(),
    userAgent: navigator.userAgent,
    timestamp: new Date().toISOString()
  };
}

// =============================================================================
// 🚀 통합 인터페이스 함수들
// =============================================================================

/**
 * 사용자 친화적인 등록 함수
 */
export async function registerWithWebAuthn(
  username: string,
  displayName: string,
  options?: Partial<WebAuthnRegistrationOptions>
): Promise<{ success: boolean; credential?: WebAuthnCredentialResponse; error?: string }> {
  try {
    // 서버에서 등록 옵션 가져오기
    const response = await fetch('/api/webauthn/register/begin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, displayName, ...options })
    });

    const data = await response.json();
    if (!data.success) {
      return { success: false, error: data.error };
    }

    // WebAuthn 등록 실행
    const credential = await performRegistration(data.options);

    // 서버에 등록 완료 요청
    const completeResponse = await fetch('/api/webauthn/register/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        credential,
        challengeData: data.challengeData
      })
    });

    const completeData = await completeResponse.json();
    if (!completeData.success) {
      return { success: false, error: completeData.error };
    }

    return { success: true, credential };

  } catch (error: any) {
    return { 
      success: false, 
      error: translateWebAuthnError(error)
    };
  }
}

/**
 * 사용자 친화적인 인증 함수
 */
export async function authenticateWithWebAuthn(
  username?: string
): Promise<{ success: boolean; user?: any; error?: string }> {
  try {
    // 서버에서 인증 옵션 가져오기
    const response = await fetch('/api/webauthn/authenticate/begin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username })
    });

    const data = await response.json();
    if (!data.success) {
      return { success: false, error: data.error };
    }

    // WebAuthn 인증 실행
    const credential = await performAuthentication(data.options);

    // 서버에 인증 완료 요청
    const completeResponse = await fetch('/api/webauthn/authenticate/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        credential,
        challengeData: data.challengeData
      })
    });

    const completeData = await completeResponse.json();
    if (!completeData.success) {
      return { success: false, error: completeData.error };
    }

    return { success: true, user: completeData.user };

  } catch (error: any) {
    return { 
      success: false, 
      error: translateWebAuthnError(error)
    };
  }
}

// =============================================================================
// 🎯 Export
// =============================================================================

export {
  WebAuthnRegistrationOptions,
  WebAuthnAuthenticationOptions,
  WebAuthnCredentialResponse,
  WebAuthnSupport,
  WebAuthnError
} from '@/types/webauthn';