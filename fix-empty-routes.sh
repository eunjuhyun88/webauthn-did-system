#!/bin/bash
echo "🔧 빈 route.ts 파일 자동 수정"
echo "============================"

find src/app/api -name "route.ts" | while read route; do
    if [ ! -s "$route" ]; then
        echo "📝 수정 중: $route"
        
        # 기본 템플릿 생성
        cat > "$route" << 'TEMPLATE'
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  return NextResponse.json({ 
    success: true, 
    message: 'API endpoint active' 
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    return NextResponse.json({ 
      success: true, 
      data: body 
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Invalid request' },
      { status: 400 }
    );
  }
}
TEMPLATE
        echo "✅ 완료: $route"
    fi
done

echo ""
echo "🎉 모든 빈 route.ts 파일 수정 완료!"
