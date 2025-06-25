// =============================================================================
// 🔐 WebAuthn 완전 타입 정의
// =============================================================================

import type { 
  PublicKeyCredentialCreationOptionsJSON,
  PublicKeyCredentialRequestOptionsJSON,
  RegistrationResponseJSON,
  AuthenticationResponseJSON
} from '@simplewebauthn/types';

// =============================================================================
// 기본 WebAuthn 타입들
// =============================================================================

export interface WebAuthnCredential {
  id: string;
  credentialID: string;
  publicKey: string;
  counter: number;
  deviceType: 'singleDevice' | 'multiDevice';
  backedUp: boolean;
  transports?: AuthenticatorTransport[];
  biometricType?: 'touchid' | 'faceid' | 'windowshello' | 'androidbiometric' | 'unknown';
  createdAt: Date;
  lastUsed: Date;
  nickname?: string;
  deviceInfo?: DeviceInfo;
}

export interface DeviceInfo {
  platform: string;
  browser: string;
  os: string;
  deviceName?: string;
  userAgent: string;
  ipAddress?: string;
  location?: string;
}

// =============================================================================
// WebAuthn 등록 프로세스
// =============================================================================

export interface RegistrationRequest {
  username: string;
  displayName: string;
  email?: string;
  userVerification?: UserVerificationRequirement;
  authenticatorSelection?: AuthenticatorSelectionCriteria;
  attestation?: AttestationConveyancePreference;
}

export interface RegistrationBeginResponse {
  success: boolean;
  options?: PublicKeyCredentialCreationOptionsJSON;
  challenge?: string;
  sessionId?: string;
  error?: string;
}

export interface RegistrationCompleteRequest {
  sessionId: string;
  credential: RegistrationResponseJSON;
  nickname?: string;
  deviceInfo?: DeviceInfo;
}

export interface RegistrationCompleteResponse {
  success: boolean;
  credential?: WebAuthnCredential;
  userDID?: string;
  error?: string;
  verification?: {
    verified: boolean;
    registrationInfo?: {
      credentialPublicKey: string;
      credentialID: string;
      counter: number;
      credentialDeviceType: 'singleDevice' | 'multiDevice';
      credentialBackedUp: boolean;
    };
  };
}

// =============================================================================
// WebAuthn 인증 프로세스
// =============================================================================

export interface AuthenticationRequest {
  username?: string;
  userHandle?: string;
  userVerification?: UserVerificationRequirement;
  allowCredentials?: PublicKeyCredentialDescriptor[];
}

export interface AuthenticationBeginResponse {
  success: boolean;
  options?: PublicKeyCredentialRequestOptionsJSON;
  challenge?: string;
  sessionId?: string;
  error?: string;
}

export interface AuthenticationCompleteRequest {
  sessionId: string;
  credential: AuthenticationResponseJSON;
  deviceInfo?: DeviceInfo;
}

export interface AuthenticationCompleteResponse {
  success: boolean;
  user?: {
    id: string;
    username: string;
    displayName: string;
    email?: string;
    did: string;
  };
  credential?: WebAuthnCredential;
  tokens?: {
    accessToken: string;
    refreshToken: string;
    expiresAt: number;
  };
  error?: string;
  verification?: {
    verified: boolean;
    authenticationInfo?: {
      credentialID: string;
      newCounter: number;
    };
  };
}

// =============================================================================
// WebAuthn 서비스 인터페이스
// =============================================================================

export interface IWebAuthnService {
  // 등록 프로세스
  beginRegistration(request: RegistrationRequest): Promise<RegistrationBeginResponse>;
  completeRegistration(request: RegistrationCompleteRequest): Promise<RegistrationCompleteResponse>;
  
  // 인증 프로세스
  beginAuthentication(request: AuthenticationRequest): Promise<AuthenticationBeginResponse>;
  completeAuthentication(request: AuthenticationCompleteRequest): Promise<AuthenticationCompleteResponse>;
  
  // 자격증명 관리
  getUserCredentials(userId: string): Promise<WebAuthnCredential[]>;
  revokeCredential(credentialId: string, userId: string): Promise<boolean>;
  updateCredentialNickname(credentialId: string, nickname: string, userId: string): Promise<boolean>;
  
  // 보안 기능
  isCredentialRevoked(credentialId: string): Promise<boolean>;
  validateUserHandle(userHandle: string): Promise<boolean>;
}

// =============================================================================
// 클라이언트 사이드 WebAuthn 타입들
// =============================================================================

export interface WebAuthnClientOptions {
  rpId: string;
  rpName: string;
  origin: string;
  timeout?: number;
  userVerification?: UserVerificationRequirement;
}

export interface WebAuthnClientResult {
  success: boolean;
  credential?: PublicKeyCredential;
  error?: string;
  errorCode?: WebAuthnErrorCode;
}

export type WebAuthnErrorCode =
  | 'NOT_SUPPORTED'
  | 'NOT_ALLOWED'
  | 'SECURITY_ERROR'
  | 'NETWORK_ERROR'
  | 'INVALID_STATE'
  | 'CONSTRAINT_ERROR'
  | 'ABORT_ERROR'
  | 'TIMEOUT_ERROR'
  | 'UNKNOWN_ERROR';

