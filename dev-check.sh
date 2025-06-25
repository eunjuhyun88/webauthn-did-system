#!/bin/bash
echo "🔍 프로젝트 상태 빠른 체크"
echo "========================="
echo "📅 $(date '+%Y-%m-%d %H:%M:%S')"
echo ""

# API 라우트 체크
echo "🌐 API 라우트 상태:"
find src/app/api -name "route.ts" | wc -l | xargs echo "  총 라우트 수:"

# 컴포넌트 체크  
echo "🎨 컴포넌트 상태:"
find src/components -name "*.tsx" | wc -l | xargs echo "  총 컴포넌트 수:"

# 타입 파일 체크
echo "📋 타입 파일 상태:"
find src/types -name "*.ts" | wc -l | xargs echo "  총 타입 파일 수:"

# 개발 서버 상태
echo "🚀 개발 서버 상태:"
if pgrep -f "next" > /dev/null; then
  echo "  🟢 실행 중"
else
  echo "  🔴 중지됨 (npm run dev 필요)"
fi

echo ""
echo "✅ 체크 완료!"
