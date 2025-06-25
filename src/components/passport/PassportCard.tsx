'use client';

import React from 'react';
import { Sparkles, Database, Network, Wallet, Shield, Star, TrendingUp } from 'lucide-react';
import { AIPassport } from '@/types/passport';

interface PassportCardProps {
  passport: AIPassport;
  onViewAnalytics?: () => void;
  onViewVaults?: () => void;
  onViewPlatforms?: () => void;
  onViewAgents?: () => void;
}

export const PassportCard: React.FC<PassportCardProps> = ({
  passport,
  onViewAnalytics,
  onViewVaults,
  onViewPlatforms,
  onViewAgents
}) => {
  const getPassportLevelColor = (level: string) => {
    switch (level) {
      case 'Basic': return 'from-gray-400 to-gray-600';
      case 'Verified': return 'from-blue-500 to-indigo-600';
      case 'Premium': return 'from-purple-500 to-pink-600';
      case 'Enterprise': return 'from-yellow-500 to-orange-600';
      default: return 'from-indigo-500 to-purple-600';
    }
  };

  const getBiometricIcon = () => {
    if (passport.biometricVerified) {
      return <Shield className="w-4 h-4 text-green-400" />;
    }
    return <Shield className="w-4 h-4 text-gray-400" />;
  };

  return (
    <div className={`bg-gradient-to-br ${getPassportLevelColor(passport.passportLevel)} rounded-2xl p-6 text-white relative overflow-hidden shadow-xl`}>
      {/* Background Decorations */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-5 rounded-full -ml-12 -mb-12"></div>
      
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg">AI Passport</h3>
              <div className="flex items-center space-x-2">
                <p className="text-white text-opacity-80 text-sm">{passport.passportLevel} Level</p>
                {getBiometricIcon()}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{passport.trustScore}%</div>
            <div className="text-white text-opacity-70 text-xs">Trust Score</div>
          </div>
        </div>

        {/* DID & Wallet Info */}
        <div className="space-y-3 mb-6">
          <div className="text-xs text-white text-opacity-70">Digital Identity</div>
          <div className="font-mono text-sm break-all bg-black bg-opacity-20 rounded-lg p-3 backdrop-blur-sm">
            {passport.did.slice(0, 35)}...
          </div>
          <div className="flex items-center justify-between text-xs text-white text-opacity-70">
            <span>Wallet: {passport.walletAddress.slice(0, 10)}...</span>
            <span>Passkey: {passport.passkeyRegistered ? '✓' : '✗'}</span>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-4 gap-3">
          <button 
            onClick={onViewAnalytics}
            className="text-center hover:bg-white hover:bg-opacity-10 rounded-lg p-3 transition-all group"
          >
            <div className="text-lg font-bold group-hover:scale-110 transition-transform">
              {passport.cueTokens.toLocaleString()}
            </div>
            <div className="text-xs text-white text-opacity-70">CUE</div>
          </button>
          
          <button 
            onClick={onViewVaults}
            className="text-center hover:bg-white hover:bg-opacity-10 rounded-lg p-3 transition-all group"
          >
            <div className="text-lg font-bold group-hover:scale-110 transition-transform">
              {passport.dataVaults.length}
            </div>
            <div className="text-xs text-white text-opacity-70">Vaults</div>
          </button>
          
          <button 
            onClick={onViewPlatforms}
            className="text-center hover:bg-white hover:bg-opacity-10 rounded-lg p-3 transition-all group"
          >
            <div className="text-lg font-bold group-hover:scale-110 transition-transform">
              {passport.connectedPlatforms.filter(p => p.connected).length}
            </div>
            <div className="text-xs text-white text-opacity-70">Platforms</div>
          </button>
          
          <button 
            onClick={onViewAgents}
            className="text-center hover:bg-white hover:bg-opacity-10 rounded-lg p-3 transition-all group"
          >
            <div className="text-lg font-bold group-hover:scale-110 transition-transform">
              {passport.personalizedAgents.length}
            </div>
            <div className="text-xs text-white text-opacity-70">Agents</div>
          </button>
        </div>

        {/* Status Indicators */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${
              passport.registrationStatus === 'complete' ? 'bg-green-400' : 
              passport.registrationStatus === 'verified' ? 'bg-yellow-400' : 
              'bg-red-400'
            }`}></div>
            <span className="text-xs text-white text-opacity-70 capitalize">
              {passport.registrationStatus}
            </span>
          </div>
          
          {passport.activeTrainingSession && (
            <div className="flex items-center space-x-1">
              <TrendingUp className="w-3 h-3 text-green-400" />
              <span className="text-xs text-white text-opacity-70">Training Active</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
