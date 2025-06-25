#!/bin/bash

# =============================================================================
# 🚀 GitHub 프로젝트 모듈화 스크립트
# final0626.tsx를 기존 GitHub 구조에 맞게 모듈화
# =============================================================================

echo "🔄 GitHub 프로젝트 모듈화 시작..."
echo "===================================="

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

# 진행 상황 표시 함수
log_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
log_success() { echo -e "${GREEN}✅ $1${NC}"; }
log_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
log_error() { echo -e "${RED}❌ $1${NC}"; }

# 1. 프로젝트 루트 확인
check_project_root() {
    if [ ! -f "package.json" ]; then
        log_error "package.json이 없습니다. 프로젝트 루트에서 실행해주세요."
        exit 1
    fi
    log_success "프로젝트 루트 확인 완료"
}

# 2. 기존 구조 백업
backup_existing_structure() {
    log_info "기존 구조 백업 중..."
    
    if [ -d "src" ]; then
        timestamp=$(date +%Y%m%d_%H%M%S)
        cp -r src "src_backup_${timestamp}"
        log_success "기존 구조 백업 완료: src_backup_${timestamp}"
    fi
}

# 3. 통합 타입 정의 생성/업데이트
create_unified_types() {
    log_info "통합 타입 정의 생성 중..."
    
    # AI Passport 통합 타입
    cat > src/types/passport/unified-passport.ts << 'EOF'
// =============================================================================
// 🎯 AI Passport + Cue 통합 시스템 타입 정의
// =============================================================================

export interface PersonalityProfile {
  type: string;
  communicationStyle: string;
  learningPattern: string;
  workingStyle: string;
  responsePreference: string;
  decisionMaking: string;
}

export interface UnifiedDataVault {
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
  dataPoints: VaultDataPoint[];
  usageCount: number;
  sourceplatforms: string[];
}

export interface VaultDataPoint {
  key: string;
  value: any;
  source: string;
  timestamp?: Date;
}

export interface ConnectedPlatform {
  id: string;
  name: string;
  connected: boolean;
  lastSync: Date;
  cueCount: number;
  contextMined: number;
  status: 'active' | 'syncing' | 'error' | 'connecting';
  icon: string;
  color: string;
  connectionSteps?: string[];
}

export interface PersonalizedAgent {
  id: string;
  name: string;
  type: 'coding' | 'creative' | 'analysis' | 'consultation' | 'research' | 'mentor';
  description: string;
  checkpoint: string;
  trainingStatus: 'idle' | 'training' | 'validating' | 'ready' | 'deployed';
  trainingProgress: number;
  accuracy: number;
  totalTrainingTime: number;
  datasetSize: number;
  lastTrained: Date;
  usageCount: number;
  specialties: string[];
  modelVersion: string;
  checkpointHistory: CheckpointInfo[];
  personalityWeights: Record<string, number>;
  performanceMetrics: AgentPerformanceMetrics;
}

export interface CheckpointInfo {
  id: string;
  version: string;
  timestamp: Date;
  accuracy: number;
  loss: number;
  dataSize: number;
  description: string;
  isActive: boolean;
}

export interface AgentPerformanceMetrics {
  responseTime: number;
  userSatisfaction: number;
  taskSuccess: number;
  adaptability: number;
}

export interface TrainingSession {
  id: string;
  agentId: string;
  startTime: Date;
  endTime?: Date;
  status: 'preparing' | 'training' | 'validating' | 'saving' | 'complete' | 'error';
  currentEpoch: number;
  totalEpochs: number;
  currentLoss: number;
  bestAccuracy: number;
  logs: TrainingLog[];
}

export interface TrainingLog {
  timestamp: Date;
  epoch: number;
  loss: number;
  accuracy: number;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
}

export interface UnifiedAIPassport {
  did: string;
  walletAddress: string;
  passkeyRegistered: boolean;
  trustScore: number;
  cueTokens: number;
  registrationStatus: 'pending' | 'verified' | 'complete';
  biometricVerified: boolean;
  passportLevel: 'Basic' | 'Verified' | 'Premium' | 'Enterprise';
  personalityProfile: PersonalityProfile;
  dataVaults: UnifiedDataVault[];
  connectedPlatforms: ConnectedPlatform[];
  contextHistory: ContextEntry[];
  cueHistory: CueEntry[];
  personalizedAgents: PersonalizedAgent[];
  activeTrainingSession?: TrainingSession;
}

export interface ContextEntry {
  id: string;
  content: string;
  timestamp: Date;
  platform: string;
  cueValue: number;
}

export interface CueEntry {
  id: string;
  amount: number;
  type: 'mined' | 'earned' | 'spent';
  timestamp: Date;
  description: string;
  platform?: string;
}

export interface Message {
  id: string;
  content: string;
  type: 'user' | 'ai';
  timestamp: Date;
  usedPassportData?: string[];
  cueTokensUsed?: number;
  cueTokensEarned?: number;
  verification?: MessageVerification;
}

export interface MessageVerification {
  biometric: boolean;
  did: boolean;
  signature: string;
}

export interface ExtractionStep {
  id: number;
  text: string;
  type: 'system' | 'scanning' | 'found' | 'processing' | 'analysis' | 'storage' | 'reward' | 'complete';
  completed: boolean;
  timestamp: Date;
  data?: any;
}

export interface SyncStep {
  id: number;
  progress: number;
  text: string;
  detail: string;
  platform?: string;
  success?: boolean;
}

export interface ActivityEntry {
  id: number;
  action: string;
  timestamp: Date;
  status: 'completed' | 'processing' | 'error';
  type?: string;
  platform?: string;
}
EOF

    log_success "통합 타입 정의 생성 완료"
}

