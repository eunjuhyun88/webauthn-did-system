// =============================================================================
// 🤖 AI Services Integration - 완전 상세 버전
// =============================================================================

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface AIResponse {
  success: boolean;
  message?: string;
  tokensUsed?: number;
  processingTime?: number;
  error?: string;
  provider: 'openai' | 'anthropic' | 'gemini';
  model: string;
}

export type AIProvider = 'openai' | 'anthropic' | 'gemini';

// OpenAI 설정 인터페이스
export interface OpenAIConfig {
  apiKey: string;
  model: string;
  maxTokens: number;
  temperature: number;
}

// Anthropic 설정 인터페이스
export interface AnthropicConfig {
  apiKey: string;
  model: string;
  maxTokens: number;
  temperature: number;
}

// Gemini 설정 인터페이스
export interface GeminiConfig {
  apiKey: string;
  model: string;
  maxTokens: number;
  temperature: number;
}

// =============================================================================
// OpenAI Service Implementation
// =============================================================================

export class OpenAIService {
  private config: OpenAIConfig;
  private client: any;

  constructor(config: OpenAIConfig) {
    this.config = config;
  }

  async initialize() {
    try {
      const { OpenAI } = await import('openai');
      this.client = new OpenAI({
        apiKey: this.config.apiKey,
      });
      return true;
    } catch (error) {
      console.error('OpenAI 초기화 실패:', error);
      return false;
    }
  }

  async sendMessage(messages: AIMessage[]): Promise<AIResponse> {
    const startTime = Date.now();
    
    try {
      if (!this.client) {
        await this.initialize();
      }

      const response = await this.client.chat.completions.create({
        model: this.config.model,
        messages: messages.map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        max_tokens: this.config.maxTokens,
        temperature: this.config.temperature,
      });

      const processingTime = Date.now() - startTime;

      return {
        success: true,
        message: response.choices[0]?.message?.content || '',
        tokensUsed: response.usage?.total_tokens || 0,
        processingTime,
        provider: 'openai',
        model: this.config.model
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        provider: 'openai',
        model: this.config.model,
        processingTime: Date.now() - startTime
      };
    }
  }
}

// =============================================================================
// Anthropic (Claude) Service Implementation
// =============================================================================

export class AnthropicService {
  private config: AnthropicConfig;
  private client: any;

  constructor(config: AnthropicConfig) {
    this.config = config;
  }

  async initialize() {
    try {
      const Anthropic = await import('@anthropic-ai/sdk');
      this.client = new Anthropic.default({
        apiKey: this.config.apiKey,
      });
      return true;
    } catch (error) {
      console.error('Anthropic 초기화 실패:', error);
      return false;
    }
  }

  async sendMessage(messages: AIMessage[]): Promise<AIResponse> {
    const startTime = Date.now();
    
    try {
      if (!this.client) {
        await this.initialize();
      }

      // Claude는 system 메시지를 별도로 처리
      const systemMessage = messages.find(m => m.role === 'system');
      const conversationMessages = messages.filter(m => m.role !== 'system');

      const response = await this.client.messages.create({
        model: this.config.model,
        max_tokens: this.config.maxTokens,
        temperature: this.config.temperature,
        system: systemMessage?.content || '',
        messages: conversationMessages.map(msg => ({
          role: msg.role,
          content: msg.content
        }))
      });

      const processingTime = Date.now() - startTime;

      return {
        success: true,
        message: response.content[0]?.text || '',
        tokensUsed: response.usage?.input_tokens + response.usage?.output_tokens || 0,
        processingTime,
        provider: 'anthropic',
        model: this.config.model
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        provider: 'anthropic',
        model: this.config.model,
        processingTime: Date.now() - startTime
      };
    }
  }
}

// =============================================================================
// Google Gemini Service Implementation
// =============================================================================

export class GeminiService {
  private config: GeminiConfig;
  private client: any;

  constructor(config: GeminiConfig) {
    this.config = config;
  }

  async initialize() {
    try {
      const { GoogleGenerativeAI } = await import('@google/generative-ai');
      this.client = new GoogleGenerativeAI(this.config.apiKey);
      return true;
    } catch (error) {
      console.error('Gemini 초기화 실패:', error);
      return false;
    }
  }

  async sendMessage(messages: AIMessage[]): Promise<AIResponse> {
    const startTime = Date.now();
    
    try {
      if (!this.client) {
        await this.initialize();
      }

      const model = this.client.getGenerativeModel({ 
        model: this.config.model,
        generationConfig: {
          maxOutputTokens: this.config.maxTokens,
          temperature: this.config.temperature,
        }
      });

      // Gemini는 대화 기록을 다르게 처리
      const chat = model.startChat({
        history: messages.slice(0, -1).map(msg => ({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }]
        }))
      });

      const lastMessage = messages[messages.length - 1];
      const response = await chat.sendMessage(lastMessage.content);
      const result = await response.response;

