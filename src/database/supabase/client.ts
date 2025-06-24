// =============================================================================
// 🖥️ WebAuthn 클라이언트 함수들 (브라우저 전용)
// =============================================================================

import type {
  WebAuthnServiceResponse,
  ChallengeData,
  WebAuthnSupport
} from '@/types/webauthn';

import {
  checkWebAuthnSupport,
  convertBrowserError,
  logWebAuthnEvent,
  base64URLToArrayBuffer,
  arrayBufferToBase64URL
} from './utils';

// =============================================================================
// 클라이언트 API 호출 함수들
// =============================================================================

/**
 * 서버에서 등록 옵션 가져오기
 */
async function fetchRegistrationOptions(
  username: string,
  displayName: string
): Promise<WebAuthnServiceResponse<{
  options: any;
  challengeData: ChallengeData;
}>> {
  try {
    const response = await fetch('/api/webauthn/register/begin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username,
        displayName
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'Failed to fetch registration options'
      };
    }

    return {
      success: true,
      data
    };
  } catch (error) {
    logWebAuthnEvent('fetchRegistrationOptions error', error, 'error');
    return {
      success: false,
      error: 'Network error while fetching registration options'
    };
  }
}

/**
 * 서버에 등록 완료 요청
 */
async function completeRegistration(
  credential: PublicKeyCredential,
  challengeData: ChallengeData
): Promise<WebAuthnServiceResponse<any>> {
  try {
    // Credential을 전송 가능한 형태로 변환
    const credentialForTransmission = {
      id: credential.id,
      rawId: arrayBufferToBase64URL(credential.rawId),
      response: {
        attestationObject: arrayBufferToBase64URL(
          (credential.response as AuthenticatorAttestationResponse).attestationObject
        ),
        clientDataJSON: arrayBufferToBase64URL(credential.response.clientDataJSON),
        transports: (credential.response as AuthenticatorAttestationResponse).getTransports?.() || []
      },
      type: credential.type
    };

    const response = await fetch('/api/webauthn/register/complete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        credential: credentialForTransmission,
        challengeData
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'Failed to complete registration'
      };
    }

    return {
      success: true,
      data
    };
  } catch (error) {
    logWebAuthnEvent('completeRegistration error', error, 'error');
    return {
      success: false,
      error: 'Network error while completing registration'
    };
  }
}

/**
 * 서버에서 인증 옵션 가져오기
 */
async function fetchAuthenticationOptions(
  email?: string
): Promise<WebAuthnServiceResponse<{
  options: any;
  challengeData: ChallengeData;
}>> {
  try {
    const response = await fetch('/api/webauthn/authenticate/begin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'Failed to fetch authentication options'
      };
    }

    return {
      success: true,
      data
    };
  } catch (error) {
    logWebAuthnEvent('fetchAuthenticationOptions error', error, 'error');
    return {
      success: false,
      error: 'Network error while fetching authentication options'
    };
  }
}

/**
 * 서버에 인증 완료 요청
 */
async function completeAuthentication(
  credential: PublicKeyCredential,
  challengeData: ChallengeData
): Promise<WebAuthnServiceResponse<any>> {
  try {
    // Credential을 전송 가능한 형태로 변환
    const credentialForTransmission = {
      id: credential.id,
      rawId: arrayBufferToBase64URL(credential.rawId),
      response: {
        authenticatorData: arrayBufferToBase64URL(
          (credential.response as AuthenticatorAssertionResponse).authenticatorData
        ),
        clientDataJSON: arrayBufferToBase64URL(credential.response.clientDataJSON),
        signature: arrayBufferToBase64URL(
          (credential.response as AuthenticatorAssertionResponse).signature
        ),
        userHandle: (credential.response as AuthenticatorAssertionResponse).userHandle 
          ? arrayBufferToBase64URL((credential.response as AuthenticatorAssertionResponse).userHandle!)
          : null
      },
      type: credential.type
    };

    const response = await fetch('/api/webauthn/authenticate/complete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        credential: credentialForTransmission,
        challengeData
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'Failed to complete authentication'
      };
    }

    return {
      success: true,
      data
    };
  } catch (error) {
    logWebAuthnEvent('completeAuthentication error', error, 'error');
    return {
      success: false,
      error: 'Network error while completing authentication'
    };
  }
}

// =============================================================================
// 고수준 클라이언트 API 함수들
// =============================================================================

/**
 * WebAuthn으로 사용자 등록
 */
