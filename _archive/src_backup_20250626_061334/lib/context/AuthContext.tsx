'use client';

/**
 * 🔐 Authentication Context Provider
 * WebAuthn + DID 시스템을 위한 전역 인증 상태 관리
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';

// Types
interface User {
  id: string;
  did: string;
  username: string;
  email: string;
  displayName: string;
  authMethod: 'webauthn' | 'google' | 'demo';
  avatar?: string;
  profile?: {
    createdAt: string;
    lastLoginAt: string;
    trustScore: number;
    level: number;
  };
  subscription?: 'free' | 'pro' | 'enterprise';
  tokens?: {
    accessToken: string;
    refreshToken: string;
    expiresAt: number;
  };
}

interface AuthState {
  isLoading: boolean;
  isAuthenticated: boolean;
  user: User | null;
  error: string | null;
}

interface AuthContextType extends AuthState {
  login: (credentials: any) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
  checkAuth: () => Promise<boolean>;
}

// Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider Component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  
  const [authState, setAuthState] = useState<AuthState>({
    isLoading: true,
    isAuthenticated: false,
    user: null,
    error: null
  });

  // 인증 상태 확인
  const checkAuth = useCallback(async (): Promise<boolean> => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

      const response = await fetch('/api/auth/check', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.authenticated && data.user) {
          setAuthState({
            isLoading: false,
            isAuthenticated: true,
            user: data.user,
            error: null
          });
          return true;
        }
      }

      // 인증되지 않은 상태
      setAuthState({
        isLoading: false,
        isAuthenticated: false,
        user: null,
        error: null
      });
      return false;

    } catch (error) {
      console.error('Auth check failed:', error);
      setAuthState({
        isLoading: false,
        isAuthenticated: false,
        user: null,
        error: 'Authentication check failed'
      });
      return false;
    }
  }, []);

  // 로그인
  const login = useCallback(async (credentials: any): Promise<{ success: boolean; error?: string }> => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

      // WebAuthn 로그인의 경우 별도 처리
      if (credentials.type === 'webauthn') {
        return await handleWebAuthnLogin(credentials);
      }

      // 일반 로그인 처리
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (data.success && data.user) {
        setAuthState({
          isLoading: false,
          isAuthenticated: true,
          user: data.user,
          error: null
        });

        // 로그인 성공 후 적절한 페이지로 리다이렉트
        const redirectTo = new URLSearchParams(window.location.search).get('redirect') || '/chat';
        router.push(redirectTo);

        return { success: true };
      } else {
        setAuthState(prev => ({ 
          ...prev, 
          isLoading: false, 
          error: data.error || 'Login failed' 
        }));
        return { success: false, error: data.error || 'Login failed' };
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      setAuthState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: errorMessage 
      }));
      return { success: false, error: errorMessage };
    }
  }, [router]);

  // WebAuthn 전용 로그인 처리
  const handleWebAuthnLogin = async (credentials: any): Promise<{ success: boolean; error?: string }> => {
    try {
      // WebAuthn 로그인은 이미 완료된 상태로 들어오므로 
      // 사용자 정보만 설정하면 됨
      if (credentials.user) {
        setAuthState({
          isLoading: false,
          isAuthenticated: true,
          user: credentials.user,
          error: null
        });

        return { success: true };
      }

      return { success: false, error: 'Invalid WebAuthn credentials' };

    } catch (error) {
      return { success: false, error: 'WebAuthn login failed' };
    }
  };

  // 로그아웃
  const logout = useCallback(async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));

      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });

      // 로컬 상태 클리어
      setAuthState({
        isLoading: false,
        isAuthenticated: false,
        user: null,
        error: null
      });

      // 로그인 페이지로 리다이렉트
      router.push('/login');

    } catch (error) {
      console.error('Logout failed:', error);
      // 에러가 발생해도 로컬 상태는 클리어
      setAuthState({
        isLoading: false,
        isAuthenticated: false,
        user: null,
        error: null
      });
      router.push('/login');
    }
  }, [router]);

  // 인증 새로고침
  const refreshAuth = useCallback(async () => {
    await checkAuth();
  }, [checkAuth]);

  // 사용자 정보 업데이트
  const updateUser = useCallback((userData: Partial<User>) => {
    setAuthState(prev => ({
      ...prev,
      user: prev.user ? { ...prev.user, ...userData } : null
    }));
  }, []);

  // 초기 인증 확인
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // 라우트 변경 시 인증 상태 확인
  useEffect(() => {
    // 보호된 라우트인지 확인
    const protectedRoutes = ['/chat', '/dashboard', '/profile', '/settings'];
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

    if (isProtectedRoute && !authState.isLoading) {
      if (!authState.isAuthenticated) {
        router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
      }
    }
  }, [pathname, authState.isAuthenticated, authState.isLoading, router]);

  // 토큰 자동 갱신 (선택적)
  useEffect(() => {
    if (authState.isAuthenticated && authState.user?.tokens) {
      const { expiresAt } = authState.user.tokens;
      const now = Date.now();
      const timeUntilExpiry = expiresAt - now;

      // 만료 5분 전에 토큰 갱신
      if (timeUntilExpiry > 0 && timeUntilExpiry < 5 * 60 * 1000) {
        const refreshTimer = setTimeout(() => {
          refreshAuth();
        }, Math.max(0, timeUntilExpiry - 60 * 1000)); // 1분 여유

        return () => clearTimeout(refreshTimer);
      }
    }
  }, [authState.user?.tokens, authState.isAuthenticated, refreshAuth]);

  // 네트워크 상태 모니터링 (선택적)
  useEffect(() => {
    const handleOnline = () => {
      if (authState.isAuthenticated) {
        checkAuth(); // 온라인 복구 시 인증 상태 재확인
      }
    };

    const handleOffline = () => {
      console.log('🔴 네트워크 연결 끊어짐');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [authState.isAuthenticated, checkAuth]);

  // Context Value
  const contextValue: AuthContextType = {
    ...authState,
    login,
    logout,
    refreshAuth,
    updateUser,
    checkAuth
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook for using auth context
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}

// Higher-order component for protected routes
export function withAuth<P extends object>(
  Component: React.ComponentType<P>
): React.ComponentType<P> {
  return function AuthenticatedComponent(props: P) {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!isLoading && !isAuthenticated) {
        router.push('/login');
      }
    }, [isAuthenticated, isLoading, router]);

    if (isLoading) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Authenticating...</p>
          </div>
        </div>
      );
    }

    if (!isAuthenticated) {
      return null; // 리다이렉트 중
    }

    return <Component {...props} />;
  };
}

// Auth status hook
export function useAuthStatus() {
  const { isLoading, isAuthenticated, error } = useAuth();
  return { isLoading, isAuthenticated, error };
}

// Current user hook
export function useCurrentUser() {
  const { user, updateUser } = useAuth();
  return { user, updateUser };
}