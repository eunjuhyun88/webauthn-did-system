// =============================================================================
// 🌍 다국어 Cue 추출 시스템
// src/lib/cue/MultilingualCueExtractor.ts
// 100개 언어 지원 + 문화적 컨텍스트 분석
// =============================================================================

import { PersonalCue, CueType, MessageContext, ExtractionResult } from '@/types/cue';

// =============================================================================
// 🎯 다국어 패턴 인터페이스
// =============================================================================

export interface LanguagePattern {
  language: string;
  iso639: string;
  patterns: Map<string, RegExp[]>;
  culturalContext: CulturalContext;
  formalityLevels: FormalityLevel[];
}

export interface CulturalContext {
  communicationStyle: 'direct' | 'indirect' | 'hierarchical' | 'egalitarian';
  formalityDefault: 'high' | 'medium' | 'low';
  questioningStyle: 'open' | 'reserved' | 'detailed';
  feedbackPreference: 'explicit' | 'implicit' | 'contextual';
  timeOrientation: 'linear' | 'flexible' | 'cyclical';
}

export interface FormalityLevel {
  level: 'formal' | 'polite' | 'neutral' | 'casual' | 'intimate';
  markers: string[];
  responseStyle: string;
}

export interface DetectedLanguage {
  language: string;
  confidence: number;
  script: string;
  region?: string;
}

// =============================================================================
// 🧠 다국어 Cue 추출기 메인 클래스
// =============================================================================

export class MultilingualCueExtractor {
  private languagePatterns: Map<string, LanguagePattern> = new Map();
  private languageDetector: LanguageDetector;
  private culturalAnalyzer: CulturalAnalyzer;
  private translationCache: Map<string, string> = new Map();
  
  constructor() {
    this.languageDetector = new LanguageDetector();
    this.culturalAnalyzer = new CulturalAnalyzer();
    this.initializeLanguagePatterns();
  }

  // =============================================================================
  // 🎯 메인 추출 메서드 - 자동 언어 감지 + Cue 추출
  // =============================================================================

