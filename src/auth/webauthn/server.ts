// =============================================================================
// 🔐 WebAuthn 서버 구현
// 파일: src/auth/webauthn/server.ts
// =============================================================================

import { 
  generateRegistrationOptions, 
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
  type GenerateRegistrationOptionsOpts,
  type GenerateAuthenticationOptionsOpts,
  type VerifyRegistrationResponseOpts,
  type VerifyAuthenticationResponseOpts,
} from '@simplewebauthn/server';

import type {
  RegistrationResponseJSON,
  AuthenticationResponseJSON,
} from '@simplewebauthn/types';

import { 
  WebAuthnCredential,
  UserInfo,
  AuthResult,
  BiometricCapabilities 
} from '@/types/webauthn';

import { supabase, saveWebAuthnCredential, getWebAuthnCredentials } from '@/lib/database/supabase';
import config from '@/lib/config';

// =============================================================================
// WebAuthn 서버 클래스
// =============================================================================

export class WebAuthnServer {
  private rpName: string;
  private rpID: string;
  private origin: string;

  constructor() {
    this.rpName = config.WEBAUTHN_RP_NAME;
    this.rpID = this.extractRPID(config.WEBAUTHN_ORIGIN);
    this.origin = config.WEBAUTHN_ORIGIN;

    console.log('🔐 WebAuthn 서버 초기화:', {
      rpName: this.rpName,
      rpID: this.rpID,
      origin: this.origin
    });
  }

  private extractRPID(origin: string): string {
    try {
      const url = new URL(origin);
      return url.hostname;
    } catch (error) {
      console.warn('⚠️ Origin에서 RP ID 추출 실패, localhost 사용:', origin);
      return 'localhost';
    }
  }

  // =============================================================================
  // 등록 옵션 생성
  // =============================================================================

  async generateRegistrationOptions(userInfo: UserInfo): Promise<{
    success: boolean;
    options?: any;
    error?: string;
  }> {
    try {
      console.log('📝 WebAuthn 등록 옵션 생성 시작:', userInfo.username);

      // 사용자 ID를 바이트 배열로 변환
      const userID = new TextEncoder().encode(userInfo.id || userInfo.username);

      // 기존 자격증명 조회 (제외용)
      const existingCredentials = await this.getUserCredentials(userInfo.id || userInfo.username);
      const excludeCredentials = existingCredentials.map(cred => ({
        id: this.base64URLToBuffer(cred.credential_id),
        type: 'public-key' as const,
        transports: cred.transports as AuthenticatorTransport[] || []
      }));

      const opts: GenerateRegistrationOptionsOpts = {
        rpName: this.rpName,
        rpID: this.rpID,
        userID,
        userName: userInfo.username,
        userDisplayName: userInfo.displayName,
        timeout: 60000,
        attestationType: 'none',
        excludeCredentials,
        authenticatorSelection: {
          residentKey: 'preferred',
          userVerification: 'preferred',
          authenticatorAttachment: 'platform'
        },
        supportedAlgorithmIDs: [-7, -257] // ES256, RS256
      };

      const options = await generateRegistrationOptions(opts);

      console.log('✅ WebAuthn 등록 옵션 생성 완료');
      return {
        success: true,
        options
      };

    } catch (error) {
      console.error('❌ WebAuthn 등록 옵션 생성 실패:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '등록 옵션 생성 실패'
      };
    }
  }

  // =============================================================================
  // 등록 검증
  // =============================================================================

  async verifyRegistration(
    userInfo: UserInfo,
    registrationResponse: RegistrationResponseJSON,
    expectedChallenge: string
  ): Promise<{
    success: boolean;
    credential?: WebAuthnCredential;
    error?: string;
  }> {
    try {
      console.log('🔍 WebAuthn 등록 검증 시작:', userInfo.username);

      const opts: VerifyRegistrationResponseOpts = {
        response: registrationResponse,
        expectedChallenge,
        expectedOrigin: this.origin,
        expectedRPID: this.rpID,
        requireUserVerification: false
      };

      const verification = await verifyRegistrationResponse(opts);

      if (!verification.verified || !verification.registrationInfo) {
        return {
          success: false,
          error: '등록 검증 실패'
        };
      }

      const { registrationInfo } = verification;

      // WebAuthn 자격증명 객체 생성
      const credential: WebAuthnCredential = {
        id: registrationResponse.id,
        rawId: this.base64URLToBuffer(registrationResponse.id),
        response: {
          clientDataJSON: this.base64URLToBuffer(registrationResponse.response.clientDataJSON),
          attestationObject: this.base64URLToBuffer(registrationResponse.response.attestationObject)
        },
        type: 'public-key',
        publicKey: this.bufferToBase64URL(registrationInfo.credentialPublicKey),
        biometricType: this.detectBiometricType(registrationResponse),
        counter: registrationInfo.counter
      };

      // 데이터베이스에 저장
      const saveResult = await this.saveCredentialToDatabase(
        userInfo, 
        credential, 
        registrationInfo
      );

      if (!saveResult.success) {
        return {
          success: false,
          error: '자격증명 저장 실패'
        };
      }

      console.log('✅ WebAuthn 등록 검증 완료');
      return {
        success: true,
        credential
      };

    } catch (error) {
      console.error('❌ WebAuthn 등록 검증 실패:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '등록 검증 실패'
      };
    }
  }

