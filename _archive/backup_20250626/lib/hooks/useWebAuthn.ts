// =============================================================================
// 🔐 AuthProvider 컴포넌트
// 파일: src/components/auth/AuthProvider.tsx
// =============================================================================

"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

// =============================================================================
// 📋 타입 정의
// =============================================================================

interface User {
  id: string;
  did: string;
  email: string;
  displayName: string;
  authMethod: string;
  avatar?: string;
  preferences?: Record<string, any>;
  profile?: Record<string, any>;
  stats?: Record<string, any>;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthContextType extends AuthState {
  // 인증 액션들
  login: (userData: any) => void;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  clearError: () => void;
  
  // 토큰 관리
  setTokens: (accessToken: string, refreshToken?: string) => void;
  refreshTokens: () => Promise<boolean>;
  
  // 사용자 프로필 관리
  fetchUserProfile: () => Promise<void>;
  updateUserProfile: (profileData: Partial<User>) => Promise<void>;
}

// =============================================================================
// 🎯 Context 생성
// =============================================================================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// =============================================================================
// 🔧 로컬 스토리지 키 상수
// =============================================================================

const STORAGE_KEYS = {
  USER: 'webauthn_user',
  ACCESS_TOKEN: 'webauthn_access_token',
  REFRESH_TOKEN: 'webauthn_refresh_token',
  THEME: 'webauthn_theme',
  LANGUAGE: 'webauthn_language'
};

// =============================================================================
// 🔧 유틸리티 함수들
// =============================================================================

/**
 * 안전한 로컬 스토리지 접근
 */
const safeLocalStorage = {
  getItem: (key: string): string | null => {
    try {
      if (typeof window !== 'undefined') {
        return localStorage.getItem(key);
      }
    } catch (error) {
      console.warn('로컬 스토리지 읽기 실패:', error);
    }
    return null;
  },
  
  setItem: (key: string, value: string): void => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(key, value);
      }
    } catch (error) {
      console.warn('로컬 스토리지 쓰기 실패:', error);
    }
  },
  
  removeItem: (key: string): void => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(key);
      }
    } catch (error) {
      console.warn('로컬 스토리지 삭제 실패:', error);
    }
  },
  
  clear: (): void => {
    try {
      if (typeof window !== 'undefined') {
        // 인증 관련 키들만 삭제
        Object.values(STORAGE_KEYS).forEach(key => {
          localStorage.removeItem(key);
        });
      }
    } catch (error) {
      console.warn('로컬 스토리지 초기화 실패:', error);
    }
  }
};

/**
 * JWT 토큰 유효성 검사 (간단한 버전)
 */
function isTokenValid(token: string): boolean {
  try {
    if (!token) return false;
    
    // Base64 디코딩하여 페이로드 확인
    const payload = JSON.parse(atob(token));
    
    // 필수 필드 확인
    if (!payload.userId || !payload.did || !payload.email) {
      return false;
    }
    
    // 만료 시간 확인 (있는 경우)
    if (payload.exp && Date.now() >= payload.exp * 1000) {
      return false;
    }
    
    return true;
  } catch (error) {
    console.warn('토큰 검증 실패:', error);
    return false;
  }
}

/**
 * API 요청 헬퍼
 */
