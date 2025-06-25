// =============================================================================
// 🔌 AI Chat API Route - 초상세 완전 버전
// 기존 webauthn-did-system과 연동된 AI 채팅 API
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { getAIServiceManager, formatAIMessage, type AIMessage, type AIProvider, ConversationContext, aiResponseCache } from '@/services/ai';
import { WebAuthnAdapter } from '@/integration-layer/webauthn/WebAuthnAdapter';

// 요청 인터페이스
interface ChatRequest {
  message: string;
  conversationId?: string;
  provider?: AIProvider;
  userId?: string;
  useWebAuthn?: boolean;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  useCache?: boolean;
  contextLength?: number;
}

// 응답 인터페이스
interface ChatResponse {
  success: boolean;
  response?: string;
  conversationId: string;
  provider: string;
  model: string;
  tokensUsed?: number;
  processingTime?: number;
  error?: string;
  cached?: boolean;
  contextSize?: number;
  remainingTokens?: number;
  rateLimitInfo?: {
    remaining: number;
    resetTime: number;
  };
}

// 대화 설정 인터페이스
interface ConversationSettings {
  provider?: AIProvider;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
  contextLength?: number;
  autoSave?: boolean;
}

// 대화 통계 인터페이스
interface ConversationStats {
  messageCount: number;
  totalTokens: number;
  averageResponseTime: number;
  providers: Record<string, number>;
  totalCost?: number;
  firstMessage?: Date;
  lastMessage?: Date;
}

// 사용자별 컨텍스트 관리
const userContexts = new Map<string, ConversationContext>();

// Rate limiting을 위한 사용자별 요청 추적
const userRequestCounts = new Map<string, { count: number; resetTime: number }>();

// =============================================================================
// POST /api/ai/chat - AI 채팅 메시지 처리 (완전 버전)
// =============================================================================

