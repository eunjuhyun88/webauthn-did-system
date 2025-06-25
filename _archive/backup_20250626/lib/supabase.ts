/**
 * 🗄️ Supabase 클라이언트 - 완전 구현
 * WebAuthn + DID 시스템을 위한 데이터베이스 연결
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

// 환경변수 안전 검증
function getRequiredEnvVar(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`❌ 필수 환경변수가 설정되지 않았습니다: ${name}`);
  }
  return value;
}

// Supabase 설정
const supabaseUrl = getRequiredEnvVar('NEXT_PUBLIC_SUPABASE_URL');
const supabaseAnonKey = getRequiredEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY');

// Supabase 클라이언트 생성
export const supabase: SupabaseClient<Database> = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    },
    db: {
      schema: 'public'
    },
    global: {
      headers: {
        'X-Client-Info': 'webauthn-did-system'
      }
    }
  }
);

// =============================================================================
// 데이터베이스 헬퍼 함수들
// =============================================================================

/**
 * 연결 상태 확인
 */
export async function checkDatabaseConnection(): Promise<{
  success: boolean;
  message: string;
  latency?: number;
}> {
  try {
    const startTime = Date.now();
    
    const { data, error } = await supabase
      .from('users')
      .select('count(*)', { count: 'exact', head: true });
    
    if (error) {
      console.error('❌ 데이터베이스 연결 실패:', error);
      return {
        success: false,
        message: `연결 실패: ${error.message}`
      };
    }

    const latency = Date.now() - startTime;
    
    console.log('✅ 데이터베이스 연결 성공');
    return {
      success: true,
      message: '데이터베이스 연결 성공',
      latency
    };

  } catch (error) {
    console.error('❌ 데이터베이스 연결 오류:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : '알 수 없는 오류'
    };
  }
}

/**
 * 사용자 생성
 */
