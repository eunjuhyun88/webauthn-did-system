// ============================================================================
// 🔧 누락된 타입 정의들 - WebAuthn 인터페이스 오류 해결
// src/types/interfaces.ts
// ============================================================================

// ============================================================================
// 1. 인증 관련 타입들
// ============================================================================

/**
 * 👤 사용자 자격증명 정보
 */
export interface UserCredentials {
  readonly userId?: string;
  readonly username?: string;
  readonly challenge?: string;
  readonly origin?: string;
  readonly silent?: boolean;
  readonly timeout?: number;
  readonly userVerification?: UserVerificationRequirement;
  readonly allowCredentials?: PublicKeyCredentialDescriptor[];
}

/**
 * ✅ 인증 결과
 */
export interface AuthResult {
  readonly success: boolean;
  readonly userId?: string;
  readonly token?: string;
  readonly expiresAt?: number;
  readonly error?: string;
  // 🚀 WebAuthn 관련 필드들 (선택적)
  readonly passkeyId?: string;
  readonly authenticatorType?: 'platform' | 'roaming';
  readonly biometricUsed?: boolean;
  readonly hardwareSecured?: boolean;
  readonly deviceTrusted?: boolean;
}

/**
 * 📝 사용자 데이터 (등록용)
 */
export interface UserData {
  readonly userId: string;
  readonly username: string;
  readonly displayName: string;
  readonly email?: string;
  readonly profile?: UserProfile;
}

/**
 * 👤 사용자 프로필
 */
export interface UserProfile {
  readonly avatar?: string;
  readonly bio?: string;
  readonly preferences?: UserPreferences;
  readonly settings?: UserSettings;
}

/**
 * ⚙️ 사용자 설정
 */
export interface UserPreferences {
  readonly theme?: 'light' | 'dark' | 'auto';
  readonly language?: string;
  readonly timezone?: string;
  readonly notifications?: boolean;
}

/**
 * 🔧 사용자 시스템 설정
 */
export interface UserSettings {
  readonly autoSync?: boolean;
  readonly biometricAuth?: boolean;
  readonly privacyLevel?: 'minimal' | 'balanced' | 'strict';
}

// ============================================================================
// 2. 플랫폼 관련 타입들
// ============================================================================

/**
 * 🌐 지원되는 플랫폼들
 */
export type Platform = 
  | 'chatgpt'
  | 'claude'
  | 'gemini'
  | 'copilot'
  | 'perplexity'
  | 'discord'
  | 'telegram'
  | 'slack'
  | 'notion'
  | 'obsidian'
  | 'github'
  | 'web'
  | 'mobile'
  | 'desktop'
  | 'custom';

/**
 * 🔌 플랫폼 정보
 */
export interface PlatformInfo {
  readonly id: Platform;
  readonly name: string;
  readonly version?: string;
  readonly capabilities: PlatformCapability[];
  readonly connected: boolean;
}

/**
 * ⚡ 플랫폼 기능
 */
export interface PlatformCapability {
  readonly type: CapabilityType;
  readonly available: boolean;
  readonly version?: string;
  readonly limitations?: string[];
}

/**
 * 🔧 기능 타입
 */
export type CapabilityType = 
  | 'text_input'
  | 'voice_input'
  | 'image_input'
  | 'file_upload'
  | 'code_execution'
  | 'web_search'
  | 'memory'
  | 'persistence'
  | 'custom_instructions'
  | 'plugins'
  | 'api_access';

// ============================================================================
// 3. 대화 관련 타입들
// ============================================================================

/**
 * 💬 대화 객체
 */
export interface Conversation {
  readonly id: string;
  readonly userId: string;
  readonly platform: Platform;
  readonly prompt: string;
  readonly response: string;
  readonly timestamp: number;
  readonly metadata?: ConversationMetadata;
  readonly context?: string[];
}

/**
 * 📋 대화 메타데이터
 */
export interface ConversationMetadata {
  readonly sessionId?: string;
  readonly deviceInfo?: DeviceInfo;
  readonly location?: string;
  readonly language?: string;
  readonly model?: string;
  readonly tokens?: number;
  readonly duration?: number;
}

/**
 * 📱 디바이스 정보
 */
export interface DeviceInfo {
  readonly id: string;
  readonly type: 'mobile' | 'desktop' | 'tablet' | 'unknown';
  readonly os: string;
  readonly browser?: string;
  readonly userAgent: string;
}

// ============================================================================
// 4. Cue 시스템 관련 타입들
// ============================================================================