      const processingTime = Date.now() - startTime;

      return {
        success: true,
        message: result.text() || '',
        tokensUsed: result.usageMetadata?.totalTokenCount || 0,
        processingTime,
        provider: 'gemini',
        model: this.config.model
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        provider: 'gemini',
        model: this.config.model,
        processingTime: Date.now() - startTime
      };
    }
  }
}

// =============================================================================
// AI Service Manager - 통합 관리자
// =============================================================================

export interface AIServiceConfig {
  openai: OpenAIConfig;
  anthropic: AnthropicConfig;
  gemini: GeminiConfig;
  defaultProvider: AIProvider;
}

export class AIServiceManager {
  private services: Map<AIProvider, OpenAIService | AnthropicService | GeminiService>;
  private config: AIServiceConfig;

  constructor(config: AIServiceConfig) {
    this.config = config;
    this.services = new Map();
    
    // 서비스 인스턴스 생성
    this.services.set('openai', new OpenAIService(config.openai));
    this.services.set('anthropic', new AnthropicService(config.anthropic));
    this.services.set('gemini', new GeminiService(config.gemini));
  }

  async initializeServices() {
    const results = await Promise.allSettled([
      this.services.get('openai')?.initialize(),
      this.services.get('anthropic')?.initialize(),
      this.services.get('gemini')?.initialize()
    ]);

    const successful = results.filter(r => r.status === 'fulfilled' && r.value === true).length;
    console.log(`AI 서비스 초기화: ${successful}/3 성공`);
    
    return successful > 0;
  }

  async sendMessage(
    messages: AIMessage[], 
    provider?: AIProvider
  ): Promise<AIResponse> {
    const selectedProvider = provider || this.config.defaultProvider;
    const service = this.services.get(selectedProvider);

    if (!service) {
      return {
        success: false,
        error: `지원하지 않는 AI 제공자: ${selectedProvider}`,
        provider: selectedProvider,
        model: 'unknown',
        processingTime: 0
      };
    }

    return await service.sendMessage(messages);
  }

  async sendMessageWithFallback(messages: AIMessage[]): Promise<AIResponse> {
    const providers: AIProvider[] = ['openai', 'anthropic', 'gemini'];
    
    for (const provider of providers) {
      try {
        const response = await this.sendMessage(messages, provider);
        if (response.success) {
          return response;
        }
      } catch (error) {
        console.warn(`${provider} 실패, 다음 제공자로 시도...`);
        continue;
      }
    }

    return {
      success: false,
      error: '모든 AI 제공자가 실패했습니다',
      provider: 'openai',
      model: 'unknown',
      processingTime: 0
    };
  }

  getAvailableProviders(): AIProvider[] {
    return Array.from(this.services.keys());
  }

  isProviderAvailable(provider: AIProvider): boolean {
    return this.services.has(provider);
  }

  // 개별 서비스 상태 확인
  async checkServiceHealth(provider: AIProvider): Promise<boolean> {
    try {
      const testMessage = formatAIMessage('user', 'Hello');
      const response = await this.sendMessage([testMessage], provider);
      return response.success;
    } catch (error) {
      return false;
    }
  }

  // 모든 서비스 상태 확인
  async checkAllServicesHealth(): Promise<Record<AIProvider, boolean>> {
    const healthStatus: Record<AIProvider, boolean> = {
      openai: false,
      anthropic: false,
      gemini: false
    };

    const providers: AIProvider[] = ['openai', 'anthropic', 'gemini'];
    
    await Promise.all(
      providers.map(async (provider) => {
        healthStatus[provider] = await this.checkServiceHealth(provider);
      })
    );

    return healthStatus;
  }

  // 토큰 사용량 추적
  private tokenUsageStats: Map<AIProvider, { count: number; tokens: number }> = new Map();

  trackTokenUsage(provider: AIProvider, tokens: number) {
    const current = this.tokenUsageStats.get(provider) || { count: 0, tokens: 0 };
    this.tokenUsageStats.set(provider, {
      count: current.count + 1,
      tokens: current.tokens + tokens
    });
  }

  getTokenUsageStats(): Map<AIProvider, { count: number; tokens: number }> {
    return new Map(this.tokenUsageStats);
  }

  resetTokenUsageStats() {
    this.tokenUsageStats.clear();
  }
}

// =============================================================================
// 설정 및 유틸리티 함수들
// =============================================================================

export const createAIConfig = (): AIServiceConfig => ({
  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
    model: 'gpt-4',
    maxTokens: 2048,
    temperature: 0.7
  },
  anthropic: {
    apiKey: process.env.CLAUDE_API_KEY || '',
    model: 'claude-3-sonnet-20240229',
    maxTokens: 2048,
    temperature: 0.7
  },
  gemini: {
    apiKey: process.env.GEMINI_API_KEY || '',
    model: 'gemini-2.0-flash',
    maxTokens: 2048,
    temperature: 0.7
  },
  defaultProvider: 'openai'
});

