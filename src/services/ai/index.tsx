// =============================================================================
// 🤖 AI 서비스 통합 시스템
// src/services/ai/index.ts
// =============================================================================

import { 
  Conversation, 
  Message, 
  User, 
  Platform,
  ICueEngine,
  Cue,
  UserPattern,
  CompressedPattern 
} from '@/types';

// =============================================================================
// 🎯 AI 제공자 타입 정의
// =============================================================================

export type AIProvider = 'openai' | 'anthropic' | 'gemini' | 'fusion';

export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
  metadata?: {
    platform?: Platform;
    timestamp?: number;
    confidence?: number;
    contextUsed?: string[];
  };
}

export interface AIResponse {
  content: string;
  provider: AIProvider;
  model: string;
  tokensUsed?: number;
  confidence?: number;
  reasoning?: string;
  citations?: Array<{
    source: string;
    confidence: number;
  }>;
}

export interface ConversationContext {
  userId: string;
  platform: Platform;
  recentMessages: Message[];
  userPattern?: UserPattern;
  preferences?: {
    aiPersonality: string;
    responseStyle: string;
    language: string;
  };
}

// =============================================================================
// 🤖 AI 서비스 인터페이스 (기존 패턴 활용)
// =============================================================================

export interface IAIService {
  chat(messages: AIMessage[], context?: ConversationContext): Promise<AIResponse>;
  getCapabilities(): Promise<string[]>;
  isAvailable(): Promise<boolean>;
}

// =============================================================================
// 🔗 OpenAI 서비스 구현
// =============================================================================

export class OpenAIService implements IAIService {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY || '';
    this.baseUrl = 'https://api.openai.com/v1';
  }

  async chat(messages: AIMessage[], context?: ConversationContext): Promise<AIResponse> {
    try {
      if (!this.apiKey) {
        throw new Error('OpenAI API key not configured');
      }

      // 컨텍스트 기반 시스템 프롬프트 생성
      const systemPrompt = this.generateSystemPrompt(context);
      
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            { role: 'system', content: systemPrompt },
            ...messages.map(msg => ({
              role: msg.role,
              content: msg.content
            }))
          ],
          temperature: this.getTemperature(context?.preferences?.aiPersonality),
          max_tokens: 2000,
          presence_penalty: 0.1,
          frequency_penalty: 0.1
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      const choice = data.choices[0];

      return {
        content: choice.message.content,
        provider: 'openai',
        model: 'gpt-4',
        tokensUsed: data.usage?.total_tokens,
        confidence: this.calculateConfidence(choice.finish_reason),
        reasoning: `OpenAI GPT-4 response with ${context?.platform || 'general'} context`
      };

    } catch (error) {
      console.error('OpenAI service error:', error);
      throw new Error(`OpenAI chat failed: ${error}`);
    }
  }

  async getCapabilities(): Promise<string[]> {
    return [
      'Text Generation',
      'Code Generation', 
      'Question Answering',
      'Creative Writing',
      'Analysis',
      'Summarization'
    ];
  }

  async isAvailable(): Promise<boolean> {
    return !!this.apiKey;
  }

  private generateSystemPrompt(context?: ConversationContext): string {
    const basePrompt = "You are a helpful AI assistant integrated with Fusion AI Dashboard.";
    
    if (!context) return basePrompt;

    const platformContext = this.getPlatformContext(context.platform);
    const personalityContext = this.getPersonalityContext(context.preferences?.aiPersonality);
    const styleContext = this.getStyleContext(context.preferences?.responseStyle);

    return `${basePrompt}

Platform Context: ${platformContext}
Personality: ${personalityContext}
Response Style: ${styleContext}

${context.userPattern ? `User Pattern: Based on ${context.userPattern.patterns.length} learned patterns` : ''}

Recent Context: ${context.recentMessages.slice(-3).map(m => `${m.type}: ${m.content.substring(0, 100)}`).join('\n')}

Please provide helpful, contextual responses that align with the user's preferences and platform context.`;
  }

  private getPlatformContext(platform: Platform): string {
    const contexts = {
      chatgpt: 'User is asking within ChatGPT context',
      claude: 'User is asking within Claude context', 
      gemini: 'User is asking within Gemini context',
      discord: 'User is in Discord - be casual and community-focused',
      slack: 'User is in Slack - be professional and work-focused',
      gmail: 'User is managing emails - be efficient and actionable',
      calendar: 'User is managing schedule - be time-conscious',
      notion: 'User is organizing knowledge - be structured',
      github: 'User is coding - be technical and precise',
      linear: 'User is managing tasks - be goal-oriented',
      figma: 'User is designing - be creative and visual'
    };
    return contexts[platform] || 'General context';
  }

  private getPersonalityContext(personality?: string): string {
    const personalities = {
      professional: 'Be formal, precise, and business-oriented',
      friendly: 'Be warm, approachable, and conversational',
      technical: 'Be detailed, accurate, and technically focused',
      creative: 'Be imaginative, inspiring, and innovative'
    };
    return personalities[personality as keyof typeof personalities] || 'Be helpful and balanced';
  }

  private getStyleContext(style?: string): string {
    const styles = {
      brief: 'Keep responses concise and to the point',
      detailed: 'Provide comprehensive, thorough explanations',
      examples: 'Include practical examples and use cases'
    };
    return styles[style as keyof typeof styles] || 'Provide balanced detail';
  }

  private getTemperature(personality?: string): number {
    const temperatures = {
      professional: 0.3,
      friendly: 0.7,
      technical: 0.2,
      creative: 0.9
    };
    return temperatures[personality as keyof typeof temperatures] || 0.7;
  }

  private calculateConfidence(finishReason: string): number {
    return finishReason === 'stop' ? 0.95 : 0.8;
  }
}

