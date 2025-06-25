// =============================================================================
// 👤 사용자 타입 정의 (src/types/user.ts)
// =============================================================================

import type { WebAuthnCredential, BiometricType } from './webauthn';
import type { DIDDocument } from './did';

export interface User {
  id: string;
  did: string;
  username: string;
  email?: string;
  displayName: string;
  avatar?: string;
  authMethod: AuthMethod;
  status: UserStatus;
  preferences: UserPreferences;
  profile: UserProfile;
  security: UserSecurity;
  subscription: UserSubscription;
  metadata: UserMetadata;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
}

export type AuthMethod = 'webauthn' | 'google' | 'apple' | 'demo' | 'email';
export type UserStatus = 'active' | 'suspended' | 'deactivated' | 'pending_verification';

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: 'ko' | 'en' | 'ja' | 'zh';
  timezone: string;
  notifications: NotificationPreferences;
  privacy: PrivacySettings;
  ai: AIPreferences;
  accessibility: AccessibilitySettings;
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  inApp: boolean;
  security: boolean;
  updates: boolean;
  marketing: boolean;
  frequency: 'realtime' | 'hourly' | 'daily' | 'weekly';
}

export interface PrivacySettings {
  shareUsageData: boolean;
  allowPersonalization: boolean;
  storageLocation: 'global' | 'region' | 'local';
  dataRetention: '7days' | '30days' | '1year' | 'forever';
  thirdPartySharing: boolean;
  analyticsOptOut: boolean;
}

export interface AIPreferences {
  defaultProvider: 'openai' | 'claude' | 'gemini' | 'auto';
  personality: 'professional' | 'friendly' | 'technical' | 'creative';
  responseStyle: 'brief' | 'detailed' | 'examples';
  maxTokens: number;
  temperature: number;
  contextLength: number;
  voiceEnabled: boolean;
  multimodalEnabled: boolean;
}

export interface AccessibilitySettings {
  highContrast: boolean;
  largeText: boolean;
  reduceMotion: boolean;
  screenReader: boolean;
  keyboardNavigation: boolean;
  colorBlindSupport: 'none' | 'deuteranopia' | 'protanopia' | 'tritanopia';
}

export interface UserProfile {
  bio?: string;
  occupation?: string;
  location?: string;
  website?: string;
  socialLinks: SocialLinks;
  interests: string[];
  skills: string[];
  goals: string[];
  experience: ExperienceLevel;
}

export interface SocialLinks {
  twitter?: string;
  linkedin?: string;
  github?: string;
  discord?: string;
  telegram?: string;
}

export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export interface UserSecurity {
  webauthnCredentials: WebAuthnCredential[];
  biometricTypes: BiometricType[];
  twoFactorEnabled: boolean;
  recoveryMethods: RecoveryMethod[];
  securityLevel: SecurityLevel;
  loginAttempts: LoginAttempt[];
  deviceTrust: DeviceTrust[];
}

export type SecurityLevel = 'basic' | 'enhanced' | 'maximum';

export interface RecoveryMethod {
  id: string;
  type: 'email' | 'phone' | 'backup_codes' | 'recovery_key';
  value: string;
  verified: boolean;
  createdAt: Date;
}

export interface LoginAttempt {
  id: string;
  timestamp: Date;
  method: AuthMethod;
  success: boolean;
  ipAddress: string;
  userAgent: string;
  location?: string;
  errorReason?: string;
}

export interface DeviceTrust {
  id: string;
  deviceId: string;
  name: string;
  type: 'mobile' | 'desktop' | 'tablet' | 'unknown';
  trusted: boolean;
  firstSeen: Date;
  lastSeen: Date;
  fingerprint: string;
}

export interface UserSubscription {
  tier: 'free' | 'pro' | 'enterprise';
  status: 'active' | 'canceled' | 'past_due' | 'trialing';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  features: SubscriptionFeatures;
  usage: UsageMetrics;
  billing: BillingInfo;
}

export interface SubscriptionFeatures {
  maxConversations: number;
  maxCredentials: number;
  aiModelsAccess: string[];
  advancedAnalytics: boolean;
  prioritySupport: boolean;
  customIntegrations: boolean;
  apiAccess: boolean;
  storageLimit: number; // in MB
}

export interface UsageMetrics {
  conversationsThisMonth: number;
  tokensUsedThisMonth: number;
  apiCallsThisMonth: number;
  storageUsed: number;
  lastResetDate: Date;
}

export interface BillingInfo {
  customerId?: string;
  subscriptionId?: string;
  paymentMethod?: string;
  nextBillingDate?: Date;
  amount?: number;
  currency: string;
}

export interface UserMetadata {
  source: 'organic' | 'referral' | 'marketing' | 'api';
  referralCode?: string;
  originalDomain?: string;
  experiments: string[];
  flags: Record<string, boolean>;
  analytics: {
    firstVisit: Date;
    sessionCount: number;
    totalTimeSpent: number; // in seconds
    lastActivity: Date;
  };
}

