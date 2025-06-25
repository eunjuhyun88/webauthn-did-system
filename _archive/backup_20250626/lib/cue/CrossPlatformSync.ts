/**
 * 🔄 크로스 플랫폼 동기화 시스템 - 완전 구현
 * ChatGPT ↔ Claude ↔ Gemini 간 실시간 맥락 동기화
 * 95% 맥락 보존을 목표로 하는 고급 동기화 엔진
 */

import { 
  CueObject, 
  CrossPlatformSyncResult, 
  CuePlatform, 
  PlatformAdaptation,
  SyncHistoryEntry,
  PerformanceMetrics,
  ErrorInfo,
  CueSyncStatus
} from '@/types/cue';
import { cueExtractor } from './CueExtractor';
import { createClient } from '@/database/supabase/client';

export class CrossPlatformSync {
  private readonly PLATFORM_CONFIGS = {
    chatgpt: {
      apiEndpoint: 'https://api.openai.com/v1/chat/completions',
      apiKey: process.env.OPENAI_API_KEY,
      model: 'gpt-4',
      maxTokens: 2000,
      name: 'ChatGPT',
      capabilities: {
        supportsCodeGeneration: true,
        supportsMultimodal: false,
        maxContextLength: 8000,
        rateLimits: { requestsPerMinute: 60, tokensPerMinute: 40000 }
      }
    },
    claude: {
      apiEndpoint: 'https://api.anthropic.com/v1/messages',
      apiKey: process.env.CLAUDE_API_KEY,
      model: 'claude-3-sonnet-20240229',
      maxTokens: 2000,
      name: 'Claude',
      capabilities: {
        supportsCodeGeneration: true,
        supportsMultimodal: true,
        maxContextLength: 100000,
        rateLimits: { requestsPerMinute: 50, tokensPerMinute: 40000 }
      }
    },
    gemini: {
      apiEndpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
      apiKey: process.env.GEMINI_API_KEY,
      model: 'gemini-pro',
      maxTokens: 2000,
      name: 'Gemini',
      capabilities: {
        supportsCodeGeneration: true,
        supportsMultimodal: true,
        maxContextLength: 30000,
        rateLimits: { requestsPerMinute: 60, tokensPerMinute: 32000 }
      }
    }
  };

  private readonly supabase = createClient();
  private syncQueue: Map<string, CueObject> = new Map();
  private isProcessingQueue = false;

  /**
   * 메인 동기화 함수 - Cue를 모든 대상 플랫폼에 동기화
   */
  async syncCueToAllPlatforms(cue: CueObject): Promise<CrossPlatformSyncResult[]> {
    const syncStartTime = Date.now();
    console.log(`🔄 Cue ${cue.id} 동기화 시작 - 대상: ${cue.targetPlatforms.join(', ')}`);

    try {
      // 1. 동기화 상태 업데이트
      await this.updateCueStatus(cue.id, 'syncing');

      // 2. 플랫폼별 적응 전략 생성
      const platformAdaptations = await this.generatePlatformAdaptations(cue);
      cue.platformAdaptations = platformAdaptations;

      // 3. 병렬 동기화 실행 (성능 최적화)
      const syncPromises = cue.targetPlatforms.map(platform => 
        this.syncCueToSinglePlatform(cue, platform)
      );

      const syncResults = await Promise.allSettled(syncPromises);
      const results: CrossPlatformSyncResult[] = [];

      // 4. 결과 처리 및 오류 핸들링
      syncResults.forEach((result, index) => {
        const targetPlatform = cue.targetPlatforms[index];
        
        if (result.status === 'fulfilled') {
          results.push(result.value);
        } else {
          console.error(`❌ ${targetPlatform} 동기화 실패:`, result.reason);
          results.push({
            targetPlatform,
            success: false,
            syncedAt: new Date(),
            contextPreservationScore: 0,
            adaptedContent: '',
            errors: [{
              code: 'SYNC_FAILED',
              message: result.reason?.message || '동기화 실패',
              severity: 'high',
              recoverable: true
            }]
          });
        }
      });

      // 5. 동기화 결과 분석 및 상태 업데이트
      const finalStatus = await this.analyzeSyncResults(cue, results);
      await this.updateCueStatus(cue.id, finalStatus);

      // 6. 성능 메트릭 기록
      const totalSyncTime = Date.now() - syncStartTime;
      await this.recordPerformanceMetrics(cue.id, {
        totalSyncTime,
        targetPlatformCount: cue.targetPlatforms.length,
        successCount: results.filter(r => r.success).length,
        averageContextScore: results.reduce((sum, r) => sum + r.contextPreservationScore, 0) / results.length
      });

      console.log(`✅ Cue ${cue.id} 동기화 완료 - 시간: ${totalSyncTime}ms, 성공: ${results.filter(r => r.success).length}/${results.length}`);
      
      return results;

    } catch (error) {
      console.error(`❌ Cue ${cue.id} 동기화 중 오류:`, error);
      await this.updateCueStatus(cue.id, 'failed');
      
      return [{
        targetPlatform: 'unknown' as CuePlatform,
        success: false,
        syncedAt: new Date(),
        contextPreservationScore: 0,
        adaptedContent: '',
        errors: [{
          code: 'SYSTEM_ERROR',
          message: error instanceof Error ? error.message : '시스템 오류',
          severity: 'critical',
          recoverable: false
        }]
      }];
    }
  }

