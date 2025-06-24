/**
 * 🎣 useAuth 훅 구현
 * src/lib/hooks/useAuth.ts
 * 
 * WebAuthn + DID 기반 인증 상태 관리
 * React 컴포넌트에서 사용하는 인증 관련 훅
 */

'use client';

import { useState, useEffect, useCallback, useContext, createContext } from 'react';
import { DIDDocument } from '@/identity/did';

// =============================================================================
// 🔖 인증 상태 타입 정의
// =============================================================================

export interface AuthUser {
  did: string;
  displayName: string;
  email?: string;
  avatar?: string;
  isVerified: boolean;
  hasWebAuthn: boolean;
  lastLogin: Date;
  preferences: UserPreferences;
  credentials: UserCredential[];
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: 'ko' | 'en' | 'ja';
  notifications: boolean;
  twoFactorEnabled: boolean;
  dataRetention: '7days' | '30days' | '1year' | 'forever';
}

export interface UserCredential {
  id: string;
  type: 'webauthn' | 'backup_code';
  name: string;
  lastUsed?: Date;
  isActive: boolean;
}

export interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  sessionToken: string | null;
}

export interface AuthActions {
  login: (options?: LoginOptions) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  register: (userInfo: RegisterUserInfo) => Promise<{ success: boolean; error?: string }>;
  refreshAuth: () => Promise<void>;
  updateProfile: (updates: Partial<AuthUser>) => Promise<{ success: boolean; error?: string }>;
  addCredential: () => Promise<{ success: boolean; error?: string }>;
  removeCredential: (credentialId: string) => Promise<{ success: boolean; error?: string }>;
}

export interface LoginOptions {
  userDID?: string;
  rememberMe?: boolean;
  allowFallback?: boolean;
}

export interface RegisterUserInfo {
  displayName: string;
  email?: string;
  preferences?: Partial<UserPreferences>;
}

// =============================================================================
// 🔄 인증 컨텍스트
// =============================================================================

const AuthContext = createContext<(AuthState & AuthActions) | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuthState();
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

// =============================================================================
// 🎣 메인 useAuth 훅
// =============================================================================

