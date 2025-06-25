'use client';

import { useState, useEffect } from 'react';

export interface User {
  id: string;
  email: string;
  displayName: string;
  authMethod: 'webauthn' | 'google' | 'demo';
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/auth/check');
      if (response.ok) {
        const userData = await response.json();
        setUser(userData.user);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials: any) => {
    // 로그인 로직 구현
  };

  const logout = async () => {
    // 로그아웃 로직 구현
    setUser(null);
  };

  return {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user
  };
}
