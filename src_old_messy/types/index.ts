// =============================================================================
// 🎯 Fusion AI Dashboard 핵심 타입 정의
// 기존 webauthn_interface_integration.ts 기반 100% 호환
// =============================================================================

// =============================================================================
// 🔐 인증 시스템 타입 (기존 인터페이스 확장)
// =============================================================================

export interface User {
  readonly id: string;
  readonly did?: string; // WebAuthn으로 생성된 DID
  readonly email: string;
  readonly displayName: string;
  readonly authMethod: 'google' | 'webauthn' | 'demo';
  readonly avatar?: string;
  readonly subscription: 'free' | 'pro' | 'enterprise';
  readonly preferences: UserPreferences;
  readonly agentProfile?: AgentProfile;
  readonly tokens?: {
    accessToken: string;
    refreshToken: string;
    expiresAt: number;
  };
  // 🚀 WebAuthn 확장 필드들 (선택사항)
  readonly webauthnCredentials?: WebAuthnCredential[];
  readonly securityLevel?: 'basic' | 'enhanced' | 'enterprise';
  readonly trustScore?: number;
  readonly lastAuthAt?: Date;
}

export interface UserCredentials {
  readonly email: string;
  readonly challenge?: string;
  readonly credentialId?: string;
  readonly signature?: string;
}

export interface AuthResult {
  readonly success: boolean;
  readonly userId?: string;
  readonly token?: string;
  readonly expiresAt?: number;
  // 🚀 WebAuthn 확장 필드들 (선택사항)
  readonly passkeyId?: string;
  readonly authenticatorType?: 'platform' | 'roaming';
  readonly biometricUsed?: boolean;
  readonly did?: string;
}

export interface UserData {
  readonly userId: string;
  readonly username: string;
  readonly displayName: string;
  readonly email?: string;
}

// =============================================================================
// 🔐 WebAuthn 특화 타입들
// =============================================================================

export interface WebAuthnCredential {
  readonly id: string;
  readonly credentialId: string;
  readonly publicKey: string;
  readonly counter: number;
  readonly deviceName?: string;
  readonly isActive: boolean;
  readonly lastUsedAt?: Date;
  readonly createdAt: Date;
}

export interface WebAuthnCapabilities {
  readonly supported: boolean;
  readonly platformAuthenticator: boolean;
  readonly conditionalMediation: boolean;
  readonly biometricType: string;
  readonly securityLevel: 'basic' | 'enhanced' | 'maximum';
  readonly features: string[];
}

// =============================================================================
// 🧠 AI 및 대화 시스템 타입
// =============================================================================

export interface Message {
  readonly id: string;
  readonly content: string;
  readonly type: 'user' | 'ai' | 'system';
  readonly timestamp: Date;
  readonly agent?: string;
  readonly confidence?: number;
  readonly personalizedScore?: number;
  readonly contextUsed?: string[];
  readonly reasoning?: string;
  readonly citations?: Citation[];
  readonly attachments?: Attachment[];
  readonly reactions?: Reaction[];
  readonly status: 'sending' | 'sent' | 'delivered' | 'error';
}

export interface Citation {
  readonly source: string;
  readonly url?: string;
  readonly confidence: number;
  readonly type: 'web' | 'document' | 'email' | 'calendar';
}

export interface Attachment {
  readonly id: string;
  readonly type: 'image' | 'document' | 'code' | 'audio';
  readonly url: string;
  readonly size: number;
  readonly name: string;
}

export interface Reaction {
  readonly emoji: string;
  readonly count: number;
  readonly users: string[];
}

// =============================================================================
// 🤖 AI 에이전트 시스템 타입
// =============================================================================

export interface AgentProfile {
  readonly name: string;
  readonly type: string;
  readonly did: string;
  readonly passportNo: string;
  readonly status: 'active' | 'inactive' | 'learning' | 'maintenance';
  readonly level: number;
  readonly trustScore: number;
  readonly avatar: string;
  readonly skills: AgentSkill[];
  readonly stats: AgentStats;
  readonly recent: ActivityItem[];
  readonly security: SecurityProfile;
  readonly certifications: Certification[];
  readonly learningGoals: LearningGoal[];
}