export async function POST(req: NextRequest): Promise<NextResponse<ChatResponse>> {
  const startTime = Date.now();
  
  try {
    const body = await req.json() as ChatRequest;
    const { 
      message, 
      conversationId, 
      provider, 
      userId, 
      useWebAuthn,
      systemPrompt,
      temperature,
      maxTokens,
      useCache = true,
      contextLength = 10
    } = body;

    // =============================================================================
    // 1. 입력 검증 및 보안 확인
    // =============================================================================

    // 기본 입력 검증
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json({
        success: false,
        conversationId: conversationId || crypto.randomUUID(),
        provider: provider || 'openai',
        model: 'unknown',
        error: '메시지가 필요합니다'
      }, { status: 400 });
    }

    // 메시지 길이 제한 (10,000자)
    if (message.length > 10000) {
      return NextResponse.json({
        success: false,
        conversationId: conversationId || crypto.randomUUID(),
        provider: provider || 'openai',
        model: 'unknown',
        error: '메시지가 너무 깁니다 (최대 10,000자)'
      }, { status: 400 });
    }

    // WebAuthn 인증 검증 (선택사항)
    if (useWebAuthn && userId) {
      const authHeader = req.headers.get('authorization');
      if (!authHeader) {
        return NextResponse.json({
          success: false,
          conversationId: conversationId || crypto.randomUUID(),
          provider: provider || 'openai',
          model: 'unknown',
          error: '인증이 필요합니다'
        }, { status: 401 });
      }

      // JWT 토큰 검증 (실제 구현에서는 JWT 라이브러리 사용)
      try {
        const token = authHeader.replace('Bearer ', '');
        const isValidToken = await verifyJWTToken(token, userId);
        if (!isValidToken) {
          return NextResponse.json({
            success: false,
            conversationId: conversationId || crypto.randomUUID(),
            provider: provider || 'openai',
            model: 'unknown',
            error: '유효하지 않은 토큰입니다'
          }, { status: 401 });
        }
      } catch (error) {
        return NextResponse.json({
          success: false,
          conversationId: conversationId || crypto.randomUUID(),
          provider: provider || 'openai',
          model: 'unknown',
          error: '토큰 검증 실패'
        }, { status: 401 });
      }
    }

    // =============================================================================
    // 2. Rate Limiting 확인
    // =============================================================================

    const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const rateLimitKey = userId || clientIP;
    
    const rateLimitResult = checkRateLimit(rateLimitKey);
    if (!rateLimitResult.allowed) {
      return NextResponse.json({
        success: false,
        conversationId: conversationId || crypto.randomUUID(),
        provider: provider || 'openai',
        model: 'unknown',
        error: 'Rate limit exceeded',
        rateLimitInfo: rateLimitResult
      }, { status: 429 });
    }

    // =============================================================================
    // 3. 대화 ID 및 컨텍스트 관리
    // =============================================================================

    const currentConversationId = conversationId || crypto.randomUUID();
    const contextKey = `${userId || clientIP}:${currentConversationId}`;
    
    // 사용자별 컨텍스트 가져오기 또는 생성
    let context = userContexts.get(contextKey);
    if (!context) {
      context = new ConversationContext();
      context.setMaxContextLength(contextLength);
      userContexts.get(contextKey);
    }

    // 시스템 프롬프트 추가 (있는 경우)
    if (systemPrompt && context.getMessages().length === 0) {
      const systemMessage = formatAIMessage('system', systemPrompt, {
        timestamp: new Date().toISOString(),
        conversationId: currentConversationId
      });
      context.addMessage(systemMessage);
    }

    // =============================================================================
    // 4. AI 서비스 매니저 초기화 및 상태 확인
    // =============================================================================

    const aiManager = getAIServiceManager();
    const servicesInitialized = await aiManager.initializeServices();
    
    if (!servicesInitialized) {
      return NextResponse.json({
        success: false,
        conversationId: currentConversationId,
        provider: provider || 'openai',
        model: 'unknown',
        error: 'AI 서비스 초기화 실패'
      }, { status: 503 });
    }

    // 선택된 제공자 상태 확인
    const selectedProvider = provider || 'openai';
    if (!aiManager.isProviderAvailable(selectedProvider)) {
      return NextResponse.json({
        success: false,
        conversationId: currentConversationId,
        provider: selectedProvider,
        model: 'unknown',
        error: `${selectedProvider} 서비스를 사용할 수 없습니다`
      }, { status: 503 });
    }

    // =============================================================================
    // 5. 대화 기록 조회 및 컨텍스트 구성
    // =============================================================================

    // 데이터베이스에서 기존 대화 기록 조회
    const conversationHistory = await getConversationHistory(currentConversationId, contextLength);
    
    // 컨텍스트에 기존 메시지 추가 (중복 방지)
    conversationHistory.forEach(msg => {
      if (!context!.getMessages().find(existing => existing.id === msg.id)) {
        context!.addMessage(msg);
      }
    });

    // 사용자 메시지 생성 및 컨텍스트에 추가
    const userMessage = formatAIMessage('user', message.trim(), {
      userId,
      timestamp: new Date().toISOString(),
      conversationId: currentConversationId,
      clientIP,
      userAgent: req.headers.get('user-agent') || 'unknown'
    });
    
    context.addMessage(userMessage);
    const currentMessages = context.getMessages();

    // =============================================================================
    // 6. 캐시 확인 (옵션)
    // =============================================================================

    let aiResponse: any;
    let fromCache = false;

    if (useCache) {
      const cachedResponse = aiResponseCache.get(currentMessages, selectedProvider);
      if (cachedResponse) {
        aiResponse = cachedResponse;
        fromCache = true;
        console.log('캐시에서 응답 반환:', selectedProvider);
      }
    }

    // =============================================================================
    // 7. AI 응답 생성 (캐시에 없는 경우)
    // =============================================================================

    if (!fromCache) {
      // 커스텀 설정 적용
      const customConfig = {
        temperature: temperature || 0.7,
        maxTokens: maxTokens || 2048
      };

      // AI 응답 생성 (Fallback 포함)
      if (provider) {
        aiResponse = await aiManager.sendMessage(currentMessages, provider);
      } else {
        aiResponse = await aiManager.sendMessageWithFallback(currentMessages);
      }

      // 응답 검증
      if (!aiResponse.success) {
        return NextResponse.json({
          success: false,
          conversationId: currentConversationId,
          provider: aiResponse.provider,
          model: aiResponse.model,
          error: aiResponse.error || 'AI 응답 생성 실패',
          processingTime: Date.now() - startTime
        }, { status: 500 });
      }

      // 성공한 응답을 캐시에 저장
      if (useCache) {
        aiResponseCache.set(currentMessages, selectedProvider, aiResponse);
      }

      // 토큰 사용량 추적
      if (aiResponse.tokensUsed) {
        aiManager.trackTokenUsage(aiResponse.provider, aiResponse.tokensUsed);
      }
    }

    // =============================================================================
    // 8. 응답 메시지 처리 및 저장
    // =============================================================================

    const assistantMessage = formatAIMessage('assistant', aiResponse.message || '', {
      provider: aiResponse.provider,
      model: aiResponse.model,
      tokensUsed: aiResponse.tokensUsed,
      processingTime: aiResponse.processingTime,
      cached: fromCache,
      timestamp: new Date().toISOString(),
      conversationId: currentConversationId
    });

    // 컨텍스트에 AI 응답 추가
    context.addMessage(assistantMessage);

    // 데이터베이스에 메시지들 저장
    await Promise.all([
      saveConversationMessage(currentConversationId, userMessage, userId),
      saveConversationMessage(currentConversationId, assistantMessage, userId)
    ]);

    // 컨텍스트 맵 업데이트
    userContexts.set(contextKey, context);

    // =============================================================================
    // 9. 응답 구성 및 반환
    // =============================================================================

    const totalProcessingTime = Date.now() - startTime;
    const contextSize = context.getMessages().length;
    const tokenCount = context.getTokenCount();

    // 성공 응답
    return NextResponse.json({
      success: true,
      response: aiResponse.message,
      conversationId: currentConversationId,
      provider: aiResponse.provider,
      model: aiResponse.model,
      tokensUsed: aiResponse.tokensUsed,
      processingTime: fromCache ? 0 : aiResponse.processingTime,
      cached: fromCache,
      contextSize,
      remainingTokens: Math.max(0, 4096 - tokenCount), // 대략적인 토큰 제한
      rateLimitInfo: {
        remaining: rateLimitResult.remaining,
        resetTime: rateLimitResult.resetTime
      }
    }, {
      headers: {
        'X-Processing-Time': totalProcessingTime.toString(),
        'X-Provider': aiResponse.provider,
        'X-Cached': fromCache.toString(),
        'X-Context-Size': contextSize.toString()
      }
    });

  } catch (error) {
    console.error('AI 채팅 API 오류:', error);
    
    return NextResponse.json({
      success: false,
      conversationId: crypto.randomUUID(),
      provider: 'unknown',
      model: 'unknown',
      error: '서버 내부 오류가 발생했습니다',
      processingTime: Date.now() - startTime
    }, { status: 500 });
  }
}

