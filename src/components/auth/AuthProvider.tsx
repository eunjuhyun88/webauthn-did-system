// =============================================================================
// 🔧 useWebAuthn 훅
// 파일: src/lib/hooks/useWebAuthn.ts
// =============================================================================

"use client";

import { useState } from 'react';

// =============================================================================
// 📋 타입 정의
// =============================================================================

interface WebAuthnHookReturn {
  register: (email: string, displayName: string) => Promise<any>;
  authenticate: (email: string) => Promise<any>;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}

interface WebAuthnRegistrationOptions {
  challenge: string;
  rp: {
    name: string;
    id: string;
  };
  user: {
    id: string;
    name: string;
    displayName: string;
  };
  pubKeyCredParams: PublicKeyCredentialParameters[];
  timeout: number;
  authenticatorSelection?: AuthenticatorSelectionCriteria;
  attestation?: AttestationConveyancePreference;
}

interface WebAuthnAuthenticationOptions {
  challenge: string;
  rpId: string;
  allowCredentials: PublicKeyCredentialDescriptor[];
  timeout: number;
  userVerification?: UserVerificationRequirement;
}

// =============================================================================
// 🔧 유틸리티 함수들
// =============================================================================

/**
 * Base64URL 문자열을 Uint8Array로 변환
 */
function base64URLToUint8Array(base64url: string): Uint8Array {
  // Base64URL을 Base64로 변환
  const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  // 패딩 추가
  const padded = base64.padEnd(base64.length + (4 - base64.length % 4) % 4, '=');
  
  try {
    return Uint8Array.from(atob(padded), c => c.charCodeAt(0));
  } catch (error) {
    console.error('Base64URL 디코딩 실패:', error);
    throw new Error('잘못된 Base64URL 형식입니다.');
  }
}

/**
 * ArrayBuffer를 Base64URL로 변환
 */
