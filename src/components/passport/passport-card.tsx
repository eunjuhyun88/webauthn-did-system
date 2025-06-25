'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';
import { usePassport } from '@/hooks/passport/use-passport';

interface PassportCardProps {
  onVaultClick?: () => void;
  onPlatformClick?: () => void;
  onAnalyticsClick?: () => void;
  className?: string;
}

export const PassportCard: React.FC<PassportCardProps> = ({
  onVaultClick,
  onPlatformClick,
  onAnalyticsClick,
  className = ''
}) => {
  const { passport, loading } = usePassport();

  // 로딩 중이거나 passport가 없을 때
  if (loading || !passport) {
    return (
      <div className={`bg-gray-100 rounded-2xl p-6 animate-pulse ${className}`}>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
              <div>
                <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-20"></div>
              </div>
            </div>
            <div className="text-right">
              <div className="h-6 bg-gray-200 rounded w-12 mb-1"></div>
              <div className="h-3 bg-gray-200 rounded w-16"></div>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="h-3 bg-gray-200 rounded w-24"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center bg-gray-200 rounded-lg p-3">
              <div className="h-6 bg-gray-300 rounded mb-1"></div>
              <div className="h-3 bg-gray-300 rounded"></div>
            </div>
            <div className="text-center bg-gray-200 rounded-lg p-3">
              <div className="h-6 bg-gray-300 rounded mb-1"></div>
              <div className="h-3 bg-gray-300 rounded"></div>
            </div>
            <div className="text-center bg-gray-200 rounded-lg p-3">
              <div className="h-6 bg-gray-300 rounded mb-1"></div>
              <div className="h-3 bg-gray-300 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 안전한 데이터 접근
  const {
    did = 'did:cue:0x742d35Cc...',
    trustScore = 0,
    passportLevel = 'Basic',
    cueTokens = 0,
    dataVaults = [],
    connectedPlatforms = []
  } = passport;

  const connectedCount = connectedPlatforms.filter(p => p.connected).length;

  return (
    <div className={`bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-6 text-white relative overflow-hidden ${className}`}>
      {/* 배경 장식 */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-5 rounded-full -ml-12 -mb-12"></div>
      
      <div className="relative z-10">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg">AI Passport + Cue</h3>
              <p className="text-indigo-200 text-sm">{passportLevel} Level</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{trustScore}%</div>
            <div className="text-indigo-200 text-xs">Trust Score</div>
          </div>
        </div>

        {/* DID 정보 */}
        <div className="space-y-3 mb-6">
          <div className="text-xs text-indigo-200">통합 신원 + 지갑</div>
          <div className="font-mono text-sm break-all bg-black bg-opacity-20 rounded-lg p-3 backdrop-blur-sm">
            {did.length > 35 ? `${did.slice(0, 35)}...` : did}
          </div>
        </div>

        {/* 통계 */}
        <div className="grid grid-cols-3 gap-4">
          <button 
            onClick={onAnalyticsClick}
            className="text-center hover:bg-white hover:bg-opacity-10 rounded-lg p-3 transition-all"
          >
            <div className="text-xl font-bold">{cueTokens.toLocaleString()}</div>
            <div className="text-xs text-indigo-200">CUE 토큰</div>
          </button>
          <button 
            onClick={onVaultClick}
            className="text-center hover:bg-white hover:bg-opacity-10 rounded-lg p-3 transition-all"
          >
            <div className="text-xl font-bold">{dataVaults.length}</div>
            <div className="text-xs text-indigo-200">AI 볼트</div>
          </button>
          <button 
            onClick={onPlatformClick}
            className="text-center hover:bg-white hover:bg-opacity-10 rounded-lg p-3 transition-all"
          >
            <div className="text-xl font-bold">{connectedCount}</div>
            <div className="text-xs text-indigo-200">플랫폼</div>
          </button>
        </div>
      </div>
    </div>
  );
};
