import React, { useState, useEffect, useRef } from 'react';
import { 
  Shield, User, Brain, Calendar, Database, 
  Fingerprint, Key, Zap, Heart, Activity,
  CheckCircle, Send, Plus, Settings, 
  Globe, Lock, Smartphone, MessageCircle,
  TrendingUp, Eye, EyeOff, Wallet, ArrowRight,
  QrCode, Download, Upload, RefreshCw, ChevronDown,
  X, AlertCircle, Copy, ExternalLink, Sparkles,
  BarChart3, FileText, Network, Cpu, ChevronRight,
  Menu, Monitor, Layers, Wifi, WifiOff, Server
X, } from 'lucide-react';

// =============================================================================
// 🎯 CUE System 4-Layer Architecture Types (기술백서 기반)
// =============================================================================

// UI Layer Types
interface CueUIState {
  currentView: 'chat' | 'dashboard' | 'cue-manager' | 'platform-sync' | 'analytics' | 'vault-manager';
  activePlatforms: string[];
  syncStatus: 'idle' | 'syncing' | 'error' | 'completed';
  realtimeEvents: CueEvent[];
  activeCueCount: number;
  contextPreservationRate: number;
}

// Core Layer Types - CUE Engine 핵심
interface CueEngine {
  extractCues(content: string, context: ConversationContext): Promise<ExtractedCue[]>;
  processPatterns(cues: ExtractedCue[]): Promise<UserPattern[]>;
  adaptToPersonality(patterns: UserPattern[], personality: PersonalityProfile): Promise<AdaptedResponse>;
  preserveContext(source: string, target: string, cues: ExtractedCue[]): Promise<ContextTransferResult>;
}

interface CueEvent {
  id: string;
  type: 'extraction' | 'sync' | 'application' | 'learning' | 'transfer' | 'vault-update';
  platform: string;
  cueType: CueType;
  confidence: number;
  timestamp: Date;
  metadata?: {
    step?: string;
    message?: string;
    progress?: number;
    transferSuccess?: boolean;
    contextPreserved?: number;
    multilingualData?: MultilingualCueData;
    [key: string]: any; // Allow additional properties like 'encrypted', 'biometric', etc.
  };
}

// Integration Layer Types - 플랫폼 어댑터
interface PlatformAdapter {
  platformId: string;
  name: string;
  icon: string;
  capabilities: PlatformCapability[];
  connectionStatus: 'connected' | 'disconnected' | 'connecting' | 'error' | 'syncing';
  lastSync: Date;
  cueCount: number;
  contextMined: number;
  transferAccuracy: number; // 95% 목표
  syncSpeed: number; // 3초 목표
}

type PlatformCapability = 
  | 'message_reading' 
  | 'context_extraction' 
  | 'pattern_analysis' 
  | 'realtime_sync' 
  | 'webhook_support'
  | 'ai_integration'
  | 'cross_platform_transfer'
  | 'webauthn_integration';

// Data Layer Types - 안전한 데이터 관리
interface CueStorage {
  personalCues: PersonalCue[];
  conversationHistory: ConversationContext[];
  platformData: PlatformData[];
  syncMetadata: SyncMetadata;
  encryptedVaults: SecureVault[];
  webauthnCredentials: WebAuthnCredential[];
}

// 🔐 WebAuthn 통합 타입
interface WebAuthnCredential {
  id: string;
  publicKey: ArrayBuffer;
  algorithm: string;
  createdAt: Date;
  lastUsed: Date;
  deviceInfo: {
    platform: string;
    authenticatorType: 'platform' | 'cross-platform';
    biometricType?: 'touchid' | 'faceid' | 'fingerprint' | 'windows_hello';
  };
}

// 🌍 다국어 CUE 시스템
interface MultilingualCueData {
  language: string;
  culturalContext: string;
  formalityLevel: number; // 0-1
  communicationStyle: 'direct' | 'indirect' | 'context-high' | 'context-low';
  businessCulture: string;
  localizedPatterns: string[];
}

interface ExtractedCue {
  id: string;
  type: CueType;
  category: CueCategory;
  content: string;
  confidence: number;
  source: {
    platform: string;
    messageId?: string;
    timestamp: Date;
    context: string;
    transferChain?: string[]; // 플랫폼 간 전송 경로
  };
  extractionMethod: 'nlp' | 'pattern' | 'hybrid' | 'user_defined' | 'cross_platform_learning';
  multilingual?: MultilingualCueData;
  webauthnSigned?: boolean; // 생체인증으로 서명됨
  transferMetadata?: {
    originalPlatform: string;
    targetPlatforms: string[];
    preservationRate: number;
    transferTime: number;
  };
}

type CueType = 
  | 'preference' 
  | 'context' 
  | 'behavior' 
  | 'goal' 
  | 'expertise' 
  | 'communication_style'
  | 'workflow_pattern'
  | 'learning_style'
  | 'decision_making'
  | 'problem_solving'
  | 'cultural_context'
  | 'platform_preference'
  | 'interaction_pattern';

type CueCategory = 
  | 'technical_skills'
  | 'soft_skills' 
  | 'domain_expertise'
  | 'personality_traits'
  | 'work_preferences'
  | 'communication_patterns'
  | 'learning_behaviors'
  | 'cultural_context'
  | 'platform_behaviors'
  | 'security_preferences';

interface PersonalCue {
  id: string;
  type: CueType;
  category: CueCategory;
  title: string;
  description: string;
  value: any;
  confidence: number;
  priority: number;
  sources: CueSource[];
  lastUsed?: Date;
  usageCount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  metadata: {
    extractionMethod: string;
    platformSources: string[];
    reinforcementCount: number;
    conflictingCues?: string[];
    culturalContext?: string;
    webauthnProtected: boolean;
    transferHistory: TransferRecord[];
  };
}

interface TransferRecord {
  fromPlatform: string;
  toPlatform: string;
  transferTime: Date;
  preservationRate: number;
  success: boolean;
  contextMaintained: boolean;
}

interface CueSource {
  platform: string;
  messageId?: string;
  conversationId?: string;
  timestamp: Date;
  extractionConfidence: number;
  contextRelevance: number;
  transferQuality?: number;
}

// 🧠 개성 프로필 (문화적 컨텍스트 포함)
interface PersonalityProfile {
  mbtiType?: string;
  communicationStyle: {
    formality: 'very_casual' | 'casual' | 'neutral' | 'formal' | 'very_formal';
    responseLength: 'brief' | 'moderate' | 'detailed' | 'comprehensive';
    technicalLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    examplePreference: 'minimal' | 'some' | 'many' | 'comprehensive';
    directness: number; // 0-1
  };
  learningStyle: {
    approach: 'visual' | 'hands_on' | 'theoretical' | 'mixed';
    pace: 'fast' | 'moderate' | 'thorough';
    feedback: 'immediate' | 'periodic' | 'comprehensive';
  };
  workingStyle: {
    timePreference: 'morning' | 'afternoon' | 'evening' | 'flexible';
    collaboration: 'independent' | 'collaborative' | 'mixed';
    decisionMaking: 'quick' | 'analytical' | 'consensus' | 'data_driven';
  };
  culturalContext: {
    language: string;
    region: string;
    businessCulture: string;
    formalityExpectation: number;
    communicationDirectness: number;
    hierarchyRespect: number;
  };
  securityPreferences: {
    biometricAuth: boolean;
    dataEncryption: boolean;
    crossPlatformSync: boolean;
    privacyLevel: 'low' | 'medium' | 'high' | 'maximum';
  };
}

interface ConversationContext {
  id: string;
  platform: string;
  participants: string[];
  topic?: string;
  timeframe: {
    start: Date;
    end?: Date;
  };
  messageCount: number;
  extractedCues: string[];
  sentiment: 'positive' | 'neutral' | 'negative';
  technicalLevel: number;
  formalityLevel: number;
  transferChain?: string[];
  contextPreservationRate?: number;
}

interface UserPattern {
  id: string;
  name: string;
  description: string;
  category: 'communication' | 'learning' | 'work' | 'decision' | 'technical' | 'platform_usage';
  pattern: {
    triggers: string[];
    responses: string[];
    conditions: Record<string, any>;
    transferRules: {
      canTransfer: boolean;
      requiredAdaptation: string[];
      platformSpecific: Record<string, any>;
    };
  };
  confidence: number;
  occurrences: number;
  lastSeen: Date;
  relatedCues: string[];
  crossPlatformValidity: Record<string, number>;
}

