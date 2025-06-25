'use client';

// =============================================================================
// 🚀 모바일 반응형 Fusion AI Dashboard - WebAuthn 통합
// 파일: src/components/dashboard/FusionDashboard.tsx
// =============================================================================

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { Shield, MessageCircle, Database, Cpu, Wifi, WifiOff, User, Clock, Zap, BarChart3, Settings, Send, Lock, Fingerprint, Eye, Smartphone, CheckCircle, XCircle, AlertCircle, Sparkles, Network, Layers, TrendingUp, Menu, X, ChevronUp, ChevronDown } from 'lucide-react';

// =============================================================================
// 📋 타입 정의
// =============================================================================

interface Message {
  id: string;
  content: string;
  type: 'user' | 'ai';
  timestamp: Date;
  agent?: string;
  confidence?: number;
  personalizedScore?: number;
}

interface AgentStats {
  contextScore: number;
  totalConversations: number;
  learnedCues: number;
  platformConnections: number;
  dataOwnershipScore: number;
  crossPlatformSyncs: number;
}

interface DataConnection {
  service: 'gmail' | 'calendar' | 'drive' | 'slack' | 'notion';
  connected: boolean;
  lastSync: Date | null;
  dataPoints: number;
  status: 'active' | 'syncing' | 'error' | 'disconnected';
}

interface AgentInfo {
  name: string;
  specialization: string;
  responseStyle: string;
  strengths: string[];
  availability: 'online' | 'busy' | 'offline';
}

interface Notification {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message: string;
}

// =============================================================================
// 🚀 메인 대시보드 컴포넌트
// =============================================================================

