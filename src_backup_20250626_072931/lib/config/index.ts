// =============================================================================
// 🔧 전체 시스템 설정
// 파일: src/lib/config/index.ts
// =============================================================================

// 환경 변수 타입 안전성 확보
interface EnvironmentConfig {
  // 기본 설정
  NODE_ENV: 'development' | 'production' | 'test';
  PORT: number;
  API_VERSION: string;

  // 앱 URL (ngrok 등)
  APP_URL: string;
  NGROK_TUNNEL_URL?: string;

  // WebAuthn 설정
  WEBAUTHN_RP_NAME: string;
  WEBAUTHN_RP_ID: string;
  WEBAUTHN_ORIGIN: string;

  // Supabase 설정
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  SUPABASE_JWT_SECRET: string;

  // AI 서비스
  OPENAI_API_KEY?: string;
  CLAUDE_API_KEY?: string;
  GEMINI_API_KEY?: string;
  HUGGINGFACE_API_KEY?: string;

  // Google OAuth
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  GOOGLE_API_KEY?: string;

  // JWT 설정
  JWT_SECRET: string;
  JWT_REFRESH_SECRET: string;

  // 기타 서비스
  DISCORD_BOT_TOKEN?: string;
  PINATA_API_KEY?: string;
  PINATA_SECRET?: string;

  // DID 설정
  DID_METHOD: 'web' | 'key';
  DID_NETWORK: 'production' | 'testnet';
  DID_RESOLVER_URL: string;

  // 보안 설정
  API_RATE_LIMIT: number;
  MAX_FILE_SIZE: number;
  EXTERNAL_API_TIMEOUT: number;

  // 기능 토글
  ENABLE_AI_CHAT: boolean;
  ENABLE_VOICE_INPUT: boolean;
  ENABLE_KNOWLEDGE_GRAPH: boolean;
  ENABLE_ANALYTICS: boolean;
}

// =============================================================================
// 환경 변수 로드 및 검증
// =============================================================================

function getEnvVar(key: string, defaultValue?: string): string {
  const value = process.env[key] || defaultValue;
  if (!value) {
    console.warn(`⚠️ 환경 변수 ${key}가 설정되지 않았습니다`);
    return '';
  }
  return value;
}

function getEnvNumber(key: string, defaultValue: number): number {
  const value = process.env[key];
  if (!value) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
}

function getEnvBoolean(key: string, defaultValue: boolean): boolean {
  const value = process.env[key];
  if (!value) return defaultValue;
  return value.toLowerCase() === 'true';
}

// =============================================================================
// 메인 설정 객체
// =============================================================================

export const config: EnvironmentConfig = {
  // 기본 설정
  NODE_ENV: (process.env.NODE_ENV as any) || 'development',
  PORT: getEnvNumber('PORT', 3001),
  API_VERSION: getEnvVar('API_VERSION', 'v1'),

  // 앱 URL
  APP_URL: getEnvVar('NEXT_PUBLIC_APP_URL', 'http://localhost:3001'),
  NGROK_TUNNEL_URL: getEnvVar('NGROK_TUNNEL_URL'),

  // WebAuthn 설정
  WEBAUTHN_RP_NAME: getEnvVar('WEBAUTHN_RP_NAME', 'WebAuthn DID System'),
  WEBAUTHN_RP_ID: getEnvVar('WEBAUTHN_RP_ID', 'localhost'),
  WEBAUTHN_ORIGIN: getEnvVar('WEBAUTHN_ORIGIN', 'http://localhost:3001'),

  // Supabase 설정
  SUPABASE_URL: getEnvVar('NEXT_PUBLIC_SUPABASE_URL', ''),
  SUPABASE_ANON_KEY: getEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY', ''),
  SUPABASE_SERVICE_ROLE_KEY: getEnvVar('SUPABASE_SERVICE_ROLE_KEY', ''),
  SUPABASE_JWT_SECRET: getEnvVar('SUPABASE_JWT_SECRET', ''),

  // AI 서비스
  OPENAI_API_KEY: getEnvVar('OPENAI_API_KEY'),
  CLAUDE_API_KEY: getEnvVar('CLAUDE_API_KEY'),
  GEMINI_API_KEY: getEnvVar('GEMINI_API_KEY'),
  HUGGINGFACE_API_KEY: getEnvVar('HUGGINGFACE_API_KEY'),

  // Google OAuth
  GOOGLE_CLIENT_ID: getEnvVar('GOOGLE_CLIENT_ID'),
  GOOGLE_CLIENT_SECRET: getEnvVar('GOOGLE_CLIENT_SECRET'),
  GOOGLE_API_KEY: getEnvVar('GOOGLE_API_KEY'),

  // JWT 설정
  JWT_SECRET: getEnvVar('JWT_SECRET', 'your-super-secret-jwt-key'),
  JWT_REFRESH_SECRET: getEnvVar('JWT_REFRESH_SECRET', 'your-super-secret-refresh-key'),

  // 기타 서비스
  DISCORD_BOT_TOKEN: getEnvVar('DISCORD_BOT_TOKEN'),
  PINATA_API_KEY: getEnvVar('PINATA_API_KEY'),
  PINATA_SECRET: getEnvVar('PINATA_SECRET'),

  // DID 설정
  DID_METHOD: (getEnvVar('DID_METHOD', 'web') as 'web' | 'key'),
  DID_NETWORK: (getEnvVar('DID_NETWORK', 'production') as 'production' | 'testnet'),
  DID_RESOLVER_URL: getEnvVar('DID_RESOLVER_URL', 'http://localhost:3001'),

  // 보안 설정
  API_RATE_LIMIT: getEnvNumber('API_RATE_LIMIT', 100),
  MAX_FILE_SIZE: getEnvNumber('MAX_FILE_SIZE', 10485760), // 10MB
  EXTERNAL_API_TIMEOUT: getEnvNumber('EXTERNAL_API_TIMEOUT', 30000), // 30초

  // 기능 토글
  ENABLE_AI_CHAT: getEnvBoolean('ENABLE_AI_CHAT', true),
  ENABLE_VOICE_INPUT: getEnvBoolean('ENABLE_VOICE_INPUT', true),
  ENABLE_KNOWLEDGE_GRAPH: getEnvBoolean('ENABLE_KNOWLEDGE_GRAPH', true),
  ENABLE_ANALYTICS: getEnvBoolean('ENABLE_ANALYTICS', true),
};

