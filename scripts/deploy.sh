#!/bin/bash
echo "🚀 배포 스크립트 실행"

# 1. 빌드 실행
./scripts/build.sh

# 2. 환경 변수 검증
echo "🔍 환경 변수 검증 중..."
if [ -z "$SUPABASE_URL" ]; then
  echo "❌ SUPABASE_URL이 설정되지 않았습니다"
  exit 1
fi

# 3. Vercel 배포 (선택사항)
# vercel deploy --prod

echo "✅ 배포 준비 완료"
echo "🌐 ngrok 터널을 시작하세요: ngrok http 3000"
