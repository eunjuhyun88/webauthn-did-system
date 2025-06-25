import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/database/supabase/client';

export async function GET(req: NextRequest) {
  try {
    console.log('🔍 Auth check requested');
    
    // Authorization 헤더에서 토큰 추출
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token) {
      console.log('🔓 No auth token found');
      return NextResponse.json({
        success: true,
        authenticated: false,
        user: null,
        message: 'No authentication token provided'
      });
    }
    
    // Supabase로 토큰 검증
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      console.log('❌ Token validation failed:', error?.message);
      return NextResponse.json({
        success: true,
        authenticated: false,
        user: null,
        message: 'Invalid or expired token'
      });
    }
    
    console.log('✅ User authenticated:', user.email);
    
    return NextResponse.json({
      success: true,
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.full_name || user.email,
        avatar: user.user_metadata?.avatar_url,
        createdAt: user.created_at
      }
    });
    
  } catch (error) {
    console.error('❌ Auth check error:', error);
    
    return NextResponse.json({
      success: false,
      authenticated: false,
      user: null,
      error: 'Authentication check failed'
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  return NextResponse.json({
    success: false,
    message: 'POST method not supported for auth check. Use GET instead.'
  }, { status: 405 });
}