// =============================================================================
// GET /api/ai/chat - 대화 기록 조회 (고급 버전)
// =============================================================================

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(req.url);
    const conversationId = searchParams.get('conversationId');
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const includeStats = searchParams.get('includeStats') === 'true';
    const format = searchParams.get('format') || 'json'; // json, csv, txt

    // 입력 검증
    if (!conversationId) {
      return NextResponse.json({
        success: false,
        error: '대화 ID가 필요합니다'
      }, { status: 400 });
    }

    // 권한 확인 (사용자 ID가 있는 경우)
    if (userId) {
      const hasPermission = await checkUserPermission(userId, conversationId);
      if (!hasPermission) {
        return NextResponse.json({
          success: false,
          error: '접근 권한이 없습니다'
        }, { status: 403 });
      }
    }

    // 대화 기록 조회
    const messages = await getConversationHistory(conversationId, limit, offset);
    const totalCount = await getConversationMessageCount(conversationId);

    // 통계 정보 포함 (옵션)
    let stats: ConversationStats | undefined;
    if (includeStats) {
      stats = await getConversationStats(conversationId);
    }

    // 포맷에 따른 응답
    switch (format) {
      case 'csv':
        const csvData = convertMessagesToCSV(messages);
        return new NextResponse(csvData, {
          headers: {
            'Content-Type': 'text/csv',
            'Content-Disposition': `attachment; filename="conversation-${conversationId}.csv"`
          }
        });

      case 'txt':
        const txtData = convertMessagesToText(messages);
        return new NextResponse(txtData, {
          headers: {
            'Content-Type': 'text/plain',
            'Content-Disposition': `attachment; filename="conversation-${conversationId}.txt"`
          }
        });

      default: // json
        return NextResponse.json({
          success: true,
          conversationId,
          messages: messages.map(msg => ({
            id: msg.id,
            role: msg.role,
            content: msg.content,
            timestamp: msg.timestamp,
            metadata: msg.metadata
          })),
          pagination: {
            total: totalCount,
            limit,
            offset,
            hasMore: offset + messages.length < totalCount
          },
          stats,
          count: messages.length
        });
    }

  } catch (error) {
    console.error('대화 기록 조회 오류:', error);
    
    return NextResponse.json({
      success: false,
      error: '대화 기록 조회 실패'
    }, { status: 500 });
  }
}

