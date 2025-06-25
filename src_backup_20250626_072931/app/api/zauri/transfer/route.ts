import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { fromPlatform, toPlatform, context } = await request.json();
    
    if (!fromPlatform || !toPlatform) {
      return NextResponse.json(
        { success: false, error: 'Platform parameters are required' },
        { status: 400 }
      );
    }
    
    const transfer = {
      id: crypto.randomUUID(),
      fromPlatform,
      toPlatform,
      status: 'compressing',
      progress: 0,
      compressionRatio: 0.15,
      fidelityScore: 0.88,
      transferTime: Date.now(),
      dataSize: context ? JSON.stringify(context).length : 1024
    };
    
    return NextResponse.json({
      success: true,
      data: transfer,
      message: 'Context transfer initiated'
    });
  } catch (error) {
    console.error('Transfer API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to start transfer' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // 활성 전송 목록 반환
    const mockTransfers = [
      {
        id: 'transfer-001',
        fromPlatform: 'chatgpt',
        toPlatform: 'claude',
        status: 'transferring',
        progress: 75,
        compressionRatio: 0.15,
        fidelityScore: 0.88
      }
    ];
    
    return NextResponse.json({
      success: true,
      data: mockTransfers
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to get transfers' },
      { status: 500 }
    );
  }
}