/**
 * 🧠 사용자 패턴
 */
export interface UserPattern {
  readonly userId: string;
  readonly interests: string[];
  readonly expertise: Record<string, number>;
  readonly questionStyle: QuestionStyle;
  readonly responsePreference: ResponsePreference;
  readonly recentContext: string[];
  readonly learningHistory: LearningEntry[];
  readonly lastUpdated: Date;
}

/**
 * 🎭 질문 스타일
 */
export type QuestionStyle = 
  | 'direct'
  | 'exploratory'  
  | 'analytical'
  | 'creative'
  | 'practical'
  | 'academic';

/**
 * 📋 응답 선호도
 */
export interface ResponsePreference {
  readonly length: 'brief' | 'detailed' | 'comprehensive';
  readonly style: 'formal' | 'casual' | 'technical' | 'friendly';
  readonly format: 'text' | 'bullet_points' | 'code' | 'examples';
  readonly complexity: 'beginner' | 'intermediate' | 'advanced' | 'expert';
}

/**
 * 📚 학습 기록
 */
export interface LearningEntry {
  readonly topic: string;
  readonly timestamp: Date;
  readonly confidence: number;
  readonly source: Platform;
  readonly outcome: 'learned' | 'clarified' | 'confused' | 'mastered';
}

/**
 * 🗜️ 압축된 패턴
 */
export interface CompressedPattern {
  readonly userId: string;
  readonly data: Uint8Array;
  readonly algorithm: string;
  readonly version: string;
  readonly signature?: string;
  readonly timestamp: Date;
}

// ============================================================================
// 5. 동기화 관련 타입들
// ============================================================================

/**
 * 🔄 동기화 결과
 */
export interface SyncResult {
  readonly success: boolean;
  readonly syncedAt: number;
  readonly affectedPlatforms: Platform[];
  readonly conflictsResolved: number;
  readonly syncDuration?: number;
  readonly errors?: string[];
}

/**
 * 📡 변경 이벤트
 */
export interface ChangeEvent {
  readonly id: string;
  readonly type: ChangeType;
  readonly userId: string;
  readonly platform: Platform;
  readonly data: unknown;
  readonly timestamp: Date;
  readonly signature?: string;
}

/**
 * 🔄 변경 타입
 */
export type ChangeType = 
  | 'cue_added'
  | 'cue_updated'
  | 'cue_deleted'
  | 'pattern_updated'
  | 'preferences_changed'
  | 'platform_connected'
  | 'platform_disconnected';

/**
 * 👂 변경 리스너
 */
export type ChangeListener = (event: ChangeEvent) => void | Promise<void>;

/**
 * ⚔️ 충돌 정보
 */
export interface ConflictInfo {
  readonly id: string;
  readonly type: 'data_conflict' | 'version_conflict' | 'timestamp_conflict';
  readonly local: unknown;
  readonly remote: unknown;
  readonly userId: string;
  readonly timestamp: Date;
}

/**
 * ✅ 충돌 해결
 */
export interface ConflictResolution {
  readonly conflictId: string;
  readonly resolution: 'use_local' | 'use_remote' | 'merge' | 'manual';
  readonly resolvedData: unknown;
  readonly timestamp: Date;
}

/**
 * 📊 동기화 상태
 */
export interface SyncStatus {
  readonly lastSyncAt?: number;
  readonly connectedPeers: number;
  readonly pendingChanges: number;
  readonly syncHealth: 'healthy' | 'degraded' | 'unhealthy';
  readonly errors?: string[];
}

// ============================================================================
// 6. 시스템 설정 및 상태
// ============================================================================

/**
 * ⚙️ 시스템 설정
 */
export interface SystemConfig {
  readonly app: AppConfig;
  readonly auth: AuthConfig;
  readonly sync: SyncConfig;
  readonly platforms: PlatformConfig[];
  readonly security: SecurityConfig;
}

/**
 * 📱 앱 설정
 */
export interface AppConfig {
  readonly name: string;
  readonly version: string;
  readonly environment: 'development' | 'staging' | 'production';
  readonly logLevel: 'debug' | 'info' | 'warn' | 'error';
  readonly features: FeatureFlags;
}

/**
 * 🎛️ 기능 플래그
 */
export interface FeatureFlags {
  readonly webauthn: boolean;
  readonly biometric: boolean;
  readonly p2pSync: boolean;
  readonly aiAnalysis: boolean;
  readonly crossPlatform: boolean;
}

