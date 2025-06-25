// =============================================================================
// 🎯 AI Passport + Cue 통합 시스템 타입 정의
// =============================================================================

export interface PersonalityProfile {
  type: string;
  communicationStyle: string;
  learningPattern: string;
  workingStyle: string;
  responsePreference: string;
  decisionMaking: string;
}

export interface UnifiedDataVault {
  id: string;
  name: string;
  category: 'identity' | 'behavioral' | 'professional' | 'social' | 'preferences' | 'expertise';
  description: string;
  dataCount: number;
  cueCount: number;
  encrypted: boolean;
  lastUpdated: Date;
  accessLevel: 'public' | 'private' | 'selective';
  value: number;
  dataPoints: VaultDataPoint[];
  usageCount: number;
  sourceplatforms: string[];
}

export interface VaultDataPoint {
  key: string;
  value: any;
  source: string;
  timestamp?: Date;
}

export interface ConnectedPlatform {
  id: string;
  name: string;
  connected: boolean;
  lastSync: Date;
  cueCount: number;
  contextMined: number;
  status: 'active' | 'syncing' | 'error' | 'connecting';
  icon: string;
  color: string;
  connectionSteps?: string[];
}

export interface PersonalizedAgent {
  id: string;
  name: string;
  type: 'coding' | 'creative' | 'analysis' | 'consultation' | 'research' | 'mentor';
  description: string;
  checkpoint: string;
  trainingStatus: 'idle' | 'training' | 'validating' | 'ready' | 'deployed';
  trainingProgress: number;
  accuracy: number;
  totalTrainingTime: number;
  datasetSize: number;
  lastTrained: Date;
  usageCount: number;
  specialties: string[];
  modelVersion: string;
  checkpointHistory: CheckpointInfo[];
  personalityWeights: Record<string, number>;
  performanceMetrics: AgentPerformanceMetrics;
}

export interface CheckpointInfo {
  id: string;
  version: string;
  timestamp: Date;
  accuracy: number;
  loss: number;
  dataSize: number;
  description: string;
  isActive: boolean;
}

export interface AgentPerformanceMetrics {
  responseTime: number;
  userSatisfaction: number;
  taskSuccess: number;
  adaptability: number;
}

export interface TrainingSession {
  id: string;
  agentId: string;
  startTime: Date;
  endTime?: Date;
  status: 'preparing' | 'training' | 'validating' | 'saving' | 'complete' | 'error';
  currentEpoch: number;
  totalEpochs: number;
  currentLoss: number;
  bestAccuracy: number;
  logs: TrainingLog[];
}

export interface TrainingLog {
  timestamp: Date;
  epoch: number;
  loss: number;
  accuracy: number;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
}

export interface UnifiedAIPassport {
  did: string;
  walletAddress: string;
  passkeyRegistered: boolean;
  trustScore: number;
  cueTokens: number;
  registrationStatus: 'pending' | 'verified' | 'complete';
  biometricVerified: boolean;
  passportLevel: 'Basic' | 'Verified' | 'Premium' | 'Enterprise';
  personalityProfile: PersonalityProfile;
  dataVaults: UnifiedDataVault[];
  connectedPlatforms: ConnectedPlatform[];
  contextHistory: ContextEntry[];
  cueHistory: CueEntry[];
  personalizedAgents: PersonalizedAgent[];
  activeTrainingSession?: TrainingSession;
}

export interface ContextEntry {
  id: string;
  content: string;
  timestamp: Date;
  platform: string;
  cueValue: number;
}

export interface CueEntry {
  id: string;
  amount: number;
  type: 'mined' | 'earned' | 'spent';
  timestamp: Date;
  description: string;
  platform?: string;
}

export interface Message {
  id: string;
  content: string;
  type: 'user' | 'ai';
  timestamp: Date;
  usedPassportData?: string[];
  cueTokensUsed?: number;
  cueTokensEarned?: number;
  verification?: MessageVerification;
}

export interface MessageVerification {
  biometric: boolean;
  did: boolean;
  signature: string;
}

export interface ExtractionStep {
  id: number;
  text: string;
  type: 'system' | 'scanning' | 'found' | 'processing' | 'analysis' | 'storage' | 'reward' | 'complete';
  completed: boolean;
  timestamp: Date;
  data?: any;
}

export interface SyncStep {
  id: number;
  progress: number;
  text: string;
  detail: string;
  platform?: string;
  success?: boolean;
}

export interface ActivityEntry {
  id: number;
  action: string;
  timestamp: Date;
  status: 'completed' | 'processing' | 'error';
  type?: string;
  platform?: string;
}
