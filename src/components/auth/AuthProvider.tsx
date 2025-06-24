'use client';

// =============================================================================
// 🔐 AuthProvider - Fusion AI Dashboard 완전 호환
// 파일: src/components/auth/AuthProvider.tsx
// =============================================================================

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';

// =============================================================================
// 📋 타입 정의 (Fusion AI Dashboard 호환)
// =============================================================================

interface User {
  id: string;
  did: string;
  email: string;
  displayName: string;
  authMethod: 'google' | 'webauthn' | 'demo';
  avatar?: string;
  subscription: 'free' | 'pro' | 'enterprise';
  preferences: {
    theme: 'light' | 'dark' | 'auto';
    language: 'ko' | 'en' | 'ja';
    notifications: boolean;
    aiPersonality: 'professional' | 'friendly' | 'technical' | 'creative';
    responseStyle: 'brief' | 'detailed' | 'examples';
    dataRetention: '7days' | '30days' | '1year' | 'forever';
    privacy: {
      shareUsageData: boolean;
      allowPersonalization: boolean;
      storageLocation: 'global' | 'region' | 'local';
    };
  };
  agentProfile?: {
    name: string;
    type: string;
    did: string;
    passportNo: string;
    status: 'active' | 'inactive' | 'learning' | 'maintenance';
    level: number;
    trustScore: number;
    avatar: string;
  };
  tokens?: {
    accessToken: string;
    refreshToken: string;
    expiresAt: number;
  };
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthContextType extends AuthState {
  // 인증 메서드
  loginWithWebAuthn: (email: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  loginWithDemo: () => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  
  // 사용자 관리
  updateUser: (userData: Partial<User>) => void;
  refreshUser: () => Promise<void>;
  
  // 유틸리티
  clearError: () => void;
  checkAuthStatus: () => Promise<boolean>;
}

// =============================================================================
// 🎯 Context 생성
// =============================================================================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// =============================================================================
// 🔧 AuthProvider 컴포넌트
// =============================================================================

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  // =============================================================================
  // 🔄 초기화 및 인증 상태 확인
  // =============================================================================

  useEffect(() => {
    checkInitialAuth();
  }, []);

  const checkInitialAuth = async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      
      // 저장된 토큰 확인
      const savedToken = localStorage.getItem('auth-token');
      const savedUser = localStorage.getItem('auth-user');
      
      if (savedToken && savedUser) {
        const userData = JSON.parse(savedUser);
        
        // 토큰 유효성 검증
        const isValid = await validateToken(savedToken);
        
        if (isValid) {
          setAuthState({
            user: userData,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
          return;
        } else {
          // 토큰이 유효하지 않으면 정리
          localStorage.removeItem('auth-token');
          localStorage.removeItem('auth-user');
        }
      }
      
      setAuthState(prev => ({ ...prev, isLoading: false }));
      
    } catch (error) {
      console.error('Initial auth check failed:', error);
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  };

  // =============================================================================
  // 🔐 WebAuthn 로그인
  // =============================================================================

  const loginWithWebAuthn = async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

      // 1. 인증 시작
      const beginResponse = await fetch('/api/webauthn/authenticate/begin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!beginResponse.ok) {
        throw new Error('Failed to start authentication');
      }

      const { options } = await beginResponse.json();

      // 2. WebAuthn 인증 실행
      const credential = await navigator.credentials.get({
        publicKey: {
          ...options,
          challenge: new Uint8Array(options.challenge),
          allowCredentials: options.allowCredentials?.map((cred: any) => ({
            ...cred,
            id: new Uint8Array(cred.id),
          })),
        },
      }) as PublicKeyCredential;

      if (!credential) {
        throw new Error('Authentication cancelled');
      }

      // 3. 인증 완료
      const completeResponse = await fetch('/api/webauthn/authenticate/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          credential: {
            id: credential.id,
            rawId: Array.from(new Uint8Array(credential.rawId)),
            response: {
              authenticatorData: Array.from(new Uint8Array((credential.response as AuthenticatorAssertionResponse).authenticatorData)),
              clientDataJSON: Array.from(new Uint8Array(credential.response.clientDataJSON)),
              signature: Array.from(new Uint8Array((credential.response as AuthenticatorAssertionResponse).signature)),
            },
            type: credential.type,
          },
          challengeData: options,
        }),
      });

      if (!completeResponse.ok) {
        throw new Error('Authentication verification failed');
      }

      const { success, user, tokens } = await completeResponse.json();

      if (success && user && tokens) {
        // 토큰과 사용자 정보 저장
        localStorage.setItem('auth-token', tokens.accessToken);
        localStorage.setItem('auth-user', JSON.stringify(user));

        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });

        // 대시보드로 리다이렉트
        router.push('/dashboard');

        return { success: true };
      } else {
        throw new Error('Authentication failed');
      }

    } catch (error: any) {
      console.error('WebAuthn login failed:', error);
      
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'WebAuthn login failed',
      }));

      return { success: false, error: error.message || 'WebAuthn login failed' };
    }
  };

  // =============================================================================
  // 🔐 Google 로그인 (시뮬레이션)
  // =============================================================================

  const loginWithGoogle = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

      // Google OAuth 시뮬레이션
      await new Promise(resolve => setTimeout(resolve, 2000));

      const demoUser: User = {
        id: 'google_' + Date.now(),
        did: `did:web:example.com:google-${Math.random().toString(36).substring(7)}`,
        email: 'user@gmail.com',
        displayName: 'Google User',
        authMethod: 'google',
        subscription: 'pro',
        preferences: {
          theme: 'light',
          language: 'ko',
          notifications: true,
          aiPersonality: 'friendly',
          responseStyle: 'detailed',
          dataRetention: '30days',
          privacy: {
            shareUsageData: false,
            allowPersonalization: true,
            storageLocation: 'region'
          }
        },
        agentProfile: {
          name: 'Fusion AI Agent',
          type: 'Universal Personal Assistant',
          did: `did:fusion:agent:google-${Math.random().toString(36).substring(7)}`,
          passportNo: 'FUS240125002',
          status: 'active',
          level: 48,
          trustScore: 95,
          avatar: '🤖',
        },
        tokens: {
          accessToken: 'google_demo_token',
          refreshToken: 'google_demo_refresh',
          expiresAt: Date.now() + 3600000
        }
      };

      localStorage.setItem('auth-token', demoUser.tokens!.accessToken);
      localStorage.setItem('auth-user', JSON.stringify(demoUser));

      setAuthState({
        user: demoUser,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      router.push('/dashboard');
      return { success: true };

    } catch (error: any) {
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Google login failed',
      }));

      return { success: false, error: error.message || 'Google login failed' };
    }
  };

  // =============================================================================
  // 🔐 데모 로그인
  // =============================================================================

  const loginWithDemo = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

      await new Promise(resolve => setTimeout(resolve, 1000));

      const demoUser: User = {
        id: 'demo_' + Date.now(),
        did: `did:web:example.com:demo-${Math.random().toString(36).substring(7)}`,
        email: 'demo@fusion-ai.com',
        displayName: 'Demo User',
        authMethod: 'demo',
        subscription: 'free',
        preferences: {
          theme: 'light',
          language: 'ko',
          notifications: true,
          aiPersonality: 'friendly',
          responseStyle: 'detailed',
          dataRetention: '7days',
          privacy: {
            shareUsageData: false,
            allowPersonalization: true,
            storageLocation: 'local'
          }
        },
        agentProfile: {
          name: 'Demo AI Agent',
          type: 'Basic Assistant',
          did: `did:fusion:agent:demo-${Math.random().toString(36).substring(7)}`,
          passportNo: 'FUS240125003',
          status: 'active',
          level: 25,
          trustScore: 85,
          avatar: '🤖',
        },
        tokens: {
          accessToken: 'demo_token',
          refreshToken: 'demo_refresh',
          expiresAt: Date.now() + 3600000
        }
      };

      localStorage.setItem('auth-token', demoUser.tokens!.accessToken);
      localStorage.setItem('auth-user', JSON.stringify(demoUser));

      setAuthState({
        user: demoUser,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      router.push('/dashboard');
      return { success: true };

    } catch (error: any) {
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Demo login failed',
      }));

      return { success: false, error: error.message || 'Demo login failed' };
    }
  };

  // =============================================================================
  // 🔓 로그아웃
  // =============================================================================

  const logout = async () => {
    try {
      // 서버에 로그아웃 요청
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authState.user?.tokens?.accessToken}`,
        },
      });
    } catch (error) {
      console.error('Logout API failed:', error);
    } finally {
      // 로컬 상태 정리
      localStorage.removeItem('auth-token');
      localStorage.removeItem('auth-user');
      
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });

      router.push('/login');
    }
  };

  // =============================================================================
  // 🔧 유틸리티 메서드들
  // =============================================================================

  const updateUser = (userData: Partial<User>) => {
    if (authState.user) {
      const updatedUser = { ...authState.user, ...userData };
      setAuthState(prev => ({ ...prev, user: updatedUser }));
      localStorage.setItem('auth-user', JSON.stringify(updatedUser));
    }
  };

  const refreshUser = async () => {
    if (!authState.user?.tokens?.accessToken) return;

    try {
      const response = await fetch('/api/user/profile', {
        headers: {
          'Authorization': `Bearer ${authState.user.tokens.accessToken}`,
        },
      });

      if (response.ok) {
        const { user } = await response.json();
        updateUser(user);
      }
    } catch (error) {
      console.error('Failed to refresh user data:', error);
    }
  };

  const clearError = () => {
    setAuthState(prev => ({ ...prev, error: null }));
  };

  const checkAuthStatus = async (): Promise<boolean> => {
    return authState.isAuthenticated && !!authState.user;
  };

  const validateToken = async (token: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/validate', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      return response.ok;
    } catch {
      return false;
    }
  };

  // =============================================================================
  // 🎯 Context Value
  // =============================================================================

  const contextValue: AuthContextType = {
    ...authState,
    loginWithWebAuthn,
    loginWithGoogle,
    loginWithDemo,
    logout,
    updateUser,
    refreshUser,
    clearError,
    checkAuthStatus,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// =============================================================================
// 🔗 useAuth 훅
// =============================================================================

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export { AuthContext };
export type { User, AuthContextType };