/**
 * 🔐 인증 설정
 */
export interface AuthConfig {
  readonly providers: AuthProvider[];
  readonly tokenExpiry: number;
  readonly refreshThreshold: number;
  readonly biometricEnabled: boolean;
  readonly hardwareRequirement: boolean;
}

/**
 * 🏢 인증 제공자
 */
export interface AuthProvider {
  readonly type: 'webauthn' | 'oauth' | 'email' | 'demo';
  readonly enabled: boolean;
  readonly config: Record<string, unknown>;
}

/**
 * 🔄 동기화 설정
 */
export interface SyncConfig {
  readonly enabled: boolean;
  readonly interval: number;
  readonly batchSize: number;
  readonly retryAttempts: number;
  readonly p2pEnabled: boolean;
}

/**
 * 🌐 플랫폼 설정
 */
export interface PlatformConfig {
  readonly platform: Platform;
  readonly enabled: boolean;
  readonly apiKey?: string;
  readonly settings: Record<string, unknown>;
}

/**
 * 🛡️ 보안 설정
 */
export interface SecurityConfig {
  readonly encryption: EncryptionConfig;
  readonly signing: SigningConfig;
  readonly privacy: PrivacyConfig;
}

/**
 * 🔒 암호화 설정
 */
export interface EncryptionConfig {
  readonly algorithm: string;
  readonly keySize: number;
  readonly hardwareAccelerated: boolean;
}

/**
 * ✍️ 서명 설정
 */
export interface SigningConfig {
  readonly algorithm: string;
  readonly required: boolean;
  readonly webauthnOnly: boolean;
}

/**
 * 🔐 프라이버시 설정
 */
export interface PrivacyConfig {
  readonly dataMinimization: boolean;
  readonly anonymization: boolean;
  readonly retention: number; // days
}

/**
 * 📊 시스템 상태
 */
export interface SystemStatus {
  readonly healthy: boolean;
  readonly version: string;
  readonly uptime: number;
  readonly services: ServiceStatus[];
  readonly metrics: SystemMetrics;
}

/**
 * 🛠️ 서비스 상태
 */
export interface ServiceStatus {
  readonly name: string;
  readonly status: 'running' | 'stopped' | 'error' | 'degraded';
  readonly lastCheck: Date;
  readonly details?: string;
}

/**
 * 📈 시스템 메트릭
 */
export interface SystemMetrics {
  readonly activeUsers: number;
  readonly totalCues: number;
  readonly syncOperations: number;
  readonly errorRate: number;
  readonly responseTime: number;
}

// ============================================================================
// 7. 처리 결과 타입들
// ============================================================================

/**
 * ⚙️ 처리 결과
 */
export interface ProcessResult {
  readonly success: boolean;
  readonly conversationId: string;
  readonly cue?: Cue;
  readonly context?: string;
  readonly syncResult?: SyncResult;
  readonly duration: number;
  readonly error?: string;
}

/**
 * 🧠 Cue 객체 (재정의 - 인터페이스 호환성)
 */
export interface Cue {
  readonly id: string;
  readonly prompt: string;
  readonly response: string;
  readonly platform: Platform;
  readonly timestamp: number;
  readonly userId: string;
  readonly metadata: CueMetadata & {
    // 🚀 WebAuthn 관련 선택적 필드들
    signature?: string;
    verified?: boolean;
    passkeyId?: string;
    deviceId?: string;
    webauthnSecured?: boolean;
    biometricVerified?: boolean;
  };
}

/**
 * 📋 Cue 메타데이터 (기본)
 */
export interface CueMetadata {
  readonly extractedAt: Date;
  readonly confidence: number;
  readonly topics: string[];
  readonly intent: string;
  readonly complexity: number;
  readonly importance: number;
}

// ============================================================================
// 8. 암호화 관련 타입들
// ============================================================================

/**
 * 🔐 암호화된 데이터
 */
export interface EncryptedData {
  readonly data: Uint8Array;
  readonly iv: Uint8Array;
  readonly algorithm: string;
  readonly keyId?: string;
  // 🚀 WebAuthn 관련 필드들 (선택적)
  readonly webauthnSigned?: boolean;
  readonly hardwareEncrypted?: boolean;
  readonly biometricProtected?: boolean;
}

/**
 * 🔑 키 정보
 */
export interface KeyInfo {
  readonly id: string;
  readonly type: 'symmetric' | 'asymmetric' | 'webauthn';
  readonly algorithm: string;
  readonly usage: KeyUsage[];
  readonly extractable: boolean;
  readonly origin: 'generated' | 'imported' | 'derived';
}

