import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { message, passportData } = await request.json();
    
    // AI 응답 생성 로직 (실제로는 OpenAI API 등을 호출)
    const response = {
      content: `개인화된 AI 응답: ${message}`,
      usedPassportData: passportData?.vaults || [],
      cueTokensEarned: 3,
      verification: {
        biometric: true,
        did: true,
        signature: `0x${Math.random().toString(16).substr(2, 40)}`
      }
    };
    
    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      { error: 'AI 채팅 처리 실패' },
      { status: 500 }
    );
  }
}
