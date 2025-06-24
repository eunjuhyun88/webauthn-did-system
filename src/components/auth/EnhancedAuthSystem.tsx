// =============================================================================
// 🔐 WebAuthn 인증 시스템 통합 - Production Dashboard 강화
// src/components/auth/EnhancedAuthSystem.tsx
// =============================================================================

import React, { useState, useEffect } from 'react';
import { 
  Fingerprint, Shield, Key, Lock, CheckCircle, AlertCircle, 
  Globe, Sparkles, X, Eye, Brain, Database
} from 'lucide-react';

// 기존 시스템 import
import { detectLanguageFromText, getWebAuthnMessages, detectBrowserLanguage } from '@/auth/webauthn/multilingual-helper';
import { SupportedLanguage } from '@/types/multilingual-cue.types';

// =============================================================================
// 🔧 Enhanced Types (기존 타입 확장)
// =============================================================================

interface EnhancedUser extends User {
  // 기존 User 타입에 WebAuthn + DID 정보 추가
  did?: string;
  webauthnCredential?: {
    id: string;
    publicKey: string;
    signCount: number;
    createdAt: Date;
  };
  multilingualProfile?: {
    detectedLanguage: SupportedLanguage;
    culturalContext: string;
    preferredFormality: 'formal' | 'casual' | 'professional';
    communicationStyle: string;
  };
  securityLevel?: 'basic' | 'enhanced' | 'enterprise';
  trustScore?: number;
}

interface WebAuthnRegistrationOptions {
  challenge: string;
  user: {
    id: string;
    name: string;
    displayName: string;
  };
  pubKeyCredParams: Array<{
    type: 'public-key';
    alg: number;
  }>;
  authenticatorSelection: {
    authenticatorAttachment?: 'platform' | 'cross-platform';
    userVerification: 'required' | 'preferred' | 'discouraged';
    requireResidentKey?: boolean;
  };
  timeout: number;
  rp: {
    name: string;
    id: string;
  };
}

// =============================================================================
// 🔐 Enhanced Authentication Hook
// =============================================================================

export const useEnhancedAuth = () => {
  const [authState, setAuthState] = useState({
    isAuthenticating: false,
    method: null as 'google' | 'webauthn' | 'demo' | null,
    step: 'select' as 'select' | 'webauthn-register' | 'webauthn-authenticate' | 'language-detect' | 'complete',
    error: null as string | null,
    detectedLanguage: 'english' as SupportedLanguage,
    webauthnSupported: false
  });

  // WebAuthn 지원 확인
  useEffect(() => {
    const checkWebAuthnSupport = () => {
      const supported = !!(
        window.PublicKeyCredential && 
        window.navigator.credentials && 
        typeof window.navigator.credentials.create === 'function'
      );
      
      setAuthState(prev => ({ ...prev, webauthnSupported: supported }));
      
      if (supported) {
        console.log('✅ WebAuthn 지원됨 - 생체인증 사용 가능');
      } else {
        console.log('❌ WebAuthn 미지원 - 대체 인증 방법 제공');
      }
    };

    checkWebAuthnSupport();
  }, []);

  // 언어 자동 감지
  const detectUserLanguage = async (inputText?: string): Promise<SupportedLanguage> => {
    let detectedLang: SupportedLanguage = 'english';

    // 1. 사용자 입력 텍스트에서 감지
    if (inputText && inputText.trim().length > 3) {
      detectedLang = detectLanguageFromText(inputText);
      console.log(`🔍 텍스트 분석 결과: "${inputText}" → ${detectedLang}`);
    }
    // 2. 브라우저 언어 설정에서 감지
    else {
      const browserLang = navigator.language || navigator.languages?.[0];
      detectedLang = detectBrowserLanguage(browserLang);
      console.log(`🌐 브라우저 언어 감지: ${browserLang} → ${detectedLang}`);
    }

    setAuthState(prev => ({ ...prev, detectedLanguage: detectedLang }));
    return detectedLang;
  };

  // WebAuthn 등록 (새 사용자)
  const registerWithWebAuthn = async (displayName: string, detectedLang?: SupportedLanguage): Promise<EnhancedUser> => {
    if (!authState.webauthnSupported) {
      throw new Error('WebAuthn이 지원되지 않는 환경입니다');
    }

    setAuthState(prev => ({ ...prev, isAuthenticating: true, step: 'webauthn-register' }));

    try {
      // 1. 언어 감지
      const userLanguage = detectedLang || await detectUserLanguage();
      const messages = getWebAuthnMessages(userLanguage);

      console.log(`🌍 사용자 언어: ${userLanguage}`);
      console.log(`📝 현지화 메시지:`, messages.registration);

      // 2. 서버에서 등록 옵션 요청
      const optionsResponse = await fetch('/api/webauthn/multilingual/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          displayName,
          userLanguage,
          interactionHistory: [
            {
              id: '1',
              content: `WebAuthn 등록을 시작합니다. 언어: ${userLanguage}`,
              timestamp: new Date().toISOString(),
              type: 'auth_start',
              context: 'registration'
            }
          ]
        })
      });

      if (!optionsResponse.ok) {
        throw new Error('서버에서 등록 옵션을 가져올 수 없습니다');
      }

      const { webauthnOptions, detectedLanguage, messages: serverMessages } = await optionsResponse.json();
      
      // 3. 브라우저 WebAuthn API 호출
      const publicKeyCredentialCreationOptions: CredentialCreationOptions = {
        publicKey: {
          challenge: Uint8Array.from(atob(webauthnOptions.challenge), c => c.charCodeAt(0)),
          rp: {
            name: "Fusion AI Dashboard",
            id: window.location.hostname
          },
          user: {
            id: Uint8Array.from(atob(webauthnOptions.user.id), c => c.charCodeAt(0)),
            name: webauthnOptions.user.name,
            displayName: webauthnOptions.user.displayName
          },
          pubKeyCredParams: webauthnOptions.pubKeyCredParams,
          authenticatorSelection: {
            authenticatorAttachment: 'platform',
            userVerification: 'required',
            requireResidentKey: false
          },
          timeout: 60000
        }
      };

      console.log('🔐 WebAuthn 등록 시작...');
      const credential = await navigator.credentials.create(publicKeyCredentialCreationOptions) as PublicKeyCredential;

      if (!credential) {
        throw new Error('생체인증 등록이 취소되었습니다');
      }

      console.log('✅ WebAuthn 등록 성공!');

      // 4. DID 생성 및 사용자 객체 생성
      const userDID = `did:fusion:webauthn:${credential.id.substring(0, 16)}`;
      
      const enhancedUser: EnhancedUser = {
        id: `webauthn_${Date.now()}`,
        did: userDID,
        email: `webauthn.user@fusion-ai.com`,
        displayName,
        authMethod: 'webauthn',
        subscription: 'enterprise', // WebAuthn 사용자는 자동 Enterprise
        avatar: '🔐',
        webauthnCredential: {
          id: credential.id,
          publicKey: btoa(String.fromCharCode(...new Uint8Array((credential.response as AuthenticatorAttestationResponse).getPublicKey()!))),
          signCount: 0,
          createdAt: new Date()
        },
        multilingualProfile: {
          detectedLanguage: detectedLanguage || userLanguage,
          culturalContext: getCulturalContext(detectedLanguage || userLanguage),
          preferredFormality: getFormality(detectedLanguage || userLanguage),
          communicationStyle: getCommunicationStyle(detectedLanguage || userLanguage)
        },
        securityLevel: 'enterprise',
        trustScore: 99,
        tokens: {
          accessToken: `webauthn_token_${Date.now()}`,
          refreshToken: `webauthn_refresh_${Date.now()}`,
          expiresAt: Date.now() + 24 * 60 * 60 * 1000 // 24시간
        },
        preferences: {
          theme: 'light',
          language: (detectedLanguage || userLanguage) === 'korean' ? 'ko' : 'en',
          notifications: true,
          aiPersonality: 'professional',
          responseStyle: 'detailed',
          dataRetention: '1year',
          privacy: {
            shareUsageData: false,
            allowPersonalization: true,
            storageLocation: 'region'
          }
        }
      };

      setAuthState(prev => ({ ...prev, step: 'complete', isAuthenticating: false }));
      return enhancedUser;

    } catch (error) {
      console.error('❌ WebAuthn 등록 실패:', error);
      setAuthState(prev => ({ 
        ...prev, 
        isAuthenticating: false, 
        error: error instanceof Error ? error.message : '생체인증 등록에 실패했습니다',
        step: 'select'
      }));
      throw error;
    }
  };

  // WebAuthn 인증 (기존 사용자)
  const authenticateWithWebAuthn = async (): Promise<EnhancedUser> => {
    // 구현 로직은 registerWithWebAuthn과 유사하지만 인증 플로우
    // 여기서는 등록 성공 시 자동으로 인증된 것으로 처리
    throw new Error('기존 사용자 인증은 다음 단계에서 구현됩니다');
  };

  return {
    authState,
    setAuthState,
    detectUserLanguage,
    registerWithWebAuthn,
    authenticateWithWebAuthn
  };
};

// =============================================================================
// 🎨 Enhanced Login Component (기존 로그인 화면 확장)
// =============================================================================