export function useAuth(): AuthState & AuthActions {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// =============================================================================
// 🏗️ 인증 상태 관리 훅 구현
// =============================================================================

function useAuthState(): AuthState & AuthActions {
  // 상태 관리
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
    error: null,
    sessionToken: null,
  });

  // =============================================================================
  // 🔐 로그인 함수
  // =============================================================================

  const login = useCallback(async (options: LoginOptions = {}): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log('🔐 로그인 시작', options);

      setState(prev => ({ ...prev, isLoading: true, error: null }));

      // WebAuthn 지원 확인
      if (!window.PublicKeyCredential) {
        throw new Error('이 브라우저는 WebAuthn을 지원하지 않습니다');
      }

      // 플랫폼 인증기 사용 가능 확인
      const isPlatformAvailable = await window.PublicKeyCredential
        .isUserVerifyingPlatformAuthenticatorAvailable();

      if (!isPlatformAvailable && !options.allowFallback) {
        throw new Error('생체 인증이 사용할 수 없습니다. 설정에서 활성화해주세요.');
      }

      // 인증 시작 API 호출
      const beginResponse = await fetch('/api/webauthn/authenticate/begin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userDID: options.userDID,
          options: {
            userVerification: 'preferred',
            timeout: 60000,
          }
        }),
      });

      if (!beginResponse.ok) {
        const errorData = await beginResponse.json();
        throw new Error(errorData.error || '인증 시작 실패');
      }

      const { options: authOptions, challengeId } = await beginResponse.json();

      console.log('🔑 WebAuthn 인증 옵션 받음');

      // WebAuthn 인증 실행
      const credential = await navigator.credentials.get({
        publicKey: {
          ...authOptions,
          challenge: new Uint8Array(Object.values(authOptions.challenge)),
          allowCredentials: authOptions.allowCredentials?.map((cred: any) => ({
            ...cred,
            id: new Uint8Array(Object.values(cred.id)),
          })),
        },
      }) as PublicKeyCredential;

      if (!credential) {
        throw new Error('인증이 취소되었습니다');
      }

      console.log('✅ WebAuthn 인증 완료');

      // 인증 완료 API 호출
      const completeResponse = await fetch('/api/webauthn/authenticate/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          challengeId,
          credential: {
            id: credential.id,
            rawId: Array.from(new Uint8Array(credential.rawId)),
            response: {
              authenticatorData: Array.from(new Uint8Array(credential.response.authenticatorData)),
              clientDataJSON: Array.from(new Uint8Array(credential.response.clientDataJSON)),
              signature: Array.from(new Uint8Array((credential.response as any).signature)),
              userHandle: credential.response.userHandle ? 
                Array.from(new Uint8Array(credential.response.userHandle)) : null,
            },
            type: credential.type,
          },
          rememberMe: options.rememberMe,
        }),
      });

      if (!completeResponse.ok) {
        const errorData = await completeResponse.json();
        throw new Error(errorData.error || '인증 완료 실패');
      }

      const authResult = await completeResponse.json();

      // 사용자 정보 로드
      const userInfo = await loadUserInfo(authResult.userDID);

      // 세션 토큰 저장
      if (options.rememberMe && authResult.sessionToken) {
        localStorage.setItem('authToken', authResult.sessionToken);
      } else {
        sessionStorage.setItem('authToken', authResult.sessionToken);
      }

      setState(prev => ({
        ...prev,
        user: userInfo,
        isAuthenticated: true,
        isLoading: false,
        sessionToken: authResult.sessionToken,
        error: null,
      }));

      console.log('🎉 로그인 성공');

      return { success: true };

    } catch (error) {
      console.error('❌ 로그인 실패:', error);

      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : '로그인 실패',
      }));

      return {
        success: false,
        error: error instanceof Error ? error.message : '로그인 실패'
      };
    }
  }, []);

  // =============================================================================
  // 📝 회원가입 함수
  // =============================================================================

  const register = useCallback(async (userInfo: RegisterUserInfo): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log('📝 회원가입 시작', userInfo);

      setState(prev => ({ ...prev, isLoading: true, error: null }));

      // WebAuthn 지원 확인
      if (!window.PublicKeyCredential) {
        throw new Error('이 브라우저는 WebAuthn을 지원하지 않습니다');
      }

      // 등록 시작 API 호출
      const beginResponse = await fetch('/api/webauthn/register/begin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userDisplayName: userInfo.displayName,
          userEmail: userInfo.email,
        }),
      });

      if (!beginResponse.ok) {
        const errorData = await beginResponse.json();
        throw new Error(errorData.error || '등록 시작 실패');
      }

      const { options: regOptions } = await beginResponse.json();

      console.log('🔑 WebAuthn 등록 옵션 받음');

      // WebAuthn 등록 실행
      const credential = await navigator.credentials.create({
        publicKey: {
          ...regOptions,
          challenge: new Uint8Array(Object.values(regOptions.challenge)),
          user: {
            ...regOptions.user,
            id: new Uint8Array(Object.values(regOptions.user.id)),
          },
          excludeCredentials: regOptions.excludeCredentials?.map((cred: any) => ({
            ...cred,
            id: new Uint8Array(Object.values(cred.id)),
          })),
        },
      }) as PublicKeyCredential;

      if (!credential) {
        throw new Error('등록이 취소되었습니다');
      }

      console.log('✅ WebAuthn 등록 완료');

      // DID 생성 API 호출
      const createDIDResponse = await fetch('/api/did/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userDisplayName: userInfo.displayName,
          userEmail: userInfo.email,
          webauthnResponse: {
            id: credential.id,
            rawId: Array.from(new Uint8Array(credential.rawId)),
            response: {
              attestationObject: Array.from(new Uint8Array((credential.response as any).attestationObject)),
              clientDataJSON: Array.from(new Uint8Array(credential.response.clientDataJSON)),
            },
            type: credential.type,
          },
          metadata: {
            preferences: userInfo.preferences,
            registrationSource: 'web_dashboard',
          },
        }),
      });

      if (!createDIDResponse.ok) {
        const errorData = await createDIDResponse.json();
        throw new Error(errorData.error || 'DID 생성 실패');
      }

      const didResult = await createDIDResponse.json();

      console.log('🆔 DID 생성 완료:', didResult.did);

      // 자동 로그인
      const loginResult = await login({ userDID: didResult.did });

      if (!loginResult.success) {
        throw new Error(loginResult.error || '자동 로그인 실패');
      }

      console.log('🎉 회원가입 및 로그인 성공');

      return { success: true };

    } catch (error) {
      console.error('❌ 회원가입 실패:', error);

      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : '회원가입 실패',
      }));

      return {
        success: false,
        error: error instanceof Error ? error.message : '회원가입 실패'
      };
    }
  }, [login]);

  // =============================================================================
  // 🚪 로그아웃 함수
  // =============================================================================

  const logout = useCallback(async (): Promise<void> => {
    try {
      console.log('🚪 로그아웃 시작');

      // 서버에 로그아웃 요청
      if (state.sessionToken) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${state.sessionToken}`,
            'Content-Type': 'application/json',
          },
        }).catch(err => console.warn('로그아웃 API 호출 실패:', err));
      }

      // 로컬 상태 클리어
      localStorage.removeItem('authToken');
      sessionStorage.removeItem('authToken');

      setState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
        error: null,
        sessionToken: null,
      });

      console.log('✅ 로그아웃 완료');

    } catch (error) {
      console.error('❌ 로그아웃 오류:', error);
    }
  }, [state.sessionToken]);

  // =============================================================================
  // 🔄 인증 상태 새로고침
  // =============================================================================

  const refreshAuth = useCallback(async (): Promise<void> => {
    try {
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');

      if (!token) {
        setState(prev => ({ ...prev, isLoading: false }));
        return;
      }

      console.log('🔄 인증 상태 새로고침');

      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('토큰 갱신 실패');
      }

      const authData = await response.json();
      const userInfo = await loadUserInfo(authData.userDID);

      setState(prev => ({
        ...prev,
        user: userInfo,
        isAuthenticated: true,
        isLoading: false,
        sessionToken: authData.sessionToken,
        error: null,
      }));

      console.log('✅ 인증 상태 새로고침 완료');

    } catch (error) {
      console.error('❌ 인증 상태 새로고침 실패:', error);

      // 토큰이 유효하지 않으면 로그아웃
      await logout();
    }
  }, [logout]);

  // =============================================================================
  // 👤 프로필 업데이트
  // =============================================================================

  const updateProfile = useCallback(async (updates: Partial<AuthUser>): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!state.user || !state.sessionToken) {
        throw new Error('인증이 필요합니다');
      }

      console.log('👤 프로필 업데이트 시작');

      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${state.sessionToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '프로필 업데이트 실패');
      }

      const updatedUser = await response.json();

      setState(prev => ({
        ...prev,
        user: { ...prev.user!, ...updatedUser },
      }));

      console.log('✅ 프로필 업데이트 완료');

      return { success: true };

    } catch (error) {
      console.error('❌ 프로필 업데이트 실패:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '프로필 업데이트 실패'
      };
    }
  }, [state.user, state.sessionToken]);

  // =============================================================================
  // 🔑 자격증명 관리
  // =============================================================================

  const addCredential = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!state.user) {
        throw new Error('인증이 필요합니다');
      }

      console.log('🔑 새 자격증명 추가 시작');

      // 기존 등록 프로세스와 유사하게 WebAuthn 등록 진행
      const beginResponse = await fetch('/api/webauthn/register/begin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userDID: state.user.did,
          userDisplayName: state.user.displayName,
          userEmail: state.user.email,
        }),
      });

      if (!beginResponse.ok) {
        throw new Error('자격증명 추가 시작 실패');
      }

      const { options } = await beginResponse.json();

      const credential = await navigator.credentials.create({
        publicKey: {
          ...options,
          challenge: new Uint8Array(Object.values(options.challenge)),
          user: {
            ...options.user,
            id: new Uint8Array(Object.values(options.user.id)),
          },
        },
      });

      if (!credential) {
        throw new Error('자격증명 등록이 취소되었습니다');
      }

      // 완료 처리
      const completeResponse = await fetch('/api/webauthn/register/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userDID: state.user.did,
          credential: {
            id: credential.id,
            rawId: Array.from(new Uint8Array(credential.rawId)),
            response: {
              attestationObject: Array.from(new Uint8Array((credential.response as any).attestationObject)),
              clientDataJSON: Array.from(new Uint8Array(credential.response.clientDataJSON)),
            },
            type: credential.type,
          },
        }),
      });

      if (!completeResponse.ok) {
        throw new Error('자격증명 등록 완료 실패');
      }

      // 사용자 정보 새로고침
      await refreshAuth();

      console.log('✅ 새 자격증명 추가 완료');

      return { success: true };

    } catch (error) {
      console.error('❌ 자격증명 추가 실패:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '자격증명 추가 실패'
      };
    }
  }, [state.user, refreshAuth]);

  const removeCredential = useCallback(async (credentialId: string): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!state.user || !state.sessionToken) {
        throw new Error('인증이 필요합니다');
      }

      console.log('🗑️ 자격증명 삭제 시작:', credentialId);

      const response = await fetch(`/api/credentials/${credentialId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${state.sessionToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '자격증명 삭제 실패');
      }

      // 사용자 정보 새로고침
      await refreshAuth();

      console.log('✅ 자격증명 삭제 완료');

      return { success: true };

    } catch (error) {
      console.error('❌ 자격증명 삭제 실패:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '자격증명 삭제 실패'
      };
    }
  }, [state.user, state.sessionToken, refreshAuth]);

  // =============================================================================
  // 🚀 초기화 및 이펙트
  // =============================================================================

  useEffect(() => {
    refreshAuth();
  }, [refreshAuth]);

  // 인증 상태 및 액션 반환
  return {
    ...state,
    login,
    logout,
    register,
    refreshAuth,
    updateProfile,
    addCredential,
    removeCredential,
  };
}

