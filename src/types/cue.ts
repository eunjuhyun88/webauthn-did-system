/**
 * 🎯 Cue 시스템 타입 정의
 * 플랫폼 간 95% 맥락 보존을 위한 핵심 타입들
 */

export interface CueObject {
  // 기본 식별 정보
  id: string;
  timestamp: Date;
  sourceUserId: string;
  sourcePlatform: CuePlatform;
  
  // 자연어 맥락 정보
  originalContent: string;           // 원본 대화 내용
  extractedContext: string;          // 추출된 핵심 맥락
  intentSignature: string;           // 의도 시그니처
  semanticMetadata: SemanticMetadata; // 의미론적 메타데이터
  
  // 크로스 플랫폼 정보
  targetPlatforms: CuePlatform[];    // 동기화 대상 플랫폼들
  platformAdaptations: PlatformAdaptation[]; // 플랫폼별 적응 데이터
  
  // 품질 및 상태 정보
  contextPreservationScore: number;  // 맥락 보존 점수 (0-100)
  syncStatus: CueSyncStatus;
  verificationSignature: string;     // WebAuthn 기반 무결성 검증
}

export type CuePlatform = 
  | 'chatgpt' 
  | 'claude' 
  | 'gemini' 
  | 'copilot'
  | 'perplexity'
  | 'custom';

export interface SemanticMetadata {
  // 주제 및 도메인
  primaryTopic: string;
  domainCategory: string;
  technicalLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  
  // 대화 맥락
  conversationPhase: 'initiation' | 'exploration' | 'resolution' | 'conclusion';
  emotionalTone: 'neutral' | 'positive' | 'negative' | 'urgent' | 'curious';
  
  // 구조적 정보
  keyEntities: string[];             // 핵심 개체들
  relationshipMap: Record<string, string[]>; // 개체 간 관계
  actionItems: string[];             // 실행 가능한 항목들
  
  // 연속성 정보
  previousCueReferences: string[];   // 이전 대화 참조
  expectedFollowUps: string[];       // 예상 후속 질문들
}

export interface PlatformAdaptation {
  platform: CuePlatform;
  adaptedPrompt: string;             // 플랫폼 최적화된 프롬프트
  platformSpecificContext: Record<string, any>; // 플랫폼별 추가 정보
  estimatedSuccessRate: number;      // 해당 플랫폼에서의 예상 성공률
}

export type CueSyncStatus = 
  | 'pending'     // 동기화 대기
  | 'syncing'     // 동기화 진행중
  | 'synced'      // 동기화 완료
  | 'failed'      // 동기화 실패
  | 'partial';    // 부분 동기화

export interface CueExtractionResult {
  success: boolean;
  cueObject?: CueObject;
  confidenceScore: number;           // 추출 신뢰도 (0-100)
  extractionTime: number;            // 추출 소요 시간 (ms)
  errors?: string[];
}

export interface CrossPlatformSyncResult {
  targetPlatform: CuePlatform;
  success: boolean;
  syncedAt: Date;
  contextPreservationScore: number;
  adaptedContent: string;
  responseReceived?: string;         // 대상 플랫폼에서의 응답
  errors?: string[];
}

// 실시간 동기화 이벤트
export interface CueSyncEvent {
  type: 'sync_started' | 'sync_completed' | 'sync_failed' | 'context_preserved';
  cueId: string;
  platform: CuePlatform;
  timestamp: Date;
  data?: Record<string, any>;
}

// Cue 설정
export interface CueSystemConfig {
  // 품질 설정
  minContextPreservationScore: number;  // 최소 맥락 보존 점수
  maxSyncLatency: number;              // 최대 동기화 지연 시간 (ms)
  enableRealTimeSync: boolean;         // 실시간 동기화 활성화
  
  // 플랫폼 설정
  enabledPlatforms: CuePlatform[];
  platformPriority: Record<CuePlatform, number>;
  
  // 보안 설정
  requireVerification: boolean;        // WebAuthn 검증 필수 여부
  encryptCueData: boolean;            // Cue 데이터 암호화 여부
}

// 유틸리티 타입들
export type CueQuery = {
  userId?: string;
  platform?: CuePlatform;
  dateRange?: {
    start: Date;
    end: Date;
  };
  contextScore?: {
    min: number;
    max: number;
  };
  searchText?: string;
};

export type CueAnalytics = {
  totalCues: number;
  averageContextScore: number;
  platformDistribution: Record<CuePlatform, number>;
  syncSuccessRate: number;
  averageSyncTime: number;
};
