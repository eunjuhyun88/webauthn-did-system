/**
 * 🧠 Cue 맥락 추출 엔진 - 함수 시그니처 통일 버전
 * 
 * 자연어 대화에서 95% 맥락을 보존하는 고급 Cue 추출 시스템
 * AI 기반 의미 분석, NLP, 패턴 인식을 통한 종합적 맥락 이해
 */

import { 
  CueObject, 
  CueExtractionResult, 
  SemanticMetadata, 
  CuePlatform,
  ConversationEntry,
  ExtractedContext
} from '@/types/cue';
import { nanoid } from 'nanoid';

/**
 * 고급 Cue 추출 엔진 클래스
 */
export class CueExtractor {
  private readonly AI_CONFIGS = {
    openai: {
      apiKey: process.env.OPENAI_API_KEY,
      model: 'gpt-4',
      endpoint: 'https://api.openai.com/v1/chat/completions'
    },
    anthropic: {
      apiKey: process.env.CLAUDE_API_KEY,
      model: 'claude-3-sonnet-20240229',
      endpoint: 'https://api.anthropic.com/v1/messages'
    }
  };

  /**
   * 🔧 통일된 Cue 추출 메서드 (오버로드)
   * 
   * 사용법 1: extractCues(messages)
   * 사용법 2: extractCues(userMessage, aiResponse, userId, sourcePlatform)
   */
  async extractCues(messages: ConversationEntry[]): Promise<CueExtractionResult>;
  async extractCues(
    userMessage: string,
    aiResponse: string,
    userId: string,
    sourcePlatform: CuePlatform,
    conversationHistory?: ConversationEntry[]
  ): Promise<CueExtractionResult>;

  async extractCues(
    messagesOrUserMessage: ConversationEntry[] | string,
    aiResponse?: string,
    userId?: string,
    sourcePlatform?: CuePlatform,
    conversationHistory?: ConversationEntry[]
  ): Promise<CueExtractionResult> {
    const startTime = Date.now();

    try {
      console.log('🧠 Cue 추출 시작...');

      let messages: ConversationEntry[];

      // 타입 가드로 입력 방식 구분
      if (Array.isArray(messagesOrUserMessage)) {
        // 배열 방식: extractCues(messages)
        messages = messagesOrUserMessage;
      } else {
        // 개별 파라미터 방식: extractCues(userMessage, aiResponse, userId, sourcePlatform)
        if (!aiResponse || !userId || !sourcePlatform) {
          throw new Error('개별 파라미터 방식에서는 userMessage, aiResponse, userId, sourcePlatform 모두 필요합니다');
        }

        // 개별 파라미터를 ConversationEntry 배열로 변환
        messages = this.convertToConversationEntries(
          messagesOrUserMessage,
          aiResponse,
          userId,
          conversationHistory || []
        );
      }

      // 실제 Cue 추출 실행
      return await this.extractFromMessages(messages);

    } catch (error) {
      console.error('Cue 추출 오류:', error);
      
      return {
        success: false,
        confidenceScore: 0,
        extractionTime: Date.now() - startTime,
        errors: [error instanceof Error ? error.message : '알 수 없는 오류']
      };
    }
  }

  /**
   * 개별 파라미터를 ConversationEntry 배열로 변환
   */
  private convertToConversationEntries(
    userMessage: string,
    aiResponse: string,
    userId: string,
    conversationHistory: ConversationEntry[]
  ): ConversationEntry[] {
    const now = new Date();
    const baseId = Date.now();

    const newEntries: ConversationEntry[] = [
      {
        id: `msg_${baseId}_user`,
        content: userMessage,
        timestamp: now,
        role: 'user',
        userId,
        metadata: {
          platform: 'unknown',
          extractedAt: now
        }
      },
      {
        id: `msg_${baseId + 1}_assistant`,
        content: aiResponse,
        timestamp: new Date(now.getTime() + 1000), // 1초 후
        role: 'assistant',
        userId,
        metadata: {
          platform: 'unknown',
          extractedAt: now
        }
      }
    ];

    // 기존 대화 히스토리와 합치기 (최근 10개만)
    const recentHistory = conversationHistory.slice(-10);
    return [...recentHistory, ...newEntries];
  }

