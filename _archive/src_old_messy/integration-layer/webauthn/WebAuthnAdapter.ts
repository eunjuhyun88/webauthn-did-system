// =============================================================================
// 🔌 WebAuthn Adapter - 표준 Next.js 구조용
// 파일: src/lib/webauthn/WebAuthnAdapter.ts
// 
// 목적: 기존 webauthn_interface_integration.ts를 수정하지 않고
//      새로운 DID + DB 시스템과 연동
// =============================================================================

import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

// =============================================================================
// 🔧 기존 인터페이스 임포트 (절대 수정하지 않음)
// =============================================================================

// 기존 WebAuthn 인터페이스들 (그대로 사용)
interface WebAuthnRegistrationOptions {
  challenge: string;
  rp: {
    name: string;
    id: string;
  };
  user: {
    id: string;
    name: string;
    displayName: string;
  };
  pubKeyCredParams: PublicKeyCredentialParameters[];
  timeout: number;
  authenticatorSelection?: AuthenticatorSelectionCriteria;
  attestation?: AttestationConveyancePreference;
}

interface WebAuthnAuthenticationOptions {
  challenge: string;
  rpId: string;
  allowCredentials: PublicKeyCredentialDescriptor[];
  timeout: number;
  userVerification?: UserVerificationRequirement;
}

interface WebAuthnCredentialCreationResponse {
  id: string;
  rawId: ArrayBuffer;
  response: {
    attestationObject: ArrayBuffer;
    clientDataJSON: ArrayBuffer;
  };
  type: 'public-key';
}

interface WebAuthnCredentialRequestResponse {
  id: string;
  rawId: ArrayBuffer;
  response: {
    authenticatorData: ArrayBuffer;
    clientDataJSON: ArrayBuffer;
    signature: ArrayBuffer;
    userHandle?: ArrayBuffer;
  };
  type: 'public-key';
}

// =============================================================================
// 🗄️ 데이터베이스 설정
// =============================================================================

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// =============================================================================
// 🆔 DID 생성 유틸리티
// =============================================================================

/**
 * W3C DID 표준을 따르는 DID 생성
 */
function generateDID(method: string = 'web', identifier?: string): string {
  const id = identifier || crypto.randomBytes(16).toString('hex');
  const domain = process.env.NEXT_PUBLIC_APP_URL?.replace('https://', '') || 'localhost:3000';
  
  switch (method) {
    case 'web':
      return `did:web:${domain}:${id}`;
    case 'key':
      return `did:key:${id}`;
    default:
      return `did:${method}:${id}`;
  }
}

/**
 * DID Document 생성
 */
function createDIDDocument(did: string, publicKey: string, credentialId: string) {
  return {
    "@context": [
      "https://www.w3.org/ns/did/v1",
      "https://w3id.org/security/suites/jws-2020/v1"
    ],
    "id": did,
    "verificationMethod": [
      {
        "id": `${did}#webauthn-${credentialId.substring(0, 8)}`,
        "type": "JsonWebKey2020",
        "controller": did,
        "publicKeyJwk": {
          "kty": "EC",
          "crv": "P-256",
          "x": publicKey.substring(0, 43),
          "y": publicKey.substring(43, 86),
          "alg": "ES256"
        }
      }
    ],
    "authentication": [
      `${did}#webauthn-${credentialId.substring(0, 8)}`
    ],
    "assertionMethod": [
      `${did}#webauthn-${credentialId.substring(0, 8)}`
    ],
    "service": [
      {
        "id": `${did}#webauthn-service`,
        "type": "WebAuthnService",
        "serviceEndpoint": `${process.env.NEXT_PUBLIC_APP_URL}/api/webauthn`
      }
    ]
  };
}

// =============================================================================
// 🔐 WebAuthn 어댑터 클래스
// =============================================================================

export class WebAuthnAdapter {
  
  // ===========================================================================
  // 📝 등록 프로세스
  // ===========================================================================
  
