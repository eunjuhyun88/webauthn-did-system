// =============================================================================
// 🔧 WebAuthn + DID + AI 시스템 통합 설정
// =============================================================================

export const CONFIG = {
  // 🌐 서버 및 배포 설정
  SERVER: {
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: parseInt(process.env.PORT || '3000'),
    API_VERSION: process.env.API_VERSION || 'v1',
    BASE_URL: process.env.NEXT_PUBLIC_APP_URL || 'https://34ff-125-142-232-68.ngrok-free.app',
    WEBSOCKET_URL: process.env.NEXT_PUBLIC_APP_URL?.replace('https', 'wss') || 'wss://34ff-125-142-232-68.ngrok-free.app'
  },

  // 🔐 WebAuthn 설정 (ngrok 기반)
  WEBAUTHN: {
    RP_ID: process.env.WEBAUTHN_RP_ID || '34ff-125-142-232-68.ngrok-free.app',
    RP_NAME: process.env.WEBAUTHN_RP_NAME || 'Fusion AI System',
    ORIGIN: process.env.WEBAUTHN_ORIGIN || 'https://34ff-125-142-232-68.ngrok-free.app',
    TIMEOUT: 60000,
    USER_VERIFICATION: 'preferred' as const,
    ATTESTATION: 'none' as const,
    ALGORITHMS: [-7, -257] // ES256, RS256
  },

  // 🆔 DID 설정
  DID: {
    METHOD: process.env.DID_METHOD || 'web',
    NETWORK: process.env.DID_NETWORK || 'production',
    RESOLVER_URL: process.env.DID_RESOLVER_URL || 'https://34ff-125-142-232-68.ngrok-free.app',
    BASE_CONTEXT: 'https://www.w3.org/ns/did/v1'
  },

  // 🗄️ Supabase 설정
  SUPABASE: {
    URL: process.env.SUPABASE_URL || 'https://luqmowvevwfwqbkbahko.supabase.co',
    ANON_KEY: process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx1cW1vd3Zldndmd3Fia2JhaGtvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3MDA0ODQsImV4cCI6MjA2NjI3NjQ4NH0.SUBvP-M3FwpqbasjeMUfWwEV3ifOi_APA5DvznT26nE',
    SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
    PROJECT_ID: 'luqmowvevwfwqbkbahko'
  },

  // 🤖 AI 서비스 설정
  AI: {
    OPENAI: {
      API_KEY: process.env.OPENAI_API_KEY || '',
      MODEL: 'gpt-4-turbo-preview',
      MAX_TOKENS: 2048,
      TEMPERATURE: 0.7
    },
    CLAUDE: {
      API_KEY: process.env.CLAUDE_API_KEY || '',
      MODEL: 'claude-3-sonnet-20240229',
      MAX_TOKENS: 2048,
      TEMPERATURE: 0.7
    },
    GEMINI: {
      API_KEY: process.env.GEMINI_API_KEY || '',
      MODEL: 'gemini-2.0-flash',
      MAX_TOKENS: 2048,
      TEMPERATURE: 0.7
    },
    DEFAULT_PROVIDER: 'openai' as const
  },

  // 🔐 OAuth 설정
  GOOGLE: {
    CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '103912432221-ms5fjkeh5l5uuoi9a9rf1dm8rn11insj.apps.googleusercontent.com',
    CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || '',
    REDIRECT_URI: `${process.env.NEXT_PUBLIC_APP_URL}/auth/google/callback`
  },

  // 🔑 JWT 설정
  JWT: {
    SECRET: process.env.JWT_SECRET || 'fallback-secret-key',
    REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret',
    EXPIRES_IN: '1h',
    REFRESH_EXPIRES_IN: '7d'
  },

  // 🚀 기능 플래그
  FEATURES: {
    ENABLE_WEBAUTHN: process.env.NODE_ENV === 'production' || process.env.ENABLE_WEBAUTHN === 'true',
    ENABLE_DID: true,
    ENABLE_AI_CHAT: process.env.ENABLE_AI_CHAT === 'true',
    ENABLE_VOICE_INPUT: process.env.ENABLE_VOICE_INPUT === 'true',
    ENABLE_KNOWLEDGE_GRAPH: process.env.ENABLE_KNOWLEDGE_GRAPH === 'true',
    ENABLE_ANALYTICS: process.env.ENABLE_ANALYTICS === 'true',
    ENABLE_WEBSOCKET: true,
    ENABLE_OFFLINE: true
  },

  // 📡 외부 서비스 설정
  EXTERNAL: {
    API_TIMEOUT: parseInt(process.env.EXTERNAL_API_TIMEOUT || '30000'),
    RATE_LIMIT: parseInt(process.env.API_RATE_LIMIT || '100'),
    MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB
    ALLOWED_ORIGINS: [
      'https://34ff-125-142-232-68.ngrok-free.app',
      'http://localhost:3000',
      'http://localhost:3001'
    ]
  },

  // 🔒 보안 설정
  SECURITY: {
    BCRYPT_ROUNDS: 12,
    SESSION_TIMEOUT: 1000 * 60 * 60 * 24, // 24 hours
    MAX_LOGIN_ATTEMPTS: 5,
    LOCKOUT_TIME: 1000 * 60 * 15, // 15 minutes
    CORS_ORIGINS: [
      'https://34ff-125-142-232-68.ngrok-free.app',
      'http://localhost:3000'
    ]
  },

  // 📊 로깅 및 디버그
  LOGGING: {
    LEVEL: process.env.LOG_LEVEL || 'info',
    DEBUG: process.env.DEBUG || 'fusion-ai:*',
    ENABLE_REQUEST_LOGGING: true,
    ENABLE_ERROR_TRACKING: true
  }
} as const;

