'use client';

import { useState, useEffect, useCallback } from 'react';
import { UnifiedAIPassport } from '@/types/passport/unified-passport';
import { passportManager } from '@/lib/passport/passport-manager';

export const usePassport = () => {
  const [passport, setPassport] = useState<UnifiedAIPassport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPassport = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 약간의 지연을 두어 SSR 문제 방지
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const loadedPassport = passportManager.getPassport();
      setPassport(loadedPassport);
    } catch (err) {
      console.error('패스포트 로딩 오류:', err);
      setError(err instanceof Error ? err.message : '패스포트 로딩 실패');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateTrustScore = useCallback((newScore: number) => {
    try {
      passportManager.updateTrustScore(newScore);
      const updatedPassport = passportManager.getPassport();
      setPassport(updatedPassport);
    } catch (err) {
      console.error('신뢰도 업데이트 오류:', err);
    }
  }, []);

  const addCueTokens = useCallback((amount: number, reason: string) => {
    try {
      passportManager.addCueTokens(amount, reason);
      const updatedPassport = passportManager.getPassport();
      setPassport(updatedPassport);
    } catch (err) {
      console.error('CUE 토큰 추가 오류:', err);
    }
  }, []);

  const connectPlatform = useCallback((platform: any) => {
    try {
      passportManager.connectPlatform(platform);
      const updatedPassport = passportManager.getPassport();
      setPassport(updatedPassport);
    } catch (err) {
      console.error('플랫폼 연결 오류:', err);
    }
  }, []);

  useEffect(() => {
    loadPassport();
  }, [loadPassport]);

  return {
    passport,
    loading,
    error,
    updateTrustScore,
    addCueTokens,
    connectPlatform,
    refresh: loadPassport
  };
};
