'use client';

import React from 'react';
import { Sparkles, Database, Network, Wallet } from 'lucide-react';
import { UnifiedAIPassport } from '@/types/passport';

interface PassportCardProps {
  passport: UnifiedAIPassport;
  onViewAnalytics?: () => void;
  onViewVaults?: () => void;
  onViewPlatforms?: () => void;
}

export const PassportCard: React.FC<PassportCardProps> = ({
  passport,
  onViewAnalytics,
  onViewVaults,
  onViewPlatforms
}) => {
  return (
    <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-6 text-white relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-5 rounded-full -ml-12 -mb-12"></div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg">AI Passport + Cue</h3>
              <p className="text-indigo-200 text-sm">{passport.passportLevel} Level</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{passport.trustScore}%</div>
            <div className="text-indigo-200 text-xs">Trust Score</div>
          </div>
        </div>

        <div className="space-y-3 mb-6">
          <div className="text-xs text-indigo-200">통합 신원 + 지갑</div>
          <div className="font-mono text-sm break-all bg-black bg-opacity-20 rounded-lg p-3 backdrop-blur-sm">
            {passport.did.slice(0, 35)}...
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <button 
            onClick={onViewAnalytics}
            className="text-center hover:bg-white hover:bg-opacity-10 rounded-lg p-3 transition-all"
          >
            <div className="text-xl font-bold">{passport.cueTokens.toLocaleString()}</div>
            <div className="text-xs text-indigo-200">CUE 토큰</div>
          </button>
          <button 
            onClick={onViewVaults}
            className="text-center hover:bg-white hover:bg-opacity-10 rounded-lg p-3 transition-all"
          >
            <div className="text-xl font-bold">{passport.dataVaults.length}</div>
            <div className="text-xs text-indigo-200">AI 볼트</div>
          </button>
          <button 
            onClick={onViewPlatforms}
            className="text-center hover:bg-white hover:bg-opacity-10 rounded-lg p-3 transition-all"
          >
            <div className="text-xl font-bold">{passport.connectedPlatforms.filter(p => p.connected).length}</div>
            <div className="text-xs text-indigo-200">플랫폼</div>
          </button>
        </div>
      </div>
    </div>
  );
};
