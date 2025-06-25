'use client';

// =============================================================================
// 🚀 Fusion AI Dashboard - 기존 GitHub 구조 완벽 호환 버전
// 파일: src/components/dashboard/FusionDashboard.tsx
// =============================================================================

import React, { useState, useEffect, useCallback } from 'react';
import { 
  MessageCircle, Database, User, Settings, Send, Fingerprint, 
  CheckCircle, XCircle, AlertCircle, Layers, TrendingUp, Menu, X, 
  Sparkles, Eye, Zap, Bell, Shield, Mic, Camera, Code, Lightbulb, 
  Award, BookOpen, Brain, Maximize2, Minimize2, Lock, Key, Globe, 
  Clock, Activity, BarChart3, Plus, Search, Filter, ArrowRight, 
  ChevronDown, ChevronUp, Network, Cpu, Wifi, WifiOff, Heart, 
  MoreHorizontal
} from 'lucide-react';

// 기존 GitHub 구조의 서비스들 import
import { checkWebAuthnSupport, performRegistration } from '@/auth/webauthn/client';
import { getCueExtractor } from '@/lib/cue/CueExtractor';
import { getAIServiceManager } from '@/services/ai/index';

// =============================================================================
// 🎨 타입 정의 (기존 GitHub 구조 호환)
// =============================================================================

interface EnhancedUser {
  id: string;
  did?: string;
  email: string;
  displayName: string;
  authMethod: 'google' | 'webauthn' | 'demo';
  avatar?: string;
  subscription: 'free' | 'pro' | 'enterprise';
  preferences: UserPreferences;
  agentProfile?: AgentProfile;
}

interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: 'ko' | 'en' | 'ja';
  notifications: boolean;
  aiPersonality: 'professional' | 'friendly' | 'technical' | 'creative';
  responseStyle: 'brief' | 'detailed' | 'examples';
}

interface AgentProfile {
  name: string;
  type: string;
  did: string;
  passportNo: string;
  status: 'active' | 'inactive' | 'learning' | 'maintenance';
  level: number;
  trustScore: number;
  avatar: string;
}

interface Message {
  id: string;
  content: string;
  type: 'user' | 'ai' | 'system';
  timestamp: Date;
  aiService?: 'openai' | 'anthropic' | 'google';
  cueExtracted?: number;
  tokensEarned?: number;
}

interface UnifiedDataVault {
  id: string;
  name: string;
  category: 'identity' | 'behavioral' | 'professional' | 'social' | 'preferences' | 'expertise';
  description: string;
  dataCount: number;
  cueCount: number;
  encrypted: boolean;
  lastUpdated: Date;
  accessLevel: 'public' | 'private' | 'selective';
  value: number;
  usageCount: number;
  sourceplatforms: string[];
}

interface ActivityItem {
  id: string;
  type: 'auth' | 'chat' | 'cue' | 'training' | 'connection' | 'mining';
  title: string;
  description: string;
  timestamp: Date;
  status: 'success' | 'warning' | 'error' | 'info';
  details?: any;
}

// =============================================================================
// 🎯 메인 Fusion AI Dashboard 컴포넌트
// =============================================================================