// 🔐 보안 볼트 시스템
interface SecureVault {
  id: string;
  name: string;
  type: 'identity' | 'behavioral' | 'professional' | 'social' | 'technical';
  encryptionLevel: 'standard' | 'high' | 'maximum';
  webauthnProtected: boolean;
  data: EncryptedData[];
  accessHistory: VaultAccess[];
  sharingSettings: VaultSharingSettings;
}

interface EncryptedData {
  id: string;
  type: string;
  encryptedContent: string;
  hash: string;
  timestamp: Date;
  source: string;
  webauthnSignature?: string;
}

interface VaultAccess {
  timestamp: Date;
  action: 'read' | 'write' | 'share' | 'transfer';
  platform?: string;
  authenticated: boolean;
  biometricUsed: boolean;
}

interface VaultSharingSettings {
  allowCrossPlatform: boolean;
  allowedPlatforms: string[];
  requireAuthentication: boolean;
  expirationTime?: Date;
}

// 🔄 컨텍스트 전송 결과
interface ContextTransferResult {
  success: boolean;
  preservationRate: number; // 목표: 95%
  transferTime: number; // 목표: &lt;3초
  adaptedCues: ExtractedCue[];
  errors?: string[];
  platformSpecificAdaptations: Record<string, any>;
}

interface AdaptedResponse {
  content: string;
  style: string;
  confidence: number;
  appliedCues: string[];
  platformOptimized: boolean;
  culturallyAdapted: boolean;
}

// =============================================================================
// 🎨 Enhanced CUE System Dashboard Component
// =============================================================================

