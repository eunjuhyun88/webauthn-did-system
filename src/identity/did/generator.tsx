// =============================================================================
// 🆔 W3C DID 표준 준수 생성기
// =============================================================================

import type {
  DIDDocument,
  VerificationMethod,
  Service,
  DIDCreationRequest,
  DIDCreationResult,
  DIDMethod,
  KeyType,
  DIDCreationOptions
} from '@/types/did';

import CONFIG from '@/lib/config';
import { generateKeyPair, exportPublicKey, exportPrivateKey } from '@/lib/utils/crypto';

// =============================================================================
// 🔑 키 생성 유틸리티
// =============================================================================

async function generateCryptoKeyPair(keyType: KeyType): Promise<CryptoKeyPair> {
  switch (keyType) {
    case 'Ed25519':
      return await crypto.subtle.generateKey(
        { name: 'Ed25519' },
        true,
        ['sign', 'verify']
      );
    
    case 'P-256':
      return await crypto.subtle.generateKey(
        { name: 'ECDSA', namedCurve: 'P-256' },
        true,
        ['sign', 'verify']
      );
    
    case 'P-384':
      return await crypto.subtle.generateKey(
        { name: 'ECDSA', namedCurve: 'P-384' },
        true,
        ['sign', 'verify']
      );
    
    case 'secp256k1':
      // secp256k1은 Web Crypto API에서 직접 지원하지 않음
      // 실제 구현에서는 외부 라이브러리 필요
      throw new Error('secp256k1 키 생성은 현재 지원되지 않습니다');
    
    case 'RSA':
      return await crypto.subtle.generateKey(
        {
          name: 'RSASSA-PKCS1-v1_5',
          modulusLength: 2048,
          publicExponent: new Uint8Array([1, 0, 1]),
          hash: 'SHA-256',
        },
        true,
        ['sign', 'verify']
      );
    
    default:
      throw new Error(`지원하지 않는 키 타입: ${keyType}`);
  }
}

async function keyPairToJWK(keyPair: CryptoKeyPair, keyType: KeyType): Promise<{ publicJWK: JsonWebKey; privateJWK: JsonWebKey }> {
  const publicJWK = await crypto.subtle.exportKey('jwk', keyPair.publicKey);
  const privateJWK = await crypto.subtle.exportKey('jwk', keyPair.privateKey);
  
  // key type 설정
  switch (keyType) {
    case 'Ed25519':
      publicJWK.kty = 'OKP';
      publicJWK.crv = 'Ed25519';
      privateJWK.kty = 'OKP';
      privateJWK.crv = 'Ed25519';
      break;
    case 'P-256':
      publicJWK.kty = 'EC';
      publicJWK.crv = 'P-256';
      privateJWK.kty = 'EC';
      privateJWK.crv = 'P-256';
      break;
    case 'P-384':
      publicJWK.kty = 'EC';
      publicJWK.crv = 'P-384';
      privateJWK.kty = 'EC';
      privateJWK.crv = 'P-384';
      break;
    case 'RSA':
      publicJWK.kty = 'RSA';
      privateJWK.kty = 'RSA';
      break;
  }
  
  return { publicJWK, privateJWK };
}

// =============================================================================
// 🆔 DID 생성 메인 함수
// =============================================================================

export async function generateDID(
  method: DIDMethod = 'web',
  identifier?: string,
  options?: DIDCreationOptions
): Promise<string> {
  const request: DIDCreationRequest = {
    method,
    identifier,
    keyType: 'P-256',
    options
  };
  
  const result = await createDID(request);
  if (!result.success || !result.did) {
    throw new Error(result.error || 'DID 생성 실패');
  }
  
  return result.did;
}

export async function createDID(request: DIDCreationRequest): Promise<DIDCreationResult> {
  try {
    const {
      method,
      identifier,
      keyType = 'P-256',
      options = {}
    } = request;

    // 고유 식별자 생성
    const id = identifier || crypto.randomUUID();
    
    // DID 문자열 생성
    const did = generateDIDString(method, id);
    
    // 키 쌍 생성
    let keyPair: CryptoKeyPair;
    let publicJWK: JsonWebKey;
    let privateJWK: JsonWebKey;
    
    if (options.useExistingKey && options.keyId) {
      // 기존 키 사용 (실제로는 키 저장소에서 조회)
      throw new Error('기존 키 사용 기능은 아직 구현되지 않았습니다');
    } else {
      // 새 키 쌍 생성
      keyPair = await generateCryptoKeyPair(keyType);
      const jwks = await keyPairToJWK(keyPair, keyType);
      publicJWK = jwks.publicJWK;
      privateJWK = jwks.privateJWK;
    }

    // 검증 메소드 생성
    const verificationMethod = createVerificationMethod(did, publicJWK, keyType);
    
    // DID 문서 생성
    const didDocument = await createDIDDocument(did, method, verificationMethod, options);
    
    return {
      success: true,
      did,
      didDocument,
      privateKey: privateJWK,
      publicKey: publicJWK,
      keyPair,
      metadata: {
        createdAt: new Date(),
        method,
        keyType
      }
    };

  } catch (error) {
    console.error('DID 생성 오류:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'DID 생성 중 오류 발생'
    };
  }
}

// =============================================================================
// 🔧 DID 문자열 생성
// =============================================================================

function generateDIDString(method: DIDMethod, identifier: string): string {
  switch (method) {
    case 'web':
      const domain = CONFIG.WEBAUTHN.RP_ID;
      const path = identifier.replace(/[^a-zA-Z0-9-_.]/g, ''); // 안전한 경로 문자만 허용
      return `did:web:${domain}:users:${path}`;
    
    case 'key':
      // did:key는 공개키에서 직접 생성
      return `did:key:${identifier}`;
    
    case 'ethr':
      // Ethereum 주소 기반 (0x로 시작하는 40자리 hex)
      return `did:ethr:${identifier}`;
    
    case 'ion':
      // Microsoft ION 네트워크
      return `did:ion:${identifier}`;
    
    case 'jwk':
      // JWK 기반 DID
      return `did:jwk:${identifier}`;
    
    case 'pkh':
      // Public Key Hash 기반
      return `did:pkh:${identifier}`;
    
    case 'peer':
      // Peer DID
      return `did:peer:${identifier}`;
    
    case 'sov':
      // Hyperledger Indy Sovrin
      return `did:sov:${identifier}`;
    
    default:
      throw new Error(`지원하지 않는 DID 메소드: ${method}`);
  }
}

// =============================================================================
// 🔑 검증 메소드 생성
// =============================================================================

function createVerificationMethod(
  did: string,
  publicKey: JsonWebKey,
  keyType: KeyType
): VerificationMethod {
  const keyId = `${did}#key-1`;
  
  // 키 타입에 따른 type 설정
  let type: string;
  switch (keyType) {
    case 'Ed25519':
      type = 'Ed25519VerificationKey2020';
      break;
    case 'P-256':
    case 'P-384':
      type = 'EcdsaSecp256r1VerificationKey2019';
      break;
    case 'secp256k1':
      type = 'EcdsaSecp256k1VerificationKey2019';
      break;
    case 'RSA':
      type = 'RsaVerificationKey2018';
      break;
    default:
      type = 'JsonWebKey2020';
  }

  return {
    id: keyId,
    type,
    controller: did,
    publicKeyJwk: publicKey
  };
}

// =============================================================================
// 📄 DID 문서 생성
// =============================================================================

async function createDIDDocument(
  did: string,
  method: DIDMethod,
  verificationMethod: VerificationMethod,
  options: DIDCreationOptions
): Promise<DIDDocument> {
  const document: DIDDocument = {
    '@context': [
      'https://www.w3.org/ns/did/v1',
      'https://w3id.org/security/suites/jws-2020/v1'
    ],
    id: did,
    controller: options.controllers || [did],
    verificationMethod: [verificationMethod],
    authentication: [verificationMethod.id],
    assertionMethod: [verificationMethod.id]
  };

  // 검증 관계 설정
  if (options.verificationRelationships) {
    for (const relationship of options.verificationRelationships) {
      switch (relationship) {
        case 'keyAgreement':
          document.keyAgreement = [verificationMethod.id];
          break;
        case 'capabilityInvocation':
          document.capabilityInvocation = [verificationMethod.id];
          break;
        case 'capabilityDelegation':
          document.capabilityDelegation = [verificationMethod.id];
          break;
      }
    }
  }

  // 서비스 엔드포인트 추가
  if (options.serviceEndpoints && options.serviceEndpoints.length > 0) {
    document.service = options.serviceEndpoints;
  } else {
    // 기본 서비스 엔드포인트 추가
    document.service = createDefaultServices(did, method);
  }

  // alsoKnownAs 추가
  if (options.alsoKnownAs && options.alsoKnownAs.length > 0) {
    document.alsoKnownAs = options.alsoKnownAs;
  }

  // 메타데이터 추가
  document.metadata = {
    created: new Date().toISOString(),
    versionId: '1'
  };

  return document;
}

// =============================================================================
// 🔗 기본 서비스 생성
// =============================================================================

function createDefaultServices(did: string, method: DIDMethod): Service[] {
  const services: Service[] = [];

  // WebAuthn 서비스 (모든 메소드에 공통)
  services.push({
    id: `${did}#webauthn`,
    type: 'WebAuthnService',
    serviceEndpoint: `${CONFIG.WEBAUTHN.ORIGIN}/api/webauthn`,
    description: 'WebAuthn biometric authentication service'
  });

  // AI 에이전트 서비스
  services.push({
    id: `${did}#ai-agent`,
    type: 'AIAgentService',
    serviceEndpoint: `${CONFIG.WEBAUTHN.ORIGIN}/api/ai`,
    description: 'Universal AI Agent service endpoint'
  });

  // DID 해결 서비스
  services.push({
    id: `${did}#resolver`,
    type: 'DIDResolver',
    serviceEndpoint: `${CONFIG.WEBAUTHN.ORIGIN}/api/did/resolve`,
    description: 'DID resolution service'
  });

  // 메소드별 특화 서비스
  switch (method) {
    case 'web':
      services.push({
        id: `${did}#web-profile`,
        type: 'ProfileService',
        serviceEndpoint: `${CONFIG.WEBAUTHN.ORIGIN}/.well-known/did.json`,
        description: 'Web-based DID profile service'
      });
      break;

    case 'key':
      // did:key는 암호화/서명에 특화
      services.push({
        id: `${did}#encryption`,
        type: 'EncryptionService',
        serviceEndpoint: `${CONFIG.WEBAUTHN.ORIGIN}/api/encryption`,
        description: 'Public key encryption service'
      });
      break;

    case 'ethr':
      services.push({
        id: `${did}#ethereum`,
        type: 'EthereumService',
        serviceEndpoint: 'https://mainnet.infura.io/v3/PROJECT_ID',
        description: 'Ethereum blockchain service'
      });
      break;
  }

  return services;
}

// =============================================================================
// 🎯 특화된 DID 생성 함수들
// =============================================================================

export async function createWebDID(
  identifier: string,
  options?: Partial<DIDCreationOptions>
): Promise<DIDCreationResult> {
  return createDID({
    method: 'web',
    identifier,
    keyType: 'P-256',
    options: {
      verificationRelationships: ['authentication', 'assertionMethod'],
      ...options
    }
  });
}

export async function createKeyDID(
  keyType: KeyType = 'Ed25519',
  options?: Partial<DIDCreationOptions>
): Promise<DIDCreationResult> {
  // did:key는 공개키에서 직접 생성되므로 특별한 처리 필요
  const keyPair = await generateCryptoKeyPair(keyType);
  const { publicJWK } = await keyPairToJWK(keyPair, keyType);
  
  // 공개키를 multibase로 인코딩 (실제로는 더 복잡한 변환 필요)
  const publicKeyBytes = await crypto.subtle.exportKey('raw', keyPair.publicKey);
  const identifier = btoa(String.fromCharCode(...new Uint8Array(publicKeyBytes)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');

  return createDID({
    method: 'key',
    identifier,
    keyType,
    options: {
      useExistingKey: true,
      verificationRelationships: ['authentication', 'assertionMethod', 'keyAgreement'],
      ...options
    }
  });
}

export async function createEthereumDID(
  ethereumAddress: string,
  options?: Partial<DIDCreationOptions>
): Promise<DIDCreationResult> {
  // Ethereum 주소 검증
  if (!/^0x[a-fA-F0-9]{40}$/.test(ethereumAddress)) {
    return {
      success: false,
      error: '유효하지 않은 Ethereum 주소입니다'
    };
  }

  return createDID({
    method: 'ethr',
    identifier: ethereumAddress,
    keyType: 'secp256k1',
    options: {
      verificationRelationships: ['authentication', 'assertionMethod'],
      ...options
    }
  });
}

// =============================================================================
// 🔍 DID 유효성 검사
// =============================================================================

export function validateDID(did: string): { valid: boolean; method?: DIDMethod; identifier?: string; error?: string } {
  const didRegex = /^did:([a-z0-9]+):(.+)$/;
  const match = did.match(didRegex);
  
  if (!match) {
    return { valid: false, error: 'DID 형식이 올바르지 않습니다' };
  }
  
  const [, method, identifier] = match;
  
  // 지원하는 메소드 확인
  const supportedMethods: DIDMethod[] = ['web', 'key', 'ethr', 'ion', 'sov', 'peer', 'jwk', 'pkh'];
  if (!supportedMethods.includes(method as DIDMethod)) {
    return { valid: false, error: `지원하지 않는 DID 메소드: ${method}` };
  }
  
  // 메소드별 식별자 검증
  switch (method as DIDMethod) {
    case 'web':
      // 도메인:경로 형식 검증
      if (!/^[a-zA-Z0-9.-]+(:.*)?$/.test(identifier)) {
        return { valid: false, error: 'did:web 식별자 형식이 올바르지 않습니다' };
      }
      break;
      
    case 'ethr':
      // Ethereum 주소 형식 검증
      if (!/^(0x)?[a-fA-F0-9]{40}$/.test(identifier)) {
        return { valid: false, error: 'did:ethr 식별자는 유효한 Ethereum 주소여야 합니다' };
      }
      break;
      
    case 'key':
      // Base58 또는 multibase 형식 검증 (간단한 검증)
      if (identifier.length < 10) {
        return { valid: false, error: 'did:key 식별자가 너무 짧습니다' };
      }
      break;
  }
  
  return { 
    valid: true, 
    method: method as DIDMethod, 
    identifier 
  };
}

// =============================================================================
// 🔄 DID 문서 업데이트
// =============================================================================

export async function updateDIDDocument(
  did: string,
  updates: Partial<DIDDocument>,
  privateKey: JsonWebKey
): Promise<{ success: boolean; document?: DIDDocument; error?: string }> {
  try {
    // DID 유효성 검사
    const validation = validateDID(did);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    // 기존 문서 조회 (실제로는 저장소에서 가져와야 함)
    // const existingDocument = await resolveDID(did);
    
    // 업데이트할 필드들 검증
    if (updates.id && updates.id !== did) {
      return { success: false, error: 'DID ID는 변경할 수 없습니다' };
    }

    // 새로운 검증 메소드 추가시 서명 검증
    if (updates.verificationMethod) {
      // 실제로는 기존 키로 서명된 업데이트 요청인지 검증
      console.log('검증 메소드 업데이트 요청 검증');
    }

    // 메타데이터 업데이트
    const updatedMetadata = {
      ...updates.metadata,
      updated: new Date().toISOString(),
      versionId: String(parseInt(updates.metadata?.versionId || '1') + 1)
    };

    const updatedDocument: DIDDocument = {
      '@context': ['https://www.w3.org/ns/did/v1'],
      id: did,
      ...updates,
      metadata: updatedMetadata
    };

    return {
      success: true,
      document: updatedDocument
    };

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'DID 문서 업데이트 실패'
    };
  }
}

// =============================================================================
// ⚠️ DID 비활성화
// =============================================================================

export async function deactivateDID(
  did: string,
  privateKey: JsonWebKey,
  reason?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const validation = validateDID(did);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    // 비활성화는 메타데이터만 업데이트
    const deactivationResult = await updateDIDDocument(did, {
      metadata: {
        deactivated: true,
        updated: new Date().toISOString(),
        versionId: '999999' // 비활성화 마크
      }
    }, privateKey);

    if (!deactivationResult.success) {
      return { success: false, error: deactivationResult.error };
    }

    return { success: true };

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'DID 비활성화 실패'
    };
  }
}