  // =============================================================================
  // 인증 옵션 생성
  // =============================================================================

  async generateAuthenticationOptions(userInfo?: UserInfo): Promise<{
    success: boolean;
    options?: any;
    error?: string;
  }> {
    try {
      console.log('🔑 WebAuthn 인증 옵션 생성 시작');

      let allowCredentials: any[] = [];

      // 특정 사용자의 자격증명만 허용
      if (userInfo) {
        const userCredentials = await this.getUserCredentials(userInfo.id || userInfo.username);
        allowCredentials = userCredentials.map(cred => ({
          id: this.base64URLToBuffer(cred.credential_id),
          type: 'public-key' as const,
          transports: cred.transports as AuthenticatorTransport[] || []
        }));
      }

      const opts: GenerateAuthenticationOptionsOpts = {
        timeout: 60000,
        allowCredentials: allowCredentials.length > 0 ? allowCredentials : undefined,
        userVerification: 'preferred',
        rpID: this.rpID
      };

      const options = await generateAuthenticationOptions(opts);

      console.log('✅ WebAuthn 인증 옵션 생성 완료');
      return {
        success: true,
        options
      };

    } catch (error) {
      console.error('❌ WebAuthn 인증 옵션 생성 실패:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '인증 옵션 생성 실패'
      };
    }
  }

  // =============================================================================
  // 인증 검증
  // =============================================================================

  async verifyAuthentication(
    authenticationResponse: AuthenticationResponseJSON,
    expectedChallenge: string
  ): Promise<AuthResult> {
    try {
      console.log('🔍 WebAuthn 인증 검증 시작');

      // 자격증명 ID로 데이터베이스에서 조회
      const storedCredential = await this.getStoredCredential(authenticationResponse.id);
      
      if (!storedCredential) {
        return {
          success: false,
          error: '등록되지 않은 자격증명입니다'
        };
      }

      const opts: VerifyAuthenticationResponseOpts = {
        response: authenticationResponse,
        expectedChallenge,
        expectedOrigin: this.origin,
        expectedRPID: this.rpID,
        authenticator: {
          credentialID: this.base64URLToBuffer(storedCredential.credential_id),
          credentialPublicKey: this.base64URLToBuffer(storedCredential.public_key),
          counter: storedCredential.counter || 0,
          transports: storedCredential.transports as AuthenticatorTransport[]
        },
        requireUserVerification: false
      };

      const verification = await verifyAuthenticationResponse(opts);

      if (!verification.verified || !verification.authenticationInfo) {
        return {
          success: false,
          error: '인증 검증 실패'
        };
      }

      // 카운터 업데이트
      await this.updateCredentialCounter(
        storedCredential.id, 
        verification.authenticationInfo.newCounter
      );

      // 사용자 정보 조회
      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('id', storedCredential.user_id)
        .single();

      const result: AuthResult = {
        success: true,
        userDID: userData?.did || undefined,
        credential: {
          id: authenticationResponse.id,
          rawId: this.base64URLToBuffer(authenticationResponse.id),
          response: {
            clientDataJSON: this.base64URLToBuffer(authenticationResponse.response.clientDataJSON),
            attestationObject: new ArrayBuffer(0) // 인증시에는 없음
          },
          type: 'public-key',
          publicKey: storedCredential.public_key,
          biometricType: storedCredential.biometric_type as any,
          counter: verification.authenticationInfo.newCounter
        }
      };

      console.log('✅ WebAuthn 인증 검증 완료');
      return result;

    } catch (error) {
      console.error('❌ WebAuthn 인증 검증 실패:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '인증 검증 실패'
      };
    }
  }

  // =============================================================================
  // 유틸리티 메소드들
  // =============================================================================

  private async saveCredentialToDatabase(
    userInfo: UserInfo,
    credential: WebAuthnCredential,
    registrationInfo: any
  ) {
    try {
      // 사용자 조회 또는 생성
      let userId = userInfo.id;
      
      if (!userId) {
        const { data: existingUser } = await supabase
          .from('users')
          .select('id')
          .eq('username', userInfo.username)
          .single();

        if (existingUser) {
          userId = existingUser.id;
        } else {
          // 새 사용자 생성
          const { data: newUser, error: userError } = await supabase
            .from('users')
            .insert({
              username: userInfo.username,
              display_name: userInfo.displayName,
              email: userInfo.email,
              auth_status: 'verified'
            })
            .select()
            .single();

          if (userError || !newUser) {
            throw new Error('사용자 생성 실패');
          }

          userId = newUser.id;
        }
      }

      // WebAuthn 자격증명 저장
      const credentialData = {
        user_id: userId,
        credential_id: credential.id,
        public_key: credential.publicKey,
        counter: credential.counter || 0,
        biometric_type: credential.biometricType,
        device_name: this.generateDeviceName(credential.biometricType),
        user_agent: '', // 클라이언트에서 전달받아야 함
        platform_info: {
          credentialDeviceType: registrationInfo.credentialDeviceType,
          credentialBackedUp: registrationInfo.credentialBackedUp,
          aaguid: registrationInfo.aaguid?.toString()
        }
      };

      const result = await saveWebAuthnCredential(credentialData);
      return result;

    } catch (error) {
      console.error('❌ 자격증명 데이터베이스 저장 실패:', error);
      return { success: false, error: error instanceof Error ? error.message : '저장 실패' };
    }
  }

