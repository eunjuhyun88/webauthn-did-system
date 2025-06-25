// =============================================================================
// 🤖 Agent Passport Card - 간단 버전
// =============================================================================

import React from 'react';

interface AgentPassportCardProps {
  passport?: {
    name: string;
    type: string;
    avatar: string;
    level: number;
    trustScore: number;
  } | null;
}

export const AgentPassportCard: React.FC<AgentPassportCardProps> = ({ passport }) => {
  if (!passport) {
    return (
      <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-xl p-6 text-center">
        <div className="text-4xl mb-3">🤖</div>
        <h3 className="font-bold text-gray-700 mb-2">AI Agent 미생성</h3>
        <p className="text-gray-500 text-sm">
          WebAuthn 로그인 후 자동으로 생성됩니다
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white">
      <div className="flex items-center space-x-4 mb-4">
        <div className="text-3xl">{passport.avatar}</div>
        <div>
          <h3 className="font-bold text-lg">{passport.name}</h3>
          <p className="text-blue-200 text-sm capitalize">{passport.type.replace('-', ' ')}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 text-center">
        <div>
          <div className="text-2xl font-bold">Lv.{passport.level}</div>
          <div className="text-blue-200 text-xs">레벨</div>
        </div>
        <div>
          <div className="text-2xl font-bold">{passport.trustScore}%</div>
          <div className="text-blue-200 text-xs">신뢰도</div>
        </div>
      </div>
    </div>
  );
};

export default AgentPassportCard;