interface EnhancedLoginProps {
  onAuthSuccess: (user: EnhancedUser) => void;
  onAuthError: (error: string) => void;
  onShowNotification: (type: string, title: string, message: string) => void;
}

export const EnhancedLoginScreen: React.FC<EnhancedLoginProps> = ({
  onAuthSuccess,
  onAuthError,
  onShowNotification
}) => {
  const { authState, setAuthState, detectUserLanguage, registerWithWebAuthn } = useEnhancedAuth();
  const [displayName, setDisplayName] = useState('');
  const [languageInput, setLanguageInput] = useState('');

  // 기존 Google/Demo 로그인 (변경 없음)
  const handleLegacyLogin = async (method: 'google' | 'demo') => {
    setAuthState(prev => ({ ...prev, isAuthenticating: true, method }));

    try {
      onShowNotification('info', 'Authentication Started', `Authenticating with ${method}...`);
      
      // 기존 로직 그대로 유지
      await new Promise(resolve => setTimeout(resolve, 2000));

      const legacyUser: EnhancedUser = {
        id: method + '_' + Date.now(),
        did: `did:fusion:${method}:${Math.random().toString(36).substring(7)}`,
        email: method === 'google' ? 'user@gmail.com' : 'demo@fusion-ai.com',
        displayName: method === 'google' ? 'Google User' : 'Demo User',
        authMethod: method,
        subscription: method === 'google' ? 'pro' : 'free',
        securityLevel: 'basic',
        trustScore: method === 'google' ? 85 : 70,
        tokens: {
          accessToken: 'demo_token',
          refreshToken: 'demo_refresh', 
          expiresAt: Date.now() + 3600000
        },
        preferences: {
          theme: 'light',
          language: 'ko',
          notifications: true,
          aiPersonality: 'friendly',
          responseStyle: 'detailed',
          dataRetention: '30days',
          privacy: {
            shareUsageData: false,
            allowPersonalization: true,
            storageLocation: 'region'
          }
        }
      };

      onAuthSuccess(legacyUser);
      onShowNotification('success', 'Welcome!', `Successfully authenticated with ${method}`);

    } catch (error) {
      onAuthError('Authentication failed');
    } finally {
      setAuthState(prev => ({ ...prev, isAuthenticating: false }));
    }
  };

  // WebAuthn 등록 플로우
  const handleWebAuthnRegistration = async () => {
    if (!displayName.trim()) {
      onAuthError('이름을 입력해주세요');
      return;
    }

    try {
      // 언어 감지
      const detectedLang = await detectUserLanguage(languageInput);
      onShowNotification('info', 'Language Detection', `Detected language: ${detectedLang}`);

      // WebAuthn 등록
      const user = await registerWithWebAuthn(displayName, detectedLang);
      onAuthSuccess(user);
      
      onShowNotification('success', 'WebAuthn Registration Complete!', 
        `Welcome ${user.displayName}! Biometric authentication is now active.`);

    } catch (error) {
      onAuthError(error instanceof Error ? error.message : 'WebAuthn registration failed');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <Shield className="w-3 h-3 text-white" />
              </div>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Fusion AI Dashboard</h1>
          <p className="text-gray-600 mb-2">Enhanced with WebAuthn + DID Security</p>
          <div className="text-sm text-blue-600 space-y-1">
            <div>• Biometric Authentication • 100+ Languages • Complete Privacy</div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 border border-gray-200 shadow-xl space-y-6">
          
          {/* WebAuthn 등록 플로우 */}
          {authState.step === 'select' && (
            <>
              {/* 🔥 신규: WebAuthn 생체인증 (최우선) */}
              <div className="space-y-4">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">🔐 Secure Biometric Login</h3>
                  <p className="text-sm text-gray-600">Enterprise-grade security with your fingerprint or face</p>
                </div>

                {authState.webauthnSupported ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Your name (e.g., John Smith)"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    
                    <input
                      type="text"
                      placeholder="Say something to detect your language... (optional)"
                      value={languageInput}
                      onChange={(e) => {
                        setLanguageInput(e.target.value);
                        if (e.target.value.length > 5) {
                          detectUserLanguage(e.target.value);
                        }
                      }}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />

                    {authState.detectedLanguage !== 'english' && (
                      <div className="flex items-center space-x-2 text-sm text-blue-600 bg-blue-50 p-2 rounded">
                        <Globe className="w-4 h-4" />
                        <span>Detected: {authState.detectedLanguage}</span>
                      </div>
                    )}

                    <button
                      onClick={handleWebAuthnRegistration}
                      disabled={authState.isAuthenticating || !displayName.trim()}
                      className="w-full p-4 rounded-xl border-2 border-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 text-gray-900 shadow-lg hover:shadow-xl transition-all duration-200 group disabled:opacity-70"
                    >
                      <div className="flex items-center justify-center space-x-3">
                        {authState.isAuthenticating ? (
                          <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <Fingerprint className="w-5 h-5 text-blue-600 group-hover:scale-110 transition-transform" />
                        )}
                        <div className="text-center">
                          <div className="font-semibold">Register with Biometric</div>
                          <div className="text-sm text-gray-500">Fingerprint • Face ID • Touch ID</div>
                        </div>
                      </div>
                    </button>
                  </div>
                ) : (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center space-x-2 text-yellow-800">
                      <AlertCircle className="w-5 h-5" />
                      <span className="font-medium">WebAuthn Not Supported</span>
                    </div>
                    <p className="text-sm text-yellow-700 mt-1">
                      Your browser or device doesn't support biometric authentication. Please use alternative login methods below.
                    </p>
                  </div>
                )}
              </div>

              <div className="flex items-center my-6">
                <div className="flex-1 border-t border-gray-300"></div>
                <span className="px-4 text-gray-500 text-sm font-medium">or continue with</span>
                <div className="flex-1 border-t border-gray-300"></div>
              </div>

              {/* 기존 Google 로그인 (그대로 유지) */}
              <button
                onClick={() => handleLegacyLogin('google')}
                disabled={authState.isAuthenticating}
                className="w-full p-4 rounded-xl border-2 border-gray-300 bg-white hover:bg-gray-50 text-gray-900 shadow-lg hover:shadow-xl transition-all duration-200 group disabled:opacity-70"
              >
                <div className="flex items-center justify-center space-x-3">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <div className="text-center">
                    <div className="font-semibold">Continue with Google</div>
                    <div className="text-sm text-gray-500">Quick setup • Pro features</div>
                  </div>
                </div>
              </button>

              {/* 기존 Demo 모드 (그대로 유지) */}
              <div className="text-center">
                <button
                  onClick={() => handleLegacyLogin('demo')}
                  disabled={authState.isAuthenticating}
                  className="text-sm text-blue-600 hover:text-blue-800 underline transition-colors disabled:opacity-70"
                >
                  Try Demo Mode (No signup required)
                </button>
              </div>
            </>
          )}

          {/* WebAuthn 등록 진행 중 */}
          {authState.step === 'webauthn-register' && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <Fingerprint className="w-8 h-8 text-blue-600 animate-pulse" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Biometric Registration</h3>
              <p className="text-gray-600">Please use your fingerprint, Face ID, or Touch ID to complete registration.</p>
              <div className="text-sm text-blue-600">
                🌍 Language: {authState.detectedLanguage} • 🔐 Enterprise Security
              </div>
            </div>
          )}

          {/* 오류 표시 */}
          {authState.error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center space-x-2 text-red-800">
                <AlertCircle className="w-5 h-5" />
                <span className="font-medium">Authentication Error</span>
              </div>
              <p className="text-sm text-red-700 mt-1">{authState.error}</p>
              <button
                onClick={() => setAuthState(prev => ({ ...prev, error: null, step: 'select' }))}
                className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
              >
                Try Again
              </button>
            </div>
          )}

          <div className="text-center text-xs text-gray-500 mt-4">
            By continuing, you agree to our Terms of Service and Privacy Policy.<br/>
            🔐 WebAuthn provides bank-level security with biometric authentication.
          </div>
        </div>
      </div>
    </div>
  );
};

// =============================================================================
// 🌍 Helper Functions
// =============================================================================

const getCulturalContext = (language: SupportedLanguage): string => {
  const contexts = {
    korean: 'hierarchical_respectful',
    japanese: 'formal_contextual', 
    chinese: 'collective_harmonious',
    german: 'direct_systematic',
    french: 'elegant_intellectual',
    spanish: 'warm_expressive',
    english: 'casual_direct'
  };
  return contexts[language] || contexts.english;
};

const getFormality = (language: SupportedLanguage): 'formal' | 'casual' | 'professional' => {
  const formality = {
    korean: 'formal',
    japanese: 'formal',
    german: 'professional',
    french: 'professional',
    spanish: 'casual',
    english: 'casual'
  };
  return formality[language] || 'casual';
};

const getCommunicationStyle = (language: SupportedLanguage): string => {
  const styles = {
    korean: 'respectful_indirect',
    japanese: 'contextual_subtle',
    chinese: 'harmonious_collective',
    german: 'direct_efficient', 
    french: 'intellectual_nuanced',
    spanish: 'warm_expressive',
    english: 'direct_friendly'
  };
  return styles[language] || styles.english;
};

export default EnhancedLoginScreen;