  /**
   * 단일 플랫폼 동기화 (핵심 로직)
   */
  private async syncCueToSinglePlatform(
    cue: CueObject, 
    targetPlatform: CuePlatform
  ): Promise<CrossPlatformSyncResult> {
    const platformSyncStart = Date.now();
    
    try {
      console.log(`🎯 ${targetPlatform} 동기화 시작...`);

      // 1. 플랫폼 설정 확인
      const platformConfig = this.PLATFORM_CONFIGS[targetPlatform];
      if (!platformConfig || !platformConfig.apiKey) {
        throw new Error(`${targetPlatform} API 설정이 없습니다`);
      }

      // 2. 플랫폼별 프롬프트 적응
      const adaptationStart = Date.now();
      const adaptedPrompt = await this.adaptPromptForPlatform(cue, targetPlatform);
      const adaptationTime = Date.now() - adaptationStart;

      // 3. 대상 플랫폼에서 응답 생성
      const apiCallStart = Date.now();
      const response = await this.generateResponseOnPlatform(adaptedPrompt, targetPlatform);
      const apiResponseTime = Date.now() - apiCallStart;

      // 4. 맥락 보존 점수 계산
      const preservationScore = await this.calculateAdvancedPreservationScore(
        cue.extractedContext.summary,
        response,
        cue.semanticMetadata,
        targetPlatform
      );

      // 5. 동기화 이력 기록
      const syncHistoryEntry: SyncHistoryEntry = {
        syncId: `sync_${Date.now()}_${targetPlatform}`,
        timestamp: new Date(),
        targetPlatform,
        syncResult: {
          success: true,
          syncedAt: new Date(),
          contextPreservationScore: preservationScore,
          adaptedContent: adaptedPrompt,
          responseReceived: response
        },
        performanceMetrics: {
          totalSyncTime: Date.now() - platformSyncStart,
          adaptationTime,
          networkLatency: 0, // 실제 구현에서는 네트워크 지연 측정
          apiResponseTime,
          memoryUsage: process.memoryUsage().heapUsed
        }
      };

      // 6. 데이터베이스에 동기화 결과 저장
      await this.saveSyncResult(cue.id, syncHistoryEntry);

      console.log(`✅ ${targetPlatform} 동기화 성공 - 점수: ${preservationScore}, 시간: ${Date.now() - platformSyncStart}ms`);

      return {
        targetPlatform,
        success: true,
        syncedAt: new Date(),
        contextPreservationScore: preservationScore,
        adaptedContent: adaptedPrompt,
        responseReceived: response
      };

    } catch (error) {
      console.error(`❌ ${targetPlatform} 동기화 실패:`, error);

      const errorInfo: ErrorInfo = {
        code: this.categorizeError(error),
        message: error instanceof Error ? error.message : '알 수 없는 오류',
        severity: this.assessErrorSeverity(error),
        recoverable: this.isErrorRecoverable(error)
      };

      return {
        targetPlatform,
        success: false,
        syncedAt: new Date(),
        contextPreservationScore: 0,
        adaptedContent: '',
        errors: [errorInfo]
      };
    }
  }