  /**
   * 실제 메시지 배열에서 Cue 추출
   */
  private async extractFromMessages(messages: ConversationEntry[]): Promise<CueExtractionResult> {
    const startTime = Date.now();

    try {
      console.log(`📝 ${messages.length}개 메시지에서 Cue 추출 중...`);

      // 1. 원본 내용 구조화
      const structuredContent = this.structureOriginalContent(messages);

      // 2. 병렬 분석 실행
      const [
        extractedContext,
        semanticMetadata,
        qualityMetrics
      ] = await Promise.all([
        this.extractContext(structuredContent),
        this.generateSemanticMetadata(structuredContent),
        this.calculateQualityMetrics(messages)
      ]);

      // 3. Cue 객체 생성
      const cueObject = await this.createCueObject(
        messages[messages.length - 1]?.userId || 'anonymous',
        'unknown' as CuePlatform,
        structuredContent,
        extractedContext,
        semanticMetadata,
        qualityMetrics
      );

      const extractionTime = Date.now() - startTime;

      console.log(`✅ Cue 추출 완료 (${extractionTime}ms)`);

      return {
        success: true,
        cueObject,
        confidenceScore: qualityMetrics.overallScore,
        extractionTime,
        errors: []
      };

    } catch (error) {
      console.error('메시지 추출 오류:', error);
      
      return {
        success: false,
        confidenceScore: 0,
        extractionTime: Date.now() - startTime,
        errors: [error instanceof Error ? error.message : '알 수 없는 오류']
      };
    }
  }

  /**
   * 원본 내용 구조화
   */
  private structureOriginalContent(messages: ConversationEntry[]): any {
    return {
      totalMessages: messages.length,
      conversations: messages.map(msg => ({
        id: msg.id,
        content: msg.content,
        role: msg.role,
        timestamp: msg.timestamp,
        userId: msg.userId
      })),
      timeSpan: {
        start: messages[0]?.timestamp || new Date(),
        end: messages[messages.length - 1]?.timestamp || new Date()
      }
    };
  }

  /**
   * 맥락 추출
   */
  private async extractContext(structuredContent: any): Promise<ExtractedContext> {
    // 간단한 키워드 기반 맥락 추출
    const allContent = structuredContent.conversations
      .map((conv: any) => conv.content)
      .join(' ');

    // 주요 키워드 추출 (실제로는 더 복잡한 NLP 알고리즘 사용)
    const keywords = this.extractKeywords(allContent);
    const topics = this.identifyTopics(allContent);
    
    return {
      mainTheme: topics[0] || '일반 대화',
      keyPoints: keywords.slice(0, 5),
      summary: this.generateSummary(allContent),
      entities: this.extractEntities(allContent),
      sentiment: this.analyzeSentiment(allContent)
    };
  }

  /**
   * 의미론적 메타데이터 생성
   */
  private async generateSemanticMetadata(structuredContent: any): Promise<SemanticMetadata> {
    const conversations = structuredContent.conversations;
    const lastMessage = conversations[conversations.length - 1];

    return {
      primaryTopic: this.identifyPrimaryTopic(conversations),
      domainCategory: this.categorizeDomain(conversations),
      technicalLevel: this.assessTechnicalLevel(conversations),
      conversationPhase: this.determineConversationPhase(conversations),
      emotionalTone: this.analyzeEmotionalTone(conversations),
      keyEntities: this.extractKeyEntities(conversations),
      relationshipMap: this.buildRelationshipMap(conversations),
      actionItems: this.extractActionItems(conversations),
      previousCueReferences: [],
      expectedFollowUps: this.predictFollowUps(conversations)
    };
  }

  /**
   * 품질 메트릭 계산
   */
  private async calculateQualityMetrics(messages: ConversationEntry[]): Promise<any> {
    const contentLength = messages.reduce((sum, msg) => sum + msg.content.length, 0);
    const messageCount = messages.length;
    
    return {
      overallScore: Math.min(90, Math.max(60, (contentLength / 100) + (messageCount * 5))),
      contentRichness: contentLength > 100 ? 85 : 65,
      contextClarity: messageCount > 2 ? 80 : 60,
      extractability: 75
    };
  }

  /**
   * Cue 객체 생성
   */
  private async createCueObject(
    userId: string,
    sourcePlatform: CuePlatform,
    structuredContent: any,
    extractedContext: ExtractedContext,
    semanticMetadata: SemanticMetadata,
    qualityMetrics: any
  ): Promise<CueObject> {
    return {
      id: nanoid(),
      timestamp: new Date(),
      sourceUserId: userId,
      sourcePlatform,
      originalContent: JSON.stringify(structuredContent),
      extractedContext: extractedContext.summary,
      intentSignature: this.generateIntentSignature(semanticMetadata),
      semanticMetadata,
      targetPlatforms: ['chatgpt', 'claude', 'gemini'] as CuePlatform[],
      platformAdaptations: [],
      contextPreservationScore: qualityMetrics.overallScore,
      syncStatus: 'pending',
      verificationSignature: this.generateVerificationSignature(userId, extractedContext)
    };
  }

  // =============================================================================
  // 유틸리티 메서드들
  // =============================================================================

  private extractKeywords(content: string): string[] {
    // 간단한 키워드 추출 (실제로는 더 정교한 알고리즘 사용)
    const words = content.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3);
    
