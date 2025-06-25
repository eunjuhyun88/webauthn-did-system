// =============================================================================
// 🤖 Agent Passport API - 간단 버전
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { AgentPassportManager } from '@/lib/zauri/agents/AgentPassportManager';

export async function POST(request: NextRequest) {
  try {
    console.log('🤖 Agent Passport 생성 API 호출');

    const body = await request.json();
    const { authResult } = body;

    const passportManager = new AgentPassportManager();
    const agentPassport = await passportManager.createFromWebAuthn(authResult);

    if (!agentPassport) {
      return NextResponse.json(
        { success: false, error: 'Failed to create agent passport' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      agentPassport
    });

  } catch (error) {
    console.error('❌ Agent Passport API 오류:', error);
    
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Agent Passport API is working!',
    timestamp: new Date().toISOString()
  });
}
