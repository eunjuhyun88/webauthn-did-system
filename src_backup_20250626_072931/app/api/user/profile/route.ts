// =============================================================================
// 👤 사용자 프로필 API
// 파일: src/app/api/user/profile/route.ts
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { WebAuthnAdapter } from '@/integration-layer/webauthn/WebAuthnAdapter';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// 사용자 정보 조회
export async function GET(req: NextRequest) {
  try {
    // Authorization 헤더에서 토큰 추출
    const authHeader = req.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({
        success: false,
        error: '인증 토큰이 필요합니다.'
      }, { status: 401 });
    }

    // 토큰 디코딩 (간소화된 버전)
    const token = authHeader.substring(7);
    const tokenPayload = JSON.parse(Buffer.from(token, 'base64').toString());

    // DID로 사용자 정보 조회
    const user = await WebAuthnAdapter.getUserByDID(tokenPayload.did);
    
    if (!user) {
      return NextResponse.json({
        success: false,
        error: '사용자를 찾을 수 없습니다.'
      }, { status: 404 });
    }

    // 사용자 통계 조회
    const stats = await WebAuthnAdapter.getUserStats(user.id);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        did: user.did,
        email: user.email,
        displayName: user.display_name,
        authMethod: user.auth_method,
        preferences: user.preferences,
        profile: user.profile,
        stats: stats,
        credentials: user.webauthn_credentials?.filter((c: any) => c.is_active) || [],
        didDocuments: user.did_documents || []
      }
    });

  } catch (error: any) {
    console.error('❌ 사용자 정보 조회 API 오류:', error);
    
    return NextResponse.json({
      success: false,
      error: '사용자 정보 조회 중 오류가 발생했습니다.'
    }, { status: 500 });
  }
}

// 사용자 정보 업데이트
export async function PUT(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const body = await req.json();
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({
        success: false,
        error: '인증 토큰이 필요합니다.'
      }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const tokenPayload = JSON.parse(Buffer.from(token, 'base64').toString());

    // 업데이트할 수 있는 필드들만 필터링
    const allowedFields = ['display_name', 'preferences', 'profile'];
    const updateData: any = {};
    
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({
        success: false,
        error: '업데이트할 데이터가 없습니다.'
      }, { status: 400 });
    }

    // 사용자 정보 업데이트
    const { data: updatedUser, error } = await supabaseAdmin
      .from('users')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('did', tokenPayload.did)
      .select()
      .single();

    if (error) {
      throw new Error(`사용자 정보 업데이트 실패: ${error.message}`);
    }

    return NextResponse.json({
      success: true,
      user: updatedUser
    });

  } catch (error: any) {
    console.error('❌ 사용자 정보 업데이트 API 오류:', error);
    
    return NextResponse.json({
      success: false,
      error: '사용자 정보 업데이트 중 오류가 발생했습니다.'
    }, { status: 500 });
  }
}