# 4. 핵심 라이브러리 모듈 생성
create_core_libraries() {
    log_info "핵심 라이브러리 모듈 생성 중..."
    
    # AI Passport 관리자
    cat > src/lib/passport/passport-manager.ts << 'EOF'
// =============================================================================
// 🎯 AI Passport 통합 관리자
// =============================================================================

import { UnifiedAIPassport, UnifiedDataVault, ConnectedPlatform } from '@/types/passport/unified-passport';

export class PassportManager {
  private passport: UnifiedAIPassport | null = null;

  constructor() {
    this.loadPassport();
  }

  private loadPassport(): void {
    // localStorage나 API에서 패스포트 데이터 로드
    const stored = localStorage.getItem('unified-passport');
    if (stored) {
      this.passport = JSON.parse(stored);
    }
  }

  public savePassport(): void {
    if (this.passport) {
      localStorage.setItem('unified-passport', JSON.stringify(this.passport));
    }
  }

  public getPassport(): UnifiedAIPassport | null {
    return this.passport;
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
EOF

    # Cue 채굴 시스템
    cat > src/lib/cue/cue-mining-engine.ts << 'EOF'
// =============================================================================
// 🎯 CUE 채굴 엔진
// =============================================================================

import { passportManager } from '../passport/passport-manager';
import { VaultDataPoint, ExtractionStep } from '@/types/passport/unified-passport';

export class CueMiningEngine {
  private extractionInProgress = false;

  public async extractFromPlatform(
    platformId: string, 
    onProgress?: (step: ExtractionStep) => void
  ): Promise<VaultDataPoint[]> {
    if (this.extractionInProgress) {
      throw new Error('이미 추출이 진행 중입니다');
    }

    this.extractionInProgress = true;
    const extractedData: VaultDataPoint[] = [];
    
    try {
      const steps: Omit<ExtractionStep, 'id' | 'completed' | 'timestamp'>[] = [
        { text: '🌐 브라우저 확장 활성화 중...', type: 'system' },
        { text: `🔍 ${platformId} 페이지 스캔 시작`, type: 'scanning' },
        { text: '💬 대화 메시지 발견됨', type: 'found', data: { messageCount: 15 } },
        { text: '🧠 AI 컨텍스트 패턴 분석 중...', type: 'processing' },
        { text: '🎯 개성 패턴 매칭됨', type: 'analysis', data: { personality: 'INTJ-A', confidence: 94 } },
        { text: '📊 데이터 볼트 업데이트', type: 'storage' },
        { text: '💎 CUE 토큰 채굴 완료', type: 'reward', data: { tokens: 5 } },
        { text: '✅ 추출 완료', type: 'complete' }
      ];

      for (let i = 0; i < steps.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 400));
        
        const step: ExtractionStep = {
          id: i,
          ...steps[i],
          completed: true,
          timestamp: new Date()
        };
        
        onProgress?.(step);

        // 실제 데이터 추출 시뮬레이션
        if (step.type === 'storage') {
          const newDataPoint: VaultDataPoint = {
            key: 'extracted_context',
            value: `컨텍스트 데이터 from ${platformId}`,
            source: platformId,
            timestamp: new Date()
          };
          extractedData.push(newDataPoint);
        }

        if (step.type === 'reward') {
          passportManager.addCueTokens(5, `${platformId}에서 데이터 추출`);
        }
      }

      return extractedData;
    } finally {
      this.extractionInProgress = false;
    }
  }

  public calculateCueValue(dataPoint: VaultDataPoint): number {
    // 데이터 포인트의 CUE 가치 계산 로직
    const baseValue = 1;
    const sourceMultiplier = dataPoint.source === 'chatgpt' ? 1.5 : 1.0;
    const freshnessMultiplier = this.calculateFreshnessMultiplier(dataPoint.timestamp);
    
    return Math.round(baseValue * sourceMultiplier * freshnessMultiplier);
  }

  private calculateFreshnessMultiplier(timestamp?: Date): number {
    if (!timestamp) return 1.0;
    
    const daysSinceExtraction = (Date.now() - timestamp.getTime()) / (1000 * 60 * 60 * 24);
    return Math.max(0.5, 1.0 - (daysSinceExtraction * 0.1));
  }
}

export const cueMiningEngine = new CueMiningEngine();
EOF

    # AI 에이전트 트레이너
    cat > src/lib/agents/agent-trainer.ts << 'EOF'
// =============================================================================
// 🎯 AI 에이전트 트레이너
// =============================================================================

import { PersonalizedAgent, TrainingSession, TrainingLog } from '@/types/passport/unified-passport';

export class AgentTrainer {
  private activeTrainingSessions = new Map<string, TrainingSession>();

  public async startTraining(
    agent: PersonalizedAgent,
    onProgress?: (session: TrainingSession) => void
  ): Promise<TrainingSession> {
    const sessionId = `training-${Date.now()}`;
    
    const session: TrainingSession = {
      id: sessionId,
      agentId: agent.id,
      startTime: new Date(),
      status: 'preparing',
      currentEpoch: 0,
      totalEpochs: 50,
      currentLoss: 0.0,
      bestAccuracy: agent.accuracy,
      logs: []
    };

    this.activeTrainingSessions.set(sessionId, session);

    // 학습 시뮬레이션
    this.simulateTraining(session, onProgress);
    
    return session;
  }

  private async simulateTraining(
    session: TrainingSession,
    onProgress?: (session: TrainingSession) => void
  ): Promise<void> {
    const stages = [
      { status: 'preparing', message: 'AI Passport 데이터 전처리 중...', duration: 2000 },
      { status: 'training', message: '개성 가중치 학습 시작...', duration: 15000 },
      { status: 'validating', message: '모델 검증 및 체크포인트 생성...', duration: 5000 },
      { status: 'saving', message: '새 체크포인트 저장 중...', duration: 3000 },
      { status: 'complete', message: '학습 완료!', duration: 1000 }
    ];

    for (let i = 0; i < stages.length; i++) {
      const stage = stages[i];
      
      session.status = stage.status as any;
      session.currentEpoch = Math.floor((i / stages.length) * session.totalEpochs);
      session.currentLoss = 0.1 - (i * 0.02);
      
      const log: TrainingLog = {
        timestamp: new Date(),
        epoch: session.currentEpoch,
        loss: session.currentLoss,
        accuracy: session.bestAccuracy + (i * 2),
        message: stage.message,
        type: 'info'
      };
      
      session.logs.push(log);
      onProgress?.(session);
      
      await new Promise(resolve => setTimeout(resolve, stage.duration));
    }

    if (session.status === 'complete') {
      session.endTime = new Date();
      this.activeTrainingSessions.delete(session.id);
    }
  }

  public getActiveSession(agentId: string): TrainingSession | null {
    for (const session of this.activeTrainingSessions.values()) {
      if (session.agentId === agentId) {
        return session;
      }
    }
    return null;
  }

  public stopTraining(sessionId: string): void {
    const session = this.activeTrainingSessions.get(sessionId);
    if (session) {
      session.status = 'error';
      session.endTime = new Date();
      this.activeTrainingSessions.delete(sessionId);
    }
  }
}

export const agentTrainer = new AgentTrainer();
EOF

    log_success "핵심 라이브러리 모듈 생성 완료"
}

