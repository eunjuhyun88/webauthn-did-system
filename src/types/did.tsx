// =============================================================================
// 🆔 W3C DID 표준 완전 타입 정의
// =============================================================================

// =============================================================================
// W3C DID 핵심 타입들
// =============================================================================

export interface DIDDocument {
  '@context': string | string[];
  id: string;
  controller?: string | string[];
  verificationMethod?: VerificationMethod[];
  authentication?: (string | VerificationMethod)[];
  assertionMethod?: (string | VerificationMethod)[];
  keyAgreement?: (string | VerificationMethod)[];
  capabilityInvocation?: (string | VerificationMethod)[];
  capabilityDelegation?: (string | VerificationMethod)[];
  service?: Service[];
  alsoKnownAs?: string[];
  metadata?: DIDDocumentMetadata;
}

export interface VerificationMethod {
  id: string;
  type: string;
  controller: string;
  publicKeyJwk?: JsonWebKey;
  publicKeyMultibase?: string;
  publicKeyBase58?: string;
  blockchainAccountId?: string;
  ethereumAddress?: string;
}

export interface Service {
  id: string;
  type: string | string[];
  serviceEndpoint: string | string[] | ServiceEndpoint;
  description?: string;
  routingKeys?: string[];
  accept?: string[];
}

export interface ServiceEndpoint {
  uri?: string;
  accept?: string[];
  routingKeys?: string[];
  [key: string]: any;
}

export interface DIDDocumentMetadata {
  created?: string;
  updated?: string;
  deactivated?: boolean;
  versionId?: string;
  nextUpdate?: string;
  nextVersionId?: string;
  equivalentId?: string[];
  canonicalId?: string;
}

// =============================================================================
// DID 해결 (Resolution) 타입들
// =============================================================================

export interface DIDResolutionResult {
  '@context'?: string | string[];
  didDocument: DIDDocument | null;
  didDocumentMetadata: DIDDocumentMetadata;
  didResolutionMetadata: DIDResolutionMetadata;
}

export interface DIDResolutionMetadata {
  contentType?: string;
  error?: DIDResolutionError;
  message?: string;
  duration?: number;
  [key: string]: any;
}

export type DIDResolutionError = 
  | 'invalidDid'
  | 'notFound'
  | 'representationNotSupported'
  | 'methodNotSupported'
  | 'invalidDidDocument'
  | 'invalidDidDocumentLength'
  | 'internalError';

// =============================================================================
// DID 생성 및 관리 타입들
// =============================================================================

export interface DIDCreationRequest {
  method: DIDMethod;
  identifier?: string;
  keyType?: KeyType;
  options?: DIDCreationOptions;
  metadata?: {
    alias?: string;
    description?: string;
    tags?: string[];
  };
}

export interface DIDCreationOptions {
  useExistingKey?: boolean;
  keyId?: string;
  serviceEndpoints?: Service[];
  controllers?: string[];
  alsoKnownAs?: string[];
  verificationRelationships?: VerificationRelationship[];
}

export interface DIDCreationResult {
  success: boolean;
  did?: string;
  didDocument?: DIDDocument;
  privateKey?: JsonWebKey;
  publicKey?: JsonWebKey;
  keyPair?: CryptoKeyPair;
  error?: string;
  metadata?: {
    createdAt: Date;
    method: DIDMethod;
    keyType: KeyType;
  };
}

// =============================================================================
// DID 메소드 타입들
// =============================================================================

export type DIDMethod = 
  | 'web'           // did:web
  | 'key'           // did:key
  | 'ethr'          // did:ethr (Ethereum)
  | 'ion'           // did:ion (Microsoft ION)
  | 'sov'           // did:sov (Hyperledger Indy)
  | 'peer'          // did:peer
  | 'jwk'           // did:jwk
  | 'pkh';          // did:pkh (Public Key Hash)

export type KeyType =
  | 'Ed25519'
  | 'secp256k1'
  | 'P-256'
  | 'P-384'
  | 'P-521'
  | 'RSA'
  | 'X25519';

export type VerificationRelationship =
  | 'authentication'
  | 'assertionMethod'
  | 'keyAgreement'
  | 'capabilityInvocation'
  | 'capabilityDelegation';

// =============================================================================
// WebAuthn + DID 통합 타입들
// =============================================================================

export interface WebAuthnDIDBinding {
  did: string;
  credentialId: string;
  publicKey: string;
  verificationMethod: VerificationMethod;
  createdAt: Date;
  status: 'active' | 'revoked' | 'expired';
  metadata?: {
    deviceInfo?: {
      platform: string;
      browser: string;
      biometricType?: string;
    };
    usage: {
      lastUsed: Date;
      usageCount: number;
    };
  };
}

