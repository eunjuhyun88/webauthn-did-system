'use client';

import { useState } from 'react';

export default function ZauriDemo() {
  const [agentCreated, setAgentCreated] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl font-bold mb-8">🤖 Zauri AI Agent 데모</h1>
        
        {!agentCreated ? (
          <div className="bg-white rounded-xl p-8 shadow-lg">
            <div className="text-6xl mb-4">🤖</div>
            <h3 className="text-xl font-bold mb-4">AI Agent 미생성</h3>
            <button
              onClick={() => setAgentCreated(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              데모 Agent 생성하기
            </button>
          </div>
        ) : (
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-8 text-white shadow-lg">
            <div className="text-6xl mb-4">🤖</div>
            <h3 className="text-2xl font-bold mb-2">Demo User's AI Agent</h3>
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="bg-white bg-opacity-20 rounded-lg p-4">
                <div className="text-2xl font-bold">Lv.1</div>
                <div className="text-sm">레벨</div>
              </div>
              <div className="bg-white bg-opacity-20 rounded-lg p-4">
                <div className="text-2xl font-bold">85%</div>
                <div className="text-sm">신뢰도</div>
              </div>
            </div>
            <div className="mt-6">
              <div className="w-3 h-3 bg-green-400 rounded-full mx-auto mb-2 animate-pulse"></div>
              <p className="text-sm">활성 상태</p>
            </div>
          </div>
        )}
        
        <div className="mt-8 text-left bg-white rounded-xl p-6 shadow-lg">
          <h3 className="text-xl font-bold mb-4">📊 시스템 상태</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Next.js:</span>
              <span className="text-green-600">✅ 정상</span>
            </div>
            <div className="flex justify-between">
              <span>Tailwind CSS:</span>
              <span className="text-green-600">✅ 정상</span>
            </div>
            <div className="flex justify-between">
              <span>WebAuthn:</span>
              <span className="text-yellow-600">🔄 준비중</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