export async function registerUser(
  username: string,
  displayName: string
): Promise<WebAuthnServiceResponse<{
  user: any;
  credential: PublicKeyCredential;
}>> {
  try {
    logWebAuthnEvent('registerUser start', { username });

    // 1. 브라우저 지원 확인
    const support = await checkWebAuthnSupport();
    if (!support.basic) {
      return {
        success: false,
        error: 'WebAuthn이 지원되지 않는 브라우저입니다.'
      };
    }

    // 2. 서버에서 등록 옵션 가져오기
    const optionsResult = await fetchRegistrationOptions(username, displayName);
    if (!optionsResult.success || !optionsResult.data) {
      return {
        success: false,
        error: optionsResult.error || 'Failed to get registration options'
      };
    }

    const { options, challengeData } = optionsResult.data;

    // 3. 옵션을 브라우저 API용으로 변환
    const credentialCreationOptions: CredentialCreationOptions = {
      publicKey: {
        ...options,
        challenge: base64URLToArrayBuffer(options.challenge),
        user: {
          ...options.user,
          id: base64URLToArrayBuffer(options.user.id)
        },
        excludeCredentials: options.excludeCredentials?.map((cred: any) => ({
          ...cred,
          id: base64URLToArrayBuffer(cred.id)
        })) || []
      }
    };

    // 4. 브라우저에서 credential 생성
    logWebAuthnEvent('creating credential', { rpId: options.rp.id });
    
    const credential = await navigator.credentials.create(credentialCreationOptions);
    
    if (!credential || !(credential instanceof PublicKeyCredential)) {
      return {
        success: false,
        error: 'Credential 생성에 실패했습니다.'
      };
    }

    logWebAuthnEvent('credential created', { 
      id: credential.id,
      type: credential.type 
    });

    // 5. 서버에 등록 완료 요청
    const completionResult = await completeRegistration(credential, challengeData);
    if (!completionResult.success) {
      return {
        success: false,
        error: completionResult.error || 'Failed to complete registration'
      };
    }

    logWebAuthnEvent('registerUser success', { 
      username,
      credentialId: credential.id 
    });

    return {
      success: true,
      data: {
        user: completionResult.data.user,
        credential
      }
    };

  } catch (error: any) {
    const webauthnError = convertBrowserError(error);
    logWebAuthnEvent('registerUser error', webauthnError, 'error');
    
    return {
      success: false,
      error: webauthnError.message,
      errorType: webauthnError.type
    };
  }
}

/**
 * WebAuthn으로 사용자 인증
 */
export async function authenticateUser(
  email?: string
): Promise<WebAuthnServiceResponse<{
  user: any;
  token?: string;
  credential: PublicKeyCredential;
}>> {
  try {
    logWebAuthnEvent('authenticateUser start', { email });

    // 1. 브라우저 지원 확인
    const support = await checkWebAuthnSupport();
    if (!support.basic) {
      return {
        success: false,
        error: 'WebAuthn이 지원되지 않는 브라우저입니다.'
      };
    }

    // 2. 서버에서 인증 옵션 가져오기
    const optionsResult = await fetchAuthenticationOptions(email);
    if (!optionsResult.success || !optionsResult.data) {
      return {
        success: false,
        error: optionsResult.error || 'Failed to get authentication options'
      };
    }

    const { options, challengeData } = optionsResult.data;

    // 3. 옵션을 브라우저 API용으로 변환
    const credentialRequestOptions: CredentialRequestOptions = {
      publicKey: {
        ...options,
        challenge: base64URLToArrayBuffer(options.challenge),
        allowCredentials: options.allowCredentials?.map((cred: any) => ({
          ...cred,
          id: base64URLToArrayBuffer(cred.id)
        })) || []
      }
    };

    // 4. 브라우저에서 credential 조회
    logWebAuthnEvent('getting credential', { rpId: options.rpId });
    
    const credential = await navigator.credentials.get(credentialRequestOptions);
    
    if (!credential || !(credential instanceof PublicKeyCredential)) {
      return {
        success: false,
        error: '인증에 실패했습니다.'
      };
    }

    logWebAuthnEvent('credential retrieved', { 
      id: credential.id,
      type: credential.type 
    });

    // 5. 서버에 인증 완료 요청
    const completionResult = await completeAuthentication(credential, challengeData);
    if (!completionResult.success) {
      return {
        success: false,
        error: completionResult.error || 'Failed to complete authentication'
      };
    }

    logWebAuthnEvent('authenticateUser success', { 
      email,
      credentialId: credential.id 
    });

    return {
      success: true,
      data: {
        user: completionResult.data.user,
        token: completionResult.data.token,
        credential
      }
    };

  } catch (error: any) {
    const webauthnError = convertBrowserError(error);
    logWebAuthnEvent('authenticateUser error', webauthnError, 'error');
    
    return {
      success: false,
      error: webauthnError.message,
      errorType: webauthnError.errorType
    };
  }
}

// =============================================================================
// Conditional UI 지원 함수들
// =============================================================================

/**
 * Conditional UI로 자동 로그인 시도
 */