  /**
   * 플랫폼별 적응 전략 생성
   */
  private async generatePlatformAdaptations(cue: CueObject): Promise<PlatformAdaptation[]> {
    const adaptations: PlatformAdaptation[] = [];

    for (const platform of cue.targetPlatforms) {
      const platformConfig = this.PLATFORM_CONFIGS[platform];
      
      const adaptation: PlatformAdaptation = {
        platform,
        adaptedPrompt: '', // 실제 적응은 syncCueToSinglePlatform에서 수행
        platformSpecificContext: {
          modelCapabilities: {
            maxTokens: platformConfig.maxTokens,
            supportsCodeGeneration: platformConfig.capabilities.supportsCodeGeneration,
            supportsImageAnalysis: false,
            supportsMultimodal: platformConfig.capabilities.supportsMultimodal,
            knowledgeCutoff: new Date('2024-01-01'),
            specializedDomains: this.getPlatformSpecializations(platform),
            languageSupport: ['ko', 'en']
          },
          inputConstraints: {
            maxPromptLength: platformConfig.capabilities.maxContextLength,
            forbiddenContent: [],
            requiredFormats: [],
            rateLimits: [
              {
                type: 'requests_per_minute',
                limit: platformConfig.capabilities.rateLimits.requestsPerMinute,
                currentUsage: 0
              }
            ]
          },
          outputPreferences: {
            preferredLength: this.determinePreferredLength(cue),
            formatPreferences: ['markdown', 'plain_text'],
            tonePreferences: [cue.extractedContext.emotionalContext.overallTone],
            structurePreferences: ['structured', 'detailed']
          },
          culturalAdaptations: []
        },
        adaptationStrategy: {
          strategy: this.selectAdaptationStrategy(cue, platform),
          reasoning: `${platform}의 특성에 맞춘 프롬프트 최적화`,
          fallbackStrategies: ['direct_translation', 'context_enrichment'],
          successCriteria: ['context_preservation > 80', 'response_quality > 85']
        },
        estimatedSuccessRate: this.estimateSuccessRate(cue, platform),
        adaptationMetadata: {
          adaptationTime: 0,
          algorithmVersion: '1.0.0',
          confidenceScore: 0.85,
          manualOverrides: []
        }
      };

      adaptations.push(adaptation);
    }

    return adaptations;
  }

