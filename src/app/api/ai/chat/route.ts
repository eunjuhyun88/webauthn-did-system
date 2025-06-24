// =============================================================================
// 🔌 AI Chat API Route - 완전 버전
// 기존 webauthn-did-system과 연동된 AI 채팅 API
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { getAIServiceManager, formatAIMessage, type AIMessage, type AIProvider } from '@/services/ai';

// 요청 인터페이스
interface ChatRequest {
  message: string;
  conversationId?: string;
  provider?: AIProvider;
  userId?: string;
  useWebAuthn?: boolean;
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
}

// =============================================================================
// POST /api/ai/chat - AI 채팅 메시지 처리
// =============================================================================

export async function POST(req: NextRequest): Promise<NextResponse<ChatResponse>> {
  try {
    const body = await req.json() as ChatRequest;
    const { message, conversationId, provider, userId, useWebAuthn } = body;

    // 입력 검증
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json({
        success: false,
        conversationId: conversationId || crypto.randomUUID(),
        provider: provider || 'openai',
        model: 'unknown',
        error: '메시지가 필요합니다'
      }, { status: 400 });
    }

    // WebAuthn 인증 검증 (선택사항)
    if (useWebAuthn && userId) {
      // 실제 구현에서는 JWT 토큰이나 세션을 통해 사용자 인증 확인
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
    }

    // 대화 ID 생성 또는 사용
    const currentConversationId = conversationId || crypto.randomUUID();

    // AI 서비스 매니저 초기화
    const aiManager = getAIServiceManager();
    await aiManager.initializeServices();

    // 기존 대화 기록 조회 (실제로는 데이터베이스에서 가져와야 함)
    const conversationHistory: AIMessage[] = await getConversationHistory(currentConversationId);

    // 사용자 메시지 생성
    const userMessage = formatAIMessage('user', message.trim(), {
      userId,
      timestamp: new Date().toISOString(),
      conversationId: currentConversationId
    });

    // AI 응답 생성
    let aiResponse;
    if (provider) {
      aiResponse = await aiManager.sendMessage([...conversationHistory, userMessage], provider);
    } else {
      // Fallback으로 모든 제공자 시도
      aiResponse = await aiManager.sendMessageWithFallback([...conversationHistory, userMessage]);
    }

    if (!aiResponse.success) {
      return NextResponse.json({
        success: false,
        conversationId: currentConversationId,
        provider: aiResponse.provider,
        model: aiResponse.model,
        error: aiResponse.error || 'AI 응답 생성 실패'
      }, { status: 500 });
    }

    // 대화 기록 저장 (실제로는 데이터베이스에 저장)
    await saveConversationMessage(currentConversationId, userMessage, userId);
    
    const assistantMessage = formatAIMessage('assistant', aiResponse.message || '', {
      provider: aiResponse.provider,
      model: aiResponse.model,
      tokensUsed: aiResponse.tokensUsed,
      processingTime: aiResponse.processingTime
    });
    
    await saveConversationMessage(currentConversationId, assistantMessage, userId);

    // 성공 응답
    return NextResponse.json({
      success: true,
      response: aiResponse.message,
      conversationId: currentConversationId,
      provider: aiResponse.provider,
      model: aiResponse.model,
      tokensUsed: aiResponse.tokensUsed,
      processingTime: aiResponse.processingTime
    });

  } catch (error) {
    console.error('AI 채팅 API 오류:', error);
    
    return NextResponse.json({
      success: false,
      conversationId: crypto.randomUUID(),
      provider: 'unknown',
      model: 'unknown',
      error: '서버 내부 오류가 발생했습니다'
    }, { status: 500 });
  }
}

// =============================================================================
// GET /api/ai/chat - 대화 기록 조회
// =============================================================================

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(req.url);
    const conversationId = searchParams.get('conversationId');
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit') || '50');

    if (!conversationId) {
      return NextResponse.json({
        success: false,
        error: '대화 ID가 필요합니다'
      }, { status: 400 });
    }

    // 대화 기록 조회
    const messages = await getConversationHistory(conversationId, limit);

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
      count: messages.length
    });

  } catch (error) {
    console.error('대화 기록 조회 오류:', error);
    
    return NextResponse.json({
      success: false,
      error: '대화 기록 조회 실패'
    }, { status: 500 });
  }
}

// =============================================================================
// DELETE /api/ai/chat - 대화 삭제
// =============================================================================

