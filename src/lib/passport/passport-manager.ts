// =============================================================================
// 🎯 AI Passport 통합 관리자 (SSR 호환)
// =============================================================================

import { UnifiedAIPassport, UnifiedDataVault, ConnectedPlatform } from '@/types/passport/unified-passport';

// Mock 데이터
const createMockPassport = (): UnifiedAIPassport => ({
  did: 'did:cue:0x742d35Cc6460C532FAEcE1dd25073C8d2FCAE857',
  walletAddress: '0x742d35Cc6460C532FAEcE1dd25073C8d2FCAE857',
  passkeyRegistered: true,
  trustScore: 96.8,
  cueTokens: 15428,
  registrationStatus: 'complete',
  biometricVerified: true,
  passportLevel: 'Verified',
  personalityProfile: {
    type: 'INTJ-A (Architect)',
    communicationStyle: 'Direct & Technical',
    learningPattern: 'Visual + Hands-on',
    workingStyle: 'Morning Focus, Deep Work',
    responsePreference: 'Concise with examples',
    decisionMaking: 'Data-driven analysis'
  },
  dataVaults: [
    {
      id: 'vault-1',
      name: '전문 개발 지식',
      category: 'professional',
      description: '코딩, 아키텍처, 기술 스택 관련 전문성',
      dataCount: 247,
      cueCount: 89,
      encrypted: true,
      lastUpdated: new Date(),
      accessLevel: 'private',
      value: 1250,
      dataPoints: [
        { key: 'primary_languages', value: ['TypeScript', 'React', 'Node.js'], source: 'chatgpt-cue-mining' },
        { key: 'architecture_preference', value: 'Component composition over inheritance', source: 'claude-analysis' },
        { key: 'recent_interests', value: ['Zustand', 'TanStack Query', 'Vite'], source: 'gemini-conversation' },
        { key: 'testing_approach', value: 'Jest + Testing Library, 80% coverage', source: 'discord-discussion' }
      ],
      usageCount: 156,
      sourceplatforms: ['ChatGPT', 'Claude', 'Discord']
    },
    {
      id: 'vault-2',
      name: '학습 및 행동 패턴',
      category: 'behavioral',
      description: '의사결정 스타일, 학습 방식, 작업 패턴 분석',
      dataCount: 189,
      cueCount: 67,
      encrypted: true,
      lastUpdated: new Date(),
      accessLevel: 'selective',
      value: 945,
      dataPoints: [
        { key: 'decision_style', value: 'data-driven, asks for specific examples', source: 'conversation-analysis' },
        { key: 'learning_style', value: 'hands-on with documentation, prefers examples', source: 'chatgpt-pattern' },
        { key: 'work_pattern', value: 'morning focus blocks, afternoon collaboration', source: 'claude-schedule-analysis' },
        { key: 'problem_solving', value: 'breaks down into smaller parts', source: 'task-pattern-analysis' }
      ],
      usageCount: 89,
      sourceplatforms: ['ChatGPT', 'Claude']
    },
    {
      id: 'vault-3',
      name: '커뮤니케이션 스타일',
      category: 'social',
      description: '대화 톤, 선호 응답 형식, 소통 패턴',
      dataCount: 156,
      cueCount: 43,
      encrypted: true,
      lastUpdated: new Date(),
      accessLevel: 'shared',
      value: 780,
      dataPoints: [
        { key: 'tone', value: 'direct, professional, technical', source: 'claude-conversation-mining' },
        { key: 'response_length', value: 'concise (avg 2-3 sentences)', source: 'preference-analysis' },
        { key: 'greeting_style', value: 'casual but respectful', source: 'message-pattern' },
        { key: 'technical_level', value: 'uses technical terms freely', source: 'content-analysis' }
      ],
      usageCount: 67,
      sourceplatforms: ['Claude', 'Discord']
    }
  ],
  connectedPlatforms: [
    { 
      id: 'chatgpt', 
      name: 'ChatGPT', 
      connected: true, 
      lastSync: new Date(), 
      cueCount: 89, 
      contextMined: 156, 
      status: 'active',
      icon: '🤖',
      color: 'green'
    },
    { 
      id: 'claude', 
      name: 'Claude', 
      connected: true, 
      lastSync: new Date(), 
      cueCount: 67, 
      contextMined: 134, 
      status: 'active',
      icon: '🧠',
      color: 'blue'
    },
    { 
      id: 'gemini', 
      name: 'Gemini', 
      connected: false, 
      lastSync: new Date(), 
      cueCount: 0, 
      contextMined: 0, 
      status: 'error',
      icon: '💎',
      color: 'red',
      connectionSteps: ['Google 계정 인증', 'API 키 설정', '권한 승인', '동기화 테스트']
    },
    { 
      id: 'discord', 
      name: 'Discord', 
      connected: false, 
      lastSync: new Date(), 
      cueCount: 0, 
      contextMined: 0, 
      status: 'error',
      icon: '💬',
      color: 'purple',
      connectionSteps: ['Discord 봇 설치', '서버 권한 설정', '채널 선택', '활성화']
    }
  ],
  contextHistory: [],
  cueHistory: [],
  personalizedAgents: [
    {
      id: 'agent-coding-master',
      name: 'CodeMaster Pro',
      type: 'coding',
      description: '내 코딩 스타일과 선호 기술스택에 최적화된 개발 전문 에이전트',
      checkpoint: 'checkpoint_v2.3.1_20250126',
      trainingStatus: 'ready',
      trainingProgress: 100,
      accuracy: 94.7,
      totalTrainingTime: 8.5,
      datasetSize: 15420,
      lastTrained: new Date('2025-01-26'),
      usageCount: 234,
      specialties: ['TypeScript', 'React', 'Node.js', 'System Architecture', 'Code Review'],
      modelVersion: 'GPT-4o-mini-finetune',
      personalityWeights: {
        'technical_depth': 0.9,
        'code_quality': 0.95,
        'explanation_style': 0.8,
        'problem_solving': 0.92
      },
      performanceMetrics: {
        responseTime: 1.2,
        userSatisfaction: 4.8,
        taskSuccess: 0.94,
        adaptability: 0.87
      },
      checkpointHistory: [
        {
          id: 'cp-001',
          version: 'v2.3.1',
          timestamp: new Date('2025-01-26'),
          accuracy: 94.7,
          loss: 0.032,
          dataSize: 15420,
          description: 'INTJ-A 개성 + TypeScript 전문성 강화',
          isActive: true
        }
      ]
    },
    {
      id: 'agent-creative-writer',
      name: 'Creative Spark',
      type: 'creative',
      description: '내 글쓰기 스타일과 창의적 사고를 학습한 창작 전문 에이전트',
      checkpoint: 'checkpoint_v1.8.2_20250125',
      trainingStatus: 'ready',
      trainingProgress: 100,
      accuracy: 89.3,
      totalTrainingTime: 6.2,
      datasetSize: 8930,
      lastTrained: new Date('2025-01-25'),
      usageCount: 156,
      specialties: ['기술 블로그', '문서 작성', '창의적 글쓰기', '마케팅 카피', 'UX 라이팅'],
      modelVersion: 'Claude-3.5-Sonnet-finetune',
      personalityWeights: {
        'creativity': 0.95,
        'tone_matching': 0.88,
        'structure': 0.82,
        'engagement': 0.91
      },
      performanceMetrics: {
        responseTime: 2.1,
        userSatisfaction: 4.6,
        taskSuccess: 0.89,
        adaptability: 0.93
      },
      checkpointHistory: [
        {
          id: 'cp-003',
          version: 'v1.8.2',
          timestamp: new Date('2025-01-25'),
          accuracy: 89.3,
          loss: 0.058,
          dataSize: 8930,
          description: '개인 글쓰기 톤앤매너 + 기술 문서 스타일',
          isActive: true
        }
      ]
    }
  ]
});

