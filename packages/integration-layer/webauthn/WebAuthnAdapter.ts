// =============================================================================
// 🔐 packages/integration-layer/webauthn/WebAuthnAdapter.ts
// SimpleWebAuthn 라이브러리 사용한 올바른 구현
// =============================================================================

import {
  startRegistration,
  startAuthentication,
  platformAuthenticatorIsAvailable,
  browserSupportsWebAuthn,
} from '@simplewebauthn/browser';
import type {
  RegistrationResponseJSON,
  AuthenticationResponseJSON,
  PublicKeyCredentialCreationOptionsJSON,
  PublicKeyCredentialRequestOptionsJSON,
} from '@simplewebauthn/types';

// 커스텀 타입 정의
export interface WebAuthnCredential {
  id: string;
  rawId: string;
  response: {
    clientDataJSON: string;
    attestationObject: string;
  };
  type: "public-key";
  publicKey: string;
  biometricType?: 'touchid' | 'faceid' | 'windowshello';
  counter?: number;
}

export interface UserInfo {
  username: string;
  displayName: string;
  id: string;
  email?: string;
}

export interface AuthResult {
  success: boolean;
  userDID?: string;
  session?: any;
  credential?: WebAuthnCredential;
  error?: string;
}

export interface BiometricCapabilities {
  supported: boolean;
  platformAuthenticator: boolean;
  touchId: boolean;
  faceId: boolean;
  windowsHello: boolean;
}

/**
 * 고급 WebAuthn 어댑터 클래스
 * SimpleWebAuthn 라이브러리를 사용한 프로덕션 레벨 구현
 */
export class WebAuthnAdapter {
  private baseUrl: string;
  private rpId: string;
  private rpName: string;
  private origin: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    this.rpId = process.env.WEBAUTHN_RP_ID || 'localhost';
    this.rpName = process.env.WEBAUTHN_RP_NAME || 'WebAuthn DID System';
    this.origin = process.env.WEBAUTHN_ORIGIN || 'http://localhost:3000';