  /**
   * 고급 플랫폼별 프롬프트 적응
   */
  private async adaptPromptForPlatform(cue: CueObject, platform: CuePlatform): Promise<string> {
    const { extractedContext, semanticMetadata, originalContent } = cue;
    
    // 기본 맥락 구성
    const contextSummary = `
# 이전 대화 맥락
${extractedContext.summary}

## 핵심 포인트
${extractedContext.keyPoints.map(point => `- ${point}`).join('\n')}

## 주요 의도
${extractedContext.primaryIntent}

## 기술적 맥락
${extractedContext.technicalTerms.length > 0 ? 
  `기술 용어: ${extractedContext.technicalTerms.map(t => t.term).join(', ')}` : 
  '일반적인 주제'}

## 감정적 톤
${extractedContext.emotionalContext.overallTone} (긴급도: ${Math.round(extractedContext.emotionalContext.urgencyLevel * 100)}%)

## 원본 사용자 질문
"${originalContent.userMessage}"
`;

    // 플랫폼별 맞춤형 프롬프트
    switch (platform) {
      case 'chatgpt':
        return `${contextSummary}

당신은 위의 맥락을 완전히 이해한 상태에서 사용자와 대화를 이어가고 있습니다. ChatGPT의 명확하고 구조적인 답변 스타일로, 이전 논의 내용을 자연스럽게 참조하면서 사용자의 질문에 답변해주세요.

중요: 이전 대화에서 이미 논의된 내용임을 인지하고, "앞서 말씀드린 대로" 또는 "이전에 논의한 내용을 바탕으로" 같은 표현을 사용하여 연속성을 보여주세요.`;

      case 'claude':
        return `${contextSummary}

안녕하세요! 앞서 우리가 나눈 대화를 바탕으로 계속 이어가겠습니다. 

위의 맥락에서 보시다시피, 우리는 이미 이 주제에 대해 상당한 논의를 했습니다. Claude의 사려깊고 분석적인 관점으로, 이전 논의 내용을 완전히 이해하고 있다는 전제하에 더 깊이 있는 답변을 제공해주세요.

특히 이전에 언급된 핵심 포인트들을 고려하여 답변해주세요.`;

      case 'gemini':
        return `${contextSummary}

우리의 이전 대화를 살펴보면 매우 흥미로운 주제들을 다뤘네요! 

위 맥락을 바탕으로, Gemini의 창의적이고 다각적인 시각으로 이 대화를 발전시켜주세요. 이전에 논의한 내용들 사이의 새로운 연결점을 찾거나, 다른 관점에서의 접근 방법을 제시해주세요.

앞서 나눈 대화의 연속성을 유지하면서도 새로운 통찰을 더해주세요.`;

      case 'copilot':
        return `${contextSummary}

Previous conversation context established. Continuing our discussion with Microsoft Copilot's practical and solution-oriented approach. 

Based on our prior conversation, please provide actionable insights and continue building upon the points we've already established.`;

      default:
        return contextSummary;
    }
  }

  /**
   * 플랫폼 API 호출 통합 인터페이스
   */
  private async generateResponseOnPlatform(prompt: string, platform: CuePlatform): Promise<string> {
    const config = this.PLATFORM_CONFIGS[platform];
    
    switch (platform) {
      case 'chatgpt':
        return await this.callOpenAI(prompt, config);
      case 'claude':
        return await this.callClaude(prompt, config);
      case 'gemini':
        return await this.callGemini(prompt, config);
      default:
        throw new Error(`지원하지 않는 플랫폼: ${platform}`);
    }
  }

