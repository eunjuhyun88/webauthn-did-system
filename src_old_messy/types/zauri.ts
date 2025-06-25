// =============================================================================
// 🌐 Zauri 시스템 타입 정의 (기존 GitHub 구조에 추가)
// =============================================================================

// 기존 타입들과 호환되는 Zauri 확장 타입
export interface ZauriUser {
  id: string;
  did: string;  // 기존 DID 시스템과 연동
  walletAddress: string;
  profile: ZauriProfile;
  agentPassport: AgentPassport;
  tokenBalances: TokenBalances;
  connectedPlatforms: ZauriPlatform[];
}

export interface ZauriProfile {
  displayName: string;
  avatar: string;
  bio: string;
  expertise: string[];
}

export interface AgentPassport {
  id: string;
  name: string;
  level: number;
  trustScore: number;
  status: 'active' | 'training' | 'idle';
  capabilities: string[];
  earningsToday: number;
}

export interface TokenBalances {
  zauri: number;    // 유틸리티 토큰
  zgt: number;      // 거버넌스 토큰
  zrp: number;      // 보상 토큰
}

export interface ZauriPlatform {
  id: string;
  name: string;
  category: 'ai' | 'productivity' | 'communication' | 'web3';
  connected: boolean;
  lastSync: Date;
  syncQuality: number;
  compressionRatio: number;
}

export interface ContextTransfer {
  id: string;
  fromPlatform: string;
  toPlatform: string;
  status: 'compressing' | 'transferring' | 'applied' | 'failed';
  progress: number;
  compressionRatio: number;
  fidelityScore: number;
}

export interface ZauriMessage {
  id: string;
  content: string;
  type: 'user' | 'ai' | 'system';
  timestamp: Date;
  ragRelevance?: number;
  tokensEarned?: number;
  platforms?: string[];
}

// RAG-DAG 지식 그래프 타입
export interface KnowledgeNode {
  id: string;
  content: string;
  embedding: number[];
  metadata: Record<string, any>;
  connections: string[];
  relevanceScore: number;
}
