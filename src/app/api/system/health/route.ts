// =============================================================================
// 🏥 시스템 상태 확인 API - src/app/api/system/health/route.ts
// 전체 시스템 상태를 확인하는 헬스체크 엔드포인트
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { supabase, testConnection } from '@/database/supabase/client';
import CONFIG from '@/lib/config';

// =============================================================================
// 🔍 개별 서비스 상태 확인 함수들
// =============================================================================

/**
 * 데이터베이스 연결 상태 확인
 */
async function checkDatabaseHealth(): Promise<{
  status: 'healthy' | 'unhealthy' | 'degraded';
  responseTime: number;
  details: any;
}> {
  const startTime = Date.now();
  
  try {
    // Supabase 연결 테스트
    const isConnected = await testConnection();
    const responseTime = Date.now() - startTime;

    if (isConnected) {
      // 추가 상태 정보 수집
      const { data: tableCount } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public');

      return {
        status: 'healthy',
        responseTime,
        details: {
          connected: true,
          url: CONFIG.DATABASE.SUPABASE_URL.split('@')[1] || 'hidden',
          tableCount: tableCount?.length || 0,
          timestamp: new Date().toISOString()
        }
      };
    } else {
      return {
        status: 'unhealthy',
        responseTime,
        details: {
          connected: false,
          error: 'Connection failed'
        }
      };
    }
  } catch (error: any) {
    return {
      status: 'unhealthy',
      responseTime: Date.now() - startTime,
      details: {
        connected: false,
        error: error.message,
        code: error.code
      }
    };
  }
}

/**
 * AI 서비스 상태 확인
 */
async function checkAIServicesHealth(): Promise<{
  status: 'healthy' | 'unhealthy' | 'degraded';
  services: any;
}> {
  const services = {
    openai: { available: !!CONFIG.AI.OPENAI.API_KEY, status: 'unknown' },
    claude: { available: !!CONFIG.AI.CLAUDE.API_KEY, status: 'unknown' },
    gemini: { available: !!CONFIG.AI.GEMINI.API_KEY, status: 'unknown' }
  };

  // 간단한 API 키 존재 여부만 확인 (실제 호출은 비용이 발생할 수 있음)
  const availableCount = Object.values(services).filter(s => s.available).length;
  
  let status: 'healthy' | 'unhealthy' | 'degraded' = 'unhealthy';
  if (availableCount >= 3) status = 'healthy';
  else if (availableCount >= 1) status = 'degraded';

  return { status, services };
}

/**
 * WebAuthn 설정 상태 확인
 */
function checkWebAuthnHealth(): {
  status: 'healthy' | 'unhealthy' | 'degraded';
  config: any;
} {
  const config = {
    enabled: CONFIG.FEATURES.ENABLE_WEBAUTHN,
    rpId: CONFIG.WEBAUTHN.RP_ID,
    rpName: CONFIG.WEBAUTHN.RP_NAME,
    origin: CONFIG.WEBAUTHN.ORIGIN,
    validDomain: CONFIG.WEBAUTHN.RP_ID.includes('.') || CONFIG.SERVER.NODE_ENV === 'development'
  };

  let status: 'healthy' | 'unhealthy' | 'degraded' = 'healthy';
  
  if (!config.enabled) {
    status = 'degraded';
  } else if (!config.validDomain && CONFIG.SERVER.NODE_ENV === 'production') {
    status = 'unhealthy';
  }

  return { status, config };
}

/**
 * DID 서비스 상태 확인
 */
function checkDIDHealth(): {
  status: 'healthy' | 'unhealthy' | 'degraded';
  config: any;
} {
  const config = {
    enabled: CONFIG.FEATURES.ENABLE_DID,
    method: CONFIG.DID.METHOD,
    network: CONFIG.DID.NETWORK,
    resolverUrl: CONFIG.DID.RESOLVER_URL
  };

  const status = config.enabled ? 'healthy' : 'degraded';

  return { status, config };
}

/**
 * 환경 변수 상태 확인
 */
function checkEnvironmentHealth(): {
  status: 'healthy' | 'unhealthy' | 'degraded';
  variables: any;
} {
  const requiredVars = [
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY',
    'JWT_SECRET'
  ];

  const optionalVars = [
    'OPENAI_API_KEY',
    'CLAUDE_API_KEY',
    'GEMINI_API_KEY',
    'GOOGLE_CLIENT_ID'
  ];

  const missing = requiredVars.filter(key => !process.env[key]);
  const availableOptional = optionalVars.filter(key => !!process.env[key]);

  let status: 'healthy' | 'unhealthy' | 'degraded' = 'healthy';
  if (missing.length > 0) {
    status = 'unhealthy';
  } else if (availableOptional.length === 0) {
    status = 'degraded';
  }

  return {
    status,
    variables: {
      required: {
        total: requiredVars.length,
        available: requiredVars.length - missing.length,
        missing
      },
      optional: {
        total: optionalVars.length,
        available: availableOptional.length,
        configured: availableOptional
      }
    }
  };
}

// =============================================================================
// 🏥 메인 헬스체크 API
// =============================================================================

