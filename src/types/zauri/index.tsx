// =============================================================================
// 🌐 Zauri 통합 시스템 타입 정의
// =============================================================================

import { BaseEntity, PlatformConnection } from '../shared';

export interface ZauriUser extends BaseEntity {
  did: string;
  walletAddress: string;
  passkeyId: string;
  profile: UserProfile;
  agentPassport: AgentPassport;
  dataVaults: ZauriDataVault[];
  connectedPlatforms: ZauriPlatform[];
  tokenBalances: TokenBalances;
  preferences: UserPreferences;
}

export interface UserProfile {
  displayName: string;
  avatar: string;
  bio: string;
  expertise: string[];
}

export interface AgentPassport extends BaseEntity {
  name: string;
  type: string;
  did: string;
  passportNo: string;
  level: number;
  trustScore: number;
  avatar: string;
  status: 'active' | 'training' | 'idle';
  capabilities: Capability[];
  stats: AgentStats;
  personality: PersonalityProfile;
  reputationScore: number;
  stakingAmount: number;
  earningsToday: number;
}

export interface Capability {
  name: string;
  score: number;
  verified: boolean;
}

export interface AgentStats {
  totalConversations: number;
  successRate: number;
  averageResponseTime: number;
  userSatisfactionScore: number;
}

export interface PersonalityProfile {
  type: string;
  communicationStyle: string;
  learningPattern: string;
  responsePreference: string;
}

export interface ZauriDataVault extends BaseEntity {
  name: string;
  category: 'identity' | 'conversation' | 'knowledge' | 'context' | 'preference';
  description: string;
  dataCount: number;
  cueCount: number;
  encrypted: boolean;
  securityLevel: 1 | 2 | 3 | 4 | 5;
  lastUpdated: Date;
  value: number;
  ragIndex: number;
  dagComplexity: number;
}

export interface ZauriPlatform extends PlatformConnection {
  cueCount: number;
  contextMined: number;
  syncQuality: number;
  compressionRatio: number;
  connectionSteps?: string[];
}

export interface TokenBalances {
  zauri: number;    // 유틸리티 토큰
  zgt: number;      // 거버넌스 토큰
  zrp: number;      // 보상 토큰
}

export interface UserPreferences {
  theme: string;
  language: string;
  notifications: boolean;
  autoSync: boolean;
  compressionLevel: string;
  securityLevel: string;
}

export interface ContextTransfer extends BaseEntity {
  fromPlatform: string;
  toPlatform: string;
  status: 'compressing' | 'transferring' | 'decompressing' | 'applied' | 'failed';
  progress: number;
  compressionRatio: number;
  fidelityScore: number;
  transferTime: number;
  dataSize: number;
}

export interface ZauriMessage extends BaseEntity {
  content: string;
  type: 'user' | 'ai' | 'system';
  timestamp: Date;
  agentId?: string;
  contextUsed?: string[];
  ragRelevance?: number;
  compressionRatio?: number;
  tokensEarned?: number;
  platforms?: string[];
}

export interface KnowledgeNode extends BaseEntity {
  content: string;
  embedding: number[];
  metadata: Record<string, any>;
  connections: string[];
  relevanceScore: number;
}

export interface SyncContext {
  content: string;
  metadata: Record<string, any>;
  platform: string;
  timestamp: Date;
}
