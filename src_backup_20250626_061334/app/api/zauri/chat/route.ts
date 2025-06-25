import { NextRequest, NextResponse } from 'next/server';
import { zauriChatService } from '@/services/ai/zauri/chat-service';

export async function POST(request: NextRequest) {
  try {
    const { message, userId, contextHistory } = await request.json();
    
    if (!message || !userId) {
      return NextResponse.json(
        { success: false, error: 'Message and userId are required' },
        { status: 400 }
      );
    }
    
    const aiResponse = await zauriChatService.processMessage(
      message,
      userId,
      contextHistory || []
    );
    
    return NextResponse.json({
      success: true,
      data: aiResponse
    });
  } catch (error) {
    console.error('Zauri chat API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    success: true,
    message: 'Zauri Chat API is running',
    version: '1.0.0'
  });
}