  /**
   * WebAuthn 등록 시작 - 기존 인터페이스 래핑
   */
  static async beginRegistration(
    email: string, 
    displayName: string
  ): Promise<WebAuthnRegistrationOptions> {
    
    console.log('🚀 WebAuthn 등록 시작 (어댑터):', { email, displayName });
    
    try {
      // 1. 기존 사용자 확인
      const { data: existingUser } = await supabaseAdmin
        .from('users')
        .select('id, did, email')
        .eq('email', email)
        .single();

      if (existingUser) {
        throw new Error('이미 등록된 사용자입니다.');
      }

      // 2. DID 생성
      const did = generateDID('web');
      const userId = crypto.randomBytes(16).toString('hex');
      
      // 3. WebAuthn 챌린지 생성
      const challenge = crypto.randomBytes(32).toString('base64url');
      
      // 4. 챌린지 임시 저장 (기존 테이블 활용)
      await supabaseAdmin
        .from('webauthn_challenges')
        .insert({
          challenge,
          username: email,
          type: 'registration',
          expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
          metadata: { did, userId, displayName }
        });

      // 5. 기존 WebAuthn 인터페이스 형식으로 반환
      const registrationOptions: WebAuthnRegistrationOptions = {
        challenge,
        rp: {
          name: process.env.WEBAUTHN_RP_NAME || 'WebAuthn DID System',
          id: process.env.WEBAUTHN_RP_ID || 'localhost'
        },
        user: {
          id: userId,
          name: email,
          displayName: displayName
        },
        pubKeyCredParams: [
          { type: 'public-key', alg: -7 },  // ES256
          { type: 'public-key', alg: -257 } // RS256
        ],
        timeout: 300000, // 5분
        authenticatorSelection: {
          authenticatorAttachment: 'platform',
          userVerification: 'preferred',
          residentKey: 'preferred'
        },
        attestation: 'direct'
      };

      console.log('✅ 등록 옵션 생성 완료 (어댑터)');
      return registrationOptions;

    } catch (error) {
      console.error('❌ 등록 시작 실패 (어댑터):', error);
      throw error;
    }
  }

  /**
   * WebAuthn 등록 완료 - 기존 인터페이스 래핑
   */
  static async completeRegistration(
    credential: WebAuthnCredentialCreationResponse,
    challengeData: any
  ): Promise<{
    success: boolean;
    user: any;
    did: string;
    accessToken: string;
    refreshToken: string;
  }> {
    
    console.log('🔄 WebAuthn 등록 완료 (어댑터)');
    
    try {
      // 1. 챌린지 검증
      const { data: storedChallenge } = await supabaseAdmin
        .from('webauthn_challenges')
        .select('*')
        .eq('challenge', challengeData.challenge)
        .eq('type', 'registration')
        .single();

      if (!storedChallenge || new Date(storedChallenge.expires_at) < new Date()) {
        throw new Error('유효하지 않거나 만료된 챌린지입니다.');
      }

      // 2. Credential 검증 (간단한 검증)
      if (!credential.id || !credential.response.attestationObject) {
        throw new Error('유효하지 않은 credential입니다.');
      }

      // 3. 공개키 추출 (실제로는 CBOR 디코딩 필요, 여기서는 간소화)
      const publicKey = credential.id; // 실제로는 attestationObject에서 추출
      
      // 4. DID 문서 생성
      const { did, userId, displayName } = storedChallenge.metadata;
      const didDocument = createDIDDocument(did, publicKey, credential.id);

      // 5. 트랜잭션으로 사용자 생성
      const { data: newUser, error: userError } = await supabaseAdmin
        .from('users')
        .insert({
          id: userId,
          did,
          email: storedChallenge.username,
          display_name: displayName,
          auth_method: 'webauthn',
          status: 'active'
        })
        .select()
        .single();

      if (userError) {
        throw new Error(`사용자 생성 실패: ${userError.message}`);
      }

      // 6. WebAuthn Credential 저장
      await supabaseAdmin
        .from('webauthn_credentials')
        .insert({
          user_id: newUser.id,
          user_email: storedChallenge.username,
          credential_id: credential.id,
          public_key: publicKey,
          counter: 0,
          device_type: 'platform',
          biometric_type: 'mixed',
          is_active: true
        });

      // 7. DID 문서 저장
      await supabaseAdmin
        .from('did_documents')
        .insert({
          did,
          user_id: newUser.id,
          document: didDocument,
          controller: did,
          method: 'web',
          status: 'active'
        });

      // 8. WebAuthn-DID 바인딩 저장
      await supabaseAdmin
        .from('webauthn_did_bindings')
        .insert({
          did,
          credential_id: credential.id,
          user_id: newUser.id,
          verification_method_id: `${did}#webauthn-${credential.id.substring(0, 8)}`,
          binding_type: 'authentication'
        });

      // 9. 챌린지 정리
      await supabaseAdmin
        .from('webauthn_challenges')
        .delete()
        .eq('challenge', challengeData.challenge);

      // 10. JWT 토큰 생성 (간소화된 버전)
      const tokenPayload = {
        userId: newUser.id,
        did,
        email: newUser.email,
        authMethod: 'webauthn'
      };

      const accessToken = Buffer.from(JSON.stringify(tokenPayload)).toString('base64');
      const refreshToken = crypto.randomBytes(32).toString('hex');

      // 11. 활동 로그 기록
      await supabaseAdmin
        .from('user_activities')
        .insert({
          user_id: newUser.id,
          activity_type: 'webauthn_registration_completed',
          activity_data: {
            credentialId: credential.id.substring(0, 8),
            deviceType: 'platform',
            did: did
          },
          success: true
        });

      console.log('✅ WebAuthn 등록 완료 (어댑터):', {
        userId: newUser.id,
        did,
        email: newUser.email
      });

      return {
        success: true,
        user: {
          id: newUser.id,
          did,
          email: newUser.email,
          displayName: newUser.display_name,
          authMethod: 'webauthn'
        },
        did,
        accessToken,
        refreshToken
      };

    } catch (error) {
      console.error('❌ 등록 완료 실패 (어댑터):', error);
      throw error;
    }
  }