export default function FusionDashboard() {
  const { user, logout, updateUser } = useAuth();
  
  // 메시지 및 채팅 상태
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [activeAgent, setActiveAgent] = useState<string>('Personal AI Agent');
  
  // UI 상태
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // 모바일 반응형 상태
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [mobileSidebarTab, setMobileSidebarTab] = useState<'stats' | 'agents' | 'data'>('stats');
  
  // 에이전트 통계 (실제로는 API에서 가져와야 함)
  const [agentStats] = useState<AgentStats>({
    contextScore: 9.3,
    totalConversations: 24,
    learnedCues: 28,
    platformConnections: 3,
    dataOwnershipScore: 100,
    crossPlatformSyncs: 147
  });
  
  // 에이전트 정보
  const [agentInfos] = useState<{[key: string]: AgentInfo}>({
    'Personal AI Agent': {
      name: 'Your Personal AI',
      specialization: 'Complete Personalization',
      responseStyle: 'Adaptive to your style',
      strengths: ['Context Memory', 'Cross-Platform', 'Privacy'],
      availability: 'online' as const
    },
    'ChatGPT-4': {
      name: 'ChatGPT-4',
      specialization: 'Code & Development',
      responseStyle: 'Practical & Example-focused',
      strengths: ['Programming', 'Problem Solving', 'Documentation'],
      availability: 'online' as const
    },
    'Claude Sonnet': {
      name: 'Claude Sonnet',
      specialization: 'Analysis & Research',
      responseStyle: 'Detailed & Analytical',
      strengths: ['Deep Analysis', 'Reasoning', 'Writing'],
      availability: 'online' as const
    }
  });
  
  // 데이터 연결 상태
  const [dataConnections, setDataConnections] = useState<DataConnection[]>([
    { service: 'gmail', connected: true, lastSync: new Date(), dataPoints: 1247, status: 'active' },
    { service: 'calendar', connected: true, lastSync: new Date(), dataPoints: 89, status: 'active' },
    { service: 'drive', connected: false, lastSync: null, dataPoints: 0, status: 'disconnected' },
    { service: 'slack', connected: false, lastSync: null, dataPoints: 0, status: 'disconnected' },
    { service: 'notion', connected: false, lastSync: null, dataPoints: 0, status: 'disconnected' }
  ]);

  // =============================================================================
  // 🔄 초기화 및 이펙트
  // =============================================================================

  useEffect(() => {
    const checkMobileDevice = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setShowMobileSidebar(false);
      }
    };
    
    checkMobileDevice();
    window.addEventListener('resize', checkMobileDevice);
    
    // 환영 메시지 생성
    if (user) {
      const welcomeMessage: Message = {
        id: '1',
        content: `🎉 Welcome to your Personal AI Context Dashboard, ${user.displayName}!\n\n🔐 **Agent Identity Verification Complete**\n• DID: ${user.did}\n• Auth Method: ${user.authMethod === 'webauthn' ? '🔐 Biometric Security' : user.authMethod === 'google' ? '🔑 Google OAuth' : '🎭 Demo Mode'}\n• Subscription: ${user.subscription?.toUpperCase()} ${user.subscription === 'enterprise' ? '👑' : user.subscription === 'pro' ? '⭐' : '🆓'}\n\n🎯 **System Status:**\n✅ 4-Layer Architecture: Operational\n✅ Personal AI Agent: Learning Active\n✅ Data Ownership: 100% You\n✅ Platform Freedom: Ready\n\nStart chatting to see your AI Agent in action!`,
        type: 'ai',
        timestamp: new Date(),
        agent: 'Personal AI Agent',
        confidence: 0.95,
        personalizedScore: 0.88
      };
      setMessages([welcomeMessage]);
    }
    
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', checkMobileDevice);
    };
  }, [user]);

  // =============================================================================
  // 🔔 알림 시스템
  // =============================================================================

  const showNotification = (type: 'success' | 'error' | 'info', title: string, message: string) => {
    const notification: Notification = {
      id: Date.now().toString(),
      type,
      title,
      message
    };
    
    setNotifications(prev => [...prev, notification]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
    }, 5000);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error': return <XCircle className="w-5 h-5 text-red-500" />;
      case 'info': return <AlertCircle className="w-5 h-5 text-blue-500" />;
      default: return <AlertCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  // =============================================================================
  // 💬 메시지 처리
  // =============================================================================

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: message,
      type: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setMessage('');
    setIsTyping(true);

    // 모바일에서 메시지 전송 후 사이드바 자동 닫기
    if (isMobile && showMobileSidebar) {
      setShowMobileSidebar(false);
    }

    // AI 응답 시뮬레이션 (실제로는 API 호출)
    setTimeout(() => {
      setIsTyping(false);
      
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: `Based on your question "${userMessage.content}", here's my personalized response:\n\n**Analysis:**\n• This aligns with your expertise in software development\n• Response optimized for your ${user?.authMethod === 'webauthn' ? 'biometric security' : 'authentication'} style\n• Context learning active - improving future responses\n\n**Answer:**\nI've processed your request through the 4-Layer Architecture:\n✅ Presentation: UI updated\n✅ Application: Context applied\n✅ Service: AI model selected\n✅ Data: Learning patterns updated\n\nYour AI Agent is continuously learning from this interaction!\n\n🔐 **Security Note**: ${user?.authMethod === 'webauthn' ? 'Your biometric authentication ensures this conversation is completely private' : 'Your secure authentication protects this conversation'}`,
        type: 'ai',
        timestamp: new Date(),
        agent: activeAgent,
        confidence: 0.92,
        personalizedScore: 0.87
      };

      setMessages(prev => [...prev, aiResponse]);
    }, 1500);
  };

  // =============================================================================
  // 📱 모바일 사이드바 렌더링
  // =============================================================================

  const renderMobileSidebarContent = () => {
    switch (mobileSidebarTab) {
      case 'stats':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900">AI Freedom Stats</h3>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-lg border border-gray-200 p-3 text-center">
                <div className="text-xl font-bold text-blue-600">{agentStats.contextScore}/10</div>
                <div className="text-xs text-gray-600">Context IQ</div>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-3 text-center">
                <div className="text-xl font-bold text-green-600">${(agentStats.totalConversations * 0.5).toFixed(0)}</div>
                <div className="text-xs text-gray-600">Value Saved</div>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-3 text-center">
                <div className="text-xl font-bold text-purple-600">{agentStats.totalConversations}</div>
                <div className="text-xs text-gray-600">Conversations</div>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-3 text-center">
                <div className="text-xl font-bold text-orange-600">{agentStats.crossPlatformSyncs}</div>
                <div className="text-xs text-gray-600">Syncs</div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200 p-4">
              <h4 className="text-sm font-bold text-green-700 mb-2">
                {user?.authMethod === 'webauthn' ? '🔐 Biometric Advantage' : '🔒 Secure AI Advantage'}
              </h4>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">+89%</div>
                <div className="text-xs text-green-700">vs Generic AI</div>
              </div>
            </div>
          </div>
        );
        
      case 'agents':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900">AI Agents</h3>
            
            {Object.entries(agentInfos).map(([key, agent], index) => (
              <div 
                key={index} 
                className={`p-3 rounded-lg border transition-all cursor-pointer ${
                  activeAgent === key 
                    ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200' 
                    : 'bg-white border-gray-200'
                }`}
                onClick={() => setActiveAgent(key)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${
                      agent.availability === 'online' ? 'bg-green-500' : 'bg-gray-400'
                    }`}></div>
                    <span className="text-sm font-semibold text-gray-900">{agent.name}</span>
                  </div>
                  {activeAgent === key && (
                    <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded-full">Active</span>
                  )}
                </div>
                <div className="text-xs text-gray-600 mb-1">{agent.specialization}</div>
                <div className="flex flex-wrap gap-1">
                  {agent.strengths.slice(0, 2).map((strength, idx) => (
                    <span key={idx} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                      {strength}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        );
        
      case 'data':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Data Sources</h3>
            
            {dataConnections.map((connection, index) => (
              <div key={index} className="bg-white rounded-lg border border-gray-200 p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      connection.connected ? 'bg-green-500' : 'bg-gray-300'
                    }`}></div>
                    <div>
                      <div className="text-sm font-medium text-gray-900 capitalize">{connection.service}</div>
                      {connection.connected && (
                        <div className="text-xs text-green-600">{connection.dataPoints} data points</div>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setDataConnections(prev => prev.map(conn => 
                        conn.service === connection.service 
                          ? { 
                              ...conn, 
                              connected: !conn.connected,
                              lastSync: !conn.connected ? new Date() : null,
                              dataPoints: !conn.connected ? Math.floor(Math.random() * 500 + 100) : 0,
                              status: !conn.connected ? 'active' : 'disconnected'
                            }
                          : conn
                      ));
                      showNotification(
                        'success',
                        `${connection.service} ${connection.connected ? 'Disconnected' : 'Connected'}`,
                        connection.connected 
                          ? `${connection.service} data disconnected`
                          : `AI learning from ${connection.service} started`
                      );
                    }}
                    className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                      connection.connected
                        ? 'bg-red-50 text-red-600'
                        : 'bg-blue-50 text-blue-600'
                    }`}
                  >
                    {connection.connected ? 'OFF' : 'ON'}
                  </button>
                </div>
              </div>
            ))}
            
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-3 text-center">
              <div className="text-sm font-bold text-blue-700">
                {dataConnections.filter(c => c.connected).length}/{dataConnections.length} Connected
              </div>
              <div className="text-xs text-blue-600">More connections = Smarter AI</div>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  // =============================================================================
  // 🔄 로딩 화면
  // =============================================================================

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-blue-50 to-indigo-100 text-gray-900">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-6"></div>
            <Sparkles className="w-8 h-8 text-blue-600 absolute top-4 left-1/2 transform -translate-x-1/2" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Fusion AI Dashboard</h1>
          <p className="text-blue-600 font-medium">Initializing 4-Layer Architecture</p>
        </div>
      </div>
    );
  }

  // =============================================================================
  // 🎨 메인 대시보드 UI
  // =============================================================================

  return (
    <div className="font-sans bg-gray-50 text-gray-900 h-screen flex flex-col overflow-hidden">
      {/* 알림 시스템 */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map((notif) => (
          <div key={notif.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-xl max-w-sm">
            <div className="flex items-start space-x-3">
              {getNotificationIcon(notif.type)}
              <div className="flex-1">
                <div className="font-semibold text-gray-900">{notif.title}</div>
                <div className="text-sm text-gray-600 mt-1">{notif.message}</div>
              </div>
              <button onClick={() => removeNotification(notif.id)} className="text-gray-400 hover:text-gray-600">
                <XCircle className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 헤더 */}
      <header className="bg-white/90 backdrop-blur-xl border-b border-gray-200 px-4 md:px-6 py-4 flex-shrink-0">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <Sparkles className="w-6 md:w-8 h-6 md:h-8 text-blue-600" />
              <div>
                <h1 className="text-lg md:text-xl font-bold text-gray-900">Fusion AI Dashboard</h1>
                <p className="text-xs text-gray-600 hidden md:block">
                  {user?.authMethod === 'webauthn' ? '🔐 Biometric Security Active' : '🔒 Secure Authentication Active'}
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 md:space-x-4">
            {/* 모바일 메뉴 버튼 */}
            {isMobile && (
              <button
                onClick={() => setShowMobileSidebar(!showMobileSidebar)}
                className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
              >
                {showMobileSidebar ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            )}
            
            {/* 에이전트 선택기 - 데스크톱 */}
            {!isMobile && (
              <select
                value={activeAgent}
                onChange={(e) => setActiveAgent(e.target.value)}
                className="text-sm bg-blue-50 border border-blue-200 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Personal AI Agent">Personal AI Agent</option>
                <option value="ChatGPT-4">ChatGPT-4</option>
                <option value="Claude Sonnet">Claude Sonnet</option>
              </select>
            )}
            
            {/* 사용자 정보 */}
            <div className="flex items-center space-x-2 px-2 md:px-3 py-2 bg-blue-50 rounded-lg">
              <User className="w-4 h-4" />
              <span className="text-sm font-medium hidden md:inline">{user?.displayName}</span>
              <span className="text-xs bg-blue-600 px-2 py-1 rounded text-white">
                {user?.authMethod === 'webauthn' ? 'BIO' : user?.authMethod === 'google' ? 'OAUTH' : 'DEMO'}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* 채팅 영역 */}
        <main className="flex-1 relative bg-white">
          {/* 메시지 영역 */}
          <div 
            className="absolute inset-0 overflow-y-auto px-4 py-4 space-y-4"
            style={{ 
              bottom: isMobile ? '140px' : '100px',
              scrollbarWidth: 'thin',
              scrollbarColor: '#cbd5e1 transparent'
            }}
          >
            {messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] md:max-w-[75%] ${msg.type === 'user' ? 'order-2' : 'order-1'}`}>
                  {msg.type === 'ai' && msg.agent && (
                    <div className="flex items-center space-x-2 mb-2">
                      <Sparkles className="w-4 h-4 text-blue-600" />
                      <span className="text-xs sm:text-sm font-semibold text-gray-700">{msg.agent}</span>
                      {msg.confidence && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                          {Math.floor(msg.confidence * 100)}% confidence
                        </span>
                      )}
                    </div>
                  )}
                  <div className={`px-4 py-3 rounded-2xl ${
                    msg.type === 'user' 
                      ? 'bg-blue-600 text-white shadow-lg' 
                      : 'bg-gray-50 text-gray-900 border border-gray-200'
                  }`}>
                    <div className="whitespace-pre-wrap text-sm leading-relaxed">
                      {msg.content}
                    </div>
                  </div>
                  <div className={`text-xs text-gray-500 mt-2 ${
                    msg.type === 'user' ? 'text-right' : 'text-left'
                  }`}>
                    {msg.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-blue-50 border border-blue-200 px-4 py-3 rounded-2xl">
                  <div className="flex items-center space-x-3">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-100"></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-200"></div>
                    </div>
                    <span className="text-xs sm:text-sm text-blue-700">Your AI is thinking...</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 입력 영역 */}
          <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 md:p-4">
            {/* 모바일 에이전트 선택기 */}
            {isMobile && (
              <div className="mb-3">
                <select
                  value={activeAgent}
                  onChange={(e) => setActiveAgent(e.target.value)}
                  className="w-full text-sm bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Personal AI Agent">Personal AI Agent</option>
                  <option value="ChatGPT-4">ChatGPT-4</option>
                  <option value="Claude Sonnet">Claude Sonnet</option>
                </select>
              </div>
            )}
            
            <div className="flex space-x-2 items-end">
              <div className="flex-1">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Talk to your Personal AI Agent..."
                  className="w-full min-h-[44px] max-h-[120px] px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white text-sm"
                  rows={1}
                />
              </div>
              <button
                onClick={handleSendMessage}
                disabled={!message.trim()}
                className={`px-4 py-2 rounded-xl font-semibold transition-all duration-200 flex items-center space-x-1 flex-shrink-0 text-sm ${
                  message.trim()
                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">Send</span>
              </button>
            </div>
          </div>
        </main>

        {/* 데스크톱 사이드바 */}
        {!isMobile && (
          <aside className="w-80 bg-gray-50 border-l border-gray-200 flex flex-col">
            <div className="p-6 border-b border-gray-200 bg-white">
              <div className="flex items-center space-x-2 mb-1">
                <Layers className="w-6 h-6 text-blue-600" />
                <h2 className="text-lg font-bold text-gray-900">AI Freedom Dashboard</h2>
              </div>
              <p className="text-sm text-gray-600">
                {user?.authMethod === 'webauthn' ? 'Biometrically secured AI interaction' : 'Secure AI interaction platform'}
              </p>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* 통계 */}
              <div>
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-3">Performance Stats</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white rounded-lg border border-gray-200 p-3 text-center">
                    <div className="text-xl font-bold text-blue-600">{agentStats.contextScore}/10</div>
                    <div className="text-xs text-gray-600">Context IQ</div>
                  </div>
                  <div className="bg-white rounded-lg border border-gray-200 p-3 text-center">
                    <div className="text-xl font-bold text-green-600">{agentStats.totalConversations}</div>
                    <div className="text-xs text-gray-600">Conversations</div>
                  </div>
                  <div className="bg-white rounded-lg border border-gray-200 p-3 text-center">
                    <div className="text-xl font-bold text-purple-600">{agentStats.learnedCues}</div>
                    <div className="text-xs text-gray-600">Learned Cues</div>
                  </div>
                  <div className="bg-white rounded-lg border border-gray-200 p-3 text-center">
                    <div className="text-xl font-bold text-orange-600">{agentStats.crossPlatformSyncs}</div>
                    <div className="text-xs text-gray-600">Platform Syncs</div>
                  </div>
                </div>
              </div>

              {/* 데이터 소스 */}
              <div>
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-3">Data Sources</h3>
                <div className="space-y-2">
                  {dataConnections.map((connection, index) => (
                    <div key={index} className="bg-white rounded-lg border border-gray-200 p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${
                            connection.connected ? 'bg-green-500' : 'bg-gray-300'
                          }`}></div>
                          <span className="text-sm font-medium text-gray-900 capitalize">{connection.service}</span>
                          {connection.connected && (
                            <span className="text-xs text-green-600">+{connection.dataPoints}</span>
                          )}
                        </div>
                        <button
                          onClick={() => {
                            setDataConnections(prev => prev.map(conn => 
                              conn.service === connection.service 
                                ? { 
                                    ...conn, 
                                    connected: !conn.connected,
                                    lastSync: !conn.connected ? new Date() : null,
                                    dataPoints: !conn.connected ? Math.floor(Math.random() * 500 + 100) : 0,
                                    status: !conn.connected ? 'active' : 'disconnected'
                                  }
                                : conn
                            ));
                          }}
                          className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                            connection.connected
                              ? 'bg-red-50 text-red-600 hover:bg-red-100'
                              : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                          }`}
                        >
                          {connection.connected ? 'ON' : 'OFF'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 로그아웃 */}
              <div className="pt-4 border-t border-gray-200">
                <button
                  onClick={logout}
                  className="w-full py-2 px-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-sm font-medium transition-colors"
                >
                  {user?.authMethod === 'webauthn' ? 'Secure Logout' : 'Logout'}
                </button>
              </div>
            </div>
          </aside>
        )}

        {/* 모바일 사이드바 오버레이 */}
        {isMobile && showMobileSidebar && (
          <>
            {/* 백드롭 */}
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={() => setShowMobileSidebar(false)}
            />
            
            {/* 모바일 사이드바 */}
            <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl z-50 max-h-[70vh] flex flex-col">
              {/* 핸들 */}
              <div className="flex justify-center py-2">
                <div className="w-12 h-1 bg-gray-300 rounded-full"></div>
              </div>
              
              {/* 탭 */}
              <div className="flex border-b border-gray-200">
                {[
                  { id: 'stats', label: 'Stats', icon: BarChart3 },
                  { id: 'agents', label: 'Agents', icon: Cpu },
                  { id: 'data', label: 'Data', icon: Database }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setMobileSidebarTab(tab.id as any)}
                    className={`flex-1 py-3 px-4 text-sm font-medium border-b-2 transition-colors flex items-center justify-center space-x-1 ${
                      mobileSidebarTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>
              
              {/* 콘텐츠 */}
              <div className="flex-1 overflow-y-auto p-4">
                {renderMobileSidebarContent()}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}