  private async getUserCredentials(userIdentifier: string) {
    try {
      // 사용자 ID 또는 username으로 조회
      const { data: user } = await supabase
        .from('users')
        .select('id')
        .or(`id.eq.${userIdentifier},username.eq.${userIdentifier}`)
        .single();

      if (!user) {
        return [];
      }

      const result = await getWebAuthnCredentials(user.id);
      return result.success ? result.data || [] : [];

    } catch (error) {
      console.error('❌ 사용자 자격증명 조회 실패:', error);
      return [];
    }
  }

  private async getStoredCredential(credentialId: string) {
    try {
      const { data, error } = await supabase
        .from('webauthn_credentials')
        .select('*')
        .eq('credential_id', credentialId)
        .eq('is_active', true)
        .single();

      if (error) {
        console.error('❌ 저장된 자격증명 조회 실패:', error);
        return null;
      }

      return data;

    } catch (error) {
      console.error('❌ 저장된 자격증명 조회 중 오류:', error);
      return null;
    }
  }

  private async updateCredentialCounter(credentialId: string, newCounter: number) {
    try {
      const { error } = await supabase
        .from('webauthn_credentials')
        .update({ 
          counter: newCounter,
          last_used: new Date().toISOString(),
          usage_count: supabase.rpc('increment_usage_count', { credential_id: credentialId })
        })
        .eq('id', credentialId);

      if (error) {
        console.error('❌ 자격증명 카운터 업데이트 실패:', error);
      }

    } catch (error) {
      console.error('❌ 자격증명 카운터 업데이트 중 오류:', error);
    }
  }

  private detectBiometricType(response: RegistrationResponseJSON): string {
    // User-Agent나 기타 정보를 기반으로 생체인증 유형 추정
    if (typeof navigator !== 'undefined') {
      const userAgent = navigator.userAgent.toLowerCase();
      
      if (userAgent.includes('mac')) {
        return 'touchid';
      } else if (userAgent.includes('iphone') || userAgent.includes('ipad')) {
        return 'faceid';
      } else if (userAgent.includes('windows')) {
        return 'windowshello';
      }
    }
    
    return 'unknown';
  }

  private generateDeviceName(biometricType?: string): string {
    const deviceNames = {
      touchid: 'MacBook Touch ID',
      faceid: 'iPhone Face ID',
      windowshello: 'Windows Hello',
      unknown: 'Unknown Device'
    };

    return deviceNames[biometricType as keyof typeof deviceNames] || 'Biometric Device';
  }

  // =============================================================================
  // Base64URL 변환 유틸리티
  // =============================================================================

  private base64URLToBuffer(base64URL: string): ArrayBuffer {
    const base64 = base64URL.replace(/-/g, '+').replace(/_/g, '/');
    const padLength = 4 - (base64.length % 4);
    const padded = base64 + '='.repeat(padLength % 4);
    
    const binary = atob(padded);
    const buffer = new ArrayBuffer(binary.length);
    const uint8Array = new Uint8Array(buffer);
    
    for (let i = 0; i < binary.length; i++) {
      uint8Array[i] = binary.charCodeAt(i);
    }
    
    return buffer;
  }

  private bufferToBase64URL(buffer: ArrayBuffer): string {
    const uint8Array = new Uint8Array(buffer);
    const binary = String.fromCharCode.apply(null, Array.from(uint8Array));
    const base64 = btoa(binary);
    
    return base64
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }

  // =============================================================================
  // 플랫폼 기능 확인
  // =============================================================================

  async checkPlatformCapabilities(): Promise<BiometricCapabilities> {
    return {
      supported: true, // 서버에서는 항상 지원
      platformAuthenticator: true,
      touchId: false, // 클라이언트에서 확인 필요
      faceId: false,
      windowsHello: false
    };
  }

  // =============================================================================
  // 설정 정보 반환
  // =============================================================================

  getConfiguration() {
    return {
      rpName: this.rpName,
      rpID: this.rpID,
      origin: this.origin,
      timeout: 60000,
      userVerification: 'preferred' as const,
      attestation: 'none' as const
    };
  }
}

// =============================================================================
// 싱글톤 인스턴스
// =============================================================================

let webAuthnServerInstance: WebAuthnServer | null = null;

export function getWebAuthnServer(): WebAuthnServer {
  if (!webAuthnServerInstance) {
    webAuthnServerInstance = new WebAuthnServer();
  }
  return webAuthnServerInstance;
}

// 기본 내보내기
export default WebAuthnServer;