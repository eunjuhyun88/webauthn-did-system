/**
 * 🔐 Authentication Status Check API
 * 현재 사용자의 인증 상태와 정보를 반환
 */

import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { createClient } from '@/database/supabase/client';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Auth check requested');

    // 1. 쿠키에서 토큰 추출
    const authToken = request.cookies.get('auth-token')?.value;
    const refreshToken = request.cookies.get('refresh-token')?.value;

    if (!authToken) {
      console.log('🔓 No auth token found');
      return NextResponse.json({
        authenticated: false,
        user: null,
        error: 'No authentication token'
      });
    }

    // 2. JWT 토큰 검증
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
    
    try {
      const { payload } = await jwtVerify(authToken, secret);
      
      // 3. 토큰 만료 확인
      if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
        console.log('⏰ Access token expired, attempting refresh...');
        
        if (refreshToken) {
          const refreshResult = await refreshAccessToken(refreshToken);
          if (refreshResult.success) {
            console.log('✅ Token refreshed successfully');
            
            // 새 토큰으로 응답 생성
            const response = NextResponse.json({
              authenticated: true,
              user: refreshResult.user,
              tokenRefreshed: true
            });
            
            // 새 토큰을 쿠키에 설정
            response.cookies.set({
              name: 'auth-token',
              value: refreshResult.accessToken!,
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'strict',
              maxAge: 86400, // 24시간
              path: '/'
            });
            
            return response;
          }
        }
        
        console.log('❌ Token refresh failed');
        return NextResponse.json({
          authenticated: false,
          user: null,
          error: 'Token expired'
        });
      }

      // 4. Supabase에서 사용자 정보 조회
      const supabase = createClient();
      const userDID = payload.sub as string;
      
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select(`
          *,
          webauthn_credentials (
            id,
            credential_id,
            last_used_at,
            created_at
          )
        `)
        .eq('did', userDID)
        .single();

      if (userError || !userData) {
        console.log('❌ User not found in database:', userError);
        return NextResponse.json({
          authenticated: false,
          user: null,
          error: 'User not found'
        });
      }

      // 5. 사용자 정보 구성
      const user = {
        id: userData.id,
        did: userData.did,
        username: userData.username,
        email: userData.email,
        displayName: userData.display_name,
        authMethod: payload.authMethod as string || 'webauthn',
        avatar: userData.avatar_url,
        profile: {
          createdAt: userData.created_at,
          lastLoginAt: userData.last_login_at || new Date().toISOString(),
          trustScore: calculateTrustScore(userData),
          level: calculateUserLevel(userData)
        },
        subscription: userData.subscription_type || 'free',
        tokens: {
          accessToken: authToken,
          refreshToken: refreshToken || '',
          expiresAt: (payload.exp as number) * 1000
        },
        stats: {
          credentialCount: userData.webauthn_credentials?.length || 0,
          lastCredentialUsed: userData.webauthn_credentials?.[0]?.last_used_at,
          accountAge: Math.floor((Date.now() - new Date(userData.created_at).getTime()) / (1000 * 60 * 60 * 24))
        }
      };

      // 6. 마지막 활동 시간 업데이트
      await supabase
        .from('users')
        .update({ 
          last_active_at: new Date().toISOString(),
          last_login_at: new Date().toISOString()
        })
        .eq('did', userDID);

      console.log('✅ Auth check successful for:', user.username);

      return NextResponse.json({
        authenticated: true,
        user,
        sessionInfo: {
          sessionId: payload.sessionId,
          issuedAt: payload.iat,
          expiresAt: payload.exp,
          authMethod: payload.authMethod
        }
      });

    } catch (jwtError) {
      console.log('❌ JWT verification failed:', jwtError);
      return NextResponse.json({
        authenticated: false,
        user: null,
        error: 'Invalid token'
      });
    }

  } catch (error) {
    console.error('❌ Auth check failed:', error);
    return NextResponse.json(
      {
        authenticated: false,
        user: null,
        error: 'Authentication check failed'
      },
      { status: 500 }
    );
  }
}