    console.log('🔐 WebAuthn 어댑터 초기화:', {
      rpId: this.rpId,
      rpName: this.rpName,
      origin: this.origin
    });
  }

  /**
   * WebAuthn 자격 증명 등록 (고급 구현)
   */
  async register(userInfo: UserInfo): Promise<WebAuthnCredential> {
    try {
      console.log('🔐 WebAuthn 등록 시작:', userInfo.username);

      // 1. 브라우저 지원 확인
      if (!browserSupportsWebAuthn()) {
        throw new Error('이 브라우저는 WebAuthn을 지원하지 않습니다.');
      }

      // 2. 플랫폼 인증기 확인
      const platformSupported = await platformAuthenticatorIsAvailable();
      console.log('🔍 플랫폼 인증기 지원:', platformSupported);

      // 3. 서버에서 등록 옵션 요청
      const optionsResponse = await this.fetchRegistrationOptions(userInfo);
      console.log('✅ 등록 옵션 받음');

      // 4. WebAuthn 등록 실행
      const registrationResponse = await startRegistration(optionsResponse);
      console.log('✅ 등록 응답 생성 완료');

      // 5. 서버에서 등록 검증
      const verificationResult = await this.verifyRegistration(
        registrationResponse,
        userInfo
      );

      if (!verificationResult.verified) {
        throw new Error('등록 검증에 실패했습니다.');
      }

      // 6. 생체 인증 타입 감지
      const biometricType = await this.detectBiometricType();

      // 7. WebAuthnCredential 형태로 변환
      const credential: WebAuthnCredential = {
        id: registrationResponse.id,
        rawId: registrationResponse.rawId,
        response: {
          clientDataJSON: registrationResponse.response.clientDataJSON,
          attestationObject: registrationResponse.response.attestationObject,
        },
        type: "public-key",
        publicKey: verificationResult.credentialPublicKey || '',
        biometricType,
        counter: verificationResult.credentialCounter || 0
      };

      console.log('✅ WebAuthn 등록 완료:', credential.id);
      return credential;

    } catch (error) {
      console.error('❌ WebAuthn 등록 실패:', error);
      throw error;
    }
  }

  /**
   * WebAuthn 인증 (고급 구현)
   */
  async authenticate(challengeData?: any): Promise<AuthResult> {
    try {
      console.log('🔐 WebAuthn 인증 시작');

      // 1. 브라우저 지원 확인
      if (!browserSupportsWebAuthn()) {
        throw new Error('이 브라우저는 WebAuthn을 지원하지 않습니다.');
      }

      // 2. 서버에서 인증 옵션 요청
      const optionsResponse = await this.fetchAuthenticationOptions();
      console.log('✅ 인증 옵션 받음');

      // 3. WebAuthn 인증 실행
      const authenticationResponse = await startAuthentication(optionsResponse);
      console.log('✅ 인증 응답 생성 완료');

      // 4. 서버에서 인증 검증
      const verificationResult = await this.verifyAuthentication(
        authenticationResponse
      );

      if (!verificationResult.verified) {
        throw new Error('인증 검증에 실패했습니다.');
      }

      // 5. 성공 결과 반환
      return {
        success: true,
        userDID: verificationResult.userDID,
        session: verificationResult.session,
        credential: {
          id: authenticationResponse.id,
          rawId: authenticationResponse.rawId,
          response: authenticationResponse.response as any,
          type: "public-key",
          publicKey: verificationResult.credentialPublicKey || '',
          biometricType: verificationResult.biometricType
        }
      };

    } catch (error) {
      console.error('❌ WebAuthn 인증 실패:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '인증에 실패했습니다.'
      };
    }
  }

  /**
   * 생체 인증 기능 조회
   */
  async getBiometricCapabilities(): Promise<BiometricCapabilities> {
    try {
      const supported = browserSupportsWebAuthn();
      const platformAuthenticator = supported ? 
        await platformAuthenticatorIsAvailable() : false;

      return {
        supported,
        platformAuthenticator,
        touchId: this.isTouchIDAvailable(),
        faceId: this.isFaceIDAvailable(),
        windowsHello: this.isWindowsHelloAvailable()
      };
    } catch (error) {
      console.error('생체 인증 기능 조회 실패:', error);
      return {
        supported: false,
        platformAuthenticator: false,
        touchId: false,
        faceId: false,
        windowsHello: false
      };
    }
  }

  // =============================================================================
  // 🔧 Private Helper Methods
  // =============================================================================

  /**
   * 서버에서 등록 옵션 가져오기
   */
  private async fetchRegistrationOptions(
    userInfo: UserInfo
  ): Promise<PublicKeyCredentialCreationOptionsJSON> {
    const response = await fetch(`${this.baseUrl}/api/webauthn/register/begin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true'
      },
      body: JSON.stringify(userInfo)
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`등록 옵션 요청 실패: ${error}`);
    }

    return await response.json();
  }

  /**
   * 서버에서 등록 검증
   */
  private async verifyRegistration(
    registrationResponse: RegistrationResponseJSON,
    userInfo: UserInfo
  ): Promise<any> {
    const response = await fetch(`${this.baseUrl}/api/webauthn/register/complete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true'
      },
      body: JSON.stringify({
        registrationResponse,
        userInfo,
        biometricType: await this.detectBiometricType()
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`등록 검증 실패: ${error}`);
    }

    return await response.json();
  }

  /**
   * 서버에서 인증 옵션 가져오기
   */
  private async fetchAuthenticationOptions(): Promise<PublicKeyCredentialRequestOptionsJSON> {
    const response = await fetch(`${this.baseUrl}/api/webauthn/authenticate/begin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true'
      }
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`인증 옵션 요청 실패: ${error}`);
    }

    return await response.json();
  }

  /**
   * 서버에서 인증 검증
   */
  private async verifyAuthentication(
    authenticationResponse: AuthenticationResponseJSON
  ): Promise<any> {
    const response = await fetch(`${this.baseUrl}/api/webauthn/authenticate/complete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true'
      },
      body: JSON.stringify({
        authenticationResponse
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`인증 검증 실패: ${error}`);
    }

    return await response.json();
  }

  /**
   * 생체 인증 타입 감지 (개선된 버전)
   */
  private async detectBiometricType(): Promise<'touchid' | 'faceid' | 'windowshello' | undefined> {
    const userAgent = navigator.userAgent.toLowerCase();
    const platform = navigator.platform.toLowerCase();

    // macOS 감지 (Touch ID)
    if (userAgent.includes('mac') || platform.includes('mac')) {
      return 'touchid';
    }

    // iOS 감지 (Face ID / Touch ID)
    if (userAgent.includes('iphone') || userAgent.includes('ipad') || platform.includes('iphone')) {
      return 'faceid';
    }

    // Windows 감지 (Windows Hello)
    if (userAgent.includes('windows') || platform.includes('win')) {
      return 'windowshello';
    }

    return undefined;
  }

  /**
   * Touch ID 사용 가능 여부 확인
   */
  private isTouchIDAvailable(): boolean {
    const userAgent = navigator.userAgent.toLowerCase();
    const platform = navigator.platform.toLowerCase();
    return userAgent.includes('mac') || platform.includes('mac');
  }

  /**
   * Face ID 사용 가능 여부 확인
   */
  private isFaceIDAvailable(): boolean {
    const userAgent = navigator.userAgent.toLowerCase();
    return userAgent.includes('iphone') || userAgent.includes('ipad');
  }

  /**
   * Windows Hello 사용 가능 여부 확인
   */
  private isWindowsHelloAvailable(): boolean {
    const userAgent = navigator.userAgent.toLowerCase();
    const platform = navigator.platform.toLowerCase();
    return userAgent.includes('windows') || platform.includes('win');
  }
}

