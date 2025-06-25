/**
 * 🔐 Next.js 미들웨어 - 인증 및 라우팅 관리
 * WebAuthn + DID 시스템을 위한 고급 라우팅 보호
 */

import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

// 보호된 라우트 정의
const PROTECTED_ROUTES = [
  '/chat',
  '/dashboard',
  '/profile',
  '/settings',
  '/api/ai',
  '/api/user',
  '/api/webauthn/authenticate',
  '/api/webauthn/register'
];

// 공개 라우트 (인증 불필요)
const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/register',
  '/demo',
  '/help',
  '/privacy',
  '/terms'
];

// 인증된 사용자가 접근하면 안 되는 라우트 (로그인/회원가입 페이지 등)
const GUEST_ONLY_ROUTES = [
  '/login',
  '/register'
];

// API 라우트 중 공개 접근 가능한 것들
const PUBLIC_API_ROUTES = [
  '/api/health',
  '/api/system/status',
  '/api/webauthn/register/begin',
  '/api/webauthn/register/complete',
  '/api/webauthn/authenticate/begin',
  '/api/webauthn/authenticate/complete'
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  console.log(`🔍 Middleware: ${request.method} ${pathname}`);

  // 정적 파일들은 미들웨어를 거치지 않음
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/images') ||
    pathname.startsWith('/icons') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // 사용자 인증 상태 확인
  const authResult = await checkAuthentication(request);
  const isAuthenticated = authResult.isAuthenticated;
  const user = authResult.user;

  console.log(`🔐 Auth Status: ${isAuthenticated ? 'Authenticated' : 'Guest'}`);
  if (user) {
    console.log(`👤 User: ${user.username} (${user.authMethod})`);
  }

  // 1. 루트 경로 처리
  if (pathname === '/') {
    if (isAuthenticated) {
      console.log('✅ Authenticated user accessing root → Redirect to dashboard');
      return NextResponse.redirect(new URL('/chat', request.url));
    } else {
      console.log('🔓 Guest accessing root → Show landing page');
      return NextResponse.next();
    }
  }

  // 2. 인증된 사용자가 게스트 전용 라우트 접근 시 리다이렉트
  if (isAuthenticated && GUEST_ONLY_ROUTES.some(route => pathname.startsWith(route))) {
    console.log('✅ Authenticated user accessing auth page → Redirect to dashboard');
    return NextResponse.redirect(new URL('/chat', request.url));
  }

  // 3. 공개 라우트는 누구나 접근 가능
  if (PUBLIC_ROUTES.some(route => pathname === route || pathname.startsWith(route))) {
    console.log('🌐 Public route access allowed');
    return NextResponse.next();
  }

  // 4. 공개 API 라우트 처리
  if (PUBLIC_API_ROUTES.some(route => pathname.startsWith(route))) {
    console.log('🌐 Public API route access allowed');
    return addCorsHeaders(NextResponse.next());
  }

  // 5. 보호된 라우트 접근 시 인증 확인
  if (PROTECTED_ROUTES.some(route => pathname.startsWith(route))) {
    if (!isAuthenticated) {
      console.log('🚫 Protected route access denied → Redirect to login');
      
      // API 라우트의 경우 JSON 응답
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Authentication required',
            code: 'UNAUTHENTICATED',
            redirectTo: '/login'
          },
          { status: 401 }
        );
      }
      
      // 일반 페이지의 경우 로그인 페이지로 리다이렉트
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    console.log('✅ Protected route access granted');
    
    // 인증된 사용자 정보를 헤더에 추가
    const response = NextResponse.next();
    if (user) {
      response.headers.set('X-User-DID', user.did);
      response.headers.set('X-User-ID', user.id);
      response.headers.set('X-Auth-Method', user.authMethod);
    }
    
    return pathname.startsWith('/api/') ? addCorsHeaders(response) : response;
  }

  // 6. 기타 라우트는 기본 처리
  console.log('🔄 Default route handling');
  return NextResponse.next();
}

/**
 * 사용자 인증 상태 확인
 */
async function checkAuthentication(request: NextRequest): Promise<{
  isAuthenticated: boolean;
  user?: any;
  error?: string;
}> {
  try {
    // 1. 쿠키에서 토큰 확인
    const authToken = request.cookies.get('auth-token')?.value;
    const refreshToken = request.cookies.get('refresh-token')?.value;

    if (!authToken) {
      console.log('🔓 No auth token found');
      return { isAuthenticated: false };
    }

    // 2. JWT 토큰 검증
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret');
    
    try {
      const { payload } = await jwtVerify(authToken, secret);
      
      // 3. 토큰 만료 확인
      if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
        console.log('⏰ Token expired, attempting refresh...');
        
        // 리프레시 토큰으로 새 토큰 발급 시도
        if (refreshToken) {
          const refreshResult = await attemptTokenRefresh(refreshToken);
          if (refreshResult.success) {
            console.log('✅ Token refreshed successfully');
            return { 
              isAuthenticated: true, 
              user: refreshResult.user 
            };
          }
        }
        
        console.log('❌ Token refresh failed');
        return { isAuthenticated: false, error: 'Token expired' };
      }

      // 4. 유효한 토큰 - 사용자 정보 반환
      const user = {
        id: payload.sub as string,
        did: payload.sub as string,
        username: payload.username as string,
        email: payload.email as string,
        authMethod: payload.authMethod as string,
        sessionId: payload.sessionId as string
      };

      console.log('✅ Valid token found');
      return { isAuthenticated: true, user };

    } catch (jwtError) {
      console.log('❌ JWT verification failed:', jwtError);
      return { isAuthenticated: false, error: 'Invalid token' };
    }

  } catch (error) {
    console.error('❌ Authentication check failed:', error);
    return { isAuthenticated: false, error: 'Authentication error' };
  }
}

/**
 * 리프레시 토큰으로 새 액세스 토큰 발급
 */
async function attemptTokenRefresh(refreshToken: string): Promise<{
  success: boolean;
  user?: any;
  error?: string;
}> {
  try {
    const refreshSecret = new TextEncoder().encode(
      process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret'
    );
    
    const { payload } = await jwtVerify(refreshToken, refreshSecret);
    
    if (payload.type !== 'refresh') {
      return { success: false, error: 'Invalid refresh token type' };
    }

    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return { success: false, error: 'Refresh token expired' };
    }

    // 새 액세스 토큰 생성 로직은 실제로는 데이터베이스 조회가 필요하지만,
    // 미들웨어에서는 간단히 처리
    const user = {
      id: payload.sub as string,
      did: payload.sub as string,
      sessionId: payload.sessionId as string
    };

    return { success: true, user };

  } catch (error) {
    console.error('❌ Token refresh failed:', error);
    return { success: false, error: 'Refresh failed' };
  }
}

/**
 * CORS 헤더 추가
 */
function addCorsHeaders(response: NextResponse): NextResponse {
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  return response;
}

/**
 * 미들웨어 설정 - 어떤 경로에서 실행할지 정의
 */
export const config = {
  matcher: [
    /*
     * 다음을 제외한 모든 요청에서 미들웨어 실행:
     * - api/health (시스템 상태 체크)
     * - _next/static (정적 파일)
     * - _next/image (이미지 최적화)
     * - favicon.ico (파비콘)
     * - 기타 정적 자산들
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};