// =============================================================================
// WebAuthn 세션 관리
// =============================================================================

export interface WebAuthnSession {
  id: string;
  userId?: string;
  challenge: string;
  type: 'registration' | 'authentication';
  options: PublicKeyCredentialCreationOptionsJSON | PublicKeyCredentialRequestOptionsJSON;
  createdAt: Date;
  expiresAt: Date;
  completed: boolean;
  ipAddress?: string;
  userAgent?: string;
}

// =============================================================================
// 생체 인증 타입 감지
// =============================================================================

export interface BiometricCapabilities {
  available: boolean;
  types: BiometricType[];
  platformAuthenticatorAvailable: boolean;
  conditionalMediationAvailable: boolean;
}

export type BiometricType = 
  | 'touchid'          // Apple Touch ID
  | 'faceid'           // Apple Face ID  
  | 'windowshello'     // Windows Hello
  | 'androidbiometric' // Android 생체인증
  | 'fingerprint'      // 일반 지문인식
  | 'iris'             // 홍채인식
  | 'voice'            // 음성인식
  | 'unknown';

// =============================================================================
// WebAuthn 통계 및 분석
// =============================================================================

export interface WebAuthnAnalytics {
  totalRegistrations: number;
  totalAuthentications: number;
  successRate: number;
  averageAuthTime: number;
  deviceTypes: Record<string, number>;
  biometricTypes: Record<BiometricType, number>;
  errorTypes: Record<WebAuthnErrorCode, number>;
  timeRange: {
    startDate: Date;
    endDate: Date;
  };
}

// =============================================================================
// 확장된 WebAuthn 설정
// =============================================================================

export interface ExtendedWebAuthnConfig {
  rpId: string;
  rpName: string;
  origin: string;
  timeout: number;
  userVerification: UserVerificationRequirement;
  attestation: AttestationConveyancePreference;
  algorithms: number[];
  authenticatorSelection: {
    authenticatorAttachment?: AuthenticatorAttachment;
    userVerification?: UserVerificationRequirement;
    requireResidentKey?: boolean;
    residentKey?: ResidentKeyRequirement;
  };
  extensions?: {
    credProps?: boolean;
    largeBlob?: {
      support: 'required' | 'preferred';
    };
    minPinLength?: boolean;
  };
}

// =============================================================================
// 에러 헨들링
// =============================================================================

export class WebAuthnError extends Error {
  constructor(
    message: string,
    public code: WebAuthnErrorCode,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'WebAuthnError';
  }
}

// =============================================================================
// 유틸리티 타입들
// =============================================================================

export type WebAuthnProvider = 'platform' | 'cross-platform' | 'both';

export interface WebAuthnStatus {
  supported: boolean;
  available: boolean;
  platform: boolean;
  crossPlatform: boolean;
  conditionalMediation: boolean;
  userVerifying: boolean;
}

export interface CredentialCreationResult {
  success: boolean;
  credentialId?: string;
  attestationObject?: ArrayBuffer;
  clientDataJSON?: ArrayBuffer;
  transports?: AuthenticatorTransport[];
  error?: string;
}

export interface CredentialAssertionResult {
  success: boolean;
  credentialId?: string;
  authenticatorData?: ArrayBuffer;
  signature?: ArrayBuffer;
  userHandle?: ArrayBuffer;
  error?: string;
}

// =============================================================================
// React Hook 타입들
// =============================================================================

export interface UseWebAuthnReturn {
  // 상태
  isSupported: boolean;
  isRegistering: boolean;
  isAuthenticating: boolean;
  status: WebAuthnStatus;
  error: string | null;
  
  // 등록 함수들
  beginRegistration: (request: RegistrationRequest) => Promise<WebAuthnClientResult>;
  completeRegistration: (credential: PublicKeyCredential) => Promise<RegistrationCompleteResponse>;
  
  // 인증 함수들
  beginAuthentication: (request?: AuthenticationRequest) => Promise<WebAuthnClientResult>;
  completeAuthentication: (credential: PublicKeyCredential) => Promise<AuthenticationCompleteResponse>;
  
  // 유틸리티 함수들
  checkSupport: () => Promise<WebAuthnStatus>;
  detectBiometricType: () => Promise<BiometricType>;
  clearError: () => void;
}

// =============================================================================
// 타입 가드 함수들
// =============================================================================

export function isWebAuthnSupported(): boolean {
  return typeof window !== 'undefined' && 
         'credentials' in navigator && 
         'create' in navigator.credentials && 
         'get' in navigator.credentials;
}

export function isPublicKeyCredential(credential: any): credential is PublicKeyCredential {
  return credential && 
         credential.type === 'public-key' && 
         credential.id && 
         credential.rawId && 
         credential.response;
}

export function isAuthenticatorAttestationResponse(response: any): response is AuthenticatorAttestationResponse {
  return response && 'attestationObject' in response;
}

export function isAuthenticatorAssertionResponse(response: any): response is AuthenticatorAssertionResponse {
  return response && 'authenticatorData' in response && 'signature' in response;
}