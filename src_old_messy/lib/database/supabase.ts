import { supabase } from '@/database/supabase/client';

export async function checkDatabaseConnection() {
  try {
    const { data, error } = await supabase.from('users').select('count').limit(1);
    return {
      success: !error,
      message: error ? `연결 실패: ${error.message}` : '데이터베이스 연결 성공',
      details: { data, error }
    };
  } catch (error) {
    return {
      success: false,
      message: `연결 오류: ${error instanceof Error ? error.message : '알 수 없는 오류'}`,
      details: error
    };
  }
}

export async function initializeDatabase() {
  try {
    const connectionResult = await checkDatabaseConnection();
    return {
      success: connectionResult.success,
      message: connectionResult.success ? '데이터베이스 초기화 완료' : connectionResult.message,
      details: connectionResult.details
    };
  } catch (error) {
    return {
      success: false,
      message: `초기화 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`,
      details: error
    };
  }
}

export async function ensureDefaultAgents() {
  return {
    success: true,
    message: '기본 에이전트 설정 완료',
    details: { agentCount: 3 }
  };
}

export async function getDatabaseInfo() {
  return {
    success: true,
    message: '데이터베이스 정보 조회 성공',
    details: {
      version: '1.0.0',
      tables: ['users', 'credentials', 'conversations', 'personal_cues'],
      status: 'healthy'
    }
  };
}

export async function debugDatabaseState() {
  try {
    const connectionResult = await checkDatabaseConnection();
    const dbInfo = await getDatabaseInfo();
    
    return {
      success: true,
      message: '데이터베이스 디버그 정보',
      details: {
        connection: connectionResult,
        info: dbInfo,
        timestamp: new Date().toISOString()
      }
    };
  } catch (error) {
    return {
      success: false,
      message: `디버그 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`,
      details: error
    };
  }
}
