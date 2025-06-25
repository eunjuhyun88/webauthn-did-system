// =============================================================================
// 📝 WebAuthn 회원가입 컴포넌트
// src/components/auth/WebAuthnRegister.tsx
// 생체 인증을 통한 회원가입 UI 및 로직
// =============================================================================

'use client';
import React, { useState, useCallback } from 'react';
import { UserPlus, Eye, EyeOff, Loader2 } from "lucide-react";

// FormData 타입 충돌 해결
interface WebAuthnFormData {  // HTML FormData와 구분
  username: string;
  email: string; 
  displayName: string;
}

interface WebAuthnRegisterProps {
  onSuccess: (user: any) => void;
  onError: (error: string) => void;
  onSwitchToLogin?: () => void;
}

type RegisterStep = 'input' | 'biometric' | 'processing' | 'success' | 'error';

interface FormData {
  username: string;
  email: string;
  displayName: string;
}

export default function WebAuthnRegister({ onSuccess, onError, onSwitchToLogin }: WebAuthnRegisterProps) {
  const [step, setStep] = useState<RegisterStep>('input');
  const [formData, setFormData] = useState<FormData>({
    username: '',
    email: '',
    displayName: ''
  });
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

  // 폼 유효성 검증
  const validateForm = (): boolean => {
    if (!formData.username.trim()) {
      setErrorMessage('사용자명을 입력해주세요.');
      return false;
    }
    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) {
      setErrorMessage('유효한 이메일을 입력해주세요.');
      return false;
    }
    if (!formData.displayName.trim()) {
      setErrorMessage('표시 이름을 입력해주세요.');
      return false;
    }
    return true;
  };

  // WebAuthn 회원가입 처리
  const handleWebAuthnRegister = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setStep('processing');
    setErrorMessage('');

    try {
      // 1. 등록 시작 API 호출
      const beginResponse = await fetch('/api/webauthn/register/begin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          displayName: formData.displayName
        })
      });

      const beginData = await beginResponse.json();

      if (!beginData.success) {
        throw new Error(beginData.error || '등록 시작 실패');
      }

      setStep('biometric');

      // 2. WebAuthn 옵션 준비
      const options = beginData.options;
      options.challenge = base64urlDecode(options.challenge);
      options.user.id = base64urlDecode(options.user.id);

      if (options.excludeCredentials) {
        options.excludeCredentials = options.excludeCredentials.map((cred: any) => ({
          ...cred,
          id: base64urlDecode(cred.id)
        }));
      }

      // 3. WebAuthn credential 생성
      const credential = await navigator.credentials.create({
        publicKey: options
      }) as PublicKeyCredential;

      if (!credential) {
        throw new Error('생체 인증 등록이 취소되었습니다.');
      }

      setStep('processing');

      // 4. 등록 완료 API 호출
      const completeResponse = await fetch('/api/webauthn/register/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          credential: {
            id: credential.id,
            rawId: credential.id,
            response: {
              attestationObject: Array.from(new Uint8Array((credential.response as AuthenticatorAttestationResponse).attestationObject)),
              clientDataJSON: Array.from(new Uint8Array(credential.response.clientDataJSON)),
              transports: (credential.response as AuthenticatorAttestationResponse).getTransports?.() || []
            },
            type: credential.type
          },
          challengeData: beginData.challengeData
        })
      });

      const completeData = await completeResponse.json();

      if (!completeData.success) {
        throw new Error(completeData.error || '등록 완료 실패');
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
      console.error('WebAuthn 등록 오류:', error);
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
      'InvalidStateError': '인증기가 이미 등록되어 있습니다.',
      'ConstraintError': '요청된 제약 조건을 만족할 수 없습니다.',
      'NotSupportedError': '이 브라우저에서는 지원되지 않는 기능입니다.',
      'AbortError': '요청이 중단되었습니다.',
      '이미 등록된 사용자명입니다.': '다른 사용자명을 사용해주세요.',
      '이미 등록된 이메일입니다.': '다른 이메일을 사용하거나 로그인해주세요.'
    };

    return errorMessages[error] || error || '알 수 없는 오류가 발생했습니다.';
  };

  // 폼 입력 핸들러
  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errorMessage) setErrorMessage('');
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
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <UserPlus className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">생체 인증 회원가입</h2>
        <p className="text-gray-600">지문, 얼굴 인식 또는 보안 키로 안전하게 가입하세요</p>
      </div>

      {/* 입력 단계 */}
      {step === 'input' && (
        <div className="space-y-6">
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{errorMessage}</p>
            </div>
          )}

          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
              사용자명 <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                id="username"
                type="text"
                value={formData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                placeholder="고유한 사용자명"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              이메일 <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="your@email.com"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-2">
              표시 이름 <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Eye className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                id="displayName"
                type="text"
                value={formData.displayName}
                onChange={(e) => handleInputChange('displayName', e.target.value)}
                placeholder="홍길동"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>

          <button
            onClick={handleWebAuthnRegister}
            disabled={isLoading}
            className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            <Shield className="w-5 h-5 mr-2" />
            생체 인증으로 가입하기
          </button>

          {onSwitchToLogin && (
            <div className="text-center">
              <button
                onClick={onSwitchToLogin}
                className="text-green-600 hover:text-green-700 text-sm font-medium"
              >
                이미 계정이 있으신가요? 로그인
              </button>
            </div>
          )}
        </div>
      )}

      {/* 생체 인증 단계 */}
      {step === 'biometric' && (
        <div className="text-center space-y-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto animate-pulse">
            <Shield className="w-10 h-10 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">생체 인증 등록 중</h3>
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
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <Loader2 className="w-10 h-10 text-green-600 animate-spin" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">계정 생성 중</h3>
            <p className="text-gray-600">안전한 계정을 생성하고 있습니다...</p>
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
            <h3 className="text-lg font-semibold text-gray-900 mb-2">회원가입 완료!</h3>
            <p className="text-gray-600">
              {formData.displayName}님, 환영합니다!<br />
              생체 인증이 안전하게 등록되었습니다.
            </p>
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
            <h3 className="text-lg font-semibold text-gray-900 mb-2">회원가입 실패</h3>
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

      {/* 개인정보 처리 방침 */}
      <div className="mt-6 text-center">
        <p className="text-xs text-gray-500">
          가입하시면 <a href="/privacy" className="text-green-600 hover:underline">개인정보 처리방침</a>과{' '}
          <a href="/terms" className="text-green-600 hover:underline">이용약관</a>에 동의하는 것으로 간주됩니다.
        </p>
      </div>
    </div>
  );
}