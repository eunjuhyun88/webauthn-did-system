#!/bin/bash

echo "🔍 완전한 프로젝트 구조 분석"
echo "============================="
echo "📅 $(date)"
echo ""

echo "📂 1. 프로젝트 루트 구조:"
echo "-------------------------"
ls -la | head -20

echo ""
echo "📂 2. src/ 디렉토리 구조:"
echo "------------------------"
if command -v tree >/dev/null 2>&1; then
    tree src/ -I 'node_modules|.git|.next' -L 3
else
    find src -type d | sort
fi

echo ""
echo "📄 3. 모든 TypeScript/JavaScript 파일:"
echo "------------------------------------"
find src -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" | sort

echo ""
echo "🌐 4. API 라우트 파일들:"
echo "----------------------"
find src/app/api -name "*.ts" 2>/dev/null | sort

echo ""
echo "🎨 5. 컴포넌트 파일들:"
echo "-------------------"
find src/components -name "*.tsx" 2>/dev/null | sort

echo ""
echo "📋 6. 타입 정의 파일들:"
echo "--------------------"
find src/types -name "*.ts" 2>/dev/null | sort

echo ""
echo "⚙️ 7. 설정 파일들:"
echo "----------------"
ls -la *.json *.js *.ts *.mjs 2>/dev/null

echo ""
echo "📦 8. 주요 의존성:"
echo "----------------"
if [ -f package.json ]; then
    echo "Production dependencies:"
    cat package.json | jq -r '.dependencies | keys[]' 2>/dev/null || grep -A 20 '"dependencies"' package.json
fi

echo ""
echo "🔧 9. Next.js 특수 파일들:"
echo "------------------------"
find src -name "layout.tsx" -o -name "page.tsx" -o -name "loading.tsx" -o -name "error.tsx" -o -name "not-found.tsx" | sort

echo ""
echo "📊 10. 파일 개수 통계:"
echo "--------------------"
echo "총 디렉토리: $(find src -type d | wc -l)"
echo "총 파일: $(find src -type f | wc -l)"
echo "TypeScript 파일: $(find src -name "*.ts" -o -name "*.tsx" | wc -l)"
echo "React 컴포넌트: $(find src -name "*.tsx" | wc -l)"
echo "API 라우트: $(find src/app/api -name "route.ts" 2>/dev/null | wc -l)"
