// =============================================================================
// 🎯 Hybrid AI Passport 타입 정의 (기존 시스템과 통합)
// =============================================================================

export interface BiometricAuthData {
  id: string;
  type: 'face' | 'voice' | 'typing' | 'mouse' | 'fingerprint' | 'retina';
  name: string;
  status: 'verified' | 'pending' | 'failed' | 'disabled';
  accuracy: number;
  lastVerified: Date;
  deviceInfo: string;
}

export interface HybridDataVault {
  id: string;
  category: 'identity' | 'communication' | 'expertise' | 'behavior';
  name: string;
  description: string;
  dataPoints: VaultDataPoint[];
  lastUpdated: Date;
  encrypted: boolean;
  accessLevel: 'always' | 'on-demand' | 'restricted';
  usageCount: number;
  dataCount: number;
  cueCount: number;
  value: number;
  sourcePlatforms: string[];
}

export interface VaultDataPoint {
  key: string;
  value: any;
  source: string;
  confidence?: number;
  updatedAt: Date;
}

export interface HybridAIPassport {
  did: string;
  biometricSignature: string;
  issuedDate: Date;
  lastAuthenticated: Date;
  walletAddress: string;
  passkeyRegistered: boolean;
  trustScore: number;
  cueTokens: number;
  registrationStatus: 'pending' | 'verified' | 'complete';
  biometricVerified: boolean;
  passportLevel: 'Basic' | 'Verified' | 'Premium' | 'Enterprise';
  dataVaults: HybridDataVault[];
  personalityProfile: PersonalityProfile;
  permissions: PassportPermissions;
  trustedPlatforms: string[];
}

export interface PersonalityProfile {
  type: string;
  communicationStyle: string;
  responsePreference: string;
  decisionMaking: string;
  workPattern: string;
  learningPattern: string;
}

export interface PassportPermissions {
  canAccessGmail: boolean;
  canAccessCalendar: boolean;
  canAccessBehavior: boolean;
  canLearnFromInteractions: boolean;
}

export interface HybridMessage {
  id: string;
  content: string;
  type: 'user' | 'ai' | 'system';
  timestamp: Date;
  usedPassportData?: string[];
  cueTokensEarned?: number;
  verification?: MessageVerification;
  metadata?: MessageMetadata;
}

export interface MessageVerification {
  biometric: boolean;
  did: boolean;
  signature: string;
}

export interface MessageMetadata {
  confidence?: number;
  processingTime?: number;
  dataSourcesUsed?: string[];
  securityLevel?: string;
  usedVaults?: HybridDataVault[];
}

export interface ActivityEntry {
  id: string | number;
  action: string;
  timestamp: Date;
  status: 'completed' | 'processing' | 'error';
  type?: string;
}

export interface HybridAuthState {
  isAuthenticated: boolean;
  isAuthenticating: boolean;
  authStep: 'initial' | 'biometric' | 'passport' | 'complete';
  isRegistering: boolean;
  registrationStep: 'passkey' | 'wallet' | 'ai-setup' | 'complete';
  user?: HybridUser;
}

export interface HybridUser {
  did: string;
  displayName: string;
  email: string;
  trustScore: number;
  securityLevel: string;
  biometrics: BiometricAuthData[];
  passport: HybridAIPassport;
}
