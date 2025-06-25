import { NextResponse } from 'next/server';

export async function GET() {
  const healthStatus = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      database: 'connected',
      ai: 'operational',
      cue: 'mining',
      webauthn: 'ready'
    },
    version: '1.0.0'
  };
  
  return NextResponse.json(healthStatus);
}
