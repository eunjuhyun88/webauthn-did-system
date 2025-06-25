#!/bin/bash

clear
echo "🚀 WebAuthn DID + Cue System 개발 현황"
echo "======================================"
echo "⏰ $(date '+%Y-%m-%d %H:%M:%S')"
echo ""

# 파일 상태 체크
TOTAL=0
DONE=0

FILES=(
  "src/lib/config/index.ts:설정"
  "src/auth/webauthn/client.ts:WebAuthn클라이언트"  
  "src/services/ai/index.ts:AI서비스"
  "src/database/repositories/users.ts:사용자DB"
  "src/app/api/ai/chat/route.ts:AI API"
)

for file_info in "${FILES[@]}"; do
  IFS=':' read -r file desc <<< "$file_info"
  TOTAL=$((TOTAL + 1))
  
  if [ -f "$file" ]; then
    SIZE=$(stat -f%z "$file" 2>/dev/null || echo "0")
    if [ "$SIZE" -gt 50 ]; then
      echo "✅ $desc ($SIZE bytes)"
      DONE=$((DONE + 1))
    else
      echo "⚠️  $desc (빈 파일)"
    fi
  else
    echo "❌ $desc (없음)"
  fi
done

echo ""
echo "📊 진행률: $DONE/$TOTAL ($(( DONE * 100 / TOTAL ))%)"

# 개발 서버 상태
if pgrep -f "next" > /dev/null; then
  echo "🟢 Next.js 개발 서버 실행중"
else
  echo "🔴 개발 서버 중지됨 (npm run dev 필요)"
fi

echo ""
echo "🎯 다음 작업: 빈 파일들 구현하기"