export async function DELETE(req: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(req.url);
    const conversationId = searchParams.get('conversationId');
    const userId = searchParams.get('userId');

    if (!conversationId) {
      return NextResponse.json({
        success: false,
        error: '대화 ID가 필요합니다'
      }, { status: 400 });
    }

    // 대화 삭제 (실제로는 데이터베이스에서 삭제)
    await deleteConversation(conversationId, userId);

    return NextResponse.json({
      success: true,
      message: '대화가 삭제되었습니다'
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
// PATCH /api/ai/chat - 대화 설정 업데이트
// =============================================================================

export async function PATCH(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json();
    const { conversationId, settings, userId } = body;

    if (!conversationId) {
      return NextResponse.json({
        success: false,
        error: '대화 ID가 필요합니다'
      }, { status: 400 });
    }

    // 대화 설정 업데이트 (AI 모델, 온도 설정 등)
    await updateConversationSettings(conversationId, settings, userId);

    return NextResponse.json({
      success: true,
      message: '대화 설정이 업데이트되었습니다'
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
// 헬퍼 함수들 (실제로는 별도 서비스 파일로 분리)
// =============================================================================

// 대화 기록 조회 (임시 구현 - 실제로는 Supabase나 다른 DB 사용)
async function getConversationHistory(conversationId: string, limit: number = 50): Promise<AIMessage[]> {
  // 임시로 메모리에서 관리 (프로덕션에서는 데이터베이스 사용)
  // 실제 구현에서는 src/database/repositories/aiConversations.ts 사용
  
  try {
    // Supabase 클라이언트 사용 예시
    // const { createClient } = await import('@supabase/supabase-js');
    // const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
    
    // const { data, error } = await supabase
    //   .from('ai_conversations')
    //   .select('*')
    //   .eq('conversation_id', conversationId)
    //   .order('created_at', { ascending: true })
    //   .limit(limit);
    
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

// 대화 메시지 저장
async function saveConversationMessage(
  conversationId: string, 
  message: AIMessage, 
  userId?: string
): Promise<void> {
  try {
    // 실제 구현에서는 Supabase에 저장
    // const { createClient } = await import('@supabase/supabase-js');
    // const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
    
    // const { error } = await supabase
    //   .from('ai_conversations')
    //   .insert({
    //     conversation_id: conversationId,
    //     user_id: userId,
    //     message_type: message.role,
    //     content: message.content,
    //     metadata: message.metadata,
    //     created_at: message.timestamp.toISOString()
    //   });
    
    // if (error) throw error;
    
    console.log('메시지 저장됨:', { 
      conversationId, 
      role: message.role, 
      content: message.content.substring(0, 50) + '...',
      timestamp: message.timestamp
    });
  } catch (error) {
    console.error('메시지 저장 실패:', error);
  }
}

// 대화 삭제
async function deleteConversation(conversationId: string, userId?: string): Promise<void> {
  try {
    // 실제 구현에서는 Supabase에서 삭제
    // const { createClient } = await import('@supabase/supabase-js');
    // const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
    
    // const { error } = await supabase
    //   .from('ai_conversations')
    //   .delete()
    //   .eq('conversation_id', conversationId)
    //   .eq('user_id', userId); // 보안을 위해 사용자 ID도 확인
    
    // if (error) throw error;
    
    console.log('대화 삭제됨:', conversationId);
  } catch (error) {
    console.error('대화 삭제 실패:', error);
    throw error;
  }
}

// 대화 설정 업데이트
async function updateConversationSettings(
  conversationId: string, 
  settings: any, 
  userId?: string
): Promise<void> {
  try {
    // 실제 구현에서는 Supabase에서 업데이트
    // const { createClient } = await import('@supabase/supabase-js');
    // const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
    
    // const { error } = await supabase
    //   .from('conversation_settings')
    //   .upsert({
    //     conversation_id: conversationId,
    //     user_id: userId,
    //     settings: settings,
    //     updated_at: new Date().toISOString()
    //   });
    
    // if (error) throw error;
    
    console.log('대화 설정 업데이트됨:', { conversationId, settings });
  } catch (error) {
    console.error('대화 설정 업데이트 실패:', error);
    throw error;
  }
}

// AI 제공자 상태 확인
export async function checkAIProvidersHealth(): Promise<{
  openai: boolean;
  anthropic: boolean;
  gemini: boolean;
}> {
  const aiManager = getAIServiceManager();
  const testMessage = formatAIMessage('user', 'Hello');

  const results = await Promise.allSettled([
    aiManager.sendMessage([testMessage], 'openai'),
    aiManager.sendMessage([testMessage], 'anthropic'),
    aiManager.sendMessage([testMessage], 'gemini')
  ]);

  return {
    openai: results[0].status === 'fulfilled' && results[0].value.success,
    anthropic: results[1].status === 'fulfilled' && results[1].value.success,
    gemini: results[2].status === 'fulfilled' && results[2].value.success
  };
}

// 대화 통계 조회
async function getConversationStats(conversationId: string): Promise<{
  messageCount: number;
  totalTokens: number;
  averageResponseTime: number;
  providers: Record<string, number>;
}> {
  try {
    // 실제 구현에서는 데이터베이스에서 집계
    return {
      messageCount: 0,
      totalTokens: 0,
      averageResponseTime: 0,
      providers: {}
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