// =============================================================================
// 🔗 Anthropic Claude 서비스 구현  
// =============================================================================

export class AnthropicService implements IAIService {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.ANTHROPIC_API_KEY || '';
    this.baseUrl = 'https://api.anthropic.com/v1';
  }

  async chat(messages: AIMessage[], context?: ConversationContext): Promise<AIResponse> {
    try {
      if (!this.apiKey) {
        throw new Error('Anthropic API key not configured');
      }

      const systemPrompt = this.generateSystemPrompt(context);
      
      const response = await fetch(`${this.baseUrl}/messages`, {
        method: 'POST',
        headers: {
          'x-api-key': this.apiKey,
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-sonnet-20240229',
          max_tokens: 2000,
          system: systemPrompt,
          messages: messages.filter(m => m.role !== 'system').map(msg => ({
            role: msg.role === 'assistant' ? 'assistant' : 'user',
            content: msg.content
          }))
        }),
      });

      if (!response.ok) {
        throw new Error(`Anthropic API error: ${response.status}`);
      }

      const data = await response.json();

      return {
        content: data.content[0].text,
        provider: 'anthropic',
        model: 'claude-3-sonnet',
        tokensUsed: data.usage?.total_tokens,
        confidence: 0.92,
        reasoning: `Claude Sonnet analysis with ${context?.platform || 'general'} expertise`
      };

    } catch (error) {
      console.error('Anthropic service error:', error);
      throw new Error(`Anthropic chat failed: ${error}`);
    }
  }

  async getCapabilities(): Promise<string[]> {
    return [
      'Deep Analysis',
      'Reasoning',
      'Writing',
      'Research',
      'Code Review',
      'Ethical Guidance'
    ];
  }

  async isAvailable(): Promise<boolean> {
    return !!this.apiKey;
  }

  private generateSystemPrompt(context?: ConversationContext): string {
    return `You are Claude, integrated with Fusion AI Dashboard. You excel at analytical thinking and detailed reasoning.

${context ? `Current context: ${context.platform} platform` : ''}
${context?.preferences ? `User prefers ${context.preferences.aiPersonality} personality and ${context.preferences.responseStyle} responses` : ''}

Provide thoughtful, well-reasoned responses with clear explanations.`;
  }
}