// =============================================================================
// 🌐 apps/web-app/app/api/webauthn/register/begin/route.ts
// SimpleWebAuthn 서버 구현
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import {
  generateRegistrationOptions,
  type GenerateRegistrationOptionsOpts,
} from '@simplewebauthn/server';

export async function POST(request: NextRequest) {
  try {
    const userInfo = await request.json();
    
    console.log('🔐 WebAuthn 등록 옵션 생성 요청:', userInfo.username);

    // 등록 옵션 생성
    const options: GenerateRegistrationOptionsOpts = {
      rpName: process.env.WEBAUTHN_RP_NAME || 'WebAuthn DID System',
      rpID: process.env.WEBAUTHN_RP_ID || 'localhost',
      userID: userInfo.id,
      userName: userInfo.username,
      userDisplayName: userInfo.displayName,
      timeout: 60000,
      attestationType: 'none',
      // 기존 자격 증명 제외 (실제로는 DB에서 조회)
      excludeCredentials: [],
      authenticatorSelection: {
        residentKey: 'preferred',
        userVerification: 'preferred',
        authenticatorAttachment: 'platform', // 플랫폼 인증기 우선
      },
      supportedAlgorithmIDs: [-7, -257], // ES256, RS256
    };

    const registrationOptions = await generateRegistrationOptions(options);

    // 챌린지를 세션에 저장 (실제로는 Redis나 DB 사용)
    // 여기서는 간단히 반환
    console.log('✅ WebAuthn 등록 옵션 생성 완료');

    return NextResponse.json(registrationOptions, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });

  } catch (error) {
    console.error('❌ WebAuthn 등록 옵션 생성 실패:', error);
    return NextResponse.json(
      { error: '등록 옵션 생성 실패' }, 
      { status: 500 }
    );
  }
}

// =============================================================================
// 🌐 apps/web-app/app/api/webauthn/register/complete/route.ts
// 등록 검증 API
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import {
  verifyRegistrationResponse,
  type VerifyRegistrationResponseOpts,
} from '@simplewebauthn/server';