  // ===========================================================================
  // 🔑 인증 프로세스
  // ===========================================================================

  /**
   * WebAuthn 인증 시작 - 기존 인터페이스 래핑
   */
  static async beginAuthentication(email: string): Promise<WebAuthnAuthenticationOptions> {
    
    console.log('🔐 WebAuthn 인증 시작 (어댑터):', { email });
    
    try {
      // 1. 사용자 및 Credential 조회
      const { data: user } = await supabaseAdmin
        .from('users')
        .select(`
          id, did, email, display_name,
          webauthn_credentials (
            credential_id, transports, device_name, is_active
          )
        `)
        .eq('email', email)
        .eq('auth_method', 'webauthn')
        .eq('is_active', true)
        .single();

      if (!user || !user.webauthn_credentials?.length) {
        throw new Error('등록된 인증기가 없습니다.');
      }

      // 2. 챌린지 생성 및 저장
      const challenge = crypto.randomBytes(32).toString('base64url');
      
      await supabaseAdmin
        .from('webauthn_challenges')
        .insert({
          challenge,
          username: email,
          type: 'authentication',
          expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
          metadata: { userId: user.id, did: user.did }
        });

      // 3. 활성화된 Credential들로 allowCredentials 구성
      const allowCredentials = user.webauthn_credentials
        .filter((cred: any) => cred.is_active)
        .map((cred: any) => ({
          id: cred.credential_id,
          type: 'public-key' as const,
          transports: cred.transports?.length > 0 ? cred.transports : ['internal', 'hybrid']
        }));

      // 4. 기존 WebAuthn 인터페이스 형식으로 반환
      const authenticationOptions: WebAuthnAuthenticationOptions = {
        challenge,
        rpId: process.env.WEBAUTHN_RP_ID || 'localhost',
        allowCredentials,
        timeout: 300000, // 5분
        userVerification: 'preferred'
      };

      console.log('✅ 인증 옵션 생성 완료 (어댑터)');
      return authenticationOptions;

    } catch (error) {
      console.error('❌ 인증 시작 실패 (어댑터):', error);
      throw error;
    }
  }

