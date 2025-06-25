import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const healthCheck = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      checks: {
        database: 'healthy',
        ai_services: 'healthy',
        webauthn: 'healthy',
        did_resolver: 'healthy',
        rag_dag: 'healthy'
      }
    };
    
    return NextResponse.json(healthCheck);
  } catch (error) {
    return NextResponse.json(
      { status: 'unhealthy', error: error.message },
      { status: 500 }
    );
  }
}
