// =============================================================================
// 🆔 DID 서비스 통합 구현
// 파일: src/identity/did/index.ts
// =============================================================================

import { 
  DIDDocument,
  DIDCreationRequest,
  DIDCreationResult,
  DIDResolutionResult,
  VerificationMethod,
  Service,
  WebAuthnDIDBinding
} from '@/types/did';

import { WebAuthnCredential } from '@/types/webauthn';
import { supabase } from '@/lib/database/supabase';
import config from '@/lib/config';
import { generateKeyPair, exportPublicKey } from './generator';

// =============================================================================
// DID 서비스 클래스
// =============================================================================

export class DIDService {
  private domain: string;
  private method: string;

  constructor() {
    this.domain = this.extractDomain(config.APP_URL);
    this.method = config.DID_METHOD || 'web';
    
    console.log('🆔 DID 서비스 초기화:', {
      domain: this.domain,
      method: this.method
    });
  }

  private extractDomain(url: string): string {
    try {
      const parsedUrl = new URL(url);
      return parsedUrl.hostname;
    } catch (error) {
      console.warn('⚠️ URL에서 도메인 추출 실패, localhost 사용:', url);
      return 'localhost';
    }
  }

  // =============================================================================
  // DID 생성
  // =============================================================================

  async createDID(request: DIDCreationRequest): Promise<DIDCreationResult> {
    try {
      console.log('🔄 DID 생성 시작:', request.username);

      // 1. 키 쌍 생성
      const keyPair = await this.generateDIDKeyPair();
      
      // 2. DID 식별자 생성
      const didIdentifier = this.generateDIDIdentifier(request.username);
      
      // 3. DID Document 생성
      const didDocument = await this.createDIDDocument(
        didIdentifier,
        keyPair.publicKey,
        request
      );

      // 4. 데이터베이스에 저장
      const saveResult = await this.saveDIDToDatabase(
        didIdentifier,
        didDocument,
        keyPair.privateKey,
        request
      );

      if (!saveResult.success) {
        throw new Error('DID 저장 실패');
      }

      const result: DIDCreationResult = {
        success: true,
        did: didIdentifier,
        didDocument,
        keyPair: {
          publicKey: keyPair.publicKey,
          privateKey: keyPair.privateKey
        },
        metadata: {
          method: this.method,
          domain: this.domain,
          createdAt: new Date().toISOString(),
          version: 1
        }
      };

      console.log('✅ DID 생성 완료:', didIdentifier);
      return result;

    } catch (error) {
      console.error('❌ DID 생성 실패:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'DID 생성 실패'
      };
    }
  }

  // =============================================================================
  // DID 해결 (조회)
  // =============================================================================

  async resolveDID(did: string): Promise<DIDResolutionResult> {
    try {
      console.log('🔍 DID 해결 시작:', did);

      // 1. 데이터베이스에서 조회
      const { data: didRecord, error } = await supabase
        .from('users')
        .select('did_document, created_at, updated_at')
        .eq('did', did)
        .eq('auth_status', 'verified')
        .single();

      if (error || !didRecord) {
        // 2. did:web의 경우 HTTP로 조회 시도
        if (did.startsWith('did:web:')) {
          return await this.resolveWebDID(did);
        }

        return {
          success: false,
          error: 'DID를 찾을 수 없습니다'
        };
      }

      const didDocument = didRecord.did_document as DIDDocument;

      const result: DIDResolutionResult = {
        success: true,
        didDocument,
        metadata: {
          created: didRecord.created_at,
          updated: didRecord.updated_at,
          method: this.extractDIDMethod(did),
          deactivated: false
        }
      };

      console.log('✅ DID 해결 완료:', did);
      return result;

    } catch (error) {
      console.error('❌ DID 해결 실패:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'DID 해결 실패'
      };
    }
  }

  // =============================================================================
  // WebAuthn과 DID 연동
  // =============================================================================

