// =============================================================================
// 🪝 useAuth 커스텀 훅 - 완전 구현
// src/lib/hooks/useAuth.ts
// =============================================================================

'use client';

import { useState, useEffect, useCallback, createContext, useContext } from 'react';

// =============================================================================
// 📋 타입 정의
// =============================================================================

interface User {
  id: string;
  did: string;
  email: string;
  displayName: string;
  authMethod: 'webauthn' | 'traditional';
  subscription: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

interface AuthContextType extends AuthState {
  // 인증 액션들
  login: (email: string) => Promise<boolean>;
  logout: () => Promise<void>;
  register: (data: RegisterData) => Promise<boolean>;
  refreshAuth: () => Promise<void>;
  clearError: () => void;
  
  // WebAuthn 특화 기능들
  checkWebAuthnSupport: () => WebAuthnSupport;
  isWebAuthnAvailable: boolean;
}

interface RegisterData {
  username: string;
  email: string;
  displayName: string;
}

interface WebAuthnSupport {
  isSupported: boolean;
  isAvailable: boolean;
  isSecureContext: boolean;
  error?: string;
}

// =============================================================================
// 🔧 유틸리티 함수들
// =============================================================================

/**
 * WebAuthn 지원 여부 확인
 */
function checkWebAuthnSupport(): WebAuthnSupport {
  if (typeof window === 'undefined') {
    return {
      isSupported: false,
      isAvailable: false,
      isSecureContext: false,
      error: 'Server-side rendering'
    };
  }

  const isSupported = 'credentials' in navigator && 'create' in navigator.credentials;
  const isSecureContext = window.isSecureContext;
  const isAvailable = isSupported && isSecureContext;

  let error: string | undefined;
  if (!isSupported) {
    error = '이 브라우저는 WebAuthn을 지원하지 않습니다';
  } else if (!isSecureContext) {
    error = 'HTTPS 환경에서만 WebAuthn을 사용할 수 있습니다';
  }

  return {
    isSupported,
    isAvailable,
    isSecureContext,
    error
  };
}

/**
 * Base64URL 디코딩
 */
function base64urlDecode(str: string): ArrayBuffer {
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64.padEnd(base64.length + (4 - base64.length % 4) % 4, '=');
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * ArrayBuffer를 Array로 변환
 */
function arrayBufferToArray(buffer: ArrayBuffer): number[] {
  return Array.from(new Uint8Array(buffer));
}

/**
 * 토큰을 localStorage에 저장
 */
function setAuthToken(token: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('auth_token', token);
  }
}

/**
 * localStorage에서 토큰 가져오기
 */
function getAuthToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('auth_token');
  }
  return null;
}

/**
 * 토큰 제거
 */
function removeAuthToken() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth_token');
  }
}

// =============================================================================
// 🪝 useAuth 훅 구현
// =============================================================================

