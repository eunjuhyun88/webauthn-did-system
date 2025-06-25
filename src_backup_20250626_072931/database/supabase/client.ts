// =============================================================================
// 🗄️ Supabase 클라이언트 설정 (완전한 버전)
// 파일: src/database/supabase/client.ts
// =============================================================================

import { createClient } from '@supabase/supabase-js';

// 환경 변수 검증
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error('SUPABASE_URL 환경 변수가 설정되지 않았습니다.');
}

if (!supabaseAnonKey) {
  throw new Error('SUPABASE_ANON_KEY 환경 변수가 설정되지 않았습니다.');
}

// 클라이언트용 Supabase 인스턴스 (브라우저에서 사용)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// 관리자용 Supabase 인스턴스 (서버에서만 사용)
export const supabaseAdmin = supabaseServiceKey ? createClient(
  supabaseUrl,
  supabaseServiceKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
) : null;

// 기본 export
export default supabase;
