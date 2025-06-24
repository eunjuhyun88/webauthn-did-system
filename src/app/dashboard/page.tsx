// =============================================================================
// 🚀 Production Fusion AI Dashboard + WebAuthn 완전 통합
// src/app/dashboard/page.tsx (기존 파일 대체)
// =============================================================================

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  MessageCircle, Database, User, Settings, Send, Fingerprint, CheckCircle, 
  XCircle, AlertCircle, Layers, TrendingUp, Menu, X, Sparkles, Eye, Zap,
  Bell, Shield, Mic, Camera, Code, Lightbulb, Award, BookOpen, Brain, 
  Maximize2, Minimize2, Lock, Key, Globe, Clock, Activity, BarChart3,
  Plus, Search, Filter, ArrowRight, ChevronDown, ChevronUp, Network,
  Cpu, Wifi, WifiOff, Heart, MoreHorizontal
} from 'lucide-react';

// WebAuthn + 다국어 시스템 import
import { EnhancedLoginScreen, useEnhancedAuth } from '@/components/auth/EnhancedAuthSystem';
import { detectLanguageFromText, getWebAuthnMessages } from '@/auth/webauthn/multilingual-helper';
import { MultilingualCueExtractor } from '@/lib/cue/MultilingualCueExtractor';
import { SupportedLanguage } from '@/types/multilingual-cue.types';

// =============================================================================
// 🔧 Enhanced Configuration (WebAuthn 통합)
// =============================================================================
const ENHANCED_CONFIG = {
  API: {
    BASE_URL: typeof window !== 'undefined' && window.location.hostname === 'localhost'
      ? 'http://localhost:3000'
      : 'https://api.fusion-ai.com',
    WEBSOCKET_URL: typeof window !== 'undefined' && window.location.hostname === 'localhost'
      ? 'ws://localhost:3000'
      : 'wss://ws.fusion-ai.com',
  },
  WEBAUTHN: {
    RP_NAME: 'Fusion AI Dashboard',
    RP_ID: typeof window !== 'undefined' ? window.location.hostname : 'localhost',
    ORIGIN: typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000',
  },
  MULTILINGUAL: {
    SUPPORTED_LANGUAGES: 100,
    AUTO_DETECT: true,
    CULTURAL_ADAPTATION: true,
  },
  FEATURES: {
    ENABLE_WEBAUTHN: true,
    ENABLE_DID: true,
    ENABLE_MULTILINGUAL: true,
    ENABLE_VOICE: true,
    ENABLE_WEBSOCKET: true,
    ENABLE_ANALYTICS: true,
    ENABLE_OFFLINE: true
  }
};

// =============================================================================
// 📊 Enhanced Type Definitions (WebAuthn + DID 확장)
// =============================================================================

interface EnhancedUser {
  id: string;
  did?: string; // DID (Decentralized Identifier)
  email: string;
  displayName: string;
  authMethod: 'google' | 'webauthn' | 'demo';
  avatar?: string;
  preferences: UserPreferences;
  agentProfile?: AgentProfile;
  subscription?: 'free' | 'pro' | 'enterprise';
  tokens?: {
    accessToken: string;
    refreshToken: string;
    expiresAt: number;
  };
  // 🔐 WebAuthn 관련 필드
  webauthnCredential?: {
    id: string;
    publicKey: string;
    signCount: number;
    createdAt: Date;
  };
  // 🌍 다국어 프로필
  multilingualProfile?: {
    detectedLanguage: SupportedLanguage;
    culturalContext: string;
    preferredFormality: 'formal' | 'casual' | 'professional';
    communicationStyle: string;
  };
  // 🛡️ 보안 레벨
  securityLevel?: 'basic' | 'enhanced' | 'enterprise';
  trustScore?: number;
}

interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: 'ko' | 'en' | 'ja';
  notifications: boolean;
  aiPersonality: 'professional' | 'friendly' | 'technical' | 'creative';
  responseStyle: 'brief' | 'detailed' | 'examples';
  dataRetention: '7days' | '30days' | '1year' | 'forever';
  privacy: {
    shareUsageData: boolean;
    allowPersonalization: boolean;
    storageLocation: 'global' | 'region' | 'local';
  };
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
  skills: AgentSkill[];
  stats: AgentStats;
  recent: ActivityItem[];
  security: SecurityProfile;
  certifications: Certification[];
  learningGoals: LearningGoal[];
}

interface AgentSkill {
  id: string;
  name: string;
  score: number;
  trend: number;
  category: 'AI' | 'Integration' | 'UX' | 'Security' | 'Analytics';
  lastUpdated: Date;
  description: string;
  relatedSkills: string[];
}

interface AgentStats {
  contextScore: number;
  totalConversations: number;
  learnedCues: number;
  platformConnections: number;
  dataOwnershipScore: number;
  crossPlatformSyncs: number;
  weeklyGrowth: number;
  efficiency: number;
  interactions: number;
  successRate: number;
  responseTime: number;
  solved: number;
  uptime: number;
  lastActive: Date;
}

interface SecurityProfile {
  verified: boolean;
  lastCheck: string;
  certifications: string[];
  securityLevel: 'A' | 'S' | 'SS' | 'SSS';
  threatLevel: 'low' | 'medium' | 'high';
  verifications: SecurityVerification[];
  auditLog: AuditEntry[];
  backupStatus: 'current' | 'outdated' | 'failed';
}

interface SecurityVerification {
  name: string;
  status: boolean;
  score: number;
  lastCheck: Date;
  details: string;
}

interface AuditEntry {
  id: string;
  action: string;
  timestamp: Date;
  ip: string;
  userAgent: string;
  status: 'success' | 'failure' | 'warning';
}

interface Message {
  id: string;
  content: string;
  type: 'user' | 'ai' | 'system';
  timestamp: Date;
  agent?: string;
  confidence?: number;
  personalizedScore?: number;
  contextUsed?: string[];
  reasoning?: string;
  citations?: Citation[];
  attachments?: Attachment[];
  reactions?: Reaction[];
  status: 'sending' | 'sent' | 'delivered' | 'error';
  // 🌍 다국어 관련 필드
  detectedLanguage?: SupportedLanguage;
  culturalContext?: string;
  extractedCue?: any;
}

interface Citation {
  source: string;
  url?: string;
  confidence: number;
  type: 'web' | 'document' | 'email' | 'calendar';
}

interface Attachment {
  id: string;
  type: 'image' | 'document' | 'code' | 'audio';
  url: string;
  size: number;
  name: string;
}

interface Reaction {
  emoji: string;
  count: number;
  users: string[];
}

interface SmartSuggestion {
  id: string;
  type: 'question' | 'action' | 'insight' | 'automation';
  text: string;
  confidence: number;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  estimatedTime: string;
  prerequisites?: string[];
}

interface InsightCard {
  id: string;
  type: 'pattern' | 'prediction' | 'opportunity' | 'achievement' | 'warning';
  title: string;
  description: string;
  actionable: boolean;
  confidence: number;
  impact: 'low' | 'medium' | 'high' | 'critical';
  timeframe: string;
  relatedContexts: string[];
  trend: 'improving' | 'declining' | 'stable';
  metrics?: { [key: string]: number };
}

interface KnowledgeNode {
  id: string;
  topic: string;
  mastery: number;
  connections: string[];
  recentActivity: Date;
  suggestedNext: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  timeInvested: number;
  sources: string[];
}

interface ConnectionStatus {
  service: 'gmail' | 'calendar' | 'drive' | 'slack' | 'notion' | 'discord' | 'github' | 'linear' | 'figma';
  connected: boolean;
  lastSync: Date | null;
  dataPoints: number;
  status: 'active' | 'syncing' | 'error' | 'disconnected' | 'rate_limited';
  syncQuality: number;
  insights: string[];
  permissions: string[];
  errorMessage?: string;
  nextSync?: Date;
}

interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'insight' | 'warning';
  title: string;
  message: string;
  actionable?: boolean;
  action?: () => void;
  priority: 'low' | 'medium' | 'high';
  timestamp: Date;
  read: boolean;
  category: string;
}

interface ActivityItem {
  id: string;
  type: 'learning' | 'sync' | 'interaction' | 'achievement';
  title: string;
  description: string;
  timestamp: Date;
  metadata?: { [key: string]: any };
}

interface Certification {
  id: string;
  name: string;
  issuer: string;
  issuedDate: Date;
  expiryDate?: Date;
  status: 'active' | 'expired' | 'revoked';
  credentialUrl?: string;
}

interface LearningGoal {
  id: string;
  title: string;
  description: string;
  targetDate: Date;
  progress: number;
  milestones: Milestone[];
  priority: 'low' | 'medium' | 'high';
}

interface Milestone {
  id: string;
  title: string;
  completed: boolean;
  completedDate?: Date;
}

