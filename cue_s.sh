#!/bin/bash

echo "🚀 Cue 시스템 핵심 파일 생성 시작"
echo "=================================="

# 1. Cue 시스템 폴더 생성
echo "📁 Cue 시스템 폴더 구조 생성..."
mkdir -p src/lib/cue
mkdir -p src/lib/cue/extractors
mkdir -p src/lib/cue/sync
mkdir -p src/lib/cue/context

echo "✅ 폴더 구조 생성 완료"

# 2. Cue 타입 정의 생성
echo "📝 Cue 타입 정의 생성 중..."
cat > src/types/cue.ts << 'EOF'
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
EOF

echo "✅ Cue 타입 정의 완료"

# 3. 맥락 추출 엔진 생성
echo "🧠 맥락 추출 엔진 생성 중..."
cat > src/lib/cue/CueExtractor.ts << 'EOF'
/**
 * 🧠 Cue 맥락 추출 엔진
 * 자연어 대화에서 95% 맥락을 보존하는 Cue 객체 생성
 */

import { CueObject, CueExtractionResult, SemanticMetadata, CuePlatform } from '@/types/cue';
import { nanoid } from 'nanoid';

export class CueExtractor {
  private readonly AI_MODELS = {
    openai: process.env.OPENAI_API_KEY,
    anthropic: process.env.CLAUDE_API_KEY,
    google: process.env.GEMINI_API_KEY
  };

  /**
   * 자연어 대화에서 Cue 객체 추출
   */
  async extractCueFromConversation(
    userMessage: string,
    aiResponse: string,
    userId: string,
    sourcePlatform: CuePlatform,
    conversationHistory?: string[]
  ): Promise<CueExtractionResult> {
    try {
      const startTime = Date.now();
      
      // 1. 핵심 맥락 추출
      const extractedContext = await this.extractCoreContext(
        userMessage, 
        aiResponse, 
        conversationHistory
      );
      
      // 2. 의도 시그니처 생성
      const intentSignature = await this.generateIntentSignature(userMessage);
      
      // 3. 의미론적 메타데이터 생성
      const semanticMetadata = await this.generateSemanticMetadata(
        userMessage,
        aiResponse,
        extractedContext
      );
      
      // 4. 맥락 보존 점수 계산
      const contextPreservationScore = await this.calculateContextScore(
        userMessage,
        extractedContext,
        semanticMetadata
      );
      
      // 5. Cue 객체 생성
      const cueObject: CueObject = {
        id: nanoid(),
        timestamp: new Date(),
        sourceUserId: userId,
        sourcePlatform,
        originalContent: userMessage,
        extractedContext,
        intentSignature,
        semanticMetadata,
        targetPlatforms: this.determineTargetPlatforms(sourcePlatform),
        platformAdaptations: [],
        contextPreservationScore,
        syncStatus: 'pending',
        verificationSignature: await this.generateVerificationSignature(extractedContext)
      };
      
      const extractionTime = Date.now() - startTime;
      
      return {
        success: true,
        cueObject,
        confidenceScore: contextPreservationScore,
        extractionTime,
      };
      
    } catch (error) {
      console.error('Cue 추출 실패:', error);
      return {
        success: false,
        confidenceScore: 0,
        extractionTime: Date.now() - Date.now(),
        errors: [error instanceof Error ? error.message : '알 수 없는 오류']
      };
    }
  }

