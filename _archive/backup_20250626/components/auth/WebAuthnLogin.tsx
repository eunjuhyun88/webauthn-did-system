// =============================================================================
// 🎨 WebAuthn 로그인 컴포넌트
// src/components/auth/WebAuthnLogin.tsx
// 생체 인증을 통한 로그인 UI 및 로직
// =============================================================================

'use client';

import React, { useState } from 'react';
import { Fingerprint, Shield, Loader2, Check, X, User } from 'lucide-react';

interface WebAuthnLoginProps {
  onSuccess: (user: any) => void;
  onError: (error: string) => void;
  onSwitchToRegister?: () => void;
}

type LoginStep = 'input' | 'biometric' | 'processing' | 'success' | 'error';

export default function WebAuthnLogin({ onSuccess, onError, onSwitchToRegister }: WebAuthnLoginProps) {
  const [step, setStep] = useState<LoginStep>('input');
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Base64URL 디코딩 유틸리티
  const base64urlDecode = (str: string): ArrayBuffer => {
    const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + (4 - base64.length % 4) % 4, '=');
    const binary = atob(padded);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  };

  // WebAuthn 로그인 처리
  const handleWebAuthnLogin = async () => {
    if (!username.trim()) {
      setErrorMessage('사용자명 또는 이메일을 입력해주세요.');
      return;
    }

    setIsLoading(true);
    setStep('processing');

    try {
      // 1. 인증 시작 API 호출
      const beginResponse = await fetch('/api/webauthn/authenticate/begin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: username.includes('@') ? username : undefined,
          username: !username.includes('@') ? username : undefined
        })
      });

      const beginData = await beginResponse.json();

      if (!beginData.success) {
        throw new Error(beginData.error || '인증 시작 실패');
      }

      setStep('biometric');

      // 2. WebAuthn 옵션 준비
      const options = beginData.options;
      options.challenge = base64urlDecode(options.challenge);

      if (options.allowCredentials) {
        options.allowCredentials = options.allowCredentials.map((cred: any) => ({
          ...cred,
          id: base64urlDecode(cred.id)
        }));
      }

      // 3. WebAuthn credential 조회
      const credential = await navigator.credentials.get({
        publicKey: options
      }) as PublicKeyCredential;

      if (!credential) {
        throw new Error('인증이 취소되었습니다.');
      }

      setStep('processing');

      // 4. 인증 완료 API 호출
      const completeResponse = await fetch('/api/webauthn/authenticate/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          credential: {
            id: credential.id,
            rawId: credential.id,
            response: {
              authenticatorData: Array.from(new Uint8Array((credential.response as AuthenticatorAssertionResponse).authenticatorData)),
              clientDataJSON: Array.from(new Uint8Array(credential.response.clientDataJSON)),
              signature: Array.from(new Uint8Array((credential.response as AuthenticatorAssertionResponse).signature)),
              userHandle: (credential.response as AuthenticatorAssertionResponse).userHandle ? 
                Array.from(new Uint8Array((credential.response as AuthenticatorAssertionResponse).userHandle!)) : null
            },
            type: credential.type
          },
          challengeData: beginData.challengeData
        })
      });

      const completeData = await completeResponse.json();

      if (!completeData.success) {
        throw new Error(completeData.error || '인증 완료 실패');
      }

      setStep('success');
      
      // 토큰 저장
      if (completeData.token) {
        localStorage.setItem('auth_token', completeData.token);
      }

      setTimeout(() => {
        onSuccess(completeData.user);
      }, 1500);

    } catch (error: any) {
      console.error('WebAuthn 로그인 오류:', error);
      setErrorMessage(getWebAuthnErrorMessage(error.name || error.message));
      setStep('error');
      onError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // 에러 메시지 변환
  const getWebAuthnErrorMessage = (error: string): string => {
    const errorMessages: Record<string, string> = {
      'NotAllowedError': '사용자가 요청을 거부했거나 타임아웃이 발생했습니다.',
      'SecurityError': '보안 요구사항을 만족하지 않습니다.',
      'NetworkError': '네트워크 오류가 발생했습니다.',
      'InvalidStateError': '유효하지 않은 상태입니다.',
      'ConstraintError': '요청된 제약 조건을 만족할 수 없습니다.',
      'NotSupportedError': '이 브라우저에서는 지원되지 않는 기능입니다.',
      'AbortError': '요청이 중단되었습니다.',
      '사용자를 찾을 수 없습니다.': '등록되지 않은 사용자입니다. 먼저 회원가입을 해주세요.',
      '등록된 자격증명을 찾을 수 없습니다.': '이 계정에 등록된 생체 인증 정보가 없습니다.'
    };

    return errorMessages[error] || error || '알 수 없는 오류가 발생했습니다.';
  };

  // 다시 시도
  const handleRetry = () => {
    setStep('input');
    setErrorMessage('');
    setIsLoading(false);
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8">
      {/* 헤더 */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Shield className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">생체 인증 로그인</h2>
        <p className="text-gray-600">지문, 얼굴 인식 또는 보안 키로 안전하게 로그인하세요</p>
      </div>

      {/* 입력 단계 */}
      {step === 'input' && (
        <div className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
              사용자명 또는 이메일
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="username 또는 email@example.com"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onKeyPress={(e) => e.key === 'Enter' && handleWebAuthnLogin()}
              />
            </div>
          </div>

          <button
            onClick={handleWebAuthnLogin}
            disabled={!username.trim() || isLoading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            <Fingerprint className="w-5 h-5 mr-2" />
            생체 인증으로 로그인
          </button>

          {onSwitchToRegister && (
            <div className="text-center">
              <button
                onClick={onSwitchToRegister}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                계정이 없으신가요? 회원가입
              </button>
            </div>
          )}
        </div>
      )}

      {/* 생체 인증 단계 */}
      {step === 'biometric' && (
        <div className="text-center space-y-6">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto animate-pulse">
            <Fingerprint className="w-10 h-10 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">생체 인증 대기 중</h3>
            <p className="text-gray-600">
              디바이스의 생체 인증 센서를 사용하거나<br />
              보안 키를 연결해주세요
            </p>
          </div>
        </div>
      )}

      {/* 처리 중 단계 */}
      {step === 'processing' && (
        <div className="text-center space-y-6">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">인증 처리 중</h3>
            <p className="text-gray-600">잠시만 기다려주세요...</p>
          </div>
        </div>
      )}

      {/* 성공 단계 */}
      {step === 'success' && (
        <div className="text-center space-y-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <Check className="w-10 h-10 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">로그인 성공!</h3>
            <p className="text-gray-600">안전하게 인증되었습니다.</p>
          </div>
        </div>
      )}

      {/* 오류 단계 */}
      {step === 'error' && (
        <div className="text-center space-y-6">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <X className="w-10 h-10 text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">로그인 실패</h3>
            <p className="text-red-600 text-sm">{errorMessage}</p>
          </div>
          <button
            onClick={handleRetry}
            className="w-full bg-gray-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-700 transition-colors"
          >
            다시 시도
          </button>
        </div>
      )}

      {/* WebAuthn 지원 여부 확인 */}
      {!window.PublicKeyCredential && (
        <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
          <p className="text-yellow-800 text-sm">
            ⚠️ 이 브라우저는 WebAuthn을 지원하지 않습니다. 
            Chrome, Firefox, Safari 등 최신 브라우저를 사용해주세요.
          </p>
        </div>
      )}
    </div>
  );
}