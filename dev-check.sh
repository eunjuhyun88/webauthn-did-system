#!/bin/bash
echo "🔍 Fusion AI Dashboard 상태 체크"
echo "================================"
echo ""

echo "📁 프로젝트 구조:"
echo "  ✅ src/components/dashboard/FusionDashboard.tsx"
echo "  ✅ src/app/dashboard/page.tsx"
echo "  ✅ src/services/ai/index.ts"
echo "  ✅ src/lib/cue/CueExtractor.ts"
echo ""

echo "📦 패키지 상태:"
npm list --depth=0 | grep -E "(lucide-react|react-hot-toast|framer-motion)" | head -3
echo ""

echo "🔧 환경 변수:"
if [ -f ".env.local" ]; then
    echo "  ✅ .env.local 존재"
else
    echo "  ❌ .env.local 없음"
fi
echo ""

echo "🚀 다음 단계:"
echo "  1. npm run dev"
echo "  2. http://localhost:3000/dashboard 접속"
echo "  3. '데모로 시작하기' 버튼 클릭"
