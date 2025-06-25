'use client';

import React, { useState } from 'react';
import { Sparkles, Shield, Brain, Database } from 'lucide-react';

// 기존 컴포넌트들 (있다면 import)
// import { ExistingDashboard } from '@/components/dashboard/ExistingDashboard';

// 새로운 Hybrid 컴포넌트들
import { HybridCard } from '@/components/hybrid/ui/HybridCard';
import { useResponsive } from '@/hooks/hybrid/useResponsive';

export default function DashboardPage() {
  const { isMobile } = useResponsive();
  const [showHybrid, setShowHybrid] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold text-gray-900 mb-2`}>
            AI Dashboard
          </h1>
          <p className="text-gray-600">
            WebAuthn + DID + Hybrid AI Passport 통합 시스템
          </p>
        </div>

        {/* 시스템 상태 카드 */}
        <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2 lg:grid-cols-4'} gap-6 mb-8`}>
          <HybridCard className="from-blue-50 to-blue-100" gradient>
            <div className="flex items-center space-x-3">
              <Shield className="w-8 h-8 text-blue-600" />
              <div>
                <div className="text-2xl font-bold text-blue-900">WebAuthn</div>
                <div className="text-sm text-blue-700">보안 인증</div>
              </div>
            </div>
          </HybridCard>

          <HybridCard className="from-green-50 to-green-100" gradient>
            <div className="flex items-center space-x-3">
              <Database className="w-8 h-8 text-green-600" />
              <div>
                <div className="text-2xl font-bold text-green-900">DID</div>
                <div className="text-sm text-green-700">분산 신원</div>
              </div>
            </div>
          </HybridCard>

          <HybridCard className="from-purple-50 to-purple-100" gradient>
            <div className="flex items-center space-x-3">
              <Brain className="w-8 h-8 text-purple-600" />
              <div>
                <div className="text-2xl font-bold text-purple-900">CUE</div>
                <div className="text-sm text-purple-700">맥락 시스템</div>
              </div>
            </div>
          </HybridCard>

          <HybridCard className="from-orange-50 to-orange-100" gradient>
            <div className="flex items-center space-x-3">
              <Sparkles className="w-8 h-8 text-orange-600" />
              <div>
                <div className="text-2xl font-bold text-orange-900">Hybrid</div>
                <div className="text-sm text-orange-700">AI 패스포트</div>
              </div>
            </div>
          </HybridCard>
        </div>

        {/* Hybrid 시스템 토글 */}
        <div className="mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowHybrid(!showHybrid)}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                showHybrid 
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg' 
                  : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-purple-300'
              }`}
            >
              {showHybrid ? '기존 대시보드로 전환' : 'Hybrid AI 패스포트 활성화'}
            </button>
            {showHybrid && (
              <div className="flex items-center space-x-2 text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">Hybrid System Active</span>
              </div>
            )}
          </div>
        </div>

        {/* 콘텐츠 영역 */}
        {showHybrid ? (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gradient-to-r from-indigo-100 via-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                <Sparkles className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                🎉 Hybrid AI Passport 시스템
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                기존 WebAuthn + DID 시스템과 완벽하게 통합된 차세대 개인화 AI입니다.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
                <div className="p-6 bg-gray-50 rounded-xl">
                  <Brain className="w-8 h-8 text-indigo-600 mx-auto mb-3" />
                  <h4 className="font-semibold text-gray-900 mb-2">개성 기반 AI</h4>
                  <p className="text-sm text-gray-600">사용자 맞춤형 응답</p>
                </div>
                <div className="p-6 bg-gray-50 rounded-xl">
                  <Shield className="w-8 h-8 text-green-600 mx-auto mb-3" />
                  <h4 className="font-semibold text-gray-900 mb-2">보안 강화</h4>
                  <p className="text-sm text-gray-600">WebAuthn 통합 보안</p>
                </div>
                <div className="p-6 bg-gray-50 rounded-xl">
                  <Database className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                  <h4 className="font-semibold text-gray-900 mb-2">데이터 볼트</h4>
                  <p className="text-sm text-gray-600">암호화된 개인 데이터</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">기존 대시보드</h2>
            <p className="text-gray-600 mb-6">
              WebAuthn 인증, DID 관리, CUE 시스템이 여기에 표시됩니다.
            </p>
            {/* 기존 대시보드 컴포넌트들이 여기에 들어갑니다 */}
            <div className="text-center py-12 text-gray-400">
              <Database className="w-12 h-12 mx-auto mb-4" />
              <p>기존 시스템 컴포넌트를 여기에 추가하세요</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
