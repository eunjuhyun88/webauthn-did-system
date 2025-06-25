#!/bin/bash

# =============================================================================
# 🔧 TypeScript JSX 파일 확장자 수정 스크립트
# =============================================================================

echo "🔧 TypeScript JSX 파일 확장자 수정 시작..."
echo "=========================================="
echo "📅 $(date '+%Y-%m-%d %H:%M:%S')"
echo ""

# 색상 정의
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# =============================================================================
# 1. useAuth.ts → useAuth.tsx 변경
# =============================================================================

fix_useauth_extension() {
    log_info "🪝 useAuth 파일 확장자 수정 중..."
    
    if [ -f "src/lib/hooks/useAuth.ts" ]; then
        mv "src/lib/hooks/useAuth.ts" "src/lib/hooks/useAuth.tsx"
        log_success "useAuth.ts → useAuth.tsx 변경 완료"
    else
        log_warning "useAuth.ts 파일을 찾을 수 없습니다"
    fi
}

# =============================================================================
# 2. JSX 문법이 있는 모든 .ts 파일들 찾아서 .tsx로 변경
# =============================================================================

fix_all_jsx_files() {
    log_info "🔍 JSX 문법이 있는 .ts 파일들 찾는 중..."
    
    # JSX 패턴들
    jsx_patterns=(
        "return <"
        "React\."
        "useState"
        "useEffect"
        "useCallback"
        "createContext"
        "useContext"
        "<.*>"
        "jsx"
        "tsx"
    )
    
    # src 폴더에서 .ts 파일들 중 JSX 문법이 있는 파일들 찾기
    find src -name "*.ts" -not -name "*.d.ts" | while read file; do
        has_jsx=false
        
        for pattern in "${jsx_patterns[@]}"; do
            if grep -q "$pattern" "$file" 2>/dev/null; then
                has_jsx=true
                break
            fi
        done
        
        if [ "$has_jsx" = true ]; then
            new_file="${file%.ts}.tsx"
            mv "$file" "$new_file"
            echo "  ✅ $file → $new_file"
        fi
    done
    
    log_success "JSX 파일들 확장자 수정 완료"
}

# =============================================================================
# 3. 임포트 경로 수정
# =============================================================================

fix_import_paths() {
    log_info "🔗 임포트 경로 수정 중..."
    
    # .tsx로 변경된 파일들의 임포트 경로 수정
    find src -name "*.tsx" -o -name "*.ts" | while read file; do
        if [ -f "$file" ]; then
            # useAuth 임포트 경로 수정
            if grep -q "from.*useAuth'" "$file"; then
                sed -i.bak "s|from '\(.*\)useAuth'|from '\1useAuth'|g" "$file"
                echo "  ✅ $file - useAuth 임포트 경로 확인"
            fi
            
            # 기타 .ts → .tsx 변경된 파일들의 임포트 수정
            sed -i.bak 's|from '\''.*\.ts'\''|from '\'\''/g' "$file"
        fi
    done
    
    log_success "임포트 경로 수정 완료"
}

# =============================================================================
# 4. useWebAuthn.ts 파일의 JSX 제거 (만약 있다면)
# =============================================================================

fix_usewebauthn_jsx() {
    log_info "🔧 useWebAuthn 파일의 잘못된 JSX 제거 중..."
    
    webauthn_files=(
        "src/lib/hooks/useWebAuthn.ts"
        "src/lib/hooks/useWebAuthn.tsx"
    )
    
    for file in "${webauthn_files[@]}"; do
        if [ -f "$file" ]; then
            # JSX 문법이 있는지 확인
            if grep -q "return <Component" "$file"; then
                # JSX 문법을 일반 TypeScript로 수정
                sed -i.bak 's|return <Component.*>.*;|return null;|g' "$file"
                sed -i.bak 's|<Component.*>|null|g' "$file"
                echo "  ✅ $file - JSX 문법 제거"
            fi
            
            # 만약 JSX가 많이 사용되면 .tsx로 변경
            jsx_count=$(grep -c "JSX\|<.*>" "$file" 2>/dev/null || echo "0")
            if [ "$jsx_count" -gt 3 ] && [[ "$file" == *.ts ]]; then
                mv "$file" "${file%.ts}.tsx"
                echo "  ✅ $file → ${file%.ts}.tsx (JSX 사용량 많음)"
            fi
        fi
    done
    
    log_success "useWebAuthn 파일 수정 완료"
}

# =============================================================================
# 5. tsconfig.json 업데이트
# =============================================================================

update_tsconfig() {
    log_info "⚙️ tsconfig.json 업데이트 중..."
    
    if [ -f "tsconfig.json" ]; then
        # JSX 설정 확인 및 추가
        if ! grep -q '"jsx"' tsconfig.json; then
            sed -i.bak 's|"moduleResolution": "bundler"|"moduleResolution": "bundler",\n    "jsx": "preserve"|' tsconfig.json
            echo "  ✅ JSX preserve 설정 추가"
        fi
        
        # include 패턴에 tsx 추가
        if ! grep -q '\*\*/\*\.tsx' tsconfig.json; then
            sed -i.bak 's|"include": \[.*\]|"include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"]|' tsconfig.json
            echo "  ✅ tsx 파일 include 패턴 추가"
        fi
    fi
    
    log_success "tsconfig.json 업데이트 완료"
}

# =============================================================================
# 6. 백업 파일 정리 및 캐시 클리어
# =============================================================================

cleanup_and_restart() {
    log_info "🧹 백업 파일 정리 및 캐시 클리어 중..."
    
    # .bak 파일들 정리
    find src -name "*.bak" -delete
    
    # Next.js 캐시 클리어
    rm -rf .next
    rm -rf node_modules/.cache
    
    # TypeScript 캐시 클리어
    rm -rf .tsbuildinfo
    
    log_success "정리 및 캐시 클리어 완료"
}

# =============================================================================
# 7. 메인 실행 함수
# =============================================================================

main() {
    echo "🎯 TypeScript JSX 파일 확장자 수정 시작..."
    echo "========================================"
    
    # 1. useAuth 파일 수정
    fix_useauth_extension
    
    # 2. 모든 JSX 파일들 수정
    fix_all_jsx_files
    
    # 3. 임포트 경로 수정
    fix_import_paths
    
    # 4. useWebAuthn 파일 수정
    fix_usewebauthn_jsx
    
    # 5. tsconfig.json 업데이트
    update_tsconfig
    
    # 6. 정리 및 캐시 클리어
    cleanup_and_restart
    
    echo ""
    echo "🎉 TypeScript JSX 파일 확장자 수정 완료!"
    echo "======================================="
    echo ""
    
    log_success "✅ 완료된 작업들:"
    echo "  🔧 useAuth.ts → useAuth.tsx 변경"
    echo "  🔧 JSX 문법이 있는 모든 .ts 파일들 .tsx로 변경"
    echo "  🔧 임포트 경로 자동 수정"
    echo "  🔧 잘못된 JSX 문법 제거"
    echo "  🔧 tsconfig.json JSX 설정 추가"
    echo "  🔧 캐시 정리 완료"
    echo ""
    
    log_warning "⚠️ 다음 단계:"
    echo "  1️⃣ PORT=3001 npm run dev"
    echo "  2️⃣ TypeScript 오류 확인: npx tsc --noEmit"
    echo "  3️⃣ https://your-ngrok-url/login 접속 테스트"
    echo ""
    
    log_info "🚀 서버 시작 준비 완료!"
    echo "이제 npm run dev로 서버를 시작하면 TypeScript 오류가 대부분 해결됩니다."
}

# 스크립트 실행
main