// =============================================================================
// DELETE /api/ai/chat - 대화 삭제 (고급 버전)
// =============================================================================

export async function DELETE(req: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(req.url);
    const conversationId = searchParams.get('conversationId');
    const userId = searchParams.get('userId');
    const soft = searchParams.get('soft') === 'true'; // 소프트 삭제 옵션

    if (!conversationId) {
      return NextResponse.json({
        success: false,
        error: '대화 ID가 필요합니다'
      }, { status: 400 });
    }

    // 권한 확인
    if (userId) {
      const hasPermission = await checkUserPermission(userId, conversationId);
      if (!hasPermission) {
        return NextResponse.json({
          success: false,
          error: '삭제 권한이 없습니다'
        }, { status: 403 });
      }
    }

    // 삭제 실행
    if (soft) {
      await softDeleteConversation(conversationId, userId);
    } else {
      await deleteConversation(conversationId, userId);}

    // 메모리 캐시에서도 제거
    const contextKey = `${userId}:${conversationId}`;
    userContexts.delete(contextKey);

    return NextResponse.json({
      success: true,
      message: soft ? '대화가 숨김 처리되었습니다' : '대화가 삭제되었습니다'
    });

  } catch (error) {
    console.error('대화 삭제 오류:', error);
    
    return NextResponse.json({
      success: false,
      error: '대화 삭제 실패'
    }, { status: 500 });
  }
}

// =============================================================================
// PATCH /api/ai/chat - 대화 설정 업데이트 (고급 버전)
// =============================================================================

export async function PATCH(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json();
    const { conversationId, settings, userId } = body as {
      conversationId: string;
      settings: ConversationSettings;
      userId?: string;
    };

    if (!conversationId) {
      return NextResponse.json({
        success: false,
        error: '대화 ID가 필요합니다'
      }, { status: 400 });
    }

    // 권한 확인
    if (userId) {
      const hasPermission = await checkUserPermission(userId, conversationId);
      if (!hasPermission) {
        return NextResponse.json({
          success: false,
          error: '수정 권한이 없습니다'
        }, { status: 403 });
      }
    }

    // 설정 검증
    const validatedSettings = validateConversationSettings(settings);
    if (!validatedSettings.valid) {
      return NextResponse.json({
        success: false,
        error: validatedSettings.error
      }, { status: 400 });
    }

    // 대화 설정 업데이트
    await updateConversationSettings(conversationId, settings, userId);

    // 메모리 컨텍스트 업데이트 (컨텍스트 길이 변경 시)
    if (settings.contextLength) {
      const contextKey = `${userId}:${conversationId}`;
      const context = userContexts.get(contextKey);
      if (context) {
        context.setMaxContextLength(settings.contextLength);
        userContexts.set(contextKey, context);
      }
    }

    return NextResponse.json({
      success: true,
      message: '대화 설정이 업데이트되었습니다',
      settings: validatedSettings.settings
    });

  } catch (error) {
    console.error('대화 설정 업데이트 오류:', error);
    
    return NextResponse.json({
      success: false,
      error: '대화 설정 업데이트 실패'
    }, { status: 500 });
  }
}

// =============================================================================
// PUT /api/ai/chat/regenerate - 마지막 응답 재생성
// =============================================================================

export async function PUT(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json();
    const { conversationId, provider, userId } = body;

    if (!conversationId) {
      return NextResponse.json({
        success: false,
        error: '대화 ID가 필요합니다'
      }, { status: 400 });
    }

    // 마지막 사용자 메시지 조회
    const lastUserMessage = await getLastUserMessage(conversationId);
    if (!lastUserMessage) {
      return NextResponse.json({
        success: false,
        error: '재생성할 메시지가 없습니다'
      }, { status: 400 });
    }

    // 마지막 AI 응답 삭제
    await deleteLastAssistantMessage(conversationId);

    // 새로운 응답 생성 (기존 POST 로직 재사용)
    const regenerateRequest = new Request(req.url, {
      method: 'POST',
      headers: req.headers,
      body: JSON.stringify({
        message: lastUserMessage.content,
        conversationId,
        provider,
        userId,
        useCache: false // 재생성 시 캐시 사용 안 함
      })
    });

    return await POST(regenerateRequest as NextRequest);

  } catch (error) {
    console.error('응답 재생성 오류:', error);
    
    return NextResponse.json({
      success: false,
      error: '응답 재생성 실패'
    }, { status: 500 });
  }
}

