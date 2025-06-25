'use client';

import { useState, useEffect } from 'react';
import { UnifiedAIPassport } from '@/types/passport';
import { dataVaultManager } from '@/lib/passport/data-vault';

export const useAIPassport = () => {
  const [passport, setPassport] = useState<UnifiedAIPassport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPassport();
  }, []);

  const loadPassport = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // 실제 환경에서는 API 호출
      const mockPassport: UnifiedAIPassport = {
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
        dataVaults: [],
        connectedPlatforms: [],
        personalizedAgents: []
      };
      
      setPassport(mockPassport);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load passport');
    } finally {
      setIsLoading(false);
    }
  };

  const updatePassport = async (updates: Partial<UnifiedAIPassport>) => {
    if (!passport) return;
    
    try {
      const updatedPassport = { ...passport, ...updates };
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
  };

  const addCueTokens = (amount: number) => {
    if (!passport) return;
    updatePassport({ cueTokens: passport.cueTokens + amount });
  };

  return {
    passport,
    isLoading,
    error,
    loadPassport,
    updatePassport,
    addCueTokens
  };
};
