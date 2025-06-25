// =============================================================================
// 🔐 WebAuthn 등록 시작 API
// src/app/api/webauthn/register/begin/route.ts
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { generateRegistrationOptions } from '@simplewebauthn/server';
import { v4 as uuidv4 } from 'uuid';

// 등록 세션 임시 저장소 (실제로는 Redis나 DB 사용)
const registrationSessions = new Map<string, {
  challenge: string;
  userId: string;
  username: string;
  displayName: string;
  createdAt: Date;
}>();

// 세션 정리 (30분 후 자동 삭제)
setInterval(() => {
  const now = new Date();
  for (const [sessionId, session] of registrationSessions) {
    if (now.getTime() - session.createdAt.getTime() > 30 * 60 * 1000) {
      registrationSessions.delete(sessionId);
    }
  }
}, 5 * 60 * 1000); // 5분마다 정리

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, displayName } = body;

    // 입력값 검증
    if (!username || !displayName) {
      return NextResponse.json({
        success: false,
        error: '사용자 이름과 표시 이름이 필요합니다.'
      }, { status: 400 });
    }

    // 세션 ID 생성
    const sessionId = uuidv4();
    const userId = uuidv4();

    // WebAuthn 등록 옵션 생성
    const options = await generateRegistrationOptions({
      rpName: 'Cue System',
      rpID: process.env.WEBAUTHN_RP_ID || 'localhost',
      userID: new TextEncoder().encode(userId),
      userName: username,
      userDisplayName: displayName,
      timeout: 60000,
      attestationType: 'none',
      excludeCredentials: [], // 기존 자격증명 제외
      authenticatorSelection: {
        residentKey: 'required',
        userVerification: 'required',
        authenticatorAttachment: 'platform' // 플랫폼 인증기 우선
      },
      supportedAlgorithmIDs: [-7, -257] // ES256, RS256
    });

    // 세션 정보 저장
    registrationSessions.set(sessionId, {
      challenge: options.challenge,
      userId,
      username,
      displayName,
      createdAt: new Date()
    });

    console.log(`✅ WebAuthn 등록 시작: ${username} (세션: ${sessionId})`);

    return NextResponse.json({
      success: true,
      options,
      sessionId
    }, {
      headers: {
        'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff'
      }
    });

  } catch (error) {
    console.error('WebAuthn 등록 시작 API 오류:', error);
    
    return NextResponse.json({
      success: false,
      error: '서버 내부 오류가 발생했습니다.'
    }, { status: 500 });
  }
}

// 세션 데이터 조회 (내부 사용)
export function getRegistrationSession(sessionId: string) {
  return registrationSessions.get(sessionId);
}

// 세션 삭제 (내부 사용)
export function deleteRegistrationSession(sessionId: string) {
  registrationSessions.delete(sessionId);
}

// OPTIONS 핸들러 (CORS 대응)
export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