// 브라우저 환경 체크 함수
const isBrowser = () => typeof window !== 'undefined';

export class PassportManager {
  private passport: UnifiedAIPassport | null = null;
  private initialized = false;

  constructor() {
    // SSR에서는 초기화하지 않음
    if (isBrowser()) {
      this.loadPassport();
    }
  }

  private loadPassport(): void {
    try {
      if (!isBrowser()) {
        // SSR 환경에서는 Mock 데이터만 반환
        this.passport = createMockPassport();
        return;
      }

      const stored = localStorage.getItem('unified-passport');
      if (stored) {
        this.passport = JSON.parse(stored);
        // 날짜 객체 복원
        this.passport = this.restoreDates(this.passport);
      } else {
        // 첫 실행시 Mock 데이터 생성
        this.passport = createMockPassport();
        this.savePassport();
      }
      this.initialized = true;
    } catch (error) {
      console.warn('PassportManager: localStorage 접근 실패, Mock 데이터 사용');
      this.passport = createMockPassport();
      this.initialized = true;
    }
  }

  private restoreDates(passport: any): UnifiedAIPassport {
    // JSON에서 복원된 Date 문자열들을 다시 Date 객체로 변환
    if (passport.dataVaults) {
      passport.dataVaults.forEach((vault: any) => {
        vault.lastUpdated = new Date(vault.lastUpdated);
        vault.dataPoints.forEach((point: any) => {
          if (point.timestamp) {
            point.timestamp = new Date(point.timestamp);
          }
        });
      });
    }
    
    if (passport.connectedPlatforms) {
      passport.connectedPlatforms.forEach((platform: any) => {
        platform.lastSync = new Date(platform.lastSync);
      });
    }
    
    if (passport.personalizedAgents) {
      passport.personalizedAgents.forEach((agent: any) => {
        agent.lastTrained = new Date(agent.lastTrained);
        agent.checkpointHistory.forEach((checkpoint: any) => {
          checkpoint.timestamp = new Date(checkpoint.timestamp);
        });
      });
    }
    
    return passport;
  }

