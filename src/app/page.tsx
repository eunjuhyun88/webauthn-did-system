'use client';

import { useState } from 'react';
import { Shield, Fingerprint, CheckCircle } from 'lucide-react';

export default function HomePage() {
  const [isReady, setIsReady] = useState(true);

  if (!isReady) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h1 className="text-xl font-semibold text-gray-900">시스템 초기화 중...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-16">
        {/* 헤더 */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-6">
            <Shield className="w-10 h-10 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            WebAuthn + DID 시스템
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            4-Layer 아키텍처 기반의 차세대 인증 및 신원 관리 시스템
          </p>
        </div>

        {/* 상태 카드들 */}
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
          {/* 설정 완료 */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle className="w-6 h-6 text-green-500" />
              <h3 className="text-lg font-semibold text-gray-900">설정 완료</h3>
            </div>
            <p className="text-gray-600">
              프로젝트 구조와 기본 패키지가 성공적으로 설치되었습니다.
            </p>
          </div>

          {/* WebAuthn 준비 */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <Fingerprint className="w-6 h-6 text-blue-500" />
              <h3 className="text-lg font-semibold text-gray-900">WebAuthn 준비</h3>
            </div>
            <p className="text-gray-600">
              생체 인증 시스템이 준비되었습니다. HTTPS 환경에서 테스트하세요.
            </p>
          </div>

          {/* AI 통합 */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-6 h-6 text-purple-500">🤖</div>
              <h3 className="text-lg font-semibold text-gray-900">AI 통합</h3>
            </div>
            <p className="text-gray-600">
              OpenAI, Claude, Gemini AI 서비스 연동이 준비되었습니다.
            </p>
          </div>
        </div>

        {/* 다음 단계 */}
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">다음 단계</h2>
          
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold">
                1
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">환경 변수 설정</h3>
                <p className="text-gray-600">
                  <code className="bg-gray-100 px-2 py-1 rounded">.env.local</code> 파일에서 API 키들을 실제 값으로 수정하세요.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold">
                2
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">ngrok 터널 시작</h3>
                <p className="text-gray-600">
                  <code className="bg-gray-100 px-2 py-1 rounded">ngrok http 3000</code> 명령으로 HTTPS 터널을 생성하세요.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold">
                3
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">컴포넌트 구현</h3>
                <p className="text-gray-600">
                  WebAuthn, DID, AI 컴포넌트들을 단계적으로 구현하세요.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">
              <strong>💡 팁:</strong> 개발 중에는 데모 모드를 사용하여 기능을 먼저 테스트할 수 있습니다.
            </p>
          </div>
        </div>

        {/* 푸터 */}
        <div className="text-center mt-12 text-sm text-gray-500">
          <p>4-Layer 아키텍처 | WebAuthn + DID + AI 통합 시스템</p>
        </div>
      </div>
    </div>
  );
}