export interface AgentSkill {
  readonly id: string;
  readonly name: string;
  readonly score: number;
  readonly trend: number;
  readonly category: 'AI' | 'Integration' | 'UX' | 'Security' | 'Analytics';
  readonly lastUpdated: Date;
  readonly description: string;
  readonly relatedSkills: string[];
}

export interface AgentStats {
  readonly contextScore: number;
  readonly totalConversations: number;
  readonly learnedCues: number;
  readonly platformConnections: number;
  readonly dataOwnershipScore: number;
  readonly crossPlatformSyncs: number;
  readonly weeklyGrowth: number;
  readonly efficiency: number;
  readonly interactions: number;
  readonly successRate: number;
  readonly responseTime: number;
  readonly solved: number;
  readonly uptime: number;
  readonly lastActive: Date;
}

export interface SecurityProfile {
  readonly verified: boolean;
  readonly lastCheck: string;
  readonly certifications: string[];
  readonly securityLevel: 'A' | 'S' | 'SS' | 'SSS';
  readonly threatLevel: 'low' | 'medium' | 'high';
  readonly verifications: SecurityVerification[];
  readonly auditLog: AuditEntry[];
  readonly backupStatus: 'current' | 'outdated' | 'failed';
}

export interface SecurityVerification {
  readonly name: string;
  readonly status: boolean;
  readonly score: number;
  readonly lastCheck: Date;
  readonly details: string;
}

export interface AuditEntry {
  readonly id: string;
  readonly action: string;
  readonly timestamp: Date;
  readonly ip: string;
  readonly userAgent: string;
  readonly status: 'success' | 'failure' | 'warning';
}

// =============================================================================
// 🎯 Cue System 핵심 타입들 (기존 인터페이스 활용)
// =============================================================================

export interface Cue {
  readonly id: string;
  readonly prompt: string;
  readonly response: string;
  readonly platform: Platform;
  readonly timestamp: number;
  readonly metadata: CueMetadata & {
    // 🚀 WebAuthn 관련 필드들 (선택사항)
    signature?: string;
    verified?: boolean;
    passkeyId?: string;
    deviceId?: string;
  };
  readonly userId: string;
}

export interface CueMetadata {
  readonly importance: number;
  readonly topics: string[];
  readonly complexity: number;
  readonly confidence: number;
  readonly language: string;
  readonly culturalContext?: string;
}

export type Platform = 
  | 'chatgpt' 
  | 'claude' 
  | 'gemini' 
  | 'discord' 
  | 'slack' 
  | 'gmail' 
  | 'calendar'
  | 'notion'
  | 'github'
  | 'linear'
  | 'figma';

export interface Conversation {
  readonly id: string;
  readonly messages: Message[];
  readonly platform: Platform;
  readonly userId: string;
  readonly startedAt: Date;
  readonly updatedAt: Date;
  readonly metadata?: Record<string, any>;
}

export interface UserPattern {
  readonly userId: string;
  readonly patterns: PatternData[];
  readonly preferences: UserPreferences;
  readonly learnedAt: Date;
  readonly confidence: number;
}

export interface PatternData {
  readonly type: string;
  readonly frequency: number;
  readonly context: string[];
  readonly triggers: string[];
}

// =============================================================================
// 📊 스마트 인사이트 및 제안 시스템
// =============================================================================

export interface SmartSuggestion {
  readonly id: string;
  readonly type: 'question' | 'action' | 'insight' | 'automation';
  readonly text: string;
  readonly confidence: number;
  readonly category: string;
  readonly priority: 'low' | 'medium' | 'high' | 'urgent';
  readonly estimatedTime: string;
  readonly prerequisites?: string[];
}