// =============================================================================
// 헬퍼 함수들 (실제로는 별도 서비스 파일로 분리 권장)
// =============================================================================

// JWT 토큰 검증
async function verifyJWTToken(token: string, userId?: string): Promise<boolean> {
  try {
    // 실제 구현에서는 jose 라이브러리나 다른 JWT 라이브러리 사용
    // const { jwtVerify } = await import('jose');
    // const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    // const { payload } = await jwtVerify(token, secret);
    // return payload.sub === userId;
    
    // 임시 구현
    return token.length > 10 && (!userId || token.includes(userId));
  } catch (error) {
    console.error('JWT 검증 실패:', error);
    return false;
  }
}

// Rate Limiting 확인
function checkRateLimit(key: string): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const windowDuration = 15 * 60 * 1000; // 15분
  const maxRequests = 100; // 15분당 100개 요청

  const current = userRequestCounts.get(key);
  
  if (!current || now > current.resetTime) {
    // 새로운 윈도우 시작
    const resetTime = now + windowDuration;
    userRequestCounts.set(key, { count: 1, resetTime });
    return { allowed: true, remaining: maxRequests - 1, resetTime };
  }

  if (current.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetTime: current.resetTime };
  }

  // 요청 수 증가
  current.count++;
  userRequestCounts.set(key, current);
  
  return { 
    allowed: true, 
    remaining: maxRequests - current.count, 
    resetTime: current.resetTime 
  };
}

// 사용자 권한 확인
async function checkUserPermission(userId: string, conversationId: string): Promise<boolean> {
  try {
    // 실제 구현에서는 데이터베이스에서 권한 확인
    // const { data } = await supabase
    //   .from('ai_conversations')
    //   .select('user_id')
    //   .eq('conversation_id', conversationId)
    //   .eq('user_id', userId)
    //   .limit(1);
    
    // return data && data.length > 0;
    
    // 임시 구현
    return true;
  } catch (error) {
    console.error('권한 확인 실패:', error);
    return false;
  }
}

// 대화 기록 조회 (페이지네이션 포함)
async function getConversationHistory(
  conversationId: string, 
  limit: number = 50, 
  offset: number = 0
): Promise<AIMessage[]> {
  try {
    // 실제 구현에서는 Supabase에서 조회
    // const { data, error } = await supabase
    //   .from('ai_conversations')
    //   .select('*')
    //   .eq('conversation_id', conversationId)
    //   .order('created_at', { ascending: true })
    //   .range(offset, offset + limit - 1);
    
    // if (error) throw error;
    
    // return data.map(row => ({
    //   id: row.id,
    //   role: row.message_type,
    //   content: row.content,
    //   timestamp: new Date(row.created_at),
    //   metadata: row.metadata || {}
    // }));
    
    // 임시 반환
    return [];
  } catch (error) {
    console.error('대화 기록 조회 실패:', error);
    return [];
  }
}

// 대화 메시지 총 개수 조회
async function getConversationMessageCount(conversationId: string): Promise<number> {
  try {
    // 실제 구현에서는 데이터베이스에서 카운트
    return 0;
  } catch (error) {
    console.error('메시지 개수 조회 실패:', error);
    return 0;
  }
}

// 대화 메시지 저장
async function saveConversationMessage(
  conversationId: string, 
  message: AIMessage, 
  userId?: string
): Promise<void> {
  try {
    // 실제 구현에서는 Supabase에 저장
    console.log('메시지 저장됨:', { 
      conversationId, 
      role: message.role, 
      content: message.content.substring(0, 50) + '...',
      timestamp: message.timestamp,
      userId
    });
  } catch (error) {
    console.error('메시지 저장 실패:', error);
  }
}

// 대화 삭제 (하드 삭제)
async function deleteConversation(conversationId: string, userId?: string): Promise<void> {
  try {
    // 실제 구현에서는 Supabase에서 삭제
    console.log('대화 삭제됨:', conversationId);
  } catch (error) {
    console.error('대화 삭제 실패:', error);
    throw error;
  }
}

// 대화 소프트 삭제
async function softDeleteConversation(conversationId: string, userId?: string): Promise<void> {
  try {
    // 실제 구현에서는 deleted_at 필드 업데이트
    console.log('대화 소프트 삭제됨:', conversationId);
  } catch (error) {
    console.error('대화 소프트 삭제 실패:', error);
    throw error;
  }
}