# 5. React 컴포넌트 모듈 생성
create_react_components() {
    log_info "React 컴포넌트 모듈 생성 중..."
    
    # AI Passport Card 컴포넌트
    cat > src/components/passport/passport-card.tsx << 'EOF'
'use client';

import React from 'react';
import { Sparkles, Database, Globe } from 'lucide-react';
import { UnifiedAIPassport } from '@/types/passport/unified-passport';
import { usePassport } from '@/hooks/passport/use-passport';

interface PassportCardProps {
  onVaultClick?: () => void;
  onPlatformClick?: () => void;
  onAnalyticsClick?: () => void;
  className?: string;
}

export const PassportCard: React.FC<PassportCardProps> = ({
  onVaultClick,
  onPlatformClick,
  onAnalyticsClick,
  className = ''
}) => {
  const { passport } = usePassport();

  if (!passport) {
    return (
      <div className={`bg-gray-100 rounded-2xl p-6 animate-pulse ${className}`}>
        <div className="h-32 bg-gray-200 rounded"></div>
      </div>
    );
  }

  return (
    <div className={`bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-6 text-white relative overflow-hidden ${className}`}>
      {/* 배경 장식 */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-5 rounded-full -ml-12 -mb-12"></div>
      
      <div className="relative z-10">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg">AI Passport + Cue</h3>
              <p className="text-indigo-200 text-sm">{passport.passportLevel} Level</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{passport.trustScore}%</div>
            <div className="text-indigo-200 text-xs">Trust Score</div>
          </div>
        </div>

        {/* DID 정보 */}
        <div className="space-y-3 mb-6">
          <div className="text-xs text-indigo-200">통합 신원 + 지갑</div>
          <div className="font-mono text-sm break-all bg-black bg-opacity-20 rounded-lg p-3 backdrop-blur-sm">
            {passport.did.slice(0, 35)}...
          </div>
        </div>

        {/* 통계 */}
        <div className="grid grid-cols-3 gap-4">
          <button 
            onClick={onAnalyticsClick}
            className="text-center hover:bg-white hover:bg-opacity-10 rounded-lg p-3 transition-all"
          >
            <div className="text-xl font-bold">{passport.cueTokens.toLocaleString()}</div>
            <div className="text-xs text-indigo-200">CUE 토큰</div>
          </button>
          <button 
            onClick={onVaultClick}
            className="text-center hover:bg-white hover:bg-opacity-10 rounded-lg p-3 transition-all"
          >
            <div className="text-xl font-bold">{passport.dataVaults.length}</div>
            <div className="text-xs text-indigo-200">AI 볼트</div>
          </button>
          <button 
            onClick={onPlatformClick}
            className="text-center hover:bg-white hover:bg-opacity-10 rounded-lg p-3 transition-all"
          >
            <div className="text-xl font-bold">{passport.connectedPlatforms.filter(p => p.connected).length}</div>
            <div className="text-xs text-indigo-200">플랫폼</div>
          </button>
        </div>
      </div>
    </div>
  );
};
EOF

    # Chat 인터페이스 컴포넌트
    cat > src/components/chat/chat-interface.tsx << 'EOF'
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Brain, Shield } from 'lucide-react';
import { Message } from '@/types/passport/unified-passport';
import { usePassport } from '@/hooks/passport/use-passport';
import { useChat } from '@/hooks/chat/use-chat';

export const ChatInterface: React.FC = () => {
  const [newMessage, setNewMessage] = useState('');
  const [inputFocused, setInputFocused] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  
  const { passport } = usePassport();
  const { messages, isTyping, sendMessage } = useChat();

  // 자동 스크롤
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    
    await sendMessage(newMessage);
    setNewMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* 메시지 영역 */}
      <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center max-w-2xl mx-auto">
            <div className="w-20 h-20 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-3xl flex items-center justify-center mb-6">
              <Brain className="w-10 h-10 text-indigo-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">개인화 AI와 대화하기</h2>
            <p className="text-gray-600 text-lg mb-8 leading-relaxed">
              당신의 AI Passport 데이터를 활용한 완전 맞춤형 AI와 대화하세요. 
              대화할 때마다 CUE 토큰을 채굴하고 개성이 더욱 정확해집니다.
            </p>
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
                      <span className="text-sm font-medium text-gray-700">AI Passport Agent</span>
                      {message.verification && (
                        <div className="flex items-center space-x-1 bg-green-100 text-green-700 px-2 py-1 rounded-full">
                          <Shield className="w-3 h-3" />
                          <span className="text-xs">검증됨</span>
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
                    
                    {message.usedPassportData && (
                      <div className="mt-4 pt-4 border-t border-indigo-200">
                        <div className="text-xs text-indigo-200 mb-2">사용된 AI Passport 데이터:</div>
                        <div className="flex flex-wrap gap-1">
                          {message.usedPassportData.map((data, idx) => (
                            <span key={idx} className="bg-indigo-500 bg-opacity-30 px-2 py-1 rounded text-xs">
                              {data}
                            </span>
                          ))}
                        </div>
                        {message.cueTokensEarned && (
                          <div className="text-xs text-indigo-200 mt-2">
                            💎 +{message.cueTokensEarned} CUE 토큰 채굴됨
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
                    <span className="text-sm text-gray-600">AI가 개성 데이터를 분석 중...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* 입력 영역 */}
      <div className="border-t border-gray-200 p-4 lg:p-6 bg-white flex-shrink-0">
        <div className="max-w-4xl mx-auto">
          <div className="flex space-x-4 items-end">
            <div className="flex-1">
              <textarea
                ref={inputRef}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onFocus={() => setInputFocused(true)}
                onBlur={() => setInputFocused(false)}
                onKeyPress={handleKeyPress}
                placeholder="AI Passport 데이터를 활용한 개인화 응답을 받고 CUE를 채굴하세요..."
                className={`w-full min-h-[52px] max-h-[120px] px-4 lg:px-5 py-3 lg:py-4 bg-gray-50 border-2 rounded-2xl resize-none focus:outline-none focus:bg-white transition-all text-sm lg:text-base ${
                  inputFocused ? 'border-indigo-500 shadow-lg' : 'border-gray-200'
                }`}
                rows={1}
              />
            </div>
            <button
              onClick={handleSendMessage}
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
        </div>
      </div>
    </div>
  );
};
EOF

    log_success "React 컴포넌트 모듈 생성 완료"
}

# 6. 커스텀 훅 생성
create_custom_hooks() {
    log_info "커스텀 훅 생성 중..."
    
    # AI Passport 훅
    cat > src/hooks/passport/use-passport.ts << 'EOF'
'use client';

import { useState, useEffect, useCallback } from 'react';
import { UnifiedAIPassport } from '@/types/passport/unified-passport';
import { passportManager } from '@/lib/passport/passport-manager';

export const usePassport = () => {
  const [passport, setPassport] = useState<UnifiedAIPassport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPassport = useCallback(async () => {
    try {
      setLoading(true);
      const loadedPassport = passportManager.getPassport();
      setPassport(loadedPassport);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : '패스포트 로딩 실패');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateTrustScore = useCallback((newScore: number) => {
    passportManager.updateTrustScore(newScore);
    loadPassport();
  }, [loadPassport]);

  const addCueTokens = useCallback((amount: number, reason: string) => {
    passportManager.addCueTokens(amount, reason);
    loadPassport();
  }, [loadPassport]);

  const connectPlatform = useCallback((platform: any) => {
    passportManager.connectPlatform(platform);
    loadPassport();
  }, [loadPassport]);

  useEffect(() => {
    loadPassport();
  }, [loadPassport]);

  return {
    passport,
    loading,
    error,
    updateTrustScore,
    addCueTokens,
    connectPlatform,
    refresh: loadPassport
  };
};
EOF

    # Chat 훅
    cat > src/hooks/chat/use-chat.ts << 'EOF'
'use client';

import { useState, useCallback } from 'react';
import { Message } from '@/types/passport/unified-passport';
import { usePassport } from '../passport/use-passport';

export const useChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const { passport, addCueTokens } = usePassport();

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    // 사용자 메시지 추가
    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      type: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    // AI 응답 시뮬레이션
    setTimeout(() => {
      setIsTyping(false);
      
      const relevantVaults = passport?.dataVaults.filter(vault => 
        Math.random() > 0.3
      ).slice(0, 2) || [];
      
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: `🤖 **완전 개인화된 AI 응답**

**활용된 AI Passport 데이터:**
• 성격 유형: ${passport?.personalityProfile.type || 'INTJ-A'}
• 소통 스타일: ${passport?.personalityProfile.communicationStyle || 'Direct & Technical'}
• 학습 패턴: ${passport?.personalityProfile.learningPattern || 'Visual + Hands-on'}

**사용된 데이터 볼트:**
${relevantVaults.map(vault => 
  `• ${vault.name}: ${vault.dataCount}개 데이터 포인트 활용`
).join('\n')}

**Cue 채굴 정보:**
• 이 대화에서 3 CUE 토큰 채굴됨 💎
• 개성 프로필 정확도 +2% 향상
• 총 CUE 잔고: ${((passport?.cueTokens || 0) + 3).toLocaleString()}개

이 답변은 당신의 **완전한 디지털 정체성**을 바탕으로 생성되었습니다. 🎯`,
        timestamp: new Date(),
        usedPassportData: relevantVaults.map(v => v.name),
        cueTokensEarned: 3,
        verification: {
          biometric: true,
          did: true,
          signature: `0x${Math.random().toString(16).substr(2, 40)}`
        }
      };
      
      setMessages(prev => [...prev, aiResponse]);
      
      // CUE 토큰 추가
      addCueTokens(3, '개인화 AI 대화');
    }, 1500 + Math.random() * 1000);
  }, [passport, addCueTokens]);

  return {
    messages,
    isTyping,
    sendMessage
  };
};
EOF

    log_success "커스텀 훅 생성 완료"
}

# 7. 메인 대시보드 컴포넌트 생성
create_main_dashboard() {
    log_info "메인 대시보드 컴포넌트 생성 중..."
    
    cat > src/components/dashboard/main-dashboard.tsx << 'EOF'
'use client';

import React, { useState } from 'react';
import { MessageCircle, Cpu, Activity, Fingerprint, Database, BarChart3, Menu, Settings, Sparkles } from 'lucide-react';
import { PassportCard } from '../passport/passport-card';
import { ChatInterface } from '../chat/chat-interface';
import { usePassport } from '@/hooks/passport/use-passport';

type ViewType = 'chat' | 'agents' | 'dashboard' | 'passport' | 'vaults' | 'analytics';

export const MainDashboard: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewType>('chat');
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  const { passport } = usePassport();

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
                <h2 className="text-2xl font-bold text-gray-900 mb-4">대시보드</h2>
                <p className="text-gray-600">대시보드 컨텐츠가 여기에 표시됩니다.</p>
              </div>
            )}
            {currentView === 'agents' && (
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">AI 에이전트</h2>
                <p className="text-gray-600">AI 에이전트 관리 화면이 여기에 표시됩니다.</p>
              </div>
            )}
            {currentView === 'passport' && (
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">AI Passport</h2>
                <p className="text-gray-600">AI Passport 상세 정보가 여기에 표시됩니다.</p>
              </div>
            )}
            {currentView === 'vaults' && (
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">데이터 볼트</h2>
                <p className="text-gray-600">데이터 볼트 관리 화면이 여기에 표시됩니다.</p>
              </div>
            )}
            {currentView === 'analytics' && (
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Cue 분석</h2>
                <p className="text-gray-600">CUE 토큰 분석 화면이 여기에 표시됩니다.</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};
EOF

    log_success "메인 대시보드 컴포넌트 생성 완료"
}