export interface InsightCard {
  readonly id: string;
  readonly type: 'pattern' | 'prediction' | 'opportunity' | 'achievement' | 'warning';
  readonly title: string;
  readonly description: string;
  readonly actionable: boolean;
  readonly confidence: number;
  readonly impact: 'low' | 'medium' | 'high' | 'critical';
  readonly timeframe: string;
  readonly relatedContexts: string[];
  readonly trend: 'improving' | 'declining' | 'stable';
  readonly metrics?: { [key: string]: number };
}

export interface KnowledgeNode {
  readonly id: string;
  readonly topic: string;
  readonly mastery: number;
  readonly connections: string[];
  readonly recentActivity: Date;
  readonly suggestedNext: string[];
  readonly difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  readonly timeInvested: number;
  readonly sources: string[];
}

// =============================================================================
// 🔗 연결 및 동기화 시스템
// =============================================================================

export interface ConnectionStatus {
  readonly service: Platform;
  readonly connected: boolean;
  readonly lastSync: Date | null;
  readonly dataPoints: number;
  readonly status: 'active' | 'syncing' | 'error' | 'disconnected' | 'rate_limited';
  readonly syncQuality: number;
  readonly insights: string[];
  readonly permissions: string[];
  readonly errorMessage?: string;
  readonly nextSync?: Date;
}

export interface SyncResult {
  readonly success: boolean;
  readonly syncedAt: number;
  readonly affectedPlatforms: Platform[];
  readonly conflictsResolved: number;
}

export interface ChangeEvent {
  readonly id: string;
  readonly type: string;
  readonly data: any;
  readonly timestamp: Date;
  readonly userId: string;
}

export interface ConflictInfo {
  readonly id: string;
  readonly type: string;
  readonly localData: any;
  readonly remoteData: any;
  readonly timestamp: Date;
}

export interface ConflictResolution {
  readonly resolution: 'local' | 'remote' | 'merge';
  readonly resolvedData: any;
}

export interface SyncStatus {
  readonly lastSync: Date;
  readonly syncing: boolean;
  readonly conflicts: number;
  readonly health: 'good' | 'warning' | 'error';
}

// =============================================================================
// 🔔 알림 시스템
// =============================================================================

export interface Notification {
  readonly id: string;
  readonly type: 'success' | 'error' | 'info' | 'insight' | 'warning';
  readonly title: string;
  readonly message: string;
  readonly actionable?: boolean;
  readonly action?: () => void;
  readonly priority: 'low' | 'medium' | 'high';
  readonly timestamp: Date;
  readonly read: boolean;
  readonly category: string;
}

// =============================================================================
// 🎨 사용자 경험 설정
// =============================================================================

export interface UserPreferences {
  readonly theme: 'light' | 'dark' | 'auto';
  readonly language: 'ko' | 'en' | 'ja';
  readonly notifications: boolean;
  readonly aiPersonality: 'professional' | 'friendly' | 'technical' | 'creative';
  readonly responseStyle: 'brief' | 'detailed' | 'examples';
  readonly dataRetention: '7days' | '30days' | '1year' | 'forever';
  readonly privacy: {
    shareUsageData: boolean;
    allowPersonalization: boolean;
    storageLocation: 'global' | 'region' | 'local';
  };
}

// =============================================================================
// 📈 활동 및 학습 추적
// =============================================================================

export interface ActivityItem {
  readonly id: string;
  readonly type: 'learning' | 'sync' | 'interaction' | 'achievement';
  readonly title: string;
  readonly description: string;
  readonly timestamp: Date;
  readonly metadata?: { [key: string]: any };
}

export interface Certification {
  readonly id: string;
  readonly name: string;
  readonly issuer: string;
  readonly issuedDate: Date;
  readonly expiryDate?: Date;
  readonly status: 'active' | 'expired' | 'revoked';
  readonly credentialUrl?: string;
}

export interface LearningGoal {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly targetDate: Date;
  readonly progress: number;
  readonly milestones: Milestone[];
  readonly priority: 'low' | 'medium' | 'high';
}

export interface Milestone {
  readonly id: string;
  readonly title: string;
  readonly completed: boolean;
  readonly completedDate?: Date;
}

