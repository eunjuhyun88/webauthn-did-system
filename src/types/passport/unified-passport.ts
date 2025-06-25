// =============================================================================
// 📝 Unified Passport 타입 정의
// =============================================================================

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    tokens?: number;
    model?: string;
    confidence?: number;
  };
}

export interface PassportVault {
  id: string;
  name: string;
  type: 'personal' | 'professional' | 'creative';
  size: number;
  encrypted: boolean;
  lastAccess: Date;
}

export interface BiometricProfile {
  enabled: boolean;
  methods: ('fingerprint' | 'face' | 'voice')[];
  lastAuth: Date;
  successRate: number;
}

export interface UnifiedPassport {
  id: string;
  did: string;
  owner: {
    name: string;
    email: string;
    avatar?: string;
  };
  biometric: BiometricProfile;
  vaults: PassportVault[];
  tokens: {
    cue: number;
    zauri: number;
    trust: number;
  };
  trustScore: number;
  analytics: {
    totalInteractions: number;
    platformsConnected: number;
    dataProcessed: number;
  };
  lastUpdate: Date;
  createdAt: Date;
}

export interface PassportState {
  passport: UnifiedPassport | null;
  isLoading: boolean;
  error: string | null;
}

export type PassportAction = 
  | { type: 'SET_PASSPORT'; payload: UnifiedPassport }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'UPDATE_TOKENS'; payload: Partial<UnifiedPassport['tokens']> }
  | { type: 'UPDATE_TRUST_SCORE'; payload: number };
