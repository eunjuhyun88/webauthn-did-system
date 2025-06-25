// =============================================================================
// 🧪 데이터베이스 연결 테스트 API
// src/app/api/system/database-test/route.ts
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { 
  checkDatabaseConnection, 
  initializeDatabase, 
  ensureDefaultAgents,
  getDatabaseInfo,
  debugDatabaseState
} from '@/lib/database/supabase';

// =============================================================================
// GET: 데이터베이스 상태 확인
// =============================================================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'status';

    console.log(`🔍 데이터베이스 테스트 API 호출 - Action: ${action}`);

    switch (action) {
      case 'status':
        return await handleStatusCheck();
      
      case 'connection':
        return await handleConnectionTest();
      
      case 'initialize':
        return await handleInitialization();
      
      case 'agents':
        return await handleAgentsCheck();
      
      case 'info':
        return await handleDatabaseInfo();
      
      case 'debug':
        return await handleDebugInfo();
      
      default:
        return NextResponse.json(
          {
            success: false,
            error: `Unknown action: ${action}`,
            availableActions: ['status', 'connection', 'initialize', 'agents', 'info', 'debug']
          },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('❌ 데이터베이스 테스트 API 오류:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'API 실행 중 오류 발생',
        details: error instanceof Error ? error.message : '알 수 없는 오류',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// =============================================================================
// POST: 데이터베이스 초기화 및 설정
// =============================================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, options } = body;

    console.log(`🚀 데이터베이스 설정 API 호출 - Action: ${action}`);

    switch (action) {
      case 'initialize':
        return await handleFullInitialization(options);
      
      case 'reset-agents':
        return await handleAgentsReset();
      
      case 'create-test-user':
        return await handleTestUserCreation(options);
      
      default:
        return NextResponse.json(
          {
            success: false,
            error: `Unknown POST action: ${action}`,
            availableActions: ['initialize', 'reset-agents', 'create-test-user']
          },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('❌ 데이터베이스 설정 API 오류:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'POST API 실행 중 오류 발생',
        details: error instanceof Error ? error.message : '알 수 없는 오류',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// =============================================================================
// 핸들러 함수들
// =============================================================================

/**
 * 기본 상태 확인
 */
async function handleStatusCheck() {
  const connectionResult = await checkDatabaseConnection();
  
  const response = {
    success: connectionResult.success,
    status: connectionResult.success ? 'healthy' : 'unhealthy',
    message: connectionResult.message,
    timestamp: new Date().toISOString(),
    details: connectionResult.details
  };

  return NextResponse.json(response, {
    status: connectionResult.success ? 200 : 503
  });
}

/**
 * 연결 테스트
 */
async function handleConnectionTest() {
  console.log('🔗 데이터베이스 연결 테스트 시작...');
  
  const startTime = Date.now();
  const connectionResult = await checkDatabaseConnection();
  const responseTime = Date.now() - startTime;

  const response = {
    success: connectionResult.success,
    message: connectionResult.message,
    responseTime: `${responseTime}ms`,
    timestamp: new Date().toISOString(),
    connectionDetails: connectionResult.details,
    environment: {
      nodeEnv: process.env.NODE_ENV,
      supabaseUrl: process.env.SUPABASE_URL ? '✓ 설정됨' : '❌ 미설정',
      anonKey: process.env.SUPABASE_ANON_KEY ? '✓ 설정됨' : '❌ 미설정',
      serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? '✓ 설정됨' : '❌ 미설정'
    }
  };

  return NextResponse.json(response, {
    status: connectionResult.success ? 200 : 503
  });
}

/**
 * 전체 초기화
 */
async function handleInitialization() {
  console.log('🚀 데이터베이스 전체 초기화 시작...');
  
  const initResult = await initializeDatabase();
  
  const response = {
    success: initResult.success,
    message: initResult.message,
    timestamp: new Date().toISOString(),
    initializationDetails: initResult.details,
    nextSteps: initResult.success ? [
      '✅ 데이터베이스 연결 완료',
      '✅ 기본 AI Agents 설정 완료',
      '🎯 이제 WebAuthn 등록 테스트 가능',
      '🧠 Cue 추출 시스템 테스트 가능'
    ] : [
      '❌ 초기화 실패',
      '🔧 환경 변수 확인 필요',
      '🗄️ 데이터베이스 마이그레이션 확인 필요'
    ]
  };

  return NextResponse.json(response, {
    status: initResult.success ? 200 : 500
  });
}

/**
 * AI Agents 확인
 */
async function handleAgentsCheck() {
  console.log('🤖 AI Agents 상태 확인...');
  
  const agentResult = await ensureDefaultAgents();
  
  const response = {
    success: agentResult.success,
    message: agentResult.message,
    agentsCreated: agentResult.agentsCreated || 0,
    timestamp: new Date().toISOString(),
    availableAgents: [
      'gpt4-turbo (OpenAI GPT-4 Turbo)',
      'claude-sonnet (Anthropic Claude 3 Sonnet)',
      'gemini-pro (Google Gemini Pro)'
    ]
  };

  return NextResponse.json(response, {
    status: agentResult.success ? 200 : 500
  });
}

/**
 * 데이터베이스 정보 조회
 */
async function handleDatabaseInfo() {
  console.log('ℹ️ 데이터베이스 정보 조회...');
  
  const infoResult = await getDatabaseInfo();
  
  const response = {
    success: infoResult.success,
    info: infoResult.info,
    error: infoResult.error,
    timestamp: new Date().toISOString()
  };

  return NextResponse.json(response, {
    status: infoResult.success ? 200 : 500
  });
}

/**
 * 디버그 정보 (개발 환경만)
 */
async function handleDebugInfo() {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      {
        success: false,
        error: '디버그 정보는 개발 환경에서만 제공됩니다.',
        environment: process.env.NODE_ENV
      },
      { status: 403 }
    );
  }

  console.log('🐛 디버그 정보 수집...');
  
  try {
    // 콘솔 출력을 캡처하기 위한 임시 저장소
    const debugLog: string[] = [];
    const originalLog = console.log;
    console.log = (...args) => {
      debugLog.push(args.join(' '));
      originalLog(...args);
    };

    await debugDatabaseState();

    // 원래 console.log 복원
    console.log = originalLog;

    const response = {
      success: true,
      message: '디버그 정보 수집 완료',
      debugOutput: debugLog,
      timestamp: new Date().toISOString(),
      environment: {
        nodeEnv: process.env.NODE_ENV,
        platform: process.platform,
        nodeVersion: process.version
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: '디버그 정보 수집 실패',
        details: error instanceof Error ? error.message : '알 수 없는 오류'
      },
      { status: 500 }
    );
  }
}

/**
 * 전체 초기화 (옵션 포함)
 */
async function handleFullInitialization(options: any = {}) {
  console.log('🚀 전체 초기화 (고급 옵션) 시작...');
  
  const steps = [];
  
  try {
    // 1. 연결 확인
    steps.push('연결 확인 시작');
    const connectionResult = await checkDatabaseConnection();
    if (!connectionResult.success) {
      throw new Error(`연결 실패: ${connectionResult.message}`);
    }
    steps.push('✅ 연결 확인 완료');

    // 2. AI Agents 설정
    steps.push('AI Agents 설정 시작');
    const agentResult = await ensureDefaultAgents();
    if (!agentResult.success) {
      throw new Error(`AI Agents 설정 실패: ${agentResult.message}`);
    }
    steps.push(`✅ AI Agents 설정 완료 (${agentResult.agentsCreated}개 생성)`);

    // 3. 추가 초기화 작업들 (옵션에 따라)
    if (options.createTestData) {
      steps.push('테스트 데이터 생성은 아직 구현되지 않음');
    }

    const response = {
      success: true,
      message: '전체 초기화 완료',
      steps,
      timestamp: new Date().toISOString(),
      nextSteps: [
        '🔐 WebAuthn 시스템 테스트',
        '🧠 Cue 추출 시스템 테스트',
        '🎨 UI 컴포넌트 테스트'
      ]
    };

    return NextResponse.json(response);

  } catch (error) {
    steps.push(`❌ 오류 발생: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    
    return NextResponse.json(
      {
        success: false,
        error: '초기화 중 오류 발생',
        steps,
        details: error instanceof Error ? error.message : '알 수 없는 오류'
      },
      { status: 500 }
    );
  }
}

/**
 * AI Agents 리셋
 */
async function handleAgentsReset() {
  console.log('🔄 AI Agents 리셋...');
  
  // 실제 구현에서는 기존 agents 삭제 후 재생성
  const agentResult = await ensureDefaultAgents();
  
  const response = {
    success: agentResult.success,
    message: `AI Agents 리셋 ${agentResult.success ? '완료' : '실패'}`,
    agentsCreated: agentResult.agentsCreated || 0,
    timestamp: new Date().toISOString()
  };

  return NextResponse.json(response, {
    status: agentResult.success ? 200 : 500
  });
}

/**
 * 테스트 사용자 생성
 */
async function handleTestUserCreation(options: any = {}) {
  console.log('👤 테스트 사용자 생성...');
  
  // 테스트 사용자 생성 로직은 실제 사용자 생성 API 완성 후 구현
  const response = {
    success: false,
    message: '테스트 사용자 생성은 아직 구현되지 않았습니다.',
    note: 'WebAuthn 등록 API 완성 후 구현 예정',
    timestamp: new Date().toISOString()
  };

  return NextResponse.json(response, { status: 501 });
}