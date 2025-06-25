import { createClient, SupabaseClient } from '@supabase/supabase-js';

// 환경 변수 (문법 오류 완전 수정)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://luqmowvevwfwqbkbahko.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx1cW1vd3Zldndmd3Frica2JhaGtvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3MDA0ODQsImV4cCI6MjA2NjI3NjQ4NH0.SUBvP-M3FwpqbasjeMUfWwEV3ifOi_APA5DvznT26nE';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx1cW1vd3Zldndmd3Frica2JhaGtvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDcwMDQ4NCwiZXhwIjoyMDY2Mjc2NDg0fQ.H94s7s7klKOkguedawlOow3wsKks1_cvTTZq0TbnXH0';

// 메인 Supabase 클라이언트 (단일 생성)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// 서비스 역할 클라이언트 (관리자 작업용)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// createClient 함수 re-export (호환성)
export { createClient };

// 타입 export
export type { SupabaseClient };

// 기본 export
export default supabase;