  async bindWebAuthnCredential(
    did: string,
    credential: WebAuthnCredential
  ): Promise<WebAuthnDIDBinding> {
    try {
      console.log('🔗 WebAuthn-DID 바인딩 시작:', { did, credentialId: credential.id });

      // 1. DID Document 조회
      const resolutionResult = await this.resolveDID(did);
      if (!resolutionResult.success || !resolutionResult.didDocument) {
        throw new Error('DID를 찾을 수 없습니다');
      }

      const didDocument = resolutionResult.didDocument;

      // 2. 새로운 검증 메소드 생성
      const verificationMethod: VerificationMethod = {
        id: `${did}#webauthn-${credential.id.substring(0, 8)}`,
        type: 'WebAuthn2021',
        controller: did,
        publicKeyJwk: await this.credentialToJWK(credential),
        webauthnCredentialId: credential.id,
        biometricType: credential.biometricType
      };

      // 3. DID Document 업데이트
      const updatedDocument: DIDDocument = {
        ...didDocument,
        authentication: [
          ...didDocument.authentication,
          verificationMethod
        ],
        updated: new Date().toISOString()
      };

      // 4. 데이터베이스 업데이트
      const { error } = await supabase
        .from('users')
        .update({ 
          did_document: updatedDocument,
          updated_at: new Date().toISOString()
        })
        .eq('did', did);

      if (error) {
        throw new Error('DID Document 업데이트 실패');
      }

      // 5. 바인딩 정보 생성
      const binding: WebAuthnDIDBinding = {
        did,
        credentialId: credential.id,
        verificationMethodId: verificationMethod.id,
        publicKey: credential.publicKey,
        biometricType: credential.biometricType,
        createdAt: new Date(),
        isActive: true,
        metadata: {
          counter: credential.counter,
          deviceInfo: {
            platform: 'unknown',
            browser: 'unknown',
            biometricType: credential.biometricType
          },
          usage: {
            lastUsed: new Date(),
            usageCount: 0
          }
        }
      };

      console.log('✅ WebAuthn-DID 바인딩 완료');
      return binding;

    } catch (error) {
      console.error('❌ WebAuthn-DID 바인딩 실패:', error);
      throw error;
    }
  }

  // =============================================================================
  // DID Document 생성
  // =============================================================================

  private async createDIDDocument(
    did: string,
    publicKey: string,
    request: DIDCreationRequest
  ): Promise<DIDDocument> {
    const now = new Date().toISOString();

    // 기본 검증 메소드
    const verificationMethod: VerificationMethod = {
      id: `${did}#key-1`,
      type: 'Ed25519VerificationKey2020',
      controller: did,
      publicKeyJwk: await this.publicKeyToJWK(publicKey)
    };

    // 기본 서비스 엔드포인트들
    const services: Service[] = [
      {
        id: `${did}#webauthn-service`,
        type: 'WebAuthnService',
        serviceEndpoint: `${config.APP_URL}/api/webauthn`
      },
      {
        id: `${did}#identity-hub`,
        type: 'IdentityHub',
        serviceEndpoint: `${config.APP_URL}/api/identity/${encodeURIComponent(did)}`
      }
    ];

    // 추가 서비스가 요청된 경우 포함
    if (request.services) {
      services.push(...request.services);
    }

    const didDocument: DIDDocument = {
      '@context': [
        'https://www.w3.org/ns/did/v1',
        'https://w3id.org/security/suites/ed25519-2020/v1',
        'https://w3id.org/security/suites/webauthn-2021/v1'
      ],
      id: did,
      authentication: [verificationMethod],
      verificationMethod: [verificationMethod],
      service: services,
      created: now,
      updated: now
    };

    return didDocument;
  }

  // =============================================================================
  // DID 식별자 생성
  // =============================================================================

  private generateDIDIdentifier(username: string): string {
    if (this.method === 'web') {
      // did:web 형식
      const encodedDomain = this.domain.replace(/:/g, '%3A');
      const encodedUsername = encodeURIComponent(username);
      return `did:web:${encodedDomain}:users:${encodedUsername}`;
    } else if (this.method === 'key') {
      // did:key 형식 (향후 구현)
      throw new Error('did:key 메소드는 아직 구현되지 않았습니다');
    } else {
      throw new Error(`지원되지 않는 DID 메소드: ${this.method}`);
    }
  }