export async function tryConditionalAuthentication(): Promise<WebAuthnServiceResponse<{
  user: any;
  token?: string;
  credential: PublicKeyCredential;
}>> {
  try {
    // Conditional UI 지원 확인
    const support = await checkWebAuthnSupport();
    if (!support.conditionalUI) {
      return {
        success: false,
        error: 'Conditional UI가 지원되지 않습니다.'
      };
    }

    logWebAuthnEvent('tryConditionalAuthentication start');

    // 서버에서 인증 옵션 가져오기 (사용자 지정 없음)
    const optionsResult = await fetchAuthenticationOptions();
    if (!optionsResult.success || !optionsResult.data) {
      return {
        success: false,
        error: optionsResult.error || 'Failed to get authentication options'
      };
    }

    const { options, challengeData } = optionsResult.data;

    // Conditional UI 옵션 설정
    const credentialRequestOptions: CredentialRequestOptions = {
      publicKey: {
        ...options,
        challenge: base64URLToArrayBuffer(options.challenge),
        allowCredentials: [], // 빈 배열로 모든 credential 허용
        userVerification: 'preferred'
      },
      mediation: 'conditional' // Conditional UI 활성화
    };

    // Conditional credential 요청
    const credential = await navigator.credentials.get(credentialRequestOptions);
    
    if (!credential || !(credential instanceof PublicKeyCredential)) {
      return {
        success: false,
        error: 'Conditional 인증에 실패했습니다.'
      };
    }

    logWebAuthnEvent('conditional credential retrieved', { 
      id: credential.id 
    });

    // 서버에 인증 완료 요청
    const completionResult = await completeAuthentication(credential, challengeData);
    if (!completionResult.success) {
      return {
        success: false,
        error: completionResult.error || 'Failed to complete conditional authentication'
      };
    }

    logWebAuthnEvent('tryConditionalAuthentication success', { 
      credentialId: credential.id 
    });

    return {
      success: true,
      data: {
        user: completionResult.data.user,
        token: completionResult.data.token,
        credential
      }
    };

  } catch (error: any) {
    const webauthnError = convertBrowserError(error);
    logWebAuthnEvent('tryConditionalAuthentication error', webauthnError, 'error');
    
    return {
      success: false,
      error: webauthnError.message,
      errorType: webauthnError.errorType
    };
  }
}

// =============================================================================
// 유틸리티 함수들
// =============================================================================

/**
 * 사용자의 credential 목록 가져오기
 */
export async function getUserCredentials(userId: string): Promise<WebAuthnServiceResponse<any[]>> {
  try {
    const response = await fetch(`/api/webauthn/credentials?userId=${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'Failed to fetch credentials'
      };
    }

    return {
      success: true,
      data: data.credentials || []
    };
  } catch (error) {
    logWebAuthnEvent('getUserCredentials error', error, 'error');
    return {
      success: false,
      error: 'Network error while fetching credentials'
    };
  }
}

/**
 * Credential 삭제
 */
export async function deleteCredential(
  credentialId: string,
  userId: string
): Promise<WebAuthnServiceResponse<void>> {
  try {
    const response = await fetch('/api/webauthn/credentials', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        credentialId,
        userId
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'Failed to delete credential'
      };
    }

    return {
      success: true
    };
  } catch (error) {
    logWebAuthnEvent('deleteCredential error', error, 'error');
    return {
      success: false,
      error: 'Network error while deleting credential'
    };
  }
}

/**
 * Credential 이름 업데이트
 */
export async function updateCredentialName(
  credentialId: string,
  newName: string,
  userId: string
): Promise<WebAuthnServiceResponse<void>> {
  try {
    const response = await fetch('/api/webauthn/credentials', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        credentialId,
        name: newName,
        userId
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'Failed to update credential name'
      };
    }

    return {
      success: true
    };
  } catch (error) {
    logWebAuthnEvent('updateCredentialName error', error, 'error');
    return {
      success: false,
      error: 'Network error while updating credential name'
    };
  }
}

// =============================================================================
// WebAuthn 상태 확인 함수들
// =============================================================================

/**
 * 현재 브라우저의 WebAuthn 상태 정보
 */
export async function getWebAuthnStatus(): Promise<{
  supported: boolean;
  support: WebAuthnSupport;
  userAgent: string;
  platform: string;
}> {
  const support = await checkWebAuthnSupport();
  
  return {
    supported: support.basic,
    support,
    userAgent: navigator.userAgent,
    platform: navigator.platform
  };
}

/**
 * WebAuthn 기능 테스트
 */
export async function testWebAuthnCapabilities(): Promise<{
  basicSupport: boolean;
  platformAuthenticator: boolean;
  conditionalUI: boolean;
  errors: string[];
}> {
  const results = {
    basicSupport: false,
    platformAuthenticator: false,
    conditionalUI: false,
    errors: [] as string[]
  };

  try {
    // 기본 지원 테스트
    results.basicSupport = !!(window.PublicKeyCredential && navigator.credentials);
    
    if (results.basicSupport) {
      // Platform authenticator 테스트
      try {
        results.platformAuthenticator = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      } catch (error) {
        results.errors.push('Platform authenticator 확인 실패');
      }

      // Conditional UI 테스트
      try {
        if ('isConditionalMediationAvailable' in PublicKeyCredential) {
          results.conditionalUI = await PublicKeyCredential.isConditionalMediationAvailable();
        }
      } catch (error) {
        results.errors.push('Conditional UI 확인 실패');
      }
    } else {
      results.errors.push('WebAuthn 기본 지원 없음');
    }

  } catch (error) {
    results.errors.push(`전체 테스트 실패: ${error}`);
  }

  return results;
}