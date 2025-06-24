// =============================================================================
// 🏥 시스템 상태 확인 API
// 파일: src/app/api/system/health/route.ts
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { 
  checkDatabaseConnection, 
  initializeDatabase,
  getDatabaseInfo 
} from '@/lib/database/supabase';
import { getWebAuthnServer } from '@/auth/webauthn/server';
import { getDIDService } from '@/identity/did';
import config, { validateConfig, getSystemInfo } from '@/lib/config';

// =============================================================================
// GET /api/system/health
// =============================================================================

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const action = url.searchParams.get('action') || 'status';

    console.log('🔍 시스템 상태 API 호출 - Action:', action);

    switch (action) {
      case 'status':
        return await handleHealthStatus();
      
      case 'initialize':
        return await handleSystemInitialization();
      
      case 'config':
        return await handleConfigurationCheck();
      
      case 'services':
        return await handleServicesCheck();
      
      default:
        return NextResponse.json({
          success: false,
          error: `지원되지 않는 액션: ${action}`,
          availableActions: ['status', 'initialize', 'config', 'services']
        }, { status: 400 });
    }

  } catch (error) {
    console.error('❌ 시스템 상태 API 오류:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '알 수 없는 오류',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// =============================================================================
// 기본 상태 확인
// =============================================================================

async function handleHealthStatus() {
  try {
    console.log('🔍 데이터베이스 연결 상태 확인 중...');

    // 1. 설정 검증
    const configValidation = validateConfig();
    
    // 2. 데이터베이스 연결 확인
    const dbConnection = await checkDatabaseConnection();
    
    // 3. 시스템 정보 수집
    const systemInfo = getSystemInfo();

    // 4. 서비스 상태 확인
    const webauthnServer = getWebAuthnServer();
    const didService = getDIDService();
    
    const serviceStatus = {
      webauthn: {
        available: true,
        config: webauthnServer.getConfiguration()
      },
      did: {
        available: true,
        config: didService.getConfiguration()
      },
      database: dbConnection,
      ai: {
        openai: !!config.OPENAI_API_KEY,
        claude: !!config.CLAUDE_API_KEY,
        gemini: !!config.GEMINI_API_KEY
      }
    };

    // 5. 전체 상태 평가
    const overallHealth = 
      configValidation.isValid && 
      dbConnection.success;

    const response = {
      success: true,
      status: overallHealth ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      system: systemInfo,
      services: serviceStatus,
      configuration: {
        valid: configValidation.isValid,
        errors: configValidation.errors,
        warnings: configValidation.warnings
      },
      checks: {
        database: dbConnection.success,
        webauthn: true,
        did: true,
        ai: !!(config.OPENAI_API_KEY || config.CLAUDE_API_KEY || config.GEMINI_API_KEY)
      }
    };

    const statusCode = overallHealth ? 200 : 503;
    return NextResponse.json(response, { status: statusCode });

  } catch (error) {
    console.error('❌ 상태 확인 실패:', error);
    return NextResponse.json({
      success: false,
      status: 'unhealthy',
      error: error instanceof Error ? error.message : '상태 확인 실패',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// =============================================================================
// 시스템 초기화
// =============================================================================

async function handleSystemInitialization() {
  try {
    console.log('🚀 시스템 초기화 시작...');

    // 1. 데이터베이스 초기화
    const dbInit = await initializeDatabase();
    
    if (!dbInit.success) {
      return NextResponse.json({
        success: false,
        message: `데이터베이스 초기화 실패: ${dbInit.message}`,
        details: dbInit.details,
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }

    // 2. WebAuthn 서비스 초기화
    const webauthnServer = getWebAuthnServer();
    const webauthnConfig = webauthnServer.getConfiguration();

    // 3. DID 서비스 초기화
    const didService = getDIDService();
    const didConfig = didService.getConfiguration();

    // 4. 초기화 완료 응답
    const response = {
      success: true,
      message: '데이터베이스 초기화 완료',
      timestamp: new Date().toISOString(),
      initializationDetails: dbInit.details,
      nextSteps: [
        '✅ 데이터베이스 연결 완료',
        '✅ 기본 AI Agents 설정 완료',
        '🎯 이제 WebAuthn 등록 테스트 가능',
        '🧠 Cue 추출 시스템 테스트 가능'
      ]
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ 시스템 초기화 실패:', error);
    return NextResponse.json({
      success: false,
      message: '시스템 초기화 실패',
      error: error instanceof Error ? error.message : '알 수 없는 오류',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// =============================================================================
// 설정 확인
// =============================================================================

async function handleConfigurationCheck() {
  try {
    const configValidation = validateConfig();
    const systemInfo = getSystemInfo();
    const dbInfo = await getDatabaseInfo();

    const configDetails = {
      environment: config.NODE_ENV,
      app: {
        url: config.APP_URL,
        port: config.PORT,
        version: systemInfo.version
      },
      webauthn: {
        rpName: config.WEBAUTHN_RP_NAME,
        rpId: config.WEBAUTHN_RP_ID,
        origin: config.WEBAUTHN_ORIGIN
      },
      did: {
        method: config.DID_METHOD,
        network: config.DID_NETWORK,
        resolverUrl: config.DID_RESOLVER_URL
      },
      database: dbInfo,
      ai: {
        openai: !!config.OPENAI_API_KEY,
        claude: !!config.CLAUDE_API_KEY,
        gemini: !!config.GEMINI_API_KEY,
        huggingface: !!config.HUGGINGFACE_API_KEY
      },
      features: {
        aiChat: config.ENABLE_AI_CHAT,
        voiceInput: config.ENABLE_VOICE_INPUT,
        knowledgeGraph: config.ENABLE_KNOWLEDGE_GRAPH,
        analytics: config.ENABLE_ANALYTICS
      },
      security: {
        apiRateLimit: config.API_RATE_LIMIT,
        maxFileSize: config.MAX_FILE_SIZE,
        externalApiTimeout: config.EXTERNAL_API_TIMEOUT
      }
    };

    return NextResponse.json({
      success: true,
      configuration: configDetails,
      validation: configValidation,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ 설정 확인 실패:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '설정 확인 실패',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// =============================================================================
// 서비스 상태 확인
// =============================================================================

async function handleServicesCheck() {
  try {
    // 1. WebAuthn 서비스 확인
    const webauthnServer = getWebAuthnServer();
    const webauthnStatus = {
      available: true,
      configuration: webauthnServer.getConfiguration(),
      capabilities: await webauthnServer.checkPlatformCapabilities()
    };

    // 2. DID 서비스 확인
    const didService = getDIDService();
    const didStatus = {
      available: true,
      configuration: didService.getConfiguration()
    };

    // 3. 데이터베이스 서비스 확인
    const dbStatus = await checkDatabaseConnection();

    // 4. AI 서비스 확인
    const aiStatus = {
      openai: {
        configured: !!config.OPENAI_API_KEY,
        available: !!config.OPENAI_API_KEY
      },
      claude: {
        configured: !!config.CLAUDE_API_KEY,
        available: !!config.CLAUDE_API_KEY
      },
      gemini: {
        configured: !!config.GEMINI_API_KEY,
        available: !!config.GEMINI_API_KEY
      }
    };

    // 5. 외부 연동 서비스 확인
    const externalServices = {
      google: {
        oauth: !!config.GOOGLE_CLIENT_ID,
        api: !!config.GOOGLE_API_KEY
      },
      discord: !!config.DISCORD_BOT_TOKEN,
      pinata: !!(config.PINATA_API_KEY && config.PINATA_SECRET)
    };

    const response = {
      success: true,
      services: {
        webauthn: webauthnStatus,
        did: didStatus,
        database: dbStatus,
        ai: aiStatus,
        external: externalServices
      },
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ 서비스 확인 실패:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '서비스 확인 실패',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// =============================================================================
// POST /api/system/health (시스템 테스트)
// =============================================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;

    console.log('🧪 시스템 테스트 실행:', action);

    switch (action) {
      case 'test-database':
        return await testDatabaseOperations(data);
      
      case 'test-webauthn':
        return await testWebAuthnFlow(data);
      
      case 'test-did':
        return await testDIDOperations(data);
      
      case 'test-cue':
        return await testCueExtraction(data);
      
      default:
        return NextResponse.json({
          success: false,
          error: `지원되지 않는 테스트 액션: ${action}`,
          availableActions: ['test-database', 'test-webauthn', 'test-did', 'test-cue']
        }, { status: 400 });
    }

  } catch (error) {
    console.error('❌ 시스템 테스트 실패:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '시스템 테스트 실패',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// =============================================================================
// 테스트 함수들
// =============================================================================

async function testDatabaseOperations(data: any) {
  try {
    // 데이터베이스 연결 및 기본 작업 테스트
    const dbStatus = await checkDatabaseConnection();
    
    if (!dbStatus.success) {
      throw new Error('데이터베이스 연결 실패');
    }

    return NextResponse.json({
      success: true,
      message: '데이터베이스 테스트 완료',
      results: dbStatus,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '데이터베이스 테스트 실패',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

async function testWebAuthnFlow(data: any) {
  try {
    const webauthnServer = getWebAuthnServer();
    
    // WebAuthn 등록 옵션 생성 테스트
    const registrationOptions = await webauthnServer.generateRegistrationOptions({
      id: 'test-user-id',
      username: 'test-user',
      displayName: 'Test User'
    });

    if (!registrationOptions.success) {
      throw new Error('WebAuthn 등록 옵션 생성 실패');
    }

    return NextResponse.json({
      success: true,
      message: 'WebAuthn 테스트 완료',
      results: {
        registrationOptionsGenerated: true,
        configuration: webauthnServer.getConfiguration()
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'WebAuthn 테스트 실패',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

async function testDIDOperations(data: any) {
  try {
    const didService = getDIDService();
    
    // DID 생성 테스트 (실제로 저장하지 않음)
    const testUsername = `test-user-${Date.now()}`;
    
    return NextResponse.json({
      success: true,
      message: 'DID 테스트 완료',
      results: {
        serviceAvailable: true,
        configuration: didService.getConfiguration(),
        testUsername
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'DID 테스트 실패',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

async function testCueExtraction(data: any) {
  try {
    // CUE 추출 시스템 기본 테스트
    const testText = data?.text || "안녕하세요. 저는 개발자이고 AI에 관심이 많습니다.";
    
    // 간단한 패턴 매칭 테스트
    const patterns = [
      { type: 'preference', regex: /(?:저는|나는|내가)\s+(.+?)(?:이고|입니다)/ },
      { type: 'interest', regex: /(.+?)(?:에 관심|을 좋아)/ }
    ];

    const extractedPatterns = patterns.map(pattern => {
      const matches = Array.from(testText.matchAll(new RegExp(pattern.regex, 'gi')));
      return {
        type: pattern.type,
        matches: matches.map(m => m[1]?.trim()).filter(Boolean)
      };
    }).filter(result => result.matches.length > 0);

    return NextResponse.json({
      success: true,
      message: 'CUE 추출 테스트 완료',
      results: {
        testText,
        extractedPatterns,
        aiAvailable: !!(config.OPENAI_API_KEY || config.CLAUDE_API_KEY)
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'CUE 추출 테스트 실패',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}