export function useAuth(): AuthContextType {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
    error: null
  });

  const webAuthnSupport = checkWebAuthnSupport();

  // =============================================================================
  // 🔍 인증 상태 확인
  // =============================================================================

  const refreshAuth = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const token = getAuthToken();
      if (!token) {
        setState(prev => ({
          ...prev,
          user: null,
          isAuthenticated: false,
          isLoading: false
        }));
        return;
      }

      const response = await fetch('/api/auth/check', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setState(prev => ({
          ...prev,
          user: data.user,
          isAuthenticated: true,
          isLoading: false,
          error: null
        }));
      } else {
        // 토큰이 유효하지 않음
        removeAuthToken();
        setState(prev => ({
          ...prev,
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null
        }));
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setState(prev => ({
        ...prev,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: '인증 상태 확인 실패'
      }));
    }
  }, []);

  // =============================================================================
  // 🔐 WebAuthn 로그인
  // =============================================================================

  const login = useCallback(async (email: string): Promise<boolean> => {
    if (!webAuthnSupport.isAvailable) {
      setState(prev => ({
        ...prev,
        error: webAuthnSupport.error || 'WebAuthn을 사용할 수 없습니다'
      }));
      return false;
    }

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      // 1. 인증 시작
      const beginResponse = await fetch('/api/webauthn/authenticate/begin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const beginData = await beginResponse.json();

      if (!beginData.success) {
        throw new Error(beginData.error || '인증 시작 실패');
      }

      // 2. WebAuthn 옵션 준비
      const options = beginData.challengeData;
      options.challenge = base64urlDecode(options.challenge);

      if (options.allowCredentials) {
        options.allowCredentials = options.allowCredentials.map((cred: any) => ({
          ...cred,
          id: base64urlDecode(cred.id)
        }));
      }

      // 3. WebAuthn 인증 실행
      const credential = await navigator.credentials.get({
        publicKey: options
      }) as PublicKeyCredential;

      if (!credential) {
        throw new Error('인증이 취소되었습니다');
      }

      // 4. 인증 완료
      const completeResponse = await fetch('/api/webauthn/authenticate/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          credential: {
            id: credential.id,
            rawId: credential.id,
            response: {
              authenticatorData: arrayBufferToArray(
                (credential.response as AuthenticatorAssertionResponse).authenticatorData
              ),
              clientDataJSON: arrayBufferToArray(credential.response.clientDataJSON),
              signature: arrayBufferToArray(
                (credential.response as AuthenticatorAssertionResponse).signature
              ),
              userHandle: (credential.response as AuthenticatorAssertionResponse).userHandle ? 
                arrayBufferToArray((credential.response as AuthenticatorAssertionResponse).userHandle!) : null
            },
            type: credential.type
          },
          challengeData: beginData.challengeData
        })
      });

      const completeData = await completeResponse.json();

      if (!completeData.success) {
        throw new Error(completeData.error || '인증 완료 실패');
      }

      // 5. 토큰 저장 및 상태 업데이트
      if (completeData.tokens?.accessToken) {
        setAuthToken(completeData.tokens.accessToken);
      }

      setState(prev => ({
        ...prev,
        user: completeData.user,
        isAuthenticated: true,
        isLoading: false,
        error: null
      }));

      return true;

    } catch (error: any) {
      console.error('Login failed:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || '로그인 실패'
      }));
      return false;
    }
  }, [webAuthnSupport]);

  // =============================================================================
  // 📝 WebAuthn 회원가입
  // =============================================================================

  const register = useCallback(async (data: RegisterData): Promise<boolean> => {
    if (!webAuthnSupport.isAvailable) {
      setState(prev => ({
        ...prev,
        error: webAuthnSupport.error || 'WebAuthn을 사용할 수 없습니다'
      }));
      return false;
    }

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      // 1. 등록 시작
      const beginResponse = await fetch('/api/webauthn/register/begin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const beginData = await beginResponse.json();

      if (!beginData.success) {
        throw new Error(beginData.error || '등록 시작 실패');
      }

      // 2. WebAuthn 옵션 준비
      const options = beginData.options;
      options.challenge = base64urlDecode(options.challenge);
      options.user.id = base64urlDecode(options.user.id);

      if (options.excludeCredentials) {
        options.excludeCredentials = options.excludeCredentials.map((cred: any) => ({
          ...cred,
          id: base64urlDecode(cred.id)
        }));
      }

      // 3. WebAuthn credential 생성
      const credential = await navigator.credentials.create({
        publicKey: options
      }) as PublicKeyCredential;

      if (!credential) {
        throw new Error('등록이 취소되었습니다');
      }

      // 4. 등록 완료
      const completeResponse = await fetch('/api/webauthn/register/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          credential: {
            id: credential.id,
            rawId: credential.id,
            response: {
              attestationObject: arrayBufferToArray(
                (credential.response as AuthenticatorAttestationResponse).attestationObject
              ),
              clientDataJSON: arrayBufferToArray(credential.response.clientDataJSON),
              transports: (credential.response as AuthenticatorAttestationResponse).getTransports?.() || []
            },
            type: credential.type
          },
          challengeData: beginData.challengeData
        })
      });

      const completeData = await completeResponse.json();

      if (!completeData.success) {
        throw new Error(completeData.error || '등록 완료 실패');
      }

      // 5. 토큰 저장 및 상태 업데이트
      if (completeData.tokens?.accessToken) {
        setAuthToken(completeData.tokens.accessToken);
      }

      setState(prev => ({
        ...prev,
        user: completeData.user,
        isAuthenticated: true,
        isLoading: false,
        error: null
      }));

      return true;

    } catch (error: any) {
      console.error('Registration failed:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || '회원가입 실패'
      }));
      return false;
    }
  }, [webAuthnSupport]);

  // =============================================================================
  // 🚪 로그아웃
  // =============================================================================

  const logout = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));

      // 서버에 로그아웃 요청
      const token = getAuthToken();
      if (token) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      }

      // 로컬 상태 정리
      removeAuthToken();
      setState(prev => ({
        ...prev,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      }));

    } catch (error) {
      console.error('Logout failed:', error);
      // 로그아웃은 실패해도 로컬 상태는 정리
      removeAuthToken();
      setState(prev => ({
        ...prev,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      }));
    }
  }, []);

  // =============================================================================
  // 🧹 에러 정리
  // =============================================================================

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // =============================================================================
  // 🔄 초기화 effect
  // =============================================================================

  useEffect(() => {
    refreshAuth();
  }, [refreshAuth]);

  return {
    // 상태
    user: state.user,
    isLoading: state.isLoading,
    isAuthenticated: state.isAuthenticated,
    error: state.error,
    
    // 액션들
    login,
    logout,
    register,
    refreshAuth,
    clearError,
    
    // WebAuthn 정보
    checkWebAuthnSupport: () => webAuthnSupport,
    isWebAuthnAvailable: webAuthnSupport.isAvailable
  };
}

// =============================================================================
// 🌍 Auth Context 및 Provider
// =============================================================================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuth();
  
  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Auth Context 사용을 위한 훅
 */
export function useAuthContext(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}

// =============================================================================
// 🎯 기본 export
// =============================================================================

export default useAuth;