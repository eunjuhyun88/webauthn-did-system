import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const mockVaults = [
      {
        id: 'vault-001',
        name: '전문 개발 지식',
        category: 'professional',
        dataCount: 1247,
        cueCount: 856,
        encrypted: true,
        value: 9850
      },
      {
        id: 'vault-002',
        name: '학습 패턴',
        category: 'behavioral',
        dataCount: 623,
        cueCount: 445,
        encrypted: true,
        value: 5420
      }
    ];
    
    return NextResponse.json({
      success: true,
      data: mockVaults
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to get vaults' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const vaultData = await request.json();
    
    const newVault = {
      id: `vault-${Date.now()}`,
      ...vaultData,
      createdAt: new Date()
    };
    
    return NextResponse.json({
      success: true,
      data: newVault,
      message: 'Vault created successfully'
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to create vault' },
      { status: 500 }
    );
  }
}
