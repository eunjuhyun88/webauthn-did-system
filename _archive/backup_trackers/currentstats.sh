#!/bin/bash

echo "🔍 WebAuthn-DID 시스템 현재 상태 정확한 분석"
echo "=============================================="
echo "📅 $(date '+%Y-%m-%d %H:%M:%S')"
echo ""

# 1. 전체 파일 구조 확인
echo "📁 전체 파일 트리:"
echo "=================="
if command -v tree >/dev/null 2>&1; then
    tree src/ -I 'node_modules|.git|.next' -L 3
else
    find src/ -type f -name "*.ts" -o -name "*.tsx" | head -20
    echo "... (더 많은 파일들이 있습니다)"
fi

echo ""
echo "📊 파일 통계:"
echo "============="

# TypeScript 파일 수
TS_FILES=$(find src/ -name "*.ts" -o -name "*.tsx" | wc -l)
echo "📝 TypeScript 파일: $TS_FILES개"

# API 라우트 수  
API_ROUTES=$(find src/app/api/ -name "route.ts" 2>/dev/null | wc -l)
echo "🔌 API 라우트: $API_ROUTES개"

# 컴포넌트 수
COMPONENTS=$(find src/components/ -name "*.tsx" 2>/dev/null | wc -l)
echo "🎨 React 컴포넌트: $COMPONENTS개"

# 총 코드 라인 수
if command -v wc >/dev/null 2>&1; then
    TOTAL_LINES=$(find src/ -name "*.ts" -o -name "*.tsx" -exec cat {} \; | wc -l)
    echo "📏 총 코드 라인: $TOTAL_LINES줄"
fi

echo ""
echo "🎯 핵심 구현 상태:"
echo "=================="

# 핵심 파일들 체크
CORE_FILES=(
    "src/lib/config/index.ts:시스템 설정"
    "src/auth/webauthn/client.ts:WebAuthn 클라이언트"
    "src/services/ai/index.ts:AI 서비스 통합"
    "src/database/supabase/client.ts:Supabase 클라이언트"
    "src/identity/did/generator.ts:DID 생성기"
    "src/types/webauthn.ts:WebAuthn 타입"
    "src/types/did.ts:DID 타입"
    "src/app/api/webauthn/register/begin/route.ts:WebAuthn 등록 API"
    "src/app/api/ai/chat/route.ts:AI 채팅 API"
)

IMPLEMENTED=0
TOTAL=${#CORE_FILES[@]}

for file_info in "${CORE_FILES[@]}"; do
    IFS=':' read -r file desc <<< "$file_info"
    if [ -f "$file" ]; then
        SIZE=$(wc -c < "$file" 2>/dev/null || echo "0")
        if [ "$SIZE" -gt 100 ]; then
            echo "✅ $desc ($SIZE bytes)"
            ((IMPLEMENTED++))
        else
            echo "⚠️  $desc (빈 파일 - $SIZE bytes)"
        fi
    else
        echo "❌ $desc (없음)"
    fi
done

echo ""
echo "📈 구현 진행률: $IMPLEMENTED/$TOTAL ($(( IMPLEMENTED * 100 / TOTAL ))%)"

echo ""
echo "🚨 Cue 시스템 특화 파일 상태:"
echo "=============================="

CUE_FILES=(
    "src/lib/cue/CueExtractor.ts:맥락 추출 엔진"
    "src/lib/cue/CrossPlatformSync.ts:플랫폼간 동기화"
    "src/lib/cue/ContextPreserver.ts:맥락 보존"
    "src/types/cue.ts:Cue 시스템 타입"
)

CUE_IMPLEMENTED=0
CUE_TOTAL=${#CUE_FILES[@]}

for file_info in "${CUE_FILES[@]}"; do
    IFS=':' read -r file desc <<< "$file_info"
    if [ -f "$file" ]; then
        SIZE=$(wc -c < "$file" 2>/dev/null || echo "0")
        if [ "$SIZE" -gt 100 ]; then
            echo "✅ $desc"
            ((CUE_IMPLEMENTED++))
        else
            echo "⚠️  $desc (빈 파일)"
        fi
    else
        echo "❌ $desc (아직 생성 안됨)"
    fi
done

echo ""
echo "🎯 Cue 시스템 진행률: $CUE_IMPLEMENTED/$CUE_TOTAL ($(( CUE_IMPLEMENTED * 100 / CUE_TOTAL ))%)"

echo ""
echo "🔄 다음 우선 작업:"
echo "=================="

if [ $CUE_IMPLEMENTED -eq 0 ]; then
    echo "1️⃣ Cue 시스템 핵심 파일들 생성"
    echo "   - src/lib/cue/ 폴더 구조 만들기"
    echo "   - CueExtractor.ts 구현"
    echo "   - 플랫폼간 동기화 로직 추가"
elif [ $IMPLEMENTED -lt $TOTAL ]; then
    echo "1️⃣ 기본 WebAuthn + DID 시스템 완성"
    echo "   - 빈 파일들 구현하기"
    echo "   - API 라우트 연결"
else
    echo "1️⃣ 시스템 통합 테스트"
    echo "   - 전체 플로우 테스트"
    echo "   - Cue 시스템 고도화"
fi

echo ""
echo "📋 현재 Git 상태:"
echo "================"
git status --porcelain | head -10
if [ $(git status --porcelain | wc -l) -gt 10 ]; then
    echo "... (더 많은 변경사항이 있습니다)"
fi

echo ""
echo "🎉 분석 완료!"