export default function CueSystemEnhancedDashboard() {
  // 🔐 Core State Management
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [registrationStep, setRegistrationStep] = useState<'webauthn' | 'vault-setup' | 'platform-connect' | 'cue-training' | 'complete'>('webauthn');
  
  // 📱 UI State
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [currentView, setCurrentView] = useState<CueUIState['currentView']>('chat');
  
  // 🔥 Modal States
  const [showCueExtractionModal, setShowCueExtractionModal] = useState(false);
  const [showPlatformSyncModal, setShowPlatformSyncModal] = useState(false);
  const [showCueManagerModal, setShowCueManagerModal] = useState(false);
  const [showVaultManagerModal, setShowVaultManagerModal] = useState(false);
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [showCrossTransferModal, setShowCrossTransferModal] = useState(false);
  
  // 🔄 Process States
  const [isExtracting, setIsExtracting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isTransferring, setIsTransferring] = useState(false);
  const [transferProgress, setTransferProgress] = useState(0);
  const [contextPreservationRate, setContextPreservationRate] = useState(95.3);
  const [avgTransferTime, setAvgTransferTime] = useState(2.8);
  const [realtimeEvents, setRealtimeEvents] = useState<CueEvent[]>([]);
  
  // 💬 Chat State
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  // 📊 References
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // 🔑 Enhanced CUE System Data (기술백서 기준)
  const [cueSystemData] = useState({
    personalCues: [
      {
        id: 'cue-1',
        type: 'communication_style' as CueType,
        category: 'personality_traits' as CueCategory,
        title: '직접적 기술 소통',
        description: '기술적 내용을 직접적이고 간결하게 설명하는 것을 선호',
        value: {
          style: 'direct_technical',
          technicalLevel: 'expert',
          examplePreference: 'code_focused',
          culturalAdaptation: 'korean_business'
        },
        confidence: 0.947,
        priority: 9,
        sources: [
          { platform: 'chatgpt', timestamp: new Date(), extractionConfidence: 0.92, contextRelevance: 0.95, transferQuality: 0.94 },
          { platform: 'claude', timestamp: new Date(), extractionConfidence: 0.89, contextRelevance: 0.91, transferQuality: 0.96 },
          { platform: 'gemini', timestamp: new Date(), extractionConfidence: 0.87, contextRelevance: 0.88, transferQuality: 0.93 }
        ],
        usageCount: 247,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata: {
          extractionMethod: 'hybrid_nlp_pattern',
          platformSources: ['chatgpt', 'claude', 'gemini', 'discord'],
          reinforcementCount: 47,
          culturalContext: 'korean_tech_professional',
          webauthnProtected: true,
          transferHistory: [
            { fromPlatform: 'chatgpt', toPlatform: 'claude', transferTime: new Date(), preservationRate: 0.96, success: true, contextMaintained: true },
            { fromPlatform: 'claude', toPlatform: 'gemini', transferTime: new Date(), preservationRate: 0.94, success: true, contextMaintained: true }
          ]
        }
      },
      {
        id: 'cue-2',
        type: 'learning_style' as CueType,
        category: 'learning_behaviors' as CueCategory,
        title: '시각적 실습 학습',
        description: '개념을 이해할 때 시각적 예시와 실제 코드를 통한 hands-on 방식을 선호',
        value: {
          approach: 'visual_hands_on',
          preferredFormats: ['diagrams', 'code_examples', 'interactive_demos'],
          complexity: 'progressive_scaffolding',
          feedback: 'immediate_with_explanation'
        },
        confidence: 0.924,
        priority: 8,
        sources: [
          { platform: 'chatgpt', timestamp: new Date(), extractionConfidence: 0.91, contextRelevance: 0.94, transferQuality: 0.93 },
          { platform: 'claude', timestamp: new Date(), extractionConfidence: 0.88, contextRelevance: 0.92, transferQuality: 0.95 }
        ],
        usageCount: 189,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata: {
          extractionMethod: 'conversation_pattern_analysis',
          platformSources: ['chatgpt', 'claude'],
          reinforcementCount: 23,
          webauthnProtected: true,
          transferHistory: [
            { fromPlatform: 'chatgpt', toPlatform: 'claude', transferTime: new Date(), preservationRate: 0.95, success: true, contextMaintained: true }
          ]
        }
      },
      {
        id: 'cue-3',
        type: 'expertise' as CueType,
        category: 'technical_skills' as CueCategory,
        title: 'React/TypeScript 전문성',
        description: 'React, TypeScript, Next.js를 활용한 모던 프론트엔드 개발 전문성 및 아키텍처 설계',
        value: {
          domains: ['react', 'typescript', 'nextjs', 'tailwindcss', 'zustand'],
          level: 'expert',
          specialties: ['component_architecture', 'state_management', 'performance_optimization'],
          recentTechnologies: ['app_router', 'server_components', 'tailwind_variants'],
          architecturalPreferences: ['modular_design', 'type_safety', 'scalable_patterns']
        },
        confidence: 0.962,
        priority: 10,
        sources: [
          { platform: 'chatgpt', timestamp: new Date(), extractionConfidence: 0.94, contextRelevance: 0.97, transferQuality: 0.96 },
          { platform: 'claude', timestamp: new Date(), extractionConfidence: 0.92, contextRelevance: 0.95, transferQuality: 0.94 },
          { platform: 'github', timestamp: new Date(), extractionConfidence: 0.96, contextRelevance: 0.98, transferQuality: 0.97 }
        ],
        usageCount: 342,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata: {
          extractionMethod: 'technical_pattern_mining',
          platformSources: ['chatgpt', 'claude', 'github', 'stackoverflow'],
          reinforcementCount: 67,
          webauthnProtected: true,
          transferHistory: [
            { fromPlatform: 'github', toPlatform: 'chatgpt', transferTime: new Date(), preservationRate: 0.97, success: true, contextMaintained: true },
            { fromPlatform: 'chatgpt', toPlatform: 'claude', transferTime: new Date(), preservationRate: 0.95, success: true, contextMaintained: true }
          ]
        }
      }
    ] as PersonalCue[],
    
    platformAdapters: [
      {
        platformId: 'chatgpt',
        name: 'ChatGPT',
        icon: '🤖',
        capabilities: ['message_reading', 'context_extraction', 'ai_integration', 'cross_platform_transfer', 'webauthn_integration'],
        connectionStatus: 'connected' as const,
        lastSync: new Date(),
        cueCount: 156,
        contextMined: 247,
        transferAccuracy: 96.2,
        syncSpeed: 2.1
      },
      {
        platformId: 'claude',
        name: 'Claude',
        icon: '🧠',
        capabilities: ['message_reading', 'context_extraction', 'ai_integration', 'realtime_sync', 'cross_platform_transfer'],
        connectionStatus: 'connected' as const,
        lastSync: new Date(),
        cueCount: 134,
        contextMined: 189,
        transferAccuracy: 95.8,
        syncSpeed: 2.3
      },
      {
        platformId: 'gemini',
        name: 'Gemini',
        icon: '💎',
        capabilities: ['message_reading', 'context_extraction', 'ai_integration', 'cross_platform_transfer'],
        connectionStatus: 'syncing' as const,
        lastSync: new Date(),
        cueCount: 89,
        contextMined: 134,
        transferAccuracy: 94.1,
        syncSpeed: 3.2
      },
      {
        platformId: 'discord',
        name: 'Discord',
        icon: '💬',
        capabilities: ['message_reading', 'webhook_support', 'realtime_sync'],
        connectionStatus: 'connecting' as const,
        lastSync: new Date(),
        cueCount: 0,
        contextMined: 0,
        transferAccuracy: 0,
        syncSpeed: 0
      }
    ] as PlatformAdapter[],
    
    personalityProfile: {
      mbtiType: 'INTJ-A',
      communicationStyle: {
        formality: 'neutral' as const,
        responseLength: 'detailed' as const,
        technicalLevel: 'expert' as const,
        examplePreference: 'comprehensive' as const,
        directness: 0.8
      },
      learningStyle: {
        approach: 'visual' as const,
        pace: 'moderate' as const,
        feedback: 'immediate' as const
      },
      workingStyle: {
        timePreference: 'morning' as const,
        collaboration: 'mixed' as const,
        decisionMaking: 'data_driven' as const
      },
      culturalContext: {
        language: 'korean',
        region: 'east_asia',
        businessCulture: 'formal_respectful_with_technical_directness',
        formalityExpectation: 0.7,
        communicationDirectness: 0.6,
        hierarchyRespect: 0.8
      },
      securityPreferences: {
        biometricAuth: true,
        dataEncryption: true,
        crossPlatformSync: true,
        privacyLevel: 'high' as const
      }
    } as PersonalityProfile,
    
    statistics: {
      totalCues: 379,
      activeCues: 342,
      averageConfidence: 0.944,
      platformsConnected: 3,
      lastExtractionTime: new Date(),
      extractionRate: 47.3, // cues per day
      contextPreservationRate: 95.3, // 목표: 95%+
      avgTransferTime: 2.8, // seconds (목표: &lt;3초)
      webauthnProtected: 98.7, // % of cues protected
      multilingualSupport: ['korean', 'english', 'japanese'],
      totalTransfers: 1247,
      successfulTransfers: 1189,
      transferSuccessRate: 95.3
    }
  });

  // 🎨 Responsive Handler
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setShowMobileSidebar(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 📜 Auto-scroll for messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 🔐 Enhanced Registration Process (WebAuthn 기반)
  const handleCueSystemRegistration = async () => {
    setIsRegistering(true);
    setRegistrationStep('webauthn');
    
    setTimeout(() => setRegistrationStep('vault-setup'), 2500);
    setTimeout(() => setRegistrationStep('platform-connect'), 5000);
    setTimeout(() => setRegistrationStep('cue-training'), 7500);
    setTimeout(() => setRegistrationStep('complete'), 10000);
    setTimeout(() => {
      setIsAuthenticated(true);
      setIsRegistering(false);
      addWelcomeMessage();
    }, 12000);
  };

  const addWelcomeMessage = () => {
    const welcomeMsg = {
      id: Date.now().toString(),
      type: 'ai',
      content: `🎉 **CUE System 4-Layer 통합 완료!**

**🔐 웹오센 보안 계층:**
• Secure Enclave 생체인증: ✅ Touch ID 등록완료
• 하드웨어 보안 모듈: ✅ TPM 2.0 활성화
• 암호화 볼트: ✅ AES-256 + WebAuthn 서명

**🧠 CUE 코어 엔진:**
• 개성 프로필: ${cueSystemData.personalityProfile.mbtiType} + 한국 비즈니스 문화
• 추출된 Cue: ${cueSystemData.statistics.totalCues}개 (${(cueSystemData.statistics.averageConfidence * 100).toFixed(1)}% 신뢰도)
• 맥락 보존율: ${cueSystemData.statistics.contextPreservationRate}% 🎯

**🔌 크로스 플랫폼 통합:**
• 연결된 플랫폼: ${cueSystemData.statistics.platformsConnected}개
• 평균 전송 시간: ${cueSystemData.statistics.avgTransferTime}초 ⚡
• 전송 성공율: ${cueSystemData.statistics.transferSuccessRate}%

**💾 데이터 레이어:**
• 보호된 Cue: ${cueSystemData.statistics.webauthnProtected}%
• 다국어 지원: ${cueSystemData.statistics.multilingualSupport.join(', ')}
• 총 컨텍스트 전송: ${cueSystemData.statistics.totalTransfers.toLocaleString()}회

이제 **95% 맥락 보존 + 3초 실시간 동기화**로 진짜 당신을 아는 AI와 대화하세요! ✨`,
      timestamp: new Date(),
      verification: {
        webauthn: true,
        biometric: true,
        contextPreserved: 95.3,
        transferTime: 2.8,
        appliedCues: cueSystemData.personalCues.slice(0, 3).map(c => c.title)
      }
    };
    setMessages([welcomeMsg]);
  };

  // 🔄 Enhanced Cross-Platform Context Transfer
  const handleCrossTransfer = async () => {
    setShowCrossTransferModal(true);
    setIsTransferring(true);
    setTransferProgress(0);
    
    const transferSteps = [
      { progress: 10, message: '🔍 ChatGPT 컨텍스트 스캔 중...', detail: 'INTJ-A 개성 패턴 감지됨' },
      { progress: 25, message: '🧠 NLP 기반 CUE 추출...', detail: '15개 새로운 패턴 발견' },
      { progress: 40, message: '🔐 WebAuthn 서명 검증 중...', detail: '생체인증으로 데이터 보호' },
      { progress: 55, message: '🔄 Claude 어댑터 최적화...', detail: '컨텍스트 적응 처리 중' },
      { progress: 70, message: '🎯 맥락 보존 알고리즘 실행...', detail: '96.2% 보존율 달성' },
      { progress: 85, message: '⚡ 실시간 동기화 완료...', detail: '2.1초 전송 완료' },
      { progress: 100, message: '✅ 크로스 플랫폼 전송 성공!', detail: '모든 플랫폼 동기화됨' }
    ];
    
    for (let i = 0; i < transferSteps.length; i++) {
      const step = transferSteps[i];
      await new Promise(resolve => setTimeout(resolve, 600 + Math.random() * 400));
      
      setTransferProgress(step.progress);
      
      // Add to realtime events
      const event: CueEvent = {
        id: `transfer-${Date.now()}-${i}`,
        type: 'transfer',
        platform: 'cross_platform',
        cueType: 'context',
        confidence: 0.90 + (i * 0.01),
        timestamp: new Date(),
        metadata: { 
          step: step.message, 
          message: step.detail,
          progress: step.progress,
          transferSuccess: true,
          contextPreserved: 95.3 + (i * 0.1)
        }
      };
      
      setRealtimeEvents(prev => [...prev.slice(-15), event]);
    }
    
    setIsTransferring(false);
    setContextPreservationRate(96.2);
    setAvgTransferTime(2.1);
  };

  // 🔄 Enhanced CUE Extraction with WebAuthn
  const handleCueExtraction = async () => {
    setShowCueExtractionModal(true);
    setIsExtracting(true);
    
    const extractionSteps = [
      { step: '🔐 WebAuthn 생체인증 확인...', type: 'system', data: { biometric: true } },
      { step: '🌐 플랫폼 어댑터 초기화 중...', type: 'adapter_init' },
      { step: '🔍 ChatGPT 대화 심층 스캔...', type: 'chatgpt_scan', data: { messages: 23, patterns: 7 } },
      { step: '🧠 Advanced NLP 패턴 분석...', type: 'nlp_analysis', data: { confidence: 94.7 } },
      { step: '🎯 INTJ-A 개성 매칭 및 문화적 적응...', type: 'personality_match', data: { culturalFit: 96.2 } },
      { step: '🔗 크로스 플랫폼 호환성 검증...', type: 'compatibility_check' },
      { step: '💾 암호화된 CUE 볼트 저장...', type: 'secure_storage', data: { encrypted: true, webauthnSigned: true } },
      { step: '✅ CUE 추출 및 보안 완료!', type: 'extraction_complete', data: { newCues: 15, protected: true } }
    ];
    
    for (let i = 0; i < extractionSteps.length; i++) {
      const step = extractionSteps[i];
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 500));
      
      // Add to realtime events
      const event: CueEvent = {
        id: `extract-${Date.now()}-${i}`,
        type: 'extraction',
        platform: 'chatgpt',
        cueType: 'communication_style',
        confidence: 0.85 + (i * 0.015),
        timestamp: new Date(),
        metadata: { 
          step: step.step, 
          progress: ((i + 1) / extractionSteps.length) * 100,
          ...step.data
        }
      };
      
      setRealtimeEvents(prev => [...prev.slice(-15), event]);
    }
    
    setIsExtracting(false);
  };

  // 💬 Enhanced Message Sending with Context Transfer
  const sendCueEnhancedMessage = async () => {
    if (!newMessage.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      content: newMessage,
      type: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    setIsTyping(true);

    // Enhanced CUE-powered AI response simulation
    setTimeout(() => {
      setIsTyping(false);
      
      const appliedCues = cueSystemData.personalCues.filter(() => Math.random() > 0.3).slice(0, 3);
      
      const aiResponse = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: `🤖 **4-Layer CUE 기반 완전 개인화 응답**

**🔐 WebAuthn 보안 검증:**
• Touch ID 생체인증: ✅ 검증완료
• 하드웨어 보안: ✅ Secure Enclave 활성화
• 암호화 서명: ✅ ed25519 디지털 서명

**🧠 적용된 개성 CUE (신뢰도):**
${appliedCues.map(cue => 
  `• ${cue.title}: ${cue.description.slice(0, 40)}... (${(cue.confidence * 100).toFixed(1)}%)`
).join('\n')}

**🔌 크로스 플랫폼 컨텍스트:**
• 원본 플랫폼: ChatGPT → Claude → Gemini
• 맥락 보존율: ${(95.3 + Math.random() * 2).toFixed(1)}% 🎯
• 전송 시간: ${(2.1 + Math.random() * 0.8).toFixed(1)}초 ⚡
• 문화적 적응: 한국 비즈니스 + 기술 전문성

**💾 데이터 레이어 업데이트:**
• 새로운 패턴 감지: 3개
• CUE 신뢰도 향상: +${(Math.random() * 3 + 1).toFixed(1)}%
• 보안 볼트 업데이트: ✅ WebAuthn 서명
• 개성 모델 정확도: +${(Math.random() * 2 + 0.5).toFixed(1)}%

**🌍 다국어/문화 컨텍스트:**
• 감지된 언어: 한국어 (비즈니스 격식체)
• 문화적 직접성: ${(cueSystemData.personalityProfile.culturalContext.communicationDirectness * 100).toFixed(0)}%
• 기술 전문성 레벨: Expert
• 예시 선호도: 코드 중심 상세 설명

이 답변은 당신의 **완전한 디지털 개성 + 95% 맥락 보존**을 바탕으로 생성되었습니다. 🎯`,
        timestamp: new Date(),
        appliedCues: appliedCues.map(c => c.title),
        contextMetadata: {
          preservationRate: 95.3 + Math.random() * 2,
          transferTime: 2.1 + Math.random() * 0.8,
          webauthnVerified: true,
          biometricAuth: true,
          crossPlatformSync: true,
          culturalAdaptation: 96.2,
          platformSources: ['chatgpt', 'claude', 'gemini']
        }
      };
      
      setMessages(prev => [...prev, aiResponse]);
      
      // Add context application event
      const event: CueEvent = {
        id: `app-${Date.now()}`,
        type: 'application',
        platform: 'chat_interface',
        cueType: 'communication_style',
        confidence: 0.95,
        timestamp: new Date(),
        metadata: { 
          appliedCues: appliedCues.length, 
          responseGenerated: true,
          contextPreserved: 95.3 + Math.random() * 2,
          webauthnVerified: true
        }
      };
      
      setRealtimeEvents(prev => [...prev.slice(-15), event]);
    }, 2000 + Math.random() * 1000);
  };

  // 📱 Mobile Sidebar Toggle
  const toggleMobileSidebar = () => {
    setShowMobileSidebar(!showMobileSidebar);
  };

  // 🎨 Enhanced Components
  const CueRegistrationFlow = () => (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-2xl p-8 text-center border border-gray-100">
          <div className="w-20 h-20 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-3xl flex items-center justify-center mx-auto mb-8">
            {registrationStep === 'webauthn' ? <Fingerprint className="w-10 h-10 text-white" /> :
             registrationStep === 'vault-setup' ? <Lock className="w-10 h-10 text-white" /> :
             registrationStep === 'platform-connect' ? <Network className="w-10 h-10 text-white" /> :
             registrationStep === 'cue-training' ? <Brain className="w-10 h-10 text-white" /> :
             <Sparkles className="w-10 h-10 text-white" />}
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-3">CUE System 4-Layer</h1>
          <p className="text-gray-600 mb-8">95% 맥락 보존 + 3초 실시간 동기화</p>
          
          {/* Progress Steps */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center space-x-2">
              {['webauthn', 'vault-setup', 'platform-connect', 'cue-training', 'complete'].map((step, index) => (
                <div key={step} className="flex items-center">
                  <div className={`w-3 h-3 rounded-full ${
                    registrationStep === step ? 'bg-indigo-500 animate-pulse' :
                    ['webauthn', 'vault-setup', 'platform-connect', 'cue-training', 'complete'].indexOf(registrationStep) > index ? 'bg-green-500' : 'bg-gray-300'
                  }`}></div>
                  {index < 4 && <div className="w-8 h-0.5 bg-gray-300 mx-1"></div>}
                </div>
              ))}
            </div>
          </div>
          
          {registrationStep === 'webauthn' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">1단계: WebAuthn 보안</h2>
              <p className="text-gray-600 mb-8">하드웨어 보안 모듈 + 생체인증</p>
              <div className="bg-blue-50 rounded-2xl p-6 mb-6">
                <div className="flex items-center justify-center space-x-3 mb-4">
                  <Shield className="w-6 h-6 text-blue-600" />
                  <span className="text-sm text-blue-700 font-medium">Secure Enclave 초기화 중...</span>
                </div>
                <p className="text-xs text-blue-600">TPM 2.0 하드웨어 보안 모듈 활성화</p>
              </div>
            </div>
          )}
          
          {registrationStep === 'vault-setup' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">2단계: 암호화 볼트</h2>
              <p className="text-gray-600 mb-8">AES-256 + WebAuthn 서명 볼트</p>
              <div className="bg-purple-50 rounded-2xl p-6 mb-6">
                <div className="flex items-center justify-center space-x-3 mb-4">
                  <Lock className="w-6 h-6 text-purple-600" />
                  <span className="text-sm text-purple-700 font-medium">보안 볼트 생성 중...</span>
                </div>
                <p className="text-xs text-purple-600">개성 데이터 end-to-end 암호화</p>
              </div>
            </div>
          )}
          
          {registrationStep === 'platform-connect' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">3단계: 플랫폼 연동</h2>
              <p className="text-gray-600 mb-8">크로스 플랫폼 어댑터 설정</p>
              <div className="bg-green-50 rounded-2xl p-6 mb-6">
                <div className="flex items-center justify-center space-x-3 mb-4">
                  <Network className="w-6 h-6 text-green-600" />
                  <span className="text-sm text-green-700 font-medium">어댑터 연결 중...</span>
                </div>
                <p className="text-xs text-green-600">ChatGPT, Claude, Gemini 통합</p>
              </div>
            </div>
          )}
          
          {registrationStep === 'cue-training' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">4단계: CUE 학습</h2>
              <p className="text-gray-600 mb-8">개성 패턴 추출 및 학습</p>
              <div className="bg-orange-50 rounded-2xl p-6 mb-6">
                <div className="flex items-center justify-center space-x-3 mb-4">
                  <Brain className="w-6 h-6 text-orange-600" />
                  <span className="text-sm text-orange-700 font-medium">INTJ-A 패턴 학습 중...</span>
                </div>
                <p className="text-xs text-orange-600">문화적 컨텍스트 + 기술 전문성</p>
              </div>
            </div>
          )}
          
          {registrationStep === 'complete' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">5단계: 완료!</h2>
              <p className="text-gray-600 mb-8">4-Layer CUE System 준비완료</p>
              <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-6 mb-6">
                <div className="flex items-center justify-center space-x-3 mb-4">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                  <span className="text-sm text-green-700 font-medium">95% 맥락 보존 + 3초 동기화 달성!</span>
                </div>
                <p className="text-xs text-green-600">진짜 당신을 아는 AI 준비됨</p>
              </div>
            </div>
          )}
          
          {!isRegistering && (
            <button
              onClick={handleCueSystemRegistration}
              className="w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white py-4 px-6 rounded-2xl font-semibold hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 transition-all duration-300 flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <Sparkles className="w-6 h-6" />
              <span>CUE System 시작하기</span>
            </button>
          )}
          
          <div className="mt-8 grid grid-cols-4 gap-4 text-center">
            <div className="text-xs text-gray-500">
              <Shield className="w-6 h-6 mx-auto mb-2 text-indigo-500" />
              <span>WebAuthn<br/>보안</span>
            </div>
            <div className="text-xs text-gray-500">
              <Lock className="w-6 h-6 mx-auto mb-2 text-purple-500" />
              <span>암호화<br/>볼트</span>
            </div>
            <div className="text-xs text-gray-500">
              <Network className="w-6 h-6 mx-auto mb-2 text-green-500" />
              <span>크로스<br/>플랫폼</span>
            </div>
            <div className="text-xs text-gray-500">
              <Brain className="w-6 h-6 mx-auto mb-2 text-pink-500" />
              <span>CUE<br/>엔진</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const CueSystemCard = () => (
    <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-6 text-white relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-5 rounded-full -ml-12 -mb-12"></div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <Brain className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg">CUE System 4-Layer</h3>
              <p className="text-indigo-200 text-sm">95% 맥락 보존 엔진</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{contextPreservationRate.toFixed(1)}%</div>
            <div className="text-indigo-200 text-xs">맥락 보존율</div>
          </div>
        </div>

        <div className="space-y-3 mb-6">
          <div className="text-xs text-indigo-200">개성 프로필 + 문화 컨텍스트</div>
          <div className="font-mono text-sm break-all bg-black bg-opacity-20 rounded-lg p-3 backdrop-blur-sm">
            {cueSystemData.personalityProfile.mbtiType} • {cueSystemData.personalityProfile.culturalContext.language.toUpperCase()}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <button 
            onClick={() => {
              setCurrentView('analytics');
              if (isMobile) setShowMobileSidebar(false);
            }}
            className="text-center hover:bg-white hover:bg-opacity-10 rounded-lg p-3 transition-all"
          >
            <div className="text-xl font-bold">{cueSystemData.statistics.totalCues}</div>
            <div className="text-xs text-indigo-200">CUEs</div>
          </button>
          <button 
            onClick={() => setShowCueManagerModal(true)}
            className="text-center hover:bg-white hover:bg-opacity-10 rounded-lg p-3 transition-all"
          >
            <div className="text-xl font-bold">{avgTransferTime.toFixed(1)}s</div>
            <div className="text-xs text-indigo-200">전송속도</div>
          </button>
          <button 
            onClick={() => setShowPlatformSyncModal(true)}
            className="text-center hover:bg-white hover:bg-opacity-10 rounded-lg p-3 transition-all"
          >
            <div className="text-xl font-bold">{cueSystemData.statistics.platformsConnected}</div>
            <div className="text-xs text-indigo-200">플랫폼</div>
          </button>
        </div>
      </div>
    </div>
  );

  const RealtimeActivityFeed = () => (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold text-gray-900 flex items-center space-x-2">
          <Activity className="w-4 h-4 text-orange-600" />
          <span>실시간 CUE 활동</span>
        </h4>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-xs text-gray-500">실시간</span>
        </div>
      </div>
      
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {realtimeEvents.slice(-12).reverse().map(event => (
          <div key={event.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50">
            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
              event.type === 'extraction' ? 'bg-blue-500' :
              event.type === 'transfer' ? 'bg-purple-500' :
              event.type === 'sync' ? 'bg-green-500' :
              event.type === 'application' ? 'bg-orange-500' :
              event.type === 'vault-update' ? 'bg-indigo-500' :
              'bg-gray-500'
            }`}></div>
            <div className="flex-1 min-w-0">
              <div className="text-sm text-gray-900 truncate">
                {event.metadata?.step || event.metadata?.message || `${event.type} on ${event.platform}`}
              </div>
              <div className="text-xs text-gray-500 flex items-center space-x-2">
                <span>{event.timestamp.toLocaleTimeString()}</span>
                <span>•</span>
                <span>{(event.confidence * 100).toFixed(0)}% 신뢰도</span>
                {event.metadata?.contextPreserved && (
                  <>
                    <span>•</span>
                    <span>{event.metadata.contextPreserved.toFixed(1)}% 맥락보존</span>
                  </>
                )}
              </div>
            </div>
            <div className="text-xs text-gray-400 flex-shrink-0">
              {event.platform}
            </div>
          </div>
        ))}
        
        {realtimeEvents.length === 0 && (
          <div className="text-center text-gray-500 text-sm py-8">
            <Activity className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p>CUE 활동이 여기에 표시됩니다</p>
          </div>
        )}
      </div>
    </div>
  );

  // 🔐 Show registration if not authenticated
  if (!isAuthenticated) {
    return <CueRegistrationFlow />;
  }

  // 🏠 Main CUE System 4-Layer Dashboard
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Enhanced Header with 4-Layer Status */}
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
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-gray-900">CUE System 4-Layer</h1>
              <p className="text-sm text-gray-500">95% 맥락 보존 • {avgTransferTime.toFixed(1)}초 동기화</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 lg:space-x-3">
            <button
              onClick={handleCueExtraction}
              className="px-3 lg:px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg text-sm hover:bg-indigo-100 flex items-center space-x-2"
            >
              <Database className="w-4 h-4" />
              <span className="hidden sm:inline">CUE 추출</span>
            </button>
            
            <button
              onClick={handleCrossTransfer}
              className="px-3 lg:px-4 py-2 bg-purple-50 text-purple-700 rounded-lg text-sm hover:bg-purple-100 flex items-center space-x-2"
            >
              <Network className="w-4 h-4" />
              <span className="hidden sm:inline">크로스 전송</span>
            </button>
            
            <button
              onClick={() => setShowSecurityModal(true)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <Shield className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Enhanced Mobile Sidebar Overlay */}
        {isMobile && showMobileSidebar && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setShowMobileSidebar(false)}
          />
        )}

        {/* Enhanced Sidebar with 4-Layer Info */}
        <aside 
          className={`
            ${isMobile ? 'fixed inset-y-0 left-0 z-50' : 'relative'}
            ${isMobile && !showMobileSidebar ? '-translate-x-full' : 'translate-x-0'}
            w-80 bg-white border-r border-gray-200 p-4 lg:p-6 overflow-y-auto transition-transform duration-300 ease-in-out
          `}
        >
          <div className="space-y-6">
            {/* CUE System Card */}
            <CueSystemCard />
            
            {/* 4-Layer Architecture Status */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                <Layers className="w-4 h-4 text-blue-600" />
                <span>4-Layer 상태</span>
              </h4>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-2 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Monitor className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">UI Layer</span>
                  </div>
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                </div>
                
                <div className="flex items-center justify-between p-2 bg-purple-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Brain className="w-4 h-4 text-purple-600" />
                    <span className="text-sm font-medium text-purple-900">Core Layer</span>
                  </div>
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                </div>
                
                <div className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Network className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-900">Integration</span>
                  </div>
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                </div>
                
                <div className="flex items-center justify-between p-2 bg-indigo-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Database className="w-4 h-4 text-indigo-600" />
                    <span className="text-sm font-medium text-indigo-900">Data Layer</span>
                  </div>
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                </div>
              </div>
            </div>
            
            {/* Performance Metrics */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
                <div className="flex items-center space-x-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800">맥락 보존</span>
                </div>
                <div className="text-2xl font-bold text-green-700">{contextPreservationRate.toFixed(1)}%</div>
                <div className="text-xs text-green-600">목표: 95%+</div>
              </div>
              
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-100">
                <div className="flex items-center space-x-2 mb-2">
                  <Zap className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">전송 속도</span>
                </div>
                <div className="text-2xl font-bold text-blue-700">{avgTransferTime.toFixed(1)}s</div>
                <div className="text-xs text-blue-600">목표: &lt;3초</div>
              </div>
            </div>
            
            {/* WebAuthn Security Status */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                <Shield className="w-4 h-4 text-green-600" />
                <span>WebAuthn 보안</span>
              </h4>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Fingerprint className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-gray-700">생체인증</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-xs text-green-600">활성화</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Lock className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-gray-700">데이터 암호화</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-xs text-green-600">AES-256</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Key className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-gray-700">하드웨어 보안</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-xs text-green-600">TPM 2.0</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="text-sm text-gray-600">보호된 CUE: {cueSystemData.statistics.webauthnProtected}%</div>
              </div>
            </div>
            
            {/* Realtime Activity Feed */}
            <RealtimeActivityFeed />
            
            {/* Platform Status Enhanced */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-900">플랫폼 상태</h4>
                <button 
                  onClick={() => setShowPlatformSyncModal(true)}
                  className="text-xs text-indigo-600 hover:text-indigo-700"
                >
                  관리
                </button>
              </div>
              <div className="space-y-2">
                {cueSystemData.platformAdapters.map(platform => (
                  <div key={platform.platformId} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{platform.icon}</span>
                      <div className={`w-2 h-2 rounded-full ${
                        platform.connectionStatus === 'connected' ? 'bg-green-500' : 
                        platform.connectionStatus === 'syncing' ? 'bg-blue-500 animate-pulse' :
                        platform.connectionStatus === 'connecting' ? 'bg-yellow-500 animate-pulse' :
                        'bg-red-500'
                      }`}></div>
                      <span className="text-sm text-gray-700">{platform.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-500">{platform.cueCount}C</div>
                      <div className="text-xs text-green-600">{platform.transferAccuracy.toFixed(1)}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Enhanced Main Content */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* View Tabs Enhanced */}
          <div className="bg-white border-b border-gray-200 px-6 py-3 flex-shrink-0">
            <div className="flex space-x-1 overflow-x-auto">
              {[
                { id: 'chat', label: 'CUE 채팅', icon: MessageCircle },
                { id: 'cue-manager', label: 'CUE 관리', icon: Database },
                { id: 'platform-sync', label: '크로스 플랫폼', icon: Network },
                { id: 'vault-manager', label: '보안 볼트', icon: Lock },
                { id: 'dashboard', label: '4-Layer 대시보드', icon: Monitor },
                { id: 'analytics', label: 'CUE 분석', icon: BarChart3 }
              ].map(view => (
                <button
                  key={view.id}
                  onClick={() => {
                    setCurrentView(view.id as any);
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

          {/* Enhanced Chat View with Context Transfer */}
          {currentView === 'chat' && (
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center max-w-2xl mx-auto">
                    <div className="w-20 h-20 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-3xl flex items-center justify-center mb-6">
                      <Brain className="w-10 h-10 text-indigo-600" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">CUE 기반 4-Layer AI</h2>
                    <p className="text-gray-600 text-lg mb-8 leading-relaxed">
                      95% 맥락 보존 + 3초 실시간 동기화로 진짜 당신을 아는 AI와 대화하세요. 
                      WebAuthn 생체인증으로 모든 개성 데이터가 안전하게 보호됩니다.
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 w-full max-w-4xl">
                      <div className="p-6 bg-white border border-gray-200 rounded-2xl hover:shadow-lg transition-all">
                        <Shield className="w-12 h-12 text-green-600 mx-auto mb-4" />
                        <h3 className="font-semibold text-gray-900 mb-2">WebAuthn 보안</h3>
                        <p className="text-sm text-gray-600">생체인증 + TPM 2.0 하드웨어 보안</p>
                      </div>
                      
                      <div className="p-6 bg-white border border-gray-200 rounded-2xl hover:shadow-lg transition-all">
                        <Brain className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
                        <h3 className="font-semibold text-gray-900 mb-2">개성 기반 응답</h3>
                        <p className="text-sm text-gray-600">{cueSystemData.personalityProfile.mbtiType} + 문화적 컨텍스트</p>
                      </div>
                      
                      <div className="p-6 bg-white border border-gray-200 rounded-2xl hover:shadow-lg transition-all">
                        <Network className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                        <h3 className="font-semibold text-gray-900 mb-2">크로스 플랫폼</h3>
                        <p className="text-sm text-gray-600">{contextPreservationRate.toFixed(1)}% 맥락 보존</p>
                      </div>
                      
                      <div className="p-6 bg-white border border-gray-200 rounded-2xl hover:shadow-lg transition-all">
                        <Zap className="w-12 h-12 text-orange-600 mx-auto mb-4" />
                        <h3 className="font-semibold text-gray-900 mb-2">실시간 동기화</h3>
                        <p className="text-sm text-gray-600">{avgTransferTime.toFixed(1)}초 전송 속도</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    {messages.map(message => (
                      <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] lg:max-w-[70%] ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
                          {message.type === 'ai' && (
                            <div className="flex items-center space-x-3 mb-3">
                              <div className="w-8 h-8 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full flex items-center justify-center">
                                <Brain className="w-4 h-4 text-indigo-600" />
                              </div>
                              <span className="text-sm font-medium text-gray-700">CUE 4-Layer Agent</span>
                              {message.verification && (
                                <div className="flex items-center space-x-1 bg-green-100 text-green-700 px-2 py-1 rounded-full">
                                  <Shield className="w-3 h-3" />
                                  <span className="text-xs">WebAuthn 검증</span>
                                </div>
                              )}
                            </div>
                          )}
                          
                          <div className={`p-4 lg:p-5 rounded-2xl ${
                            message.type === 'user' 
                              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg' 
                              : 'bg-white border border-gray-200 shadow-sm'
                          }`}>
                            <div className="whitespace-pre-wrap text-sm lg:text-base leading-relaxed">
                              {message.content}
                            </div>
                            
                            {message.appliedCues && (
                              <div className="mt-4 pt-4 border-t border-indigo-200">
                                <div className="text-xs text-indigo-200 mb-2">적용된 CUE:</div>
                                <div className="flex flex-wrap gap-1">
                                  {message.appliedCues.map((cue: string, idx: number) => (
                                    <span key={idx} className="bg-indigo-500 bg-opacity-30 px-2 py-1 rounded text-xs">
                                      {cue}
                                    </span>
                                  ))}
                                </div>
                                {message.contextMetadata && (
                                  <div className="text-xs text-indigo-200 mt-2 space-y-1">
                                    <div>맥락 보존: {message.contextMetadata.preservationRate.toFixed(1)}%</div>
                                    <div>전송 시간: {message.contextMetadata.transferTime.toFixed(1)}초</div>
                                    <div>문화적 적응: {message.contextMetadata.culturalAdaptation.toFixed(1)}%</div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {isTyping && (
                      <div className="flex justify-start">
                        <div className="bg-white border border-gray-200 p-4 lg:p-5 rounded-2xl shadow-sm">
                          <div className="flex items-center space-x-3">
                            <div className="flex space-x-1">
                              <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></div>
                              <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce delay-100"></div>
                              <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce delay-200"></div>
                            </div>
                            <span className="text-sm text-gray-600">4-Layer CUE 분석 중...</span>
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Enhanced Chat Input with Context Status */}
              <div className="border-t border-gray-200 p-4 lg:p-6 bg-white flex-shrink-0">
                <div className="max-w-4xl mx-auto">
                  {/* Context Status Bar */}
                  <div className="mb-4 p-3 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <Shield className="w-4 h-4 text-green-600" />
                          <span className="text-green-700 font-medium">WebAuthn 활성화</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Network className="w-4 h-4 text-blue-600" />
                          <span className="text-blue-700">{cueSystemData.statistics.platformsConnected}개 플랫폼 연결</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-purple-700">
                          {contextPreservationRate.toFixed(1)}% 맥락보존
                        </div>
                        <div className="text-orange-700">
                          {avgTransferTime.toFixed(1)}s 동기화
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-4 items-end">
                    <div className="flex-1">
                      <textarea
                        ref={inputRef}
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            sendCueEnhancedMessage();
                          }
                        }}
                        placeholder="CUE 4-Layer로 95% 맥락 보존된 개인화 AI와 대화하세요..."
                        className="w-full min-h-[52px] max-h-[120px] px-4 lg:px-5 py-3 lg:py-4 bg-gray-50 border-2 border-gray-200 rounded-2xl resize-none focus:outline-none focus:bg-white focus:border-indigo-500 transition-all text-sm lg:text-base"
                        rows={1}
                      />
                    </div>
                    <button
                      onClick={sendCueEnhancedMessage}
                      disabled={!newMessage.trim()}
                      className={`px-6 lg:px-8 py-3 lg:py-4 rounded-2xl font-semibold transition-all flex items-center space-x-2 shadow-lg ${
                        newMessage.trim()
                          ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white hover:shadow-xl transform hover:-translate-y-0.5'
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      <Send className="w-4 h-4 lg:w-5 lg:h-5" />
                      <span className="hidden sm:inline">전송</span>
                    </button>
                  </div>
                  
                  {/* CUE Status Indicator Enhanced */}
                  <div className="mt-3 flex items-center justify-center space-x-6 text-xs text-gray-500">
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>{cueSystemData.statistics.activeCues}개 CUE 활성화</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Brain className="w-3 h-3" />
                      <span>{(cueSystemData.statistics.averageConfidence * 100).toFixed(1)}% 신뢰도</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Shield className="w-3 h-3" />
                      <span>{cueSystemData.statistics.webauthnProtected}% 보호됨</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Zap className="w-3 h-3" />
                      <span>{avgTransferTime.toFixed(1)}초 동기화</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Other Enhanced Views */}
          {currentView === 'dashboard' && (
            <div className="flex-1 overflow-y-auto p-4 lg:p-6">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">CUE System 4-Layer 대시보드</h2>
                    <p className="text-gray-600 mt-2">95% 맥락 보존 + 3초 실시간 동기화 달성</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                      운영 중
                    </div>
                  </div>
                </div>
                
                {/* 4-Layer Architecture Overview */}
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                        <Monitor className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-blue-900">UI Layer</h3>
                        <p className="text-sm text-blue-700">사용자 인터페이스</p>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-blue-700">대시보드:</span>
                        <span className="font-medium text-blue-900">✅ 활성화</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-700">모바일 지원:</span>
                        <span className="font-medium text-blue-900">✅ 반응형</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-700">실시간 UI:</span>
                        <span className="font-medium text-blue-900">✅ WebSocket</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 border border-purple-200">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center">
                        <Brain className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-purple-900">Core Layer</h3>
                        <p className="text-sm text-purple-700">CUE 엔진</p>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-purple-700">추출 엔진:</span>
                        <span className="font-medium text-purple-900">✅ NLP+패턴</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-purple-700">신뢰도:</span>
                        <span className="font-medium text-purple-900">{(cueSystemData.statistics.averageConfidence * 100).toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-purple-700">CUE 수:</span>
                        <span className="font-medium text-purple-900">{cueSystemData.statistics.totalCues}개</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border border-green-200">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center">
                        <Network className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-green-900">Integration</h3>
                        <p className="text-sm text-green-700">플랫폼 연동</p>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-green-700">연결된 플랫폼:</span>
                        <span className="font-medium text-green-900">{cueSystemData.statistics.platformsConnected}개</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-green-700">맥락 보존:</span>
                        <span className="font-medium text-green-900">{contextPreservationRate.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-green-700">전송 속도:</span>
                        <span className="font-medium text-green-900">{avgTransferTime.toFixed(1)}s</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-2xl p-6 border border-indigo-200">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center">
                        <Database className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-indigo-900">Data Layer</h3>
                        <p className="text-sm text-indigo-700">보안 저장소</p>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-indigo-700">WebAuthn:</span>
                        <span className="font-medium text-indigo-900">✅ 활성화</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-indigo-700">암호화:</span>
                        <span className="font-medium text-indigo-900">AES-256</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-indigo-700">보호율:</span>
                        <span className="font-medium text-indigo-900">{cueSystemData.statistics.webauthnProtected}%</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Performance Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white rounded-2xl border border-gray-200 p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">맥락 보존 성능</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">현재 보존율:</span>
                        <span className="text-2xl font-bold text-green-600">{contextPreservationRate.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-4">
                        <div 
                          className="bg-gradient-to-r from-green-500 to-emerald-500 h-4 rounded-full transition-all duration-1000"
                          style={{ width: `${contextPreservationRate}%` }}
                        ></div>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div className="text-center">
                          <div className="font-semibold text-gray-900">95.0%</div>
                          <div className="text-gray-500">목표</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold text-green-600">{contextPreservationRate.toFixed(1)}%</div>
                          <div className="text-gray-500">현재</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold text-blue-600">98.0%</div>
                          <div className="text-gray-500">최대</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-2xl border border-gray-200 p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">전송 속도 성능</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">평균 전송 시간:</span>
                        <span className="text-2xl font-bold text-blue-600">{avgTransferTime.toFixed(1)}s</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-4">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-cyan-500 h-4 rounded-full transition-all duration-1000"
                          style={{ width: `${Math.max(0, 100 - (avgTransferTime / 5 * 100))}%` }}
                        ></div>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div className="text-center">
                          <div className="font-semibold text-gray-900">3.0s</div>
                          <div className="text-gray-500">목표</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold text-blue-600">{avgTransferTime.toFixed(1)}s</div>
                          <div className="text-gray-500">현재</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold text-green-600">1.0s</div>
                          <div className="text-gray-500">최고</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Recent Activity */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">최근 시스템 활동</h3>
                  <div className="space-y-3">
                    {realtimeEvents.slice(-8).reverse().map(event => (
                      <div key={event.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                        <div className={`w-3 h-3 rounded-full ${
                          event.type === 'extraction' ? 'bg-blue-500' :
                          event.type === 'transfer' ? 'bg-purple-500' :
                          event.type === 'sync' ? 'bg-green-500' :
                          event.type === 'application' ? 'bg-orange-500' :
                          'bg-gray-500'
                        }`}></div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">
                            {event.metadata?.step || event.metadata?.message || `${event.type} 이벤트`}
                          </div>
                          <div className="text-sm text-gray-500">
                            {event.timestamp.toLocaleString()} • {event.platform} • {(event.confidence * 100).toFixed(0)}% 신뢰도
                          </div>
                        </div>
                        <div className="text-sm text-gray-400">
                          {event.type}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Enhanced Analytics View */}
          {currentView === 'analytics' && (
            <div className="flex-1 overflow-y-auto p-4 lg:p-6">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">CUE 시스템 분석</h2>
                  <div className="flex items-center space-x-2">
                    <button className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg text-sm hover:bg-indigo-200">
                      데이터 내보내기
                    </button>
                  </div>
                </div>
                
                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white rounded-2xl border border-gray-200 p-6">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                        <TrendingUp className="w-4 h-4 text-green-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900">맥락 보존율</h3>
                    </div>
                    <div className="text-3xl font-bold text-green-600 mb-2">{contextPreservationRate.toFixed(1)}%</div>
                    <div className="text-sm text-gray-500">목표: 95% (달성 ✅)</div>
                  </div>
                  
                  <div className="bg-white rounded-2xl border border-gray-200 p-6">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Zap className="w-4 h-4 text-blue-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900">전송 속도</h3>
                    </div>
                    <div className="text-3xl font-bold text-blue-600 mb-2">{avgTransferTime.toFixed(1)}s</div>
                    <div className="text-sm text-gray-500">목표: &lt;3초 (달성 ✅)</div>
                  </div>
                  
                  <div className="bg-white rounded-2xl border border-gray-200 p-6">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Database className="w-4 h-4 text-purple-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900">CUE 신뢰도</h3>
                    </div>
                    <div className="text-3xl font-bold text-purple-600 mb-2">{(cueSystemData.statistics.averageConfidence * 100).toFixed(1)}%</div>
                    <div className="text-sm text-gray-500">{cueSystemData.statistics.totalCues}개 CUE</div>
                  </div>
                  
                  <div className="bg-white rounded-2xl border border-gray-200 p-6">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                        <Shield className="w-4 h-4 text-orange-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900">보안 보호율</h3>
                    </div>
                    <div className="text-3xl font-bold text-orange-600 mb-2">{cueSystemData.statistics.webauthnProtected}%</div>
                    <div className="text-sm text-gray-500">WebAuthn 보호</div>
                  </div>
                </div>
                
                {/* Transfer Success Analytics */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white rounded-2xl border border-gray-200 p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">플랫폼별 전송 성능</h3>
                    <div className="space-y-4">
                      {cueSystemData.platformAdapters.filter(p => p.connectionStatus === 'connected').map(platform => (
                        <div key={platform.platformId} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center space-x-2">
                              <span className="text-lg">{platform.icon}</span>
                              <span className="font-medium text-gray-900">{platform.name}</span>
                            </div>
                            <span className="text-sm font-medium text-gray-600">{platform.transferAccuracy.toFixed(1)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full"
                              style={{ width: `${platform.transferAccuracy}%` }}
                            ></div>
                          </div>
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>{platform.cueCount} CUEs</span>
                            <span>{platform.syncSpeed.toFixed(1)}초 평균</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-2xl border border-gray-200 p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">CUE 카테고리 분포</h3>
                    <div className="space-y-4">
                      {Object.entries(
                        cueSystemData.personalCues.reduce((acc, cue) => {
                          acc[cue.category] = (acc[cue.category] || 0) + 1;
                          return acc;
                        }, {} as Record<string, number>)
                      ).map(([category, count]) => (
                        <div key={category} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-900 capitalize">{category.replace(/_/g, ' ')}</span>
                            <span className="text-sm font-medium text-gray-600">{count}개</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full"
                              style={{ width: `${(count / cueSystemData.personalCues.length) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Transfer Timeline */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">최근 전송 기록</h3>
                  <div className="space-y-3">
                    {cueSystemData.personalCues.flatMap(cue => 
                      cue.metadata.transferHistory.slice(0, 2)
                    ).slice(0, 10).map((transfer, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${
                            transfer.success ? 'bg-green-500' : 'bg-red-500'
                          }`}></div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {transfer.fromPlatform} → {transfer.toPlatform}
                            </div>
                            <div className="text-sm text-gray-500">
                              {transfer.transferTime.toLocaleString()}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium text-gray-900">
                            {(transfer.preservationRate * 100).toFixed(1)}%
                          </div>
                          <div className="text-sm text-gray-500">보존율</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Enhanced Modals */}
      
      {/* Cross-Platform Transfer Modal */}
      <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 ${
        showCrossTransferModal ? '' : 'hidden'
      }`}>
        <div className="bg-white rounded-2xl p-6 w-full max-w-lg">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">크로스 플랫폼 컨텍스트 전송</h3>
            <button 
              onClick={() => setShowCrossTransferModal(false)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {isTransferring && (
            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-sm">
                <span>컨텍스트 전송 진행률</span>
                <span className="font-semibold">{Math.round(transferProgress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${transferProgress}%` }}
                ></div>
              </div>
              
              <div className="bg-purple-50 rounded-xl p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-purple-700">95% 맥락 보존으로 플랫폼 간 전송 중...</span>
                </div>
              </div>
            </div>
          )}
          
          {!isTransferring && transferProgress === 100 && (
            <div className="bg-green-50 rounded-xl p-4 mb-6">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <div>
                  <h5 className="font-medium text-green-900">크로스 플랫폼 전송 완료!</h5>
                  <p className="text-sm text-green-700">
                    {contextPreservationRate.toFixed(1)}% 맥락 보존 • {avgTransferTime.toFixed(1)}초 전송 완료
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-3 gap-3">
            {cueSystemData.platformAdapters.map(platform => (
              <div key={platform.platformId} className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-lg mb-1">{platform.icon}</div>
                <div className={`w-3 h-3 rounded-full mx-auto mb-2 ${
                  platform.connectionStatus === 'connected' ? 'bg-green-500' :
                  platform.connectionStatus === 'syncing' ? 'bg-blue-500 animate-pulse' :
                  'bg-gray-300'
                }`}></div>
                <div className="text-xs font-medium">{platform.name}</div>
                <div className="text-xs text-gray-500">
                  {platform.transferAccuracy.toFixed(0)}%
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Enhanced CUE Extraction Modal */}
      <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 ${
        showCueExtractionModal ? '' : 'hidden'
      }`}>
        <div className="bg-white rounded-2xl p-6 w-full max-w-lg">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">WebAuthn 보안 CUE 추출</h3>
            <button 
              onClick={() => setShowCueExtractionModal(false)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
            {realtimeEvents.filter(e => e.type === 'extraction').slice(-8).map(event => (
              <div key={event.id} className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50">
                <div className="flex-shrink-0 mt-1">
                  {event.metadata?.encrypted ? (
                    <Shield className="w-5 h-5 text-green-500" />
                  ) : event.metadata?.biometric ? (
                    <Fingerprint className="w-5 h-5 text-blue-500" />
                  ) : (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">
                    {event.metadata?.step || 'CUE 추출 단계'}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {event.timestamp.toLocaleTimeString()} • {(event.confidence * 100).toFixed(0)}% 신뢰도
                  </div>
                  {event.metadata?.data && (
                    <div className="text-xs bg-white rounded mt-2 p-2 border">
                      {JSON.stringify(event.metadata.data, null, 2)}
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {isExtracting && (
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-blue-50">
                <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin flex-shrink-0"></div>
                <span className="text-sm text-blue-700">WebAuthn 보안 CUE 추출 진행 중...</span>
              </div>
            )}
          </div>
          
          {!isExtracting && realtimeEvents.filter(e => e.type === 'extraction').length > 0 && (
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-4">
              <div className="text-sm font-semibold text-green-800 mb-2">✅ 보안 CUE 추출 완료!</div>
              <div className="text-xs text-green-700 space-y-1">
                <div>• 15개 새로운 CUE 추출됨 🧠</div>
                <div>• WebAuthn 서명으로 보호됨 🔐</div>
                <div>• {(cueSystemData.statistics.averageConfidence * 100).toFixed(1)}% 평균 신뢰도 달성 📈</div>
                <div>• 4-Layer 아키텍처 모든 계층 동기화됨 🔄</div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Platform Sync Modal */}
      <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 ${
        showPlatformSyncModal ? '' : 'hidden'
      }`}>
        <div className="bg-white rounded-2xl p-6 w-full max-w-lg">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">플랫폼 동기화 관리</h3>
            <button 
              onClick={() => setShowPlatformSyncModal(false)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="space-y-4">
            {cueSystemData.platformAdapters.map(platform => (
              <div key={platform.platformId} className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">{platform.icon}</div>
                    <div>
                      <h4 className="font-medium text-gray-900">{platform.name}</h4>
                      <p className="text-sm text-gray-500">
                        {platform.connected ? 
                          `${platform.cueCount} CUEs • ${platform.transferAccuracy.toFixed(1)}% 정확도` : 
                          '연결되지 않음'
                        }
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${
                      platform.connectionStatus === 'connected' ? 'bg-green-500' :
                      platform.connectionStatus === 'syncing' ? 'bg-blue-500 animate-pulse' :
                      platform.connectionStatus === 'connecting' ? 'bg-yellow-500 animate-pulse' :
                      'bg-red-500'
                    }`}></div>
                    
                    <button className={`text-sm px-3 py-1 rounded-full ${
                      platform.connectionStatus === 'connected' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                    }`}>
                      {platform.connectionStatus === 'connected' ? '연결됨' : '연결하기'}
                    </button>
                  </div>
                </div>
                
                {platform.connectionStatus === 'connected' && (
                  <div className="grid grid-cols-3 gap-3 text-center text-xs">
                    <div>
                      <div className="font-medium text-gray-900">{platform.cueCount}</div>
                      <div className="text-gray-500">CUEs</div>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{platform.transferAccuracy.toFixed(1)}%</div>
                      <div className="text-gray-500">정확도</div>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{platform.syncSpeed.toFixed(1)}s</div>
                      <div className="text-gray-500">속도</div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">전체 성능:</span>
              <div className="flex space-x-4">
                <span className="text-green-600 font-medium">{contextPreservationRate.toFixed(1)}% 맥락보존</span>
                <span className="text-blue-600 font-medium">{avgTransferTime.toFixed(1)}s 동기화</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );