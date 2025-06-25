/**
 * 🚪 Logout API Route
 * 안전한 로그아웃 처리 및 세션 정리
 */

import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { createClient } from '@/database/supabase/client';

export async function POST(request: NextRequest) {
  try {
    console.log('🚪 Logout requested');

    // 1. 현재 토큰 확인
    const authToken = request.cookies.get('auth-token')?.value;
    const refreshToken = request.cookies.get('refresh-token')?.value;

    if (authToken) {
      try {
        // 2. JWT 토큰 디코딩 (검증은 하지 않고 정보만 추출)
        const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
        const { payload } = await jwtVerify(authToken, secret);
        
        const userDID = payload.sub as string;
        const sessionId = payload.sessionId as string;

        // 3. Supabase에서 세션 무효화
        const supabase = createClient();
        
        if (sessionId) {
          console.log('🗑️ Invalidating session:', sessionId);
          
          // 사용자 세션 삭제
          await supabase
            .from('user_sessions')
            .delete()
            .eq('session_id', sessionId)
            .eq('user_did', userDID);

          // 로그아웃 로그 기록
          await supabase
            .from('auth_attempts')
            .insert({
              user_did: userDID,
              attempt_type: 'logout',
              success: true,
              device_info: {
                userAgent: request.headers.get('user-agent'),
                ip: request.headers.get('x-forwarded-for') || 'unknown'
              },
              attempted_at: new Date().toISOString()
            });

          // 사용자 마지막 로그아웃 시간 업데이트
          await supabase
            .from('users')
            .update({ 
              last_logout_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq('did', userDID);

          console.log('✅ Session invalidated successfully');
        }

      } catch (jwtError) {
        console.log('⚠️ Invalid token during logout (proceeding anyway):', jwtError);
        // 토큰이 유효하지 않아도 로그아웃은 진행
      }
    }

    // 4. 응답 생성 및 쿠키 삭제
    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully',
      timestamp: new Date().toISOString()
    });

    // 5. 인증 관련 쿠키 모두 삭제
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
      path: '/',
      maxAge: 0 // 즉시 만료
    };

    response.cookies.set('auth-token', '', cookieOptions);
    response.cookies.set('refresh-token', '', cookieOptions);
    response.cookies.set('session-id', '', cookieOptions);

    // 6. 추가 보안 헤더
    response.headers.set('Clear-Site-Data', '"cookies", "storage"');
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');

    console.log('✅ Logout completed successfully');

    return response;

  } catch (error) {
    console.error('❌ Logout failed:', error);
    
    // 에러가 발생해도 클라이언트에서는 로그아웃 처리
    const response = NextResponse.json({
      success: true, // 클라이언트 로그아웃은 항상 성공으로 처리
      message: 'Logged out (with errors)',
      error: 'Server-side cleanup failed',
      timestamp: new Date().toISOString()
    }, { status: 200 }); // 200으로 반환

    // 쿠키 삭제는 수행
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
      path: '/',
      maxAge: 0
    };

    response.cookies.set('auth-token', '', cookieOptions);
    response.cookies.set('refresh-token', '', cookieOptions);
    response.cookies.set('session-id', '', cookieOptions);

    return response;
  }
}

// GET 요청도 지원 (간단한 로그아웃 링크용)
export async function GET(request: NextRequest) {
  return POST(request);
}

// OPTIONS 요청 처리 (CORS)
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Credentials': 'true',
    },
  });
}