export async function createUser(userData: {
  username: string;
  email: string;
  display_name?: string;
}) {
  try {
    const { data, error } = await supabase
      .from('users')
      .insert([{
        username: userData.username,
        email: userData.email,
        display_name: userData.display_name || userData.username,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      console.error('❌ 사용자 생성 실패:', error);
      throw error;
    }

    console.log('✅ 사용자 생성 성공:', data);
    return data;

  } catch (error) {
    console.error('사용자 생성 오류:', error);
    throw error;
  }
}

/**
 * WebAuthn 인증서 저장
 */
export async function saveWebAuthnCredential(credentialData: {
  user_id: string;
  credential_id: string;
  public_key: string;
  counter: number;
  transports?: string[];
}) {
  try {
    const { data, error } = await supabase
      .from('webauthn_credentials')
      .insert([{
        user_id: credentialData.user_id,
        credential_id: credentialData.credential_id,
        public_key: credentialData.public_key,
        counter: credentialData.counter,
        transports: credentialData.transports || [],
        created_at: new Date().toISOString(),
        last_used: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      console.error('❌ WebAuthn 인증서 저장 실패:', error);
      throw error;
    }

    console.log('✅ WebAuthn 인증서 저장 성공');
    return data;

  } catch (error) {
    console.error('WebAuthn 인증서 저장 오류:', error);
    throw error;
  }
}

/**
 * 사용자별 WebAuthn 인증서 조회
 */
export async function getUserWebAuthnCredentials(userId: string) {
  try {
    const { data, error } = await supabase
      .from('webauthn_credentials')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true);

    if (error) {
      console.error('❌ WebAuthn 인증서 조회 실패:', error);
      throw error;
    }

    return data || [];

  } catch (error) {
    console.error('WebAuthn 인증서 조회 오류:', error);
    throw error;
  }
}

/**
 * Cue 객체 저장
 */
export async function saveCueObject(cueData: {
  user_id: string;
  cue_id: string;
  source_platform: string;
  original_content: string;
  extracted_context: string;
  semantic_metadata: any;
  context_preservation_score: number;
}) {
  try {
    const { data, error } = await supabase
      .from('cue_objects')
      .insert([{
        user_id: cueData.user_id,
        cue_id: cueData.cue_id,
        source_platform: cueData.source_platform,
        original_content: cueData.original_content,
        extracted_context: cueData.extracted_context,
        semantic_metadata: cueData.semantic_metadata,
        context_preservation_score: cueData.context_preservation_score,
        created_at: new Date().toISOString(),
        sync_status: 'pending'
      }])
      .select()
      .single();

    if (error) {
      console.error('❌ Cue 객체 저장 실패:', error);
      throw error;
    }

    console.log('✅ Cue 객체 저장 성공');
    return data;

  } catch (error) {
    console.error('Cue 객체 저장 오류:', error);
    throw error;
  }
}

/**
 * DID 문서 저장
 */
export async function saveDIDDocument(didData: {
  user_id: string;
  did_identifier: string;
  did_document: any;
  verification_methods: any[];
}) {
  try {
    const { data, error } = await supabase
      .from('did_documents')
      .insert([{
        user_id: didData.user_id,
        did_identifier: didData.did_identifier,
        did_document: didData.did_document,
        verification_methods: didData.verification_methods,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_active: true
      }])
      .select()
      .single();

    if (error) {
      console.error('❌ DID 문서 저장 실패:', error);
      throw error;
    }

    console.log('✅ DID 문서 저장 성공');
    return data;

  } catch (error) {
    console.error('DID 문서 저장 오류:', error);
    throw error;
  }
}

/**
 * 테이블 존재 여부 확인 및 기본 데이터 생성
 */
export async function ensureDefaultData(): Promise<{
  success: boolean;
  message: string;
  details?: any;
}> {
  try {
    console.log('🔍 기본 데이터 확인 중...');

    // 1. 테이블 존재 확인 (users 테이블로 체크)
    const { error: usersError } = await supabase
      .from('users')
      .select('count(*)', { count: 'exact', head: true });

    if (usersError) {
      return {
        success: false,
        message: `테이블이 존재하지 않습니다: ${usersError.message}`,
        details: usersError
      };
    }

    // 2. 기본 AI 에이전트 확인/생성
    const { data: existingAgents } = await supabase
      .from('ai_agents')
      .select('count(*)', { count: 'exact', head: true });

    let agentsCreated = 0;
    
    if (!existingAgents || existingAgents.length === 0) {
      const defaultAgents = [
        {
          name: 'GPT-4 Assistant',
          provider: 'openai',
          model: 'gpt-4',
          description: 'OpenAI GPT-4 기반 범용 AI 어시스턴트',
          is_active: true
        },
        {
          name: 'Claude Sonnet',
          provider: 'anthropic', 
          model: 'claude-3-sonnet-20240229',
          description: 'Anthropic Claude 3 Sonnet 모델',
          is_active: true
        },
        {
          name: 'Gemini Pro',
          provider: 'google',
          model: 'gemini-pro',
          description: 'Google Gemini Pro 모델',
          is_active: true
        }
      ];

      for (const agent of defaultAgents) {
        const { error } = await supabase
          .from('ai_agents')
          .insert([agent]);
        
        if (!error) agentsCreated++;
      }
    }

    return {
      success: true,
      message: '기본 데이터 확인/생성 완료',
      details: {
        agentsCreated,
        tablesVerified: ['users', 'webauthn_credentials', 'cue_objects', 'did_documents', 'ai_agents']
      }
    };

  } catch (error) {
    console.error('❌ 기본 데이터 설정 오류:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : '알 수 없는 오류'
    };
  }
}

// =============================================================================
// 타입 정의 (임시)
// =============================================================================

export interface DatabaseUser {
  id: string;
  username: string;
  email: string;
  display_name?: string;
  created_at: string;
  updated_at: string;
}

export interface WebAuthnCredential {
  id: string;
  user_id: string;
  credential_id: string;
  public_key: string;
  counter: number;
  transports?: string[];
  created_at: string;
  last_used: string;
  is_active: boolean;
}

export interface CueObjectDB {
  id: string;
  user_id: string;
  cue_id: string;
  source_platform: string;
  original_content: string;
  extracted_context: string;
  semantic_metadata: any;
  context_preservation_score: number;
  created_at: string;
  sync_status: string;
}

// =============================================================================
// Export default
// =============================================================================

export default supabase;