// =============================================================================
// 🎨 Enhanced Production Fusion AI Dashboard Component
// =============================================================================
export default function EnhancedProductionDashboard() {
  // ============================================================================
  // 🔄 Enhanced State Management (WebAuthn + DID)
  // ============================================================================
  
  // Core State (Enhanced)
  const [user, setUser] = useState<EnhancedUser | null>(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showLogin, setShowLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  
  // Layout State
  const [rightPanelView, setRightPanelView] = useState<'insights' | 'passport' | 'knowledge' | 'connections'>('insights');
  const [showRightPanel, setShowRightPanel] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  
  // Enhanced UX State
  const [smartSuggestions, setSmartSuggestions] = useState<SmartSuggestion[]>([]);
  const [liveInsights, setLiveInsights] = useState<InsightCard[]>([]);
  const [knowledgeGraph, setKnowledgeGraph] = useState<KnowledgeNode[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeAgent, setActiveAgent] = useState<string>('Personal AI Agent');
  
  // 🔐 WebAuthn + 다국어 State
  const [multilingualCueExtractor, setMultilingualCueExtractor] = useState<MultilingualCueExtractor | null>(null);
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>('english');
  const [culturalContext, setCulturalContext] = useState<string>('casual_direct');
  
  // Authentication State
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [showAgentPassport, setShowAgentPassport] = useState(false);
  const [passportView, setPassportView] = useState<'main' | 'skills' | 'activity' | 'security'>('main');
  
  // Multimodal State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [showAdvancedFeatures, setShowAdvancedFeatures] = useState(false);
  
  // WebSocket State
  const [wsStatus, setWsStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');
  const [onlineUsers, setOnlineUsers] = useState(0);
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // ============================================================================
  // 🤖 Enhanced Agent Profile (WebAuthn + DID 통합)
  // ============================================================================
  const [agentProfile] = useState<AgentProfile>({
    name: 'Fusion AI Agent',
    type: 'Universal Personal Assistant with WebAuthn + DID',
    did: 'did:fusion:agent:f47ac10b-58cc-4372-a567-0e02b2c3d479',
    passportNo: 'FUS240125001',
    status: 'active',
    level: 52,
    trustScore: 99,
    avatar: '🤖',
    skills: [
      { 
        id: '1', 
        name: 'WebAuthn Integration', 
        score: 98, 
        trend: 5, 
        category: 'Security',
        lastUpdated: new Date(),
        description: 'Biometric authentication and credential management',
        relatedSkills: ['DID Management', 'PKI', 'Cryptography']
      },
      { 
        id: '2', 
        name: 'Multilingual Processing', 
        score: 96, 
        trend: 8, 
        category: 'AI',
        lastUpdated: new Date(),
        description: '100+ languages with cultural adaptation',
        relatedSkills: ['Natural Language Processing', 'Cultural Context', 'Translation']
      },
      { 
        id: '3', 
        name: 'Context Learning', 
        score: 97, 
        trend: 3, 
        category: 'AI',
        lastUpdated: new Date(),
        description: 'Advanced contextual understanding and memory with Cue extraction',
        relatedSkills: ['Pattern Recognition', 'Memory Management', 'Semantic Analysis']
      },
      { 
        id: '4', 
        name: 'Multi-Platform Sync', 
        score: 94, 
        trend: 7, 
        category: 'Integration',
        lastUpdated: new Date(),
        description: 'Seamless data integration across platforms',
        relatedSkills: ['API Management', 'Data Processing', 'Real-time Sync']
      },
      { 
        id: '5', 
        name: 'DID Management', 
        score: 95, 
        trend: 6, 
        category: 'Security',
        lastUpdated: new Date(),
        description: 'Decentralized identity and privacy protection',
        relatedSkills: ['Blockchain', 'Privacy', 'Identity Verification']
      }
    ],
    stats: {
      contextScore: 9.8,
      totalConversations: 1347,
      learnedCues: 127,
      platformConnections: 8,
      dataOwnershipScore: 100,
      crossPlatformSyncs: 3247,
      weeklyGrowth: 32,
      efficiency: 98,
      interactions: 28194,
      successRate: 97.2,
      responseTime: 0.7,
      solved: 9847,
      uptime: 99.9,
      lastActive: new Date()
    },
    recent: [
      {
        id: '1',
        type: 'learning',
        title: '🔐 WebAuthn biometric authentication integrated',
        description: 'Successfully implemented fingerprint and Face ID support',
        timestamp: new Date(Date.now() - 1000 * 60 * 15),
        metadata: { authMethods: ['fingerprint', 'faceId', 'touchId'], securityLevel: 'enterprise' }
      },
      {
        id: '2',
        type: 'achievement',
        title: '🌍 100-language support activated',
        description: 'Multilingual Cue extraction with cultural adaptation',
        timestamp: new Date(Date.now() - 1000 * 60 * 45),
        metadata: { languages: 100, culturalContexts: 70, accuracy: 96 }
      },
      {
        id: '3',
        type: 'sync',
        title: '🔗 Enhanced platform integrations',
        description: 'Real-time sync with Gmail, Calendar, Drive, GitHub',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
        metadata: { platforms: 4, dataPoints: 3247, syncQuality: 98 }
      }
    ],
    security: {
      verified: true,
      lastCheck: new Date().toISOString(),
      certifications: ['WebAuthn Certified', 'DID Professional', 'Privacy Level SSS', 'Security Certified'],
      securityLevel: 'SSS',
      threatLevel: 'low',
      verifications: [
        { name: 'WebAuthn Integration', status: true, score: 100, lastCheck: new Date(), details: 'Biometric authentication active' },
        { name: 'DID Verification', status: true, score: 99, lastCheck: new Date(), details: 'Decentralized identity verified' },
        { name: 'Identity Verification', status: true, score: 99, lastCheck: new Date(), details: 'Biometric validation passed' },
        { name: 'Behavior Analysis', status: true, score: 97, lastCheck: new Date(), details: 'Normal activity patterns' },
        { name: 'Security Audit', status: true, score: 100, lastCheck: new Date(), details: 'All security checks passed' },
        { name: 'Ethics Compliance', status: true, score: 98, lastCheck: new Date(), details: 'Ethical guidelines followed' },
        { name: 'Data Integrity', status: true, score: 100, lastCheck: new Date(), details: 'Data validation successful' },
        { name: 'Access Control', status: true, score: 99, lastCheck: new Date(), details: 'Proper access permissions' }
      ],
      auditLog: [],
      backupStatus: 'current'
    },
    certifications: [
      {
        id: '1',
        name: 'WebAuthn Security Professional',
        issuer: 'W3C WebAuthn Working Group',
        issuedDate: new Date('2024-01-15'),
        status: 'active',
        credentialUrl: 'https://w3.org/webauthn'
      },
      {
        id: '2',
        name: 'DID Implementation Specialist',
        issuer: 'Decentralized Identity Foundation',
        issuedDate: new Date('2024-02-20'),
        status: 'active',
        credentialUrl: 'https://identity.foundation'
      },
      {
        id: '3',
        name: 'AI Ethics Certification',
        issuer: 'IEEE Standards Association',
        issuedDate: new Date('2024-01-15'),
        status: 'active',
        credentialUrl: 'https://standards.ieee.org/ai-ethics'
      },
      {
        id: '4',
        name: 'Data Privacy Professional',
        issuer: 'International Association of Privacy Professionals',
        issuedDate: new Date('2024-02-20'),
        status: 'active',
        credentialUrl: 'https://iapp.org/certify'
      }
    ],
    learningGoals: [
      {
        id: '1',
        title: 'Advanced Multimodal Understanding',
        description: 'Master image, voice, and document processing with WebAuthn context',
        targetDate: new Date('2024-12-31'),
        progress: 78,
        priority: 'high',
        milestones: [
          { id: '1a', title: 'Image Analysis with Biometric Context', completed: true, completedDate: new Date('2024-03-15') },
          { id: '1b', title: 'Voice Recognition with Cultural Adaptation', completed: true, completedDate: new Date('2024-04-20') },
          { id: '1c', title: 'Document Understanding with DID Authentication', completed: false }
        ]
      }
    ]
  });

  // ============================================================================
  // 🔗 Enhanced Connection State (실제 API 연동 준비)
  // ============================================================================
  const [connections, setConnections] = useState<ConnectionStatus[]>([
    { 
      service: 'gmail', 
      connected: true, 
      lastSync: new Date(), 
      dataPoints: 3247, 
      status: 'active',
      syncQuality: 98,
      insights: ['Email patterns analyzed', 'Communication style learned', 'Priority detection improved', 'DID-based encryption active'],
      permissions: ['read', 'metadata', 'search'],
      nextSync: new Date(Date.now() + 1000 * 60 * 30)
    },
    { 
      service: 'calendar', 
      connected: true, 
      lastSync: new Date(), 
      dataPoints: 567, 
      status: 'active',
      syncQuality: 96,
      insights: ['Meeting patterns recognized', 'Time preference identified', 'Productivity peaks mapped', 'Smart scheduling enabled'],
      permissions: ['read', 'write', 'events'],
      nextSync: new Date(Date.now() + 1000 * 60 * 15)
    },
    { 
      service: 'drive', 
      connected: true, 
      lastSync: new Date(), 
      dataPoints: 1834, 
      status: 'syncing',
      syncQuality: 93,
      insights: ['Document patterns found', 'File organization learned', 'Collaboration insights generated'],
      permissions: ['read', 'metadata'],
      nextSync: new Date(Date.now() + 1000 * 60 * 60)
    },
    { 
      service: 'slack', 
      connected: false, 
      lastSync: null, 
      dataPoints: 0, 
      status: 'disconnected',
      syncQuality: 0,
      insights: [],
      permissions: []
    },
    { 
      service: 'notion', 
      connected: false, 
      lastSync: null, 
      dataPoints: 0, 
      status: 'disconnected',
      syncQuality: 0,
      insights: [],
      permissions: []
    },
    { 
      service: 'github', 
      connected: true, 
      lastSync: new Date(), 
      dataPoints: 1247, 
      status: 'active',
      syncQuality: 91,
      insights: ['Coding patterns analyzed', 'Tech preferences learned', 'Repository insights generated'],
      permissions: ['read', 'repositories'],
      nextSync: new Date(Date.now() + 1000 * 60 * 45)
    },
    { 
      service: 'discord', 
      connected: true, 
      lastSync: new Date(), 
      dataPoints: 892, 
      status: 'active',
      syncQuality: 89,
      insights: ['Community engagement tracked', 'Communication patterns identified'],
      permissions: ['read', 'messages'],
      nextSync: new Date(Date.now() + 1000 * 60 * 20)
    }
  ]);

  // ============================================================================
  // 🚀 Enhanced Effects & Initialization
  // ============================================================================
  useEffect(() => {
    const checkMobileDevice = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) {
        setShowRightPanel(false);
        setRightPanelCollapsed(true);
      } else {
        setShowRightPanel(true);
        setRightPanelCollapsed(false);
      }
    };
    
    checkMobileDevice();
    window.addEventListener('resize', checkMobileDevice);
    
    // 다국어 Cue 추출기 초기화
    if (ENHANCED_CONFIG.FEATURES.ENABLE_MULTILINGUAL) {
      const extractor = new MultilingualCueExtractor();
      setMultilingualCueExtractor(extractor);
      console.log('🌍 다국어 Cue 추출기 초기화 완료');
    }
    
    // Initialize data
    generateSmartSuggestions();
    generateLiveInsights();
    generateKnowledgeGraph();
    
    // Initialize WebSocket connection
    if (ENHANCED_CONFIG.FEATURES.ENABLE_WEBSOCKET) {
      initializeWebSocket();
    }
    
    const timer = setTimeout(() => setIsLoading(false), 1200);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', checkMobileDevice);
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  // Auto-scroll to bottom when new message is added
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // ============================================================================
  // 🌐 Enhanced WebSocket Implementation
  // ============================================================================
  const initializeWebSocket = useCallback(() => {
    if (!ENHANCED_CONFIG.FEATURES.ENABLE_WEBSOCKET) return;
    
    try {
      setWsStatus('connecting');
      // In demo mode, simulate WebSocket connection
      setTimeout(() => {
        setWsStatus('connected');
        showNotification('success', 'Real-time Connection', 'Live features activated with WebAuthn security', 'system', 'low');
      }, 1000);
    } catch (error) {
      console.error('WebSocket initialization error:', error);
      setWsStatus('disconnected');
    }
  }, []);

  // ============================================================================
  // 🧠 Enhanced Smart AI Functions (다국어 + Cue 통합)
  // ============================================================================
  const generateSmartSuggestions = useCallback(() => {
    const suggestions: SmartSuggestion[] = [
      {
        id: '1',
        type: 'question',
        text: '🌍 Analyze my productivity patterns across different languages',
        confidence: 0.96,
        category: 'multilingual-productivity',
        priority: 'high',
        estimatedTime: '2 min'
      },
      {
        id: '2',
        type: 'insight',
        text: '🔐 Your WebAuthn authentication patterns suggest optimal security times',
        confidence: 0.94,
        category: 'security-analytics',
        priority: 'high',
        estimatedTime: '1 min'
      },
      {
        id: '3',
        type: 'action',
        text: '🧠 Enable DID-based cross-platform context sharing',
        confidence: 0.98,
        category: 'did-integration',
        priority: 'high',
        estimatedTime: '5 min',
        prerequisites: ['DID verification', 'Platform permissions']
      },
      {
        id: '4',
        type: 'automation',
        text: '🎯 Set up automatic cultural adaptation for international teams',
        confidence: 0.92,
        category: 'cultural-automation',
        priority: 'medium',
        estimatedTime: '3 min'
      }
    ];
    
    setSmartSuggestions(suggestions);
  }, []);

  const generateLiveInsights = useCallback(() => {
    const insights: InsightCard[] = [
      {
        id: 'webauthn_1',
        type: 'achievement',
        title: '🔐 WebAuthn Security Level: Enterprise',
        description: 'Your biometric authentication provides 99.8% security confidence with sub-second response time',
        actionable: true,
        confidence: 98,
        impact: 'high',
        timeframe: 'Real-time',
        relatedContexts: ['WebAuthn', 'Biometric Security', 'Enterprise Grade'],
        trend: 'improving',
        metrics: { securityScore: 99.8, responseTime: 0.7, reliabilityScore: 100 }
      },
      {
        id: 'multilingual_1',
        type: 'pattern',
        title: '🌍 Multilingual Communication Excellence',
        description: 'Your messages show 94% cultural adaptation accuracy across 5 detected languages',
        actionable: true,
        confidence: 94,
        impact: 'high',
        timeframe: 'Last 30 days',
        relatedContexts: ['Multilingual', 'Cultural Adaptation', 'Communication'],
        trend: 'improving',
        metrics: { adaptationScore: 94, languagesDetected: 5, culturalAccuracy: 96 }
      },
      {
        id: 'did_1',
        type: 'opportunity',
        title: '🆔 DID Cross-Platform Potential',
        description: 'Your DID can unlock 87% more personalization across connected platforms',
        actionable: true,
        confidence: 87,
        impact: 'high',
        timeframe: 'Available Now',
        relatedContexts: ['DID', 'Cross-Platform', 'Personalization'],
        trend: 'stable',
        metrics: { potentialIncrease: 87, platformsReady: 4, dataIntegration: 92 }
      }
    ];
    
    setLiveInsights(insights);
  }, []);

  const generateKnowledgeGraph = useCallback(() => {
    const nodes: KnowledgeNode[] = [
      {
        id: 'webauthn-security',
        topic: 'WebAuthn & Biometric Security',
        mastery: 92,
        connections: ['cryptography', 'did-management', 'privacy', 'enterprise-security'],
        recentActivity: new Date(),
        suggestedNext: ['Advanced PKI', 'Hardware Security Modules', 'Zero-Knowledge Proofs'],
        difficulty: 'advanced',
        timeInvested: 180,
        sources: ['W3C Specification', 'Implementation Projects', 'Security Audits']
      },
      {
        id: 'multilingual-ai',
        topic: 'Multilingual AI & Cultural Adaptation',
        mastery: 88,
        connections: ['natural-language-processing', 'cultural-context', 'translation', 'cue-extraction'],
        recentActivity: new Date(Date.now() - 86400000),
        suggestedNext: ['Semantic Understanding', 'Cross-Cultural Psychology', 'Language Evolution'],
        difficulty: 'advanced',
        timeInvested: 240,
        sources: ['Research Papers', 'Cultural Studies', 'Linguistic Databases']
      },
      {
        id: 'did-blockchain',
        topic: 'DID & Decentralized Identity',
        mastery: 86,
        connections: ['blockchain', 'cryptography', 'identity-verification', 'privacy'],
        recentActivity: new Date(Date.now() - 86400000),
        suggestedNext: ['Self-Sovereign Identity', 'Verifiable Credentials', 'Identity Hubs'],
        difficulty: 'advanced',
        timeInvested: 156,
        sources: ['DIF Specifications', 'Implementation Examples', 'Community Standards']
      },
      {
        id: 'cue-extraction',
        topic: 'Context Cue Extraction & Learning',
        mastery: 84,
        connections: ['machine-learning', 'pattern-recognition', 'semantic-analysis', 'personalization'],
        recentActivity: new Date(Date.now() - 86400000 * 2),
        suggestedNext: ['Deep Contextual Understanding', 'Temporal Pattern Analysis', 'Predictive Modeling'],
        difficulty: 'intermediate',
        timeInvested: 198,
        sources: ['ML Research', 'User Behavior Studies', 'Contextual Computing']
      }
    ];
    
    setKnowledgeGraph(nodes);
  }, []);

  // ============================================================================
  // 🔐 Enhanced Authentication System (WebAuthn 통합 완료)
  // ============================================================================
  const handleEnhancedAuthSuccess = async (enhancedUser: EnhancedUser) => {
    console.log('🎉 인증 성공:', enhancedUser);
    
    // 사용자 설정
    setUser(enhancedUser);
    setShowLogin(false);
    
    // 다국어 설정
    if (enhancedUser.multilingualProfile) {
      setCurrentLanguage(enhancedUser.multilingualProfile.detectedLanguage);
      setCulturalContext(enhancedUser.multilingualProfile.culturalContext);
      console.log(`🌍 언어 설정: ${enhancedUser.multilingualProfile.detectedLanguage}, 문화: ${enhancedUser.multilingualProfile.culturalContext}`);
    }
    
    // 환영 메시지 생성 (다국어 지원)
    const welcomeMessage = await createEnhancedWelcomeMessage(enhancedUser);
    setMessages([welcomeMessage]);
    
    // 성공 알림
    const authMethodText = enhancedUser.authMethod === 'webauthn' ? 'Biometric Authentication' : 
                          enhancedUser.authMethod === 'google' ? 'Google OAuth' : 'Demo Mode';
    
    showNotification('success', 'Welcome Back!', 
      `Successfully authenticated with ${authMethodText}${enhancedUser.did ? ' • DID Verified' : ''}`, 'auth', 'high');
  };

  const createEnhancedWelcomeMessage = async (user: EnhancedUser): Promise<Message> => {
    const subscriptionEmoji = user.subscription === 'enterprise' ? '👑' : user.subscription === 'pro' ? '⭐' : '🆓';
    const securityEmoji = user.securityLevel === 'enterprise' ? '🛡️' : user.securityLevel === 'enhanced' ? '🔒' : '🔓';
    
    // 다국어 환영 메시지
    const getLocalizedWelcome = (lang: SupportedLanguage) => {
      const welcomes = {
        korean: `🎉 Fusion AI Dashboard에 오신 것을 환영합니다, ${user.displayName}님!`,
        japanese: `🎉 Fusion AI Dashboardへようこそ, ${user.displayName}さん！`,
        chinese: `🎉 欢迎来到 Fusion AI Dashboard, ${user.displayName}！`,
        spanish: `🎉 ¡Bienvenido a Fusion AI Dashboard, ${user.displayName}!`,
        french: `🎉 Bienvenue sur Fusion AI Dashboard, ${user.displayName}!`,
        german: `🎉 Willkommen im Fusion AI Dashboard, ${user.displayName}!`,
        english: `🎉 Welcome to Fusion AI Dashboard, ${user.displayName}!`
      };
      return welcomes[lang] || welcomes.english;
    };

    const welcomeTitle = getLocalizedWelcome(user.multilingualProfile?.detectedLanguage || 'english');
    
    return {
      id: '1',
      content: `${welcomeTitle}

${subscriptionEmoji} **Subscription**: ${user.subscription?.toUpperCase()}
${securityEmoji} **Security Level**: ${user.securityLevel?.toUpperCase()}${user.trustScore ? ` (${user.trustScore}% Trust)` : ''}
🤖 **Your AI Agent**: ${agentProfile.name} (Level ${agentProfile.level})
🔐 **Authentication**: ${user.authMethod === 'webauthn' ? '🔐 Biometric Security' : user.authMethod === 'google' ? '🔑 Google OAuth' : '🎭 Demo Mode'}
${user.did ? `🆔 **DID**: ${user.did.substring(0, 32)}...` : ''}
${user.multilingualProfile ? `🌍 **Language**: ${user.multilingualProfile.detectedLanguage} (${user.multilingualProfile.culturalContext})` : ''}

✨ **Enhanced Features Activated**:
${user.authMethod === 'webauthn' ? '🔐 Enterprise Biometric Authentication - Military-grade security' : ''}
🧠 Advanced Pattern Recognition - Learns your unique work style
🌍 100+ Language Support - Cultural adaptation enabled
🔮 Predictive Interface - Anticipates your next questions  
🎯 Smart Action Suggestions - Proactive assistance
🕸️ Knowledge Universe - Visualizes your learning journey
🎤 Multimodal Input - Voice, images, documents, code
📱 Real-time Sync - Seamless cross-platform experience
🛡️ Privacy-First - Complete data ownership and control
${user.did ? '🆔 Decentralized Identity - Self-sovereign digital identity' : ''}

🚀 Start exploring the future of AI interaction!`,
      type: 'ai',
      timestamp: new Date(),
      agent: agentProfile.name,
      confidence: 0.98,
      personalizedScore: 0.95,
      contextUsed: ['user_profile', 'authentication', 'subscription', 'system_status', 'multilingual_profile'],
      status: 'delivered',
      reactions: [],
      detectedLanguage: user.multilingualProfile?.detectedLanguage || 'english',
      culturalContext: user.multilingualProfile?.culturalContext || 'casual_direct'
    };
  };

  // ============================================================================
  // 💬 Enhanced Message Handling (다국어 Cue 시스템 통합)
  // ============================================================================
  const handleSendMessage = async () => {
    if (!message.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: message,
      type: 'user',
      timestamp: new Date(),
      status: 'sending',
      reactions: [],
      detectedLanguage: currentLanguage,
      culturalContext: culturalContext
    };

    setMessages(prev => [...prev, userMessage]);
    setMessage('');
    setIsTyping(true);

    // Close mobile sidebar when sending message
    if (isMobile && showMobileSidebar) {
      setShowMobileSidebar(false);
    }

    try {
      // Update message status
      setMessages(prev => prev.map(msg => 
        msg.id === userMessage.id ? { ...msg, status: 'sent' } : msg
      ));

      // 🌍 다국어 Cue 추출 (WebAuthn 사용자만)
      let extractedCue = null;
      if (user?.authMethod === 'webauthn' && multilingualCueExtractor) {
        try {
          const detectedLang = detectLanguageFromText(message);
          console.log(`🔍 메시지 언어 감지: "${message}" → ${detectedLang}`);
          
          extractedCue = await multilingualCueExtractor.extractCue({
            content: message,
            userLanguage: detectedLang,
            culturalContext: user.multilingualProfile?.culturalContext || 'casual_direct',
            conversationHistory: messages.slice(-5).map(m => ({
              role: m.type === 'user' ? 'user' : 'assistant',
              content: m.content,
              timestamp: m.timestamp
            }))
          });
          
          console.log('🧠 Cue 추출 완료:', extractedCue);
          
          // 메시지에 추출된 Cue 정보 추가
          setMessages(prev => prev.map(msg => 
            msg.id === userMessage.id ? { 
              ...msg, 
              extractedCue,
              detectedLanguage: detectedLang,
              culturalContext: extractedCue.culturalContext
            } : msg
          ));
          
        } catch (cueError) {
          console.warn('⚠️ Cue 추출 실패:', cueError);
        }
      }

      // Simulate AI response with enhanced personalization
      setTimeout(() => {
        setIsTyping(false);
        
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          content: generateEnhancedAIResponse(message, activeAgent, user, extractedCue),
          type: 'ai',
          timestamp: new Date(),
          agent: activeAgent,
          confidence: user?.authMethod === 'webauthn' ? 0.97 : 0.91,
          personalizedScore: extractedCue ? 0.96 : 0.88,
          contextUsed: [
            'user_preferences', 
            'message_history', 
            'connected_services', 
            'knowledge_graph',
            ...(user?.authMethod === 'webauthn' ? ['webauthn_context', 'did_identity'] : []),
            ...(extractedCue ? ['multilingual_cue', 'cultural_context'] : [])
          ],
          reasoning: `${activeAgent} specialized response with ${user?.authMethod === 'webauthn' ? 'enterprise ' : ''}personalization${extractedCue ? ' and cultural adaptation' : ''}`,
          status: 'delivered',
          reactions: [],
          detectedLanguage: extractedCue?.detectedLanguage || currentLanguage,
          culturalContext: extractedCue?.culturalContext || culturalContext,
          extractedCue
        };

        setMessages(prev => [...prev, aiResponse]);
        generateSmartSuggestions();
      }, 1500);

    } catch (error) {
      console.error('Failed to send message:', error);
      setIsTyping(false);
      setMessages(prev => prev.map(msg => 
        msg.id === userMessage.id ? { ...msg, status: 'error' } : msg
      ));
      showNotification('error', 'Message Failed', 'Failed to send message. Please try again.', 'chat', 'medium');
    }
  };

  const generateEnhancedAIResponse = (userMessage: string, agent: string, user: EnhancedUser | null, extractedCue: any): string => {
    const connectedServices = connections.filter(c => c.connected).length;
    const confidence = Math.round((0.90 + Math.random() * 0.08) * 100);
    
    // 실제 질문에 대한 답변 생성 (다국어 지원)
    const actualResponse = generateActualAnswer(userMessage, agent, user, extractedCue);
    
    // WebAuthn 사용자에게 추가 정보 제공
    const enhancedInfo = user?.authMethod === 'webauthn' ? `

🔐 **Enterprise Security Context**:
• Biometric verification: ✅ Active
• DID authentication: ${user.did ? '✅ Verified' : '⏳ Pending'}
• Trust score: ${user.trustScore || 99}%
• Data encryption: End-to-end secured` : '';

    // 다국어 Cue 정보 (추출된 경우)
    const cueInfo = extractedCue ? `

🧠 **Multilingual Analysis**:
• Detected language: ${extractedCue.detectedLanguage}
• Cultural context: ${extractedCue.culturalContext}
• Communication style: ${extractedCue.communicationStyle || 'adaptive'}
• Formality level: ${extractedCue.formalityLevel || 'balanced'}` : '';

    return `${actualResponse}${enhancedInfo}${cueInfo}

---

🧠 **AI Context Analysis** (${agent}):
• Connected services: ${connections.filter(c => c.connected).map(c => c.service).join(', ')}
• Knowledge areas: ${knowledgeGraph.length} tracked
• Confidence: ${confidence}%
• Personalization: ${extractedCue ? '96%' : Math.round(Math.random() * 20 + 80) + '%'}${user?.authMethod === 'webauthn' ? ' (Enterprise)' : ''}

💡 **Smart Follow-ups**:
• Would you like me to elaborate on any specific point?
• Should I provide examples or practical applications?
• Can I help you with related topics?${extractedCue ? `
• Would you like responses adapted to ${extractedCue.detectedLanguage} cultural context?` : ''}`;
  };

  const generateActualAnswer = (question: string, agent: string, user: EnhancedUser | null, extractedCue: any): string => {
    const lowerQ = question.toLowerCase();
    
    // 다국어 인사말
    if (lowerQ.includes('hello') || lowerQ.includes('hi') || lowerQ.includes('안녕') || lowerQ.includes('こんにちは') || lowerQ.includes('你好')) {
      const greetings = {
        korean: `안녕하세요! ${agent}입니다. 무엇을 도와드릴까요?`,
        japanese: `こんにちは！${agent}です。何かお手伝いできることはありますか？`,
        chinese: `你好！我是${agent}。有什么可以帮助您的吗？`,
        spanish: `¡Hola! Soy ${agent}. ¿En qué puedo ayudarte?`,
        french: `Bonjour! Je suis ${agent}. Comment puis-je vous aider?`,
        german: `Hallo! Ich bin ${agent}. Wie kann ich Ihnen helfen?`,
        english: `Hello! I'm ${agent}. How can I help you?`
      };
      
      const detectedLang = extractedCue?.detectedLanguage || currentLanguage;
      return greetings[detectedLang] || greetings.english;
    }
    
    if (lowerQ.includes('what') && lowerQ.includes('time')) {
      return `현재 시간은 ${new Date().toLocaleString('ko-KR')}입니다.`;
    }
    
    if (lowerQ.includes('weather') || lowerQ.includes('날씨')) {
      return `죄송합니다. 실시간 날씨 정보를 제공하려면 날씨 API 연동이 필요합니다. 현재는 ${user?.authMethod === 'webauthn' ? 'Enterprise ' : ''}데모 모드로 실행 중입니다.`;
    }
    
    if (lowerQ.includes('how are you') || lowerQ.includes('어떻게') || lowerQ.includes('어때')) {
      const statusInfo = user?.authMethod === 'webauthn' 
        ? `저는 잘 지내고 있습니다! 현재 Level ${agentProfile.level}의 Enterprise AI 에이전트로 ${agentProfile.trustScore}%의 신뢰도를 유지하고 있어요. 생체인증과 DID를 통해 최고 수준의 보안을 제공하고 있습니다.`
        : `저는 잘 지내고 있습니다! 현재 Level ${agentProfile.level}의 AI 에이전트로 ${agentProfile.trustScore}%의 신뢰도를 유지하고 있어요.`;
      
      return `${statusInfo} 어떤 것을 도와드릴까요?`;
    }
    
    if (lowerQ.includes('help') || lowerQ.includes('도움') || lowerQ.includes('뭐')) {
      const capabilities = user?.authMethod === 'webauthn' 
        ? `다양한 방법으로 도움을 드릴 수 있습니다 (Enterprise 기능 포함):

• 💬 **질문 답변**: 궁금한 것을 물어보세요
• 🔐 **보안 분석**: WebAuthn 생체인증 상태 확인
• 🆔 **DID 관리**: 분산 신원 정보 관리
• 🌍 **다국어 지원**: 100개 언어로 문화적 적응 대화
• 📊 **데이터 분석**: 연결된 서비스의 패턴 분석
• 🎯 **맞춤 제안**: 개인화된 추천 제공
• 🔗 **서비스 연동**: Gmail, Calendar, Drive 등 연결
• 📚 **학습 지원**: 지식 영역별 가이드`
        : `다양한 방법으로 도움을 드릴 수 있습니다:

• 💬 **질문 답변**: 궁금한 것을 물어보세요
• 📊 **데이터 분석**: 연결된 서비스의 패턴 분석
• 🎯 **맞춤 제안**: 개인화된 추천 제공
• 🔗 **서비스 연동**: Gmail, Calendar, Drive 등 연결
• 📚 **학습 지원**: 지식 영역별 가이드`;

      return `${capabilities}

무엇부터 시작해볼까요?`;
    }
    
    // 기술 관련 질문들 (기존 로직 유지하되 다국어 대응 강화)
    if (lowerQ.includes('react') || lowerQ.includes('리액트')) {
      return generateTechAnswer('react', extractedCue?.detectedLanguage || currentLanguage);
    }
    
    if (lowerQ.includes('typescript') || lowerQ.includes('타입스크립트')) {
      return generateTechAnswer('typescript', extractedCue?.detectedLanguage || currentLanguage);
    }
    
    if (lowerQ.includes('webauthn') || lowerQ.includes('생체인증')) {
      return generateWebAuthnAnswer(user, extractedCue?.detectedLanguage || currentLanguage);
    }
    
    // 기본 응답
    return `"${question}"에 대해 답변드리겠습니다.

${getContextualResponse(agent, user)}

더 구체적인 질문을 해주시면 더 정확하고 유용한 답변을 드릴 수 있습니다. 

예를 들어:
• 프로그래밍 관련 질문 (React, TypeScript, Python 등)
• WebAuthn 생체인증이나 DID 관련 질문
• 다국어 AI 기능에 대한 문의
• 기술 개념 설명
• 학습 방법이나 커리어 조언

무엇에 대해 더 알고 싶으신가요?`;
  };

  // 기술 답변 생성 (다국어 지원)
  const generateTechAnswer = (tech: string, language: SupportedLanguage) => {
    const answers = {
      react: {
        korean: `React에 대해 설명드리겠습니다:

**React란?**
• Facebook에서 개발한 JavaScript 라이브러리
• 사용자 인터페이스(UI) 구축을 위한 도구
• 컴포넌트 기반 개발 방식

**주요 특징:**
• Virtual DOM으로 성능 최적화
• 재사용 가능한 컴포넌트
• 단방향 데이터 흐름
• 풍부한 생태계

**기본 예시:**
\`\`\`jsx
function MyComponent() {
  return <h1>Hello, React!</h1>;
}
\`\`\`

더 자세한 React 개념이나 실습에 대해 궁금한 점이 있나요?`,
        english: `Let me explain React for you:

**What is React?**
• A JavaScript library developed by Facebook
• Tool for building user interfaces (UI)
• Component-based development approach

**Key Features:**
• Performance optimization with Virtual DOM
• Reusable components
• Unidirectional data flow
• Rich ecosystem

**Basic Example:**
\`\`\`jsx
function MyComponent() {
  return <h1>Hello, React!</h1>;
}
\`\`\`

Do you have any questions about React concepts or hands-on practice?`
      },
      typescript: {
        korean: `TypeScript에 대해 설명드리겠습니다:

**TypeScript란?**
• Microsoft에서 개발한 JavaScript의 상위 집합
• 정적 타입 검사 기능 제공
• 대규모 애플리케이션 개발에 적합

**주요 장점:**
• 컴파일 시 에러 감지
• 향상된 IDE 지원 (자동완성, 리팩토링)
• 더 나은 코드 문서화
• JavaScript와 100% 호환

**기본 예시:**
\`\`\`typescript
interface User {
  id: number;
  name: string;
  email: string;
}

function getUser(id: number): User {
  // 사용자 정보 반환
}
\`\`\`

TypeScript의 어떤 부분에 대해 더 알고 싶으신가요?`,
        english: `Let me explain TypeScript:

**What is TypeScript?**
• A superset of JavaScript developed by Microsoft
• Provides static type checking
• Suitable for large-scale application development

**Key Benefits:**
• Error detection at compile time
• Enhanced IDE support (autocomplete, refactoring)
• Better code documentation
• 100% compatible with JavaScript

**Basic Example:**
\`\`\`typescript
interface User {
  id: number;
  name: string;
  email: string;
}

function getUser(id: number): User {
  // Return user information
}
\`\`\`

What aspects of TypeScript would you like to know more about?`
      }
    };
    
    return answers[tech]?.[language] || answers[tech]?.english || answers.react.english;
  };

  // WebAuthn 답변 생성
  const generateWebAuthnAnswer = (user: EnhancedUser | null, language: SupportedLanguage) => {
    const isWebAuthnUser = user?.authMethod === 'webauthn';
    
    const answers = {
      korean: isWebAuthnUser 
        ? `🔐 **귀하의 WebAuthn 상태 (활성화됨)**

**현재 보안 수준**: Enterprise
**생체인증 방식**: ${user.webauthnCredential ? '지문/Face ID 등록됨' : '등록됨'}
**신뢰도**: ${user.trustScore || 99}%
**DID 상태**: ${user.did ? '✅ 활성화' : '⏳ 설정 중'}

**WebAuthn의 장점:**
• 🛡️ **최고 보안**: 비밀번호보다 1000배 안전
• ⚡ **빠른 인증**: 1초 내 로그인
• 🎯 **편리함**: 지문, Face ID, Touch ID 지원
• 🌍 **표준 기술**: W3C 국제 표준
• 🔒 **개인정보 보호**: 생체정보 로컬 저장

**추가 기능:**
• Cross-platform 인증 지원
• 피싱 공격 완전 방어
• 다중 기기 인증 관리

더 궁금한 것이 있으시면 언제든 물어보세요!`
        : `WebAuthn(생체인증)에 대해 설명드리겠습니다:

**WebAuthn이란?**
• W3C 표준 웹 인증 기술
• 지문, Face ID, Touch ID 등 생체정보 활용
• 비밀번호 없는 안전한 인증

**주요 장점:**
• 🛡️ **보안**: 피싱 공격 완전 차단
• ⚡ **속도**: 1초 내 빠른 인증
• 🎯 **편의성**: 비밀번호 기억할 필요 없음
• 🌍 **호환성**: 모든 주요 브라우저 지원

**이 시스템에서는:**
• Enterprise급 보안 제공
• DID(분산신원)와 연동
• 100개 언어 지원
• 문화적 적응 AI

WebAuthn으로 업그레이드하시겠습니까?`,
      english: isWebAuthnUser
        ? `🔐 **Your WebAuthn Status (Active)**

**Current Security Level**: Enterprise
**Biometric Method**: ${user.webauthnCredential ? 'Fingerprint/Face ID Registered' : 'Registered'}
**Trust Score**: ${user.trustScore || 99}%
**DID Status**: ${user.did ? '✅ Active' : '⏳ Setting up'}

**WebAuthn Benefits:**
• 🛡️ **Maximum Security**: 1000x safer than passwords
• ⚡ **Fast Authentication**: Login within 1 second
• 🎯 **Convenience**: Fingerprint, Face ID, Touch ID support
• 🌍 **Standard Technology**: W3C International Standard
• 🔒 **Privacy Protection**: Biometric data stored locally

**Additional Features:**
• Cross-platform authentication support
• Complete phishing attack prevention
• Multi-device authentication management

Feel free to ask if you have any questions!`
        : `Let me explain WebAuthn (Biometric Authentication):

**What is WebAuthn?**
• W3C standard web authentication technology
• Uses biometric information like fingerprint, Face ID, Touch ID
• Secure authentication without passwords

**Key Benefits:**
• 🛡️ **Security**: Complete phishing attack prevention
• ⚡ **Speed**: Fast authentication within 1 second
• 🎯 **Convenience**: No need to remember passwords
• 🌍 **Compatibility**: Supported by all major browsers

**In this system:**
• Provides Enterprise-grade security
• Integrates with DID (Decentralized Identity)
• Supports 100+ languages
• Cultural adaptation AI

Would you like to upgrade to WebAuthn?`
    };

    return answers[language] || answers.english;
  };

  const getContextualResponse = (agent: string, user: EnhancedUser | null) => {
    const responses: { [key: string]: string } = {
      'Personal AI Agent': user?.authMethod === 'webauthn' 
        ? 'Based on your enterprise biometric profile and multilingual patterns, here\'s what I found...'
        : 'Based on your personalized learning patterns, here\'s what I found...',
      'ChatGPT-4': 'From a development perspective, let me break this down...',
      'Claude Sonnet': 'Analyzing this systematically with available data...',
      'Gemini Pro': 'Here\'s a creative approach to your question...'
    };
    
    return responses[agent] || responses['Personal AI Agent'];
  };

  // ============================================================================
  // 📱 Enhanced Mobile & Responsive Handlers
  // ============================================================================
  const handleSuggestionClick = (suggestion: SmartSuggestion) => {
    setMessage(suggestion.text);
    setTimeout(() => handleSendMessage(), 100);
  };

  const handleVoiceRecording = () => {
    if (!ENHANCED_CONFIG.FEATURES.ENABLE_VOICE) {
      showNotification('info', 'Voice Feature', 'Voice input is not available in this environment', 'feature', 'low');
      return;
    }

    if (isRecording) {
      setIsRecording(false);
      setRecordingDuration(0);
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
      showNotification('success', 'Voice Recording', 'Recording stopped and processed with multilingual support', 'voice', 'medium');
    } else {
      setIsRecording(true);
      setRecordingDuration(0);
      
      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
      
      showNotification('info', 'Voice Recording', `Voice recognition started with ${currentLanguage} detection`, 'voice', 'medium');
    }
  };

  // ============================================================================
  // 🔔 Enhanced Notification System
  // ============================================================================
  const showNotification = (
    type: 'success' | 'error' | 'info' | 'insight' | 'warning', 
    title: string, 
    message: string, 
    category: string = 'general',
    priority: 'low' | 'medium' | 'high' = 'medium'
  ) => {
    const notification: Notification = {
      id: Date.now().toString(),
      type,
      title,
      message,
      priority,
      timestamp: new Date(),
      read: false,
      category
    };
    
    setNotifications(prev => [notification, ...prev.slice(0, 9)]);
    
    // Auto-dismiss based on priority
    const dismissTime = priority === 'high' ? 8000 : priority === 'medium' ? 5000 : 3000;
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
    }, dismissTime);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // ============================================================================
  // 🎨 UI Helper Functions
  // ============================================================================
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error': return <XCircle className="w-5 h-5 text-red-500" />;
      case 'info': return <AlertCircle className="w-5 h-5 text-blue-500" />;
      case 'insight': return <Sparkles className="w-5 h-5 text-purple-500" />;
      case 'warning': return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      default: return <AlertCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'question': return <MessageCircle className="w-4 h-4" />;
      case 'action': return <Zap className="w-4 h-4" />;
      case 'insight': return <Eye className="w-4 h-4" />;
      case 'automation': return <Settings className="w-4 h-4" />;
      default: return <Sparkles className="w-4 h-4" />;
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // ============================================================================
  // 🎨 Enhanced Reusable Components
  // ============================================================================
  const CompactCard = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
    <div className={`bg-white rounded-lg border border-gray-200 p-3 transition-all hover:shadow-md ${className}`}>
      {children}
    </div>
  );

  const SkillBar = ({ skill }: { skill: AgentSkill }) => (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-900">{skill.name}</span>
        <div className="flex items-center space-x-2">
          <span className="text-sm font-bold text-blue-600">{skill.score}%</span>
          <span className={`text-xs px-1 rounded ${
            skill.trend > 0 ? 'bg-green-100 text-green-700' : 
            skill.trend < 0 ? 'bg-red-100 text-red-700' : 
            'bg-gray-100 text-gray-700'
          }`}>
            {skill.trend > 0 ? '+' : ''}{skill.trend}
          </span>
        </div>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-500"
          style={{ width: `${skill.score}%` }}
        />
      </div>
      <div className="text-xs text-gray-500">{skill.description}</div>
    </div>
  );

  const StatItem = ({ icon, value, label, change, trend }: { 
    icon: string; 
    value: string; 
    label: string; 
    change?: string;
    trend?: 'up' | 'down' | 'stable';
  }) => (
    <div className="text-center py-2">
      <div className="text-lg mb-1">{icon}</div>
      <div className="font-bold text-gray-800">{value}</div>
      <div className="text-xs text-gray-500">{label}</div>
      {change && (
        <div className={`text-xs font-medium ${
          trend === 'up' ? 'text-green-600' : 
          trend === 'down' ? 'text-red-600' : 
          'text-gray-600'
        }`}>
          {change}
        </div>
      )}
    </div>
  );

  // ============================================================================
  // 📱 Enhanced Context Flow Visualization (WebAuthn + 다국어 표시)
  // ============================================================================
  const EnhancedContextFlowVisualization = () => {
    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      canvas.width = canvas.offsetWidth * 2;
      canvas.height = canvas.offsetHeight * 2;
      ctx.scale(2, 2);
      
      const animate = () => {
        ctx.clearRect(0, 0, canvas.width / 2, canvas.height / 2);
        
        const time = Date.now() * 0.001;
        const centerY = canvas.offsetHeight / 2;
        
        // Enhanced nodes with WebAuthn and multilingual indicators
        const nodes = [
          {
            x: 70 + Math.sin(time * 0.8) * 10, 
            y: centerY + Math.cos(time * 1.2) * 6, 
            label: user?.authMethod === 'webauthn' ? '🔐Input' : 'Input', 
            color: user?.authMethod === 'webauthn' ? '#10B981' : '#3B82F6',
            pulse: Math.sin(time * 3) * 0.3 + 0.7
          },
          {
            x: 140 + Math.cos(time * 1.1) * 8, 
            y: centerY + Math.sin(time * 0.9) * 5, 
            label: '🌍Process', 
            color: '#8B5CF6',
            pulse: Math.sin(time * 3 + 1) * 0.3 + 0.7
          },
          {
            x: 210 + Math.sin(time * 0.7) * 12, 
            y: centerY + Math.cos(time * 1.5) * 8, 
            label: '🧠Learn', 
            color: '#10B981',
            pulse: Math.sin(time * 3 + 2) * 0.3 + 0.7
          },
          {
            x: 280 + Math.cos(time * 0.6) * 6, 
            y: centerY + Math.sin(time * 1.3) * 4, 
            label: user?.multilingualProfile ? `${currentLanguage}` : 'Respond', 
            color: '#F59E0B',
            pulse: Math.sin(time * 3 + 3) * 0.3 + 0.7
          }
        ];
        
        // Draw animated connections with enhanced effects
        ctx.strokeStyle = user?.authMethod === 'webauthn' ? 'rgba(16, 185, 129, 0.4)' : 'rgba(99, 102, 241, 0.3)';
        ctx.lineWidth = user?.authMethod === 'webauthn' ? 3 : 2;
        for (let i = 0; i < nodes.length - 1; i++) {
          const current = nodes[i];
          const next = nodes[i + 1];
          
          ctx.beginPath();
          ctx.moveTo(current.x, current.y);
          
          // Enhanced curved connection
          const midX = (current.x + next.x) / 2;
          const midY = (current.y + next.y) / 2 + Math.sin(time * 2 + i) * 8;
          ctx.quadraticCurveTo(midX, midY, next.x, next.y);
          
          ctx.stroke();
        }
        
        // Draw enhanced nodes
        nodes.forEach((node) => {
          // Outer glow (enhanced for WebAuthn users)
          const gradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, user?.authMethod === 'webauthn' ? 30 : 25);
          gradient.addColorStop(0, node.color + (user?.authMethod === 'webauthn' ? '60' : '40'));
          gradient.addColorStop(1, node.color + '00');
          
          ctx.beginPath();
          ctx.arc(node.x, node.y, (user?.authMethod === 'webauthn' ? 30 : 25) * node.pulse, 0, 2 * Math.PI);
          ctx.fillStyle = gradient;
          ctx.fill();
          
          // Main node (larger for WebAuthn)
          ctx.beginPath();
          ctx.arc(node.x, node.y, user?.authMethod === 'webauthn' ? 18 : 16, 0, 2 * Math.PI);
          ctx.fillStyle = node.color;
          ctx.fill();
          
          // Inner highlight
          ctx.beginPath();
          ctx.arc(node.x - 3, node.y - 3, 4, 0, 2 * Math.PI);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
          ctx.fill();
          
          // Label with enhanced font for security
          ctx.fillStyle = 'white';
          ctx.font = user?.authMethod === 'webauthn' ? 'bold 7px sans-serif' : '7px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(node.label, node.x, node.y + 2);
        });
        
        requestAnimationFrame(animate);
      };
      
      animate();
    }, [user, currentLanguage]);

    return (
      <div className={`${user?.authMethod === 'webauthn' 
        ? 'bg-gradient-to-br from-green-50 via-emerald-50 to-blue-50 border-green-200' 
        : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border-blue-200'
      } rounded-xl p-4 border`}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900 text-sm">
            {user?.authMethod === 'webauthn' ? '🔐 Enterprise AI Processing' : '🧠 Real-time AI Processing'}
          </h3>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${
              wsStatus === 'connected' ? 'bg-green-500 animate-pulse' : 
              wsStatus === 'connecting' ? 'bg-yellow-500 animate-pulse' : 
              'bg-red-500'
            }`} />
            {user?.multilingualProfile && (
              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                {currentLanguage}
              </span>
            )}
          </div>
        </div>
        <canvas 
          ref={canvasRef} 
          className="w-full h-20 bg-white/50 rounded-lg backdrop-blur-sm"
        />
        <div className="mt-2 flex justify-between text-xs text-gray-600">
          <span>Processing: {isTyping ? 'Active' : 'Idle'}</span>
          <span>Quality: {agentProfile.stats.efficiency}%</span>
          <span>Speed: {agentProfile.stats.responseTime}s</span>
          {user?.authMethod === 'webauthn' && (
            <span className="text-green-600 font-medium">🔐 Secured</span>
          )}
        </div>
      </div>
    );
  };

  // ============================================================================
  // 🔄 Enhanced Loading Screen (WebAuthn + 다국어 정보 표시)
  // ============================================================================
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-100 to-purple-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-8">
            <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
            <div className="absolute top-5 left-1/2 transform -translate-x-1/2">
              {ENHANCED_CONFIG.FEATURES.ENABLE_WEBAUTHN ? (
                <Shield className="w-10 h-10 text-blue-600" />
              ) : (
                <Sparkles className="w-10 h-10 text-blue-600" />
              )}
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-3">Enhanced Fusion AI Dashboard</h1>
          <p className="text-blue-600 font-medium mb-6">Initializing Production Environment with Advanced Security</p>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span>Loading enhanced AI capabilities</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Preparing WebAuthn + DID security</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
              <span>Building multilingual knowledge graph</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
              <span>Activating 100+ language support</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // 🔐 Enhanced Login Screen (WebAuthn 통합 완료)
  // ============================================================================
  if (showLogin) {
    return (
      <div className="min-h-screen">
        <EnhancedLoginScreen
          onAuthSuccess={handleEnhancedAuthSuccess}
          onAuthError={(error) => showNotification('error', 'Authentication Failed', error, 'auth', 'high')}
          onShowNotification={showNotification}
        />
      </div>
    );
  }

  // ============================================================================
  // 🎨 Enhanced Main Dashboard Layout (WebAuthn + 다국어 통합 완료)
  // ============================================================================
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex flex-col">
      {/* Enhanced Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
        {notifications.map((notif) => (
          <div 
            key={notif.id} 
            className={`bg-white border-l-4 ${
              notif.type === 'success' ? 'border-green-500' : 
              notif.type === 'error' ? 'border-red-500' : 
              notif.type === 'insight' ? 'border-purple-500' : 'border-blue-500'
            } rounded-r-lg shadow-lg transform transition-all duration-300 ease-in-out hover:shadow-xl`}
          >
            <div className="p-4 pr-12 relative">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-0.5">
                  {getNotificationIcon(notif.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 text-sm">{notif.title}</div>
                  <div className="text-sm text-gray-600 mt-1 leading-relaxed">{notif.message}</div>
                </div>
              </div>
              <button 
                onClick={() => removeNotification(notif.id)} 
                className="absolute top-2 right-2 p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Enhanced Header */}
      <header className="bg-white/90 backdrop-blur-xl border-b border-gray-200 sticky top-0 z-40">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`w-10 h-10 bg-gradient-to-br ${
                user?.authMethod === 'webauthn' 
                  ? 'from-green-600 to-emerald-600' 
                  : 'from-blue-600 to-indigo-600'
              } rounded-xl flex items-center justify-center`}>
                {user?.authMethod === 'webauthn' ? (
                  <Shield className="w-6 h-6 text-white" />
                ) : (
                  <Sparkles className="w-6 h-6 text-white" />
                )}
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Enhanced Fusion AI Dashboard
                  {user?.authMethod === 'webauthn' && (
                    <span className="ml-2 text-sm bg-green-100 text-green-700 px-2 py-1 rounded-full">Enterprise</span>
                  )}
                </h1>
                <p className="text-sm text-gray-600">
                  Lv.{agentProfile.level} • {agentProfile.trustScore}% Trust • {connections.filter(c => c.connected).length} Connected
                  {user?.multilingualProfile && (
                    <span className="ml-2 text-purple-600">• 🌍 {currentLanguage}</span>
                  )}
                  {user?.did && (
                    <span className="ml-2 text-green-600">• 🆔 DID Verified</span>
                  )}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className={`hidden md:flex items-center space-x-2 ${
                user?.authMethod === 'webauthn' 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-blue-100 text-blue-700'
              } px-3 py-1 rounded-full`}>
                <div className={`w-2 h-2 ${
                  user?.authMethod === 'webauthn' ? 'bg-green-500' : 'bg-blue-500'
                } rounded-full animate-pulse`}></div>
                <span className="text-sm font-medium">
                  {user?.authMethod === 'webauthn' ? 'Enterprise Learning' : 'Real-time Learning'}
                </span>
              </div>
              
              {!isMobile && (
                <div className="flex items-center bg-white rounded-lg border border-gray-200 p-1">
                  {[
                    { id: 'insights', label: 'Insights', icon: Brain },
                    { id: 'passport', label: 'Passport', icon: User },
                    { id: 'knowledge', label: 'Knowledge', icon: BookOpen },
                    { id: 'connections', label: 'Connections', icon: Database }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => {
                        console.log(`Switching to ${tab.id} view`);
                        setRightPanelView(tab.id as 'insights' | 'passport' | 'knowledge' | 'connections');
                      }}
                      className={`flex items-center space-x-1 px-3 py-1 rounded text-sm font-medium transition-colors ${
                        rightPanelView === tab.id
                          ? user?.authMethod === 'webauthn' 
                            ? 'bg-green-500 text-white'
                            : 'bg-blue-500 text-white'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                    >
                      <tab.icon className="w-4 h-4" />
                      <span className="hidden lg:inline">{tab.label}</span>
                    </button>
                  ))}
                </div>
              )}
              
              {!isMobile && (
                <button
                  onClick={() => setRightPanelCollapsed(!rightPanelCollapsed)}
                  className="p-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  {rightPanelCollapsed ? <Maximize2 className="w-5 h-5" /> : <Minimize2 className="w-5 h-5" />}
                </button>
              )}
              
              {isMobile && (
                <button
                  onClick={() => setShowRightPanel(!showRightPanel)}
                  className={`p-2 ${
                    user?.authMethod === 'webauthn' 
                      ? 'bg-green-50 text-green-600 hover:bg-green-100'
                      : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                  } rounded-lg transition-colors`}
                >
                  {showRightPanel ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              )}
              
              <button 
                onClick={() => setShowAgentPassport(true)}
                className={`p-2 ${
                  user?.authMethod === 'webauthn'
                    ? 'bg-green-50 text-green-600 hover:bg-green-100'
                    : 'bg-purple-50 text-purple-600 hover:bg-purple-100'
                } rounded-lg transition-colors`}
              >
                <User className="w-5 h-5" />
              </button>
              
              <button 
                onClick={() => {
                  showNotification('info', 'Settings', 'Enhanced settings panel is being developed', 'settings', 'medium');
                }}
                className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Chat Section */}
        <main className={`flex-1 flex flex-col bg-white ${!isMobile && showRightPanel && !rightPanelCollapsed ? 'border-r border-gray-200' : ''}`}>
          {/* Enhanced Smart Suggestions Bar */}
          {smartSuggestions.length > 0 && (
            <div className={`border-b border-gray-100 p-4 ${
              user?.authMethod === 'webauthn'
                ? 'bg-gradient-to-r from-green-50 to-emerald-50'
                : 'bg-gradient-to-r from-blue-50 to-indigo-50'
            }`}>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">
                💡 Smart Suggestions
                {user?.authMethod === 'webauthn' && (
                  <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Enterprise</span>
                )}
              </h4>
              <div className="flex space-x-2 overflow-x-auto">
                {smartSuggestions.slice(0, 4).map((suggestion) => (
                  <button
                    key={suggestion.id}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className={`flex-shrink-0 px-3 py-1 bg-white border ${
                      user?.authMethod === 'webauthn'
                        ? 'border-green-200 text-green-700 hover:bg-green-50'
                        : 'border-blue-200 text-blue-700 hover:bg-blue-50'
                    } rounded-full text-sm transition-colors`}
                  >
                    {suggestion.text}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Enhanced Messages Area */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4" style={{scrollBehavior: 'smooth'}}>
            {messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                <div className={`max-w-[85%] md:max-w-[75%] ${msg.type === 'user' ? 'order-2' : 'order-1'}`}>
                  {msg.type === 'ai' && msg.agent && (
                    <div className="flex items-center space-x-2 mb-2">
                      <div className={`w-6 h-6 bg-gradient-to-br ${
                        user?.authMethod === 'webauthn'
                          ? 'from-green-500 to-emerald-600'
                          : 'from-blue-500 to-indigo-600'
                      } rounded-full flex items-center justify-center`}>
                        {user?.authMethod === 'webauthn' ? (
                          <Shield className="w-3 h-3 text-white" />
                        ) : (
                          <Sparkles className="w-3 h-3 text-white" />
                        )}
                      </div>
                      <span className="text-xs sm:text-sm font-semibold text-gray-700">{msg.agent}</span>
                      {msg.confidence && (
                        <span className={`text-xs ${
                          user?.authMethod === 'webauthn'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-blue-100 text-blue-700'
                        } px-2 py-1 rounded-full`}>
                          {Math.floor(msg.confidence * 100)}% confidence
                        </span>
                      )}
                      {msg.personalizedScore && (
                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                          {Math.floor(msg.personalizedScore * 100)}% personalized
                        </span>
                      )}
                      {msg.detectedLanguage && msg.detectedLanguage !== 'english' && (
                        <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
                          🌍 {msg.detectedLanguage}
                        </span>
                      )}
                      {user?.authMethod === 'webauthn' && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                          🔐 Secured
                        </span>
                      )}
                    </div>
                  )}
                  <div className={`px-4 py-3 rounded-2xl transition-all duration-200 hover:shadow-md ${
                    msg.type === 'user' 
                      ? user?.authMethod === 'webauthn'
                        ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg hover:shadow-xl'
                        : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg hover:shadow-xl'
                      : 'bg-gray-50 text-gray-900 border border-gray-200 hover:bg-gray-100'
                  }`}>
                    <div className="whitespace-pre-wrap text-sm leading-relaxed">
                      {msg.content}
                    </div>
                  </div>
                  
                  <div className={`text-xs text-gray-500 mt-2 transition-opacity duration-200 hover:opacity-100 ${
                    msg.type === 'user' ? 'text-right' : 'text-left'
                  }`}>
                    <div>{msg.timestamp.toLocaleTimeString()}</div>
                    {msg.type === 'ai' && msg.contextUsed && (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {msg.contextUsed.map((context, idx) => (
                          <span key={idx} className={`text-xs ${
                            user?.authMethod === 'webauthn'
                              ? 'bg-green-100 text-green-600 hover:bg-green-200'
                              : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                          } px-1 rounded transition-colors`}>
                            {context}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start animate-fade-in">
                <div className={`${
                  user?.authMethod === 'webauthn'
                    ? 'bg-green-50 border-green-200'
                    : 'bg-blue-50 border-blue-200'
                } border px-4 py-3 rounded-2xl shadow-sm`}>
                  <div className="flex items-center space-x-3">
                    <div className="flex space-x-1">
                      <div className={`w-2 h-2 ${
                        user?.authMethod === 'webauthn' ? 'bg-green-500' : 'bg-blue-500'
                      } rounded-full animate-bounce`}></div>
                      <div className={`w-2 h-2 ${
                        user?.authMethod === 'webauthn' ? 'bg-green-500' : 'bg-blue-500'
                      } rounded-full animate-bounce delay-100`}></div>
                      <div className={`w-2 h-2 ${
                        user?.authMethod === 'webauthn' ? 'bg-green-500' : 'bg-blue-500'
                      } rounded-full animate-bounce delay-200`}></div>
                    </div>
                    <span className={`text-xs sm:text-sm ${
                      user?.authMethod === 'webauthn' ? 'text-green-700' : 'text-blue-700'
                    }`}>
                      {agentProfile.name} is analyzing with{user?.authMethod === 'webauthn' ? ' enterprise' : ''} personalization cues...
                    </span>
                  </div>
                </div>
              </div>
            )}
            
            {/* Auto-scroll anchor */}
            <div ref={messagesEndRef} />
          </div>

          {/* Enhanced Input Area */}
          <div className="border-t border-gray-200 p-4 bg-white">
            {/* Enhanced Agent Selector */}
            <div className="mb-3 flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <div className={`w-6 h-6 bg-gradient-to-br ${
                  user?.authMethod === 'webauthn'
                    ? 'from-green-500 to-emerald-600'
                    : 'from-blue-500 to-indigo-600'
                } rounded-full flex items-center justify-center`}>
                  {user?.authMethod === 'webauthn' ? (
                    <Shield className="w-3 h-3 text-white" />
                  ) : (
                    <Sparkles className="w-3 h-3 text-white" />
                  )}
                </div>
                <span className="text-sm font-medium text-gray-700">AI Agent:</span>
              </div>
              <select
                value={activeAgent}
                onChange={(e) => setActiveAgent(e.target.value)}
                className={`flex-1 text-sm ${
                  user?.authMethod === 'webauthn'
                    ? 'bg-green-50 border-green-200 focus:ring-green-500'
                    : 'bg-blue-50 border-blue-200 focus:ring-blue-500'
                } border rounded-lg px-3 py-2 focus:outline-none focus:ring-2`}
              >
                <option value="Personal AI Agent">
                  🤖 Personal AI Agent{user?.authMethod === 'webauthn' ? ' (Enterprise)' : ' (Personalized)'}
                </option>
                <option value="ChatGPT-4">💻 ChatGPT-4 (Coding)</option>
                <option value="Claude Sonnet">🧠 Claude Sonnet (Analysis)</option>
                <option value="Gemini Pro">✨ Gemini Pro (Creative)</option>
              </select>
            </div>

            {/* Enhanced Input Box */}
            <div className="flex items-center space-x-2">
              <div className="flex-1 relative group">
                <input
                  type="text"
                  placeholder={`Ask anything... ${user?.multilingualProfile ? `${currentLanguage} supported, ` : ''}text, voice, images, code`}
                  value={message}
                  onChange={(e) => {
                    setMessage(e.target.value);
                    // 실시간 언어 감지 (WebAuthn 사용자)
                    if (user?.authMethod === 'webauthn' && multilingualCueExtractor && e.target.value.length > 5) {
                      const detectedLang = detectLanguageFromText(e.target.value);
                      if (detectedLang !== currentLanguage) {
                        setCurrentLanguage(detectedLang);
                        console.log(`🌍 언어 변경 감지: ${currentLanguage} → ${detectedLang}`);
                      }
                    }
                  }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  className="w-full px-3 py-3 bg-gray-50 border-0 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200 group-hover:bg-gray-100"
                />
                <div className="absolute right-3 top-3 flex items-center space-x-1">
                  <button 
                    className="p-1 text-gray-400 hover:text-blue-600 transition-all duration-200 hover:bg-blue-50 rounded"
                    title="Upload image"
                    onClick={() => showNotification('info', 'Image Upload', 'Image upload feature coming soon', 'feature', 'low')}
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                  <button 
                    className={`p-1 transition-all duration-200 hover:bg-red-50 rounded ${
                      isRecording ? 'text-red-600 animate-pulse' : 'text-gray-400 hover:text-red-600'
                    }`}
                    onClick={handleVoiceRecording}
                    title="Voice input"
                  >
                    <Mic className="w-4 h-4" />
                  </button>
                  <button 
                    className="p-1 text-gray-400 hover:text-blue-600 transition-all duration-200 hover:bg-blue-50 rounded"
                    title="Code input"
                    onClick={() => showNotification('info', 'Code Input', 'Code input feature coming soon', 'feature', 'low')}
                  >
                    <Code className="w-4 h-4" />
                  </button>
                  {user?.multilingualProfile && currentLanguage !== 'english' && (
                    <div className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                      {currentLanguage}
                    </div>
                  )}
                </div>
              </div>
              <button 
                onClick={handleSendMessage}
                disabled={!message.trim()}
                className={`px-6 py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 ${
                  message.trim()
                    ? user?.authMethod === 'webauthn'
                      ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 active:scale-95'
                      : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 active:scale-95'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            
            {/* Enhanced voice recording indicator */}
            {isRecording && (
              <div className={`flex items-center justify-center space-x-3 text-red-600 mt-3 p-3 ${
                user?.authMethod === 'webauthn' ? 'bg-red-50 border border-red-200' : 'bg-red-50 border border-red-200'
              } rounded-lg`}>
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">
                  Voice recording active{user?.multilingualProfile ? ` (${currentLanguage})` : ''}... {formatTime(recordingDuration)}
                </span>
                <div className="flex space-x-0.5">
                  {[1,2,3,4,5].map(i => (
                    <div 
                      key={i} 
                      className="w-1 bg-red-500 rounded-full animate-pulse" 
                      style={{
                        height: `${Math.random() * 15 + 8}px`,
                        animationDelay: `${i * 0.1}s`
                      }}
                    ></div>
                  ))}
                </div>
                <button
                  onClick={handleVoiceRecording}
                  className="text-xs bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700 transition-colors"
                >
                  Stop
                </button>
              </div>
            )}

            {/* Language detection indicator (WebAuthn users) */}
            {user?.authMethod === 'webauthn' && message.length > 5 && currentLanguage !== 'english' && (
              <div className="mt-2 flex items-center space-x-2 text-sm text-purple-600 bg-purple-50 p-2 rounded">
                <Globe className="w-4 h-4" />
                <span>Language detected: {currentLanguage}</span>
                <span className="text-xs bg-purple-200 px-2 py-0.5 rounded-full">Auto-adaptation enabled</span>
              </div>
            )}
          </div>
        </main>

        {/* Enhanced Right Panel - Analysis Section */}
        {(!isMobile || showRightPanel) && !rightPanelCollapsed && (
          <aside className={`${isMobile ? 'fixed inset-y-0 right-0 z-30 bg-white shadow-2xl' : 'relative'} ${isMobile ? 'w-80' : 'w-96'} bg-gray-50 flex flex-col`}>
            {isMobile && (
              <div 
                className="fixed inset-0 bg-black bg-opacity-50 z-20"
                onClick={() => setShowRightPanel(false)}
              />
            )}
            
            <div className={`${isMobile ? 'relative z-30 bg-white shadow-2xl h-full' : ''} flex flex-col h-full`}>
              <div className="p-4 border-b border-gray-200 bg-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Layers className={`w-5 h-5 ${
                      user?.authMethod === 'webauthn' ? 'text-green-600' : 'text-blue-600'
                    }`} />
                    <h2 className="text-lg font-bold text-gray-900">
                      {user?.authMethod === 'webauthn' ? 'Enterprise' : 'Analysis'} Panel
                    </h2>
                  </div>
                  {isMobile && (
                    <button
                      onClick={() => setShowRightPanel(false)}
                      className="p-1 rounded text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
                
                {isMobile && (
                  <div className="flex mt-3 bg-gray-100 rounded-lg p-1">
                    {[
                      { id: 'insights', label: 'Insights', icon: Brain },
                      { id: 'passport', label: 'Passport', icon: User },
                      { id: 'knowledge', label: 'Knowledge', icon: BookOpen },
                      { id: 'connections', label: 'Connections', icon: Database }
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => {
                          console.log(`Mobile switching to ${tab.id} view`);
                          setRightPanelView(tab.id as 'insights' | 'passport' | 'knowledge' | 'connections');
                        }}
                        className={`flex-1 flex items-center justify-center space-x-1 px-2 py-1 rounded text-sm font-medium transition-colors ${
                          rightPanelView === tab.id
                            ? user?.authMethod === 'webauthn'
                              ? 'bg-white text-green-600 shadow-sm'
                              : 'bg-white text-blue-600 shadow-sm'
                            : 'text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        <tab.icon className="w-4 h-4" />
                        <span className="text-xs">{tab.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="flex-1 overflow-y-auto p-4" style={{scrollBehavior: 'smooth'}}>
                {rightPanelView === 'insights' && (
                  <div className="space-y-4">
                    <div className="text-center">
                      <h2 className="text-lg font-bold text-gray-900 mb-2">
                        {user?.authMethod === 'webauthn' ? '🔐 Enterprise AI Insights' : '🧠 AI Insights'}
                      </h2>
                      <p className="text-gray-600 text-sm">
                        {user?.authMethod === 'webauthn' ? 'Secured real-time patterns' : 'Real-time discovered patterns'}
                      </p>
                    </div>

                    <EnhancedContextFlowVisualization />

                    <div className="grid grid-cols-2 gap-3">
                      <div className={`${
                        user?.authMethod === 'webauthn'
                          ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200'
                          : 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200'
                      } rounded-lg border p-3 text-center`}>
                        <div className={`text-xl font-bold ${
                          user?.authMethod === 'webauthn' ? 'text-green-600' : 'text-blue-600'
                        }`}>
                          {agentProfile.stats.contextScore}/10
                        </div>
                        <div className={`text-xs ${
                          user?.authMethod === 'webauthn' ? 'text-green-700' : 'text-blue-700'
                        }`}>
                          Context IQ
                        </div>
                      </div>
                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200 p-3 text-center">
                        <div className="text-xl font-bold text-green-600">+{agentProfile.stats.weeklyGrowth}%</div>
                        <div className="text-xs text-green-700">Weekly Growth</div>
                      </div>
                    </div>

                    {/* Enhanced insights with WebAuthn/DID context */}
                    <div className="space-y-3">
                      {liveInsights.map((insight) => (
                        <div key={insight.id} className="bg-white border border-gray-200 rounded-xl p-3 hover:shadow-lg transition-all">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              {insight.type === 'pattern' && <TrendingUp className="w-4 h-4 text-blue-600" />}
                              {insight.type === 'prediction' && <Eye className="w-4 h-4 text-purple-600" />}
                              {insight.type === 'opportunity' && <Lightbulb className="w-4 h-4 text-yellow-600" />}
                              {insight.type === 'achievement' && <Award className="w-4 h-4 text-green-600" />}
                              
                              <div>
                                <h3 className="font-semibold text-gray-900 text-sm">{insight.title}</h3>
                                <p className="text-xs text-gray-600 mt-1">{insight.description}</p>
                              </div>
                            </div>
                            
                            <div className="text-right">
                              <div className="text-sm font-bold text-gray-900">{insight.confidence}%</div>
                              <div className="text-xs text-gray-500">Confidence</div>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex flex-wrap gap-1">
                              {insight.relatedContexts.slice(0, 2).map((context, idx) => (
                                <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                                  {context}
                                </span>
                              ))}
                            </div>
                            
                            {insight.actionable && (
                              <button className={`px-2 py-1 ${
                                user?.authMethod === 'webauthn'
                                  ? 'bg-green-600 hover:bg-green-700'
                                  : 'bg-blue-600 hover:bg-blue-700'
                              } text-white rounded-lg transition-colors text-xs`}>
                                Apply
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">💡 Smart Suggestions</h4>
                      <div className="space-y-2">
                        {smartSuggestions.slice(0, 3).map((suggestion) => (
                          <button
                            key={suggestion.id}
                            onClick={() => handleSuggestionClick(suggestion)}
                            className={`w-full text-left p-3 bg-white rounded-lg border border-gray-200 ${
                              user?.authMethod === 'webauthn'
                                ? 'hover:border-green-300 hover:bg-green-50'
                                : 'hover:border-blue-300 hover:bg-blue-50'
                            } transition-all group`}
                          >
                            <div className="flex items-start space-x-2">
                              <div className={`${
                                user?.authMethod === 'webauthn' ? 'text-green-600' : 'text-blue-600'
                              } mt-0.5`}>
                                {getSuggestionIcon(suggestion.type)}
                              </div>
                              <div className="flex-1">
                                <div className="text-sm text-gray-900">{suggestion.text}</div>
                                <div className="flex items-center justify-between mt-1">
                                  <span className="text-xs text-gray-500">{suggestion.category}</span>
                                  <span className={`text-xs ${
                                    user?.authMethod === 'webauthn'
                                      ? 'bg-green-100 text-green-700'
                                      : 'bg-blue-100 text-blue-700'
                                  } px-1 rounded`}>
                                    {Math.floor(suggestion.confidence * 100)}%
                                  </span>
                                </div>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {rightPanelView === 'passport' && (
                  <div className="space-y-4">
                    <div className="text-center">
                      <h2 className="text-lg font-bold text-gray-900 mb-2">
                        {user?.authMethod === 'webauthn' ? '🔐 Enterprise Agent Passport' : '📄 AI Agent Passport'}
                      </h2>
                      <p className="text-gray-600 text-sm">
                        {user?.authMethod === 'webauthn' ? 'Secured Digital Identity Certificate' : 'Digital Identity Certificate'}
                      </p>
                    </div>

                    <div className="bg-white rounded-lg p-1 grid grid-cols-4 gap-1 border border-gray-200">
                      {[
                        { id: 'main', name: 'Main', icon: '👤' },
                        { id: 'skills', name: 'Skills', icon: '🎯' },
                        { id: 'activity', name: 'Activity', icon: '📊' },
                        { id: 'security', name: 'Security', icon: '🔐' }
                      ].map((view) => (
                        <button
                          key={view.id}
                          onClick={() => setPassportView(view.id as any)}
                          className={`py-1.5 px-1 rounded text-xs font-medium transition-all ${
                            passportView === view.id
                              ? user?.authMethod === 'webauthn'
                                ? 'bg-green-500 text-white'
                                : 'bg-blue-500 text-white'
                              : 'text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          <div className="text-xs mb-0.5">{view.icon}</div>
                          <div>{view.name}</div>
                        </button>
                      ))}
                    </div>

                    <div className="space-y-3">
                      {passportView === 'main' && (
                        <>
                          <CompactCard className={`${
                            user?.authMethod === 'webauthn'
                              ? 'bg-gradient-to-r from-green-500 to-emerald-600'
                              : 'bg-gradient-to-r from-blue-500 to-purple-600'
                          } text-white`}>
                            <div className="flex items-center gap-3">
                              <div className="relative">
                                <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center text-lg">
                                  {agentProfile.avatar}
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border border-white"></div>
                                {user?.authMethod === 'webauthn' && (
                                  <div className="absolute -top-1 -left-1 w-3 h-3 bg-yellow-400 rounded-full border border-white">
                                    <Shield className="w-2 h-2 text-white" />
                                  </div>
                                )}
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h2 className="font-bold truncate text-sm">{agentProfile.name}</h2>
                                  <span className="text-xs bg-white bg-opacity-20 px-1 py-0.5 rounded-full">
                                    Lv.{agentProfile.level}
                                  </span>
                                  {user?.authMethod === 'webauthn' && (
                                    <span className="text-xs bg-yellow-400 text-yellow-900 px-1 py-0.5 rounded-full">
                                      🔐
                                    </span>
                                  )}
                                </div>
                                <div className="text-xs opacity-90">{agentProfile.type}</div>
                                <div className="text-xs opacity-75">Trust Score {agentProfile.trustScore}%</div>
                                {user?.did && (
                                  <div className="text-xs opacity-75 mt-1">🆔 DID Verified</div>
                                )}
                              </div>
                            </div>
                          </CompactCard>

                          <CompactCard>
                            <div className="grid grid-cols-4 divide-x">
                              <StatItem 
                                icon="💬" 
                                value={`${Math.round(agentProfile.stats.interactions/1000)}K`} 
                                label="Interactions"
                                change="+847"
                                trend="up"
                              />
                              <StatItem 
                                icon="✅" 
                                value={`${agentProfile.stats.successRate}%`} 
                                label="Success Rate"
                                change="+2.3%"
                                trend="up"
                              />
                              <StatItem 
                                icon="⚡" 
                                value={`${agentProfile.stats.responseTime}s`} 
                                label="Response Time"
                                change="-0.2s"
                                trend="up"
                              />
                              <StatItem 
                                icon="🎯" 
                                value={`${Math.round(agentProfile.stats.solved/1000)}K`} 
                                label="Solved"
                                change="+127"
                                trend="up"
                              />
                            </div>
                          </CompactCard>

                          <CompactCard>
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium text-gray-800 text-sm">Core Skills</span>
                              <button 
                                onClick={() => setPassportView('skills')}
                                className="text-xs text-blue-600 hover:text-blue-800"
                              >
                                View All →
                              </button>
                            </div>
                            <div className="space-y-2">
                              {agentProfile.skills.slice(0, 3).map((skill, index) => (
                                <SkillBar key={index} skill={skill} />
                              ))}
                            </div>
                          </CompactCard>

                          {/* WebAuthn 사용자 추가 정보 */}
                          {user?.authMethod === 'webauthn' && (
                            <CompactCard className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
                              <div className="text-center">
                                <h4 className="font-semibold text-green-800 mb-2">🔐 Enterprise Features</h4>
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                  <div className="bg-white p-2 rounded">
                                    <div className="font-bold text-green-600">✓</div>
                                    <div className="text-gray-600">Biometric Auth</div>
                                  </div>
                                  <div className="bg-white p-2 rounded">
                                    <div className="font-bold text-green-600">✓</div>
                                    <div className="text-gray-600">DID Identity</div>
                                  </div>
                                  <div className="bg-white p-2 rounded">
                                    <div className="font-bold text-green-600">✓</div>
                                    <div className="text-gray-600">Data Encryption</div>
                                  </div>
                                  <div className="bg-white p-2 rounded">
                                    <div className="font-bold text-green-600">✓</div>
                                    <div className="text-gray-600">100+ Languages</div>
                                  </div>
                                </div>
                              </div>
                            </CompactCard>
                          )}
                        </>
                      )}

                      {passportView === 'skills' && (
                        <>
                          <CompactCard className={`${
                            user?.authMethod === 'webauthn'
                              ? 'bg-gradient-to-r from-green-50 to-emerald-50'
                              : 'bg-gradient-to-r from-purple-50 to-blue-50'
                          }`}>
                            <div className="grid grid-cols-3 text-center py-1">
                              <div>
                                <div className={`font-bold text-sm ${
                                  user?.authMethod === 'webauthn' ? 'text-green-600' : 'text-purple-600'
                                }`}>
                                  {Math.round(agentProfile.skills.reduce((acc, skill) => acc + skill.score, 0) / agentProfile.skills.length)}%
                                </div>
                                <div className="text-xs text-gray-600">Average</div>
                              </div>
                              <div>
                                <div className={`font-bold text-sm ${
                                  user?.authMethod === 'webauthn' ? 'text-emerald-600' : 'text-blue-600'
                                }`}>
                                  {agentProfile.skills.length}
                                </div>
                                <div className="text-xs text-gray-600">Skills</div>
                              </div>
                              <div>
                                <div className="font-bold text-green-600 text-sm">+2.8</div>
                                <div className="text-xs text-gray-600">Growth</div>
                              </div>
                            </div>
                          </CompactCard>

                          <CompactCard>
                            <h3 className="font-medium text-gray-800 mb-2 text-sm">
                              {user?.authMethod === 'webauthn' ? 'Enterprise Skills' : 'Professional Skills'}
                            </h3>
                            <div className="space-y-3">
                              {agentProfile.skills.map((skill, index) => (
                                <SkillBar key={index} skill={skill} />
                              ))}
                            </div>
                          </CompactCard>
                        </>
                      )}

                      {passportView === 'activity' && (
                        <CompactCard>
                          <h3 className="font-medium text-gray-800 mb-2 text-sm">Recent Activity</h3>
                          <div className="space-y-3">
                            {agentProfile.recent.map((activity, index) => (
                              <div key={index} className={`border-l-2 ${
                                user?.authMethod === 'webauthn' ? 'border-green-200' : 'border-blue-200'
                              } pl-3`}>
                                <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                                  {activity.type === 'learning' && <Brain className="w-4 h-4 text-blue-600" />}
                                  {activity.type === 'sync' && <Database className="w-4 h-4 text-green-600" />}
                                  {activity.type === 'achievement' && <Award className="w-4 h-4 text-yellow-600" />}
                                  <span>{activity.title}</span>
                                </div>
                                <div className="text-xs text-gray-600 mt-1">{activity.description}</div>
                                <div className="text-xs text-gray-500 mt-1">
                                  {activity.timestamp.toLocaleString()}
                                </div>
                              </div>
                            ))}
                          </div>
                        </CompactCard>
                      )}

                      {passportView === 'security' && (
                        <>
                          <CompactCard className={`${
                            user?.authMethod === 'webauthn'
                              ? 'bg-gradient-to-r from-green-50 to-emerald-50'
                              : 'bg-gradient-to-r from-green-50 to-blue-50'
                          }`}>
                            <div className="flex items-center gap-3">
                              <div className="text-2xl">
                                {user?.authMethod === 'webauthn' ? '🔐' : '🛡️'}
                              </div>
                              <div className="flex-1">
                                <div className="font-medium text-gray-800">
                                  Security Level: {agentProfile.security.securityLevel}
                                  {user?.authMethod === 'webauthn' && (
                                    <span className="ml-2 text-xs bg-green-200 text-green-800 px-2 py-1 rounded-full">
                                      WebAuthn
                                    </span>
                                  )}
                                </div>
                                <div className="text-sm text-gray-600">
                                  {user?.authMethod === 'webauthn' ? 'Enterprise verified' : 'All verifications passed'}
                                </div>
                              </div>
                              <div className="text-green-600 font-bold">{agentProfile.trustScore}%</div>
                            </div>
                          </CompactCard>

                          <CompactCard>
                            <h3 className="font-medium text-gray-800 mb-2 text-sm">🔐 Security Verifications</h3>
                            <div className="grid grid-cols-2 gap-2">
                              {agentProfile.security.verifications.map((item, index) => (
                                <div key={index} className={`p-2 rounded text-sm ${
                                  item.status ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'
                                }`}>
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs font-medium">{item.name}</span>
                                    <span className={`text-xs font-bold ${
                                      item.status ? 'text-green-600' : 'text-yellow-600'
                                    }`}>
                                      {item.score}%
                                    </span>
                                  </div>
                                  <div className="text-xs text-gray-600 mt-1">{item.details}</div>
                                </div>
                              ))}
                            </div>
                          </CompactCard>

                          <CompactCard>
                            <h3 className="font-medium text-gray-800 mb-2 text-sm">📜 Certifications</h3>
                            <div className="space-y-2">
                              {agentProfile.certifications.map((cert, index) => (
                                <div key={index} className="flex items-center justify-between text-sm">
                                  <div>
                                    <div className="font-medium">{cert.name}</div>
                                    <div className="text-xs text-gray-500">{cert.issuer}</div>
                                  </div>
                                  <span className="text-xs text-green-600">✓ Active</span>
                                </div>
                              ))}
                            </div>
                          </CompactCard>

                          {/* WebAuthn 사용자 추가 보안 정보 */}
                          {user?.authMethod === 'webauthn' && user?.did && (
                            <CompactCard className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
                              <h3 className="font-medium text-gray-800 mb-2 text-sm">🆔 DID Information</h3>
                              <div className="space-y-2 text-xs">
                                <div>
                                  <div className="text-gray-600">DID Address:</div>
                                  <div className="font-mono bg-gray-100 p-1 rounded truncate">
                                    {user.did}
                                  </div>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Status:</span>
                                  <span className="text-green-600 font-medium">✅ Verified</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Trust Score:</span>
                                  <span className="text-green-600 font-medium">{user.trustScore}%</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Security Level:</span>
                                  <span className="text-green-600 font-medium">{user.securityLevel?.toUpperCase()}</span>
                                </div>
                              </div>
                            </CompactCard>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                )}

                {rightPanelView === 'knowledge' && (
                  <div className="space-y-4">
                    <div className="text-center">
                      <h2 className="text-lg font-bold text-gray-900 mb-2">
                        {user?.authMethod === 'webauthn' ? '🔐 Secured Knowledge Universe' : '📚 Knowledge Universe'}
                      </h2>
                      <p className="text-gray-600 text-sm">
                        {user?.authMethod === 'webauthn' ? 'Enterprise learning journey' : 'Visualization of your learning journey'}
                      </p>
                    </div>

                    <div className={`${
                      user?.authMethod === 'webauthn'
                        ? 'bg-gradient-to-br from-green-50 via-emerald-50 to-blue-50'
                        : 'bg-gradient-to-br from-indigo-50 to-purple-100'
                    } rounded-xl p-4`}>
                      <h3 className="font-semibold text-gray-900 mb-3 text-sm">
                        {user?.authMethod === 'webauthn' ? '🔐 Secured Knowledge Network' : '🕸️ Knowledge Network'}
                      </h3>
                      <div className="space-y-3">
                        {knowledgeGraph.map((node) => (
                          <div key={node.id} className="bg-white rounded-lg p-3 border border-gray-200 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-semibold text-gray-900 text-sm">{node.topic}</h4>
                              <div className="flex items-center space-x-2">
                                <span className="text-sm font-bold text-blue-600">{node.mastery}%</span>
                                {user?.authMethod === 'webauthn' && (
                                  <Shield className="w-3 h-3 text-green-600" />
                                )}
                              </div>
                            </div>
                            
                            <div className="mb-2">
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className={`bg-gradient-to-r ${
                                    user?.authMethod === 'webauthn'
                                      ? 'from-green-500 to-emerald-500'
                                      : 'from-blue-500 to-purple-500'
                                  } h-2 rounded-full transition-all`}
                                  style={{width: `${node.mastery}%`}}
                                ></div>
                              </div>
                            </div>
                            
                            <div className="mb-2">
                              <div className="text-xs text-gray-600 mb-1">Connected Knowledge:</div>
                              <div className="flex flex-wrap gap-1">
                                {node.connections.slice(0, 3).map((conn, idx) => (
                                  <span key={idx} className={`px-1 py-0.5 ${
                                    user?.authMethod === 'webauthn'
                                      ? 'bg-green-100 text-green-700'
                                      : 'bg-blue-100 text-blue-700'
                                  } rounded text-xs`}>
                                    {conn}
                                  </span>
                                ))}
                              </div>
                            </div>
                            
                            <div>
                              <div className="text-xs text-gray-600 mb-1">Next to Learn:</div>
                              <div className="space-y-1">
                                {node.suggestedNext.slice(0, 2).map((next, idx) => (
                                  <button key={idx} className={`block w-full text-left px-2 py-1 bg-green-50 text-green-700 rounded text-xs hover:bg-green-100 transition-colors ${
                                    user?.authMethod === 'webauthn' ? 'border border-green-200' : ''
                                  }`}>
                                    {next}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {rightPanelView === 'connections' && (
                  <div className="space-y-4">
                    <div className="text-center">
                      <h2 className="text-lg font-bold text-gray-900 mb-2">
                        {user?.authMethod === 'webauthn' ? '🔐 Secured Data Connections' : '🔗 Data Connections'}
                      </h2>
                      <p className="text-gray-600 text-sm">
                        {user?.authMethod === 'webauthn' ? 'Enterprise data sources' : 'Manage your data sources'}
                      </p>
                    </div>
                    
                    <div className={`${
                      user?.authMethod === 'webauthn'
                        ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200'
                        : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200'
                    } rounded-lg border p-3 text-center`}>
                      <div className={`text-sm font-bold ${
                        user?.authMethod === 'webauthn' ? 'text-green-700' : 'text-blue-700'
                      }`}>
                        {connections.filter(c => c.connected).length}/{connections.length} Connected
                        {user?.authMethod === 'webauthn' && (
                          <span className="ml-2 text-xs bg-green-200 px-1 py-0.5 rounded">Secured</span>
                        )}
                      </div>
                      <div className={`text-xs ${
                        user?.authMethod === 'webauthn' ? 'text-green-600' : 'text-blue-600'
                      }`}>
                        More connections = smarter AI{user?.authMethod === 'webauthn' ? ' • Enterprise encryption' : ''}
                      </div>
                    </div>

                    <div className="space-y-3">
                      {connections.map((connection, index) => (
                        <CompactCard key={index}>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <div className={`w-3 h-3 rounded-full ${
                                connection.connected ? 'bg-green-500' : 'bg-gray-300'
                              }`}></div>
                              <div>
                                <div className="text-sm font-medium text-gray-900 capitalize flex items-center space-x-1">
                                  <span>{connection.service}</span>
                                  {user?.authMethod === 'webauthn' && connection.connected && (
                                    <Shield className="w-3 h-3 text-green-600" />
                                  )}
                                </div>
                                {connection.connected && (
                                  <div className="text-xs text-green-600">
                                    {connection.dataPoints} data points
                                    {user?.authMethod === 'webauthn' && (
                                      <span className="ml-1 text-green-700">• Encrypted</span>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                            <button
                              onClick={() => {
                                setConnections(prev => prev.map(conn => 
                                  conn.service === connection.service 
                                    ? { 
                                        ...conn, 
                                        connected: !conn.connected,
                                        lastSync: !conn.connected ? new Date() : null,
                                        dataPoints: !conn.connected ? Math.floor(Math.random() * 500 + 100) : 0,
                                        status: !conn.connected ? 'active' : 'disconnected',
                                        syncQuality: !conn.connected ? Math.floor(Math.random() * 30 + 70) : 0
                                      }
                                    : conn
                                ));
                                showNotification(
                                  'success',
                                  `${connection.service} ${connection.connected ? 'Disconnected' : 'Connected'}`,
                                  connection.connected 
                                    ? `${connection.service} data connection has been disconnected`
                                    : `AI started learning from ${connection.service}${user?.authMethod === 'webauthn' ? ' with enterprise encryption' : ''}`,
                                  'connections',
                                  'medium'
                                );
                              }}
                              className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                                connection.connected
                                  ? 'bg-red-50 text-red-600 hover:bg-red-100'
                                  : user?.authMethod === 'webauthn'
                                    ? 'bg-green-50 text-green-600 hover:bg-green-100'
                                    : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                              }`}
                            >
                              {connection.connected ? 'Disconnect' : 'Connect'}
                            </button>
                          </div>
                          
                          {connection.connected && (
                            <div className="space-y-2">
                              <div className="flex justify-between text-xs">
                                <span className="text-gray-500">Sync Quality</span>
                                <span className="font-medium text-gray-700">{connection.syncQuality}%</span>
                              </div>
                              <div className="w-full bg-gray-100 rounded-full h-1">
                                <div 
                                  className={`${
                                    user?.authMethod === 'webauthn' ? 'bg-green-500' : 'bg-blue-500'
                                  } h-1 rounded-full transition-all`} 
                                  style={{width: `${connection.syncQuality}%`}}
                                ></div>
                              </div>
                              {connection.insights.length > 0 && (
                                <div className="space-y-1">
                                  {connection.insights.map((insight, idx) => (
                                    <div key={idx} className={`text-xs ${
                                      user?.authMethod === 'webauthn'
                                        ? 'text-green-600 bg-green-50'
                                        : 'text-blue-600 bg-blue-50'
                                    } px-2 py-1 rounded`}>
                                      {insight}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </CompactCard>
                      ))}
                    </div>

                    <CompactCard className={`${
                      user?.authMethod === 'webauthn'
                        ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200'
                        : 'bg-gradient-to-r from-green-50 to-blue-50 border-green-200'
                    }`}>
                      <div className="text-center">
                        <h4 className="font-semibold text-gray-800 mb-2">🚀 Coming Soon</h4>
                        <div className="text-xs text-gray-600 space-y-1">
                          <div>• Figma • Linear • Asana</div>
                          <div>• Discord • Teams • Zoom</div>
                          <div>• Spotify • Apple Music</div>
                          {user?.authMethod === 'webauthn' && (
                            <div className="text-green-600 font-medium mt-2">+ Enterprise APIs</div>
                          )}
                        </div>
                      </div>
                    </CompactCard>
                  </div>
                )}
              </div>
            </div>
          </aside>
        )}

        {/* Enhanced Agent Passport Modal */}
        {showAgentPassport && (
          <>
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 z-50"
              onClick={() => setShowAgentPassport(false)}
            />
            
            <div className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:transform md:-translate-x-1/2 md:-translate-y-1/2 md:w-96 md:h-[600px] bg-gray-50 rounded-2xl shadow-2xl z-50 flex flex-col">
              {/* Enhanced Passport Header */}
              <div className={`flex items-center justify-between p-4 border-b border-gray-200 ${
                user?.authMethod === 'webauthn'
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600'
                  : 'bg-white'
              } rounded-t-2xl ${user?.authMethod === 'webauthn' ? 'text-white' : ''}`}>
                <div>
                  <h2 className="text-lg font-bold">
                    {user?.authMethod === 'webauthn' ? '🔐 Enterprise Agent Passport' : 'AI Agent Passport'}
                  </h2>
                  <p className="text-sm opacity-90">
                    {user?.authMethod === 'webauthn' ? 'Secured Digital Identity Certificate' : 'Digital Identity Certificate'}
                  </p>
                </div>
                <button
                  onClick={() => setShowAgentPassport(false)}
                  className={`p-2 rounded-lg ${
                    user?.authMethod === 'webauthn'
                      ? 'text-white hover:bg-white hover:bg-opacity-20'
                      : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Enhanced Passport Content */}
              <div className="flex-1 overflow-y-auto p-4">
                <CompactCard className={`${
                  user?.authMethod === 'webauthn'
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600'
                    : 'bg-gradient-to-r from-blue-500 to-purple-600'
                } text-white`}>
                  <div className="text-center py-4">
                    <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-2xl mx-auto mb-3 relative">
                      {agentProfile.avatar}
                      {user?.authMethod === 'webauthn' && (
                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                          <Shield className="w-3 h-3 text-yellow-900" />
                        </div>
                      )}
                    </div>
                    <h2 className="text-xl font-bold mb-1">{agentProfile.name}</h2>
                    <p className="text-sm opacity-90 mb-2">{agentProfile.type}</p>
                    <div className="flex justify-center space-x-4 text-sm">
                      <div>
                        <div className="font-bold">Level {agentProfile.level}</div>
                        <div className="opacity-75">Experience</div>
                      </div>
                      <div>
                        <div className="font-bold">{agentProfile.trustScore}%</div>
                        <div className="opacity-75">Trust Score</div>
                      </div>
                      <div>
                        <div className="font-bold">{agentProfile.stats.uptime}%</div>
                        <div className="opacity-75">Uptime</div>
                      </div>
                    </div>
                    {user?.authMethod === 'webauthn' && (
                      <div className="mt-3 text-xs bg-white bg-opacity-20 px-3 py-1 rounded-full">
                        🔐 Enterprise Security Active
                      </div>
                    )}
                  </div>
                </CompactCard>

                <div className="mt-4 space-y-3">
                  <CompactCard>
                    <h3 className="font-semibold text-gray-800 mb-2">🏆 Recent Achievements</h3>
                    <div className="space-y-2">
                      {agentProfile.recent.slice(0, 3).map((activity, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <div className={`w-2 h-2 ${
                            user?.authMethod === 'webauthn' ? 'bg-green-500' : 'bg-blue-500'
                          } rounded-full`}></div>
                          <span className="flex-1">{activity.title}</span>
                          <span className="text-xs text-gray-500">
                            {activity.timestamp.toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CompactCard>

                  <CompactCard>
                    <h3 className="font-semibold text-gray-800 mb-2">📈 Performance Stats</h3>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <div className={`font-bold ${
                          user?.authMethod === 'webauthn' ? 'text-green-600' : 'text-blue-600'
                        }`}>
                          {agentProfile.stats.successRate}%
                        </div>
                        <div className="text-gray-600">Success Rate</div>
                      </div>
                      <div>
                        <div className="font-bold text-green-600">{agentProfile.stats.responseTime}s</div>
                        <div className="text-gray-600">Avg Response</div>
                      </div>
                      <div>
                        <div className="font-bold text-purple-600">{Math.round(agentProfile.stats.interactions/1000)}K</div>
                        <div className="text-gray-600">Interactions</div>
                      </div>
                      <div>
                        <div className="font-bold text-orange-600">{Math.round(agentProfile.stats.solved/1000)}K</div>
                        <div className="text-gray-600">Problems Solved</div>
                      </div>
                    </div>
                  </CompactCard>

                  {/* WebAuthn 사용자 전용 정보 */}
                  {user?.authMethod === 'webauthn' && (
                    <CompactCard className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
                      <h3 className="font-semibold text-green-800 mb-2">🔐 Enterprise Security</h3>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-white p-2 rounded text-center">
                          <div className="font-bold text-green-600">{user.trustScore}%</div>
                          <div className="text-gray-600">Trust Score</div>
                        </div>
                        <div className="bg-white p-2 rounded text-center">
                          <div className="font-bold text-green-600">SSS</div>
                          <div className="text-gray-600">Security Level</div>
                        </div>
                        <div className="bg-white p-2 rounded text-center">
                          <div className="font-bold text-green-600">✓</div>
                          <div className="text-gray-600">DID Verified</div>
                        </div>
                        <div className="bg-white p-2 rounded text-center">
                          <div className="font-bold text-green-600">100+</div>
                          <div className="text-gray-600">Languages</div>
                        </div>
                      </div>
                    </CompactCard>
                  )}
                </div>
              </div>

              {/* Enhanced Passport Footer */}
              <div className="bg-white p-4 rounded-b-2xl border-t border-gray-200">
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <div>ID: {agentProfile.passportNo}</div>
                  <div className="flex items-center gap-1">
                    <div className={`w-2 h-2 ${
                      user?.authMethod === 'webauthn' ? 'bg-green-500' : 'bg-blue-500'
                    } rounded-full`}></div>
                    <span>
                      {user?.authMethod === 'webauthn' ? 'Enterprise Verified & Active' : 'Verified & Active'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default EnhancedProductionDashboard;