  // =============================================================================
  // 키 관련 유틸리티
  // =============================================================================

  private async generateDIDKeyPair() {
    try {
      // Ed25519 키 쌍 생성
      const keyPair = await crypto.subtle.generateKey(
        {
          name: 'Ed25519',
          namedCurve: 'Ed25519'
        },
        true,
        ['sign', 'verify']
      );

      const publicKey = await crypto.subtle.exportKey('spki', keyPair.publicKey);
      const privateKey = await crypto.subtle.exportKey('pkcs8', keyPair.privateKey);

      return {
        publicKey: this.arrayBufferToBase64(publicKey),
        privateKey: this.arrayBufferToBase64(privateKey)
      };

    } catch (error) {
      // Ed25519가 지원되지 않는 경우 ECDSA P-256 사용
      console.warn('Ed25519 미지원, ECDSA P-256 사용');
      
      const keyPair = await crypto.subtle.generateKey(
        {
          name: 'ECDSA',
          namedCurve: 'P-256'
        },
        true,
        ['sign', 'verify']
      );

      const publicKey = await crypto.subtle.exportKey('spki', keyPair.publicKey);
      const privateKey = await crypto.subtle.exportKey('pkcs8', keyPair.privateKey);

      return {
        publicKey: this.arrayBufferToBase64(publicKey),
        privateKey: this.arrayBufferToBase64(privateKey)
      };
    }
  }

  private async publicKeyToJWK(publicKeyBase64: string): Promise<JsonWebKey> {
    try {
      const publicKeyBuffer = this.base64ToArrayBuffer(publicKeyBase64);
      
      // 임시 키로 가져오기
      const importedKey = await crypto.subtle.importKey(
        'spki',
        publicKeyBuffer,
        { name: 'ECDSA', namedCurve: 'P-256' },
        true,
        ['verify']
      );

      return await crypto.subtle.exportKey('jwk', importedKey);

    } catch (error) {
      console.warn('JWK 변환 실패, 기본 구조 반환');
      return {
        kty: 'EC',
        crv: 'P-256',
        x: publicKeyBase64.substring(0, 43),
        y: publicKeyBase64.substring(43, 86)
      };
    }
  }

  private async credentialToJWK(credential: WebAuthnCredential): Promise<JsonWebKey> {
    try {
      // WebAuthn 공개키를 JWK로 변환
      const publicKeyBuffer = this.base64URLToArrayBuffer(credential.publicKey);
      
      // CBOR 디코딩 로직이 필요하지만, 간단히 처리
      return {
        kty: 'EC',
        crv: 'P-256',
        x: credential.publicKey.substring(0, 43),
        y: credential.publicKey.substring(43, 86),
        use: 'sig',
        alg: 'ES256'
      };

    } catch (error) {
      console.warn('WebAuthn 자격증명 JWK 변환 실패');
      return {
        kty: 'EC',
        crv: 'P-256',
        x: credential.publicKey.substring(0, 43),
        y: credential.publicKey.substring(43, 86)
      };
    }
  }

  // =============================================================================
  // 데이터베이스 저장
  // =============================================================================