// =============================================================================
// 🔧 시스템 설정 및 구성
// =============================================================================

export interface SystemConfig {
  readonly webauthn: {
    rpName: string;
    rpId: string;
    origin: string;
    timeout: number;
  };
  readonly ai: {
    providers: string[];
    defaultProvider: string;
    apiKeys: Record<string, string>;
  };
  readonly database: {
    url: string;
    tables: string[];
  };
  readonly features: {
    enableWebAuthn: boolean;
    enableDID: boolean;
    enableMultilingual: boolean;
    enableVoice: boolean;
    enableWebSocket: boolean;
  };
}

export interface ProcessResult {
  readonly success: boolean;
  readonly cue?: Cue;
  readonly pattern?: UserPattern;
  readonly insights?: InsightCard[];
  readonly error?: string;
}

export interface SystemStatus {
  readonly healthy: boolean;
  readonly version: string;
  readonly uptime: number;
  readonly activeUsers: number;
  readonly syncedPlatforms: number;
  readonly lastUpdate: Date;
}

// =============================================================================
// 🎯 API 응답 타입들
// =============================================================================

export interface ApiResponse<T = any> {
  readonly success: boolean;
  readonly data?: T;
  readonly error?: string;
  readonly message?: string;
}

// =============================================================================
// 💾 암호화 및 보안
// =============================================================================

export interface EncryptedData {
  readonly encrypted: string;
  readonly iv: string;
  readonly salt: string;
  readonly algorithm: string;
}

export interface CompressedPattern {
  readonly compressed: string;
  readonly algorithm: string;
  readonly originalSize: number;
  readonly compressedSize: number;
}

// =============================================================================
// 🔄 상태 변경 리스너
// =============================================================================

export type ChangeListener = (event: ChangeEvent) => void;

// =============================================================================
// 🎯 기존 인터페이스들 (100% 호환)
// =============================================================================

// ✅ 기존 IAuthService 인터페이스 - 변경 없음!
export interface IAuthService {
  authenticate(credentials: UserCredentials): Promise<AuthResult>;
  createDID(userData: UserData): Promise<string>;
  verifyUser(userId: string): Promise<boolean>;
  refreshToken(token: string): Promise<string>;
}

// ✅ 기존 ICryptoService 인터페이스 - 변경 없음!
export interface ICryptoService {
  encrypt(data: string, key: string): Promise<EncryptedData>;
  decrypt(encrypted: EncryptedData, key: string): Promise<string>;
  generateKey(): Promise<string>;
  hash(data: string): Promise<string>;
  sign(data: string, privateKey: string): Promise<string>;
  verify(data: string, signature: string, publicKey: string): Promise<boolean>;
}

// ✅ 기존 ICueEngine 인터페이스 - 변경 없음!
export interface ICueEngine {
  extract(conversation: Conversation): Promise<Cue>;
  translate(cue: Cue, targetPlatform: Platform): Promise<string>;
  learn(cues: readonly Cue[]): Promise<UserPattern>;
  compress(pattern: UserPattern): Promise<CompressedPattern>;
  decompress(compressed: CompressedPattern): Promise<UserPattern>;
}

// ✅ 기존 ISyncService 인터페이스 - 변경 없음!
export interface ISyncService {
  syncWithPeers(): Promise<SyncResult>;
  broadcast(change: ChangeEvent): Promise<void>;
  onChanged(listener: ChangeListener): () => void;
  resolveConflict(conflict: ConflictInfo): Promise<ConflictResolution>;
  getSyncStatus(): Promise<SyncStatus>;
}

// ✅ 기존 CueSystem 인터페이스 - 변경 없음!
export interface CueSystem {
  initialize(config: SystemConfig): Promise<void>;
  processConversation(conversation: Conversation): Promise<ProcessResult>;
  getUserPattern(userId: string): Promise<UserPattern | null>;
  generateContext(userId: string, platform: Platform): Promise<string>;
  getStatus(): Promise<SystemStatus>;
  shutdown(): Promise<void>;
}