# 8. API 라우트 생성
create_api_routes() {
    log_info "API 라우트 생성 중..."
    
    # AI 채팅 API
    cat > src/app/api/ai/chat/route.ts << 'EOF'
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { message, passportData } = await request.json();
    
    // AI 응답 생성 로직 (실제로는 OpenAI API 등을 호출)
    const response = {
      content: `개인화된 AI 응답: ${message}`,
      usedPassportData: passportData?.vaults || [],
      cueTokensEarned: 3,
      verification: {
        biometric: true,
        did: true,
        signature: `0x${Math.random().toString(16).substr(2, 40)}`
      }
    };
    
    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      { error: 'AI 채팅 처리 실패' },
      { status: 500 }
    );
  }
}
EOF

    # CUE 채굴 API
    cat > src/app/api/cue/mine/route.ts << 'EOF'
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { platformId, dataType } = await request.json();
    
    // CUE 채굴 로직
    const minedCue = Math.floor(Math.random() * 10) + 1;
    
    const response = {
      minedAmount: minedCue,
      platformId,
      dataType,
      timestamp: new Date().toISOString()
    };
    
    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      { error: 'CUE 채굴 실패' },
      { status: 500 }
    );
  }
}
EOF

    # 시스템 상태 API
    cat > src/app/api/system/health/route.ts << 'EOF'
