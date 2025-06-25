/**
 * 🗄️ Supabase 클라이언트 (간소화 버전)
 * WebAuthn + DID 시스템용 - 프로덕션 준비됨
 */

import { createClient } from '@supabase/supabase-js';

// =============================================================================
// 환경 변수 검증
// =============================================================================

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('❌ Supabase URL과 Anon Key가 필요합니다');
}

// =============================================================================
// 클라이언트 생성 함수
// =============================================================================

export function createSupabaseClient() {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
    global: {
      headers: {
        'X-Client-Info': 'webauthn-did-system'
      }
    }
  });
}

// =============================================================================
// 기본 클라이언트 인스턴스 (클라이언트 사이드)
// =============================================================================

export const supabase = createSupabaseClient();

// =============================================================================
// 서버용 클라이언트 (API 라우트용)
// =============================================================================

export function createServerSupabaseClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!serviceKey) {
    console.warn('⚠️ Service role key 없음, anon key 사용');
    return createSupabaseClient();
  }
  
  return createClient(supabaseUrl, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    },
    global: {
      headers: {
        'X-Client-Info': 'webauthn-did-system-server'
      }
    }
  });
}

// =============================================================================
// 편의 함수들
// =============================================================================

// 서버용 관리자 클라이언트
export const supabaseAdmin = createServerSupabaseClient();

// 기본 내보내기
export { createClient };
export default createSupabaseClient;