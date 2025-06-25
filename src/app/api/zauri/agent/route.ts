import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  return NextResponse.json({
    success: true,
    message: 'Zauri Agent API endpoint',
    data: { 
      status: 'active', 
      version: '1.0.0',
      capabilities: ['chat', 'rag-dag', 'cross-platform']
    }
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    return NextResponse.json({
      success: true,
      message: 'Zauri Agent request processed',
      data: { received: body }
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