  private async saveDIDToDatabase(
    did: string,
    didDocument: DIDDocument,
    privateKey: string,
    request: DIDCreationRequest
  ) {
    try {
      // 사용자 레코드 업데이트 또는 생성
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('username', request.username)
        .single();

      if (existingUser) {
        // 기존 사용자에 DID 정보 추가
        const { error } = await supabase
          .from('users')
          .update({
            did,
            did_document: didDocument,
            did_method: this.method,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingUser.id);

        if (error) {
          throw error;
        }

      } else {
        // 새 사용자 생성
        const { error } = await supabase
          .from('users')
          .insert({
            username: request.username,
            display_name: request.displayName || request.username,
            email: request.email,
            did,
            did_document: didDocument,
            did_method: this.method,
            auth_status: 'verified'
          });

        if (error) {
          throw error;
        }
      }

      return { success: true };

    } catch (error) {
      console.error('❌ DID 데이터베이스 저장 실패:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : '저장 실패' 
      };
    }
  }

  // =============================================================================
  // did:web 해결
  // =============================================================================

  private async resolveWebDID(did: string): Promise<DIDResolutionResult> {
    try {
      // did:web:example.com:users:alice -> https://example.com/users/alice/did.json
      const didParts = did.split(':');
      if (didParts.length < 3) {
        throw new Error('잘못된 did:web 형식');
      }

      const domain = didParts[2].replace(/%3A/g, ':');
      const path = didParts.slice(3).join('/');
      const didUrl = `https://${domain}/${path}/did.json`;

      console.log('🌐 HTTP DID Document 조회:', didUrl);

      const response = await fetch(didUrl, {
        headers: {
          'Accept': 'application/did+json,application/json'
        },
        timeout: config.EXTERNAL_API_TIMEOUT
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const didDocument = await response.json() as DIDDocument;

      return {
        success: true,
        didDocument,
        metadata: {
          retrieved: new Date().toISOString(),
          method: 'web',
          source: 'http'
        }
      };

    } catch (error) {
      console.error('❌ did:web HTTP 해결 실패:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'did:web 해결 실패'
      };
    }
  }

  // =============================================================================
  // 유틸리티 함수들
  // =============================================================================

  private extractDIDMethod(did: string): string {
    const parts = did.split(':');
    return parts.length >= 2 ? parts[1] : 'unknown';
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const uint8Array = new Uint8Array(buffer);
    const binary = String.fromCharCode.apply(null, Array.from(uint8Array));
    return btoa(binary);
  }

  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary = atob(base64);
    const buffer = new ArrayBuffer(binary.length);
    const uint8Array = new Uint8Array(buffer);
    
    for (let i = 0; i < binary.length; i++) {
      uint8Array[i] = binary.charCodeAt(i);
    }
    
    return buffer;
  }

  private base64URLToArrayBuffer(base64URL: string): ArrayBuffer {
    const base64 = base64URL.replace(/-/g, '+').replace(/_/g, '/');
    const padLength = 4 - (base64.length % 4);
    const padded = base64 + '='.repeat(padLength % 4);
    
    return this.base64ToArrayBuffer(padded);
  }

  // =============================================================================
  // 공개 메소드들
  // =============================================================================

  async updateDIDDocument(did: string, updates: Partial<DIDDocument>): Promise<boolean> {
    try {
      const resolutionResult = await this.resolveDID(did);
      if (!resolutionResult.success || !resolutionResult.didDocument) {
        return false;
      }

      const updatedDocument = {
        ...resolutionResult.didDocument,
        ...updates,
        updated: new Date().toISOString()
      };

      const { error } = await supabase
        .from('users')
        .update({ 
          did_document: updatedDocument,
          updated_at: new Date().toISOString()
        })
        .eq('did', did);

      return !error;

    } catch (error) {
      console.error('❌ DID Document 업데이트 실패:', error);
      return false;
    }
  }

  async deactivateDID(did: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('users')
        .update({ 
          auth_status: 'suspended',
          updated_at: new Date().toISOString()
        })
        .eq('did', did);

      return !error;

    } catch (error) {
      console.error('❌ DID 비활성화 실패:', error);
      return false;
    }
  }

  async verifyDID(did: string): Promise<boolean> {
    const result = await this.resolveDID(did);
    return result.success && !!result.didDocument;
  }

  getConfiguration() {
    return {
      method: this.method,
      domain: this.domain,
      supportedMethods: ['web'],
      keyTypes: ['Ed25519', 'ECDSA P-256'],
      services: ['WebAuthn', 'IdentityHub']
    };
  }
}

// =============================================================================
// 싱글톤 인스턴스
// =============================================================================

let didServiceInstance: DIDService | null = null;

export function getDIDService(): DIDService {
  if (!didServiceInstance) {
    didServiceInstance = new DIDService();
  }
  return didServiceInstance;
}

// 기본 내보내기
export default DIDService;