// =============================================================================
// 설정 검증 함수
// =============================================================================

export function validateConfig(): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 필수 설정 검증
  if (!config.SUPABASE_URL) {
    errors.push('SUPABASE_URL이 설정되지 않았습니다');
  }

  if (!config.SUPABASE_ANON_KEY) {
    errors.push('SUPABASE_ANON_KEY가 설정되지 않았습니다');
  }

  if (!config.JWT_SECRET || config.JWT_SECRET === 'your-super-secret-jwt-key') {
    warnings.push('JWT_SECRET이 기본값입니다. 운영 환경에서는 변경하세요');
  }

  // WebAuthn 설정 검증
  if (config.NODE_ENV === 'production') {
    if (!config.WEBAUTHN_ORIGIN.startsWith('https://')) {
      errors.push('운영 환경에서는 WEBAUTHN_ORIGIN이 HTTPS여야 합니다');
    }
  }

  // AI 서비스 검증
  if (!config.OPENAI_API_KEY && !config.CLAUDE_API_KEY && !config.GEMINI_API_KEY) {
    warnings.push('AI 서비스 API 키가 설정되지 않았습니다. AI 기능이 제한됩니다');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

// =============================================================================
// 런타임 설정 정보
// =============================================================================

export function getSystemInfo() {
  return {
    environment: config.NODE_ENV,
    version: process.env.npm_package_version || '1.0.0',
    port: config.PORT,
    features: {
      webauthn: true,
      did: true,
      ai: !!(config.OPENAI_API_KEY || config.CLAUDE_API_KEY || config.GEMINI_API_KEY),
      database: !!config.SUPABASE_URL,
      oauth: !!config.GOOGLE_CLIENT_ID,
    },
    urls: {
      app: config.APP_URL,
      webauthn: config.WEBAUTHN_ORIGIN,
      database: config.SUPABASE_URL ? `${config.SUPABASE_URL.substring(0, 30)}...` : 'Not configured',
    },
    timestamp: new Date().toISOString()
  };
}

// =============================================================================
// 개발용 디버그 함수
// =============================================================================

export function debugConfig() {
  if (config.NODE_ENV !== 'development') {
    console.warn('디버그 함수는 개발 환경에서만 사용하세요');
    return;
  }

  console.log('🔧 시스템 설정 디버그:');
  console.log('  환경:', config.NODE_ENV);
  console.log('  포트:', config.PORT);
  console.log('  앱 URL:', config.APP_URL);
  console.log('  WebAuthn RP ID:', config.WEBAUTHN_RP_ID);
  console.log('  Supabase URL:', config.SUPABASE_URL ? '✅ 설정됨' : '❌ 없음');
  console.log('  AI 서비스:', {
    openai: !!config.OPENAI_API_KEY,
    claude: !!config.CLAUDE_API_KEY,
    gemini: !!config.GEMINI_API_KEY,
  });

  const validation = validateConfig();
  if (validation.errors.length > 0) {
    console.error('❌ 설정 오류:', validation.errors);
  }
  if (validation.warnings.length > 0) {
    console.warn('⚠️ 설정 경고:', validation.warnings);
  }
}

// =============================================================================
// 초기화 시 설정 검증
// =============================================================================

if (typeof window === 'undefined') { // 서버에서만 실행
  const validation = validateConfig();
  
  if (validation.errors.length > 0) {
    console.error('❌ 시스템 설정 오류:');
    validation.errors.forEach(error => console.error(`  - ${error}`));
  }
  
  if (validation.warnings.length > 0) {
    console.warn('⚠️ 시스템 설정 경고:');
    validation.warnings.forEach(warning => console.warn(`  - ${warning}`));
  }

  if (config.NODE_ENV === 'development') {
    console.log('🚀 WebAuthn + DID + DB 시스템 설정 로드 완료');
    console.log(`   환경: ${config.NODE_ENV}`);
    console.log(`   포트: ${config.PORT}`);
    console.log(`   WebAuthn: ${config.WEBAUTHN_ORIGIN}`);
  }
}

// 기본 내보내기
export default config;