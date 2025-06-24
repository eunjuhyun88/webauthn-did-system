#!/bin/bash

echo "🔍 WebAuthn DID + Cue System 파일 추적기"
echo "=========================================="

# 필수 파일들 정의
declare -a CORE_FILES=(
  "src/lib/config/index.ts"
  "src/types/webauthn.ts"
  "src/types/did.ts" 
  "src/types/user.ts"
  "src/auth/webauthn/index.ts"
  "src/auth/webauthn/client.ts"
  "src/auth/webauthn/utils.ts"
  "src/database/supabase/client.ts"
  "src/identity/did/generator.ts"
  "src/database/repositories/users.ts"
  "src/services/ai/index.ts"
  "src/app/api/webauthn/register/begin/route.ts"
  "src/app/api/webauthn/register/complete/route.ts"
  "src/app/api/ai/chat/route.ts"
)

COMPLETED=0
TOTAL=${#CORE_FILES[@]}

echo "📊 핵심 파일 상태:"
echo ""

for file in "${CORE_FILES[@]}"; do
  if [ -f "$file" ]; then
    SIZE=$(stat -f%z "$file" 2>/dev/null || echo "0")
    if [ "$SIZE" -gt 100 ]; then
      echo "✅ $file (${SIZE} bytes)"
      ((COMPLETED++))
    else
      echo "⚠️  $file (빈 파일 - ${SIZE} bytes)"
    fi
  else
    echo "❌ $file (없음)"
  fi
done

echo ""
echo "📈 진행 상황: $COMPLETED/$TOTAL ($(( COMPLETED * 100 / TOTAL ))%)"

# 다음 할 일 제안
echo ""
echo "🎯 다음 우선순위:"
if [ ! -f "src/lib/config/index.ts" ] || [ $(stat -f%z "src/lib/config/index.ts" 2>/dev/null || echo "0") -lt 100 ]; then
  echo "1️⃣ 기본 설정 파일 생성"
elif [ ! -f "src/auth/webauthn/client.ts" ] || [ $(stat -f%z "src/auth/webauthn/client.ts" 2>/dev/null || echo "0") -lt 100 ]; then
  echo "1️⃣ WebAuthn 클라이언트 구현"
elif [ ! -f "src/services/ai/index.ts" ] || [ $(stat -f%z "src/services/ai/index.ts" 2>/dev/null || echo "0") -lt 100 ]; then
  echo "1️⃣ AI 서비스 통합"
else
  echo "1️⃣ Cue 시스템 핵심 로직 추가"
fi