export interface DIDWebAuthnProfile {
  did: string;
  username: string;
  displayName: string;
  email?: string;
  credentials: WebAuthnDIDBinding[];
  didDocument: DIDDocument;
  createdAt: Date;
  updatedAt: Date;
  status: 'active' | 'suspended' | 'revoked';
}

// =============================================================================
// DID 서비스 인터페이스
// =============================================================================

export interface IDIDService {
  // DID 생성
  createDID(request: DIDCreationRequest): Promise<DIDCreationResult>;
  
  // DID 해결 (조회)
  resolveDID(did: string): Promise<DIDResolutionResult>;
  
  // DID 문서 업데이트
  updateDIDDocument(did: string, updates: Partial<DIDDocument>): Promise<boolean>;
  
  // DID 비활성화
  deactivateDID(did: string): Promise<boolean>;
  
  // 검증 메소드 관리
  addVerificationMethod(did: string, method: VerificationMethod): Promise<boolean>;
  removeVerificationMethod(did: string, methodId: string): Promise<boolean>;
  
  // 서비스 엔드포인트 관리
  addService(did: string, service: Service): Promise<boolean>;
  removeService(did: string, serviceId: string): Promise<boolean>;
  
  // WebAuthn 통합
  bindWebAuthnCredential(did: string, credentialId: string, publicKey: string): Promise<WebAuthnDIDBinding>;
  revokeWebAuthnBinding(did: string, credentialId: string): Promise<boolean>;
  
  // 검증
  verifyDID(did: string): Promise<boolean>;
  validateDIDDocument(document: DIDDocument): Promise<boolean>;
}

// =============================================================================
// DID:WEB 특화 타입들
// =============================================================================

export interface DIDWebConfig {
  domain: string;
  path?: string;
  httpsRequired: boolean;
  wellKnownPath: string; // /.well-known/did.json
}

export interface DIDWebDocument extends DIDDocument {
  id: string; // did:web:domain:path
  '@context': string | string[];
}

// =============================================================================
// DID:KEY 특화 타입들
// =============================================================================

export interface DIDKeyDocument extends DIDDocument {
  id: string; // did:key:multibase-encoded-key
  verificationMethod: [VerificationMethod]; // 단일 검증 메소드
}

// =============================================================================
// DID 저장소 타입들
// =============================================================================

export interface DIDRecord {
  id: string;
  did: string;
  didDocument: DIDDocument;
  method: DIDMethod;
  controller: string;
  status: 'active' | 'revoked' | 'deactivated';
  createdAt: Date;
  updatedAt: Date;
  metadata?: {
    alias?: string;
    description?: string;
    tags?: string[];
    keyType?: KeyType;
    usage?: {
      lastAccessed: Date;
      accessCount: number;
    };
  };
}

export interface DIDRepository {
  create(record: Omit<DIDRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<DIDRecord>;
  findByDID(did: string): Promise<DIDRecord | null>;
  findByController(controller: string): Promise<DIDRecord[]>;
  update(did: string, updates: Partial<DIDRecord>): Promise<DIDRecord | null>;
  delete(did: string): Promise<boolean>;
  list(filters?: DIDListFilters): Promise<DIDRecord[]>;
}

export interface DIDListFilters {
  method?: DIDMethod;
  status?: DIDRecord['status'];
  controller?: string;
  tags?: string[];
  createdAfter?: Date;
  createdBefore?: Date;
  limit?: number;
  offset?: number;
}

// =============================================================================
// DID 암호화 작업 타입들
// =============================================================================

export interface DIDCryptoOperations {
  // 서명
  sign(did: string, data: Uint8Array, keyId?: string): Promise<Uint8Array>;
  verify(did: string, data: Uint8Array, signature: Uint8Array, keyId?: string): Promise<boolean>;
  
  // 암호화
  encrypt(did: string, data: Uint8Array, recipientDID: string): Promise<Uint8Array>;
  decrypt(did: string, encryptedData: Uint8Array): Promise<Uint8Array>;
  