  public savePassport(): void {
    if (this.passport && isBrowser()) {
      try {
        localStorage.setItem('unified-passport', JSON.stringify(this.passport));
      } catch (error) {
        console.warn('PassportManager: localStorage 저장 실패');
      }
    }
  }

  public getPassport(): UnifiedAIPassport | null {
    if (!this.initialized && isBrowser()) {
      this.loadPassport();
    }
    return this.passport || createMockPassport();
  }

  public updateTrustScore(newScore: number): void {
    if (this.passport) {
      this.passport.trustScore = newScore;
      this.savePassport();
    }
  }

  public addCueTokens(amount: number, reason: string): void {
    if (this.passport) {
      this.passport.cueTokens += amount;
      this.passport.cueHistory.push({
        id: Date.now().toString(),
        amount,
        type: 'earned',
        timestamp: new Date(),
        description: reason
      });
      this.savePassport();
    }
  }

  public updateDataVault(vaultId: string, updates: Partial<UnifiedDataVault>): void {
    if (this.passport) {
      const vaultIndex = this.passport.dataVaults.findIndex(v => v.id === vaultId);
      if (vaultIndex !== -1) {
        this.passport.dataVaults[vaultIndex] = {
          ...this.passport.dataVaults[vaultIndex],
          ...updates,
          lastUpdated: new Date()
        };
        this.savePassport();
      }
    }
  }

  public connectPlatform(platform: ConnectedPlatform): void {
    if (this.passport) {
      const existingIndex = this.passport.connectedPlatforms.findIndex(p => p.id === platform.id);
      if (existingIndex !== -1) {
        this.passport.connectedPlatforms[existingIndex] = platform;
      } else {
        this.passport.connectedPlatforms.push(platform);
      }
      this.savePassport();
    }
  }
}

export const passportManager = new PassportManager();