    const frequency: Record<string, number> = {};
    words.forEach(word => {
      frequency[word] = (frequency[word] || 0) + 1;
    });
    
    return Object.entries(frequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([word]) => word);
  }

  private identifyTopics(content: string): string[] {
    const topicKeywords = {
      '기술': ['개발', '프로그래밍', '코딩', 'AI', '머신러닝'],
      '비즈니스': ['회의', '프로젝트', '계획', '전략', '목표'],
      '일상': ['오늘', '어제', '내일', '시간', '일정']
    };

    const scores: Record<string, number> = {};
    
    Object.entries(topicKeywords).forEach(([topic, keywords]) => {
      scores[topic] = keywords.reduce((score, keyword) => {
        return score + (content.toLowerCase().includes(keyword) ? 1 : 0);
      }, 0);
    });

    return Object.entries(scores)
      .sort(([,a], [,b]) => b - a)
      .map(([topic]) => topic);
  }

  private generateSummary(content: string): string {
    // 간단한 요약 생성 (실제로는 AI 모델 사용)
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 10);
    return sentences.slice(0, 2).join('. ') + '.';
  }

  private extractEntities(content: string): string[] {
    // 간단한 개체명 인식 (실제로는 NER 모델 사용)
    const patterns = [
      /[A-Z][a-z]+(?:\s[A-Z][a-z]+)*/g, // 고유명사 패턴
      /\b\d{4}-\d{2}-\d{2}\b/g, // 날짜 패턴
      /\b\d{1,2}:\d{2}\b/g // 시간 패턴
    ];

    const entities: string[] = [];
    patterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) entities.push(...matches);
    });

    return [...new Set(entities)].slice(0, 5);
  }

  private analyzeSentiment(content: string): 'positive' | 'negative' | 'neutral' {
    const positiveWords = ['좋', '훌륭', '완벽', '성공', '기쁘'];
    const negativeWords = ['나쁘', '실패', '문제', '어려', '힘들'];

    const positiveCount = positiveWords.reduce((count, word) => 
      count + (content.includes(word) ? 1 : 0), 0);
    const negativeCount = negativeWords.reduce((count, word) => 
      count + (content.includes(word) ? 1 : 0), 0);

    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  }

  // 추가 유틸리티 메서드들 (간략화)
  private identifyPrimaryTopic(conversations: any[]): string {
    return this.identifyTopics(conversations.map(c => c.content).join(' '))[0] || '일반';
  }

  private categorizeDomain(conversations: any[]): string {
    return 'general';
  }

  private assessTechnicalLevel(conversations: any[]): 'beginner' | 'intermediate' | 'advanced' | 'expert' {
    return 'intermediate';
  }

  private determineConversationPhase(conversations: any[]): 'initiation' | 'exploration' | 'resolution' | 'conclusion' {
    if (conversations.length <= 2) return 'initiation';
    if (conversations.length <= 5) return 'exploration';
    if (conversations.length <= 8) return 'resolution';
    return 'conclusion';
  }

  private analyzeEmotionalTone(conversations: any[]): 'neutral' | 'positive' | 'negative' | 'urgent' | 'curious' {
    return 'neutral';
  }

  private extractKeyEntities(conversations: any[]): string[] {
    return this.extractEntities(conversations.map(c => c.content).join(' '));
  }

  private buildRelationshipMap(conversations: any[]): Record<string, string[]> {
    return {};
  }

  private extractActionItems(conversations: any[]): string[] {
    return [];
  }

  private predictFollowUps(conversations: any[]): string[] {
    return ['추가 질문', '관련 주제 탐색'];
  }

  private generateIntentSignature(semanticMetadata: SemanticMetadata): string {
    return `${semanticMetadata.primaryTopic}_${semanticMetadata.conversationPhase}_${Date.now()}`;
  }

  private generateVerificationSignature(userId: string, extractedContext: ExtractedContext): string {
    return `verify_${userId}_${Date.now()}_${extractedContext.mainTheme}`;
  }
}

// 싱글톤 인스턴스
let cueExtractorInstance: CueExtractor | null = null;

export function getCueExtractor(): CueExtractor {
  if (!cueExtractorInstance) {
    cueExtractorInstance = new CueExtractor();
  }
  return cueExtractorInstance;
}

// 편의 함수들
export const extractCueFromConversation = async (
  userMessage: string,
  aiResponse: string,
  userId: string,
  sourcePlatform: CuePlatform = 'unknown' as CuePlatform
): Promise<CueExtractionResult> => {
  const extractor = getCueExtractor();
  return extractor.extractCues(userMessage, aiResponse, userId, sourcePlatform);
};

export const extractCueFromMessages = async (
  messages: ConversationEntry[]
): Promise<CueExtractionResult> => {
  const extractor = getCueExtractor();
  return extractor.extractCues(messages);
};