// =============================================================================
// 🛠️ 유틸리티 함수들
// =============================================================================

/**
 * 사용자 정보 로드
 */
async function loadUserInfo(userDID: string): Promise<AuthUser> {
  // 실제 구현에서는 API에서 사용자 정보를 가져옴
  const mockUser: AuthUser = {
    did: userDID,
    displayName: '사용자',
    isVerified: true,
    hasWebAuthn: true,
    lastLogin: new Date(),
    preferences: {
      theme: 'auto',
      language: 'ko',
      notifications: true,
      twoFactorEnabled: true,
      dataRetention: '1year',
    },
    credentials: [
      {
        id: 'webauthn-1',
        type: 'webauthn',
        name: 'Touch ID (MacBook)',
        lastUsed: new Date(),
        isActive: true,
      }
    ],
  };

  return mockUser;
}

/**
 * WebAuthn 지원 여부 확인 훅
 */
export function useWebAuthnSupport() {
  const [isSupported, setIsSupported] = useState(false);
  const [isPlatformAvailable, setIsPlatformAvailable] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkSupport() {
      try {
        // 기본 WebAuthn 지원 확인
        const basicSupport = !!(window.PublicKeyCredential && 
                               window.PublicKeyCredential.create && 
                               window.PublicKeyCredential.get);

        setIsSupported(basicSupport);

        // 플랫폼 인증기 사용 가능 확인
        if (basicSupport) {
          const platformAvailable = await window.PublicKeyCredential
            .isUserVerifyingPlatformAuthenticatorAvailable();
          setIsPlatformAvailable(platformAvailable);
        }

      } catch (error) {
        console.error('WebAuthn 지원 확인 실패:', error);
        setIsSupported(false);
        setIsPlatformAvailable(false);
      } finally {
        setIsLoading(false);
      }
    }

    checkSupport();
  }, []);

  return {
    isSupported,
    isPlatformAvailable,
    isLoading,
  };
}