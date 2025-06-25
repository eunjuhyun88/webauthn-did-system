// =============================================================================
// 🔐 WebAuthn Hook - TypeScript 전용 (JSX 제거됨)
// src/lib/hooks/useWebAuthn.ts
// =============================================================================

import { useState, useEffect, useCallback } from 'react';
import { 
  checkWebAuthnSupport,
  performRegistration,
  performAuthentication,
  registerWithWebAuthn,
  authenticateWithWebAuthn
} from '@/auth/webauthn/client';
import type { WebAuthnSupport } from '@/types/webauthn';

// =============================================================================
// 📋 Hook 인터페이스
// =============================================================================

interface UseWebAuthnResult {
  isSupported: boolean;
  isLoading: boolean;
  error: string | null;
  register: (username: string, displayName: string) => Promise<boolean>;
  authenticate: (username?: string) => Promise<boolean>;
  checkSupport: () => Promise<WebAuthnSupport>;
}

// =============================================================================
// 🎯 Main Hook
// =============================================================================

export function useWebAuthn(): UseWebAuthnResult {
  const [isSupported, setIsSupported] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // WebAuthn 지원 확인
  const checkSupport = useCallback(async (): Promise<WebAuthnSupport> => {
    try {
      const support = await checkWebAuthnSupport();
      setIsSupported(support.available);
      return support;
    } catch (err) {
      setError(err instanceof Error ? err.message : '지원 확인 실패');
      return {
        available: false,
        conditionalUI: false,
        userVerifying: false,
        residentKey: false,
        protocols: []
      };
    }
  }, []);

  // 등록 함수
  const register = useCallback(async (username: string, displayName: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await registerWithWebAuthn(username, displayName);
      if (result.success) {
        return true;
      } else {
        setError(result.error || '등록 실패');
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '등록 중 오류 발생');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 인증 함수
  const authenticate = useCallback(async (username?: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await authenticateWithWebAuthn(username);
      if (result.success) {
        return true;
      } else {
        setError(result.error || '인증 실패');
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '인증 중 오류 발생');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 초기 지원 확인
  useEffect(() => {
    checkSupport();
  }, [checkSupport]);

  return {
    isSupported,
    isLoading,
    error,
    register,
    authenticate,
    checkSupport
  };
}

// =============================================================================
// 🎯 기본 내보내기
// =============================================================================

export default useWebAuthn;
