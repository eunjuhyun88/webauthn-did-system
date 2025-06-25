// =============================================================================
// 🔧 공통 타입 정의 (Zauri + AI Passport 통합)
// =============================================================================

export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface WebAuthnCredential {
  id: string;
  publicKey: string;
  algorithm: string;
  counter: number;
}

export interface DIDDocument {
  id: string;
  context: string[];
  verificationMethod: VerificationMethod[];
  authentication: string[];
}

export interface VerificationMethod {
  id: string;
  type: string;
  controller: string;
  publicKeyJwk?: any;
}

export type ViewType = 'chat' | 'dashboard' | 'passport' | 'analytics' | 'vaults' | 'platforms' | 'agents';
export type ThemeType = 'light' | 'dark' | 'system';
export type LanguageType = 'ko' | 'en' | 'ja' | 'zh';

export interface PlatformConnection {
  id: string;
  name: string;
  connected: boolean;
  lastSync: Date;
  status: 'active' | 'syncing' | 'error' | 'connecting';
  icon: string;
  category: 'ai' | 'productivity' | 'communication' | 'web3';
}