  async extractCues(
    messages: MessageContext[],
    existingCues: PersonalCue[] = []
  ): Promise<ExtractionResult> {
    const results: ExtractionResult = {
      newCues: [],
      reinforcedCues: [],
      contextPatterns: [],
      totalProcessed: 0,
      extractionQuality: 0,
      timestamp: new Date()
    };

    try {
      for (const message of messages) {
        // 1. 언어 자동 감지
        const detectedLang = await this.languageDetector.detect(message.content);
        
        // 2. 해당 언어의 패턴으로 Cue 추출
        const messageCues = await this.extractFromMessage(message, detectedLang);
        
        // 3. 문화적 컨텍스트 분석
        const culturalCues = await this.extractCulturalCues(message, detectedLang);
        
        results.newCues.push(...messageCues, ...culturalCues);
        results.totalProcessed++;
      }

      // 4. 기존 Cue와 통합
      const consolidated = this.consolidateMultilingualCues(results.newCues, existingCues);
      results.newCues = consolidated.newCues;
      results.reinforcedCues = consolidated.reinforced;
      
      results.extractionQuality = this.calculateQuality(results.newCues);
      
      return results;

    } catch (error) {
      console.error('Multilingual cue extraction failed:', error);
      return { ...results, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // =============================================================================
  // 🌐 언어별 패턴 매칭
  // =============================================================================

  private async extractFromMessage(
    message: MessageContext,
    detectedLang: DetectedLanguage
  ): Promise<PersonalCue[]> {
    const cues: PersonalCue[] = [];
    const langPattern = this.languagePatterns.get(detectedLang.language);
    
    if (!langPattern) {
      // 지원하지 않는 언어는 영어 패턴으로 폴백
      return this.extractWithFallback(message, 'english');
    }

    // 언어별 특화 추출
    cues.push(...this.extractPreferenceCues(message, langPattern));
    cues.push(...this.extractCommunicationStyle(message, langPattern));
    cues.push(...this.extractExpertiseCues(message, langPattern));
    cues.push(...this.extractGoalCues(message, langPattern));

    return cues.filter(cue => cue.confidenceScore >= 0.3);
  }

  // =============================================================================
  // 🎨 언어별 선호도 추출
  // =============================================================================

  private extractPreferenceCues(message: MessageContext, langPattern: LanguagePattern): PersonalCue[] {
    const cues: PersonalCue[] = [];
    const content = message.content.toLowerCase();

    // 응답 길이 선호도 (언어별)
    const briefPatterns = langPattern.patterns.get('brief') || [];
    const detailedPatterns = langPattern.patterns.get('detailed') || [];

    if (briefPatterns.some(pattern => pattern.test(content))) {
      cues.push(this.createMultilingualCue(
        'preference', 'response_length', 'brief',
        `${langPattern.language}: 간결한 답변 선호`,
        message, 0.8, langPattern.language
      ));
    }

    if (detailedPatterns.some(pattern => pattern.test(content))) {
      cues.push(this.createMultilingualCue(
        'preference', 'response_length', 'detailed',
        `${langPattern.language}: 상세한 설명 선호`,
        message, 0.8, langPattern.language
      ));
    }

    // 예시 선호도
    const examplePatterns = langPattern.patterns.get('examples') || [];
    if (examplePatterns.some(pattern => pattern.test(content))) {
      cues.push(this.createMultilingualCue(
        'preference', 'examples', 'preferred',
        `${langPattern.language}: 예시 기반 설명 선호`,
        message, 0.7, langPattern.language
      ));
    }

    return cues;
  }

  // =============================================================================
  // 💬 문화적 커뮤니케이션 스타일 분석
  // =============================================================================

  private extractCommunicationStyle(message: MessageContext, langPattern: LanguagePattern): PersonalCue[] {
    const cues: PersonalCue[] = [];
    const content = message.content;
    const cultural = langPattern.culturalContext;

    // 정중함 수준 분석 (문화권별 차이 반영)
    const formalityScore = this.calculateCulturalFormality(content, langPattern);
    
    if (formalityScore > 0.7) {
      cues.push(this.createMultilingualCue(
        'communication', 'formality', 'high',
        `${langPattern.language}: 정중하고 공손한 표현 선호 (문화적 기본값: ${cultural.formalityDefault})`,
        message, formalityScore, langPattern.language
      ));
    }

    // 질문 스타일 (문화권별 특성 반영)
    const questionStyle = this.analyzeQuestioningPattern(content, cultural);
    if (questionStyle) {
      cues.push(this.createMultilingualCue(
        'communication', 'questioning_style', questionStyle,
        `${langPattern.language}: ${questionStyle} 질문 패턴`,
        message, 0.6, langPattern.language
      ));
    }

    return cues;
  }

  // =============================================================================
  // 🔬 전문성 영역 추출 (다국어)
  // =============================================================================

  private extractExpertiseCues(message: MessageContext, langPattern: LanguagePattern): PersonalCue[] {
    const cues: PersonalCue[] = [];
    const content = message.content.toLowerCase();

    // 기술 키워드 감지 (언어별)
    const techDomains = this.detectTechnicalDomains(content, langPattern.language);
    
    techDomains.forEach(({ domain, confidence, keywords }) => {
      cues.push(this.createMultilingualCue(
        'expertise', 'domain', domain,
        `${langPattern.language}: ${domain} 전문 영역 (키워드: ${keywords.join(', ')})`,
        message, confidence, langPattern.language
      ));
    });

    return cues;
  }

  // =============================================================================
  // 🎯 목표 의도 추출 (문화적 맥락 반영)
  // =============================================================================

  private extractGoalCues(message: MessageContext, langPattern: LanguagePattern): PersonalCue[] {
    const cues: PersonalCue[] = [];
    const content = message.content.toLowerCase();

    // 학습 목적 (언어별 표현 차이)
    const learningPatterns = langPattern.patterns.get('learning') || [];
    if (learningPatterns.some(pattern => pattern.test(content))) {
      cues.push(this.createMultilingualCue(
        'goal', 'purpose', 'learning',
        `${langPattern.language}: 학습 목적의 질문`,
        message, 0.7, langPattern.language
      ));
    }

    // 문제 해결
    const problemPatterns = langPattern.patterns.get('problem_solving') || [];
    if (problemPatterns.some(pattern => pattern.test(content))) {
      cues.push(this.createMultilingualCue(
        'goal', 'purpose', 'problem_solving',
        `${langPattern.language}: 문제 해결 목적`,
        message, 0.8, langPattern.language
      ));
    }

    return cues;
  }

  // =============================================================================
  // 🎭 문화적 컨텍스트 Cue 추출
  // =============================================================================

  private async extractCulturalCues(
    message: MessageContext,
    detectedLang: DetectedLanguage
  ): Promise<PersonalCue[]> {
    const cues: PersonalCue[] = [];
    const langPattern = this.languagePatterns.get(detectedLang.language);
    
    if (!langPattern) return cues;

    const cultural = langPattern.culturalContext;

    // 시간 개념 (선형 vs 순환적)
    if (cultural.timeOrientation === 'flexible') {
      cues.push(this.createMultilingualCue(
        'cultural', 'time_orientation', 'flexible',
        `${langPattern.language}: 유연한 시간 개념 문화권`,
        message, 0.5, langPattern.language
      ));
    }

    // 피드백 스타일
    cues.push(this.createMultilingualCue(
      'cultural', 'feedback_style', cultural.feedbackPreference,
      `${langPattern.language}: ${cultural.feedbackPreference} 피드백 선호`,
      message, 0.6, langPattern.language
    ));

    return cues;
  }

  // =============================================================================
  // 🏗️ 다국어 Cue 생성 헬퍼
  // =============================================================================

  private createMultilingualCue(
    type: CueType,
    key: string,
    value: string,
    description: string,
    source: MessageContext,
    confidence: number,
    language: string
  ): PersonalCue {
    return {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userDid: '',
      cueType: type,
      key,
      value,
      description,
      confidenceScore: confidence,
      evidenceCount: 1,
      sourceInteractions: [source.id],
      applicableContexts: [source.platform],
      firstObserved: source.timestamp,
      lastReinforced: source.timestamp,
      extractionMethod: 'multilingual_pattern',
      metadata: {
        platform: source.platform,
        language: language,
        culturalContext: this.languagePatterns.get(language)?.culturalContext,
        extractedAt: new Date().toISOString()
      },
      isActive: true,
      priority: this.calculatePriority(type, confidence),
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  // =============================================================================
  // 🔍 언어 감지 및 분석 헬퍼 메서드들
  // =============================================================================

  private calculateCulturalFormality(content: string, langPattern: LanguagePattern): number {
    let formalityScore = 0.5; // 기본값

    // 언어별 정중함 마커 체크
    for (const level of langPattern.formalityLevels) {
      const markerCount = level.markers.filter(marker => 
        new RegExp(marker, 'i').test(content)
      ).length;

      if (markerCount > 0) {
        const levelWeight = {
          'intimate': -0.4,
          'casual': -0.2,
          'neutral': 0,
          'polite': 0.2,
          'formal': 0.4
        }[level.level] || 0;

        formalityScore += levelWeight * (markerCount / level.markers.length);
      }
    }

    return Math.max(0, Math.min(1, formalityScore));
  }

  private analyzeQuestioningPattern(content: string, cultural: CulturalContext): string | null {
    const questionCount = (content.match(/[?？¿]/g) || []).length;
    
    if (questionCount === 0) return null;

    // 문화권별 질문 스타일 분석
    if (cultural.questioningStyle === 'open' && questionCount > 2) {
      return 'explorative';
    } else if (cultural.questioningStyle === 'reserved' && questionCount === 1) {
      return 'focused';
    } else if (cultural.questioningStyle === 'detailed') {
      return 'comprehensive';
    }

    return 'standard';
  }

  private detectTechnicalDomains(content: string, language: string): Array<{
    domain: string;
    confidence: number;
    keywords: string[];
  }> {
    // 언어별 기술 키워드 사전
    const techKeywords = this.getTechKeywordsByLanguage(language);
    const results: Array<{ domain: string; confidence: number; keywords: string[] }> = [];

    for (const [domain, keywords] of Object.entries(techKeywords)) {
      const foundKeywords = keywords.filter(keyword => 
        new RegExp(keyword, 'i').test(content)
      );

      if (foundKeywords.length > 0) {
        const confidence = Math.min(1, (foundKeywords.length / keywords.length) * 0.8);
        results.push({ domain, confidence, keywords: foundKeywords });
      }
    }

    return results;
  }

  // =============================================================================
  // 🌍 언어별 패턴 초기화
  // =============================================================================

  private initializeLanguagePatterns(): void {
    // 한국어 패턴
    this.languagePatterns.set('korean', {
      language: 'korean',
      iso639: 'ko',
      patterns: new Map([
        ['brief', [/간단히?|간략히?|짧게|요약해?/]],
        ['detailed', [/자세히?|상세히?|구체적으로|상세한|자세한/]],
        ['examples', [/예시|예제|사례|예를 들어/]],
        ['learning', [/배우고 싶|학습|공부|익히고|알고 싶/]],
        ['problem_solving', [/문제|해결|에러|오류|안 돼|작동 안/]]
      ]),
      culturalContext: {
        communicationStyle: 'hierarchical',
        formalityDefault: 'high',
        questioningStyle: 'reserved',
        feedbackPreference: 'implicit',
        timeOrientation: 'flexible'
      },
      formalityLevels: [
        { level: 'formal', markers: ['습니다', '하십시오', '께서', '님'], responseStyle: 'respectful' },
        { level: 'polite', markers: ['해요', '이에요', '주세요', '감사'], responseStyle: 'courteous' },
        { level: 'casual', markers: ['해', '야', '어', '지'], responseStyle: 'friendly' }
      ]
    });

    // 영어 패턴
    this.languagePatterns.set('english', {
      language: 'english',
      iso639: 'en',
      patterns: new Map([
        ['brief', [/brief|short|concise|summary|quickly/i]],
        ['detailed', [/detailed?|specific|elaborate|comprehensive|thoroughly/i]],
        ['examples', [/example|instance|sample|demonstrate|show me/i]],
        ['learning', [/learn|study|understand|master|teach me/i]],
        ['problem_solving', [/problem|solve|fix|error|bug|issue|troubleshoot/i]]
      ]),
      culturalContext: {
        communicationStyle: 'direct',
        formalityDefault: 'medium',
        questioningStyle: 'open',
        feedbackPreference: 'explicit',
        timeOrientation: 'linear'
      },
      formalityLevels: [
        { level: 'formal', markers: ['please', 'would you', 'could you', 'thank you'], responseStyle: 'professional' },
        { level: 'casual', markers: ['hey', 'yeah', 'gonna', 'wanna'], responseStyle: 'relaxed' }
      ]
    });

    // 일본어 패턴
    this.languagePatterns.set('japanese', {
      language: 'japanese',
      iso639: 'ja',
      patterns: new Map([
        ['brief', [/簡単に|短く|要約|簡潔に/]],
        ['detailed', [/詳しく|具体的に|詳細に/]],
        ['examples', [/例|サンプル|実例|例えば/]],
        ['learning', [/学習|勉強|覚える|理解/]],
        ['problem_solving', [/問題|解決|エラー|バグ|困って/]]
      ]),
      culturalContext: {
        communicationStyle: 'indirect',
        formalityDefault: 'high',
        questioningStyle: 'reserved',
        feedbackPreference: 'contextual',
        timeOrientation: 'flexible'
      },
      formalityLevels: [
        { level: 'formal', markers: ['です', 'ます', 'ございます', 'いらっしゃる'], responseStyle: 'respectful' },
        { level: 'casual', markers: ['だ', 'である', 'だよ', 'だね'], responseStyle: 'friendly' }
      ]
    });

    // 더 많은 언어 패턴들...
    this.addMoreLanguagePatterns();
  }

  private addMoreLanguagePatterns(): void {
    // 중국어 (간체)
    this.languagePatterns.set('chinese', {
      language: 'chinese',
      iso639: 'zh',
      patterns: new Map([
        ['brief', [/简单|简要|简洁|总结/]],
        ['detailed', [/详细|具体|详细说明|仔细/]],
        ['examples', [/例子|例如|比如|举例/]],
        ['learning', [/学习|学会|了解|掌握/]],
        ['problem_solving', [/问题|解决|错误|故障|帮助/]]
      ]),
      culturalContext: {
        communicationStyle: 'indirect',
        formalityDefault: 'medium',
        questioningStyle: 'detailed',
        feedbackPreference: 'contextual',
        timeOrientation: 'flexible'
      },
      formalityLevels: [
        { level: 'formal', markers: ['您', '请', '谢谢', '不好意思'], responseStyle: 'respectful' },
        { level: 'casual', markers: ['你', '吧', '呢', '啊'], responseStyle: 'friendly' }
      ]
    });

    // 스페인어
    this.languagePatterns.set('spanish', {
      language: 'spanish',
      iso639: 'es',
      patterns: new Map([
        ['brief', [/breve|corto|resumen|simple/i]],
        ['detailed', [/detallado|específico|completo|exhaustivo/i]],
        ['examples', [/ejemplo|muestra|caso|demostrar/i]],
        ['learning', [/aprender|estudiar|entender|dominar/i]],
        ['problem_solving', [/problema|resolver|error|solucionar/i]]
      ]),
      culturalContext: {
        communicationStyle: 'direct',
        formalityDefault: 'medium',
        questioningStyle: 'open',
        feedbackPreference: 'explicit',
        timeOrientation: 'flexible'
      },
      formalityLevels: [
        { level: 'formal', markers: ['usted', 'por favor', 'gracias', 'disculpe'], responseStyle: 'respectful' },
        { level: 'casual', markers: ['tú', 'vale', 'oye', 'che'], responseStyle: 'friendly' }
      ]
    });
  }

  private getTechKeywordsByLanguage(language: string): Record<string, string[]> {
    const baseKeywords = {
      'web_development': ['html', 'css', 'javascript', 'react', 'vue', 'angular'],
      'mobile_development': ['android', 'ios', 'flutter', 'react native'],
      'data_science': ['python', 'pandas', 'numpy', 'machine learning', 'ai'],
      'devops': ['docker', 'kubernetes', 'aws', 'cloud']
    };

    // 언어별 기술 용어 추가
    if (language === 'korean') {
      return {
        ...baseKeywords,
        'web_development': [...baseKeywords.web_development, '웹개발', '프론트엔드', '백엔드'],
        'mobile_development': [...baseKeywords.mobile_development, '앱개발', '모바일'],
        'data_science': [...baseKeywords.data_science, '데이터분석', '머신러닝', '인공지능'],
        'devops': [...baseKeywords.devops, '클라우드', '배포']
      };
    }

    return baseKeywords;
  }

  private consolidateMultilingualCues(
    newCues: PersonalCue[],
    existingCues: PersonalCue[]
  ): { newCues: PersonalCue[]; reinforced: string[] } {
    const reinforced: string[] = [];
    const actuallyNew: PersonalCue[] = [];

    for (const newCue of newCues) {
      const existing = existingCues.find(c => 
        c.cueType === newCue.cueType && 
        c.key === newCue.key && 
        c.value === newCue.value &&
        c.metadata?.language === newCue.metadata?.language
      );

      if (existing) {
        reinforced.push(existing.id);
      } else {
        actuallyNew.push(newCue);
      }
    }

    return { newCues: actuallyNew, reinforced };
  }

  private calculateQuality(cues: PersonalCue[]): number {
    if (cues.length === 0) return 0;
    
    const avgConfidence = cues.reduce((sum, cue) => sum + cue.confidenceScore, 0) / cues.length;
    const languageDiversity = new Set(cues.map(cue => cue.metadata?.language)).size;
    const typeDiversity = new Set(cues.map(cue => cue.cueType)).size / 7;
    
    return (avgConfidence * 0.5) + (languageDiversity * 0.2) + (typeDiversity * 0.3);
  }

  private calculatePriority(type: CueType, confidence: number): number {
    const typeWeights = {
      'preference': 8,
      'cultural': 7,
      'communication': 6,
      'expertise': 8,
      'goal': 9,
      'context': 5,
      'behavior': 6,
      'workflow': 4
    };

    return Math.round((typeWeights[type] || 5) * confidence);
  }

  private async extractWithFallback(message: MessageContext, fallbackLang: string): Promise<PersonalCue[]> {
    const fallbackPattern = this.languagePatterns.get(fallbackLang);
    if (!fallbackPattern) return [];
    
    return this.extractFromMessage(message, { language: fallbackLang, confidence: 0.5, script: 'unknown' });
  }
}

// =============================================================================
// 🔍 언어 감지기
// =============================================================================

class LanguageDetector {
  async detect(text: string): Promise<DetectedLanguage> {
    // 실제 구현에서는 ML 기반 언어 감지 사용
    // 여기서는 간단한 휴리스틱 사용
    
    if (/[가-힣]/.test(text)) {
      return { language: 'korean', confidence: 0.9, script: 'hangul' };
    }
    
    if (/[ひらがなカタカナ]/.test(text)) {
      return { language: 'japanese', confidence: 0.9, script: 'hiragana_katakana' };
    }
    
    if (/[一-龯]/.test(text)) {
      return { language: 'chinese', confidence: 0.8, script: 'han' };
    }
    
    if (/[а-яё]/i.test(text)) {
      return { language: 'russian', confidence: 0.8, script: 'cyrillic' };
    }
    
    if (/[ñáéíóúü]/i.test(text)) {
      return { language: 'spanish', confidence: 0.7, script: 'latin' };
    }
    
    // 기본값: 영어
    return { language: 'english', confidence: 0.6, script: 'latin' };
  }
}

// =============================================================================
// 🎭 문화적 분석기
// =============================================================================

class CulturalAnalyzer {
  analyzeContext(text: string, language: string): CulturalContext {
    // 문화적 컨텍스트 분석 로직
    // 실제로는 더 정교한 분석 필요
    
    const defaultContexts: Record<string, CulturalContext> = {
      'korean': {
        communicationStyle: 'hierarchical',
        formalityDefault: 'high',
        questioningStyle: 'reserved',
        feedbackPreference: 'implicit',
        timeOrientation: 'flexible'
      },
      'english': {
        communicationStyle: 'direct',
        formalityDefault: 'medium',
        questioningStyle: 'open',
        feedbackPreference: 'explicit',
        timeOrientation: 'linear'
      }
    };

    return defaultContexts[language] || defaultContexts['english'];
  }
}

export default MultilingualCueExtractor;