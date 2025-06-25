'use client';

import React, { useState } from 'react';
import { MessageCircle, Cpu, Activity, Fingerprint, Database, BarChart3, Menu, Settings, Sparkles, Brain } from 'lucide-react';
import { PassportCard } from '../passport/passport-card';
import { ChatInterface } from '../chat/chat-interface';
import { usePassport } from '@/hooks/passport/use-passport';

type ViewType = 'chat' | 'agents' | 'dashboard' | 'passport' | 'vaults' | 'analytics';

export const MainDashboard: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewType>('chat');
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  const { passport, loading, error } = usePassport();

  const views = [
    { id: 'chat' as const, label: '개인화 AI 채팅', icon: MessageCircle },
    { id: 'agents' as const, label: 'AI 에이전트', icon: Cpu },
    { id: 'dashboard' as const, label: '대시보드', icon: Activity },
    { id: 'passport' as const, label: 'AI Passport', icon: Fingerprint },
    { id: 'vaults' as const, label: '데이터 볼트', icon: Database },
    { id: 'analytics' as const, label: 'Cue 분석', icon: BarChart3 }
  ];

  React.useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setShowMobileSidebar(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleMobileSidebar = () => {
    setShowMobileSidebar(!showMobileSidebar);
  };

  // 에러 상태 표시
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Activity className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">시스템 오류</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            새로고침
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* 헤더 */}
      <header className="bg-white border-b border-gray-200 px-4 lg:px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {isMobile && (
              <button
                onClick={toggleMobileSidebar}
                className="p-2 hover:bg-gray-100 rounded-lg lg:hidden"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}
            
            <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-gray-900">AI Passport + Cue</h1>
              <p className="text-sm text-gray-500">개인화 AI + 컨텍스트 채굴 플랫폼</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 lg:space-x-3">
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <Settings className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* 모바일 사이드바 오버레이 */}
        {isMobile && showMobileSidebar && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setShowMobileSidebar(false)}
          />
        )}

        {/* 사이드바 */}
        <aside className={`
          ${isMobile ? 'fixed inset-y-0 left-0 z-50' : 'relative'}
          ${isMobile && !showMobileSidebar ? '-translate-x-full' : 'translate-x-0'}
          w-80 bg-white border-r border-gray-200 p-4 lg:p-6 overflow-y-auto transition-transform duration-300 ease-in-out
        `}>
          <div className="space-y-6">
            {/* Passport Card */}
            <PassportCard 
              onAnalyticsClick={() => {
                setCurrentView('analytics');
                if (isMobile) setShowMobileSidebar(false);
              }}
              onVaultClick={() => {
                setCurrentView('vaults');
                if (isMobile) setShowMobileSidebar(false);
              }}
              onPlatformClick={() => {
                setCurrentView('dashboard');
                if (isMobile) setShowMobileSidebar(false);
              }}
            />
            
            {/* 빠른 통계 */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
                <div className="flex items-center space-x-2 mb-2">
                  <Sparkles className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800">오늘의 채굴</span>
                </div>
                <div className="text-2xl font-bold text-green-700">+47</div>
                <div className="text-xs text-green-600">CUE 토큰</div>
              </div>
              
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-100">
                <div className="flex items-center space-x-2 mb-2">
                  <MessageCircle className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">AI 사용</span>
                </div>
                <div className="text-2xl font-bold text-blue-700">12회</div>
                <div className="text-xs text-blue-600">개인화 응답</div>
              </div>
            </div>

            {/* AI 개성 프로필 */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                <Brain className="w-4 h-4 text-purple-600" />
                <span>AI 개성 프로필</span>
              </h4>
              
              <div className="space-y-3">
                <div className="bg-purple-50 rounded-lg p-3">
                  <div className="text-sm font-medium text-purple-900">
                    {passport?.personalityProfile?.type || 'INTJ-A (Architect)'}
                  </div>
                  <div className="text-xs text-purple-600 mt-1">성격 유형</div>
                </div>
                <div className="grid grid-cols-1 gap-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-600">소통 스타일:</span>
                    <span className="font-medium text-gray-900">
                      {passport?.personalityProfile?.communicationStyle || 'Direct & Technical'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">학습 패턴:</span>
                    <span className="font-medium text-gray-900">
                      {passport?.personalityProfile?.learningPattern || 'Visual + Hands-on'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 플랫폼 상태 */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-900">플랫폼 상태</h4>
                <button className="text-xs text-indigo-600 hover:text-indigo-700">
                  관리
                </button>
              </div>
              <div className="space-y-2">
                {passport?.connectedPlatforms?.slice(0, 3).map(platform => (
                  <div key={platform.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{platform.icon}</span>
                      <div className={`w-2 h-2 rounded-full ${
                        platform.connected ? 'bg-green-500' : 'bg-red-500'
                      }`}></div>
                      <span className="text-sm text-gray-700">{platform.name}</span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {platform.cueCount}C/{platform.contextMined}AI
                    </span>
                  </div>
                )) || (
                  <div className="text-center text-gray-500 text-sm py-4">
                    {loading ? (
                      <div className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded"></div>
                      </div>
                    ) : (
                      <>
                        <Activity className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                        <p>플랫폼 정보 로딩 중...</p>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </aside>

        {/* 메인 콘텐츠 */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* 뷰 탭 */}
          <div className="bg-white border-b border-gray-200 px-6 py-3 flex-shrink-0">
            <div className="flex space-x-1 overflow-x-auto">
              {views.map(view => (
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

          {/* 뷰 콘텐츠 */}
          <div className="flex-1 overflow-hidden">
            {currentView === 'chat' && <ChatInterface />}
            
            {currentView === 'dashboard' && (
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">통합 대시보드</h2>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {passport?.dataVaults?.map(vault => (
                    <div key={vault.id} className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-all">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                          <Database className="w-6 h-6 text-indigo-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{vault.name}</h4>
                          <p className="text-sm text-gray-500">{vault.category}</p>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-4">{vault.description}</p>
                      
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="text-center bg-gray-50 rounded-lg p-3">
                          <div className="text-xl font-bold text-gray-900">{vault.dataCount}</div>
                          <div className="text-xs text-gray-500">데이터</div>
                        </div>
                        <div className="text-center bg-gray-50 rounded-lg p-3">
                          <div className="text-xl font-bold text-green-600">{vault.cueCount}</div>
                          <div className="text-xs text-gray-500">Cues</div>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-1">
                        {vault.sourceplatforms?.map(platform => (
                          <span key={platform} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                            {platform}
                          </span>
                        ))}
                      </div>
                    </div>
                  )) || (
                    <div className="col-span-full text-center text-gray-500 py-12">
                      {loading ? (
                        <div className="animate-pulse space-y-4">
                          <div className="h-32 bg-gray-200 rounded"></div>
                          <div className="h-32 bg-gray-200 rounded"></div>
                          <div className="h-32 bg-gray-200 rounded"></div>
                        </div>
                      ) : (
                        <>
                          <Database className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                          <p>데이터 볼트 정보 로딩 중...</p>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* 나머지 뷰들... */}
            {currentView === 'agents' && (
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">개인화 AI 에이전트</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {passport?.personalizedAgents?.map(agent => (
                    <div key={agent.id} className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-all">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          agent.type === 'coding' ? 'bg-blue-100' :
                          agent.type === 'creative' ? 'bg-purple-100' :
                          'bg-green-100'
                        }`}>
                          {agent.type === 'coding' && <Cpu className="w-6 h-6 text-blue-600" />}
                          {agent.type === 'creative' && <Sparkles className="w-6 h-6 text-purple-600" />}
                          {agent.type === 'analysis' && <BarChart3 className="w-6 h-6 text-green-600" />}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{agent.name}</h4>
                          <p className="text-sm text-gray-500 capitalize">{agent.type}</p>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-4">{agent.description}</p>
                      
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="text-center bg-gray-50 rounded-lg p-3">
                          <div className="text-lg font-bold text-gray-900">{agent.accuracy}%</div>
                          <div className="text-xs text-gray-500">정확도</div>
                        </div>
                        <div className="text-center bg-gray-50 rounded-lg p-3">
                          <div className="text-lg font-bold text-green-600">{agent.usageCount}</div>
                          <div className="text-xs text-gray-500">사용 횟수</div>
                        </div>
                      </div>
                    </div>
                  )) || (
                    <div className="col-span-full text-center text-gray-500 py-12">
                      <Cpu className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                      <p>AI 에이전트 정보 로딩 중...</p>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {currentView === 'passport' && (
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">AI Passport 상세</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white rounded-2xl border border-gray-200 p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">신원 정보</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">DID:</span>
                        <span className="font-mono text-sm">{passport?.did?.slice(0, 20) || 'did:cue:0x742d35C...'}...</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">신뢰 점수:</span>
                        <span className="font-semibold text-green-600">{passport?.trustScore || 96.8}%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">등급:</span>
                        <span className="font-semibold">{passport?.passportLevel || 'Verified'}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-2xl border border-gray-200 p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">AI 개성 프로필</h3>
                    <div className="space-y-4">
                      {passport?.personalityProfile && Object.entries(passport.personalityProfile).map(([key, value]) => (
                        <div key={key} className="bg-gray-50 rounded-xl p-4">
                          <div className="text-sm font-medium text-gray-900 mb-2">
                            {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                          </div>
                          <div className="text-sm text-gray-700">{value}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {currentView === 'vaults' && (
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">데이터 볼트 관리</h2>
                <p className="text-gray-600">데이터 볼트 관리 화면이 여기에 표시됩니다.</p>
              </div>
            )}
            
            {currentView === 'analytics' && (
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Cue 분석</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-white rounded-2xl border border-gray-200 p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">채굴 통계</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">총 CUE:</span>
                        <span className="font-bold text-green-600 text-xl">{passport?.cueTokens?.toLocaleString() || '15,428'}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">오늘 채굴:</span>
                        <span className="font-bold text-blue-600 text-xl">+47</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">평균/일:</span>
                        <span className="font-bold text-purple-600 text-xl">23.5</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};
