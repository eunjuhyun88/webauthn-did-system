'use client';

import { useState, useEffect, useCallback } from 'react';
import { AIPassport, DataVault, PersonalizedAgent } from '@/types/passport';
import { dataVaultManager } from '@/lib/passport/data-vault-manager';

export const useAIPassport = () => {
  const [passport, setPassport] = useState<AIPassport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock data - 실제 환경에서는 API 호출
  const mockPassport: AIPassport = {
    id: 'passport-001',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date(),
    did: 'did:cue:0x742d35Cc6460C532FAEcE1dd25073C8d2FCAE857',
    walletAddress: '0x742d35Cc6460C532FAEcE1dd25073C8d2FCAE857',
    passkeyRegistered: true,
    trustScore: 96.8,
    cueTokens: 15428,
    registrationStatus: 'complete',
    biometricVerified: true,
    passportLevel: 'Verified',
    personalityProfile: {
      type: 'INTJ-A (Architect)',
      communicationStyle: 'Direct & Technical',
      learningPattern: 'Visual + Hands-on',
      workingStyle: 'Morning Focus, Deep Work',
      responsePreference: 'Concise with examples',
      decisionMaking: 'Data-driven analysis'
    },
    dataVaults: [
      dataVaultManager.createVault({
        name: '전문 개발 지식',
        category: 'professional',
        description: '코딩, 아키텍처, 기술 스택 관련 전문성',
        securityLevel: 4
      }),
      dataVaultManager.createVault({
        name: '학습 및 행동 패턴',
        category: 'behavioral',
        description: '의사결정 스타일, 학습 방식, 작업 패턴 분석',
        securityLevel: 3
      })
    ],
    connectedPlatforms: [
      {
        id: 'chatgpt',
        name: 'ChatGPT',
        connected: true,
        lastSync: new Date(),
        status: 'active',
        icon: '🤖',
        category: 'ai'
      },
      {
        id: 'claude',
        name: 'Claude',
        connected: true,
        lastSync: new Date(),
        status: 'active',
        icon: '🧠',
        category: 'ai'
      }
    ],
    personalizedAgents: []
  };

  useEffect(() => {
    loadPassport();
  }, []);

  const loadPassport = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // 실제 환경에서는 API 호출
      await new Promise(resolve => setTimeout(resolve, 1000)); // 로딩 시뮬레이션
      setPassport(mockPassport);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load passport');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updatePassport = useCallback(async (updates: Partial<AIPassport>) => {
    if (!passport) return;
    
    try {
      const updatedPassport = { ...passport, ...updates, updatedAt: new Date() };
      setPassport(updatedPassport);
      
      // 실제 환경에서는 API 호출
      await fetch('/api/passport/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update passport');
    }
  }, [passport]);

  const addCueTokens = useCallback((amount: number) => {
    if (!passport) return;
    updatePassport({ cueTokens: passport.cueTokens + amount });
  }, [passport, updatePassport]);

  const addDataVault = useCallback((vaultConfig: Partial<DataVault>) => {
    if (!passport) return;
    
    const newVault = dataVaultManager.createVault(vaultConfig);
    updatePassport({ 
      dataVaults: [...passport.dataVaults, newVault] 
    });
  }, [passport, updatePassport]);

  const updateTrustScore = useCallback((newScore: number) => {
    updatePassport({ trustScore: newScore });
  }, [updatePassport]);

  return {
    passport,
    isLoading,
    error,
    loadPassport,
    updatePassport,
    addCueTokens,
    addDataVault,
    updateTrustScore
  };
};
