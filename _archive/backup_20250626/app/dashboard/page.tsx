'use client';

// =============================================================================
// 🎯 Fusion AI Dashboard - 메인 대시보드 페이지
// src/app/dashboard/page.tsx (기존 파일 대체)
// =============================================================================

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  MessageCircle, Database, User, Settings, Send, Fingerprint, CheckCircle, 
  XCircle, AlertCircle, Layers, TrendingUp, Menu, X, Sparkles, Eye, Zap,
  Clock, Shield, Globe, Bot, Brain, Link, Activity, BarChart3, 
  PlusCircle, Search, Filter, ChevronDown, MoreVertical, Star, Heart,
  Lightbulb, Target, Rocket, Coffee, BookOpen, Code, FileText,
  Calendar, Bell, Download, Share, ArrowRight, ChevronRight, Play
} from 'lucide-react';

// =============================================================================
// 📊 타입 정의들
// =============================================================================

interface User {
  id: string;
  email: string;
  displayName: string;
  avatar?: string;
  authMethod: 'google' | 'webauthn' | 'demo';
  subscription: 'free' | 'pro' | 'enterprise';
  agentProfile?: AgentProfile;
}

interface AgentProfile {
  name: string;
  type: string;
  did: string;
  passportNo: string;
  status: 'active' | 'inactive' | 'learning';
  level: number;
  trustScore: number;
  avatar: string;
  skills: AgentSkill[];
  stats: AgentStats;
  recent: ActivityItem[];
  security: SecurityProfile;
}

interface AgentSkill {
  id: string;
  name: string;
  score: number;
  trend: number;
  category: 'AI' | 'Integration' | 'UX' | 'Security' | 'Analytics';
}

interface AgentStats {
  contextScore: number;
  totalConversations: number;
  learnedCues: number;
  platformConnections: number;
  dataOwnershipScore: number;
  crossPlatformSyncs: number;
  weeklyGrowth: number;
}

interface ActivityItem {
  id: string;
  type: 'learning' | 'sync' | 'interaction' | 'achievement';
  title: string;
  description: string;
  timestamp: Date;
}

interface SecurityProfile {
  verified: boolean;
  lastCheck: string;
  certifications: string[];
  securityLevel: 'A' | 'S' | 'SS' | 'SSS';
}

interface Message {
  id: string;
  content: string;
  type: 'user' | 'ai' | 'system';
  timestamp: Date;
  agent?: string;
}

interface SmartSuggestion {
  id: string;
  type: 'question' | 'action' | 'insight';
  text: string;
  confidence: number;
  category: string;
}

interface InsightCard {
  id: string;
  type: 'pattern' | 'prediction' | 'opportunity' | 'achievement';
  title: string;
  description: string;
  actionable: boolean;
}

interface ConnectionStatus {
  service: string;
  connected: boolean;
  lastSync: Date | null;
  dataPoints: number;
  status: 'active' | 'syncing' | 'error';
}

interface KnowledgeNode {
  id: string;
  topic: string;
  mastery: number;
  connections: string[];
  recentActivity: Date;
}

// =============================================================================
// 🎯 메인 대시보드 컴포넌트
// =============================================================================