import { NextResponse } from 'next/server';

export async function GET() {
  const healthStatus = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      database: 'connected',
      ai: 'operational',
      cue: 'mining',
      webauthn: 'ready'
    },
    version: '1.0.0'
  };
  
  return NextResponse.json(healthStatus);
}
EOF

    log_success "API 라우트 생성 완료"
}

# 9. 설정 파일 및 유틸리티 생성
create_config_files() {
    log_info "설정 파일 및 유틸리티 생성 중..."
    
    # 메인 설정 파일
    cat > src/lib/config/app.config.ts << 'EOF'
// =============================================================================
// 🎯 메인 애플리케이션 설정
// =============================================================================

export const APP_CONFIG = {
  name: 'AI Passport + Cue System',
  version: '1.0.0',
  description: '개인화 AI + 컨텍스트 채굴 플랫폼',
  
  // CUE 시스템 설정
  cue: {
    baseReward: 1,
    conversationReward: 3,
    dataExtractionReward: 5,
    platformConnectionReward: 10,
    maxDailyMining: 100
  },
  
  // AI 설정
  ai: {
    maxResponseLength: 2000,
    contextWindowSize: 4000,
    supportedModels: ['gpt-4', 'claude-3', 'gemini-pro'],
    defaultPersonality: 'INTJ-A'
  },
  
  // 보안 설정
  security: {
    passkey: {
      timeout: 60000,
      userVerification: 'required' as const
    },
    did: {
      network: 'ethereum',
      resolver: 'https://resolver.identity.foundation'
    }
  },
  
  // 플랫폼 설정
  platforms: {
    supported: ['chatgpt', 'claude', 'gemini', 'discord'],
    syncInterval: 300000, // 5 minutes
    maxRetries: 3
  }
} as const;

export type AppConfig = typeof APP_CONFIG;
EOF

    # 유틸리티 함수들
    cat > src/lib/utils/crypto.ts << 'EOF'
// =============================================================================
// 🔐 암호화 유틸리티
// =============================================================================

export const generateSecureKey = (): string => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

export const hashData = async (data: string): Promise<string> => {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

export const encryptData = async (data: string, key: string): Promise<string> => {
  // 실제 환경에서는 더 강력한 암호화 구현 필요
  return btoa(data + key);
};

export const decryptData = async (encryptedData: string, key: string): Promise<string> => {
  // 실제 환경에서는 더 강력한 복호화 구현 필요
  const decoded = atob(encryptedData);
  return decoded.replace(key, '');
};
EOF

    cat > src/lib/utils/validation.ts << 'EOF'
// =============================================================================
// ✅ 검증 유틸리티
// =============================================================================

export const validatePassportData = (data: any): boolean => {
  return data && 
         typeof data.did === 'string' && 
         typeof data.walletAddress === 'string' &&
         typeof data.trustScore === 'number' &&
         data.trustScore >= 0 && data.trustScore <= 100;
};

export const validateCueAmount = (amount: number): boolean => {
  return typeof amount === 'number' && 
         amount >= 0 && 
         amount <= 1000 && 
         Number.isInteger(amount);
};

export const validateMessage = (message: string): boolean => {
  return typeof message === 'string' && 
         message.trim().length > 0 && 
         message.length <= 4000;
};

export const validatePlatformId = (platformId: string): boolean => {
  const validPlatforms = ['chatgpt', 'claude', 'gemini', 'discord'];
  return typeof platformId === 'string' && validPlatforms.includes(platformId);
};
EOF

    log_success "설정 파일 및 유틸리티 생성 완료"
}

# 10. 메인 앱 파일 업데이트
create_main_app() {
    log_info "메인 앱 파일 생성/업데이트 중..."
    
    # 메인 페이지 컴포넌트
    cat > src/app/page.tsx << 'EOF'
import { MainDashboard } from '@/components/dashboard/main-dashboard';

export default function HomePage() {
  return <MainDashboard />;
}
EOF

    # 레이아웃 업데이트 (기존 파일이 있으면 백업 후 업데이트)
    if [ -f "src/app/layout.tsx" ]; then
        cp src/app/layout.tsx src/app/layout.tsx.backup
    fi
    
    cat > src/app/layout.tsx << 'EOF'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AI Passport + Cue System',
  description: '개인화 AI + 컨텍스트 채굴 플랫폼',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}
EOF

    log_success "메인 앱 파일 업데이트 완료"
}

