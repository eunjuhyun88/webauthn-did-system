import { NextRequest, NextResponse } from 'next/server';

export async function PUT(request: NextRequest) {
  try {
    const updates = await request.json();
    
    // 실제 환경에서는 데이터베이스 업데이트
    return NextResponse.json({
      success: true,
      message: 'AI Passport updated successfully',
      data: updates
    });
  } catch (error) {
    console.error('Passport update error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update passport' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Mock passport data
    const mockPassport = {
      id: 'passport-001',
      did: 'did:cue:0x742d35Cc6460C532FAEcE1dd25073C8d2FCAE857',
      trustScore: 96.8,
      cueTokens: 15428,
      registrationStatus: 'complete',
      biometricVerified: true,
      passportLevel: 'Verified'
    };
    
    return NextResponse.json({
      success: true,
      data: mockPassport
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to get passport' },
      { status: 500 }
    );
  }
}
