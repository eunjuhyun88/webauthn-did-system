'use client';

import React, { useState, useEffect } from 'react';
import { 
  MessageCircle, Activity, Database, Network, 
  Fingerprint, BarChart3, Menu, Settings,
  Sparkles, RefreshCw, Shield, Brain, Zap,
  Users, TrendingUp, Globe, Lock
} from 'lucide-react';
import { PassportCard } from '@/components/passport/PassportCard';
import { ChatInterface } from '@/components/zauri/ChatInterface';
import { useAIPassport } from '@/hooks/passport/useAIPassport';
import { useZauri } from '@/hooks/zauri/useZauri';
import { ViewType } from '@/types/shared';

export const IntegratedDashboard: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewType>('chat');
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const { passport, isLoading: passportLoading, addCueTokens } = useAIPassport();
  const { 
    user, 
    messages, 
    isTyping, 
    activeTransfers, 
    sendMessage, 
    startContextTransfer,
    getRAGStats,
    getTransferStats
  } = useZauri();

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setShowMobileSidebar(false);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const viewTabs = [
    { id: 'chat' as ViewType, label: 'AI 채팅', icon: MessageCircle },
    { id: 'dashboard' as ViewType, label: '대시보드', icon: Activity },
    { id: 'passport' as ViewType, label: 'AI Passport', icon: Fingerprint },
    { id: 'vaults' as ViewType, label: '데이터 볼트', icon: Database },
    { id: 'platforms' as ViewType, label: '플랫폼', icon: Network },
    { id: 'analytics' as ViewType, label: '분석', icon: BarChart3 }
  ];

  const handleContextTransfer = async () => {
    if (user?.connectedPlatforms.length >= 2) {
      const platforms = user.connectedPlatforms.filter(p => p.connected);
      await startContextTransfer(platforms[0].id, platforms[1].id);
    }
  };

  if (passportLoading || !user || !passport) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Zauri + AI Passport 로딩 중...</h2>
          <p className="text-gray-600">통합 시스템을 초기화하고 있습니다</p>
        </div>
      </div>
    );
  }

  const ragStats = getRAGStats();
  const transferStats = getTransferStats();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 lg:px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {isMobile && (
              <button
                onClick={() => setShowMobileSidebar(!showMobileSidebar)}
                className="p-2 hover:bg-gray-100 rounded-lg lg:hidden"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}
            
            <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-gray-900">Zauri + AI Passport</h1>
              <p className="text-sm text-gray-500">통합 AI 개인화 플랫폼</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 lg:space-x-3">
            <button
              onClick={handleContextTransfer}
              className="px-3 lg:px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg text-sm hover:bg-indigo-100 flex items-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="hidden sm:inline">동기화</span>
            </button>
            
            <div className="hidden md:flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-1">
                <Shield className="w-4 h-4 text-green-600" />
                <span className="text-green-700 font-medium">{passport.trustScore}%</span>
              </div>
              <div className="flex items-center space-x-1">
                <Brain className="w-4 h-4 text-purple-600" />
                <span className="text-purple-700 font-medium">{ragStats.totalNodes}</span>
              </div>
            </div>
            
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <Settings className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Mobile Sidebar Overlay */}
        {isMobile && showMobileSidebar && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setShowMobileSidebar(false)}
          />
        )}

        {/* Sidebar */}
        <aside className={`
          ${isMobile ? 'fixed inset-y-0 left-0 z-50' : 'relative'}
          ${isMobile && !showMobileSidebar ? '-translate-x-full' : 'translate-x-0'}
          w-80 bg-white border-r border-gray-200 flex flex-col transition-transform duration-300 ease-in-out
        `}>
          <div className="p-6 border-b border-gray-200">
            <PassportCard 
              passport={passport}
              onViewAnalytics={() => setCurrentView('analytics')}
              onViewVaults={() => setCurrentView('vaults')}
              onViewPlatforms={() => setCurrentView('platforms')}
              onViewAgents={() => setCurrentView('agents')}
            />
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
                <div className="flex items-center space-x-2 mb-2">
                  <Database className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800">RAG 노드</span>
                </div>
                <div className="text-2xl font-bold text-green-700">{ragStats.totalNodes}</div>
                <div className="text-xs text-green-600">지식 그래프</div>
              </div>
              
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-100">
                <div className="flex items-center space-x-2 mb-2">
                  <Network className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">플랫폼</span>
                </div>
                <div className="text-2xl font-bold text-blue-700">
                  {user.connectedPlatforms.filter(p => p.connected).length}
                </div>
                <div className="text-xs text-blue-600">연결됨</div>
              </div>
            </div>

            {/* Active Transfers */}
            {activeTransfers.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                  <RefreshCw className="w-4 h-4 text-blue-600" />
                  <span>활성 전송</span>
                </h4>
                <div className="space-y-2">
                  {activeTransfers.map(transfer => (
                    <div key={transfer.id} className="bg-gray-50 rounded-lg p-3">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">
                          {transfer.fromPlatform} → {transfer.toPlatform}
                        </span>
                        <span className="text-xs text-gray-500">{transfer.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${transfer.progress}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        압축: {Math.round((1 - transfer.compressionRatio) * 100)}% | 
                        충실도: {Math.round(transfer.fidelityScore * 100)}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Token Balances */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span>토큰 잔고</span>
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">ZAURI</span>
                  <span className="font-semibold">{user.tokenBalances.zauri.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">ZGT</span>
                  <span className="font-semibold">{user.tokenBalances.zgt.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">ZRP</span>
                  <span className="font-semibold text-green-600">
                    {user.tokenBalances.zrp.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                  <span className="text-sm text-gray-600">CUE</span>
                  <span className="font-semibold text-indigo-600">
                    {passport.cueTokens.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Platform Status */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                <Globe className="w-4 h-4 text-green-600" />
                <span>플랫폼 상태</span>
              </h4>
              <div className="space-y-2">
                {user.connectedPlatforms.map(platform => (
                  <div key={platform.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{platform.icon}</span>
                      <span className="text-sm font-medium">{platform.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${
                        platform.status === 'active' ? 'bg-green-400' :
                        platform.status === 'syncing' ? 'bg-yellow-400' :
                        'bg-red-400'
                      }`}></div>
                      <span className="text-xs text-gray-500">
                        {Math.round(platform.syncQuality)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* View Tabs */}
          <div className="bg-white border-b border-gray-200 px-6 py-3 flex-shrink-0">
            <div className="flex space-x-1 overflow-x-auto">
              {viewTabs.map(view => (
                <button
                  key={view.id}
                  onClick={() => {
                    setCurrentView(view.id);
                    if (isMobile) setShowMobileSidebar(false);
                  }}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all whitespace-nowrap ${
                    currentView === view.id 
                      ? 'bg-indigo-100 text-indigo-700' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <view.icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{view.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* View Content */}
          {currentView === 'chat' && (
            <ChatInterface
              user={user}
              messages={messages}
              onSendMessage={sendMessage}
              isTyping={isTyping}
              activeTransfers={activeTransfers.length}
            />
          )}

          {currentView === 'dashboard' && (
            <div className="flex-1 overflow-y-auto p-4 lg:p-6">
              <div className="space-y-6">
                <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">통합 대시보드</h2>
                
                {/* Quick Overview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white rounded-2xl border border-gray-200 p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                        <span className="text-2xl">{user.agentPassport.avatar}</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{user.agentPassport.name}</h4>
                        <p className="text-sm text-gray-500">Level {user.agentPassport.level}</p>
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-2">
                      {user.agentPassport.trustScore}%
                    </div>
                    <div className="text-sm text-indigo-600">신뢰도 점수</div>
                  </div>

                  <div className="bg-white rounded-2xl border border-gray-200 p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                        <Database className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">데이터 볼트</h4>
                        <p className="text-sm text-gray-500">통합 저장소</p>
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-2">
                      {passport.dataVaults.length}
                    </div>
                    <div className="text-sm text-purple-600">활성 볼트</div>
                  </div>

                  <div className="bg-white rounded-2xl border border-gray-200 p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                        <Network className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">플랫폼</h4>
                        <p className="text-sm text-gray-500">크로스 동기화</p>
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-2">
                      {user.connectedPlatforms.filter(p => p.connected).length}
                    </div>
                    <div className="text-sm text-blue-600">연결됨</div>
                  </div>

                  <div className="bg-white rounded-2xl border border-gray-200 p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                        <Sparkles className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">오늘 수익</h4>
                        <p className="text-sm text-gray-500">채굴 토큰</p>
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-2">
                      +{user.agentPassport.earningsToday}
                    </div>
                    <div className="text-sm text-green-600">ZRP + CUE</div>
                  </div>
                </div>

                {/* System Status */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white rounded-2xl border border-gray-200 p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-6">RAG-DAG 시스템</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">지식 노드</span>
                        <span className="font-semibold">{ragStats.totalNodes}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">연결점</span>
                        <span className="font-semibold">{ragStats.totalConnections}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">평균 연결도</span>
                        <span className="font-semibold">{ragStats.averageConnections.toFixed(1)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-gray-200 p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-6">전송 통계</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">활성 전송</span>
                        <span className="font-semibold">{transferStats.activeCount}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">오늘 완료</span>
                        <span className="font-semibold">{transferStats.completedToday}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">평균 전송 시간</span>
                        <span className="font-semibold">
                          {(transferStats.averageTransferTime / 1000).toFixed(1)}s
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">최근 활동</h3>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">새로운 ZRP 토큰 채굴</p>
                        <p className="text-sm text-gray-500">5분 전 • +{user.agentPassport.earningsToday} ZRP</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <RefreshCw className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">크로스플랫폼 동기화 완료</p>
                        <p className="text-sm text-gray-500">
                          12분 전 • {user.connectedPlatforms.filter(p => p.connected).map(p => p.name).join(' ↔ ')}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <Database className="w-5 h-5 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">RAG-DAG 노드 추가</p>
                        <p className="text-sm text-gray-500">25분 전 • 새로운 지식 그래프 연결</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Other views */}
          {!['chat', 'dashboard'].includes(currentView) && (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Settings className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {viewTabs.find(v => v.id === currentView)?.label}
                </h3>
                <p className="text-gray-600">이 뷰는 아직 구현 중입니다.</p>
                <p className="text-sm text-gray-500 mt-2">
                  현재 채팅과 대시보드 기능이 완전히 구현되어 있습니다.
                </p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