export const formatAIMessage = (
  role: 'user' | 'assistant' | 'system',
  content: string,
  metadata?: Record<string, any>
): AIMessage => ({
  id: crypto.randomUUID(),
  role,
  content,
  timestamp: new Date(),
  metadata
});

export const validateAIResponse = (response: AIResponse): boolean => {
  return response.success && !!response.message && response.message.length > 0;
};

// WebAuthn 에러 메시지 변환
export const getWebAuthnErrorMessage = (error: string): string => {
  const errorMessages: Record<string, string> = {
    'NotAllowedError': '사용자가 요청을 거부했거나 타임아웃이 발생했습니다.',
    'SecurityError': '보안 요구사항을 만족하지 않습니다.',
    'NetworkError': '네트워크 오류가 발생했습니다.',
    'InvalidStateError': '인증기가 이미 등록되어 있습니다.',
    'ConstraintError': '요청된 제약 조건을 만족할 수 없습니다.',
    'NotSupportedError': '이 브라우저에서는 지원되지 않는 기능입니다.',
    'AbortError': '요청이 중단되었습니다.',
    'UnknownError': '알 수 없는 오류가 발생했습니다.'
  };

  return errorMessages[error] || errorMessages['UnknownError'];
};

// DID 생성 함수
export const generateDID = (method: string = 'web', identifier?: string): string => {
  const id = identifier || crypto.randomUUID();
  const rpId = process.env.WEBAUTHN_RP_ID || 'localhost';
  
  switch (method) {
    case 'web':
      return `did:web:${rpId}:users:${id}`;
    case 'key':
      return `did:key:${id}`;
    default:
      return `did:${method}:${id}`;
  }
};

// 싱글톤 인스턴스 생성
let aiServiceManager: AIServiceManager | null = null;

export const getAIServiceManager = (): AIServiceManager => {
  if (!aiServiceManager) {
    const config = createAIConfig();
    aiServiceManager = new AIServiceManager(config);
  }
  return aiServiceManager;
};

// 편의 함수들
export const sendAIMessage = async (
  content: string,
  provider?: AIProvider,
  conversationHistory: AIMessage[] = []
): Promise<AIResponse> => {
  const manager = getAIServiceManager();
  const userMessage = formatAIMessage('user', content);
  const messages = [...conversationHistory, userMessage];
  
  return await manager.sendMessage(messages, provider);
};

export const sendAIMessageWithFallback = async (
  content: string,
  conversationHistory: AIMessage[] = []
): Promise<AIResponse> => {
  const manager = getAIServiceManager();
  const userMessage = formatAIMessage('user', content);
  const messages = [...conversationHistory, userMessage];
  
  return await manager.sendMessageWithFallback(messages);
};

// 대화 컨텍스트 관리
export class ConversationContext {
  private messages: AIMessage[] = [];
  private maxContextLength: number = 10;

  addMessage(message: AIMessage) {
    this.messages.push(message);
    
    // 컨텍스트 길이 제한
    if (this.messages.length > this.maxContextLength) {
      this.messages = this.messages.slice(-this.maxContextLength);
    }
  }

  getMessages(): AIMessage[] {
    return [...this.messages];
  }

  clearContext() {
    this.messages = [];
  }

  setMaxContextLength(length: number) {
    this.maxContextLength = length;
    if (this.messages.length > length) {
      this.messages = this.messages.slice(-length);
    }
  }

  getTokenCount(): number {
    // 간단한 토큰 추정 (실제로는 더 정확한 토큰 계산기 사용)
    return this.messages.reduce((total, msg) => {
      return total + Math.ceil(msg.content.length / 4);
    }, 0);
  }
}

// AI 응답 캐싱
export class AIResponseCache {
  private cache: Map<string, { response: AIResponse; timestamp: number }> = new Map();
  private cacheDuration: number = 5 * 60 * 1000; // 5분

  private generateCacheKey(messages: AIMessage[], provider: AIProvider): string {
    const content = messages.map(m => `${m.role}:${m.content}`).join('|');
    return `${provider}:${btoa(content)}`;
  }

  get(messages: AIMessage[], provider: AIProvider): AIResponse | null {
    const key = this.generateCacheKey(messages, provider);
    const cached = this.cache.get(key);
    
    if (cached && Date.now() - cached.timestamp < this.cacheDuration) {
      return cached.response;
    }
    
    // 만료된 캐시 삭제
    if (cached) {
      this.cache.delete(key);
    }
    
    return null;
  }

  set(messages: AIMessage[], provider: AIProvider, response: AIResponse) {
    const key = this.generateCacheKey(messages, provider);
    this.cache.set(key, {
      response,
      timestamp: Date.now()
    });
  }

  clear() {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

// 전역 캐시 인스턴스
export const aiResponseCache = new AIResponseCache();