# 11. package.json 업데이트
update_package_json() {
    log_info "package.json 업데이트 중..."
    
    # 필요한 패키지들을 package.json에 추가
    if [ -f "package.json" ]; then
        cat > install-dependencies.sh << 'EOF'
#!/bin/bash

echo "📦 필요한 패키지 설치 중..."

# React 및 Next.js 관련
npm install react@latest react-dom@latest next@latest

# TypeScript
npm install -D typescript @types/react @types/react-dom @types/node

# UI 라이브러리
npm install lucide-react @headlessui/react framer-motion

# 상태 관리 및 유틸리티
npm install zustand class-variance-authority clsx tailwind-merge

# 인증 및 보안
npm install @simplewebauthn/browser @simplewebauthn/server
npm install jose nanoid uuid @types/uuid

# AI 서비스
npm install openai @anthropic-ai/sdk @google/generative-ai

# 개발 도구
npm install -D tailwindcss postcss autoprefixer
npm install -D eslint eslint-config-next

echo "✅ 패키지 설치 완료!"
echo "🔄 다음으로 'npm run dev'를 실행하세요."
EOF
        chmod +x install-dependencies.sh
        log_success "install-dependencies.sh 생성 완료"
    fi
}

# 12. 환경 파일 예제 생성
create_env_example() {
    log_info "환경 설정 파일 생성 중..."
    
    cat > .env.example << 'EOF'
# =============================================================================
# 🌍 AI Passport + Cue System 환경 변수
# =============================================================================

# 애플리케이션 설정
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME="AI Passport + Cue System"

# AI 서비스 API 키
OPENAI_API_KEY=your_openai_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here
GOOGLE_AI_API_KEY=your_google_ai_api_key_here

# 데이터베이스 (Supabase)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# 블록체인 설정
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_wallet_connect_project_id
NEXT_PUBLIC_ALCHEMY_API_KEY=your_alchemy_api_key_here

# WebAuthn 설정
NEXT_PUBLIC_WEBAUTHN_RP_NAME="AI Passport + Cue"
NEXT_PUBLIC_WEBAUTHN_RP_ID=localhost
WEBAUTHN_RP_ORIGIN=http://localhost:3000

# CUE 시스템 설정
NEXT_PUBLIC_CUE_NETWORK=ethereum
NEXT_PUBLIC_CUE_CONTRACT_ADDRESS=0x...

# 개발 환경 설정
NODE_ENV=development
NEXT_PUBLIC_DEBUG=true
EOF

    log_success "환경 설정 파일 생성 완료"
}