// 대화 설정 업데이트
async function updateConversationSettings(
  conversationId: string, 
  settings: ConversationSettings, 
  userId?: string
): Promise<void> {
  try {
    console.log('대화 설정 업데이트됨:', { conversationId, settings });
  } catch (error) {
    console.error('대화 설정 업데이트 실패:', error);
    throw error;
  }
}

// 대화 설정 검증
function validateConversationSettings(settings: ConversationSettings): {
  valid: boolean;
  error?: string;
  settings?: ConversationSettings;
} {
  const validatedSettings: ConversationSettings = {};

  // Provider 검증
  if (settings.provider) {
    const validProviders: AIProvider[] = ['openai', 'anthropic', 'gemini'];
    if (!validProviders.includes(settings.provider)) {
      return { valid: false, error: '유효하지 않은 AI 제공자입니다' };
    }
    validatedSettings.provider = settings.provider;
  }

  // Temperature 검증 (0.0 ~ 2.0)
  if (settings.temperature !== undefined) {
    if (settings.temperature < 0 || settings.temperature > 2) {
      return { valid: false, error: 'Temperature는 0.0과 2.0 사이여야 합니다' };
    }
    validatedSettings.temperature = settings.temperature;
  }

  // MaxTokens 검증 (1 ~ 4096)
  if (settings.maxTokens !== undefined) {
    if (settings.maxTokens < 1 || settings.maxTokens > 4096) {
      return { valid: false, error: 'MaxTokens는 1과 4096 사이여야 합니다' };
    }
    validatedSettings.maxTokens = settings.maxTokens;
  }

  // SystemPrompt 검증 (최대 1000자)
  if (settings.systemPrompt !== undefined) {
    if (settings.systemPrompt.length > 1000) {
      return { valid: false, error: 'System prompt는 최대 1000자까지 가능합니다' };
    }
    validatedSettings.systemPrompt = settings.systemPrompt;
  }

  // ContextLength 검증 (1 ~ 50)
  if (settings.contextLength !== undefined) {
    if (settings.contextLength < 1 || settings.contextLength > 50) {
      return { valid: false, error: 'Context length는 1과 50 사이여야 합니다' };
    }
    validatedSettings.contextLength = settings.contextLength;
  }

  return { valid: true, settings: validatedSettings };
}

// 대화 통계 조회
async function getConversationStats(conversationId: string): Promise<ConversationStats> {
  try {
    // 실제 구현에서는 데이터베이스에서 집계
    return {
      messageCount: 0,
      totalTokens: 0,
      averageResponseTime: 0,
      providers: {},
      totalCost: 0,
      firstMessage: new Date(),
      lastMessage: new Date()
    };
  } catch (error) {
    console.error('대화 통계 조회 실패:', error);
    return {
      messageCount: 0,
      totalTokens: 0,
      averageResponseTime: 0,
      providers: {}
    };
  }
}

// 마지막 사용자 메시지 조회
async function getLastUserMessage(conversationId: string): Promise<AIMessage | null> {
  try {
    // 실제 구현에서는 데이터베이스에서 조회
    return null;
  } catch (error) {
    console.error('마지막 사용자 메시지 조회 실패:', error);
    return null;
  }
}

// 마지막 AI 응답 삭제
async function deleteLastAssistantMessage(conversationId: string): Promise<void> {
  try {
    // 실제 구현에서는 데이터베이스에서 삭제
    console.log('마지막 AI 응답 삭제됨:', conversationId);
  } catch (error) {
    console.error('마지막 AI 응답 삭제 실패:', error);
  }
}

// 메시지를 CSV 형식으로 변환
function convertMessagesToCSV(messages: AIMessage[]): string {
  const headers = ['ID', 'Role', 'Content', 'Timestamp', 'Metadata'];
  const csvRows = [headers.join(',')];
  
  messages.forEach(msg => {
    const row = [
      msg.id,
      msg.role,
      `"${msg.content.replace(/"/g, '""')}"`, // CSV escape
      msg.timestamp.toISOString(),
      JSON.stringify(msg.metadata || {})
    ];
    csvRows.push(row.join(','));
  });
  
  return csvRows.join('\n');
}

// 메시지를 텍스트 형식으로 변환
function convertMessagesToText(messages: AIMessage[]): string {
  return messages.map(msg => {
    const timestamp = msg.timestamp.toLocaleString();
    const role = msg.role === 'user' ? '사용자' : msg.role === 'assistant' ? 'AI' : '시스템';
    return `[${timestamp}] ${role}: ${msg.content}`;
  }).join('\n\n');
}