// =============================================================================
// 🎯 Cue 적용 엔진 - AI 응답 개인화의 핵심
// src/lib/cue/CueApplicationEngine.ts
// 추출된 개인화 큐를 실제 AI 상호작용에 적용하여 맞춤형 응답 생성
// =============================================================================

import { 
  PersonalCue, 
  CueUsageHistory, 
  CueAwareAgent, 
  CueContext,
  CueType 
} from '@/types/cue';

export interface ApplicationContext {
  userQuery: string;
  platform: string;
  conversationId?: string;
  timeOfDay: 'morning' | 'afternoon' | 'evening';
  contextTags: string[];
  urgency: 'low' | 'medium' | 'high';
  taskType: 'learning' | 'problem_solving' | 'creation' | 'general';
  metadata?: Record<string, any>;
}

export interface CueApplication {
  cueId: string;
  cue: PersonalCue;
  applicationMethod: 'automatic' | 'suggested' | 'manual';
  confidence: number;
  reasoning: string;
  modification: string; // 실제로 적용될 수정 사항
  priority: number;
}

export interface ApplicationResult {
  originalQuery: string;
  modifiedQuery: string;
  appliedCues: CueApplication[];
  systemPromptAdditions: string[];
  responseGuidelines: string[];
  confidenceScore: number;
  applicationReasoning: string;
  estimatedImprovement: number; // 0.0 ~ 1.0
}

export class CueApplicationEngine {
  private cueDatabase: Map<string, PersonalCue[]>;
  private usageHistory: CueUsageHistory[];
  private contextAnalyzer: ApplicationContextAnalyzer;

  constructor() {
    this.cueDatabase = new Map();
    this.usageHistory = [];
    this.contextAnalyzer = new ApplicationContextAnalyzer();
  }

  // =============================================================================
  // 🎯 메인 적용 메서드 - 쿼리에 Cue 적용
  // =============================================================================

