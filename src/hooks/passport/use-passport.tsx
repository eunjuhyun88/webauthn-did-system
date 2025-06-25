'use client';

import { useState, useEffect, useCallback } from 'react';

export interface PassportData {
  id: string;
  did: string;
  owner: string;
  biometricEnabled: boolean;
  vaultCount: number;
  trustScore: number;
  cueTokens: number;
  lastUpdate: Date;
}

export interface UsePassportReturn {
  passport: PassportData | null;
  isLoading: boolean;
  error: string | null;
  updatePassport: (data: Partial<PassportData>) => Promise<void>;
  refreshPassport: () => Promise<void>;
}

export function usePassport(): UsePassportReturn {
  const [passport, setPassport] = useState<PassportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshPassport = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/passport/update');
      
      if (response.ok) {
        const data = await response.json();
        setPassport(data.passport);
      } else {
        // 기본 패스포트 데이터 생성
        const defaultPassport: PassportData = {
          id: 'default-passport',
          did: 'did:example:123456',
          owner: 'user@example.com',
          biometricEnabled: true,
          vaultCount: 3,
          trustScore: 96.8,
          cueTokens: 15428,
          lastUpdate: new Date(),
        };
        setPassport(defaultPassport);
      }
    } catch (error) {
      console.error('Passport refresh error:', error);
      setError('패스포트 정보를 불러올 수 없습니다.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updatePassport = useCallback(async (data: Partial<PassportData>) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/passport/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const result = await response.json();
        setPassport(result.passport);
      } else {
        throw new Error('패스포트 업데이트 실패');
      }
    } catch (error) {
      console.error('Passport update error:', error);
      setError('패스포트 업데이트에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshPassport();
  }, [refreshPassport]);

  return {
    passport,
    isLoading,
    error,
    updatePassport,
    refreshPassport,
  };
}

export default usePassport;