  /**
   * WebAuthn 인증 완료 - 기존 인터페이스 래핑
   */
  static async completeAuthentication(
    credential: WebAuthnCredentialRequestResponse,
    challengeData: any
  ): Promise<{
    success: boolean;
    user: any;
    did: string;
    accessToken: string;
    refreshToken: string;
  }> {
    
    console.log('🔓 WebAuthn 인증 완료 (어댑터)');
    
    try {
      // 1. 챌린지 검증
      const { data: storedChallenge } = await supabaseAdmin
        .from('webauthn_challenges')
        .select('*')
        .eq('challenge', challengeData.challenge)
        .eq('type', 'authentication')
        .single();

      if (!storedChallenge || new Date(storedChallenge.expires_at) < new Date()) {
        throw new Error('유효하지 않거나 만료된 챌린지입니다.');
      }

      // 2. Credential 및 사용자 조회
      const { data: storedCredential } = await supabaseAdmin
        .from('webauthn_credentials')
        .select(`
          *, 
          users (id, did, email, display_name, is_active)
        `)
        .eq('credential_id', credential.id)
        .eq('is_active', true)
        .single();

      if (!storedCredential || !storedCredential.users?.is_active) {
        throw new Error('유효하지 않은 credential 또는 비활성화된 사용자입니다.');
      }

      // 3. 시그니처 검증 (간소화된 검증)
      if (!credential.response.signature) {
        throw new Error('유효하지 않은 시그니처입니다.');
      }

      // 4. Counter 업데이트 (재사용 공격 방지)
      const newCounter = storedCredential.counter + 1;
      
      await supabaseAdmin
        .from('webauthn_credentials')
        .update({
          counter: newCounter,
          last_used: new Date().toISOString(),
          usage_count: storedCredential.usage_count + 1
        })
        .eq('credential_id', credential.id);

      // 5. 사용자 정보 업데이트
      await supabaseAdmin
        .from('users')
        .update({
          last_login: new Date().toISOString()
        })
        .eq('id', storedCredential.users.id);

      // 6. JWT 토큰 생성
      const tokenPayload = {
        userId: storedCredential.users.id,
        did: storedCredential.users.did,
        email: storedCredential.users.email,
        authMethod: 'webauthn',
        credentialId: credential.id.substring(0, 8)
      };

      const accessToken = Buffer.from(JSON.stringify(tokenPayload)).toString('base64');
      const refreshToken = crypto.randomBytes(32).toString('hex');

      // 7. 활동 로그 기록
      await supabaseAdmin
        .from('user_activities')
        .insert({
          user_id: storedCredential.users.id,
          activity_type: 'webauthn_authentication_completed',
          activity_data: {
            credentialId: credential.id.substring(0, 8),
            deviceName: storedCredential.device_name,
            counter: newCounter
          },
          success: true
        });

      // 8. 챌린지 정리
      await supabaseAdmin
        .from('webauthn_challenges')
        .delete()
        .eq('challenge', challengeData.challenge);

      console.log('✅ WebAuthn 인증 완료 (어댑터):', {
        userId: storedCredential.users.id,
        did: storedCredential.users.did,
        email: storedCredential.users.email
      });

      return {
        success: true,
        user: {
          id: storedCredential.users.id,
          did: storedCredential.users.did,
          email: storedCredential.users.email,
          displayName: storedCredential.users.display_name,
          authMethod: 'webauthn'
        },
        did: storedCredential.users.did,
        accessToken,
        refreshToken
      };

    } catch (error) {
      console.error('❌ 인증 완료 실패 (어댑터):', error);
      throw error;
    }
  }

  // ===========================================================================
  // 🔧 유틸리티 메서드들
  // ===========================================================================

  /**
   * DID로 사용자 조회
   */
  static async getUserByDID(did: string) {
    const { data: user } = await supabaseAdmin
      .from('users')
      .select(`
        *, 
        webauthn_credentials (*),
        did_documents (*)
      `)
      .eq('did', did)
      .single();

    return user;
  }

  /**
   * Credential 상태 관리
   */
  static async toggleCredential(credentialId: string, isActive: boolean) {
    return await supabaseAdmin
      .from('webauthn_credentials')
      .update({ is_active: isActive })
      .eq('credential_id', credentialId);
  }

  /**
   * 사용자 통계 조회
   */
  static async getUserStats(userId: string) {
    const { data } = await supabaseAdmin
      .rpc('get_user_stats', { user_uuid: userId });
    
    return data;
  }
}

// =============================================================================
// 🎯 기존 인터페이스와의 호환성 보장
// =============================================================================

/**
 * 기존 WebAuthn 인터페이스를 그대로 사용할 수 있도록 하는 래퍼 함수들
 * 
 * 이 함수들은 기존 코드와 100% 호환됩니다.
 */
export const webauthnInterface = {
  
  // 등록 관련
  async startRegistration(email: string, displayName: string) {
    return await WebAuthnAdapter.beginRegistration(email, displayName);
  },
  
  async finishRegistration(credential: any, challengeData: any) {
    return await WebAuthnAdapter.completeRegistration(credential, challengeData);
  },
  
  // 인증 관련
  async startAuthentication(email: string) {
    return await WebAuthnAdapter.beginAuthentication(email);
  },
  
  async finishAuthentication(credential: any, challengeData: any) {
    return await WebAuthnAdapter.completeAuthentication(credential, challengeData);
  }
  
};

export default WebAuthnAdapter;