export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    // 모든 서비스 상태 병렬 확인
    const [
      databaseHealth,
      aiServicesHealth,
      webauthnHealth,
      didHealth,
      environmentHealth
    ] = await Promise.all([
      checkDatabaseHealth(),
      checkAIServicesHealth(),
      Promise.resolve(checkWebAuthnHealth()),
      Promise.resolve(checkDIDHealth()),
      Promise.resolve(checkEnvironmentHealth())
    ]);

    // 전체 시스템 상태 결정
    const allStatuses = [
      databaseHealth.status,
      aiServicesHealth.status,
      webauthnHealth.status,
      didHealth.status,
      environmentHealth.status
    ];

    let overallStatus: 'healthy' | 'unhealthy' | 'degraded' = 'healthy';
    
    if (allStatuses.includes('unhealthy')) {
      overallStatus = 'unhealthy';
    } else if (allStatuses.includes('degraded')) {
      overallStatus = 'degraded';
    }

    const totalResponseTime = Date.now() - startTime;

    // 응답 데이터 구성
    const healthData = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      responseTime: totalResponseTime,
      version: process.env.npm_package_version || '1.0.0',
      environment: CONFIG.SERVER.NODE_ENV,
      uptime: process.uptime(),
      
      services: {
        database: databaseHealth,
        ai: aiServicesHealth,
        webauthn: webauthnHealth,
        did: didHealth,
        environment: environmentHealth
      },

      system: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        memory: {
          used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
          total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
          external: Math.round(process.memoryUsage().external / 1024 / 1024)
        },
        pid: process.pid
      },

      features: {
        webauthn: CONFIG.FEATURES.ENABLE_WEBAUTHN,
        did: CONFIG.FEATURES.ENABLE_DID,
        aiChat: CONFIG.FEATURES.ENABLE_AI_CHAT,
        voiceInput: CONFIG.FEATURES.ENABLE_VOICE_INPUT,
        knowledgeGraph: CONFIG.FEATURES.ENABLE_KNOWLEDGE_GRAPH,
        analytics: CONFIG.FEATURES.ENABLE_ANALYTICS
      }
    };

    // 상태 코드 결정
    let statusCode = 200;
    if (overallStatus === 'degraded') statusCode = 207; // Multi-Status
    if (overallStatus === 'unhealthy') statusCode = 503; // Service Unavailable

    return NextResponse.json(healthData, { 
      status: statusCode,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Health-Check': 'true',
        'X-Response-Time': totalResponseTime.toString()
      }
    });

  } catch (error: any) {
    console.error('Health check error:', error);

    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      responseTime: Date.now() - startTime,
      error: {
        message: error.message,
        name: error.name,
        stack: CONFIG.SERVER.NODE_ENV === 'development' ? error.stack : undefined
      },
      services: {
        database: { status: 'unknown' },
        ai: { status: 'unknown' },
        webauthn: { status: 'unknown' },
        did: { status: 'unknown' },
        environment: { status: 'unknown' }
      }
    }, { 
      status: 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Health-Check': 'true'
      }
    });
  }
}

// =============================================================================
// 🔧 추가 헬스체크 엔드포인트들
// =============================================================================

/**
 * 간단한 상태 확인 (빠른 응답)
 */
export async function HEAD(request: NextRequest) {
  try {
    // 매우 기본적인 확인만
    const isDbConnected = await testConnection();
    
    return new NextResponse(null, {
      status: isDbConnected ? 200 : 503,
      headers: {
        'X-Health-Status': isDbConnected ? 'healthy' : 'unhealthy',
        'Cache-Control': 'no-cache'
      }
    });
  } catch (error) {
    return new NextResponse(null, {
      status: 503,
      headers: {
        'X-Health-Status': 'unhealthy',
        'Cache-Control': 'no-cache'
      }
    });
  }
}

/**
 * 상세한 디버그 정보 (개발 환경에서만)
 */
export async function POST(request: NextRequest) {
  if (CONFIG.SERVER.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: 'Debug endpoint only available in development' },
      { status: 403 }
    );
  }

  try {
    const body = await request.json().catch(() => ({}));
    const includeSecrets = body.includeSecrets === true;

    const debugInfo = {
      timestamp: new Date().toISOString(),
      request: {
        method: request.method,
        url: request.url,
        headers: Object.fromEntries(request.headers.entries()),
        userAgent: request.headers.get('user-agent')
      },
      environment: includeSecrets ? process.env : {
        NODE_ENV: process.env.NODE_ENV,
        VERCEL: process.env.VERCEL,
        PORT: process.env.PORT
      },
      config: CONFIG,
      system: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        cpuUsage: process.cpuUsage(),
        memoryUsage: process.memoryUsage(),
        uptime: process.uptime(),
        cwd: process.cwd(),
        execPath: process.execPath,
        argv: process.argv
      }
    };

    return NextResponse.json(debugInfo, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Debug-Info': 'true'
      }
    });

  } catch (error: any) {
    return NextResponse.json({
      error: 'Debug info collection failed',
      message: error.message
    }, { status: 500 });
  }
}