/**
 * 🔧 키 사용 목적
 */
export type KeyUsage = 
  | 'encrypt'
  | 'decrypt'
  | 'sign'
  | 'verify'
  | 'deriveKey'
  | 'deriveBits'
  | 'wrapKey'
  | 'unwrapKey';

// ============================================================================
// 9. WebAuthn 특화 타입들 (기본)
// ============================================================================

/**
 * 🔐 사용자 검증 요구사항
 */
export type UserVerificationRequirement = 'required' | 'preferred' | 'discouraged';

/**
 * 🔑 공개키 자격증명 설명자
 */
export interface PublicKeyCredentialDescriptor {
  readonly type: 'public-key';
  readonly id: ArrayBuffer;
  readonly transports?: AuthenticatorTransport[];
}

/**
 * 📡 인증기 전송 방식
 */
export type AuthenticatorTransport = 'usb' | 'nfc' | 'ble' | 'internal';

// ============================================================================
// 10. 유틸리티 타입들
// ============================================================================

/**
 * 📅 타임스탬프 유틸리티
 */
export type Timestamp = number; // Unix timestamp

/**
 * 🆔 ID 유틸리티  
 */
export type ID = string;

/**
 * 🏷️ 태그 시스템
 */
export type Tag = string;

/**
 * 📊 신뢰도 점수 (0-1)
 */
export type ConfidenceScore = number;

/**
 * 🎯 우선순위 (1-10)
 */
export type Priority = number;

/**
 * 🔄 상태 열거형
 */
export type Status = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';

/**
 * 📝 로그 레벨
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

/**
 * 🌍 환경 타입
 */
export type Environment = 'development' | 'staging' | 'production' | 'test';

// ============================================================================
// 11. 에러 및 예외 타입들
// ============================================================================

/**
 * ❌ 시스템 에러
 */
export interface SystemError {
  readonly code: string;
  readonly message: string;
  readonly timestamp: Date;
  readonly context?: Record<string, unknown>;
  readonly stack?: string;
}

/**
 * 🚨 에러 코드
 */
export type ErrorCode = 
  | 'AUTH_FAILED'
  | 'WEBAUTHN_ERROR'
  | 'SYNC_FAILED'
  | 'PLATFORM_ERROR'
  | 'NETWORK_ERROR'
  | 'VALIDATION_ERROR'
  | 'PERMISSION_DENIED'
  | 'RATE_LIMITED'
  | 'SYSTEM_ERROR'
  | 'UNKNOWN_ERROR';

// ============================================================================
// 12. 내보내기 (Re-exports for convenience)
// ============================================================================

// 주요 타입들을 편의를 위해 재내보내기
export type {
  UserCredentials as Credentials,
  AuthResult as AuthResponse,
  UserData as RegistrationData,
  Conversation as ChatConversation,
  UserPattern as PersonalPattern,
  SyncResult as SynchronizationResult,
  ProcessResult as OperationResult
};

// 상수 내보내기
export const SUPPORTED_PLATFORMS: Platform[] = [
  'chatgpt', 'claude', 'gemini', 'copilot', 'perplexity',
  'discord', 'telegram', 'slack', 'notion', 'obsidian', 
  'github', 'web', 'mobile', 'desktop', 'custom'
];

export const DEFAULT_CONFIG: Partial<SystemConfig> = {
  app: {
    name: 'Cue System',
    version: '1.0.0',
    environment: 'production',
    logLevel: 'info',
    features: {
      webauthn: true,
      biometric: true,
      p2pSync: true,
      aiAnalysis: true,
      crossPlatform: true
    }
  }
};

// ============================================================================
// 🎯 타입 가드 함수들
// ============================================================================

/**
 * ✅ Cue 객체 검증
 */
export function isCue(obj: unknown): obj is Cue {
  return typeof obj === 'object' && obj !== null &&
    'id' in obj && 'prompt' in obj && 'response' in obj && 'platform' in obj;
}

/**
 * ✅ 플랫폼 검증
 */
export function isPlatform(str: unknown): str is Platform {
  return typeof str === 'string' && SUPPORTED_PLATFORMS.includes(str as Platform);
}

/**
 * ✅ 인증 결과 검증
 */
export function isAuthResult(obj: unknown): obj is AuthResult {
  return typeof obj === 'object' && obj !== null &&
    'success' in obj && typeof (obj as any).success === 'boolean';
}