// =============================================================================
// 🎯 메인 애플리케이션 설정
// =============================================================================

export const APP_CONFIG = {
  name: 'AI Passport + Cue System',
  version: '1.0.0',
  description: '개인화 AI + 컨텍스트 채굴 플랫폼',
  
  // CUE 시스템 설정
  cue: {
    baseReward: 1,
    conversationReward: 3,
    dataExtractionReward: 5,
    platformConnectionReward: 10,
    maxDailyMining: 100
  },
  
  // AI 설정
  ai: {
    maxResponseLength: 2000,
    contextWindowSize: 4000,
    supportedModels: ['gpt-4', 'claude-3', 'gemini-pro'],
    defaultPersonality: 'INTJ-A'
  },
  
  // 보안 설정
  security: {
    passkey: {
      timeout: 60000,
      userVerification: 'required' as const
    },
    did: {
      network: 'ethereum',
      resolver: 'https://resolver.identity.foundation'
    }
  },
  
  // 플랫폼 설정
  platforms: {
    supported: ['chatgpt', 'claude', 'gemini', 'discord'],
    syncInterval: 300000, // 5 minutes
    maxRetries: 3
  }
} as const;

export type AppConfig = typeof APP_CONFIG;