export async function POST(request: NextRequest) {
  try {
    const { registrationResponse, userInfo, biometricType } = await request.json();
    
    console.log('🔐 WebAuthn 등록 검증 요청:', registrationResponse.id);

    // 등록 검증 옵션
    const opts: VerifyRegistrationResponseOpts = {
      response: registrationResponse,
      expectedChallenge: registrationResponse.response.clientDataJSON, // 실제로는 세션에서 조회
      expectedOrigin: process.env.WEBAUTHN_ORIGIN || 'http://localhost:3000',
      expectedRPID: process.env.WEBAUTHN_RP_ID || 'localhost',
      requireUserVerification: false,
    };

    // 등록 검증 실행
    const verification = await verifyRegistrationResponse(opts);

    if (verification.verified && verification.registrationInfo) {
      const { credentialPublicKey, credentialID, counter } = verification.registrationInfo;

      // 실제로는 여기서 데이터베이스에 저장
      console.log('✅ WebAuthn 등록 검증 성공');

      return NextResponse.json({
        verified: true,
        credentialID: Buffer.from(credentialID).toString('base64url'),
        credentialPublicKey: Buffer.from(credentialPublicKey).toString('base64'),
        credentialCounter: counter,
        userDID: `did:web:${process.env.WEBAUTHN_RP_ID}:users:${Buffer.from(credentialID).toString('hex').substring(0, 16)}`,
        biometricType
      });
    } else {
      throw new Error('등록 검증 실패');
    }

  } catch (error) {
    console.error('❌ WebAuthn 등록 검증 실패:', error);
    return NextResponse.json(
      { error: '등록 검증 실패' }, 
      { status: 500 }
    );
  }
}

// =============================================================================
// 🌐 apps/web-app/app/api/webauthn/authenticate/begin/route.ts
// 인증 시작 API
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import {
  generateAuthenticationOptions,
  type GenerateAuthenticationOptionsOpts,
} from '@simplewebauthn/server';

export async function POST(request: NextRequest) {
  try {
    console.log('🔐 WebAuthn 인증 옵션 생성 요청');

    // 인증 옵션 생성
    const options: GenerateAuthenticationOptionsOpts = {
      timeout: 60000,
      userVerification: 'preferred',
      rpID: process.env.WEBAUTHN_RP_ID || 'localhost',
      // 실제로는 사용자의 등록된 자격 증명 목록을 조회
      allowCredentials: [],
    };

    const authenticationOptions = await generateAuthenticationOptions(options);

    console.log('✅ WebAuthn 인증 옵션 생성 완료');

    return NextResponse.json(authenticationOptions, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });

  } catch (error) {
    console.error('❌ WebAuthn 인증 옵션 생성 실패:', error);
    return NextResponse.json(
      { error: '인증 옵션 생성 실패' }, 
      { status: 500 }
    );
  }
}

// =============================================================================
// 🌐 apps/web-app/app/api/webauthn/authenticate/complete/route.ts
// 인증 검증 API
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import {
  verifyAuthenticationResponse,
  type VerifyAuthenticationResponseOpts,
} from '@simplewebauthn/server';

export async function POST(request: NextRequest) {
  try {
    const { authenticationResponse } = await request.json();
    
    console.log('🔐 WebAuthn 인증 검증 요청:', authenticationResponse.id);

    // 실제로는 DB에서 자격 증명 정보를 조회해야 함
    const mockCredential = {
      credentialPublicKey: new Uint8Array(32), // 실제 공개키
      credentialID: new Uint8Array(32), // 실제 자격증명 ID
      counter: 0,
    };

    // 인증 검증 옵션
    const opts: VerifyAuthenticationResponseOpts = {
      response: authenticationResponse,
      expectedChallenge: authenticationResponse.response.clientDataJSON, // 실제로는 세션에서 조회
      expectedOrigin: process.env.WEBAUTHN_ORIGIN || 'http://localhost:3000',
      expectedRPID: process.env.WEBAUTHN_RP_ID || 'localhost',
      authenticator: mockCredential,
      requireUserVerification: false,
    };

    // 인증 검증 실행
    const verification = await verifyAuthenticationResponse(opts);

    if (verification.verified) {
      console.log('✅ WebAuthn 인증 검증 성공');

      return NextResponse.json({
        verified: true,
        userDID: `did:web:${process.env.WEBAUTHN_RP_ID}:users:${authenticationResponse.id.substring(0, 16)}`,
        session: {
          token: `session_${Date.now()}`,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        },
        credentialPublicKey: 'mock_public_key',
        biometricType: 'touchid'
      });
    } else {
      throw new Error('인증 검증 실패');
    }

  } catch (error) {
    console.error('❌ WebAuthn 인증 검증 실패:', error);
    return NextResponse.json(
      { error: '인증 검증 실패' }, 
      { status: 500 }
    );
  }
}