// =============================================================================
// 🔧 환경 검증
// =============================================================================
export function validateEnvironment(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // 필수 환경 변수 검증
  const required = [
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY',
    'JWT_SECRET'
  ];

  required.forEach(key => {
    if (!process.env[key]) {
      errors.push(`Missing required environment variable: ${key}`);
    }
  });

  // WebAuthn 설정 검증 (프로덕션에서만)
  if (CONFIG.FEATURES.ENABLE_WEBAUTHN) {
    if (!CONFIG.WEBAUTHN.RP_ID.includes('.') && CONFIG.SERVER.NODE_ENV === 'production') {
      errors.push('WebAuthn RP_ID must be a valid domain in production');
    }
  }

  // AI 서비스 검증 (하나 이상의 API 키 필요)
  if (CONFIG.FEATURES.ENABLE_AI_CHAT) {
    const hasAnyAIKey = CONFIG.AI.OPENAI.API_KEY || CONFIG.AI.CLAUDE.API_KEY || CONFIG.AI.GEMINI.API_KEY;
    if (!hasAnyAIKey) {
      errors.push('At least one AI service API key is required when AI chat is enabled');
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

// =============================================================================
// 🎯 개발/프로덕션 설정 오버라이드
// =============================================================================
export const isDevelopment = CONFIG.SERVER.NODE_ENV === 'development';
export const isProduction = CONFIG.SERVER.NODE_ENV === 'production';

// 개발 환경에서는 보안 설정 완화
if (isDevelopment) {
  CONFIG.SECURITY.MAX_LOGIN_ATTEMPTS = 10;
  CONFIG.SECURITY.LOCKOUT_TIME = 1000 * 60 * 5; // 5분
  CONFIG.JWT.EXPIRES_IN = '24h'; // 개발 편의
}

// =============================================================================
// 🚀 설정 내보내기
// =============================================================================
export default CONFIG;

// 타입 안전성을 위한 설정 타입 정의
export type ConfigType = typeof CONFIG;
export type FeatureFlags = typeof CONFIG.FEATURES;
export type SecurityConfig = typeof CONFIG.SECURITY;