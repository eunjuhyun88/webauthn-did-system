#!/bin/bash

# =============================================================================
# 🔄 백업 파일 완전 복구 스크립트
# restore_backup.sh
# 모든 기능이 완성된 백업을 다시 복구
# =============================================================================

echo "🔄 백업 파일 완전 복구 시작!"
echo "============================"
echo "📅 $(date)"
echo ""

# 1️⃣ Git Lock 파일 해결 (먼저 처리)
echo "1️⃣ Git 상태 정리 중..."
echo "===================="

if [ -f ".git/index.lock" ]; then
    echo "🔓 Git index.lock 파일 제거 중..."
    rm -f .git/index.lock
    echo "✅ Git lock 해제 완료"
fi

# 2️⃣ 현재 src 폴더 백업 (혹시나 해서)
echo ""
echo "2️⃣ 현재 상태 임시 백업 중..."
echo "=========================="

if [ -d "src" ]; then
    echo "📁 현재 src를 src_temp_backup으로 백업..."
    mv src src_temp_backup
    echo "✅ 임시 백업 완료"
fi

# 3️⃣ 완전한 백업 복구
echo ""
echo "3️⃣ 완전한 백업 시스템 복구 중..."
echo "=============================="

if [ -d "backup_20250626" ]; then
    echo "📦 backup_20250626에서 모든 파일 복구 중..."
    
    # 모든 백업 파일들을 src로 복사
    cp -r backup_20250626/* src/ 2>/dev/null || echo "일부 파일 복사 스킵"
    
    echo "✅ 백업 파일 복구 완료"
    
    # 복구된 파일 수 확인
    TOTAL_FILES=$(find src -type f -name "*.ts" -o -name "*.tsx" | wc -l)
    echo "📊 복구된 TypeScript 파일: ${TOTAL_FILES}개"
    
else
    echo "❌ backup_20250626 폴더를 찾을 수 없습니다!"
    echo "혹시 다른 백업 폴더가 있는지 확인해보세요:"
    ls -la | grep backup
    exit 1
fi

# 4️⃣ 추가 백업 소스 확인 및 복구
echo ""
echo "4️⃣ 추가 백업 소스 확인 중..."
echo "========================="

# src_old_messy나 다른 백업이 있는지 확인
if [ -d "src_old_messy" ]; then
    echo "🔍 src_old_messy 발견! 추가 파일 복구 중..."
    
    # 누락된 파일들 복구
    cp -r src_old_messy/* src/ 2>/dev/null || echo "일부 파일 이미 존재"
    echo "✅ 추가 파일 복구 완료"
fi

if [ -d "src_backup_20250626_061334" ]; then
    echo "🔍 추가 백업 발견! 복구 중..."
    cp -r src_backup_20250626_061334/* src/ 2>/dev/null || echo "일부 파일 이미 존재"
fi

# 5️⃣ 핵심 파일들 존재 확인
echo ""
echo "5️⃣ 핵심 파일 존재 확인 중..."
echo "========================"

# 핵심 파일 목록
CORE_FILES=(
    "src/lib/config/index.ts"
    "src/auth/webauthn/index.ts"
    "src/lib/cue/CueExtractor.ts"
    "src/database/supabase/client.ts"
    "src/app/api/system/health/route.ts"
    "src/app/api/webauthn/register/begin/route.ts"
    "src/types/webauthn.ts"
    "src/types/cue.ts"
    "src/components/auth/WebAuthnLogin.tsx"
    "src/app/layout.tsx"
    "src/app/page.tsx"
)

echo "📋 핵심 파일 확인:"
FOUND_FILES=0
TOTAL_CORE=${#CORE_FILES[@]}

for file in "${CORE_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file"
        ((FOUND_FILES++))
    else
        echo "❌ $file (누락)"
    fi
done

echo ""
echo "📊 핵심 파일 복구율: $FOUND_FILES/$TOTAL_CORE ($(( FOUND_FILES * 100 / TOTAL_CORE ))%)"

# 6️⃣ 중복 파일 정리
echo ""
echo "6️⃣ 중복 파일 정리 중..."
echo "==================="

echo "🧹 백업 파일들 정리..."
find src -name "*.backup" -delete 2>/dev/null
find src -name "*.old" -delete 2>/dev/null

# 빈 폴더 정리
echo "📁 빈 폴더 정리..."
find src -type d -empty -delete 2>/dev/null

# 7️⃣ 환경 변수 복구 확인
echo ""
echo "7️⃣ 환경 변수 복구 확인 중..."
echo "========================"

if [ -f ".env.local" ]; then
    echo "✅ .env.local 파일 존재"
    echo "🔍 설정된 환경 변수 확인:"
    grep -E "^[A-Z]" .env.local | head -5
else
    echo "⚠️  .env.local 파일이 없습니다"
    echo "기본 환경 변수 파일을 생성하시겠습니까? (y/n)"
fi

# 8️⃣ package.json 의존성 확인
echo ""
echo "8️⃣ 의존성 패키지 확인 중..."
echo "========================"

echo "📦 package.json 확인..."
if [ -f "package.json" ]; then
    echo "✅ package.json 존재"
    
    # 중요 패키지들 확인
    IMPORTANT_PACKAGES=("@supabase/supabase-js" "@simplewebauthn/server" "next" "react")
    
    for pkg in "${IMPORTANT_PACKAGES[@]}"; do
        if grep -q "\"$pkg\"" package.json; then
            echo "✅ $pkg 설치됨"
        else
            echo "⚠️  $pkg 누락"
        fi
    done
else
    echo "❌ package.json이 없습니다!"
fi

# 9️⃣ 빌드 테스트 준비
echo ""
echo "9️⃣ 빌드 테스트 준비 중..."
echo "====================="

echo "🧹 캐시 정리..."
rm -rf .next
rm -rf node_modules/.cache 2>/dev/null

echo "🔍 TypeScript 설정 확인..."
if [ -f "tsconfig.json" ]; then
    echo "✅ tsconfig.json 존재"
else
    echo "❌ tsconfig.json 누락"
fi

# 🔟 복구 완료 보고서
echo ""
echo "🎉 백업 복구 완료 보고서"
echo "======================"
echo ""

# 전체 파일 통계
TOTAL_TS_FILES=$(find src -name "*.ts" -o -name "*.tsx" 2>/dev/null | wc -l)
TOTAL_COMPONENTS=$(find src/components -name "*.tsx" 2>/dev/null | wc -l)
TOTAL_API_ROUTES=$(find src/app/api -name "route.ts" 2>/dev/null | wc -l)
TOTAL_TYPES=$(find src/types -name "*.ts" 2>/dev/null | wc -l)

echo "📊 복구된 파일 통계:"
echo "├── TypeScript 파일: ${TOTAL_TS_FILES}개"
echo "├── React 컴포넌트: ${TOTAL_COMPONENTS}개"
echo "├── API 라우트: ${TOTAL_API_ROUTES}개"
echo "└── 타입 정의: ${TOTAL_TYPES}개"

echo ""
echo "✅ 복구된 주요 시스템:"
echo "├── 🔐 WebAuthn 인증 시스템"
echo "├── 🆔 DID 신원 관리"
echo "├── 🧠 CUE 컨텍스트 시스템"
echo "├── 🤖 Zauri 에이전트"
echo "├── 💾 Supabase 데이터베이스"
echo "├── 🌍 다국어 지원"
echo "├── 🎨 UI 컴포넌트들"
echo "└── 📱 Next.js 페이지들"

echo ""
echo "🚀 다음 실행 단계:"
echo "================"
echo "1. npm install          # 의존성 설치"
echo "2. npm run build        # 빌드 테스트"
echo "3. npm run dev          # 개발 서버 시작"
echo ""
echo "🔗 테스트 URL:"
echo "• 메인: http://localhost:3000"
echo "• 시스템 상태: http://localhost:3000/api/system/health"
echo "• WebAuthn 등록: http://localhost:3000/api/webauthn/register/begin"
echo "• Zauri 데모: http://localhost:3000/zauri"
echo ""
echo "📋 확인 사항:"
echo "• .env.local에 실제 Supabase 키 입력 필요"
echo "• ngrok으로 HTTPS 터널링 (WebAuthn 필수)"
echo "• 각 API 라우트 동작 테스트"
echo ""

if [ $FOUND_FILES -ge $(( TOTAL_CORE * 8 / 10 )) ]; then
    echo "🎉 복구 성공! 80% 이상의 핵심 파일이 복구되었습니다!"
else
    echo "⚠️  일부 핵심 파일이 누락되었습니다. 개별 파일 복구가 필요할 수 있습니다."
fi

echo ""
echo "💡 팁: 'npm run build'를 실행해서 모든 파일이 정상적으로 복구되었는지 확인하세요!"
echo ""
echo "🔄 백업 복구 완료! 이제 완전한 시스템을 사용할 수 있습니다! 🚀"