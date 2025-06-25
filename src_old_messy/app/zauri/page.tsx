// =============================================================================
// 🎨 Zauri 데모 페이지 - Agent Passport 포함
// =============================================================================

'use client';

import React, { useState } from 'react';
import { AgentPassportCard } from '@/components/zauri/AgentPassportCard';

export default function ZauriDemoPage() {
  const [agentPassport, setAgentPassport] = useState(null);

  const handleCreateAgent = () => {
    // 데모용 Agent Passport 생성
    const demoAgent = {
      name: "Demo User's AI Agent",
      type: 'personal-assistant',
      avatar: '🤖',
      level: 1,
      trustScore: 85
    };
    
    setAgentPassport(demoAgent);
    console.log('✅ 데모 Agent Passport 생성됨');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🚀 Zauri AI Passport 데모
          </h1>
          <p className="text-xl text-gray-600">
            WebAuthn + AI Agent 통합 시스템
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Agent Passport 카드 */}
          <div>
            <h2 className="text-2xl font-bold mb-4">🤖 AI Agent Passport</h2>
            <AgentPassportCard passport={agentPassport} />
            
            {!agentPassport && (
              <button
                onClick={handleCreateAgent}
                className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                데모 Agent 생성하기
              </button>
            )}
          </div>

          {/* 시스템 정보 */}
          <div>
            <h2 className="text-2xl font-bold mb-4">📊 시스템 상태</h2>
            <div className="bg-white rounded-xl p-6 border">
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">WebAuthn 상태:</span>
                  <span className="text-green-600 font-medium">✅ 연동됨</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">DID 시스템:</span>
                  <span className="text-green-600 font-medium">✅ 활성화</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Agent API:</span>
                  <span className="text-green-600 font-medium">✅ 준비됨</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">RAG-DAG 엔진:</span>
                  <span className="text-yellow-600 font-medium">🔄 개발중</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 다음 단계 안내 */}
        <div className="mt-12 bg-blue-50 rounded-xl p-6">
          <h3 className="text-xl font-bold text-blue-900 mb-4">🎯 다음 단계</h3>
          <div className="space-y-2 text-blue-800">
            <p>1. WebAuthn 로그인 시 Agent Passport 자동 생성</p>
            <p>2. RAG-DAG 개인화 엔진 연결</p>
            <p>3. 크로스플랫폼 동기화 구현</p>
            <p>4. CUE 토큰 경제 시스템 통합</p>
          </div>
        </div>
      </div>
    </div>
  );
}