  // 키 합의
  deriveSharedSecret(did: string, recipientDID: string): Promise<Uint8Array>;
}

// =============================================================================
// DID 통신 메시지 타입들
// =============================================================================

export interface DIDCommMessage {
  id: string;
  type: string;
  from: string; // sender DID
  to: string[];  // recipient DIDs
  created_time: number;
  expires_time?: number;
  body: any;
  attachments?: DIDCommAttachment[];
}

export interface DIDCommAttachment {
  id: string;
  description?: string;
  filename?: string;
  mime_type?: string;
  lastmod_time?: number;
  byte_count?: number;
  data: {
    base64?: string;
    json?: any;
    links?: string[];
  };
}

// =============================================================================
// AI 통합용 DID 타입들
// =============================================================================

export interface AIDIDProfile {
  did: string;
  agentName: string;
  agentType: string;
  capabilities: string[];
  trustLevel: number;
  verifiedCredentials: VerifiableCredential[];
  interactions: {
    totalConversations: number;
    successRate: number;
    lastActive: Date;
  };
  metadata: {
    version: string;
    createdBy: string;
    certifications: string[];
  };
}

export interface VerifiableCredential {
  '@context': string | string[];
  id: string;
  type: string[];
  issuer: string | { id: string; [key: string]: any };
  issuanceDate: string;
  expirationDate?: string;
  credentialSubject: any;
  proof?: any;
}

// =============================================================================
// DID 이벤트 타입들
// =============================================================================

export interface DIDEvent {
  id: string;
  type: DIDEventType;
  did: string;
  timestamp: Date;
  actor: string; // DID of the actor
  details: any;
  metadata?: {
    ipAddress?: string;
    userAgent?: string;
    location?: string;
  };
}

export type DIDEventType =
  | 'created'
  | 'updated'
  | 'deactivated'
  | 'key_added'
  | 'key_removed'
  | 'service_added'
  | 'service_removed'
  | 'webauthn_bound'
  | 'webauthn_revoked'
  | 'accessed'
  | 'verified';

// =============================================================================
// 에러 타입들
// =============================================================================

export class DIDError extends Error {
  constructor(
    message: string,
    public code: DIDErrorCode,
    public did?: string
  ) {
    super(message);
    this.name = 'DIDError';
  }
}

export type DIDErrorCode =
  | 'INVALID_DID'
  | 'NOT_FOUND'
  | 'ALREADY_EXISTS'
  | 'UNAUTHORIZED'
  | 'INVALID_DOCUMENT'
  | 'RESOLUTION_FAILED'
  | 'CREATION_FAILED'
  | 'UPDATE_FAILED'
  | 'DEACTIVATION_FAILED'
  | 'KEY_NOT_FOUND'
  | 'SERVICE_NOT_FOUND'
  | 'BINDING_FAILED'
  | 'VERIFICATION_FAILED';

// =============================================================================
// 유틸리티 타입들
// =============================================================================

export type DIDStatus = 'active' | 'deactivated' | 'revoked' | 'suspended';

export interface DIDAnalytics {
  totalDIDs: number;
  activeDIDs: number;
  methodDistribution: Record<DIDMethod, number>;
  creationTrend: Array<{ date: string; count: number }>;
  usageStats: {
    mostUsed: string[];
    leastUsed: string[];
    averageAge: number;
  };
}

// =============================================================================
// React Hook 타입들
// =============================================================================

export interface UseDIDReturn {
  // 상태
  isCreating: boolean;
  isResolving: boolean;
  error: string | null;
  
  // DID 작업
  createDID: (request: DIDCreationRequest) => Promise<DIDCreationResult>;
  resolveDID: (did: string) => Promise<DIDResolutionResult>;
  updateDID: (did: string, updates: Partial<DIDDocument>) => Promise<boolean>;
  deactivateDID: (did: string) => Promise<boolean>;
  
  // WebAuthn 통합
  bindWebAuthn: (did: string, credentialId: string, publicKey: string) => Promise<WebAuthnDIDBinding>;
  
  // 유틸리티
  validateDID: (did: string) => boolean;
  clearError: () => void;
}

// =============================================================================
// 타입 가드 함수들
// =============================================================================

export function isValidDID(did: string): boolean {
  const didRegex = /^did:([a-z0-9]+):([a-zA-Z0-9._-]+)$/;
  return didRegex.test(did);
}

export function isDIDDocument(obj: any): obj is DIDDocument {
  return obj && 
         typeof obj === 'object' && 
         typeof obj.id === 'string' && 
         isValidDID(obj.id) &&
         obj['@context'];
}

export function isVerificationMethod(obj: any): obj is VerificationMethod {
  return obj &&
         typeof obj === 'object' &&
         typeof obj.id === 'string' &&
         typeof obj.type === 'string' &&
         typeof obj.controller === 'string';
}

export function parseDIDMethod(did: string): DIDMethod | null {
  const match = did.match(/^did:([a-z0-9]+):/);
  return match ? match[1] as DIDMethod : null;
}