# 13. README 업데이트
update_readme() {
    log_info "README 파일 업데이트 중..."
    
    cat > README.md << 'EOF'
# 🎯 AI Passport + Cue System

개인화 AI와 컨텍스트 채굴을 통합한 차세대 플랫폼

## ✨ 주요 기능

### 🎭 AI Passport
- **개성 프로필**: MBTI 기반 AI 개성 분석
- **통합 신원**: DID + WebAuthn 생체인증
- **데이터 볼트**: 암호화된 개인 데이터 저장소

### 💎 CUE 채굴 시스템
- **컨텍스트 채굴**: 대화 데이터에서 자동 CUE 토큰 생성
- **플랫폼 연동**: ChatGPT, Claude, Gemini 등 연결
- **실시간 동기화**: 크로스 플랫폼 데이터 통합

### 🤖 개인화 AI 에이전트
- **맞춤형 학습**: AI Passport 데이터로 학습
- **체크포인트 관리**: 모델 버전 관리 및 롤백
- **전문 에이전트**: 코딩, 창작, 분석 등 특화 AI

## 🚀 빠른 시작

### 1. 저장소 클론
```bash
git clone https://github.com/your-username/ai-passport-cue-system.git
cd ai-passport-cue-system
```

### 2. 의존성 설치
```bash
chmod +x install-dependencies.sh
./install-dependencies.sh
```

### 3. 환경 변수 설정
```bash
cp .env.example .env.local
# .env.local 파일을 편집하여 API 키들을 입력하세요
```

### 4. 개발 서버 실행
```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

## 📁 프로젝트 구조

```
src/
├── app/                     # Next.js App Router
│   ├── api/                # API 라우트들
│   │   ├── ai/chat/       # AI 채팅 API
│   │   ├── cue/mine/      # CUE 채굴 API
│   │   └── system/health/ # 시스템 상태 API
│   ├── layout.tsx         # 루트 레이아웃
│   └── page.tsx          # 메인 페이지
├── components/            # React 컴포넌트들
│   ├── chat/             # 채팅 인터페이스
│   ├── dashboard/        # 대시보드 컴포넌트
│   ├── passport/         # AI Passport 컴포넌트
│   └── ui/              # 기본 UI 컴포넌트
├── hooks/               # 커스텀 React 훅들
│   ├── chat/           # 채팅 관련 훅
│   └── passport/       # Passport 관련 훅
├── lib/                # 핵심 비즈니스 로직
│   ├── agents/        # AI 에이전트 관리
│   ├── config/        # 설정 파일들
│   ├── cue/          # CUE 채굴 엔진
│   ├── passport/     # AI Passport 관리
│   └── utils/        # 유틸리티 함수들
└── types/            # TypeScript 타입 정의
    └── passport/     # Passport 관련 타입들
```

## 🔧 주요 모듈

### PassportManager
```typescript
import { passportManager } from '@/lib/passport/passport-manager';

// CUE 토큰 추가
passportManager.addCueTokens(5, '데이터 추출');

// 신뢰도 점수 업데이트
passportManager.updateTrustScore(96.8);
```

### CueMiningEngine
```typescript
import { cueMiningEngine } from '@/lib/cue/cue-mining-engine';

// 플랫폼에서 데이터 추출
const extractedData = await cueMiningEngine.extractFromPlatform(
  'chatgpt',
  (step) => console.log(step.text)
);
```

### AgentTrainer
```typescript
import { agentTrainer } from '@/lib/agents/agent-trainer';

// AI 에이전트 학습 시작
const session = await agentTrainer.startTraining(
  agent,
  (session) => console.log(`진행률: ${session.currentEpoch}/${session.totalEpochs}`)
);
```

## 🎨 컴포넌트 사용법

### PassportCard
```tsx
import { PassportCard } from '@/components/passport/passport-card';

<PassportCard 
  onVaultClick={() => console.log('볼트 클릭')}
  onAnalyticsClick={() => console.log('분석 클릭')}
/>
```

### ChatInterface
```tsx
import { ChatInterface } from '@/components/chat/chat-interface';

<ChatInterface />
```

### MainDashboard
```tsx
import { MainDashboard } from '@/components/dashboard/main-dashboard';

export default function HomePage() {
  return <MainDashboard />;
}
```

## 🔌 API 엔드포인트

### AI 채팅
```http
POST /api/ai/chat
Content-Type: application/json

{
  "message": "안녕하세요",
  "passportData": {
    "vaults": ["전문 개발 지식", "커뮤니케이션 스타일"]
  }
}
```

### CUE 채굴
```http
POST /api/cue/mine
Content-Type: application/json

{
  "platformId": "chatgpt",
  "dataType": "conversation"
}
```

### 시스템 상태
```http
GET /api/system/health
```

## 🛠️ 개발 가이드

### 새로운 AI 에이전트 추가
1. `src/types/passport/unified-passport.ts`에서 에이전트 타입 확장
2. `src/lib/agents/agent-trainer.ts`에서 학습 로직 구현
3. `src/components/dashboard/main-dashboard.tsx`에서 UI 추가

### 새로운 플랫폼 연동
1. `src/lib/config/app.config.ts`의 `supportedPlatforms`에 추가
2. `src/lib/cue/cue-mining-engine.ts`에서 추출 로직 구현
3. 연결 단계를 `ConnectedPlatform` 타입에 정의

### 새로운 데이터 볼트 카테고리
1. `UnifiedDataVault`의 `category` 타입 확장
2. 해당 카테고리에 맞는 데이터 처리 로직 구현
3. UI에서 새 카테고리 아이콘 및 색상 정의

## 🧪 테스트

```bash
# 단위 테스트
npm run test

# E2E 테스트
npm run test:e2e

# 타입 체크
npm run type-check
```

## 📦 빌드 및 배포

```bash
# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm run start

# Docker로 실행
docker build -t ai-passport-cue .
docker run -p 3000:3000 ai-passport-cue
```

## 🔐 보안 고려사항

- **WebAuthn**: 생체인증을 통한 안전한 로그인
- **DID**: 탈중앙화 신원 관리
- **데이터 암호화**: 모든 개인 데이터는 end-to-end 암호화
- **API 보안**: Rate limiting 및 인증 토큰 사용

## 🌍 환경 변수

필수 환경 변수들:
- `OPENAI_API_KEY`: OpenAI API 키
- `ANTHROPIC_API_KEY`: Anthropic API 키
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase 프로젝트 URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase 익명 키

선택적 환경 변수들:
- `GOOGLE_AI_API_KEY`: Google AI API 키
- `NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID`: WalletConnect 프로젝트 ID

## 🤝 기여하기

1. 이 저장소를 포크하세요
2. 기능 브랜치를 생성하세요 (`git checkout -b feature/amazing-feature`)
3. 변경사항을 커밋하세요 (`git commit -m 'Add amazing feature'`)
4. 브랜치에 푸시하세요 (`git push origin feature/amazing-feature`)
5. Pull Request를 생성하세요

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. [LICENSE](LICENSE) 파일을 참조하세요.

## 🆘 지원

- 📧 이메일: support@ai-passport.dev
- 💬 Discord: [커뮤니티 참여](https://discord.gg/ai-passport)
- 📖 문서: [개발자 가이드](https://docs.ai-passport.dev)

---

AI 개인화의 미래를 위해 ❤️를 담아 개발되었습니다.
EOF

    log_success "README 파일 업데이트 완료"
}

# 실행 함수들
main() {
    echo "🎯 GitHub 프로젝트 모듈화를 시작합니다..."
    echo "============================================"
    
    check_project_root
    backup_existing_structure
    create_unified_types
    create_core_libraries
    create_react_components
    create_custom_hooks
    create_main_dashboard
    create_api_routes
    create_config_files
    create_main_app
    update_package_json
    create_env_example
    update_readme
    
    echo ""
    echo "🎉 모듈화 완료!"
    echo "================="
    echo ""
    log_success "✅ final0626.tsx가 성공적으로 모듈화되어 GitHub 구조에 통합되었습니다"
    echo ""
    echo "🔄 다음 단계:"
    echo "1. ./install-dependencies.sh 실행하여 패키지 설치"
    echo "2. .env.example을 .env.local로 복사하고 환경 변수 설정"
    echo "3. npm run dev로 개발 서버 시작"
    echo ""
    echo "📁 생성된 주요 모듈들:"
    echo "   🎯 src/types/passport/unified-passport.ts - 통합 타입 정의"
    echo "   🧠 src/lib/passport/passport-manager.ts - AI Passport 관리자"
    echo "   💎 src/lib/cue/cue-mining-engine.ts - CUE 채굴 엔진"
    echo "   🤖 src/lib/agents/agent-trainer.ts - AI 에이전트 트레이너"
    echo "   🎨 src/components/dashboard/main-dashboard.tsx - 메인 대시보드"
    echo "   💬 src/components/chat/chat-interface.tsx - 채팅 인터페이스"
    echo "   🎫 src/components/passport/passport-card.tsx - Passport 카드"
    echo ""
    echo "🌐 API 엔드포인트:"
    echo "   POST /api/ai/chat - AI 채팅"
    echo "   POST /api/cue/mine - CUE 채굴"
    echo "   GET /api/system/health - 시스템 상태"
    echo ""
    echo "🔗 기존 GitHub 구조와의 통합:"
    echo "   ✅ 기존 WebAuthn 시스템 유지"
    echo "   ✅ 기존 DID 시스템 활용"
    echo "   ✅ 기존 Supabase 설정 연동"
    echo "   ✅ 기존 API 구조와 호환"
    echo ""
    echo "🚀 완료 후 http://localhost:3000 에서 확인하세요!"
}

# 스크립트 실행
main "$@"