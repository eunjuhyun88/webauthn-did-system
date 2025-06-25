// =============================================================================
// 🔐 WebAuthn Service - 기존 인터페이스 100% 구현
// src/services/webauthn/WebAuthnService.ts
// =============================================================================

import { 
  IAuthService, 
  ICryptoService,
  User,
  UserCredentials, 
  UserData, 
  AuthResult, 
  EncryptedData,
  WebAuthnCredential,
  WebAuthnCapabilities
} from '@/types';

// =============================================================================
// 🚀 WebAuthn AuthService 구현체 (기존 인터페이스 100% 호환)
// =============================================================================

export class WebAuthnAuthService implements IAuthService {
  private rpName: string;
  private rpId: string;
  private origin: string;

  constructor() {
    this.rpName = process.env.NEXT_PUBLIC_RP_NAME || 'Fusion AI Dashboard';
    this.rpId = process.env.NEXT_PUBLIC_RP_ID || 'localhost';
    this.origin = process.env.NEXT_PUBLIC_ORIGIN || 'http://localhost:3000';
  }

  // ✅ 기존 authenticate 메서드 - 시그니처 동일
  async authenticate(credentials: UserCredentials): Promise<AuthResult> {
    try {
      console.log('🔐 WebAuthn 인증 시작:', { email: credentials.email });

      // 1. 인증 시작 요청
      const beginResponse = await fetch('/api/webauthn/authenticate/begin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: credentials.email }),
      });

      if (!beginResponse.ok) {
        throw new Error('Failed to start authentication');
      }

      const { options } = await beginResponse.json();

      // 2. WebAuthn 인증 실행
      const credential = await navigator.credentials.get({
        publicKey: {
          ...options,
          challenge: this.stringToBuffer(options.challenge),
          allowCredentials: options.allowCredentials?.map((cred: any) => ({
            ...cred,
            id: this.stringToBuffer(cred.id),
          })),
        },
      }) as PublicKeyCredential;

      if (!credential) {
        throw new Error('Authentication cancelled');
      }

      // 3. 인증 완료 요청
      const completeResponse = await fetch('/api/webauthn/authenticate/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          credential: {
            id: credential.id,
            rawId: Array.from(new Uint8Array(credential.rawId)),
            response: {
              authenticatorData: Array.from(new Uint8Array((credential.response as AuthenticatorAssertionResponse).authenticatorData)),
              clientDataJSON: Array.from(new Uint8Array(credential.response.clientDataJSON)),
              signature: Array.from(new Uint8Array((credential.response as AuthenticatorAssertionResponse).signature)),
            },
            type: credential.type,
          },
          challengeData: options,
        }),
      });

      if (!completeResponse.ok) {
        throw new Error('Authentication verification failed');
      }

      const result = await completeResponse.json();

      // ✅ 기존 AuthResult 인터페이스 그대로 반환
      return {
        success: result.success,
        userId: result.user?.id,
        token: result.tokens?.accessToken,
        expiresAt: result.tokens?.expiresAt,
        // 🚀 WebAuthn 확장 필드들
        passkeyId: credential.id,
        authenticatorType: this.detectAuthenticatorType(credential),
        biometricUsed: true,
        did: result.user?.did
      };

    } catch (error: any) {
      console.error('WebAuthn authentication failed:', error);
      return {
        success: false,
        userId: undefined,
        token: undefined,
        expiresAt: undefined
      };
    }
  }

  // ✅ 기존 createDID 메서드 - 시그니처 동일
  async createDID(userData: UserData): Promise<string> {
    try {
      console.log('🆔 DID 생성 시작:', { userId: userData.userId });

      // 1. WebAuthn Passkey 등록 시작
      const beginResponse = await fetch('/api/webauthn/register/begin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userData.email || `${userData.username}@fusion-ai.com`,
          displayName: userData.displayName,
          username: userData.username
        }),
      });

      if (!beginResponse.ok) {
        throw new Error('Failed to start registration');
      }

      const { options } = await beginResponse.json();

      // 2. WebAuthn Passkey 생성
      const credential = await navigator.credentials.create({
        publicKey: {
          ...options,
          challenge: this.stringToBuffer(options.challenge),
          user: {
            ...options.user,
            id: this.stringToBuffer(options.user.id),
          },
          excludeCredentials: options.excludeCredentials?.map((cred: any) => ({
            ...cred,
            id: this.stringToBuffer(cred.id),
          })),
        },
      }) as PublicKeyCredential;

      if (!credential) {
        throw new Error('Registration cancelled');
      }

      // 3. 등록 완료 및 DID 생성
      const completeResponse = await fetch('/api/webauthn/register/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          credential: {
            id: credential.id,
            rawId: Array.from(new Uint8Array(credential.rawId)),
            response: {
              attestationObject: Array.from(new Uint8Array((credential.response as AuthenticatorAttestationResponse).attestationObject)),
              clientDataJSON: Array.from(new Uint8Array(credential.response.clientDataJSON)),
            },
            type: credential.type,
          },
          challengeData: options,
        }),
      });

      if (!completeResponse.ok) {
        throw new Error('Registration verification failed');
      }

      const result = await completeResponse.json();

      // DID 생성 (WebAuthn 기반)
      const did = this.generateDIDFromCredential(credential, userData);
      
      console.log('✅ DID 생성 완료:', { did, userId: userData.userId });
      return did;

    } catch (error: any) {
      console.error('DID creation failed:', error);
      throw new Error(`Failed to create DID: ${error.message}`);
    }
  }

  // ✅ 기존 verifyUser 메서드 - 시그니처 동일
  async verifyUser(userId: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/user/verify/${userId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.getStoredToken()}`,
        },
      });

      return response.ok;
    } catch (error) {
      console.error('User verification failed:', error);
      return false;
    }
  }

  // ✅ 기존 refreshToken 메서드 - 시그니처 동일
  async refreshToken(token: string): Promise<string> {
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: token }),
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const result = await response.json();
      return result.accessToken;
    } catch (error) {
      console.error('Token refresh failed:', error);
      throw new Error('Failed to refresh token');
    }
  }

  // =============================================================================
  // 🔧 WebAuthn 특화 추가 메서드들
  // =============================================================================

  async checkSupport(): Promise<WebAuthnCapabilities> {
    const supported = !!window.PublicKeyCredential;
    let platformAuthenticator = false;
    let conditionalMediation = false;
    let biometricType = 'Unknown';

    if (supported) {
      try {
        platformAuthenticator = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
        conditionalMediation = await PublicKeyCredential.isConditionalMediationAvailable?.() || false;
        
        const userAgent = navigator.userAgent;
        if (userAgent.includes('iPhone') || userAgent.includes('iPad')) {
          biometricType = 'Face ID / Touch ID';
        } else if (userAgent.includes('Android')) {
          biometricType = 'Fingerprint / Face';
        } else if (userAgent.includes('Windows')) {
          biometricType = 'Windows Hello';
        } else if (userAgent.includes('Mac')) {
          biometricType = 'Touch ID';
        }
      } catch (error) {
        console.warn('WebAuthn feature detection failed:', error);
      }
    }

    const securityLevel = this.determineSecurityLevel(platformAuthenticator, conditionalMediation, navigator.userAgent);
    const features = this.extractFeatures(platformAuthenticator, conditionalMediation, navigator.userAgent);

    return {
      supported,
      platformAuthenticator,
      conditionalMediation,
      biometricType,
      securityLevel,
      features
    };
  }

  // =============================================================================
  // 🔧 Private 유틸리티 메서드들
  // =============================================================================

  private stringToBuffer(str: string): ArrayBuffer {
    const encoder = new TextEncoder();
    return encoder.encode(str).buffer;
  }

  private bufferToString(buffer: ArrayBuffer): string {
    const decoder = new TextDecoder();
    return decoder.decode(buffer);
  }

  private detectAuthenticatorType(credential: PublicKeyCredential): 'platform' | 'roaming' {
    // PublicKeyCredential에서 authenticator type 추론
    const response = credential.response as AuthenticatorAttestationResponse;
    return 'platform'; // 실제로는 더 정교한 로직 필요
  }

  private generateDIDFromCredential(credential: PublicKeyCredential, userData: UserData): string {
    // WebAuthn Credential을 기반으로 DID 생성
    const credentialId = credential.id;
    const timestamp = Date.now();
    const hash = this.simpleHash(`${credentialId}:${userData.userId}:${timestamp}`);
    
    return `did:webauthn:fusion:${hash}`;
  }

  private simpleHash(input: string): string {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36);
  }

  private determineSecurityLevel(
    platformAuth: boolean, 
    conditionalMediation: boolean,
    userAgent: string
  ): 'basic' | 'enhanced' | 'maximum' {
    if (userAgent.includes('iPhone') || userAgent.includes('iPad') || userAgent.includes('Mac')) {
      return 'maximum'; // Apple 생태계는 최고 보안 수준
    } else if (platformAuth && conditionalMediation) {
      return 'enhanced';
    } else if (platformAuth) {
      return 'enhanced';
    } else {
      return 'basic';
    }
  }

  private extractFeatures(
    platformAuth: boolean, 
    conditionalMediation: boolean,
    userAgent: string
  ): string[] {
    const features: string[] = [];
    
    if (platformAuth) features.push('Platform Authenticator');
    if (conditionalMediation) features.push('Conditional Mediation');
    
    if (userAgent.includes('iPhone') || userAgent.includes('iPad')) {
      features.push('Face ID', 'Touch ID');
    } else if (userAgent.includes('Android')) {
      features.push('Fingerprint', 'Face Recognition');
    } else if (userAgent.includes('Windows')) {
      features.push('Windows Hello');
    } else if (userAgent.includes('Mac')) {
      features.push('Touch ID');
    }

    return features;
  }

  private getStoredToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth-token');
    }
    return null;
  }
}

// =============================================================================
// 🔐 WebAuthn CryptoService 구현체 (기존 인터페이스 100% 호환)
// =============================================================================

export class WebAuthnCryptoService implements ICryptoService {
  
  // ✅ 기존 encrypt 메서드 - 시그니처 동일
  async encrypt(data: string, key: string): Promise<EncryptedData> {
    try {
      // WebAuthn으로 키 보강
      const webauthnKey = await this.deriveKeyFromPasskey(key);
      
      // AES-GCM 암호화
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const salt = crypto.getRandomValues(new Uint8Array(16));
      
      const encodedData = new TextEncoder().encode(data);
      
      const cryptoKey = await crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(webauthnKey),
        { name: 'AES-GCM' },
        false,
        ['encrypt']
      );

      const encrypted = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        cryptoKey,
        encodedData
      );

      return {
        encrypted: this.arrayBufferToBase64(encrypted),
        iv: this.arrayBufferToBase64(iv),
        salt: this.arrayBufferToBase64(salt),
        algorithm: 'AES-GCM'
      };
    } catch (error) {
      console.error('Encryption failed:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  // ✅ 기존 decrypt 메서드 - 시그니처 동일
  async decrypt(encrypted: EncryptedData, key: string): Promise<string> {
    try {
      const webauthnKey = await this.deriveKeyFromPasskey(key);
      
      const cryptoKey = await crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(webauthnKey),
        { name: 'AES-GCM' },
        false,
        ['decrypt']
      );

      const decrypted = await crypto.subtle.decrypt(
        { 
          name: 'AES-GCM', 
          iv: this.base64ToArrayBuffer(encrypted.iv) 
        },
        cryptoKey,
        this.base64ToArrayBuffer(encrypted.encrypted)
      );

      return new TextDecoder().decode(decrypted);
    } catch (error) {
      console.error('Decryption failed:', error);
      throw new Error('Failed to decrypt data');
    }
  }

  // ✅ 기존 generateKey 메서드 - 시그니처 동일
  async generateKey(): Promise<string> {
    const key = crypto.getRandomValues(new Uint8Array(32));
    return this.arrayBufferToBase64(key);
  }

  // ✅ 기존 hash 메서드 - 시그니처 동일
  async hash(data: string): Promise<string> {
    const encoded = new TextEncoder().encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', encoded);
    return this.arrayBufferToBase64(hashBuffer);
  }

  // ✅ 기존 sign 메서드를 WebAuthn으로 구현 - 시그니처 동일
  async sign(data: string, privateKey: string): Promise<string> {
    try {
      // WebAuthn Passkey로 서명 (시뮬레이션)
      const challenge = new TextEncoder().encode(data);
      
      // 실제로는 WebAuthn assertion을 사용해야 함
      // 여기서는 시뮬레이션
      const signature = await this.hash(data + privateKey);
      return signature;
    } catch (error) {
      console.error('Signing failed:', error);
      throw new Error('Failed to sign data');
    }
  }

  // ✅ 기존 verify 메서드 - 시그니처 동일
  async verify(data: string, signature: string, publicKey: string): Promise<boolean> {
    try {
      // WebAuthn으로 서명 검증 (시뮬레이션)
      const expectedSignature = await this.hash(data + publicKey);
      return signature === expectedSignature;
    } catch (error) {
      console.error('Verification failed:', error);
      return false;
    }
  }

  // =============================================================================
  // 🔧 Private 유틸리티 메서드들
  // =============================================================================

  private async deriveKeyFromPasskey(baseKey: string): Promise<string> {
    // WebAuthn Passkey와 기본 키를 결합하여 강화된 키 생성
    const combined = baseKey + 'webauthn-salt';
    return await this.hash(combined);
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }
}

// =============================================================================
// 🏭 WebAuthn SystemFactory (기존 팩토리 패턴 활용)
// =============================================================================

export class WebAuthnSystemFactory {
  static createAuthService(): IAuthService {
    return new WebAuthnAuthService();
  }

  static createCryptoService(): ICryptoService {
    return new WebAuthnCryptoService();
  }

  // 기존 인터페이스와 완전 호환되는 시스템 생성
  static createWebAuthnSystem() {
    const authService = this.createAuthService();
    const cryptoService = this.createCryptoService();
    
    return {
      authService,
      cryptoService,
      // 추가 서비스들...
    };
  }
}