  async applyCuesToQuery(
    userDid: string,
    context: ApplicationContext,
    availableCues?: PersonalCue[]
  ): Promise<ApplicationResult> {
    
    try {
      // 1. 관련 큐 가져오기
      const relevantCues = availableCues || await this.getRelevantCues(userDid, context);
      
      // 2. 컨텍스트 분석
      const contextAnalysis = this.contextAnalyzer.analyzeContext(context);
      
      // 3. 큐 필터링 및 랭킹
      const rankedCues = this.rankCuesByRelevance(relevantCues, context, contextAnalysis);
      
      // 4. 적용할 큐 선택
      const selectedCues = this.selectCuesForApplication(rankedCues, context);
      
      // 5. 쿼리 및 시스템 프롬프트 수정
      const applicationResult = this.buildApplicationResult(context, selectedCues);
      
      // 6. 사용 이력 기록
      await this.recordUsage(userDid, selectedCues, context, applicationResult);
      
      return applicationResult;
      
    } catch (error) {
      console.error('Cue application failed:', error);
      
      // 실패 시 원본 쿼리 반환
      return {
        originalQuery: context.userQuery,
        modifiedQuery: context.userQuery,
        appliedCues: [],
        systemPromptAdditions: [],
        responseGuidelines: [],
        confidenceScore: 0,
        applicationReasoning: `Application failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        estimatedImprovement: 0
      };
    }
  }

  // =============================================================================
  // 🔍 관련 큐 검색 및 필터링
  // =============================================================================

  private async getRelevantCues(
    userDid: string, 
    context: ApplicationContext
  ): Promise<PersonalCue[]> {
    // 실제 구현에서는 데이터베이스 쿼리
    const allCues = this.cueDatabase.get(userDid) || [];
    
    return allCues.filter(cue => {
      // 활성 상태 확인
      if (!cue.isActive) return false;
      
      // 신뢰도 임계값 확인
      if (cue.confidenceScore < 0.3) return false;
      
      // 컨텍스트 적용 가능성 확인
      if (cue.applicableContexts.length > 0) {
        const hasMatchingContext = cue.applicableContexts.some(ctx => 
          ctx === context.platform || 
          context.contextTags.includes(ctx)
        );
        if (!hasMatchingContext) return false;
      }
      
      // 시간 기반 필터링 (decay 적용)
      const daysSinceLastReinforced = (Date.now() - cue.lastReinforced.getTime()) / (1000 * 60 * 60 * 24);
      const decayedConfidence = cue.confidenceScore * Math.exp(-cue.decayRate * daysSinceLastReinforced);
      
      return decayedConfidence >= 0.2;
    });
  }

  // =============================================================================
  // 📊 큐 관련성 순위 매기기
  // =============================================================================

  private rankCuesByRelevance(
    cues: PersonalCue[],
    context: ApplicationContext,
    contextAnalysis: any
  ): CueApplication[] {
    const applications: CueApplication[] = [];

    for (const cue of cues) {
      const relevanceScore = this.calculateRelevanceScore(cue, context, contextAnalysis);
      
      if (relevanceScore > 0.3) {
        applications.push({
          cueId: cue.id,
          cue,
          applicationMethod: this.determineApplicationMethod(cue, relevanceScore),
          confidence: relevanceScore,
          reasoning: this.generateApplicationReasoning(cue, context, relevanceScore),
          modification: this.generateModification(cue, context),
          priority: Math.round(relevanceScore * 10)
        });
      }
    }

    // 신뢰도와 우선순위로 정렬
    return applications.sort((a, b) => {
      if (a.priority !== b.priority) return b.priority - a.priority;
      return b.confidence - a.confidence;
    });
  }

  // =============================================================================
  // 🧮 관련성 점수 계산 (핵심 알고리즘!)
  // =============================================================================

  private calculateRelevanceScore(
    cue: PersonalCue,
    context: ApplicationContext,
    contextAnalysis: any
  ): number {
    let score = cue.confidenceScore; // 기본 신뢰도로 시작

    // 1. 큐 타입별 가중치
    const typeWeights = {
      preference: 0.9,    // 선호도는 항상 중요
      goal: 0.8,         // 목표도 중요
      expertise: 0.7,    // 전문성 관련
      communication: 0.6, // 커뮤니케이션 스타일
      workflow: 0.5,     // 워크플로우
      context: 0.4,      // 컨텍스트
      behavior: 0.3      // 행동 패턴
    };
    score *= typeWeights[cue.cueType] || 0.5;

    // 2. 컨텍스트 일치도
    if (cue.applicableContexts.includes(context.platform)) {
      score *= 1.2;
    }

    // 3. 시간대 패턴 매칭
    if (cue.key === 'active_time' && cue.value === context.timeOfDay) {
      score *= 1.15;
    }

    // 4. 작업 타입 매칭
    if (cue.cueType === 'goal' && cue.value === context.taskType) {
      score *= 1.3;
    }

    // 5. 사용 빈도 가중치
    score *= Math.min(1.2, 1 + (cue.usageFrequency / 10));

    // 6. 최근 사용 이력
    if (cue.lastUsed) {
      const daysSinceLastUse = (Date.now() - cue.lastUsed.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceLastUse < 7) {
        score *= 1.1; // 최근 사용된 큐는 약간 높은 점수
      }
    }

    // 7. 컨텍스트 특이성
    if (cue.contextSpecificity === 'task_specific' && this.isTaskSpecificMatch(cue, context)) {
      score *= 1.25;
    } else if (cue.contextSpecificity === 'general') {
      score *= 1.05; // 일반적인 큐는 약간의 보너스
    }

    // 8. 키워드 매칭
    const keywordMatch = this.calculateKeywordMatch(cue, context.userQuery);
    score *= (1 + keywordMatch * 0.3);

    // 9. 우선순위 적용
    score *= (cue.priority / 10);

    return Math.min(1.0, Math.max(0.0, score));
  }

  // =============================================================================
  // 🎯 큐 적용 방식 결정
  // =============================================================================

  private determineApplicationMethod(
    cue: PersonalCue, 
    relevanceScore: number
  ): 'automatic' | 'suggested' | 'manual' {
    if (relevanceScore > 0.8 && cue.validationStatus === 'user_confirmed') {
      return 'automatic';
    } else if (relevanceScore > 0.6) {
      return 'suggested';
    } else {
      return 'manual';
    }
  }

  // =============================================================================
  // 📝 수정 사항 생성
  // =============================================================================

  private generateModification(cue: PersonalCue, context: ApplicationContext): string {
    switch (cue.cueType) {
      case 'preference':
        return this.generatePreferenceModification(cue, context);
      case 'communication':
        return this.generateCommunicationModification(cue, context);
      case 'expertise':
        return this.generateExpertiseModification(cue, context);
      case 'goal':
        return this.generateGoalModification(cue, context);
      default:
        return `Apply ${cue.key}: ${cue.value}`;
    }
  }

  private generatePreferenceModification(cue: PersonalCue, context: ApplicationContext): string {
    switch (cue.key) {
      case 'response_length':
        if (cue.value === 'brief') {
          return '응답을 간결하고 핵심적으로 작성하세요.';
        } else if (cue.value === 'detailed') {
          return '상세하고 포괄적인 설명을 제공하세요.';
        }
        break;
      
      case 'examples':
        if (cue.value === 'preferred') {
          return '실용적인 예시와 코드 샘플을 포함하세요.';
        }
        break;
        
      case 'programming_language':
        return `${cue.value} 언어로 예시 코드를 작성하세요.`;
        
      case 'format':
        if (cue.value === 'list') {
          return '정보를 목록이나 번호 형태로 구조화하세요.';
        } else if (cue.value === 'step_by_step') {
          return '단계별로 차근차근 설명하세요.';
        }
        break;
    }
    
    return `${cue.description}에 따라 응답을 조정하세요.`;
  }

  private generateCommunicationModification(cue: PersonalCue, context: ApplicationContext): string {
    switch (cue.key) {
      case 'politeness':
        if (cue.value === 'formal') {
          return '정중하고 공손한 톤으로 응답하세요.';
        } else if (cue.value === 'casual') {
          return '친근하고 편안한 톤으로 대화하세요.';
        }
        break;
        
      case 'emoji_usage':
        if (cue.value === 'frequent') {
          return '적절한 이모지를 사용하여 감정을 표현하세요.';
        }
        break;
    }
    
    return `커뮤니케이션 스타일: ${cue.description}`;
  }

  private generateExpertiseModification(cue: PersonalCue, context: ApplicationContext): string {
    if (cue.key === 'domain' && context.contextTags.includes(cue.value)) {
      return `${cue.value} 전문 지식을 활용하여 답변하세요.`;
    } else if (cue.key === 'level') {
      if (cue.value === 'beginner') {
        return '기초부터 차근차근 설명하고 어려운 용어는 쉽게 풀어서 설명하세요.';
      } else if (cue.value === 'advanced') {
        return '고급 개념과 심화 내용을 포함하여 전문적으로 답변하세요.';
      }
    }
    
    return `전문성 수준 (${cue.value})에 맞게 답변 깊이를 조정하세요.`;
  }

  private generateGoalModification(cue: PersonalCue, context: ApplicationContext): string {
    switch (cue.value) {
      case 'learning':
        return '학습에 도움이 되도록 교육적 관점에서 설명하고 추가 학습 자료를 제안하세요.';
      case 'problem_solving':
        return '문제 해결에 집중하여 구체적이고 실행 가능한 솔루션을 제시하세요.';
      case 'creation':
        return '창작과 개발에 도움이 되는 창의적이고 실용적인 아이디어를 제공하세요.';
      default:
        return `목적 (${cue.value})에 맞게 답변을 최적화하세요.`;
    }
  }

  // =============================================================================
  // 🏗️ 최종 적용 결과 구성
  // =============================================================================

  private buildApplicationResult(
    context: ApplicationContext,
    selectedCues: CueApplication[]
  ): ApplicationResult {
    const systemPromptAdditions: string[] = [];
    const responseGuidelines: string[] = [];
    let modifiedQuery = context.userQuery;
    
    // 큐별로 수정사항 적용
    for (const application of selectedCues) {
      if (application.applicationMethod === 'automatic') {
        systemPromptAdditions.push(application.modification);
      } else {
        responseGuidelines.push(application.modification);
      }
    }

    // 쿼리 수정 (필요한 경우)
    const queryModifications = this.generateQueryModifications(selectedCues, context);
    if (queryModifications.length > 0) {
      modifiedQuery = `${context.userQuery}\n\n[개인화 요청: ${queryModifications.join(', ')}]`;
    }

    const confidenceScore = selectedCues.length > 0 
      ? selectedCues.reduce((sum, app) => sum + app.confidence, 0) / selectedCues.length 
      : 0;

    const estimatedImprovement = this.calculateEstimatedImprovement(selectedCues);

    return {
      originalQuery: context.userQuery,
      modifiedQuery,
      appliedCues: selectedCues,
      systemPromptAdditions,
      responseGuidelines,
      confidenceScore,
      applicationReasoning: this.generateApplicationReasoning(selectedCues, context),
      estimatedImprovement
    };
  }

  // =============================================================================
  // 🧠 헬퍼 메서드들
  // =============================================================================

  private selectCuesForApplication(
    rankedCues: CueApplication[],
    context: ApplicationContext
  ): CueApplication[] {
    const maxCues = this.determineMaxCues(context);
    return rankedCues.slice(0, maxCues);
  }

  private determineMaxCues(context: ApplicationContext): number {
    // 컨텍스트에 따라 적용할 최대 큐 수 결정
    if (context.urgency === 'high') return 3;
    if (context.taskType === 'learning') return 5;
    return 4;
  }

  private generateQueryModifications(
    selectedCues: CueApplication[],
    context: ApplicationContext
  ): string[] {
    const modifications: string[] = [];
    
    for (const app of selectedCues) {
      if (app.cue.cueType === 'preference' && app.confidence > 0.8) {
        if (app.cue.key === 'response_length' && app.cue.value === 'brief') {
          modifications.push('간결하게');
        } else if (app.cue.key === 'examples' && app.cue.value === 'preferred') {
          modifications.push('예시 포함');
        }
      }
    }
    
    return modifications;
  }

  private calculateEstimatedImprovement(selectedCues: CueApplication[]): number {
    if (selectedCues.length === 0) return 0;
    
    const avgConfidence = selectedCues.reduce((sum, app) => sum + app.confidence, 0) / selectedCues.length;
    const cueCount = selectedCues.length;
    const diversity = new Set(selectedCues.map(app => app.cue.cueType)).size;
    
    return Math.min(1.0, avgConfidence * 0.6 + (cueCount / 10) * 0.3 + (diversity / 7) * 0.1);
  }

  private generateApplicationReasoning(
    selectedCues: CueApplication[],
    context: ApplicationContext
  ): string;
  private generateApplicationReasoning(
    cue: PersonalCue,
    context: ApplicationContext,
    relevanceScore: number
  ): string;
  private generateApplicationReasoning(
    cueOrCues: PersonalCue | CueApplication[],
    context: ApplicationContext,
    relevanceScore?: number
  ): string {
    if (Array.isArray(cueOrCues)) {
      // 전체 적용 추론
      const cues = cueOrCues;
      if (cues.length === 0) {
        return '적용 가능한 개인화 큐가 없어 기본 응답을 제공합니다.';
      }
      
      const cueTypes = [...new Set(cues.map(app => app.cue.cueType))];
      return `${cues.length}개의 개인화 큐 적용: ${cueTypes.join(', ')} 기반으로 맞춤형 응답 생성`;
    } else {
      // 개별 큐 추론
      const cue = cueOrCues;
      return `${cue.cueType} 타입의 "${cue.key}" 설정 (${cue.value})을 적용하여 응답을 개인화합니다. 신뢰도: ${(relevanceScore || 0).toFixed(2)}`;
    }
  }

  private isTaskSpecificMatch(cue: PersonalCue, context: ApplicationContext): boolean {
    // 작업별 특화 매칭 로직
    return cue.tags.some(tag => context.contextTags.includes(tag));
  }

  private calculateKeywordMatch(cue: PersonalCue, query: string): number {
    const cueKeywords = [...cue.tags, cue.key, cue.value.toLowerCase()];
    const queryLower = query.toLowerCase();
    
    const matches = cueKeywords.filter(keyword => 
      queryLower.includes(keyword.toLowerCase())
    );
    
    return matches.length / Math.max(cueKeywords.length, 1);
  }

  private async recordUsage(
    userDid: string,
    applications: CueApplication[],
    context: ApplicationContext,
    result: ApplicationResult
  ): Promise<void> {
    // 실제 구현에서는 데이터베이스에 기록
    for (const app of applications) {
      const usage: CueUsageHistory = {
        id: `usage-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        cueId: app.cueId,
        userDid,
        agentDid: 'system', // 실제로는 사용된 AI agent ID
        interactionId: `interaction-${Date.now()}`,
        conversationContext: context.conversationId,
        queryText: context.userQuery,
        appliedModification: app.modification,
        applicationMethod: app.applicationMethod,
        applicationConfidence: app.confidence,
        contextRelevance: app.confidence, // 간소화
        immediateEffectiveness: result.estimatedImprovement,
        userSatisfaction: 0, // 나중에 피드백으로 업데이트
        responseImprovement: result.estimatedImprovement,
        taskCompletionHelp: result.estimatedImprovement,
        userFeedback: 'no_feedback',
        ledToFollowUp: false,
        createdNewCue: false,
        modifiedExistingCue: false,
        responseTimeImpact: 0,
        tokenUsageImpact: 0,
        usedAt: new Date()
      };
      
      this.usageHistory.push(usage);
    }
  }
}