function arrayBufferToBase64URL(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  const base64 = btoa(String.fromCharCode(...bytes));
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

/**
 * WebAuthn 지원 여부 확인
 */
function isWebAuthnSupported(): boolean {
  return !!(
    navigator.credentials &&
    navigator.credentials.create &&
    navigator.credentials.get &&
    window.PublicKeyCredential
  );
}

/**
 * 플랫폼 인증기 지원 여부 확인
 */
async function isPlatformAuthenticatorAvailable(): Promise<boolean> {
  try {
    if (window.PublicKeyCredential && window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable) {
      return await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    }
    return false;
  } catch (error) {
    console.warn('플랫폼 인증기 확인 실패:', error);
    return false;
  }
}

// =============================================================================
// 🎣 useWebAuthn 훅
// =============================================================================

export function useWebAuthn(): WebAuthnHookReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

  // ===========================================================================
  // 📝 등록 함수
  // ===========================================================================
  
  const register = async (email: string, displayName: string) => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('🚀 WebAuthn 등록 시작:', { email, displayName });

      // 1. WebAuthn 지원 여부 확인
      if (!isWebAuthnSupported()) {
        throw new Error('이 브라우저는 WebAuthn을 지원하지 않습니다.');
      }

      // 2. 플랫폼 인증기 확인
      const isPlatformAvailable = await isPlatformAuthenticatorAvailable();
      if (!isPlatformAvailable) {
        console.warn('⚠️ 플랫폼 인증기를 사용할 수 없습니다. 외부 인증기를 사용해보세요.');
      }

      // 3. 등록 시작 API 호출
      console.log('1️⃣ 등록 옵션 요청 중...');
      const beginResponse = await fetch('/api/webauthn/register/begin', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({ email, displayName })
      });

      if (!beginResponse.ok) {
        const errorData = await beginResponse.json();
        throw new Error(errorData.error || `HTTP ${beginResponse.status}`);
      }

      const beginData = await beginResponse.json();

      if (!beginData.success) {
        throw new Error(beginData.error || '등록 시작 실패');
      }

      console.log('✅ 등록 옵션 수신 완료');

      // 4. WebAuthn 옵션 준비
      const options: WebAuthnRegistrationOptions = beginData.registrationOptions;
      
      const createCredentialOptions: CredentialCreationOptions = {
        publicKey: {
          ...options,
          challenge: base64URLToUint8Array(options.challenge),
          user: {
            ...options.user,
            id: new TextEncoder().encode(options.user.id)
          }
        }
      };

      console.log('2️⃣ 생체 인증 진행 중... (Touch ID/Face ID/Windows Hello)');

      // 5. WebAuthn Credential 생성
      const credential = await navigator.credentials.create(createCredentialOptions) as PublicKeyCredential;

      if (!credential) {
        throw new Error('WebAuthn credential 생성이 취소되었습니다.');
      }

      if (!credential.response) {
        throw new Error('WebAuthn credential 응답이 없습니다.');
      }

      console.log('✅ 생체 인증 완료');

      // 6. Credential 데이터 직렬화
      const response = credential.response as AuthenticatorAttestationResponse;
      
      const credentialData = {
        id: credential.id,
        rawId: arrayBufferToBase64URL(credential.rawId),
        response: {
          attestationObject: arrayBufferToBase64URL(response.attestationObject),
          clientDataJSON: arrayBufferToBase64URL(response.clientDataJSON)
        },
        type: credential.type,
        clientExtensionResults: credential.getClientExtensionResults()
      };

      // 7. 등록 완료 API 호출
      console.log('3️⃣ 등록 완료 처리 중...');
      
      const completeResponse = await fetch('/api/webauthn/register/complete', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({
          credential: credentialData,
          challengeData: options
        })
      });

      if (!completeResponse.ok) {
        const errorData = await completeResponse.json();
        throw new Error(errorData.error || `HTTP ${completeResponse.status}`);
      }

      const completeData = await completeResponse.json();

      if (!completeData.success) {
        throw new Error(completeData.error || '등록 완료 실패');
      }

      console.log('🎉 WebAuthn 등록 완료:', completeData.user);
      return completeData;

    } catch (error: any) {
      console.error('❌ WebAuthn 등록 오류:', error);
      
      let errorMessage = '등록 중 오류가 발생했습니다.';
      
      if (error.name === 'NotAllowedError') {
        errorMessage = '생체 인증이 취소되었습니다.';
      } else if (error.name === 'NotSupportedError') {
        errorMessage = '이 기기에서는 생체 인증을 사용할 수 없습니다.';
      } else if (error.name === 'SecurityError') {
        errorMessage = '보안 오류가 발생했습니다. HTTPS 연결을 확인하세요.';
      } else if (error.name === 'InvalidStateError') {
        errorMessage = '이미 등록된 인증기입니다.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // ===========================================================================
  // 🔑 인증 함수
  // ===========================================================================
  
  const authenticate = async (email: string) => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('🔐 WebAuthn 인증 시작:', { email });

      // 1. WebAuthn 지원 여부 확인
      if (!isWebAuthnSupported()) {
        throw new Error('이 브라우저는 WebAuthn을 지원하지 않습니다.');
      }

      // 2. 인증 시작 API 호출
      console.log('1️⃣ 인증 옵션 요청 중...');
      const beginResponse = await fetch('/api/webauthn/authenticate/begin', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({ email })
      });

      if (!beginResponse.ok) {
        const errorData = await beginResponse.json();
        throw new Error(errorData.error || `HTTP ${beginResponse.status}`);
      }

      const beginData = await beginResponse.json();

      if (!beginData.success) {
        throw new Error(beginData.error || '인증 시작 실패');
      }

      console.log('✅ 인증 옵션 수신 완료');

      // 3. WebAuthn 옵션 준비
      const options: WebAuthnAuthenticationOptions = beginData.authenticationOptions;
      
      const getCredentialOptions: CredentialRequestOptions = {
        publicKey: {
          ...options,
          challenge: base64URLToUint8Array(options.challenge),
          allowCredentials: options.allowCredentials.map(cred => ({
            ...cred,
            id: base64URLToUint8Array(cred.id as string)
          }))
        }
      };

      console.log('2️⃣ 생체 인증 진행 중...');

      // 4. WebAuthn 인증
      const credential = await navigator.credentials.get(getCredentialOptions) as PublicKeyCredential;

      if (!credential) {
        throw new Error('WebAuthn 인증이 취소되었습니다.');
      }

      if (!credential.response) {
        throw new Error('WebAuthn 인증 응답이 없습니다.');
      }

      console.log('✅ 생체 인증 완료');

      // 5. 인증 데이터 직렬화
      const response = credential.response as AuthenticatorAssertionResponse;
      
      const credentialData = {
        id: credential.id,
        rawId: arrayBufferToBase64URL(credential.rawId),
        response: {
          authenticatorData: arrayBufferToBase64URL(response.authenticatorData),
          clientDataJSON: arrayBufferToBase64URL(response.clientDataJSON),
          signature: arrayBufferToBase64URL(response.signature),
          userHandle: response.userHandle ? arrayBufferToBase64URL(response.userHandle) : null
        },
        type: credential.type,
        clientExtensionResults: credential.getClientExtensionResults()
      };

      // 6. 인증 완료 API 호출
      console.log('3️⃣ 인증 완료 처리 중...');
      
      const completeResponse = await fetch('/api/webauthn/authenticate/complete', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({
          credential: credentialData,
          challengeData: options
        })
      });

      if (!completeResponse.ok) {
        const errorData = await completeResponse.json();
        throw new Error(errorData.error || `HTTP ${completeResponse.status}`);
      }

      const completeData = await completeResponse.json();

      if (!completeData.success) {
        throw new Error(completeData.error || '인증 완료 실패');
      }

      console.log('🎉 WebAuthn 인증 완료:', completeData.user);
      return completeData;

    } catch (error: any) {
      console.error('❌ WebAuthn 인증 오류:', error);
      
      let errorMessage = '인증 중 오류가 발생했습니다.';
      
      if (error.name === 'NotAllowedError') {
        errorMessage = '생체 인증이 취소되었습니다.';
      } else if (error.name === 'NotSupportedError') {
        errorMessage = '이 기기에서는 생체 인증을 사용할 수 없습니다.';
      } else if (error.name === 'SecurityError') {
        errorMessage = '보안 오류가 발생했습니다. HTTPS 연결을 확인하세요.';
      } else if (error.name === 'InvalidStateError') {
        errorMessage = '등록된 인증기를 찾을 수 없습니다.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    register,
    authenticate,
    isLoading,
    error,
    clearError
  };
}

// =============================================================================
// 🔧 추가 유틸리티 함수들 (export)
// =============================================================================

/**
 * WebAuthn 기능 지원 여부 확인
 */
export { isWebAuthnSupported, isPlatformAuthenticatorAvailable };

/**
 * 인증기 정보 조회
 */
export async function getAuthenticatorInfo() {
  if (!isWebAuthnSupported()) {
    return null;
  }

  try {
    const available = await isPlatformAuthenticatorAvailable();
    
    return {
      webauthnSupported: true,
      platformAuthenticatorAvailable: available,
      userAgent: navigator.userAgent,
      platform: navigator.platform
    };
  } catch (error) {
    console.error('인증기 정보 조회 실패:', error);
    return null;
  }
}

export default useWebAuthn;