// =============================================================================
// 🎲 유틸리티 함수들
// =============================================================================

export function extractDIDMethod(did: string): DIDMethod | null {
  const match = did.match(/^did:([a-z0-9]+):/);
  return match ? match[1] as DIDMethod : null;
}

export function extractDIDIdentifier(did: string): string | null {
  const match = did.match(/^did:[a-z0-9]+:(.+)$/);
  return match ? match[1] : null;
}

export function isDIDEqual(did1: string, did2: string): boolean {
  return did1.toLowerCase() === did2.toLowerCase();
}

export function createDIDReference(did: string, fragment?: string): string {
  return fragment ? `${did}#${fragment}` : did;
}

// =============================================================================
// 🧪 테스트 유틸리티
// =============================================================================

export async function generateTestDID(method: DIDMethod = 'web'): Promise<DIDCreationResult> {
  const testIdentifier = `test-${Date.now()}-${Math.random().toString(36).substring(7)}`;
  
  return createDID({
    method,
    identifier: testIdentifier,
    keyType: 'P-256',
    options: {
      serviceEndpoints: [{
        id: `#test-service`,
        type: 'TestService',
        serviceEndpoint: 'https://example.com/test'
      }],
      verificationRelationships: ['authentication', 'assertionMethod']
    }
  });
}

// =============================================================================
// 📊 DID 통계
// =============================================================================

export interface DIDStats {
  totalDIDs: number;
  methodDistribution: Record<DIDMethod, number>;
  averageServicesPerDID: number;
  mostUsedKeyTypes: Record<KeyType, number>;
}

export function calculateDIDStats(documents: DIDDocument[]): DIDStats {
  const stats: DIDStats = {
    totalDIDs: documents.length,
    methodDistribution: {} as Record<DIDMethod, number>,
    averageServicesPerDID: 0,
    mostUsedKeyTypes: {} as Record<KeyType, number>
  };

  let totalServices = 0;

  for (const doc of documents) {
    // 메소드 분포 계산
    const method = extractDIDMethod(doc.id);
    if (method) {
      stats.methodDistribution[method] = (stats.methodDistribution[method] || 0) + 1;
    }

    // 서비스 개수 계산
    if (doc.service) {
      totalServices += doc.service.length;
    }

    // 키 타입 분포 계산 (검증 메소드에서 추출)
    if (doc.verificationMethod) {
      for (const vm of doc.verificationMethod) {
        if (vm.publicKeyJwk?.kty) {
          const keyType = vm.publicKeyJwk.kty as KeyType;
          stats.mostUsedKeyTypes[keyType] = (stats.mostUsedKeyTypes[keyType] || 0) + 1;
        }
      }
    }
  }

  stats.averageServicesPerDID = documents.length > 0 ? totalServices / documents.length : 0;

  return stats;
}

// =============================================================================
// 🚀 내보내기
// =============================================================================

export default {
  generateDID,
  createDID,
  createWebDID,
  createKeyDID,
  createEthereumDID,
  validateDID,
  updateDIDDocument,
  deactivateDID,
  extractDIDMethod,
  extractDIDIdentifier,
  isDIDEqual,
  createDIDReference,
  generateTestDID,
  calculateDIDStats
};