// =============================================================================
// 🗄️ 데이터베이스 타입 정의 (src/types/database.ts)
// =============================================================================

export interface DatabaseConfig {
  url: string;
  apiKey: string;
  serviceRoleKey?: string;
  maxConnections: number;
  connectionTimeout: number;
  enableRLS: boolean;
}

export interface Repository<T, K = string> {
  create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T>;
  findById(id: K): Promise<T | null>;
  findMany(filters?: FilterOptions<T>): Promise<T[]>;
  update(id: K, updates: Partial<T>): Promise<T | null>;
  delete(id: K): Promise<boolean>;
  count(filters?: FilterOptions<T>): Promise<number>;
}

export interface FilterOptions<T> {
  where?: Partial<T>;
  orderBy?: Array<{ field: keyof T; direction: 'asc' | 'desc' }>;
  limit?: number;
  offset?: number;
  include?: string[];
}

export interface DatabaseTransaction {
  commit(): Promise<void>;
  rollback(): Promise<void>;
  query<T>(sql: string, params?: any[]): Promise<T[]>;
}

export interface DatabaseMigration {
  id: string;
  name: string;
  version: number;
  up: string;
  down: string;
  appliedAt?: Date;
}

// =============================================================================
// 🤖 AI 타입 정의 (src/types/ai.ts)
// =============================================================================

export interface AIMessage {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: AIMessageMetadata;
  attachments?: AIAttachment[];
  status: 'sending' | 'sent' | 'delivered' | 'error';
}

export interface AIMessageMetadata {
  provider?: AIProvider;
  model?: string;
  tokensUsed?: number;
  processingTime?: number;
  confidence?: number;
  personalizedScore?: number;
  contextUsed?: string[];
  reasoning?: string;
  citations?: Citation[];
  temperature?: number;
  maxTokens?: number;
}

export interface AIAttachment {
  id: string;
  type: 'image' | 'document' | 'audio' | 'video' | 'code';
  url: string;
  filename: string;
  size: number;
  mimeType: string;
  metadata?: Record<string, any>;
}

export interface Citation {
  source: string;
  url?: string;
  confidence: number;
  type: 'web' | 'document' | 'email' | 'calendar' | 'internal';
  snippet?: string;
}

export type AIProvider = 'openai' | 'claude' | 'gemini' | 'huggingface' | 'local';

export interface AIConversation {
  id: string;
  userId: string;
  title: string;
  messages: AIMessage[];
  settings: ConversationSettings;
  analytics: ConversationAnalytics;
  tags: string[];
  status: 'active' | 'archived' | 'deleted';
  createdAt: Date;
  updatedAt: Date;
  lastMessageAt?: Date;
}

export interface ConversationSettings {
  provider: AIProvider;
  model: string;
  systemPrompt?: string;
  temperature: number;
  maxTokens: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  contextLength: number;
  enablePersonalization: boolean;
  enableCitations: boolean;
}

export interface ConversationAnalytics {
  messageCount: number;
  totalTokens: number;
  averageResponseTime: number;
  userSatisfaction?: number;
  topicsDiscussed: string[];
  sentimentScore?: number;
  engagementScore: number;
}

export interface AIService {
  provider: AIProvider;
  name: string;
  models: AIModel[];
  config: AIServiceConfig;
  status: 'available' | 'unavailable' | 'rate_limited' | 'error';
  healthCheck(): Promise<boolean>;
  sendMessage(messages: AIMessage[], settings: ConversationSettings): Promise<AIResponse>;
}

export interface AIModel {
  id: string;
  name: string;
  description: string;
  maxTokens: number;
  supportedFeatures: AIFeature[];
  costPerToken: number;
  isMultimodal: boolean;
}

export type AIFeature = 
  | 'text_generation'
  | 'code_generation'
  | 'image_analysis'
  | 'function_calling'
  | 'embeddings'
  | 'fine_tuning';

export interface AIServiceConfig {
  apiKey: string;
  baseURL?: string;
  maxRetries: number;
  timeout: number;
  rateLimit: {
    requestsPerMinute: number;
    tokensPerMinute: number;
  };
}

export interface AIResponse {
  success: boolean;
  message?: string;
  tokensUsed?: number;
  processingTime?: number;
  error?: string;
  provider: AIProvider;
  model: string;
  confidence?: number;
  citations?: Citation[];
}

export interface AgentProfile {
  id: string;
  userId: string;
  name: string;
  type: string;
  did: string;
  passportNo: string;
  avatar: string;
  status: 'active' | 'inactive' | 'learning' | 'maintenance';
  level: number;
  trustScore: number;
  skills: AgentSkill[];
  stats: AgentStats;
  personality: AgentPersonality;
  capabilities: AgentCapability[];
  learningGoals: LearningGoal[];
  certifications: Certification[];
  createdAt: Date;
  updatedAt: Date;
}

