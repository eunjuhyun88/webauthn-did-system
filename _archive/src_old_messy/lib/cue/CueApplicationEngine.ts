// =============================================================================
// 🧠 개선된 CUE 추출 엔진
// 파일: src/lib/cue/CueExtractor.ts
// =============================================================================

import { 
  CueExtractionResult, 
  CueContext,
  CuePattern,
  CueType,
  ExtractedCue,
  CueConfidence,
  PersonalCue
} from '@/types/cue';

import { supabase } from '@/lib/database/supabase';
import config from '@/lib/config';

// =============================================================================
// 핵심 CUE 추출 클래스
// =============================================================================

export class CueExtractor {
  private userId: string;
  private aiModels: string[];

  constructor(userId: string, aiModels: string[] = ['gpt-4', 'claude-3']) {
    this.userId = userId;
    this.aiModels = aiModels;
  }

  // =============================================================================
  // 메인 추출 메소드
  // =============================================================================

  async extractCues(
    input: string, 
    context: CueContext,
    options: {
      minConfidence?: number;
      maxCues?: number;
      enableAI?: boolean;
      enablePatternMatching?: boolean;
    } = {}
  ): Promise<CueExtractionResult> {
    try {
      console.log('🧠 CUE 추출 시작:', { userId: this.userId, inputLength: input.length });

      const {
        minConfidence = 0.6,
        maxCues = 10,
        enableAI = true,
        enablePatternMatching = true
      } = options;

      const extractedCues: ExtractedCue[] = [];
      const processingMetadata: Record<string, unknown> = {
        startTime: Date.now(),
        methods: [],
        models: []
      };

      // 1. 기본 패턴 매칭으로 CUE 추출
      if (enablePatternMatching) {
        const patternCues = await this.extractByPatterns(input, context);
        extractedCues.push(...patternCues);
        processingMetadata.methods.push('pattern_matching');
        console.log(`🎯 패턴 매칭으로 ${patternCues.length}개 CUE 추출됨`);
      }

      // 2. AI 모델로 고급 CUE 추출
      if (enableAI && config.OPENAI_API_KEY) {
        const aiCues = await this.extractByAI(input, context);
        extractedCues.push(...aiCues);
        processingMetadata.methods.push('ai_extraction');
        processingMetadata.models.push(...this.aiModels);
        console.log(`🤖 AI 추출로 ${aiCues.length}개 CUE 추출됨`);
      }

      // 3. 컨텍스트 기반 필터링
      const contextFilteredCues = this.filterByContext(extractedCues, context);
      console.log(`🔍 컨텍스트 필터링 후 ${contextFilteredCues.length}개 CUE 남음`);

      // 4. 신뢰도 기반 필터링
      const confidenceFilteredCues = contextFilteredCues
        .filter(cue => cue.confidence >= minConfidence)
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, maxCues);

      console.log(`✅ 최종 ${confidenceFilteredCues.length}개 CUE 선택됨`);

      // 5. 데이터베이스에 저장
      const savedCues = await this.saveCuesToDatabase(confidenceFilteredCues, context, processingMetadata);

      const result: CueExtractionResult = {
        success: true,
        cues: savedCues,
        totalExtracted: extractedCues.length,
        finalCount: confidenceFilteredCues.length,
        processingTime: Date.now() - (processingMetadata.startTime as number),
        metadata: processingMetadata,
        context
      };

      return result;

    } catch (error) {
      console.error('❌ CUE 추출 실패:', error);
      return {
        success: false,
        cues: [],
        totalExtracted: 0,
        finalCount: 0,
        processingTime: 0,
        error: error instanceof Error ? error.message : '알 수 없는 오류',
        context
      };
    }
  }

  // =============================================================================
  // 패턴 기반 CUE 추출
  // =============================================================================

  private async extractByPatterns(input: string, context: CueContext): Promise<ExtractedCue[]> {
    const patterns: CuePattern[] = [
      // 선호도 패턴들
      {
        type: 'preference',
        regex: /(?:저는|나는|내가)\s+(.+?)(?:을|를)\s+(?:좋아해|선호해|즐겨)/gi,
        confidenceBoost: 0.8,
        description: '개인 선호도 표현'
      },
      {
        type: 'preference', 
        regex: /(?:저는|나는|내가)\s+(.+?)(?:을|를)\s+(?:싫어해|별로|안 좋아해)/gi,
        confidenceBoost: 0.7,
        description: '개인 비선호도 표현'
      },

      // 의도 패턴들
      {
        type: 'intent',
        regex: /(?:저는|나는|내가)\s+(.+?)(?:하고 싶어|할 예정|할 계획)/gi,
        confidenceBoost: 0.9,
        description: '의도 및 계획 표현'
      },
      {
        type: 'intent',
        regex: /(?:도움|도와|알려|설명|분석|생성)(?:줘|달라|해줘|해주세요)/gi,
        confidenceBoost: 0.8,
        description: '도움 요청 의도'
      },

      // 컨텍스트 패턴들
      {
        type: 'context',
        regex: /(?:요즘|최근에|지금|현재)\s+(.+?)(?:하고 있어|중이야|상황)/gi,
        confidenceBoost: 0.7,
        description: '현재 상황 컨텍스트'
      },
      {
        type: 'context',
        regex: /(?:회사에서|직장에서|업무상|프로젝트에서)\s+(.+)/gi,
        confidenceBoost: 0.8,
        description: '업무 컨텍스트'
      },

      // 지식 패턴들
      {
        type: 'knowledge',
        regex: /(?:알고 있는|배운|경험한|해본)\s+(.+?)(?:이야|있어|적이)/gi,
        confidenceBoost: 0.6,
        description: '기존 지식 및 경험'
      },
      {
        type: 'knowledge',
        regex: /(?:전문가|전문적|숙련된|능숙한)\s+(.+?)(?:분야|영역|기술)/gi,
        confidenceBoost: 0.9,
        description: '전문 지식 영역'
      },

      // 행동 패턴들
      {
        type: 'behavior',
        regex: /(?:항상|자주|보통|때때로|가끔)\s+(.+?)(?:해|한다|하곤)/gi,
        confidenceBoost: 0.7,
        description: '행동 패턴'
      },
      {
        type: 'behavior',
        regex: /(?:습관적으로|매일|주로|대부분)\s+(.+)/gi,
        confidenceBoost: 0.8,
        description: '습관적 행동'
      },

      // 감정 및 상태 패턴들
      {
        type: 'emotion',
        regex: /(?:기분이|느낌이|마음이)\s+(.+?)(?:해|다|네)/gi,
        confidenceBoost: 0.6,
        description: '감정 상태'
      },
      {
        type: 'emotion',
        regex: /(?:스트레스|압박감|부담|걱정|불안)\s*(?:받고|느끼고|있어)/gi,
        confidenceBoost: 0.7,
        description: '스트레스 및 부정적 감정'
      }
    ];

    const extractedCues: ExtractedCue[] = [];

    for (const pattern of patterns) {
      const matches = Array.from(input.matchAll(pattern.regex));
      
      for (const match of matches) {
        const extractedText = match[1]?.trim() || match[0].trim();
        
        if (extractedText && extractedText.length > 2) {
          const confidence = this.calculatePatternConfidence(pattern, match, context);
          
          extractedCues.push({
            type: pattern.type as CueType,
            content: extractedText,
            originalText: match[0],
            confidence,
            source: 'pattern_matching',
            context: {
              ...context,
              patternUsed: pattern.description,
              matchPosition: match.index
            },
            extractedAt: new Date(),
            metadata: {
              pattern: pattern.description,
              regex: pattern.regex.source,
              confidenceBoost: pattern.confidenceBoost
            }
          });
        }
      }
    }

    // 중복 제거
    return this.deduplicateCues(extractedCues);
  }

  // =============================================================================
  // AI 기반 CUE 추출
  // =============================================================================

  private async extractByAI(input: string, context: CueContext): Promise<ExtractedCue[]> {
    if (!config.OPENAI_API_KEY) {
      console.log('⚠️ OpenAI API 키가 없어 AI 추출을 건너뜁니다');
      return [];
    }

    try {
      // AI 프롬프트 구성
      const systemPrompt = `당신은 대화에서 개인화된 CUE(단서)를 추출하는 전문가입니다.

사용자의 텍스트에서 다음 5가지 유형의 CUE를 추출하세요:
1. preference (선호도): 좋아하는 것, 싫어하는 것, 취향
2. intent (의도): 하고 싶은 것, 목표, 계획
3. context (컨텍스트): 현재 상황, 환경, 배경
4. knowledge (지식): 알고 있는 것, 경험, 전문성
5. behavior (행동): 습관, 패턴, 루틴

각 CUE에 대해 다음 JSON 형식으로 응답하세요:
{
  "cues": [
    {
      "type": "preference|intent|context|knowledge|behavior",
      "content": "추출된 CUE 내용",
      "confidence": 0.0-1.0,
      "explanation": "추출 근거 설명"
    }
  ]
}

신뢰도는 다음 기준으로 설정하세요:
- 0.9-1.0: 매우 명확하고 확실한 CUE
- 0.7-0.9: 명확한 CUE
- 0.5-0.7: 추론 가능한 CUE
- 0.3-0.5: 불확실하지만 가능성 있는 CUE
- 0.0-0.3: 매우 불확실한 CUE`;

      const userPrompt = `다음 텍스트에서 개인화된 CUE를 추출해주세요:

컨텍스트: ${JSON.stringify(context)}
텍스트: "${input}"

오직 JSON 형식으로만 응답하세요.`;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.3,
          max_tokens: 2000
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API 오류: ${response.status}`);
      }

      const data = await response.json();
      const aiResponse = data.choices[0]?.message?.content;

      if (!aiResponse) {
        throw new Error('AI 응답이 비어있습니다');
      }

      // JSON 파싱
      const parsedResponse = JSON.parse(aiResponse);
      const aiCues: ExtractedCue[] = parsedResponse.cues.map((cue: any) => ({
        type: cue.type as CueType,
        content: cue.content,
        originalText: input,
        confidence: Math.max(0, Math.min(1, cue.confidence)),
        source: 'ai_extraction',
        context: {
          ...context,
          aiModel: 'gpt-4',
          aiExplanation: cue.explanation
        },
        extractedAt: new Date(),
        metadata: {
          aiModel: 'gpt-4',
          explanation: cue.explanation,
          rawResponse: aiResponse
        }
      }));

      console.log(`🤖 AI로 ${aiCues.length}개 CUE 추출됨`);
      return aiCues;

    } catch (error) {
      console.error('❌ AI CUE 추출 실패:', error);
      return [];
    }
  }

  // =============================================================================
  // 유틸리티 메소드들
  // =============================================================================

  private calculatePatternConfidence(
    pattern: CuePattern, 
    match: RegExpMatchArray, 
    context: CueContext
  ): number {
    let confidence = pattern.confidenceBoost;

    // 컨텍스트 부스트
    if (context.platform === 'chat' && pattern.type === 'intent') {
      confidence += 0.1;
    }

    // 텍스트 길이 기반 조정
    const extractedText = match[1] || match[0];
    if (extractedText.length < 5) {
      confidence -= 0.2;
    } else if (extractedText.length > 50) {
      confidence -= 0.1;
    }

    // 특수 키워드 부스트
    const boostKeywords = ['항상', '자주', '매일', '매번', '절대', '정말', '진짜'];
    if (boostKeywords.some(keyword => extractedText.includes(keyword))) {
      confidence += 0.1;
    }

    return Math.max(0, Math.min(1, confidence));
  }

  private filterByContext(cues: ExtractedCue[], context: CueContext): ExtractedCue[] {
    return cues.filter(cue => {
      // 플랫폼별 필터링
      if (context.platform === 'email' && cue.type === 'emotion') {
        return cue.confidence > 0.7; // 이메일에서 감정 CUE는 더 높은 신뢰도 요구
      }

      // 컨텍스트 관련성 확인
      if (context.domain && !this.isRelevantToDomain(cue, context.domain)) {
        return false;
      }

      return true;
    });
  }

  private isRelevantToDomain(cue: ExtractedCue, domain: string): boolean {
    const domainKeywords: Record<string, string[]> = {
      'business': ['업무', '프로젝트', '회의', '고객', '매출', '계약'],
      'personal': ['개인', '취미', '가족', '친구', '휴가', '건강'],
      'technical': ['개발', '코딩', '시스템', '데이터', '알고리즘', '프로그래밍']
    };

    const keywords = domainKeywords[domain] || [];
    return keywords.some(keyword => 
      cue.content.includes(keyword) || cue.originalText.includes(keyword)
    );
  }

  private deduplicateCues(cues: ExtractedCue[]): ExtractedCue[] {
    const uniqueCues: ExtractedCue[] = [];
    const seenContents = new Set<string>();

    for (const cue of cues) {
      const normalizedContent = cue.content.toLowerCase().trim();
      
      if (!seenContents.has(normalizedContent)) {
        seenContents.add(normalizedContent);
        uniqueCues.push(cue);
      } else {
        // 기존 CUE의 신뢰도 업데이트
        const existingIndex = uniqueCues.findIndex(
          existing => existing.content.toLowerCase().trim() === normalizedContent
        );
        
        if (existingIndex !== -1 && cue.confidence > uniqueCues[existingIndex].confidence) {
          uniqueCues[existingIndex] = cue;
        }
      }
    }

    return uniqueCues;
  }

  // =============================================================================
  // 데이터베이스 저장
  // =============================================================================

  private async saveCuesToDatabase(
    cues: ExtractedCue[], 
    context: CueContext,
    processingMetadata: Record<string, unknown>
  ): Promise<PersonalCue[]> {
    const savedCues: PersonalCue[] = [];

    for (const cue of cues) {
      try {
        const cueData = {
          user_id: this.userId,
          cue_type: cue.type,
          cue_category: context.domain || 'general',
          cue_name: this.generateCueName(cue),
          cue_description: cue.metadata?.explanation || `${cue.type} CUE extracted from ${context.platform}`,
          cue_data: {
            content: cue.content,
            originalText: cue.originalText,
            source: cue.source,
            extractedAt: cue.extractedAt.toISOString()
          },
          confidence_score: cue.confidence,
          context_data: cue.context,
          platform_source: context.platform,
          original_input: cue.originalText,
          processed_input: cue,
          ai_model_used: cue.metadata?.aiModel || null,
          processing_metadata: {
            ...processingMetadata,
            cueMetadata: cue.metadata
          }
        };

        const { data, error } = await supabase
          .from('personal_cues')
          .insert(cueData)
          .select()
          .single();

        if (error) {
          console.error('❌ CUE 저장 실패:', error);
          continue;
        }

        if (data) {
          savedCues.push(data as PersonalCue);
          console.log(`✅ CUE 저장됨: ${cue.type} - ${cue.content.substring(0, 50)}...`);
        }

      } catch (error) {
        console.error('❌ CUE 저장 중 오류:', error);
      }
    }

    return savedCues;
  }

  private generateCueName(cue: ExtractedCue): string {
    const maxLength = 100;
    let name = `${cue.type}: ${cue.content}`;
    
    if (name.length > maxLength) {
      name = name.substring(0, maxLength - 3) + '...';
    }

    return name;
  }

  // =============================================================================
  // 기존 CUE 조회 및 활용
  // =============================================================================

  async getUserCues(
    options: {
      types?: CueType[];
      minConfidence?: number;
      limit?: number;
      category?: string;
    } = {}
  ): Promise<PersonalCue[]> {
    try {
      let query = supabase
        .from('personal_cues')
        .select('*')
        .eq('user_id', this.userId)
        .eq('status', 'active');

      if (options.types?.length) {
        query = query.in('cue_type', options.types);
      }

      if (options.minConfidence) {
        query = query.gte('confidence_score', options.minConfidence);
      }

      if (options.category) {
        query = query.eq('cue_category', options.category);
      }

      query = query
        .order('confidence_score', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(options.limit || 50);

      const { data, error } = await query;

      if (error) {
        console.error('❌ CUE 조회 실패:', error);
        return [];
      }

      return data as PersonalCue[];

    } catch (error) {
      console.error('❌ CUE 조회 중 오류:', error);
      return [];
    }
  }

  async getRelevantCues(context: CueContext, limit: number = 10): Promise<PersonalCue[]> {
    try {
      const { data, error } = await supabase
        .from('personal_cues')
        .select('*')
        .eq('user_id', this.userId)
        .eq('status', 'active')
        .contains('context_data', { platform: context.platform })
        .order('confidence_score', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('❌ 관련 CUE 조회 실패:', error);
        return [];
      }

      return data as PersonalCue[];

    } catch (error) {
      console.error('❌ 관련 CUE 조회 중 오류:', error);
      return [];
    }
  }
}

// =============================================================================
// 팩토리 함수
// =============================================================================

export function createCueExtractor(userId: string): CueExtractor {
  return new CueExtractor(userId);
}

// 기본 내보내기
export default CueExtractor;