async function apiRequest(
  url: string, 
  options: RequestInit = {}, 
  accessToken?: string
): Promise<any> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
    ...((options.headers as Record<string, string>) || {})
  };
  
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }
  
  const response = await fetch(url, {
    ...options,
    headers
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP ${response.status}`);
  }
  
  return response.json();
}

// =============================================================================
// 🎯 AuthProvider 컴포넌트
// =============================================================================

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  // ===========================================================================
  // 📊 상태 관리
  // ===========================================================================
  
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
    isLoading: true,
    error: null
  });

  // ===========================================================================
  // 🔧 액션 함수들
  // ===========================================================================
  
  const clearError = () => {
    setAuthState(prev => ({ ...prev, error: null }));
  };

  const setLoading = (isLoading: boolean) => {
    setAuthState(prev => ({ ...prev, isLoading }));
  };

  const setError = (error: string) => {
    setAuthState(prev => ({ ...prev, error, isLoading: false }));
  };

  const setTokens = (accessToken: string, refreshToken?: string) => {
    setAuthState(prev => ({
      ...prev,
      accessToken,
      refreshToken: refreshToken || prev.refreshToken
    }));
    
    safeLocalStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
    if (refreshToken) {
      safeLocalStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
    }
  };

  const login = (userData: any) => {
    console.log('🔐 사용자 로그인:', userData.user);
    
    const user: User = {
      id: userData.user.id,
      did: userData.user.did,
      email: userData.user.email,
      displayName: userData.user.displayName,
      authMethod: userData.user.authMethod,
      avatar: userData.user.avatar,
      preferences: userData.user.preferences,
      profile: userData.user.profile,
      stats: userData.user.stats
    };

    setAuthState(prev => ({
      ...prev,
      user,
      accessToken: userData.accessToken,
      refreshToken: userData.refreshToken || prev.refreshToken,
      isAuthenticated: true,
      isLoading: false,
      error: null
    }));

    // 로컬 스토리지에 저장
    safeLocalStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    safeLocalStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, userData.accessToken);
    if (userData.refreshToken) {
      safeLocalStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, userData.refreshToken);
    }
  };

  const logout = () => {
    console.log('🚪 사용자 로그아웃');
    
    setAuthState({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null
    });

    // 로컬 스토리지 정리
    safeLocalStorage.clear();
  };

  const updateUser = (userData: Partial<User>) => {
    setAuthState(prev => {
      if (!prev.user) return prev;
      
      const updatedUser = { ...prev.user, ...userData };
      
      // 로컬 스토리지 업데이트
      safeLocalStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
      
      return {
        ...prev,
        user: updatedUser
      };
    });
  };

  // ===========================================================================
  // 🔄 토큰 관리
  // ===========================================================================
  
  const refreshTokens = async (): Promise<boolean> => {
    try {
      const refreshToken = authState.refreshToken;
      
      if (!refreshToken) {
        throw new Error('리프레시 토큰이 없습니다.');
      }

      const data = await apiRequest('/api/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({ refreshToken })
      });

      if (data.success) {
        setTokens(data.accessToken, data.refreshToken);
        return true;
      } else {
        throw new Error(data.error || '토큰 갱신 실패');
      }
    } catch (error) {
      console.error('❌ 토큰 갱신 실패:', error);
      logout(); // 토큰 갱신 실패 시 로그아웃
      return false;
    }
  };

  // ===========================================================================
  // 👤 사용자 프로필 관리
  // ===========================================================================
  
  const fetchUserProfile = async (): Promise<void> => {
    try {
      if (!authState.accessToken) {
        throw new Error('액세스 토큰이 없습니다.');
      }

      const data = await apiRequest('/api/user/profile', {
        method: 'GET'
      }, authState.accessToken);

      if (data.success) {
        updateUser(data.user);
      } else {
        throw new Error(data.error || '사용자 정보 조회 실패');
      }
    } catch (error) {
      console.error('❌ 사용자 프로필 조회 실패:', error);
      setError('사용자 정보를 불러올 수 없습니다.');
    }
  };

  const updateUserProfile = async (profileData: Partial<User>): Promise<void> => {
    try {
      if (!authState.accessToken) {
        throw new Error('액세스 토큰이 없습니다.');
      }

      const data = await apiRequest('/api/user/profile', {
        method: 'PUT',
        body: JSON.stringify(profileData)
      }, authState.accessToken);

      if (data.success) {
        updateUser(data.user);
      } else {
        throw new Error(data.error || '사용자 정보 업데이트 실패');
      }
    } catch (error) {
      console.error('❌ 사용자 프로필 업데이트 실패:', error);
      setError('사용자 정보를 업데이트할 수 없습니다.');
      throw error;
    }
  };

  // ===========================================================================
  // 🔄 초기화 효과
  // ===========================================================================
  
  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true);
      
      try {
        // 로컬 스토리지에서 인증 정보 복원
        const storedUser = safeLocalStorage.getItem(STORAGE_KEYS.USER);
        const storedAccessToken = safeLocalStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
        const storedRefreshToken = safeLocalStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);

        if (storedUser && storedAccessToken) {
          const user = JSON.parse(storedUser);
          
          // 토큰 유효성 검증
          if (isTokenValid(storedAccessToken)) {
            setAuthState(prev => ({
              ...prev,
              user,
              accessToken: storedAccessToken,
              refreshToken: storedRefreshToken,
              isAuthenticated: true,
              isLoading: false
            }));
            
            console.log('✅ 인증 정보 복원 완료:', user.email);
            
            // 백그라운드에서 사용자 프로필 갱신
            try {
              await fetchUserProfile();
            } catch (error) {
              console.warn('사용자 프로필 갱신 실패:', error);
            }
          } else {
            console.warn('⚠️ 유효하지 않은 토큰, 리프레시 시도');
            
            // 토큰 갱신 시도
            if (storedRefreshToken) {
              const refreshSuccess = await refreshTokens();
              if (!refreshSuccess) {
                logout();
              }
            } else {
              logout();
            }
          }
        } else {
          console.log('ℹ️ 저장된 인증 정보 없음');
        }
      } catch (error) {
        console.error('❌ 인증 초기화 실패:', error);
        logout();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []); // 컴포넌트 마운트 시 한 번만 실행

  // ===========================================================================
  // 🎯 Context Value
  // ===========================================================================
  
  const contextValue: AuthContextType = {
    // 상태
    ...authState,
    
    // 액션들
    login,
    logout,
    updateUser,
    clearError,
    
    // 토큰 관리
    setTokens,
    refreshTokens,
    
    // 프로필 관리
    fetchUserProfile,
    updateUserProfile
  };

  return (
      {children}
}

// =============================================================================
// 🎣 useAuth 훅
// =============================================================================

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth는 AuthProvider 내에서 사용되어야 합니다.');
  }
  
  return context;
}

// =============================================================================
// 🔒 인증 보호 HOC
// =============================================================================

interface WithAuthProps {
  redirectTo?: string;
  requiredAuthMethod?: string;
}

export function withAuth<T extends object>(
  Component: React.ComponentType<T>,
  options: WithAuthProps = {}
) {
  return function AuthenticatedComponent(props: T) {
    const { isAuthenticated, isLoading, user } = useAuth();
    const { redirectTo = '/auth/login', requiredAuthMethod } = options;

    useEffect(() => {
      if (!isLoading && !isAuthenticated) {
        window.location.href = redirectTo;
      } else if (
        !isLoading &&
        isAuthenticated &&
        requiredAuthMethod &&
        user?.authMethod !== requiredAuthMethod
      ) {
        console.warn('⚠️ 요구되는 인증 방법과 다름:', {
          required: requiredAuthMethod,
          current: user?.authMethod
        });
      }
    }, [isAuthenticated, isLoading]);

    if (isLoading) {
      return (
    }

    if (!isAuthenticated) {
      return null;
    }

    return <Component {...props} />;
  };
}

// =============================================================================
// 🔧 추가 유틸리티 타입들
// =============================================================================

export type { User, AuthState, AuthContextType };

export default AuthProvider;