export interface AgentSkill {
  id: string;
  name: string;
  category: 'AI' | 'Integration' | 'UX' | 'Security' | 'Analytics' | 'Communication';
  score: number;
  maxScore: number;
  trend: number;
  lastUpdated: Date;
  description: string;
  relatedSkills: string[];
  evidence: SkillEvidence[];
}

export interface SkillEvidence {
  type: 'conversation' | 'task' | 'feedback' | 'certification';
  description: string;
  score: number;
  timestamp: Date;
  verifier?: string;
}

export interface AgentStats {
  // 성능 지표
  totalConversations: number;
  successRate: number;
  averageResponseTime: number;
  userSatisfactionScore: number;
  
  // 학습 지표
  contextScore: number;
  learnedPatterns: number;
  adaptationRate: number;
  
  // 연결성 지표
  platformConnections: number;
  dataPoints: number;
  integrationHealth: number;
  
  // 신뢰성 지표
  uptime: number;
  errorRate: number;
  securityScore: number;
  
  // 활동 지표
  lastActive: Date;
  weeklyGrowth: number;
  monthlyImprovement: number;
}

export interface AgentPersonality {
  traits: PersonalityTrait[];
  communicationStyle: 'formal' | 'casual' | 'technical' | 'friendly' | 'professional';
  responsePattern: 'detailed' | 'concise' | 'examples' | 'step_by_step';
  humor: number; // 0-100
  empathy: number; // 0-100
  creativity: number; // 0-100
  assertiveness: number; // 0-100
}

export interface PersonalityTrait {
  name: string;
  value: number; // 0-100
  description: string;
}

export interface AgentCapability {
  id: string;
  name: string;
  type: 'core' | 'learned' | 'integrated';
  description: string;
  enabled: boolean;
  confidence: number;
  dependencies: string[];
  lastUsed?: Date;
}

export interface LearningGoal {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  targetDate: Date;
  progress: number;
  milestones: Milestone[];
  strategies: LearningStrategy[];
  metrics: LearningMetric[];
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  completedDate?: Date;
  evidence?: string[];
}

export interface LearningStrategy {
  type: 'observation' | 'practice' | 'feedback' | 'exploration';
  description: string;
  effectiveness: number;
}

export interface LearningMetric {
  name: string;
  currentValue: number;
  targetValue: number;
  unit: string;
  trend: 'improving' | 'stable' | 'declining';
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  type: 'skill' | 'security' | 'compliance' | 'performance';
  level: 'bronze' | 'silver' | 'gold' | 'platinum';
  issuedDate: Date;
  expiryDate?: Date;
  status: 'active' | 'expired' | 'revoked' | 'suspended';
  credentialUrl?: string;
  verificationHash?: string;
}

// =============================================================================
// 🔗 통합 시스템 타입들
// =============================================================================

export interface SystemHealth {
  overall: 'healthy' | 'degraded' | 'down';
  components: ComponentHealth[];
  lastCheck: Date;
  uptime: number;
  performance: PerformanceMetrics;
}

export interface ComponentHealth {
  name: string;
  status: 'healthy' | 'degraded' | 'down';
  responseTime?: number;
  errorRate?: number;
  lastCheck: Date;
  details?: string;
}

export interface PerformanceMetrics {
  averageResponseTime: number;
  requestsPerSecond: number;
  errorRate: number;
  memoryUsage: number;
  cpuUsage: number;
  diskUsage: number;
}

export interface IntegrationStatus {
  service: string;
  connected: boolean;
  lastSync: Date | null;
  dataPoints: number;
  status: 'active' | 'syncing' | 'error' | 'disconnected' | 'rate_limited';
  syncQuality: number;
  insights: string[];
  permissions: string[];
  nextSync?: Date;
  errorMessage?: string;
}

export interface NotificationSystem {
  send(notification: SystemNotification): Promise<boolean>;
  sendBulk(notifications: SystemNotification[]): Promise<boolean>;
  getHistory(userId: string, limit?: number): Promise<SystemNotification[]>;
  markAsRead(notificationId: string): Promise<boolean>;
}

export interface SystemNotification {
  id: string;
  userId: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'insight';
  title: string;
  message: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  actionable: boolean;
  action?: NotificationAction;
  metadata?: Record<string, any>;
  read: boolean;
  createdAt: Date;
  expiresAt?: Date;
}

export interface NotificationAction {
  type: 'url' | 'function' | 'api';
  label: string;
  target: string;
  parameters?: Record<string, any>;
}

// =============================================================================
// 🎯 에러 처리 타입들
// =============================================================================

export interface SystemError {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
  userId?: string;
  requestId?: string;
  stack?: string;
}

export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface ErrorHandler {
  handle(error: Error, context?: any): Promise<void>;
  log(error: SystemError): Promise<void>;
  notify(error: SystemError, severity: ErrorSeverity): Promise<void>;
}