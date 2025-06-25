// =============================================================================
// ⚙️ Zauri + AI Passport 통합 시스템 설정
// =============================================================================

export const integratedConfig = {
  // 🔐 인증 설정 (기존 WebAuthn + DID 확장)
  auth: {
    webauthn: {
      rpName: 'Zauri AI Passport Platform',
      rpId: process.env.NEXT_PUBLIC_RP_ID || 'localhost',
      origin: process.env.NEXT_PUBLIC_ORIGIN || 'http://localhost:3000',
      timeout: 60000,
      challengeTimeout: 300000
    },
    did: {
      network: process.env.NEXT_PUBLIC_DID_NETWORK || 'testnet',
      resolver: process.env.NEXT_PUBLIC_DID_RESOLVER || 'https://resolver.identity.foundation'
    }
  },

  // 🧠 AI 서비스 설정 (기존 AI 확장)
  ai: {
    openai: {
      apiKey: process.env.OPENAI_API_KEY,
      model: 'gpt-4-turbo-preview',
      maxTokens: 4000
    },
    anthropic: {
      apiKey: process.env.ANTHROPIC_API_KEY,
      model: 'claude-3-sonnet-20240229',
      maxTokens: 4000
    },
    embeddings: {
      model: 'text-embedding-3-small',
      dimensions: 768
    }
  },

  // 🗄️ 데이터베이스 설정 (기존 Supabase 확장)
  database: {
    supabase: {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL,
      anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    }
  },

  // 🎯 AI Passport 시스템 설정
  passport: {
    vault: {
      maxVaults: 10,
      maxDataPointsPerVault: 10000,
      encryptionAlgorithm: 'AES-256-GCM',
      backupInterval: 24 * 60 * 60 * 1000 // 24시간
    },
    agent: {
      maxAgents: 5,
      trainingTimeout: 30 * 60 * 1000, // 30분
      checkpointRetention: 10,
      performanceMetricsWindow: 7 * 24 * 60 * 60 * 1000 // 7일
    },
    cue: {
      miningRate: 0.5,
      qualityThreshold: 0.8,
      maxCuesPerSession: 100
    }
  },

  // 🌐 Zauri 시스템 설정
  zauri: {
    compression: {
      defaultRatio: 0.15, // 28:1 압축률
      fidelityTarget: 0.88, // 88% 의미 보존
      maxTransferSize: 1024 * 1024 // 1MB
    },
    ragDag: {
      vectorDimensions: 768,
      similarityThreshold: 0.7,
      maxConnections: 50,
      embeddingModel: 'text-embedding-3-small'
    },
    tokens: {
      zauriBatchSize: 100,
      zgtStakingMinimum: 1000,
      zrpMiningRate: 0.1,
      dailyMiningLimit: 1000
    }
  },

  // 🔄 플랫폼 연결 설정
  platforms: {
    sync: {
      interval: 5 * 60 * 1000, // 5분
      retryAttempts: 3,
      batchSize: 50
    },
    supported: [
      {
        id: 'chatgpt',
        name: 'ChatGPT',
        category: 'ai',
        compressionRatio: 0.15,
        connectionSteps: ['OpenAI API 키 설정', '권한 승인', '동기화 테스트']
      },
      {
        id: 'claude',
        name: 'Claude',
        category: 'ai',
        compressionRatio: 0.12,
        connectionSteps: ['Anthropic API 키 설정', '권한 승인', '동기화 테스트']
      },
      {
        id: 'notion',
        name: 'Notion',
        category: 'productivity',
        compressionRatio: 0.18,
        connectionSteps: ['Notion 연동 설정', '페이지 권한', '동기화 테스트']
      },
      {
        id: 'discord',
        name: 'Discord',
        category: 'communication',
        compressionRatio: 0.20,
        connectionSteps: ['Discord 봇 설치', '서버 권한 설정', '채널 선택', '활성화']
      }
    ]
  }
};

export type IntegratedConfig = typeof integratedConfig;