/**
 * 리프레시 토큰으로 새 액세스 토큰 발급
 */
async function refreshAccessToken(refreshToken: string): Promise<{
  success: boolean;
  accessToken?: string;
  user?: any;
  error?: string;
}> {
  try {
    const refreshSecret = new TextEncoder().encode(process.env.JWT_REFRESH_SECRET!);
    const { payload } = await jwtVerify(refreshToken, refreshSecret);
    
    if (payload.type !== 'refresh') {
      return { success: false, error: 'Invalid refresh token type' };
    }

    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return { success: false, error: 'Refresh token expired' };
    }

    // Supabase에서 사용자 세션 확인
    const supabase = createClient();
    const sessionId = payload.sessionId as string;
    
    const { data: sessionData, error: sessionError } = await supabase
      .from('user_sessions')
      .select(`
        *,
        users (
          id,
          did,
          username,
          email,
          display_name,
          avatar_url,
          subscription_type,
          created_at,
          last_login_at
        )
      `)
      .eq('session_id', sessionId)
      .eq('user_did', payload.sub as string)
      .single();

    if (sessionError || !sessionData) {
      return { success: false, error: 'Session not found' };
    }

    // 새 액세스 토큰 생성
    const { SignJWT } = await import('jose');
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
    
    const tokenPayload = {
      sub: sessionData.user_did,
      username: sessionData.users.username,
      email: sessionData.users.email,
      authMethod: 'webauthn',
      sessionId: sessionId,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24시간
    };
    
    const accessToken = await new SignJWT(tokenPayload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('24h')
      .sign(secret);

    // 세션 마지막 활동 시간 업데이트
    await supabase
      .from('user_sessions')
      .update({ 
        last_activity: new Date().toISOString(),
        access_token: accessToken
      })
      .eq('session_id', sessionId);

    // 사용자 정보 구성
    const user = {
      id: sessionData.users.id,
      did: sessionData.user_did,
      username: sessionData.users.username,
      email: sessionData.users.email,
      displayName: sessionData.users.display_name,
      authMethod: 'webauthn',
      avatar: sessionData.users.avatar_url,
      profile: {
        createdAt: sessionData.users.created_at,
        lastLoginAt: sessionData.users.last_login_at,
        trustScore: 95, // 기본값
        level: 1 // 기본값
      },
      subscription: sessionData.users.subscription_type || 'free'
    };

    return { 
      success: true, 
      accessToken, 
      user 
    };

  } catch (error) {
    console.error('❌ Token refresh failed:', error);
    return { success: false, error: 'Token refresh failed' };
  }
}

/**
 * 사용자 신뢰도 점수 계산
 */
function calculateTrustScore(userData: any): number {
  let score = 50; // 기본 점수
  
  // 계정 나이에 따른 점수 (최대 20점)
  const accountAge = Math.floor((Date.now() - new Date(userData.created_at).getTime()) / (1000 * 60 * 60 * 24));
  score += Math.min(20, accountAge * 0.5);
  
  // WebAuthn 사용에 따른 점수 (최대 20점)
  if (userData.webauthn_credentials?.length > 0) {
    score += 20;
  }
  
  // 이메일 인증 여부 (최대 10점)
  if (userData.email_verified) {
    score += 10;
  }
  
  return Math.min(100, Math.max(0, Math.round(score)));
}

/**
 * 사용자 레벨 계산
 */
function calculateUserLevel(userData: any): number {
  const accountAge = Math.floor((Date.now() - new Date(userData.created_at).getTime()) / (1000 * 60 * 60 * 24));
  const credentialCount = userData.webauthn_credentials?.length || 0;
  
  // 기본 레벨 1
  let level = 1;
  
  // 계정 나이에 따른 레벨 증가
  level += Math.floor(accountAge / 30); // 30일마다 1레벨
  
  // 보안 자격 증명에 따른 보너스
  if (credentialCount > 1) level += 1;
  if (userData.email_verified) level += 1;
  
  return Math.min(99, Math.max(1, level));
}

// OPTIONS 요청 처리 (CORS)
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Credentials': 'true',
    },
  });
}