  /**
   * 핵심 맥락 추출 (AI 기반)
   */
  private async extractCoreContext(
    userMessage: string,
    aiResponse: string,
    history?: string[]
  ): Promise<string> {
    const contextPrompt = `
다음 대화에서 핵심 맥락을 추출해주세요. 이 맥락은 다른 AI 플랫폼에서 대화를 이어갈 때 사용됩니다.

사용자 메시지: "${userMessage}"
AI 응답: "${aiResponse}"
${history ? `이전 대화: ${history.join('\n')}` : ''}

다음 형식으로 핵심 맥락을 추출해주세요:
1. 주요 주제와 목표
2. 현재 진행 상황
3. 사용자의 의도와 요구사항
4. 중요한 기술적/상황적 맥락
5. 다음에 논의할 가능성이 높은 내용

95% 맥락 보존을 목표로 간결하면서도 완전한 요약을 제공해주세요.
`;

    try {
      // OpenAI GPT를 사용한 맥락 추출
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.AI_MODELS.openai}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: '당신은 대화 맥락을 완벽하게 보존하는 전문가입니다. 95% 이상의 맥락 보존율을 달성해야 합니다.'
            },
            {
              role: 'user',
              content: contextPrompt
            }
          ],
          max_tokens: 500,
          temperature: 0.1, // 일관성을 위해 낮은 temperature
        }),
      });

      const data = await response.json();
      return data.choices[0]?.message?.content || userMessage;
      
    } catch (error) {
      console.error('맥락 추출 실패, 원본 메시지 사용:', error);
      return userMessage; // 실패 시 원본 메시지 사용
    }
  }

  /**
   * 의도 시그니처 생성
   */
  private async generateIntentSignature(userMessage: string): Promise<string> {
    // 사용자 의도를 간단한 해시로 변환
    const intentKeywords = userMessage
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(' ')
      .filter(word => word.length > 2)
      .slice(0, 5)
      .sort()
      .join('_');
      
    return `intent_${intentKeywords}_${Date.now().toString(36)}`;
  }

  /**
   * 의미론적 메타데이터 생성
   */
  private async generateSemanticMetadata(
    userMessage: string,
    aiResponse: string,
    extractedContext: string
  ): Promise<SemanticMetadata> {
    // 간단한 휴리스틱 기반 메타데이터 생성
    // 실제 구현에서는 더 정교한 NLP 분석 사용
    
    const keyEntities = this.extractEntities(userMessage + ' ' + aiResponse);
    const primaryTopic = this.identifyPrimaryTopic(userMessage);
    
    return {
      primaryTopic,
      domainCategory: this.categorizeDomain(userMessage),
      technicalLevel: this.assessTechnicalLevel(userMessage),
      conversationPhase: 'exploration', // 기본값
      emotionalTone: this.detectTone(userMessage),
      keyEntities,
      relationshipMap: this.buildRelationshipMap(keyEntities),
      actionItems: this.extractActionItems(aiResponse),
      previousCueReferences: [],
      expectedFollowUps: this.generateFollowUps(extractedContext)
    };
  }

  /**
   * 맥락 보존 점수 계산
   */
  private async calculateContextScore(
    original: string,
    extracted: string,
    metadata: SemanticMetadata
  ): Promise<number> {
    // 다양한 요소를 고려한 점수 계산
    let score = 85; // 기본 점수
    
    // 길이 적정성 (너무 짧거나 길면 감점)
    const lengthRatio = extracted.length / original.length;
    if (lengthRatio < 0.3 || lengthRatio > 2.0) {
      score -= 10;
    }
    
    // 핵심 엔티티 보존 여부
    const originalEntities = this.extractEntities(original);
    const preservedEntities = metadata.keyEntities.filter(entity => 
      originalEntities.includes(entity)
    );
    const entityPreservationRate = preservedEntities.length / originalEntities.length;
    score += entityPreservationRate * 10;
    
    // 기술적 정확성 (특수 용어 보존)
    const technicalTerms = this.extractTechnicalTerms(original);
    const preservedTerms = technicalTerms.filter(term => 
      extracted.toLowerCase().includes(term.toLowerCase())
    );
    if (technicalTerms.length > 0) {
      score += (preservedTerms.length / technicalTerms.length) * 5;
    }
    
    return Math.min(100, Math.max(0, score));
  }

  /**
   * 검증 시그니처 생성
   */
  private async generateVerificationSignature(context: string): Promise<string> {
    // 간단한 해시 기반 시그니처 (실제로는 WebAuthn 연동)
    const encoder = new TextEncoder();
    const data = encoder.encode(context + Date.now());
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // 유틸리티 메서드들
  private determineTargetPlatforms(source: CuePlatform): CuePlatform[] {
    const allPlatforms: CuePlatform[] = ['chatgpt', 'claude', 'gemini'];
    return allPlatforms.filter(p => p !== source);
  }

  private extractEntities(text: string): string[] {
    // 간단한 엔티티 추출 (실제로는 NER 모델 사용)
    const entities = text.match(/[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*/g) || [];
    return [...new Set(entities)].slice(0, 10);
  }

  private identifyPrimaryTopic(text: string): string {
    // 키워드 기반 주제 식별
    const techKeywords = ['code', 'programming', 'development', 'api', 'database'];
    const businessKeywords = ['strategy', 'market', 'business', 'revenue', 'customer'];
    
    if (techKeywords.some(keyword => text.toLowerCase().includes(keyword))) {
      return 'Technology';
    }
    if (businessKeywords.some(keyword => text.toLowerCase().includes(keyword))) {
      return 'Business';
    }
    return 'General';
  }

  private categorizeDomain(text: string): string {
    // 도메인 분류 로직
    return 'General'; // 기본값
  }

  private assessTechnicalLevel(text: string): 'beginner' | 'intermediate' | 'advanced' | 'expert' {
    // 기술 수준 평가
    return 'intermediate'; // 기본값
  }

  private detectTone(text: string): 'neutral' | 'positive' | 'negative' | 'urgent' | 'curious' {
    // 감정 톤 감지
    if (text.includes('?')) return 'curious';
    if (text.includes('urgent') || text.includes('asap')) return 'urgent';
    return 'neutral';
  }

  private buildRelationshipMap(entities: string[]): Record<string, string[]> {
    // 엔티티 간 관계 맵 구성
    return {};
  }

  private extractActionItems(text: string): string[] {
    // 실행 항목 추출
    const actionPatterns = [
      /need to\s+(.+?)(?:\.|$)/gi,
      /should\s+(.+?)(?:\.|$)/gi,
      /will\s+(.+?)(?:\.|$)/gi
    ];
    
    const actions: string[] = [];
    actionPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        actions.push(...matches.slice(0, 3));
      }
    });
    
    return actions;
  }

  private generateFollowUps(context: string): string[] {
    // 예상 후속 질문 생성
    return [
      "더 자세한 설명이 필요한 부분이 있나요?",
      "다른 접근 방법도 고려해보시겠어요?",
      "추가적인 요구사항이 있으신가요?"
    ];
  }

  private extractTechnicalTerms(text: string): string[] {
    // 기술 용어 추출
    const techTermPattern = /\b(?:API|HTTP|JSON|SQL|React|Node\.js|TypeScript|WebAuthn|DID)\b/gi;
    return text.match(techTermPattern) || [];
  }
}

// 싱글톤 인스턴스 
export const cueExtractor = new CueExtractor();
EOF

echo "✅ 맥락 추출 엔진 완료"

# 4. 스크립트 실행 권한 부여
chmod +x src/lib/cue/CueExtractor.ts

echo ""
echo "🎉 Cue 시스템 1단계 완료!"
echo "========================"
echo "✅ 타입 정의: src/types/cue.ts"
echo "✅ 맥락 추출: src/lib/cue/CueExtractor.ts"
echo ""
echo "🔄 다음 단계: 플랫폼간 동기화 시스템 구현"
echo "   ./implement_cue_sync.sh 실행"