// =============================================================================
// 🔍 컨텍스트 분석기
// =============================================================================

class ApplicationContextAnalyzer {
  analyzeContext(context: ApplicationContext): any {
    return {
      complexity: this.estimateQueryComplexity(context.userQuery),
      domain: this.detectDomain(context.userQuery),
      intent: this.detectIntent(context.userQuery),
      timeContext: context.timeOfDay,
      platformContext: context.platform
    };
  }

  private estimateQueryComplexity(query: string): 'simple' | 'medium' | 'complex' {
    const wordCount = query.split(' ').length;
    const hasCode = /```|`/.test(query);
    const hasMultipleQuestions = (query.match(/[?？]/g) || []).length > 1;
    
    if (wordCount < 10 && !hasCode && !hasMultipleQuestions) return 'simple';
    if (wordCount > 50 || hasCode || hasMultipleQuestions) return 'complex';
    return 'medium';
  }

  private detectDomain(query: string): string[] {
    const domains: string[] = [];
    const queryLower = query.toLowerCase();
    
    if (/code|program|function|class|javascript|python|typescript/.test(queryLower)) {
      domains.push('programming');
    }
    if (/design|ui|ux|layout|color|font/.test(queryLower)) {
      domains.push('design');
    }
    if (/data|analysis|chart|graph|statistics/.test(queryLower)) {
      domains.push('data_science');
    }
    
    return domains.length > 0 ? domains : ['general'];
  }

  private detectIntent(query: string): 'question' | 'request' | 'command' | 'discussion' {
    const queryLower = query.toLowerCase();
    
    if (/^(what|how|why|when|where|which|who)/.test(queryLower) || /[?？]/.test(query)) {
      return 'question';
    }
    if (/^(please|can you|could you|would you|help me)/.test(queryLower)) {
      return 'request';
    }
    if (/^(create|make|build|generate|write|show|explain)/.test(queryLower)) {
      return 'command';
    }
    
    return 'discussion';
  }
}

export default CueApplicationEngine;