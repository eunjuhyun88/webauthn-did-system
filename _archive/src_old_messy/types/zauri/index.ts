// =============================================================================
// 🌐 Zauri 통합 시스템 타입 정의
// =============================================================================

export interface ZauriUser {
  did: string;
  walletAddress: string;
  passkeyId: string;
  profile: UserProfile;
  agentPassport: AgentPassport;
  dataVaults: DataVault[];
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

export interface AgentPassport {
  id: string;
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

export interface DataVault {
  id: string;
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

export interface ZauriPlatform {
  id: string;
  name: string;
  category: 'ai' | 'productivity' | 'communication' | 'web3';
  connected: boolean;
  lastSync: Date;
  cueCount: number;
  contextMined: number;
  status: 'active' | 'syncing' | 'error' | 'connecting';
  icon: string;
  syncQuality: number;
  compressionRatio: number;
}

export interface TokenBalances {
  zauri: number;
  zgt: number;
  zrp: number;
}

export interface UserPreferences {
  theme: string;
  language: string;
  notifications: boolean;
  autoSync: boolean;
  compressionLevel: string;
  securityLevel: string;
}

export interface ContextTransfer {
  id: string;
  fromPlatform: string;
  toPlatform: string;
  status: 'compressing' | 'transferring' | 'decompressing' | 'applied' | 'failed';
  progress: number;
  compressionRatio: number;
  fidelityScore: number;
  transferTime: number;
  dataSize: number;
}

export interface Message {
  id: string;
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