export default function FusionDashboard() {
  // 상태 관리
  const [user, setUser] = useState<EnhancedUser | null>(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showLogin, setShowLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  
  // UI 상태
  const [currentView, setCurrentView] = useState<string>('chat');
  const [rightPanelView, setRightPanelView] = useState<'insights' | 'passport' | 'knowledge' | 'connections'>('insights');
  const [showRightPanel, setShowRightPanel] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  
  // 데이터 상태
  const [activityFeed, setActivityFeed] = useState<ActivityItem[]>([]);
  const [dataVaults, setDataVaults] = useState<UnifiedDataVault[]>([]);
  const [cueTokenBalance, setCueTokenBalance] = useState(15847);
  const [totalCuesMined, setTotalCuesMined] = useState(2834);

  // =============================================================================
  // 🔧 초기화 및 생명주기
  // =============================================================================

  useEffect(() => {
    initializeDashboard();
    setupMobileDetection();
  }, []);

  const initializeDashboard = async () => {
    try {
      setIsLoading(true);
      
      // WebAuthn 지원 확인 (기존 GitHub 구조 활용)
      const webauthnSupported = await checkWebAuthnSupport();
      
      // 데모 사용자 설정
      const demoUser: EnhancedUser = {
        id: 'demo-user-001',
        did: 'did:ethr:0x1234567890123456789012345678901234567890',
        email: 'demo@fusion-ai.com',
        displayName: '데모 사용자',
        authMethod: 'demo',
        avatar: '/api/placeholder/64/64',
        subscription: 'pro',
        preferences: {
          theme: 'light',
          language: 'ko',
          notifications: true,
          aiPersonality: 'friendly',
          responseStyle: 'detailed'
        },
        agentProfile: {
          name: 'Personal AI Agent',
          type: 'Fusion Assistant',
          did: 'did:agent:fusion-001',
          passportNo: 'FA-2024-001',
          status: 'active',
          level: 7,
          trustScore: 0.94,
          avatar: '/api/placeholder/40/40'
        }
      };

      setUser(demoUser);
      
      // 초기 데이터 설정
      await loadInitialData();
      
      setShowLogin(false);
      
    } catch (error) {
      console.error('Dashboard 초기화 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadInitialData = async () => {
    // 샘플 활동 피드
    const sampleActivity: ActivityItem[] = [
      {
        id: '1',
        type: 'cue',
        title: 'CUE 추출 완료',
        description: '대화에서 15개의 새로운 CUE가 추출되었습니다',
        timestamp: new Date(Date.now() - 1000 * 60 * 5),
        status: 'success'
      },
      {
        id: '2', 
        type: 'auth',
        title: 'WebAuthn 인증 성공',
        description: 'Touch ID를 통한 안전한 로그인이 완료되었습니다',
        timestamp: new Date(Date.now() - 1000 * 60 * 15),
        status: 'success'
      },
      {
        id: '3',
        type: 'chat',
        title: 'AI 대화 세션',
        description: 'Claude 3.5 Sonnet과 TypeScript 개발에 대해 논의',
        timestamp: new Date(Date.now() - 1000 * 60 * 30),
        status: 'info'
      }
    ];

    // 샘플 데이터 볼트
    const sampleVaults: UnifiedDataVault[] = [
      {
        id: 'vault-1',
        name: '전문 개발 지식',
        category: 'expertise',
        description: 'TypeScript, React, Next.js 관련 전문 지식과 경험',
        dataCount: 1247,
        cueCount: 623,
        encrypted: true,
        lastUpdated: new Date(),
        accessLevel: 'private',
        value: 8.7,
        usageCount: 89,
        sourceplatforms: ['GitHub', 'Stack Overflow', 'Documentation']
      },
      {
        id: 'vault-2',
        name: '학습 패턴',
        category: 'behavioral',
        description: '개인의 학습 방식과 선호도 분석 데이터',
        dataCount: 856,
        cueCount: 334,
        encrypted: true,
        lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 2),
        accessLevel: 'selective',
        value: 7.2,
        usageCount: 45,
        sourceplatforms: ['Notion', 'Calendar', 'Learning Apps']
      }
    ];

    setActivityFeed(sampleActivity);
    setDataVaults(sampleVaults);
  };

  const setupMobileDetection = () => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  };

  // =============================================================================
  // 🔐 인증 관련 함수들 (기존 GitHub 구조 활용)
  // =============================================================================

  const handleWebAuthnLogin = async () => {
    try {
      setIsLoading(true);
      
      // 기존 WebAuthn 시스템 활용
      const result = await performRegistration(user?.email || 'demo@fusion-ai.com');
      
      if (result.success) {
        addActivityItem({
          type: 'auth',
          title: 'WebAuthn 인증 성공',
          description: '생체인증이 성공적으로 완료되었습니다',
          status: 'success'
        });
      }
      
    } catch (error) {
      console.error('WebAuthn 로그인 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // =============================================================================
  // 🤖 AI 채팅 기능 (기존 AI 서비스 활용)
  // =============================================================================

  const handleSendMessage = async () => {
    if (!message.trim() || isTyping) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: message,
      type: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setMessage('');
    setIsTyping(true);

    try {
      // 기존 AI 서비스 활용
      const aiService = getAIServiceManager();
      const response = await aiService.generateResponse(message, {
        personality: user?.preferences.aiPersonality || 'friendly',
        responseStyle: user?.preferences.responseStyle || 'detailed'
      });

      // CUE 추출 (기존 시스템 활용)
      const cueExtractor = getCueExtractor();
      const extractedCues = await cueExtractor.extractFromConversation([userMessage]);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response.content,
        type: 'ai',
        timestamp: new Date(),
        aiService: response.service,
        cueExtracted: extractedCues.length,
        tokensEarned: extractedCues.length * 5
      };

      setMessages(prev => [...prev, aiMessage]);
      
      // CUE 토큰 업데이트
      setCueTokenBalance(prev => prev + (extractedCues.length * 5));
      setTotalCuesMined(prev => prev + extractedCues.length);

      // 활동 기록
      addActivityItem({
        type: 'chat',
        title: 'AI 대화 완료',
        description: `${extractedCues.length}개 CUE 추출, ${extractedCues.length * 5} 토큰 획득`,
        status: 'success'
      });

    } catch (error) {
      console.error('AI 응답 생성 실패:', error);
    } finally {
      setIsTyping(false);
    }
  };

  // =============================================================================
  // 🎯 CUE 추출 기능 (기존 시스템 활용)
  // =============================================================================

  const handleCueExtraction = async () => {
    try {
      setIsLoading(true);
      
      // 기존 CUE 추출 시스템 활용
      const cueExtractor = getCueExtractor();
      const extractedCues = await cueExtractor.extractFromCurrentContext();
      
      setCueTokenBalance(prev => prev + (extractedCues.length * 3));
      setTotalCuesMined(prev => prev + extractedCues.length);

      addActivityItem({
        type: 'cue',
        title: 'CUE 수동 추출',
        description: `${extractedCues.length}개의 CUE가 추출되어 ${extractedCues.length * 3} 토큰을 획득했습니다`,
        status: 'success'
      });

    } catch (error) {
      console.error('CUE 추출 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // =============================================================================
  // 🛠️ 유틸리티 함수들
  // =============================================================================

  const addActivityItem = (item: Omit<ActivityItem, 'id' | 'timestamp'>) => {
    const newItem: ActivityItem = {
      ...item,
      id: Date.now().toString(),
      timestamp: new Date()
    };
    
    setActivityFeed(prev => [newItem, ...prev.slice(0, 9)]);
  };

  // =============================================================================
  // 🎨 UI 렌더링
  // =============================================================================

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Fusion AI Dashboard 초기화 중...</p>
        </div>
      </div>
    );
  }

  if (showLogin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Fingerprint className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Fusion AI Dashboard</h1>
            <p className="text-gray-600">생체인증으로 안전하게 로그인하세요</p>
          </div>
          
          <div className="space-y-4">
            <button
              onClick={handleWebAuthnLogin}
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-3 px-4 rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <Fingerprint className="w-5 h-5" />
              <span>WebAuthn으로 로그인</span>
            </button>
            
            <button
              onClick={initializeDashboard}
              className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 transition-all duration-200"
            >
              데모로 시작하기
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* 모바일 헤더 */}
      {isMobile && (
        <div className="lg:hidden bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <button
            onClick={() => setShowMobileSidebar(true)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="font-bold text-lg">Fusion AI</h1>
          <button className="p-2 hover:bg-gray-100 rounded-lg">
            <Bell className="w-6 h-6" />
          </button>
        </div>
      )}

      <div className="flex h-screen overflow-hidden">
        {/* 사이드바 */}
        <aside className={`
          ${isMobile ? 'fixed inset-y-0 left-0 z-50' : 'relative'}
          ${isMobile && !showMobileSidebar ? '-translate-x-full' : 'translate-x-0'}
          w-80 bg-white border-r border-gray-200 flex-shrink-0 transition-transform duration-300 ease-in-out
        `}>
          {/* 사이드바 헤더 */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-xl font-bold text-gray-900">Fusion AI</h1>
              {isMobile && (
                <button
                  onClick={() => setShowMobileSidebar(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
            
            {/* 사용자 프로필 */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-medium text-gray-900">{user?.displayName}</p>
                <p className="text-sm text-gray-500">{user?.subscription} 플랜</p>
              </div>
            </div>
          </div>

          {/* CUE 토큰 정보 */}
          <div className="p-6 border-b border-gray-200">
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">CUE 토큰</span>
                <Zap className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {cueTokenBalance.toLocaleString()}
              </div>
              <div className="text-xs text-gray-500">
                총 {totalCuesMined.toLocaleString()}개 채굴 완료
              </div>
              <button
                onClick={handleCueExtraction}
                className="w-full mt-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-2 px-3 rounded-lg text-sm hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 flex items-center justify-center space-x-1"
              >
                <Plus className="w-4 h-4" />
                <span>CUE 추출</span>
              </button>
            </div>
          </div>

          {/* 활동 피드 */}
          <div className="p-6 flex-1 overflow-y-auto">
            <h3 className="font-semibold text-gray-900 mb-4">최근 활동</h3>
            <div className="space-y-3">
              {activityFeed.map(item => (
                <div key={item.id} className="flex items-start space-x-3">
                  <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                    item.status === 'success' ? 'bg-green-500' :
                    item.status === 'warning' ? 'bg-yellow-500' :
                    item.status === 'error' ? 'bg-red-500' : 'bg-blue-500'
                  }`}></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{item.title}</p>
                    <p className="text-xs text-gray-500 mt-1">{item.description}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {item.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* 메인 콘텐츠 */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* 상단 탭 */}
          <div className="bg-white border-b border-gray-200 px-6 py-3">
            <div className="flex space-x-1 overflow-x-auto">
              {[
                { id: 'chat', label: '개인화 AI 채팅', icon: MessageCircle },
                { id: 'agents', label: 'AI 에이전트', icon: Cpu },
                { id: 'dashboard', label: '대시보드', icon: Activity },
                { id: 'passport', label: 'AI Passport', icon: Fingerprint },
                { id: 'vaults', label: '데이터 볼트', icon: Database },
                { id: 'analytics', label: 'CUE 분석', icon: BarChart3 }
              ].map(view => (
                <button
                  key={view.id}
                  onClick={() => setCurrentView(view.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all whitespace-nowrap ${
                    currentView === view.id 
                      ? 'bg-indigo-100 text-indigo-700' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <view.icon className="w-4 h-4" />
                  <span className="text-sm">{view.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 메인 뷰 콘텐츠 */}
          <div className="flex-1 overflow-y-auto p-6">
            {currentView === 'chat' && (
              <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-xl border border-gray-200 h-[600px] flex flex-col">
                  {/* 채팅 헤더 */}
                  <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                        <Brain className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{user?.agentProfile?.name}</h3>
                        <p className="text-sm text-gray-500">개인화된 AI 어시스턴트</p>
                      </div>
                      <div className="ml-auto flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-gray-500">온라인</span>
                      </div>
                    </div>
                  </div>

                  {/* 채팅 메시지 */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.length === 0 ? (
                      <div className="text-center text-gray-500 mt-20">
                        <Brain className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p>개인화된 AI와 대화를 시작해보세요!</p>
                        <p className="text-sm mt-2">모든 대화에서 CUE 토큰을 획득할 수 있습니다.</p>
                      </div>
                    ) : (
                      messages.map(msg => (
                        <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-sm lg:max-w-md px-4 py-2 rounded-lg ${
                            msg.type === 'user' 
                              ? 'bg-indigo-500 text-white' 
                              : 'bg-gray-100 text-gray-900'
                          }`}>
                            <p>{msg.content}</p>
                            {msg.cueExtracted && (
                              <div className="mt-2 text-xs opacity-75">
                                🔍 {msg.cueExtracted}개 CUE 추출 • 💰 {msg.tokensEarned} 토큰 획득
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                    {isTyping && (
                      <div className="flex justify-start">
                        <div className="bg-gray-100 px-4 py-2 rounded-lg">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 채팅 입력 */}
                  <div className="p-4 border-t border-gray-200">
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="메시지를 입력하세요..."
                        className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        disabled={isTyping}
                      />
                      <button
                        onClick={handleSendMessage}
                        disabled={!message.trim() || isTyping}
                        className="bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <Send className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentView === 'vaults' && (
              <div className="max-w-6xl mx-auto">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">데이터 볼트</h2>
                  <p className="text-gray-600">개인화된 AI를 위한 암호화된 데이터 저장소</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {dataVaults.map(vault => (
                    <div key={vault.id} className="bg-white rounded-xl border border-gray-200 p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                            <Database className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{vault.name}</h3>
                            <p className="text-sm text-gray-500 capitalize">{vault.category}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          {vault.encrypted && <Lock className="w-4 h-4 text-green-500" />}
                          <span className={`w-2 h-2 rounded-full ${
                            vault.accessLevel === 'private' ? 'bg-red-500' :
                            vault.accessLevel === 'selective' ? 'bg-yellow-500' : 'bg-green-500'
                          }`}></span>
                        </div>
                      </div>

                      <p className="text-sm text-gray-600 mb-4">{vault.description}</p>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <div className="text-lg font-semibold text-gray-900">{vault.dataCount.toLocaleString()}</div>
                          <div className="text-xs text-gray-500">데이터 포인트</div>
                        </div>
                        <div>
                          <div className="text-lg font-semibold text-indigo-600">{vault.cueCount.toLocaleString()}</div>
                          <div className="text-xs text-gray-500">추출된 CUE</div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">가치 점수: {vault.value}/10</span>
                        <span className="text-gray-500">{vault.usageCount}회 사용</span>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-1">
                        {vault.sourceplatforms.slice(0, 3).map(platform => (
                          <span key={platform} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                            {platform}
                          </span>
                        ))}
                        {vault.sourceplatforms.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                            +{vault.sourceplatforms.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 다른 뷰들은 기본 메시지 표시 */}
            {!['chat', 'vaults'].includes(currentView) && (
              <div className="text-center text-gray-500 mt-20">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Settings className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">{currentView} 뷰</h3>
                <p>이 기능은 곧 출시됩니다!</p>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* 모바일 오버레이 */}
      {isMobile && showMobileSidebar && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setShowMobileSidebar(false)}
        />
      )}
    </div>
  );
}