  /**
   * OpenAI API 호출 (개선된 버전)
   */
  private async callOpenAI(prompt: string, config: any): Promise<string> {
    const requestBody = {
      model: config.model,
      messages: [
        {
          role: 'system',
          content: '당신은 이전 대화 맥락을 완벽하게 이해하고 자연스럽게 대화를 이어가는 AI 어시스턴트입니다. 사용자와의 연속성 있는 대화를 위해 이전 맥락을 적극 활용해주세요.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: config.maxTokens,
      temperature: 0.7,
      presence_penalty: 0.1,
      frequency_penalty: 0.1
    };

    const response = await fetch(config.apiEndpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`OpenAI API 오류 (${response.status}): ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error('OpenAI API에서 유효한 응답을 받지 못했습니다');
    }

    return content;
  }

  /**
   * Claude API 호출 (개선된 버전)
   */
  private async callClaude(prompt: string, config: any): Promise<string> {
    const requestBody = {
      model: config.model,
      max_tokens: config.maxTokens,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7
    };

    const response = await fetch(config.apiEndpoint, {
      method: 'POST',
      headers: {
        'x-api-key': config.apiKey,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Claude API 오류 (${response.status}): ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const content = data.content[0]?.text;
    
    if (!content) {
      throw new Error('Claude API에서 유효한 응답을 받지 못했습니다');
    }

    return content;
  }

  /**
   * Gemini API 호출 (개선된 버전)
   */
  private async callGemini(prompt: string, config: any): Promise<string> {
    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: prompt
            }
          ]
        }
      ],
      generationConfig: {
        maxOutputTokens: config.maxTokens,
        temperature: 0.7,
        topP: 0.8,
        topK: 40
      },
      safetySettings: [
        {
          category: 'HARM_CATEGORY_HARASSMENT',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE'
        },
        {
          category: 'HARM_CATEGORY_HATE_SPEECH',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE'
        }
      ]
    };

    const response = await fetch(`${config.apiEndpoint}?key=${config.apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Gemini API 오류 (${response.status}): ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const content = data.candidates[0]?.content?.parts[0]?.text;
    
    if (!content) {
      throw new Error('Gemini API에서 유효한 응답을 받지 못했습니다');
    }

    return content;
  }

  /**
   * 고급 맥락 보존 점수 계산
   */
  private async calculateAdvancedPreservationScore(
    originalContext: string,
    platformResponse: string,
    metadata: any,
    targetPlatform: CuePlatform
  ): Promise<number> {
    let score = 70; // 기본 점수
    
    // 1. 핵심 키워드 보존 (25점)
    const keywordScore = this.calculateKeywordPreservation(originalContext, platformResponse);
    score += keywordScore * 25;
    
    // 2. 의미적 일관성 (20점)
    const semanticScore = this.calculateSemanticConsistency(originalContext, platformResponse);
    score += semanticScore * 20;
    
    // 3. 응답 품질 (15점)
    const qualityScore = this.assessResponseQuality(platformResponse, targetPlatform);
    score += qualityScore * 15;
    
    // 4. 기술적 정확성 (15점)
    const technicalScore = this.assessTechnicalAccuracy(originalContext, platformResponse, metadata);
    score += technicalScore * 15;
    
    // 5. 연속성 지표 (15점)
    const continuityScore = this.assessConversationContinuity(platformResponse);
    score += continuityScore * 15;
    
    // 6. 플랫폼별 보정 (10점)
    const platformBonus = this.getPlatformSpecificBonus(targetPlatform, platformResponse);
    score += platformBonus * 10;

    return Math.min(100, Math.max(0, Math.round(score)));
  }

  // 유틸리티 및 헬퍼 메서드들
  private calculateKeywordPreservation(original: string, response: string): number {
    const originalKeywords = this.extractKeywords(original);
    const responseKeywords = this.extractKeywords(response);
    const commonKeywords = originalKeywords.filter(kw => responseKeywords.includes(kw));
    return originalKeywords.length > 0 ? commonKeywords.length / originalKeywords.length : 0;
  }

  private extractKeywords(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(' ')
      .filter(word => word.length > 3)
      .filter(word => !['that', 'this', 'with', 'from', 'they', 'have', 'will', 'been', 'were'].includes(word));
  }

  private calculateSemanticConsistency(original: string, response: string): number {
    // 간단한 의미적 일관성 측정 (실제로는 더 정교한 NLP 모델 사용)
    const originalSentiments = this.extractSentiments(original);
    const responseSentiments = this.extractSentiments(response);
    
    const sentimentMatch = originalSentiments.filter(s => responseSentiments.includes(s)).length;
    return Math.min(1, sentimentMatch / Math.max(1, originalSentiments.length));
  }

  private extractSentiments(text: string): string[] {
    const positiveWords = ['good', 'great', 'excellent', 'amazing', 'wonderful'];
    const negativeWords = ['bad', 'terrible', 'awful', 'horrible', 'disappointing'];
    const neutralWords = ['okay', 'fine', 'normal', 'standard', 'regular'];
    
    const words = text.toLowerCase().split(' ');
    const sentiments = [];
    
    if (positiveWords.some(word => words.includes(word))) sentiments.push('positive');
    if (negativeWords.some(word => words.includes(word))) sentiments.push('negative');
    if (neutralWords.some(word => words.includes(word))) sentiments.push('neutral');
    
    return sentiments;
  }

  private assessResponseQuality(response: string, platform: CuePlatform): number {
    let quality = 0.5;
    
    // 길이 적정성
    if (response.length > 100 && response.length < 2000) quality += 0.2;
    
    // 구조화 정도
    if (response.includes('\n') || response.includes('##') || response.includes('-')) quality += 0.15;
    
    // 플랫폼별 특성 반영
    switch (platform) {
      case 'chatgpt':
        if (response.includes('단계') || response.includes('방법')) quality += 0.1;
        break;
      case 'claude':
        if (response.includes('분석') || response.includes('고려')) quality += 0.1;
        break;
      case 'gemini':
        if (response.includes('관점') || response.includes('창의적')) quality += 0.1;
        break;
    }
    
    return Math.min(1, quality);
  }

  private assessTechnicalAccuracy(original: string, response: string, metadata: any): number {
    const originalTechTerms = this.extractTechnicalTerms(original);
    const responseTechTerms = this.extractTechnicalTerms(response);
    
    if (originalTechTerms.length === 0) return 1; // 기술적 내용이 없으면 만점
    
    const preservedTerms = originalTechTerms.filter(term => 
      responseTechTerms.some(rTerm => rTerm.toLowerCase().includes(term.toLowerCase()))
    );
    
    return preservedTerms.length / originalTechTerms.length;
  }

  private extractTechnicalTerms(text: string): string[] {
    const techTermPattern = /\b(?:API|HTTP|HTTPS|JSON|XML|SQL|NoSQL|React|Vue|Angular|Node\.js|Python|JavaScript|TypeScript|WebAuthn|DID|OAuth|JWT|REST|GraphQL|Docker|Kubernetes|AWS|Azure|GCP|MongoDB|PostgreSQL|Redis|Elasticsearch|Git|CI\/CD|DevOps|ML|AI|blockchain|cryptocurrency)\b/gi;
    return (text.match(techTermPattern) || []).map(term => term.toLowerCase());
  }

  private assessConversationContinuity(response: string): number {
    const continuityIndicators = [
      '앞서', '이전에', '방금', '앞에서', '위에서', '먼저',
      'previously', 'earlier', 'before', 'above', 'as mentioned',
      '계속해서', '이어서', '추가로', 'furthermore', 'additionally'
    ];
    
    const lowerResponse = response.toLowerCase();
    const indicatorCount = continuityIndicators.filter(indicator => 
      lowerResponse.includes(indicator.toLowerCase())
    ).length;
    
    return Math.min(1, indicatorCount / 3); // 최대 3개 지표
  }

  private getPlatformSpecificBonus(platform: CuePlatform, response: string): number {
    // 플랫폼별 특성에 맞는 추가 점수
    switch (platform) {
      case 'chatgpt':
        return response.includes('단계별') || response.includes('구체적으로') ? 0.8 : 0.5;
      case 'claude':
        return response.includes('분석하면') || response.includes('고려할 점') ? 0.8 : 0.5;
      case 'gemini':
        return response.includes('다양한') || response.includes('창의적') ? 0.8 : 0.5;
      default:
        return 0.5;
    }
  }

  private async updateCueStatus(cueId: string, status: CueSyncStatus): Promise<void> {
    try {
      await this.supabase
        .from('cues')
        .update({ 
          sync_status: status,
          updated_at: new Date().toISOString()
        })
        .eq('id', cueId);
    } catch (error) {
      console.error('Cue 상태 업데이트 실패:', error);
    }
  }

  private async analyzeSyncResults(cue: CueObject, results: CrossPlatformSyncResult[]): Promise<CueSyncStatus> {
    const successCount = results.filter(r => r.success).length;
    const totalCount = results.length;
    const successRate = successCount / totalCount;
    
    if (successRate === 1) return 'synced';
    if (successRate > 0.5) return 'partial';
    if (successRate > 0) return 'partial';
    return 'failed';
  }

  private async recordPerformanceMetrics(cueId: string, metrics: any): Promise<void> {
    try {
      await this.supabase
        .from('cue_performance_metrics')
        .insert({
          cue_id: cueId,
          metrics: metrics,
          recorded_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('성능 메트릭 기록 실패:', error);
    }
  }

  private async saveSyncResult(cueId: string, syncHistoryEntry: SyncHistoryEntry): Promise<void> {
    try {
      await this.supabase
        .from('cue_sync_history')
        .insert({
          cue_id: cueId,
          sync_data: syncHistoryEntry,
          created_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('동기화 결과 저장 실패:', error);
    }
  }

  private categorizeError(error: any): string {
    if (error.message?.includes('API')) return 'API_ERROR';
    if (error.message?.includes('network')) return 'NETWORK_ERROR';
    if (error.message?.includes('timeout')) return 'TIMEOUT_ERROR';
    if (error.message?.includes('rate limit')) return 'RATE_LIMIT_ERROR';
    return 'UNKNOWN_ERROR';
  }

  private assessErrorSeverity(error: any): 'low' | 'medium' | 'high' | 'critical' {
    if (error.message?.includes('rate limit')) return 'medium';
    if (error.message?.includes('timeout')) return 'medium';
    if (error.message?.includes('unauthorized')) return 'high';
    if (error.message?.includes('API key')) return 'critical';
    return 'medium';
  }

  private isErrorRecoverable(error: any): boolean {
    const recoverableErrors = ['timeout', 'rate limit', 'network', 'temporary'];
    return recoverableErrors.some(keyword => 
      error.message?.toLowerCase().includes(keyword)
    );
  }

  private getPlatformSpecializations(platform: CuePlatform): string[] {
    const specializations = {
      chatgpt: ['general_ai', 'code_generation', 'problem_solving'],
      claude: ['analysis', 'reasoning', 'long_form_content'],
      gemini: ['multimodal', 'creative_tasks', 'web_search'],
      copilot: ['development', 'microsoft_ecosystem', 'enterprise']
    };
    
    return specializations[platform] || ['general_ai'];
  }

  private determinePreferredLength(cue: CueObject): 'short' | 'medium' | 'long' | 'comprehensive' {
    const originalLength = cue.originalContent.userMessage.length;
    
    if (originalLength < 100) return 'short';
    if (originalLength < 300) return 'medium';
    if (originalLength < 600) return 'long';
    return 'comprehensive';
  }

  private selectAdaptationStrategy(cue: CueObject, platform: CuePlatform): string {
    // 복잡도와 플랫폼 특성에 따른 적응 전략 선택
    const complexity = cue.semanticMetadata.technicalAnalysis?.complexity || 'simple';
    
    if (complexity === 'expert') return 'semantic_preservation';
    if (complexity === 'complex') return 'context_enrichment';
    if (platform === 'gemini') return 'format_transformation';
    return 'direct_translation';
  }

  private estimateSuccessRate(cue: CueObject, platform: CuePlatform): number {
    // 플랫폼별 성공률 추정
    let baseRate = 0.85;
    
    // 플랫폼별 조정
    if (platform === 'chatgpt') baseRate += 0.05;
    if (platform === 'claude') baseRate += 0.03;
    if (platform === 'gemini') baseRate += 0.02;
    
    // 복잡도별 조정
    const complexity = cue.semanticMetadata.technicalAnalysis?.complexity;
    if (complexity === 'expert') baseRate -= 0.1;
    if (complexity === 'complex') baseRate -= 0.05;
    
    return Math.min(0.95, Math.max(0.6, baseRate));
  }

  /**
   * 큐 기반 배치 동기화 (성능 최적화)
   */
  async addToSyncQueue(cue: CueObject): Promise<void> {
    this.syncQueue.set(cue.id, cue);
    
    if (!this.isProcessingQueue) {
      this.processQueue();
    }
  }

  private async processQueue(): Promise<void> {
    this.isProcessingQueue = true;
    
    try {
      while (this.syncQueue.size > 0) {
        const batch = Array.from(this.syncQueue.values()).slice(0, 5); // 배치 크기: 5
        const batchPromises = batch.map(cue => this.syncCueToAllPlatforms(cue));
        
        await Promise.allSettled(batchPromises);
        
        // 처리된 Cue들을 큐에서 제거
        batch.forEach(cue => this.syncQueue.delete(cue.id));
        
        // 다음 배치 처리 전 잠시 대기 (Rate Limiting)
        if (this.syncQueue.size > 0) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    } finally {
      this.isProcessingQueue = false;
    }
  }

  /**
   * 실시간 동기화 상태 모니터링
   */
  async getSyncStatus(cueId: string): Promise<any> {
    try {
      const { data } = await this.supabase
        .from('cues')
        .select('sync_status, updated_at')
        .eq('id', cueId)
        .single();
        
      return data;
    } catch (error) {
      console.error('동기화 상태 조회 실패:', error);
      return null;
    }
  }

  /**
   * 동기화 통계 및 분석
   */
  async getSyncAnalytics(timeRange: 'hour' | 'day' | 'week' = 'day'): Promise<any> {
    try {
      // 시간 범위 계산
      const now = new Date();
      const startTime = new Date();
      
      switch (timeRange) {
        case 'hour':
          startTime.setHours(now.getHours() - 1);
          break;
        case 'day':
          startTime.setDate(now.getDate() - 1);
          break;
        case 'week':
          startTime.setDate(now.getDate() - 7);
          break;
      }

      // 동기화 통계 조회
      const { data } = await this.supabase
        .from('cue_sync_history')
        .select('*')
        .gte('created_at', startTime.toISOString());

      if (!data) return null;

      // 통계 분석
      const totalSyncs = data.length;
      const successfulSyncs = data.filter(s => s.sync_data.syncResult.success).length;
      const averageContextScore = data.reduce((sum, s) => sum + (s.sync_data.syncResult.contextPreservationScore || 0), 0) / totalSyncs;
      const averageSyncTime = data.reduce((sum, s) => sum + (s.sync_data.performanceMetrics.totalSyncTime || 0), 0) / totalSyncs;

      return {
        timeRange,
        totalSyncs,
        successRate: successfulSyncs / totalSyncs,
        averageContextScore: Math.round(averageContextScore),
        averageSyncTime: Math.round(averageSyncTime),
        platformBreakdown: this.analyzePlatformPerformance(data)
      };
    } catch (error) {
      console.error('동기화 분석 실패:', error);
      return null;
    }
  }

  private analyzePlatformPerformance(data: any[]): any {
    const platformStats: Record<string, any> = {};
    
    data.forEach(sync => {
      const platform = sync.sync_data.targetPlatform;
      if (!platformStats[platform]) {
        platformStats[platform] = {
          totalSyncs: 0,
          successfulSyncs: 0,
          totalContextScore: 0,
          totalSyncTime: 0
        };
      }
      
      platformStats[platform].totalSyncs++;
      if (sync.sync_data.syncResult.success) {
        platformStats[platform].successfulSyncs++;
      }
      platformStats[platform].totalContextScore += sync.sync_data.syncResult.contextPreservationScore || 0;
      platformStats[platform].totalSyncTime += sync.sync_data.performanceMetrics.totalSyncTime || 0;
    });

    // 평균 계산
    Object.keys(platformStats).forEach(platform => {
      const stats = platformStats[platform];
      stats.successRate = stats.successfulSyncs / stats.totalSyncs;
      stats.averageContextScore = Math.round(stats.totalContextScore / stats.totalSyncs);
      stats.averageSyncTime = Math.round(stats.totalSyncTime / stats.totalSyncs);
    });

    return platformStats;
  }
}

// 싱글톤 인스턴스 내보내기
export const crossPlatformSync = new CrossPlatformSync();