export default function FusionDashboard() {
  // 상태 관리
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [smartSuggestions, setSmartSuggestions] = useState<SmartSuggestion[]>([]);
  const [insights, setInsights] = useState<InsightCard[]>([]);
  const [connections, setConnections] = useState<ConnectionStatus[]>([]);
  const [knowledgeGraph, setKnowledgeGraph] = useState<KnowledgeNode[]>([]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 초기 데이터 로드
  useEffect(() => {
    loadUserData();
    loadMockData();
  }, []);

  // 메시지 스크롤
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // 사용자 데이터 로드
  const loadUserData = async () => {
    try {
      const response = await fetch('/api/user/profile');
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        // 데모 사용자 데이터
        setUser({
          id: 'demo-user',
          email: 'demo@example.com',
          displayName: 'Demo User',
          authMethod: 'demo',
          subscription: 'pro',
          agentProfile: {
            name: 'Fusion AI Agent',
            type: 'Personal Assistant',
            did: 'did:example:123456789',
            passportNo: 'FA-001',
            status: 'active',
            level: 7,
            trustScore: 94,
            avatar: '/api/placeholder/120/120',
            skills: [
              { id: '1', name: 'Context Analysis', score: 92, trend: 5, category: 'AI' },
              { id: '2', name: 'Platform Integration', score: 88, trend: 3, category: 'Integration' },
              { id: '3', name: 'User Experience', score: 85, trend: 7, category: 'UX' },
              { id: '4', name: 'Security Protocol', score: 96, trend: 2, category: 'Security' },
              { id: '5', name: 'Data Analytics', score: 79, trend: 12, category: 'Analytics' }
            ],
            stats: {
              contextScore: 94,
              totalConversations: 1247,
              learnedCues: 523,
              platformConnections: 8,
              dataOwnershipScore: 98,
              crossPlatformSyncs: 3456,
              weeklyGrowth: 12
            },
            recent: [
              {
                id: '1',
                type: 'learning',
                title: 'New Context Pattern Learned',
                description: 'Mastered React optimization patterns',
                timestamp: new Date(Date.now() - 1000 * 60 * 30)
              },
              {
                id: '2',
                type: 'sync',
                title: 'Platform Sync Completed',
                description: 'ChatGPT → Claude context transfer',
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2)
              }
            ],
            security: {
              verified: true,
              lastCheck: '2분 전',
              certifications: ['WebAuthn Level 3', 'Zero Trust Verified'],
              securityLevel: 'SSS'
            }
          }
        });
      }
    } catch (error) {
      console.error('사용자 데이터 로드 실패:', error);
    }
  };

  // 목 데이터 로드
  const loadMockData = () => {
    setSmartSuggestions([
      {
        id: '1',
        type: 'question',
        text: 'React의 useCallback과 useMemo의 차이점을 설명해줘',
        confidence: 0.95,
        category: 'Development'
      },
      {
        id: '2',
        type: 'action',
        text: 'Claude에서 학습한 TypeScript 패턴을 ChatGPT에 동기화',
        confidence: 0.88,
        category: 'Sync'
      },
      {
        id: '3',
        type: 'insight',
        text: '최근 3일간 AI 최적화 질문이 40% 증가했습니다',
        confidence: 0.92,
        category: 'Analytics'
      }
    ]);

    setInsights([
      {
        id: '1',
        type: 'pattern',
        title: '학습 패턴 발견',
        description: '매주 화요일 오후 2-4시에 가장 활발한 학습 활동을 보입니다.',
        actionable: true
      },
      {
        id: '2',
        type: 'opportunity',
        title: '새로운 스킬 영역',
        description: 'GraphQL과 관련된 질문이 증가하고 있어 학습 기회입니다.',
        actionable: true
      }
    ]);

    setConnections([
      { service: 'ChatGPT', connected: true, lastSync: new Date(), dataPoints: 156, status: 'active' },
      { service: 'Claude', connected: true, lastSync: new Date(Date.now() - 300000), dataPoints: 89, status: 'active' },
      { service: 'GitHub', connected: true, lastSync: new Date(Date.now() - 600000), dataPoints: 234, status: 'syncing' },
      { service: 'Notion', connected: false, lastSync: null, dataPoints: 0, status: 'error' }
    ]);

    setKnowledgeGraph([
      {
        id: '1',
        topic: 'React Optimization',
        mastery: 0.87,
        connections: ['JavaScript', 'Performance', 'Hooks'],
        recentActivity: new Date()
      },
      {
        id: '2',
        topic: 'TypeScript',
        mastery: 0.92,
        connections: ['JavaScript', 'Type Safety', 'Development'],
        recentActivity: new Date(Date.now() - 86400000)
      }
    ]);
  };

  // 메시지 전송
  const sendMessage = useCallback(async () => {
    if (!inputMessage.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      type: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setLoading(true);

    try {
      // AI 응답 시뮬레이션
      setTimeout(() => {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: `이것은 "${inputMessage}"에 대한 AI 응답입니다. 실제 AI 통합이 완료되면 실시간 응답을 제공합니다.`,
          type: 'ai',
          timestamp: new Date(),
          agent: 'Fusion AI'
        };
        setMessages(prev => [...prev, aiMessage]);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('메시지 전송 실패:', error);
      setLoading(false);
    }
  }, [inputMessage, loading]);

  // Enter 키 처리
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // 로딩 상태
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">대시보드를 로드하는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* 사이드바 */}
      <div className={`bg-white shadow-lg transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-16'} flex flex-col`}>
        {/* 사이드바 헤더 */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          {sidebarOpen && (
            <div className="flex items-center space-x-2">
              <Sparkles className="h-6 w-6 text-blue-600" />
              <span className="font-bold text-gray-900">Fusion AI</span>
            </div>
          )}
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1 rounded-lg hover:bg-gray-100"
          >
            <Menu className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        {/* 네비게이션 메뉴 */}
        <nav className="flex-1 p-4 space-y-2">
          {[
            { id: 'overview', label: '개요', icon: BarChart3 },
            { id: 'chat', label: '대화', icon: MessageCircle },
            { id: 'insights', label: '인사이트', icon: Lightbulb },
            { id: 'connections', label: '연결', icon: Link },
            { id: 'knowledge', label: '지식 그래프', icon: Brain },
            { id: 'profile', label: '프로필', icon: User },
            { id: 'settings', label: '설정', icon: Settings }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                activeTab === item.id 
                  ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <item.icon className="h-5 w-5" />
              {sidebarOpen && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* 사이드바 푸터 */}
        {sidebarOpen && user.agentProfile && (
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center space-x-3">
              <img 
                src={user.agentProfile.avatar} 
                alt="Agent" 
                className="h-8 w-8 rounded-full"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user.agentProfile.name}
                </p>
                <p className="text-xs text-gray-500">
                  Level {user.agentProfile.level} • {user.agentProfile.trustScore}% 신뢰도
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 메인 콘텐츠 */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 헤더 */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {activeTab === 'overview' && '개요'}
                {activeTab === 'chat' && '대화'}
                {activeTab === 'insights' && '인사이트'}
                {activeTab === 'connections' && '연결'}
                {activeTab === 'knowledge' && '지식 그래프'}
                {activeTab === 'profile' && '프로필'}
                {activeTab === 'settings' && '설정'}
              </h1>
              <p className="text-gray-600 mt-1">
                AI 컨텍스트 연속성을 통한 차세대 대화 경험
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <Bell className="h-5 w-5" />
              </button>
              <button className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900">
                <User className="h-5 w-5" />
                <span>{user.displayName}</span>
              </button>
            </div>
          </div>
        </header>

        {/* 콘텐츠 영역 */}
        <main className="flex-1 overflow-auto p-6">
          {activeTab === 'overview' && <OverviewTab user={user} />}
          {activeTab === 'chat' && (
            <ChatTab 
              messages={messages}
              inputMessage={inputMessage}
              setInputMessage={setInputMessage}
              sendMessage={sendMessage}
              loading={loading}
              handleKeyPress={handleKeyPress}
              messagesEndRef={messagesEndRef}
              smartSuggestions={smartSuggestions}
            />
          )}
          {activeTab === 'insights' && <InsightsTab insights={insights} />}
          {activeTab === 'connections' && <ConnectionsTab connections={connections} />}
          {activeTab === 'knowledge' && <KnowledgeTab knowledgeGraph={knowledgeGraph} />}
          {activeTab === 'profile' && <ProfileTab user={user} />}
          {activeTab === 'settings' && <SettingsTab />}
        </main>
      </div>
    </div>
  );
}

// =============================================================================
// 🎯 탭 컴포넌트들
// =============================================================================

// 개요 탭
function OverviewTab({ user }: { user: User }) {
  const agentProfile = user.agentProfile;
  
  if (!agentProfile) return <div>에이전트 프로필을 로드할 수 없습니다.</div>;

  return (
    <div className="space-y-6">
      {/* 상태 카드들 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">컨텍스트 점수</p>
              <p className="text-2xl font-bold text-blue-600">{agentProfile.stats.contextScore}%</p>
            </div>
            <Brain className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">총 대화</p>
              <p className="text-2xl font-bold text-green-600">{agentProfile.stats.totalConversations.toLocaleString()}</p>
            </div>
            <MessageCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">학습된 Cue</p>
              <p className="text-2xl font-bold text-purple-600">{agentProfile.stats.learnedCues}</p>
            </div>
            <Zap className="h-8 w-8 text-purple-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">플랫폼 연결</p>
              <p className="text-2xl font-bold text-orange-600">{agentProfile.stats.platformConnections}</p>
            </div>
            <Link className="h-8 w-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* 에이전트 프로필 카드 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">AI 에이전트 프로필</h3>
        <div className="flex items-start space-x-4">
          <img 
            src={agentProfile.avatar} 
            alt="Agent Avatar" 
            className="w-16 h-16 rounded-full"
          />
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <h4 className="text-xl font-bold text-gray-900">{agentProfile.name}</h4>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                agentProfile.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {agentProfile.status}
              </span>
            </div>
            <p className="text-gray-600 mb-2">{agentProfile.type}</p>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">DID:</span> <span className="font-mono">{agentProfile.did}</span>
              </div>
              <div>
                <span className="text-gray-500">여권 번호:</span> <span className="font-mono">{agentProfile.passportNo}</span>
              </div>
              <div>
                <span className="text-gray-500">레벨:</span> <span className="font-semibold">{agentProfile.level}</span>
              </div>
              <div>
                <span className="text-gray-500">신뢰도:</span> <span className="font-semibold">{agentProfile.trustScore}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 스킬 차트 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">스킬 분석</h3>
        <div className="space-y-4">
          {agentProfile.skills.map((skill) => (
            <div key={skill.id} className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-900">{skill.name}</span>
                  <span className="text-sm text-gray-500">{skill.score}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${skill.score}%` }}
                  ></div>
                </div>
              </div>
              <div className="ml-4 text-right">
                <span className={`text-xs font-medium ${
                  skill.trend > 0 ? 'text-green-600' : skill.trend < 0 ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {skill.trend > 0 ? '+' : ''}{skill.trend}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// 대화 탭
function ChatTab({ 
  messages, 
  inputMessage, 
  setInputMessage, 
  sendMessage, 
  loading, 
  handleKeyPress, 
  messagesEndRef,
  smartSuggestions 
}: {
  messages: Message[];
  inputMessage: string;
  setInputMessage: (value: string) => void;
  sendMessage: () => void;
  loading: boolean;
  handleKeyPress: (e: React.KeyboardEvent) => void;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  smartSuggestions: SmartSuggestion[];
}) {
  return (
    <div className="flex space-x-6 h-full">
      {/* 메인 채팅 영역 */}
      <div className="flex-1 flex flex-col bg-white rounded-xl shadow-sm border border-gray-200">
        {/* 채팅 헤더 */}
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">AI 어시스턴트와 대화</h3>
          <p className="text-sm text-gray-600">컨텍스트가 보존되는 지능형 대화</p>
        </div>

        {/* 메시지 영역 */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 mt-8">
              <Bot className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>안녕하세요! 무엇을 도와드릴까요?</p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.type === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p>{message.content}</p>
                  <p className={`text-xs mt-1 ${
                    message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))
          )}
          
          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 text-gray-900 max-w-xs lg:max-w-md px-4 py-2 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                  <span>응답 중...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* 입력 영역 */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex space-x-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="메시지를 입력하세요..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
            />
            <button
              onClick={sendMessage}
              disabled={loading || !inputMessage.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 스마트 제안 사이드바 */}
      <div className="w-80 bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <h3 className="font-semibold text-gray-900 mb-4">스마트 제안</h3>
        <div className="space-y-3">
          {smartSuggestions.map((suggestion) => (
            <div
              key={suggestion.id}
              className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
              onClick={() => setInputMessage(suggestion.text)}
            >
              <div className="flex items-start justify-between mb-2">
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                  suggestion.type === 'question' ? 'bg-blue-100 text-blue-800' :
                  suggestion.type === 'action' ? 'bg-green-100 text-green-800' :
                  'bg-purple-100 text-purple-800'
                }`}>
                  {suggestion.type === 'question' ? '질문' :
                   suggestion.type === 'action' ? '액션' : '인사이트'}
                </span>
                <span className="text-xs text-gray-500">
                  {Math.round(suggestion.confidence * 100)}%
                </span>
              </div>
              <p className="text-sm text-gray-700">{suggestion.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// 인사이트 탭
function InsightsTab({ insights }: { insights: InsightCard[] }) {
  return (
    <div className="space-y-6">
      <div className="grid gap-6">
        {insights.map((insight) => (
          <div key={insight.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-2">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  insight.type === 'pattern' ? 'bg-blue-100 text-blue-800' :
                  insight.type === 'prediction' ? 'bg-purple-100 text-purple-800' :
                  insight.type === 'opportunity' ? 'bg-green-100 text-green-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {insight.type === 'pattern' ? '패턴' :
                   insight.type === 'prediction' ? '예측' :
                   insight.type === 'opportunity' ? '기회' : '성취'}
                </span>
                {insight.actionable && (
                  <span className="text-xs text-orange-600 font-medium">실행 가능</span>
                )}
              </div>
              <MoreVertical className="h-5 w-5 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{insight.title}</h3>
            <p className="text-gray-600 mb-4">{insight.description}</p>
            {insight.actionable && (
              <button className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 text-sm font-medium">
                액션 수행
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// 연결 탭
function ConnectionsTab({ connections }: { connections: ConnectionStatus[] }) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4">
        {connections.map((connection, index) => (
          <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`w-3 h-3 rounded-full ${
                  connection.status === 'active' ? 'bg-green-500' :
                  connection.status === 'syncing' ? 'bg-yellow-500 animate-pulse' :
                  'bg-red-500'
                }`}></div>
                <div>
                  <h3 className="font-semibold text-gray-900">{connection.service}</h3>
                  <p className="text-sm text-gray-600">
                    {connection.connected ? (
                      <>
                        마지막 동기화: {connection.lastSync ? 
                          new Intl.RelativeTimeFormat('ko', { numeric: 'auto' }).format(
                            Math.floor((connection.lastSync.getTime() - Date.now()) / 1000 / 60), 
                            'minute'
                          ) : '없음'
                        }
                      </>
                    ) : (
                      '연결되지 않음'
                    )}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold text-gray-900">{connection.dataPoints}</p>
                <p className="text-sm text-gray-600">데이터 포인트</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// 지식 그래프 탭
function KnowledgeTab({ knowledgeGraph }: { knowledgeGraph: KnowledgeNode[] }) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4">
        {knowledgeGraph.map((node) => (
          <div key={node.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{node.topic}</h3>
              <div className="text-right">
                <p className="text-lg font-bold text-blue-600">{Math.round(node.mastery * 100)}%</p>
                <p className="text-xs text-gray-600">숙련도</p>
              </div>
            </div>
            <div className="mb-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${node.mastery * 100}%` }}
                ></div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {node.connections.map((connection, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs"
                >
                  {connection}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// 프로필 탭
function ProfileTab({ user }: { user: User }) {
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">사용자 프로필</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">이름</label>
            <p className="text-gray-900">{user.displayName}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">이메일</label>
            <p className="text-gray-900">{user.email}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">인증 방법</label>
            <div className="flex items-center space-x-2">
              <span className="text-gray-900">{user.authMethod}</span>
              {user.authMethod === 'webauthn' && (
                <Fingerprint className="h-4 w-4 text-green-600" />
              )}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">구독</label>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              user.subscription === 'enterprise' ? 'bg-purple-100 text-purple-800' :
              user.subscription === 'pro' ? 'bg-blue-100 text-blue-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {user.subscription}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// 설정 탭
function SettingsTab() {
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">시스템 설정</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">알림</p>
              <p className="text-xs text-gray-600">새로운 인사이트 및 제안 알림</p>
            </div>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">
              활성화됨
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">자동 동기화</p>
              <p className="text-xs text-gray-600">플랫폼 간 자동 컨텍스트 동기화</p>
            </div>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">
              활성화됨
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">데이터 보존</p>
              <p className="text-xs text-gray-600">학습 데이터 보존 기간</p>
            </div>
            <select className="border border-gray-300 rounded-lg px-3 py-1 text-sm">
              <option>30일</option>
              <option>90일</option>
              <option>1년</option>
              <option>영구</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
