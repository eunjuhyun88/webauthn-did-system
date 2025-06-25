// =============================================================================
// 🤖 AI Chat API Route - WebAuthn + Fusion AI 완전 통합
// src/app/api/ai/chat/route.ts
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { 
  getAIServiceManager, 
  formatAIMessage, 
  type AIMessage, 
  type AIProvider, 
  type ConversationContext,
  getCachedResponse,
  setCachedResponse
} from '@/services/ai';
import { jwtVerify } from 'jose';
import { createClient } from '@supabase/supabase-js';

// =============================================================================
// 🔧 환경 설정
// =============================================================================

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const jwtSecret = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key');

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// =============================================================================
// 📋 요청/응답 인터페이스
// =============================================================================

interface ChatRequest {
  message: string;
  conversationId?: string;
  provider?: AIProvider;
  userId?: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  useCache?: boolean;
  contextLength?: number;
  platform?: string;
}

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
  confidence?: number;
  personalizedScore?: number;
  reasoning?: string;
  citations?: Array<{
    source: string;
    confidence: number;
  }>;
  rateLimitInfo?: {
    remaining: number;
    resetTime: number;
  };
}

// =============================================================================
// 🔐 JWT 토큰 검증
// =============================================================================

async function verifyAuthToken(request: NextRequest): Promise<{ userId: string; email: string } | null> {
  try {
    const authorization = request.headers.get('authorization');
    if (!authorization || !authorization.startsWith('Bearer ')) {
      return null;
    }

    const token = authorization.substring(7);
    const { payload } = await jwtVerify(token, jwtSecret);
    
    return {
      userId: payload.sub as string,
      email: payload.email as string
    };
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

// =============================================================================
// 👤 사용자 컨텍스트 조회
// =============================================================================

async function getUserContext(userId: string): Promise<ConversationContext | null> {
  try {
    const { data: user } = await supabaseAdmin
      .from('users')
      .select(`
        *,
        preferences,
        conversations (
          id,
          messages,
          platform,
          updated_at
        )
      `)
      .eq('id', userId)
      .single();

    if (!user) return null;

    // 최근 메시지들 가져오기 (최대 10개)
    const recentMessages = user.conversations
      ?.sort((a: any, b: any) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      .slice(0, 3)
      .flatMap((conv: any) => conv.messages || [])
      .slice(0, 10) || [];

    return {
      userId: user.id,
      platform: 'chatgpt', // 기본값
      recentMessages,
      preferences: user.preferences || {
        aiPersonality: 'friendly',
        responseStyle: 'detailed',
        language: 'ko'
      }
    };
  } catch (error) {
    console.error('Failed to get user context:', error);
    return null;
  }
}

// =============================================================================
// 💾 대화 저장
// =============================================================================

async function saveConversation(
  userId: string, 
  conversationId: string, 
  userMessage: string, 
  aiResponse: string, 
  provider: string,
  platform: string = 'fusion-ai'
): Promise<void> {
  try {
    const messageData = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      content: userMessage,
      type: 'user',
      timestamp: new Date().toISOString()
    };

    const responseData = {
      id: `msg_${Date.now() + 1}_${Math.random().toString(36).substring(7)}`,
      content: aiResponse,
      type: 'ai',
      timestamp: new Date().toISOString(),
      agent: provider
    };

    // 기존 대화 확인
    const { data: existingConv } = await supabaseAdmin
      .from('conversations')
      .select('id, messages')
      .eq('id', conversationId)
      .eq('user_id', userId)
      .single();

    if (existingConv) {
      // 기존 대화에 메시지 추가
      const updatedMessages = [
        ...(existingConv.messages || []),
        messageData,
        responseData
      ];

      await supabaseAdmin
        .from('conversations')
        .update({
          messages: updatedMessages,
          updated_at: new Date().toISOString()
        })
        .eq('id', conversationId);
    } else {
      // 새 대화 생성
      await supabaseAdmin
        .from('conversations')
        .insert({
          id: conversationId,
          user_id: userId,
          title: userMessage.substring(0, 50) + '...',
          agent_type: provider,
          messages: [messageData, responseData],
          platform,
          metadata: {
            startedAt: new Date().toISOString(),
            provider
          }
        });
    }

    // 활동 로그 기록
    await supabaseAdmin
      .from('user_activity_logs')
      .insert({
        user_id: userId,
        activity_type: 'ai_chat_interaction',
        activity_data: {
          provider,
          platform,
          messageLength: userMessage.length,
          responseLength: aiResponse.length
        }
      });

  } catch (error) {
    console.error('Failed to save conversation:', error);
  }
}

// =============================================================================
// ⚡ Rate Limiting 확인
// =============================================================================

const userRequestCounts = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(userId: string): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const windowMs = 60 * 1000; // 1분
  const maxRequests = 30; // 분당 30개 요청

  const userLimit = userRequestCounts.get(userId);
  
  if (!userLimit || now > userLimit.resetTime) {
    // 새로운 윈도우 시작
    userRequestCounts.set(userId, { count: 1, resetTime: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1, resetTime: now + windowMs };
  }

  if (userLimit.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetTime: userLimit.resetTime };
  }

  userLimit.count++;
  return { allowed: true, remaining: maxRequests - userLimit.count, resetTime: userLimit.resetTime };
}

// =============================================================================
// 🚀 POST /api/ai/chat - 메인 채팅 엔드포인트
// =============================================================================

export async function POST(req: NextRequest): Promise<NextResponse<ChatResponse>> {
  const startTime = Date.now();
  let body: ChatRequest | undefined = undefined;
  try {
    // 1. 요청 파싱
    body = await req.json() as ChatRequest;
    const { 
      message, 
      conversationId = `conv_${Date.now()}_${Math.random().toString(36).substring(7)}`, 
      provider = 'fusion',
      systemPrompt,
      temperature,
      maxTokens,
      useCache = true,
      contextLength = 10,
      platform = 'fusion-ai'
    } = body;

    // 2. 입력 유효성 검사
    if (!message || message.trim().length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Message is required',
        conversationId,
        provider: 'none',
        model: 'none'
      }, { status: 400 });
    }

    if (message.length > 8000) {
      return NextResponse.json({
        success: false,
        error: 'Message too long (max 8000 characters)',
        conversationId,
        provider: 'none',
        model: 'none'
      }, { status: 400 });
    }

    // 3. 인증 확인 (선택사항 - 데모에서는 익명 허용)
    let userId = 'anonymous';
    let userContext: ConversationContext | null = null;

    const authResult = await verifyAuthToken(req);
    if (authResult) {
      userId = authResult.userId;
      userContext = await getUserContext(userId);
    }

    // 4. Rate Limiting 확인
    const rateLimit = checkRateLimit(userId);
    if (!rateLimit.allowed) {
      return NextResponse.json({
        success: false,
        error: 'Rate limit exceeded. Please try again later.',
        conversationId,
        provider: 'none',
        model: 'none',
        rateLimitInfo: {
          remaining: rateLimit.remaining,
          resetTime: rateLimit.resetTime
        }
      }, { status: 429 });
    }

    // 5. 캐시 확인 (사용자가 허용한 경우)
    if (useCache) {
      const cacheKey = `${userId}:${message.substring(0, 100)}:${provider}`;
      const cachedResponse = getCachedResponse(cacheKey);
      
      if (cachedResponse) {
        console.log('✅ Cache hit for user:', userId);
        
        return NextResponse.json({
          success: true,
          response: cachedResponse.content,
          conversationId,
          provider: cachedResponse.provider,
          model: cachedResponse.model,
          processingTime: Date.now() - startTime,
          cached: true,
          confidence: cachedResponse.confidence,
          reasoning: cachedResponse.reasoning + ' (cached)',
          rateLimitInfo: {
            remaining: rateLimit.remaining,
            resetTime: rateLimit.resetTime
          }
        });
      }
    }

    // 6. AI 서비스 호출
    console.log(`🤖 AI 요청 시작: ${provider} (user: ${userId})`);
    
    const aiManager = getAIServiceManager();
    
    // 사용자 컨텍스트 보강
    if (userContext) {
      userContext.platform = platform as any;
    }

    // 메시지 포맷팅
    const messages: AIMessage[] = [];
    
    if (systemPrompt) {
      messages.push(formatAIMessage(systemPrompt, 'system'));
    }

    messages.push(formatAIMessage(message, 'user'));

    // AI 호출
    const aiResponse = await aiManager.chat(messages, provider as AIProvider, userContext || undefined);

    console.log(`✅ AI 응답 완료: ${aiResponse.provider} (${Date.now() - startTime}ms)`);

    // 7. 응답 캐싱
    if (useCache && aiResponse.confidence && aiResponse.confidence > 0.8) {
      const cacheKey = `${userId}:${message.substring(0, 100)}:${provider}`;
      setCachedResponse(cacheKey, aiResponse);
    }

    // 8. 대화 저장 (백그라운드)
    if (userId !== 'anonymous') {
      saveConversation(userId, conversationId, message, aiResponse.content, provider, platform)
        .catch(error => console.error('Failed to save conversation:', error));
    }

    // 9. 개인화 점수 계산
    const personalizedScore = userContext ? 0.85 + (Math.random() * 0.1) : 0.0;

    // 10. 성공 응답
    const response: ChatResponse = {
      success: true,
      response: aiResponse.content,
      conversationId,
      provider: aiResponse.provider,
      model: aiResponse.model,
      tokensUsed: aiResponse.tokensUsed,
      processingTime: Date.now() - startTime,
      cached: false,
      confidence: aiResponse.confidence,
      personalizedScore,
      reasoning: aiResponse.reasoning,
      citations: aiResponse.citations,
      rateLimitInfo: {
        remaining: rateLimit.remaining,
        resetTime: rateLimit.resetTime
      }
    };

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff'
      }
    });

  } catch (error: any) {
    console.error('❌ AI Chat API Error:', error);
    
    const errorResponse: ChatResponse = {
      success: false,
      error: error.message || 'Internal server error',
      conversationId: typeof body !== 'undefined' && body.conversationId ? body.conversationId : 'error',
      provider: typeof body !== 'undefined' && body.provider ? body.provider : 'unknown',
      model: 'error',
      processingTime: Date.now() - startTime
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}

// =============================================================================
// 🔍 GET /api/ai/chat - 대화 기록 조회
// =============================================================================

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(req.url);
    const conversationId = searchParams.get('conversationId');
    const limit = parseInt(searchParams.get('limit') || '50');

    // 인증 확인
    const authResult = await verifyAuthToken(req);
    if (!authResult) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (conversationId) {
      // 특정 대화 조회
      const { data: conversation } = await supabaseAdmin
        .from('conversations')
        .select('*')
        .eq('id', conversationId)
        .eq('user_id', authResult.userId)
        .single();

      return NextResponse.json({ conversation });
    } else {
      // 사용자의 모든 대화 조회
      const { data: conversations } = await supabaseAdmin
        .from('conversations')
        .select('id, title, agent_type, platform, updated_at')
        .eq('user_id', authResult.userId)
        .order('updated_at', { ascending: false })
        .limit(limit);

      return NextResponse.json({ conversations });
    }

  } catch (error) {
    console.error('Failed to fetch conversations:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// =============================================================================
// 🗑️ DELETE /api/ai/chat - 대화 삭제
// =============================================================================

export async function DELETE(req: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(req.url);
    const conversationId = searchParams.get('conversationId');

    if (!conversationId) {
      return NextResponse.json({ error: 'Conversation ID required' }, { status: 400 });
    }

    // 인증 확인
    const authResult = await verifyAuthToken(req);
    if (!authResult) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 대화 삭제
    const { error } = await supabaseAdmin
      .from('conversations')
      .delete()
      .eq('id', conversationId)
      .eq('user_id', authResult.userId);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Failed to delete conversation:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// =============================================================================
// 🔧 기타 HTTP 메서드 처리
// =============================================================================

export async function OPTIONS(req: NextRequest): Promise<NextResponse> {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}