// =============================================================================
// 🔗 Google Gemini 서비스 구현
// =============================================================================

export class GeminiService implements IAIService {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.GOOGLE_AI_API_KEY || '';
    this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta';
  }

  async chat(messages: AIMessage[], context?: ConversationContext): Promise<AIResponse> {
    try {
      if (!this.apiKey) {
        throw new Error('Google AI API key not configured');
      }

      const contents = messages.map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      }));

      const response = await fetch(
        `${this.baseUrl}/models/gemini-pro:generateContent?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents,
            generationConfig: {
              temperature: 0.8,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 2000,
            },
            safetySettings: [
              {
                category: 'HARM_CATEGORY_HARASSMENT',
                threshold: 'BLOCK_MEDIUM_AND_ABOVE'
              }
            ]
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data = await response.json();
      const candidate = data.candidates[0];

      return {
        content: candidate.content.parts[0].text,
        provider: 'gemini',
        model: 'gemini-pro',
        confidence: candidate.safetyRatings ? 0.90 : 0.85,
        reasoning: `Gemini Pro creative response with multimodal understanding`
      };

    } catch (error) {
      console.error('Gemini service error:', error);
      throw new Error(`Gemini chat failed: ${error}`);
    }
  }

  async getCapabilities(): Promise<string[]> {
    return [
      'Creative Writing',
      'Multimodal Understanding',
      'Code Generation',
      'Visual Analysis',
      'Translation',
      'Summarization'
    ];
  }

  async isAvailable(): Promise<boolean> {
    return !!this.apiKey;
  }
}

// =============================================================================
// 🧠 Fusion AI 개인화 서비스 (기존 Cue 시스템 통합)
// =============================================================================

export class FusionAIService implements IAIService, ICueEngine {
  private openai: OpenAIService;
  private anthropic: AnthropicService;
  private gemini: GeminiService;

  constructor() {
    this.openai = new OpenAIService();
    this.anthropic = new AnthropicService();
    this.gemini = new GeminiService();
  }

  // ✅ IAIService 인터페이스 구현
  async chat(messages: AIMessage[], context?: ConversationContext): Promise<AIResponse> {
    try {
      // 1. 컨텍스트 분석으로 최적 AI 선택
      const bestProvider = await this.selectBestProvider(messages, context);
      
      // 2. 개인화된 프롬프트 생성
      const enhancedMessages = await this.enhanceMessagesWithPersonalization(messages, context);
      
      // 3. 선택된 AI로 응답 생성
      let response: AIResponse;
      
      switch (bestProvider) {
        case 'anthropic':
          response = await this.anthropic.chat(enhancedMessages, context);
          break;
        case 'gemini':
          response = await this.gemini.chat(enhancedMessages, context);
          break;
        default:
          response = await this.openai.chat(enhancedMessages, context);
      }

      // 4. 응답을 Cue로 변환하여 학습
      if (context) {
        await this.learnFromConversation(messages, response, context);
      }

      // 5. 개인화 점수 추가
      const personalizedResponse = {
        ...response,
        provider: 'fusion' as AIProvider,
        confidence: response.confidence ? response.confidence * 1.1 : 0.95,
        reasoning: `Fusion AI: ${response.reasoning} + Personalized context learning`
      };

      return personalizedResponse;

    } catch (error) {
      console.error('Fusion AI service error:', error);
      // 폴백: OpenAI 사용
      return await this.openai.chat(messages, context);
    }
  }

  async getCapabilities(): Promise<string[]> {
    const allCapabilities = await Promise.all([
      this.openai.getCapabilities(),
      this.anthropic.getCapabilities(),
      this.gemini.getCapabilities()
    ]);

    return [
      'Personalized AI Selection',
      'Context Learning',
      'Cross-Platform Sync',
      'Pattern Recognition',
      ...allCapabilities.flat()
    ];
  }

  async isAvailable(): Promise<boolean> {
    const availabilities = await Promise.all([
      this.openai.isAvailable(),
      this.anthropic.isAvailable(),
      this.gemini.isAvailable()
    ]);

    return availabilities.some(Boolean);
  }

  // ✅ ICueEngine 인터페이스 구현 (기존 인터페이스 100% 호환)
  async extract(conversation: Conversation): Promise<Cue> {
    const lastMessage = conversation.messages[conversation.messages.length - 1];
    const userMessage = conversation.messages[conversation.messages.length - 2];

    return {
      id: `cue_${Date.now()}`,
      prompt: userMessage?.content || '',
      response: lastMessage?.content || '',
      platform: conversation.platform,
      timestamp: Date.now(),
      userId: conversation.userId,
      metadata: {
        importance: this.calculateImportance(conversation),
        topics: this.extractTopics(conversation),
        complexity: this.calculateComplexity(conversation),
        confidence: lastMessage?.confidence || 0.8,
        language: 'ko',
        culturalContext: 'korean',
        // WebAuthn 확장 필드들
        verified: true,
        passkeyId: 'fusion-ai-system'
      }
    };
  }

  async translate(cue: Cue, targetPlatform: Platform): Promise<string> {
    const context = `Adapt this context for ${targetPlatform}:
    Original: ${cue.response}
    From: ${cue.platform}
    To: ${targetPlatform}`;

    const messages: AIMessage[] = [
      { role: 'user', content: context }
    ];

    const response = await this.chat(messages);
    return response.content;
  }

  async learn(cues: readonly Cue[]): Promise<UserPattern> {
    const patterns = cues.map(cue => ({
      type: `${cue.platform}_pattern`,
      frequency: 1,
      context: cue.metadata.topics,
      triggers: [cue.prompt.split(' ').slice(0, 3).join(' ')]
    }));

    return {
      userId: cues[0]?.userId || '',
      patterns,
      preferences: {
        theme: 'light',
        language: 'ko',
        notifications: true,
        aiPersonality: 'friendly',
        responseStyle: 'detailed',
        dataRetention: '30days',
        privacy: {
          shareUsageData: false,
          allowPersonalization: true,
          storageLocation: 'region'
        }
      },
      learnedAt: new Date(),
      confidence: 0.85
    };
  }

  async compress(pattern: UserPattern): Promise<CompressedPattern> {
    const serialized = JSON.stringify(pattern);
    const compressed = btoa(serialized); // 실제로는 더 정교한 압축 필요

    return {
      compressed,
      algorithm: 'base64',
      originalSize: serialized.length,
      compressedSize: compressed.length
    };
  }

  async decompress(compressed: CompressedPattern): Promise<UserPattern> {
    const decompressed = atob(compressed.compressed);
    return JSON.parse(decompressed);
  }

  // =============================================================================
  // 🔧 Private 메서드들
  // =============================================================================

  private async selectBestProvider(messages: AIMessage[], context?: ConversationContext): Promise<AIProvider> {
    const lastMessage = messages[messages.length - 1]?.content.toLowerCase() || '';
    
    // 규칙 기반 AI 선택
    if (lastMessage.includes('분석') || lastMessage.includes('분석해') || lastMessage.includes('깊이')) {
      return 'anthropic'; // Claude가 분석에 강함
    }
    
    if (lastMessage.includes('창작') || lastMessage.includes('창의') || lastMessage.includes('아이디어')) {
      return 'gemini'; // Gemini가 창의성에 강함
    }
    
    if (context?.platform === 'github' || lastMessage.includes('코드') || lastMessage.includes('프로그래밍')) {
      return 'openai'; // GPT-4가 코딩에 강함
    }

    return 'openai'; // 기본값
  }

  private async enhanceMessagesWithPersonalization(
    messages: AIMessage[], 
    context?: ConversationContext
  ): Promise<AIMessage[]> {
    if (!context?.userPattern) return messages;

    // 사용자 패턴 기반 프롬프트 강화
    const patternContext = context.userPattern.patterns
      .map(p => `${p.type}: ${p.triggers.join(', ')}`)
      .join('\n');

    const enhancedSystemMessage: AIMessage = {
      role: 'system',
      content: `User patterns learned:
${patternContext}

Adapt your response style based on these patterns.`
    };

    return [enhancedSystemMessage, ...messages];
  }

  private async learnFromConversation(
    messages: AIMessage[], 
    response: AIResponse, 
    context: ConversationContext
  ): Promise<void> {
    // 실제 구현에서는 대화를 Cue로 변환하여 저장
    console.log('Learning from conversation:', {
      platform: context.platform,
      messageCount: messages.length,
      responseProvider: response.provider
    });
  }

  private calculateImportance(conversation: Conversation): number {
    // 메시지 길이, 복잡성, 플랫폼 등을 고려하여 중요도 계산
    return Math.min(conversation.messages.length * 0.1 + 0.5, 1.0);
  }

  private extractTopics(conversation: Conversation): string[] {
    // 간단한 키워드 추출 (실제로는 더 정교한 NLP 필요)
    const allText = conversation.messages.map(m => m.content).join(' ');
    const words = allText.toLowerCase().split(/\s+/);
    const topWords = (Array.from(new Set(words)) as string[]).filter(w => w.length > 3).slice(0, 5);
    return topWords;
  }

  private calculateComplexity(conversation: Conversation): number {
    const avgLength = conversation.messages.reduce((sum, m) => sum + m.content.length, 0) / conversation.messages.length;
    return Math.min(avgLength / 1000, 1.0);
  }
}

// =============================================================================
// 🏭 AI Service Manager (기존 팩토리 패턴 활용)
// =============================================================================

export class AIServiceManager {
  private services: Map<AIProvider, IAIService> = new Map();
  private defaultProvider: AIProvider = 'fusion';

  constructor() {
    this.services.set('openai', new OpenAIService());
    this.services.set('anthropic', new AnthropicService());
    this.services.set('gemini', new GeminiService());
    this.services.set('fusion', new FusionAIService());
  }

  async chat(
    messages: AIMessage[], 
    provider: AIProvider = this.defaultProvider,
    context?: ConversationContext
  ): Promise<AIResponse> {
    const service = this.services.get(provider);
    if (!service) {
      throw new Error(`AI provider ${provider} not available`);
    }

    return await service.chat(messages, context);
  }

  async getAvailableProviders(): Promise<AIProvider[]> {
    const providers: AIProvider[] = [];
    
    for (const [provider, service] of this.services) {
      if (await service.isAvailable()) {
        providers.push(provider);
      }
    }

    return providers;
  }

  getService(provider: AIProvider): IAIService | undefined {
    return this.services.get(provider);
  }

  setDefaultProvider(provider: AIProvider): void {
    this.defaultProvider = provider;
  }
}

// =============================================================================
// 🎯 싱글톤 인스턴스 및 유틸리티 함수들
// =============================================================================

export const aiServiceManager = new AIServiceManager();

export function getAIServiceManager(): AIServiceManager {
  return aiServiceManager;
}

export function formatAIMessage(content: string, role: 'user' | 'assistant' | 'system' = 'user'): AIMessage {
  return {
    role,
    content,
    metadata: {
      timestamp: Date.now()
    }
  };
}

// 응답 캐시 (간단한 메모리 캐시)
export const aiResponseCache = new Map<string, AIResponse>();

export function getCachedResponse(key: string): AIResponse | undefined {
  return aiResponseCache.get(key);
}

export function setCachedResponse(key: string, response: AIResponse): void {
  aiResponseCache.set(key, response);
  // 캐시 크기 제한 (최대 100개)
  if (aiResponseCache.size > 100) {
    const firstKey = aiResponseCache.keys().next().value;
    aiResponseCache.delete(firstKey);
  }
}