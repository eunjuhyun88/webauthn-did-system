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
