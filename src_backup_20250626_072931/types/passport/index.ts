// =============================================================================
// 🎯 AI Passport 시스템 타입 정의
// =============================================================================

import { BaseEntity, PlatformConnection } from '../shared';

export interface PersonalityProfile {
  type: string;
  communicationStyle: string;
  learningPattern: string;
  workingStyle: string;
  responsePreference: string;
  decisionMaking: string;
}

export interface DataVault extends BaseEntity {
  name: string;
  category: 'identity' | 'behavioral' | 'professional' | 'social' | 'preferences' | 'expertise';
  description: string;
  dataCount: number;
  cueCount: number;
  encrypted: boolean;
  accessLevel: 'public' | 'private' | 'selective';
  value: number;
  dataPoints: VaultDataPoint[];
  usageCount: number;
  sourcePlatforms: string[];
  securityLevel: 1 | 2 | 3 | 4 | 5;
  ragIndex: number;
  dagComplexity: number;
}

export interface VaultDataPoint {
  key: string;
  value: any;
  source: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface PersonalizedAgent extends BaseEntity {
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

export interface TrainingSession extends BaseEntity {
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

export interface AIPassport extends BaseEntity {
  did: string;
  walletAddress: string;
  passkeyRegistered: boolean;
  trustScore: number;
  cueTokens: number;
  registrationStatus: 'pending' | 'verified' | 'complete';
  biometricVerified: boolean;
  passportLevel: 'Basic' | 'Verified' | 'Premium' | 'Enterprise';
  personalityProfile: PersonalityProfile;
  dataVaults: DataVault[];
  connectedPlatforms: PlatformConnection[];
  personalizedAgents: PersonalizedAgent[];
  activeTrainingSession?: TrainingSession;
}

export interface Message extends BaseEntity {
  content: string;
  type: 'user' | 'ai' | 'system';
  timestamp: Date;
  usedPassportData?: string[];
  cueTokensUsed?: number;
  cueTokensEarned?: number;
  verification?: {
    biometric: boolean;
    did: boolean;
    signature: string;
  };
}
