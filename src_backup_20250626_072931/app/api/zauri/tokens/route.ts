import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const mockTokenBalances = {
      zauri: 15428,
      zgt: 2456,
      zrp: 8934,
      earningsToday: 247,
      totalEarnings: 54632
    };
    
    return NextResponse.json({
      success: true,
      data: mockTokenBalances
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to get token balances' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, amount, tokenType } = await request.json();
    
    if (action === 'mine') {
      return NextResponse.json({
        success: true,
        data: {
          tokenType: tokenType || 'zrp',
          amount: amount || Math.floor(Math.random() * 10) + 5,
          message: 'Tokens mined successfully'
        }
      });
    }
    
    return NextResponse.json({
      success: false,
      error: 'Invalid action'
    }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Token operation failed' },
      { status: 500 }
    );
  }
}
