// =============================================================================
// ⚙️ Zauri + AI Passport 통합 시스템 설정
// =============================================================================

export const config = {
  // 🔐 인증 설정
  auth: {
    webauthn: {
      rpName: 'Zauri AI Passport',
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

  // 🧠 AI 서비스 설정
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

  // 🗄️ 데이터베이스 설정
  database: {
    supabase: {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL,
      anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    }
  },

  // 🔄 Zauri 시스템 설정
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
      zrpMiningRate: 0.1
    }
  },

  // 🔒 AI Passport 설정
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

  // 🌐 플랫폼 연결 설정
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
        apiEndpoint: 'https://api.openai.com/v1',
        compressionRatio: 0.15
      },
      {
        id: 'claude',
        name: 'Claude',
        category: 'ai',
        apiEndpoint: 'https://api.anthropic.com/v1',
        compressionRatio: 0.12
      },
      {
        id: 'notion',
        name: 'Notion',
        category: 'productivity',
        apiEndpoint: 'https://api.notion.com/v1',
        compressionRatio: 0.18
      }
    ]
  },

  // 🎨 UI 설정
  ui: {
    theme: {
      defaultTheme: 'light',
      enableSystemTheme: true
    },
    animations: {
      duration: 300,
      easing: 'ease-in-out'
    },
    responsive: {
      breakpoints: {
        sm: 640,
        md: 768,
        lg: 1024,
        xl: 1280
      }
    }
  },

  // 🔔 알림 설정
  notifications: {
    defaultEnabled: true,
    types: {
      cuesMined: true,
      agentTraining: true,
      platformSync: true,
      securityAlerts: true
    }
  }
};

export type Config = typeof config;

// =============================================================================
// 🌐 Zauri 시스템 설정 (기존 설정에 추가)
// =============================================================================

export const zauriConfig = {
  // RAG-DAG 지식 그래프 설정
  ragDag: {
    vectorDimensions: 768,
    similarityThreshold: 0.7,
    maxConnections: 50,
    embeddingModel: 'text-embedding-3-small'
  },

  // 크로스플랫폼 동기화 설정
  sync: {
    compressionRatio: 0.15,    // 28:1 압축
    fidelityTarget: 0.88,      // 88% 의미 보존
    maxTransferSize: 1024 * 1024, // 1MB
    retryAttempts: 3,
    batchSize: 50
  },

  // 토큰 경제 설정
  tokens: {
    zauriBatchSize: 100,
    zgtStakingMinimum: 1000,
    zrpMiningRate: 0.1,
    dailyMiningLimit: 1000
  },

  // 지원 플랫폼 설정
  platforms: [
    {
      id: 'chatgpt',
      name: 'ChatGPT',
      category: 'ai',
      compressionRatio: 0.15
    },
    {
      id: 'claude',
      name: 'Claude',
      category: 'ai',
      compressionRatio: 0.12
    },
    {
      id: 'notion',
      name: 'Notion',
      category: 'productivity',
      compressionRatio: 0.18
    }
  ]
};

// 통합된 설정 export
export const integratedConfig = {
  ...config,  // 기존 설정
  zauri: zauriConfig  // Zauri 설정 추가
};

// =============================================================================
// 🌐 Zauri 시스템 설정 (기존 설정에 추가)
// =============================================================================

export const zauriConfig = {
  // RAG-DAG 지식 그래프 설정
  ragDag: {
    vectorDimensions: 768,
    similarityThreshold: 0.7,
    maxConnections: 50,
    embeddingModel: 'text-embedding-3-small'
  },

  // 크로스플랫폼 동기화 설정
  sync: {
    compressionRatio: 0.15,    // 28:1 압축
    fidelityTarget: 0.88,      // 88% 의미 보존
    maxTransferSize: 1024 * 1024, // 1MB
    retryAttempts: 3,
    batchSize: 50
  },

  // 토큰 경제 설정
  tokens: {
    zauriBatchSize: 100,
    zgtStakingMinimum: 1000,
    zrpMiningRate: 0.1,
    dailyMiningLimit: 1000
  },

  // 지원 플랫폼 설정
  platforms: [
    {
      id: 'chatgpt',
      name: 'ChatGPT',
      category: 'ai',
      compressionRatio: 0.15
    },
    {
      id: 'claude',
      name: 'Claude',
      category: 'ai',
      compressionRatio: 0.12
    },
    {
      id: 'notion',
      name: 'Notion',
      category: 'productivity',
      compressionRatio: 0.18
    }
  ]
};

// 통합된 설정 export
export const integratedConfig = {
  ...config,  // 기존 설정
  zauri: zauriConfig  // Zauri 설정 추가
};

// =============================================================================
// 🌐 Zauri 시스템 설정 (기존 설정에 추가)
// =============================================================================

export const zauriConfig = {
  // RAG-DAG 지식 그래프 설정
  ragDag: {
    vectorDimensions: 768,
    similarityThreshold: 0.7,
    maxConnections: 50,
    embeddingModel: 'text-embedding-3-small'
  },

  // 크로스플랫폼 동기화 설정
  sync: {
    compressionRatio: 0.15,    // 28:1 압축
    fidelityTarget: 0.88,      // 88% 의미 보존
    maxTransferSize: 1024 * 1024, // 1MB
    retryAttempts: 3,
    batchSize: 50
  },

  // 토큰 경제 설정
  tokens: {
    zauriBatchSize: 100,
    zgtStakingMinimum: 1000,
    zrpMiningRate: 0.1,
    dailyMiningLimit: 1000
  },

  // 지원 플랫폼 설정
  platforms: [
    {
      id: 'chatgpt',
      name: 'ChatGPT',
      category: 'ai',
      compressionRatio: 0.15
    },
    {
      id: 'claude',
      name: 'Claude',
      category: 'ai',
      compressionRatio: 0.12
    },
    {
      id: 'notion',
      name: 'Notion',
      category: 'productivity',
      compressionRatio: 0.18
    }
  ]
};

// 통합된 설정 export
export const integratedConfig = {
  ...config,  // 기존 설정
  zauri: zauriConfig  // Zauri 설정 추가
};

// =============================================================================
// 🌐 Zauri 시스템 설정 (기존 설정에 추가)
// =============================================================================

export const zauriConfig = {
  // RAG-DAG 지식 그래프 설정
  ragDag: {
    vectorDimensions: 768,
    similarityThreshold: 0.7,
    maxConnections: 50,
    embeddingModel: 'text-embedding-3-small'
  },

  // 크로스플랫폼 동기화 설정
  sync: {
    compressionRatio: 0.15,    // 28:1 압축
    fidelityTarget: 0.88,      // 88% 의미 보존
    maxTransferSize: 1024 * 1024, // 1MB
    retryAttempts: 3,
    batchSize: 50
  },

  // 토큰 경제 설정
  tokens: {
    zauriBatchSize: 100,
    zgtStakingMinimum: 1000,
    zrpMiningRate: 0.1,
    dailyMiningLimit: 1000
  },

  // 지원 플랫폼 설정
  platforms: [
    {
      id: 'chatgpt',
      name: 'ChatGPT',
      category: 'ai',
      compressionRatio: 0.15
    },
    {
      id: 'claude',
      name: 'Claude',
      category: 'ai',
      compressionRatio: 0.12
    },
    {
      id: 'notion',
      name: 'Notion',
      category: 'productivity',
      compressionRatio: 0.18
    }
  ]
};

// 통합된 설정 export
export const integratedConfig = {
  ...config,  // 기존 설정
  zauri: zauriConfig  // Zauri 설정 추가
};
