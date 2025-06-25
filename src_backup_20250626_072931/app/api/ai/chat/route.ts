import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { message, model, userId } = await request.json();
    
    if (!message) {
      return NextResponse.json(
        { success: false, error: 'Message is required' },
        { status: 400 }
      );
    }
    
    // AI 응답 시뮬레이션
    const response = {
      id: crypto.randomUUID(),
      message: `AI 응답: ${message}에 대한 상세한 답변입니다. 이 응답은 ${model || 'default'} 모델을 사용하여 생성되었습니다.`,
      model: model || 'gpt-4',
      usage: {
        promptTokens: Math.floor(message.length / 4),
        completionTokens: Math.floor(Math.random() * 100) + 50,
        totalTokens: Math.floor(message.length / 4) + Math.floor(Math.random() * 100) + 50
      },
      timestamp: new Date().toISOString()
    };
    
    return NextResponse.json({
      success: true,
      data: response
    });
  } catch (error) {
    console.error('AI Chat API error:', error);
    return NextResponse.json(
      { success: false, error: 'AI service error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    success: true,
    message: 'AI Chat API is running',
    models: ['gpt-4', 'claude-3', 'gemini-pro'],
    status: 'active'
  });
}
