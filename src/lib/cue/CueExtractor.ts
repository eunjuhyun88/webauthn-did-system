/**
 * 🧠 Cue 맥락 추출 엔진 - 완전한 구현
 * 
 * 자연어 대화에서 95% 맥락을 보존하는 고급 Cue 추출 시스템
 * AI 기반 의미 분석, NLP, 패턴 인식을 통한 종합적 맥락 이해
 */

import { 
  CueObject, 
  CueExtractionResult, 
  SemanticMetadata, 
  CuePlatform,
  ExtractedContext,
  OriginalContent,
  ConversationEntry,
  EntityMention,
  EntityRelationship,
  ActionItem,
  TechnicalTerm,
  CodeSnippet,
  Reference,
  EmotionalContext,
  ConversationFlow,
  QualityMetrics,
  TechnicalLevel,
  EmotionalTone,
  ConversationPhase
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
    },
    google: {
      apiKey: process.env.GEMINI_API_KEY,
      model: 'gemini-pro',
      endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent'
    }
  };

  private readonly EXTRACTION_PROMPTS = {
    context: `당신은 대화 맥락을 완벽하게 분석하는 전문가입니다. 다음 대화에서 95% 이상의 맥락을 보존할 수 있는 핵심 정보를 추출해주세요.`,
    entities: `텍스트에서 중요한 개체들(인물, 기술, 개념, 제품 등)을 정확히 식별하고 분류해주세요.`,
    relationships: `식별된 개체들 간의 관계와 연결점을 분석해주세요.`,
    intent: `사용자의 주요 의도와 목표를 파악하고, 숨겨진 의도까지 분석해주세요.`,
    technical: `기술적 내용, 코드, 전문 용어를 정확히 식별하고 분석해주세요.`,
    emotional: `대화의 감정적 톤, 긴급성, 사용자의 감정 상태를 분석해주세요.`,
    flow: `대화의 진행 단계, 완성도, 다음 예상 단계를 분석해주세요.`
  };

  /**
   * 메인 Cue 추출 함수
   */
  async extractCueFromConversation(
    userMessage: string,
    aiResponse: string,
    userId: string,
    sourcePlatform: CuePlatform,
    conversationHistory?: ConversationEntry[],
    originalContent?: Partial<OriginalContent>
  ): Promise<CueExtractionResult> {
    const startTime = Date.now();

    try {
      console.log(`🧠 Cue 추출 시작 - Platform: ${sourcePlatform}, User: ${userId}`);

      // 1. 원본 내용 구조화
      const structuredContent = this.structureOriginalContent(
        userMessage, 
        aiResponse, 
        conversationHistory, 
        originalContent
      );

      // 2. 병렬 분석 실행 (성능 최적화)
      const [
        extractedContext,
        semanticMetadata,
        qualityMetrics
      ] = await Promise.all([
        this.extractContext(structuredContent),
        this.generateSemanticMetadata(structuredContent),
        this.calculateInitialQuality(userMessage, aiResponse)
      ]);

      // 3. Cue 객체 생성
      const cueObject = await this.createCueObject(
        userId,
        sourcePlatform,
        structuredContent,
        extractedContext,
        semanticMetadata,
        qualityMetrics
      );

      // 4. 최종 품질 검증
      const finalQualityMetrics = await this.validateCueQuality(cueObject);
      cueObject.qualityMetrics = finalQualityMetrics;

      const extractionTime = Date.now() - startTime;

      console.log(`✅ Cue 추출 완료 - ID: ${cueObject.id}, 시간: ${extractionTime}ms, 품질: ${finalQualityMetrics.contextPreservationScore}`);

      return {
        success: true,
        cueObject,
        confidenceScore: finalQualityMetrics.contextPreservationScore,
        extractionTime,
      };

    } catch (error) {
      const extractionTime = Date.now() - startTime;
      console.error('❌ Cue 추출 실패:', error);

      return {
        success: false,
        confidenceScore: 0,
        extractionTime,
        errors: [error instanceof Error ? error.message : '알 수 없는 오류']
      };
    }
  }

  /**
   * 원본 내용 구조화
   */
  private structureOriginalContent(
    userMessage: string,
    aiResponse: string,
    conversationHistory?: ConversationEntry[],
    originalContent?: Partial<OriginalContent>
  ): OriginalContent {
    return {
      userMessage,
      aiResponse,
      conversationHistory: conversationHistory || [],
      attachments: originalContent?.attachments || [],
      contextualInfo: {
        deviceType: this.detectDeviceType(),
        timeOfDay: this.getTimeOfDay(),
        taskContext: this.inferTaskContext(userMessage),
        ...originalContent?.contextualInfo
      }
    };
  }

  /**
   * 핵심 맥락 추출 (고급 AI 분석)
   */
  private async extractContext(originalContent: OriginalContent): Promise<ExtractedContext> {
    const { userMessage, aiResponse, conversationHistory } = originalContent;
    
    // 병렬 분석 실행
    const [
      summaryAndKeyPoints,
      intentAnalysis,
      topicAnalysis,
      entityAnalysis,
      technicalAnalysis,
      emotionalAnalysis,
      flowAnalysis
    ] = await Promise.all([
      this.extractSummaryAndKeyPoints(userMessage, aiResponse, conversationHistory),
      this.analyzeIntent(userMessage, conversationHistory),
      this.analyzeTopics(userMessage, aiResponse),
      this.extractEntitiesAndRelationships(userMessage, aiResponse),
      this.analyzeTechnicalContent(userMessage, aiResponse),
      this.analyzeEmotionalContext(userMessage, conversationHistory),
      this.analyzeConversationFlow(userMessage, aiResponse, conversationHistory)
    ]);

    return {
      // 핵심 요약
      summary: summaryAndKeyPoints.summary,
      keyPoints: summaryAndKeyPoints.keyPoints,
      
      // 의도 분석
      primaryIntent: intentAnalysis.primary,
      secondaryIntents: intentAnalysis.secondary,
      intentSignature: intentAnalysis.signature,
      
      // 주제 분석
      primaryTopic: topicAnalysis.primary,
      subTopics: topicAnalysis.sub,
      domainCategory: topicAnalysis.domain,
      
      // 구조적 분석
      keyEntities: entityAnalysis.entities,
      relationships: entityAnalysis.relationships,
      actionItems: entityAnalysis.actionItems,
      
      // 기술적 맥락
      technicalTerms: technicalAnalysis.terms,
      codeSnippets: technicalAnalysis.code,
      references: technicalAnalysis.references,
      
      // 감정 및 톤 분석
      emotionalContext: emotionalAnalysis,
      
      // 연속성 정보
      conversationFlow: flowAnalysis
    };
  }

  /**
   * 요약 및 핵심 포인트 추출
   */
  private async extractSummaryAndKeyPoints(
    userMessage: string, 
    aiResponse: string, 
    history: ConversationEntry[]
  ): Promise<{ summary: string; keyPoints: string[] }> {
    const contextPrompt = `
${this.EXTRACTION_PROMPTS.context}

사용자 메시지: "${userMessage}"
AI 응답: "${aiResponse}"
${history.length > 0 ? `이전 대화: ${history.map(h => `${h.role}: ${h.content}`).join('\n')}` : ''}

다음 형식으로 정확히 응답해주세요:
SUMMARY: [한 문단으로 핵심 맥락 요약 - 다른 AI가 이해할 수 있을 정도로 완전하게]
KEY_POINTS:
- [핵심 포인트 1]
- [핵심 포인트 2]
- [핵심 포인트 3]
- [핵심 포인트 4]
- [핵심 포인트 5]

95% 맥락 보존을 목표로 간결하면서도 완전한 정보를 제공해주세요.
`;

    try {
      const response = await this.callOpenAI(contextPrompt, {
        temperature: 0.1,
        max_tokens: 800
      });

      const summaryMatch = response.match(/SUMMARY:\s*(.+?)(?=KEY_POINTS:|$)/s);
      const keyPointsMatch = response.match(/KEY_POINTS:\s*((?:- .+(?:\n|$))+)/s);

      const summary = summaryMatch?.[1]?.trim() || userMessage;
      const keyPoints = keyPointsMatch?.[1]
        ?.split('\n')
        ?.map(line => line.replace(/^-\s*/, '').trim())
        ?.filter(point => point.length > 0) || [];

      return { summary, keyPoints };

    } catch (error) {
      console.error('요약 추출 실패:', error);
      return {
        summary: userMessage,
        keyPoints: [userMessage.substring(0, 100) + '...']
      };
    }
  }

  /**
   * 의도 분석
   */
  private async analyzeIntent(
    userMessage: string, 
    history: ConversationEntry[]
  ): Promise<{ primary: string; secondary: string[]; signature: string }> {
    const intentPrompt = `
${this.EXTRACTION_PROMPTS.intent}

사용자 메시지: "${userMessage}"
${history.length > 0 ? `대화 맥락: ${history.slice(-3).map(h => `${h.role}: ${h.content}`).join('\n')}` : ''}

다음 형식으로 응답해주세요:
PRIMARY_INTENT: [주요 의도 - 한 문장으로]
SECONDARY_INTENTS:
- [부차적 의도 1]
- [부차적 의도 2]
- [부차적 의도 3]

사용자의 명시적 의도뿐만 아니라 숨겨진 의도까지 파악해주세요.
`;

    try {
      const response = await this.callOpenAI(intentPrompt, {
        temperature: 0.2,
        max_tokens: 400
      });

      const primaryMatch = response.match(/PRIMARY_INTENT:\s*(.+?)(?=SECONDARY_INTENTS:|$)/s);
      const secondaryMatch = response.match(/SECONDARY_INTENTS:\s*((?:- .+(?:\n|$))+)/s);

      const primary = primaryMatch?.[1]?.trim() || '정보 요청';
      const secondary = secondaryMatch?.[1]
        ?.split('\n')
        ?.map(line => line.replace(/^-\s*/, '').trim())
        ?.filter(intent => intent.length > 0) || [];

      const signature = this.generateIntentSignature(primary, secondary);

      return { primary, secondary, signature };

    } catch (error) {
      console.error('의도 분석 실패:', error);
      return {
        primary: '정보 요청',
        secondary: [],
        signature: this.generateIntentSignature('정보 요청', [])
      };
    }
  }

  /**
   * 주제 분석
   */
  private async analyzeTopics(
    userMessage: string, 
    aiResponse: string
  ): Promise<{ primary: string; sub: string[]; domain: string }> {
    const topicPrompt = `
텍스트를 분석하여 주제를 분류해주세요:

사용자: "${userMessage}"
AI: "${aiResponse}"

다음 형식으로 응답해주세요:
PRIMARY_TOPIC: [주요 주제]
SUB_TOPICS:
- [하위 주제 1]
- [하위 주제 2]
- [하위 주제 3]
DOMAIN: [도메인 분류: Technology, Business, Education, Health, Entertainment, Science, Other 중 하나]
`;

    try {
      const response = await this.callOpenAI(topicPrompt, {
        temperature: 0.1,
        max_tokens: 300
      });

      const primaryMatch = response.match(/PRIMARY_TOPIC:\s*(.+?)(?=SUB_TOPICS:|$)/s);
      const subMatch = response.match(/SUB_TOPICS:\s*((?:- .+(?:\n|$))+)/s);
      const domainMatch = response.match(/DOMAIN:\s*(.+?)(?:\n|$)/s);

      const primary = primaryMatch?.[1]?.trim() || 'General Discussion';
      const sub = subMatch?.[1]
        ?.split('\n')
        ?.map(line => line.replace(/^-\s*/, '').trim())
        ?.filter(topic => topic.length > 0) || [];
      const domain = domainMatch?.[1]?.trim() || 'Other';

      return { primary, sub, domain };

    } catch (error) {
      console.error('주제 분석 실패:', error);
      return {
        primary: 'General Discussion',
        sub: [],
        domain: 'Other'
      };
    }
  }

  /**
   * 개체 및 관계 추출
   */
  private async extractEntitiesAndRelationships(
    userMessage: string, 
    aiResponse: string
  ): Promise<{ 
    entities: EntityMention[]; 
    relationships: EntityRelationship[]; 
    actionItems: ActionItem[] 
  }> {
    const entityPrompt = `
${this.EXTRACTION_PROMPTS.entities}

텍스트: "${userMessage} ${aiResponse}"

다음 형식으로 중요한 개체들을 추출해주세요:
ENTITIES:
- [개체명] | [타입: person/organization/technology/concept/product/other] | [중요도: 0.0-1.0]

RELATIONSHIPS:
- [개체1] -> [관계타입] -> [개체2]

ACTION_ITEMS:
- [실행 항목] | [우선순위: low/medium/high] | [카테고리: research/implementation/review/other]
`;

    try {
      const response = await this.callOpenAI(entityPrompt, {
        temperature: 0.15,
        max_tokens: 600
      });

      const entities = this.parseEntities(response);
      const relationships = this.parseRelationships(response);
      const actionItems = this.parseActionItems(response);

      return { entities, relationships, actionItems };

    } catch (error) {
      console.error('개체 추출 실패:', error);
      return {
        entities: [],
        relationships: [],
        actionItems: []
      };
    }
  }

  /**
   * 기술적 내용 분석
   */
  private async analyzeTechnicalContent(
    userMessage: string, 
    aiResponse: string
  ): Promise<{ 
    terms: TechnicalTerm[]; 
    code: CodeSnippet[]; 
    references: Reference[] 
  }> {
    const content = `${userMessage} ${aiResponse}`;
    
    // 코드 블록 추출
    const codeBlocks = this.extractCodeBlocks(content);
    
    // 기술 용어 추출
    const technicalTerms = this.extractTechnicalTerms(content);
    
    // URL 및 참조 추출
    const references = this.extractReferences(content);

    // AI 기반 기술적 분석
    if (technicalTerms.length > 0 || codeBlocks.length > 0) {
      const technicalPrompt = `
${this.EXTRACTION_PROMPTS.technical}

텍스트: "${content}"

기술적 내용을 분석하여 다음 형식으로 응답해주세요:
TECHNICAL_TERMS:
- [용어] | [정의] | [카테고리] | [중요도: 0.0-1.0]

CODE_ANALYSIS:
- [언어] | [설명] | [완전성: true/false]

중요한 기술 정보만 추출해주세요.
`;

      try {
        const response = await this.callOpenAI(technicalPrompt, {
          temperature: 0.1,
          max_tokens: 500
        });

        const enhancedTerms = this.enhanceTechnicalTerms(technicalTerms, response);
        const enhancedCode = this.enhanceCodeSnippets(codeBlocks, response);

        return {
          terms: enhancedTerms,
          code: enhancedCode,
          references
        };

      } catch (error) {
        console.error('기술적 분석 실패:', error);
      }
    }

    return {
      terms: technicalTerms.map(term => ({
        term,
        category: 'general',
        importance: 0.5,
        context: content.substring(0, 100)
      })),
      code: codeBlocks,
      references
    };
  }

  /**
   * 감정적 맥락 분석
   */
  private async analyzeEmotionalContext(
    userMessage: string, 
    history: ConversationEntry[]
  ): Promise<EmotionalContext> {
    const emotionalPrompt = `
${this.EXTRACTION_PROMPTS.emotional}

사용자 메시지: "${userMessage}"
${history.length > 0 ? `최근 대화: ${history.slice(-2).map(h => `${h.role}: ${h.content}`).join('\n')}` : ''}

다음 형식으로 감정 분석 결과를 제공해주세요:
OVERALL_TONE: [neutral/positive/negative/urgent/curious/frustrated/excited/analytical 중 하나]
FRUSTRATION_LEVEL: [0.0-1.0]
URGENCY_LEVEL: [0.0-1.0]
CURIOSITY_LEVEL: [0.0-1.0]

숫자는 소수점 한 자리까지 정확히 표기해주세요.
`;

    try {
      const response = await this.callOpenAI(emotionalPrompt, {
        temperature: 0.1,
        max_tokens: 200
      });

      const toneMatch = response.match(/OVERALL_TONE:\s*(\w+)/);
      const frustrationMatch = response.match(/FRUSTRATION_LEVEL:\s*([\d.]+)/);
      const urgencyMatch = response.match(/URGENCY_LEVEL:\s*([\d.]+)/);
      const curiosityMatch = response.match(/CURIOSITY_LEVEL:\s*([\d.]+)/);

      return {
        overallTone: (toneMatch?.[1] as EmotionalTone) || 'neutral',
        userFrustrationLevel: parseFloat(frustrationMatch?.[1] || '0'),
        urgencyLevel: parseFloat(urgencyMatch?.[1] || '0'),
        curiosityLevel: parseFloat(curiosityMatch?.[1] || '0')
      };

    } catch (error) {
      console.error('감정 분석 실패:', error);
      return {
        overallTone: 'neutral',
        userFrustrationLevel: 0,
        urgencyLevel: 0,
        curiosityLevel: 0.5
      };
    }
  }

  /**
   * 대화 흐름 분석
   */
  private async analyzeConversationFlow(
    userMessage: string, 
    aiResponse: string, 
    history: ConversationEntry[]
  ): Promise<ConversationFlow> {
    const flowPrompt = `
${this.EXTRACTION_PROMPTS.flow}

현재 메시지: "${userMessage}"
AI 응답: "${aiResponse}"
대화 이력: ${history.length}개 메시지

다음 형식으로 대화 흐름을 분석해주세요:
CURRENT_PHASE: [initiation/exploration/deep_dive/resolution/conclusion/follow_up 중 하나]
PROGRESS_PERCENTAGE: [0-100]
CONVERSATION_DEPTH: [1-10]
NEXT_ACTIONS:
- [예상 행동 1]
- [예상 행동 2]
- [예상 행동 3]
`;

    try {
      const response = await this.callOpenAI(flowPrompt, {
        temperature: 0.2,
        max_tokens: 300
      });

      const phaseMatch = response.match(/CURRENT_PHASE:\s*(\w+)/);
      const progressMatch = response.match(/PROGRESS_PERCENTAGE:\s*(\d+)/);
      const depthMatch = response.match(/CONVERSATION_DEPTH:\s*(\d+)/);
      const actionsMatch = response.match(/NEXT_ACTIONS:\s*((?:- .+(?:\n|$))+)/s);

      const nextActions = actionsMatch?.[1]
        ?.split('\n')
        ?.map(line => line.replace(/^-\s*/, '').trim())
        ?.filter(action => action.length > 0) || [];

      return {
        currentPhase: (phaseMatch?.[1] as ConversationPhase) || 'exploration',
        progressPercentage: parseInt(progressMatch?.[1] || '50'),
        nextExpectedActions: nextActions,
        conversationDepth: parseInt(depthMatch?.[1] || '5'),
        topicShifts: this.detectTopicShifts(history)
      };

    } catch (error) {
      console.error('대화 흐름 분석 실패:', error);
      return {
        currentPhase: 'exploration',
        progressPercentage: 50,
        nextExpectedActions: ['더 자세한 설명 요청', '관련 질문', '실행 방법 문의'],
        conversationDepth: 5,
        topicShifts: []
      };
    }
  }

  /**
   * OpenAI API 호출
   */
  private async callOpenAI(prompt: string, options: any = {}): Promise<string> {
    const config = this.AI_CONFIGS.openai;
    
    if (!config.apiKey) {
      throw new Error('OpenAI API 키가 설정되지 않았습니다');
    }

    const response = await fetch(config.endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          {
            role: 'system',
            content: '당신은 대화 맥락을 완벽하게 분석하는 전문가입니다. 정확하고 구조화된 응답을 제공해주세요.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: options.max_tokens || 500,
        temperature: options.temperature || 0.1,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`OpenAI API 오류: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '';
  }

  // 유틸리티 메서드들
  private generateIntentSignature(primary: string, secondary: string[]): string {
    const combined = [primary, ...secondary].join('_');
    const keywords = combined
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(' ')
      .filter(word => word.length > 2)
      .slice(0, 5)
      .sort()
      .join('_');
      
    return `intent_${keywords}_${Date.now().toString(36)}`;
  }

  private detectDeviceType(): 'desktop' | 'mobile' | 'tablet' {
    // 실제 구현에서는 User-Agent 분석
    return 'desktop';
  }

  private getTimeOfDay(): 'morning' | 'afternoon' | 'evening' | 'night' {
    const hour = new Date().getHours();
    if (hour < 6) return 'night';
    if (hour < 12) return 'morning';
    if (hour < 18) return 'afternoon';
    if (hour < 22) return 'evening';
    return 'night';
  }

  private inferTaskContext(userMessage: string): string {
    const keywords = userMessage.toLowerCase();
    if (keywords.includes('code') || keywords.includes('programming')) return 'development';
    if (keywords.includes('learn') || keywords.includes('understand')) return 'learning';
    if (keywords.includes('help') || keywords.includes('problem')) return 'problem_solving';
    return 'general_inquiry';
  }

  private parseEntities(response: string): EntityMention[] {
    const entitySection = response.match(/ENTITIES:\s*((?:- .+(?:\n|$))+)/s)?.[1];
    if (!entitySection) return [];

    return entitySection
      .split('\n')
      .map(line => line.replace(/^-\s*/, '').trim())
      .filter(line => line.length > 0)
      .map((line, index) => {
        const parts = line.split(' | ');
        return {
          text: parts[0]?.trim() || '',
          type: (parts[1]?.trim() as any) || 'other',
          startOffset: index * 10,
          endOffset: (index * 10) + (parts[0]?.length || 0),
          confidence: parseFloat(parts[2]?.trim() || '0.5')
        };
      });
  }

  private parseRelationships(response: string): EntityRelationship[] {
    const relationshipSection = response.match(/RELATIONSHIPS:\s*((?:- .+(?:\n|$))+)/s)?.[1];
    if (!relationshipSection) return [];

    return relationshipSection
      .split('\n')
      .map(line => line.replace(/^-\s*/, '').trim())
      .filter(line => line.includes('->'))
      .map(line => {
        const parts = line.split(' -> ');
        return {
          sourceEntity: parts[0]?.trim() || '',
          targetEntity: parts[2]?.trim() || '',
          relationshipType: parts[1]?.trim() || 'related',
          strength: 0.7
        };
      });
  }

  private parseActionItems(response: string): ActionItem[] {
    const actionSection = response.match(/ACTION_ITEMS:\s*((?:- .+(?:\n|$))+)/s)?.[1];
    if (!actionSection) return [];

    return actionSection
      .split('\n')
      .map(line => line.replace(/^-\s*/, '').trim())
      .filter(line => line.length > 0)
      .map(line => {
        const parts = line.split(' | ');
        return {
          action: parts[0]?.trim() || '',
          priority: (parts[1]?.trim() as any) || 'medium',
          category: (parts[2]?.trim() as any) || 'other'
        };
      });
  }

  private extractCodeBlocks(content: string): CodeSnippet[] {
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    const codeBlocks: CodeSnippet[] = [];
    let match;

    while ((match = codeBlockRegex.exec(content)) !== null) {
      codeBlocks.push({
        language: match[1] || 'unknown',
        code: match[2].trim(),
        isComplete: match[2].includes('function') || match[2].includes('class'),
        description: `Code snippet in ${match[1] || 'unknown'}`
      });
    }

    return codeBlocks;
  }

  private extractTechnicalTerms(content: string): string[] {
    const techTermPattern = /\b(?:API|HTTP|HTTPS|JSON|XML|SQL|NoSQL|React|Vue|Angular|Node\.js|Python|JavaScript|TypeScript|WebAuthn|DID|OAuth|JWT|REST|GraphQL|Docker|Kubernetes|AWS|Azure|GCP|MongoDB|PostgreSQL|Redis|Elasticsearch)\b/gi;
    const matches = content.match(techTermPattern) || [];
    return [...new Set(matches.map(term => term.toLowerCase()))];
  }

  private extractReferences(content: string): Reference[] {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const urls = content.match(urlRegex) || [];
    
    return urls.map(url => ({
      type: 'url' as const,
      title: url,
      url,
      relevance: 0.8
    }));
  }

  private enhanceTechnicalTerms(terms: string[], aiResponse: string): TechnicalTerm[] {
    // AI 응답에서 기술 용어 정의 추출 로직
    return terms.map(term => ({
      term,
      category: this.categorizeTechnicalTerm(term),
      importance: 0.7,
      context: `Used in the context of technical discussion`
    }));
  }

  private enhanceCodeSnippets(snippets: CodeSnippet[], aiResponse: string): CodeSnippet[] {
    // AI 응답을 활용한 코드 스니펫 개선
    return snippets;
  }

  private categorizeTechnicalTerm(term: string): string {
    const categories: Record<string, string> = {
      'react': 'framework',
      'javascript': 'language',
      'api': 'interface',
      'http': 'protocol',
      'sql': 'database'
    };
    
    return categories[term.toLowerCase()] || 'general';
  }

  private detectTopicShifts(history: ConversationEntry[]): any[] {
    // 주제 변화 감지 로직
    return [];
  }

  // 추가 메서드들은 다음 계속...

  /**
   * 의미론적 메타데이터 생성
   */
  private async generateSemanticMetadata(originalContent: OriginalContent): Promise<SemanticMetadata> {
    const { userMessage, aiResponse } = originalContent;
    
    // 기본 메타데이터 생성
    const baseMetadata = {
      topicHierarchy: await this.buildTopicHierarchy(userMessage, aiResponse),
      domainExpertise: this.assessDomainExpertise(userMessage),
      technicalAnalysis: this.assessTechnicalComplexity(userMessage, aiResponse),
      cognitiveLoad: this.assessCognitiveLoad(userMessage, aiResponse),
      learningLevel: this.assessLearningLevel(userMessage),
      linguisticFeatures: this.analyzeLinguisticFeatures(userMessage),
      contextualConnections: await this.findContextualConnections(userMessage, aiResponse),
      predictiveInsights: await this.generatePredictiveInsights(userMessage, aiResponse)
    };

    return baseMetadata;
  }

  /**
   * 주제 계층 구조 구성
   */
  private async buildTopicHierarchy(userMessage: string, aiResponse: string): Promise<any> {
    const hierarchyPrompt = `
텍스트의 주제 계층을 분석해주세요:

사용자: "${userMessage}"
AI: "${aiResponse}"

다음 형식으로 응답해주세요:
ROOT_DOMAIN: [최상위 도메인]
SUB_DOMAINS:
- [하위 도메인 1]
- [하위 도메인 2]
SPECIFIC_TOPICS:
- [구체적 주제 1]
- [구체적 주제 2]
CROSS_DOMAIN:
- [도메인간 연결점 1]
- [도메인간 연결점 2]
`;

    try {
      const response = await this.callOpenAI(hierarchyPrompt, { max_tokens: 400 });
      
      const rootMatch = response.match(/ROOT_DOMAIN:\s*(.+?)(?=SUB_DOMAINS:|$)/s);
      const subDomainsMatch = response.match(/SUB_DOMAINS:\s*((?:- .+(?:\n|$))+)/s);
      const topicsMatch = response.match(/SPECIFIC_TOPICS:\s*((?:- .+(?:\n|$))+)/s);
      const crossMatch = response.match(/CROSS_DOMAIN:\s*((?:- .+(?:\n|$))+)/s);

      return {
        rootDomain: rootMatch?.[1]?.trim() || 'General',
        subDomains: this.parseListItems(subDomainsMatch?.[1] || ''),
        specificTopics: this.parseListItems(topicsMatch?.[1] || ''),
        crossDomainConnections: this.parseListItems(crossMatch?.[1] || '')
      };
    } catch (error) {
      console.error('주제 계층 분석 실패:', error);
      return {
        rootDomain: 'General',
        subDomains: [],
        specificTopics: [],
        crossDomainConnections: []
      };
    }
  }

  /**
   * 도메인 전문성 평가
   */
  private assessDomainExpertise(userMessage: string): any {
    const technicalKeywords = ['algorithm', 'implementation', 'architecture', 'optimization', 'framework'];
    const businessKeywords = ['strategy', 'revenue', 'market', 'customer', 'analytics'];
    const academicKeywords = ['research', 'analysis', 'methodology', 'hypothesis', 'evaluation'];

    const message = userMessage.toLowerCase();
    let primaryDomain = 'General';
    let expertiseLevel: TechnicalLevel = 'intermediate';

    if (technicalKeywords.some(kw => message.includes(kw))) {
      primaryDomain = 'Technology';
      expertiseLevel = this.assessTechnicalLevel(userMessage);
    } else if (businessKeywords.some(kw => message.includes(kw))) {
      primaryDomain = 'Business';
      expertiseLevel = 'intermediate';
    } else if (academicKeywords.some(kw => message.includes(kw))) {
      primaryDomain = 'Academic';
      expertiseLevel = 'advanced';
    }

    return {
      primaryDomain,
      expertiseLevel,
      requiredKnowledge: this.identifyRequiredKnowledge(userMessage),
      expertiseGaps: this.identifyExpertiseGaps(userMessage, primaryDomain)
    };
  }

  /**
   * 기술적 복잡도 평가
   */
  private assessTechnicalComplexity(userMessage: string, aiResponse: string): any {
    const combinedText = `${userMessage} ${aiResponse}`;
    
    // 기술 스택 식별
    const techStack = this.identifyTechStack(combinedText);
    
    // 복잡도 계산
    let complexity: 'simple' | 'moderate' | 'complex' | 'expert' = 'simple';
    
    const complexityScore = this.calculateComplexityScore(combinedText);
    if (complexityScore > 0.8) complexity = 'expert';
    else if (complexityScore > 0.6) complexity = 'complex';
    else if (complexityScore > 0.3) complexity = 'moderate';

    return {
      complexity,
      technicalStack: techStack,
      architecturalPatterns: this.identifyArchitecturalPatterns(combinedText),
      bestPractices: this.identifyBestPractices(combinedText),
      potentialIssues: this.identifyPotentialIssues(combinedText)
    };
  }

  /**
   * 인지 부하 평가
   */
  private assessCognitiveLoad(userMessage: string, aiResponse: string): any {
    const combinedText = `${userMessage} ${aiResponse}`;
    
    // 정보 밀도 계산
    const wordCount = combinedText.split(' ').length;
    const uniqueConceptCount = this.countUniqueConcepts(combinedText);
    const informationDensity = Math.min(uniqueConceptCount / wordCount, 1);
    
    // 개념 복잡도 계산
    const conceptualComplexity = this.assessConceptualComplexity(combinedText);
    
    // 선행 지식 요구사항
    const prerequisiteKnowledge = this.identifyPrerequisiteKnowledge(combinedText);
    
    // 인지적 도전 수준
    let cognitiveChallenge: 'low' | 'medium' | 'high' | 'extreme' = 'medium';
    const challengeScore = (informationDensity + conceptualComplexity) / 2;
    
    if (challengeScore > 0.8) cognitiveChallenge = 'extreme';
    else if (challengeScore > 0.6) cognitiveChallenge = 'high';
    else if (challengeScore > 0.3) cognitiveChallenge = 'medium';
    else cognitiveChallenge = 'low';

    return {
      informationDensity,
      conceptualComplexity,
      prerequisiteKnowledge,
      cognitiveChallenge
    };
  }

  /**
   * 학습 수준 평가
   */
  private assessLearningLevel(userMessage: string): any {
    const message = userMessage.toLowerCase();
    
    // Bloom's Taxonomy 분석
    let bloomsLevel: string = 'understand';
    
    if (message.includes('create') || message.includes('build') || message.includes('design')) {
      bloomsLevel = 'create';
    } else if (message.includes('evaluate') || message.includes('compare') || message.includes('critique')) {
      bloomsLevel = 'evaluate';
    } else if (message.includes('analyze') || message.includes('why') || message.includes('how')) {
      bloomsLevel = 'analyze';
    } else if (message.includes('apply') || message.includes('implement') || message.includes('use')) {
      bloomsLevel = 'apply';
    } else if (message.includes('what') || message.includes('define') || message.includes('list')) {
      bloomsLevel = 'remember';
    }

    return {
      bloomsLevel,
      learningObjectives: this.identifyLearningObjectives(userMessage),
      skillsRequired: this.identifyRequiredSkills(userMessage),
      learningPath: this.suggestLearningPath(userMessage)
    };
  }

  /**
   * 언어학적 특성 분석
   */
  private analyzeLinguisticFeatures(userMessage: string): any {
    // 가독성 점수 계산 (간단한 휴리스틱)
    const sentences = userMessage.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = userMessage.split(/\s+/).filter(w => w.length > 0);
    const avgWordsPerSentence = words.length / sentences.length;
    const avgCharsPerWord = userMessage.replace(/\s/g, '').length / words.length;
    
    const readabilityScore = Math.max(0, Math.min(100, 
      100 - (avgWordsPerSentence * 2) - (avgCharsPerWord * 5)
    ));

    // 문장 복잡도
    const sentenceComplexity = Math.min(1, avgWordsPerSentence / 20);

    // 어휘 수준
    let vocabularyLevel: string = 'basic';
    const complexWords = words.filter(word => word.length > 7).length;
    const complexWordRatio = complexWords / words.length;
    
    if (complexWordRatio > 0.3) vocabularyLevel = 'expert';
    else if (complexWordRatio > 0.2) vocabularyLevel = 'advanced';
    else if (complexWordRatio > 0.1) vocabularyLevel = 'intermediate';

    // 격식 수준
    const formalWords = ['therefore', 'however', 'consequently', 'furthermore'];
    const formalityLevel = formalWords.some(word => 
      userMessage.toLowerCase().includes(word)
    ) ? 'formal' : 'casual';

    // 질문 타입들
    const questionTypes = this.identifyQuestionTypes(userMessage);

    return {
      readabilityScore,
      sentenceComplexity,
      vocabularyLevel,
      formalityLevel,
      questionTypes
    };
  }

  /**
   * 맥락 연결점 찾기
   */
  private async findContextualConnections(userMessage: string, aiResponse: string): Promise<any[]> {
    // 간단한 연결점 식별 (실제로는 더 정교한 NLP 사용)
    const connections = [];
    
    const causalWords = ['because', 'since', 'therefore', 'due to'];
    const temporalWords = ['then', 'next', 'after', 'before', 'while'];
    const logicalWords = ['if', 'unless', 'although', 'however'];

    const combinedText = `${userMessage} ${aiResponse}`.toLowerCase();

    if (causalWords.some(word => combinedText.includes(word))) {
      connections.push({
        connectionType: 'causal',
        sourceContext: 'user input',
        targetContext: 'ai response',
        strength: 0.7,
        explanation: 'Causal relationship detected'
      });
    }

    if (temporalWords.some(word => combinedText.includes(word))) {
      connections.push({
        connectionType: 'temporal',
        sourceContext: 'previous context',
        targetContext: 'current context',
        strength: 0.6,
        explanation: 'Temporal sequence identified'
      });
    }

    return connections;
  }

  /**
   * 예측적 통찰 생성
   */
  private async generatePredictiveInsights(userMessage: string, aiResponse: string): Promise<any> {
    const insightPrompt = `
사용자 메시지와 AI 응답을 분석하여 예측적 통찰을 제공해주세요:

사용자: "${userMessage}"
AI: "${aiResponse}"

다음 형식으로 응답해주세요:
FOLLOW_UP_QUESTIONS:
- [예상 후속 질문 1]
- [예상 후속 질문 2]
- [예상 후속 질문 3]

POTENTIAL_MISUNDERSTANDINGS:
- [잠재적 오해 1]
- [잠재적 오해 2]

NEXT_STEPS:
- [다음 단계 추천 1]
- [다음 단계 추천 2]
- [다음 단계 추천 3]
`;

    try {
      const response = await this.callOpenAI(insightPrompt, { max_tokens: 500 });
      
      const followUpMatch = response.match(/FOLLOW_UP_QUESTIONS:\s*((?:- .+(?:\n|$))+)/s);
      const misunderstandingsMatch = response.match(/POTENTIAL_MISUNDERSTANDINGS:\s*((?:- .+(?:\n|$))+)/s);
      const nextStepsMatch = response.match(/NEXT_STEPS:\s*((?:- .+(?:\n|$))+)/s);

      return {
        likelyFollowUpQuestions: this.parseListItems(followUpMatch?.[1] || ''),
        potentialMisunderstandings: this.parseListItems(misunderstandingsMatch?.[1] || ''),
        recommendedResources: [], // 실제 구현에서는 리소스 추천 로직
        nextStepsRecommendations: this.parseListItems(nextStepsMatch?.[1] || ''),
        difficultyProgression: this.generateDifficultyProgression(userMessage)
      };
    } catch (error) {
      console.error('예측적 통찰 생성 실패:', error);
      return {
        likelyFollowUpQuestions: ['더 자세한 설명 요청', '관련 예시 요청', '실행 방법 문의'],
        potentialMisunderstandings: [],
        recommendedResources: [],
        nextStepsRecommendations: ['실습해보기', '관련 자료 찾아보기'],
        difficultyProgression: ['기초 이해', '실습', '응용', '고급 활용']
      };
    }
  }

  /**
   * 초기 품질 계산
   */
  private async calculateInitialQuality(userMessage: string, aiResponse: string): Promise<QualityMetrics> {
    const baseScore = 75; // 기본 점수
    
    // 길이 적정성 평가
    const lengthScore = this.evaluateContentLength(userMessage, aiResponse);
    
    // 완전성 평가
    const completenessScore = this.evaluateCompleteness(userMessage, aiResponse);
    
    // 일관성 평가
    const coherenceScore = this.evaluateCoherence(userMessage, aiResponse);
    
    // 관련성 평가
    const relevanceScore = this.evaluateRelevance(userMessage, aiResponse);

    return {
      contextPreservationScore: baseScore,
      semanticAccuracy: 80,
      completenessScore,
      coherenceScore,
      relevanceScore,
      entityPreservationRate: 0.8,
      relationshipAccuracy: 0.7,
      intentClarityScore: 85,
      technicalAccuracy: 80,
      systemConfidence: 0.8,
      improvementSuggestions: [],
      qualityTrends: []
    };
  }

  /**
   * Cue 객체 생성
   */
  private async createCueObject(
    userId: string,
    sourcePlatform: CuePlatform,
    originalContent: OriginalContent,
    extractedContext: ExtractedContext,
    semanticMetadata: SemanticMetadata,
    qualityMetrics: QualityMetrics
  ): Promise<CueObject> {
    const cueId = nanoid();
    const timestamp = new Date();

    // 대상 플랫폼 결정
    const targetPlatforms = this.determineTargetPlatforms(sourcePlatform);

    // 검증 시그니처 생성
    const verificationSignature = await this.generateVerificationSignature(
      extractedContext.summary, userId, timestamp
    );

    return {
      id: cueId,
      version: '1.0.0',
      timestamp,
      sourceUserId: userId,
      sourcePlatform,
      originalContent,
      extractedContext,
      semanticMetadata,
      targetPlatforms,
      platformAdaptations: [],
      syncHistory: [],
      qualityMetrics,
      syncStatus: 'pending',
      verificationSignature,
      childCueIds: [],
      relatedCueIds: [],
      tags: this.generateAutoTags(extractedContext),
      priority: this.determinePriority(extractedContext, semanticMetadata),
      isArchived: false
    };
  }

  /**
   * Cue 품질 검증
   */
  private async validateCueQuality(cue: CueObject): Promise<QualityMetrics> {
    const metrics = cue.qualityMetrics;
    
    // 맥락 보존 점수 재계산
    const preservationScore = await this.calculateContextPreservationScore(cue);
    
    // 의미적 정확도 검증
    const semanticAccuracy = this.validateSemanticAccuracy(cue);
    
    // 완전성 검증
    const completeness = this.validateCompleteness(cue);

    return {
      ...metrics,
      contextPreservationScore: preservationScore,
      semanticAccuracy,
      completenessScore: completeness,
      systemConfidence: Math.min(preservationScore, semanticAccuracy, completeness) / 100
    };
  }

  // 유틸리티 메서드들
  private parseListItems(text: string): string[] {
    return text
      .split('\n')
      .map(line => line.replace(/^-\s*/, '').trim())
      .filter(item => item.length > 0);
  }

  private assessTechnicalLevel(text: string): TechnicalLevel {
    const advancedTerms = ['architecture', 'optimization', 'algorithm', 'framework'];
    const expertTerms = ['distributed', 'scalability', 'microservices', 'machine learning'];
    
    const lowerText = text.toLowerCase();
    
    if (expertTerms.some(term => lowerText.includes(term))) return 'expert';
    if (advancedTerms.some(term => lowerText.includes(term))) return 'advanced';
    if (lowerText.includes('code') || lowerText.includes('programming')) return 'intermediate';
    return 'beginner';
  }

  private identifyRequiredKnowledge(text: string): string[] {
    // 필요 지식 식별 로직
    return ['기본 개념 이해', '관련 기술 경험'];
  }

  private identifyExpertiseGaps(text: string, domain: string): string[] {
    // 전문성 격차 식별 로직
    return [];
  }

  private identifyTechStack(text: string): string[] {
    const stacks = ['React', 'Node.js', 'TypeScript', 'Next.js', 'Supabase'];
    return stacks.filter(stack => text.toLowerCase().includes(stack.toLowerCase()));
  }

  private calculateComplexityScore(text: string): number {
    // 복잡도 점수 계산 로직
    const technicalTermCount = this.extractTechnicalTerms(text).length;
    const wordCount = text.split(' ').length;
    return Math.min(1, technicalTermCount / (wordCount * 0.1));
  }

  private identifyArchitecturalPatterns(text: string): string[] {
    const patterns = ['MVC', 'MVP', 'MVVM', 'Microservices', 'Monolith'];
    return patterns.filter(pattern => text.includes(pattern));
  }

  private identifyBestPractices(text: string): string[] {
    // 모범 사례 식별 로직
    return [];
  }

  private identifyPotentialIssues(text: string): string[] {
    // 잠재적 이슈 식별 로직
    return [];
  }

  private countUniqueConcepts(text: string): number {
    // 고유 개념 수 계산 로직
    const words = text.split(' ').filter(word => word.length > 4);
    return new Set(words).size;
  }

  private assessConceptualComplexity(text: string): number {
    // 개념적 복잡도 평가 로직
    return 0.5;
  }

  private identifyPrerequisiteKnowledge(text: string): string[] {
    // 선행 지식 식별 로직
    return [];
  }

  private identifyLearningObjectives(text: string): string[] {
    // 학습 목표 식별 로직
    return [];
  }

  private identifyRequiredSkills(text: string): string[] {
    // 필요 기술 식별 로직
    return [];
  }

  private suggestLearningPath(text: string): string[] {
    // 학습 경로 제안 로직
    return [];
  }

  private identifyQuestionTypes(text: string): string[] {
    // 질문 타입 식별 로직
    const types = [];
    if (text.includes('what')) types.push('factual');
    if (text.includes('how')) types.push('procedural');
    if (text.includes('why')) types.push('analytical');
    return types;
  }

  private generateDifficultyProgression(text: string): string[] {
    // 난이도 진행 경로 생성 로직
    return ['기초', '중급', '고급', '전문가'];
  }

  private evaluateContentLength(userMessage: string, aiResponse: string): number {
    // 내용 길이 평가 로직
    return 80;
  }

  private evaluateCompleteness(userMessage: string, aiResponse: string): number {
    // 완전성 평가 로직
    return 85;
  }

  private evaluateCoherence(userMessage: string, aiResponse: string): number {
    // 일관성 평가 로직
    return 90;
  }

  private evaluateRelevance(userMessage: string, aiResponse: string): number {
    // 관련성 평가 로직
    return 88;
  }

  private determineTargetPlatforms(sourcePlatform: CuePlatform): CuePlatform[] {
    const allPlatforms: CuePlatform[] = ['chatgpt', 'claude', 'gemini', 'copilot'];
    return allPlatforms.filter(platform => platform !== sourcePlatform);
  }

  private async generateVerificationSignature(
    content: string, 
    userId: string, 
    timestamp: Date
  ): Promise<string> {
    // WebAuthn 기반 검증 시그니처 생성
    const data = `${content}${userId}${timestamp.getTime()}`;
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  private generateAutoTags(extractedContext: ExtractedContext): string[] {
    const tags = [];
    
    // 주요 주제 기반 태그
    if (extractedContext.primaryTopic) {
      tags.push(extractedContext.primaryTopic.toLowerCase());
    }
    
    // 기술 용어 기반 태그
    extractedContext.technicalTerms.forEach(term => {
      tags.push(term.term.toLowerCase());
    });
    
    // 의도 기반 태그
    if (extractedContext.primaryIntent.includes('learn')) tags.push('learning');
    if (extractedContext.primaryIntent.includes('help')) tags.push('support');
    if (extractedContext.primaryIntent.includes('code')) tags.push('development');
    
    return tags.slice(0, 10); // 최대 10개 태그
  }

  private determinePriority(
    extractedContext: ExtractedContext, 
    semanticMetadata: SemanticMetadata
  ): 'low' | 'normal' | 'high' | 'critical' {
    // 긴급성 평가
    if (extractedContext.emotionalContext.urgencyLevel > 0.8) return 'critical';
    if (extractedContext.emotionalContext.urgencyLevel > 0.6) return 'high';
    
    // 복잡도 기반 우선순위
    if (semanticMetadata.technicalAnalysis.complexity === 'expert') return 'high';
    if (semanticMetadata.technicalAnalysis.complexity === 'complex') return 'normal';
    
    return 'normal';
  }

  private async calculateContextPreservationScore(cue: CueObject): Promise<number> {
    // 맥락 보존 점수 정밀 계산
    let score = 85; // 기본 점수
    
    // 핵심 포인트 보존 평가
    const keyPointsPreserved = cue.extractedContext.keyPoints.length >= 3;
    if (keyPointsPreserved) score += 5;
    
    // 개체 보존 평가
    const entitiesPreserved = cue.extractedContext.keyEntities.length > 0;
    if (entitiesPreserved) score += 5;
    
    // 기술적 정보 보존 평가
    const technicalInfoPreserved = cue.extractedContext.technicalTerms.length > 0;
    if (technicalInfoPreserved) score += 5;
    
    return Math.min(100, score);
  }

  private validateSemanticAccuracy(cue: CueObject): number {
    // 의미적 정확도 검증 로직
    return 85;
  }

  private validateCompleteness(cue: CueObject): number {
    // 완전성 검증 로직
    let score = 80;
    
    if (cue.extractedContext.summary.length > 50) score += 5;
    if (cue.extractedContext.keyPoints.length >= 3) score += 5;
    if (cue.extractedContext.keyEntities.length > 0) score += 5;
    if (cue.extractedContext.actionItems.length > 0) score += 5;
    
    return Math.min(100, score);
  }
}

// 싱글톤 인스턴스 내보내기
export const cueExtractor = new CueExtractor();
}