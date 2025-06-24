#!/bin/bash

# =============================================================================
# 🎯 완전 안전한 WebAuthn + DID + Cue 추적기 (에러 제로 보장)
# safe_tracker.sh
# =============================================================================

# 안전한 색상 정의
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
GRAY='\033[0;90m'
NC='\033[0m'

# 파일 체크 함수
check_file_safe() {
    local file="$1"
    if [ ! -f "$file" ]; then
        echo "missing"
        return
    fi
    
    local size=$(wc -c < "$file" 2>/dev/null || echo "0")
    if [ "$size" -lt 50 ]; then
        echo "empty"
    elif [ "$size" -lt 500 ]; then
        echo "basic"
    else
        echo "complete"
    fi
}

# 안전한 진행률 바
make_progress_bar() {
    local progress="$1"
    local filled=$(echo "$progress * 4 / 10" | bc 2>/dev/null || echo "0")
    local empty=$(echo "40 - $filled" | bc 2>/dev/null || echo "40")
    
    printf "["
    for i in $(seq 1 $filled 2>/dev/null || echo ""); do printf "█"; done
    for i in $(seq 1 $empty 2>/dev/null || echo ""); do printf "░"; done
    printf "] $progress%%"
}

# WebAuthn 상태 체크
check_webauthn() {
    echo -e "${BLUE}🔐 WebAuthn 시스템${NC}"
    echo "----------------------------------------"
    
    local files="src/auth/webauthn/index.ts src/auth/webauthn/utils.ts src/auth/webauthn/client.ts src/app/api/webauthn/register/begin/route.ts src/app/api/webauthn/register/complete/route.ts src/app/api/webauthn/authenticate/begin/route.ts src/app/api/webauthn/authenticate/complete/route.ts"
    
    local completed=0
    local total=7
    
    for file in $files; do
        local status=$(check_file_safe "$file")
        local name=$(basename "$file")
        
        case "$status" in
            "complete")
                echo -e "${GREEN}✅${NC} $name"
                completed=$((completed + 1))
                ;;
            "basic")
                echo -e "${YELLOW}⚠️${NC} $name (기본)"
                completed=$((completed + 1))
                ;;
            "empty")
                echo -e "${YELLOW}📝${NC} $name (빈 파일)"
                ;;
            "missing")
                echo -e "${RED}❌${NC} $name"
                ;;
        esac
    done
    
    local percentage=$((completed * 100 / total))
    echo "----------------------------------------"
    echo "WebAuthn 진행률: $(make_progress_bar $percentage)"
    echo "완료: $completed/$total"
    echo ""
    
    echo "$completed $total $percentage"
}

# Cue 시스템 체크
check_cue() {
    echo -e "${CYAN}🧠 Cue 시스템${NC}"
    echo "----------------------------------------"
    
    local files="src/lib/cue/CueExtractor.ts src/lib/cue/PlatformSyncManager.ts src/lib/cue/CueApplicationEngine.ts src/types/cue.ts src/app/api/cue/extract/route.ts src/app/api/cue/sync/route.ts src/app/api/cue/apply/route.ts"
    
    local completed=0
    local total=7
    
    for file in $files; do
        local status=$(check_file_safe "$file")
        local name=$(basename "$file")
        
        case "$status" in
            "complete")
                echo -e "${GREEN}✅${NC} $name"
                completed=$((completed + 1))
                ;;
            "basic")
                echo -e "${YELLOW}⚠️${NC} $name (기본)"
                completed=$((completed + 1))
                ;;
            "empty")
                echo -e "${YELLOW}📝${NC} $name (빈 파일)"
                ;;
            "missing")
                echo -e "${RED}❌${NC} $name"
                ;;
        esac
    done
    
    local percentage=$((completed * 100 / total))
    echo "----------------------------------------"
    echo "Cue 진행률: $(make_progress_bar $percentage)"
    echo "완료: $completed/$total"
    echo ""
    
    echo "$completed $total $percentage"
}

# UI 컴포넌트 체크
check_ui() {
    echo -e "${GREEN}🎨 UI 컴포넌트${NC}"
    echo "----------------------------------------"
    
    local files="src/components/auth/WebAuthnLogin.tsx src/components/auth/WebAuthnRegister.tsx src/components/auth/AuthProvider.tsx src/components/dashboard/ChatInterface.tsx src/components/ui/Button.tsx src/components/ui/Modal.tsx"
    
    local completed=0
    local total=6
    
    for file in $files; do
        local status=$(check_file_safe "$file")
        local name=$(basename "$file")
        
        case "$status" in
            "complete")
                echo -e "${GREEN}✅${NC} $name"
                completed=$((completed + 1))
                ;;
            "basic")
                echo -e "${YELLOW}⚠️${NC} $name (기본)"
                completed=$((completed + 1))
                ;;
            "empty")
                echo -e "${YELLOW}📝${NC} $name (빈 파일)"
                ;;
            "missing")
                echo -e "${RED}❌${NC} $name"
                ;;
        esac
    done
    
    local percentage=$((completed * 100 / total))
    echo "----------------------------------------"
    echo "UI 진행률: $(make_progress_bar $percentage)"
    echo "완료: $completed/$total"
    echo ""
    
    echo "$completed $total $percentage"
}

# 핵심 파일 체크
check_core() {
    echo -e "${YELLOW}🔧 핵심 시스템${NC}"
    echo "----------------------------------------"
    
    local files="src/lib/config/index.ts src/types/webauthn.ts src/types/did.ts src/database/supabase/client.ts src/services/ai/index.ts"
    
    local completed=0
    local total=5
    
    for file in $files; do
        local status=$(check_file_safe "$file")
        local name=$(basename "$file")
        
        case "$status" in
            "complete")
                echo -e "${GREEN}✅${NC} $name"
                completed=$((completed + 1))
                ;;
            "basic")
                echo -e "${YELLOW}⚠️${NC} $name (기본)"
                completed=$((completed + 1))
                ;;
            "empty")
                echo -e "${YELLOW}📝${NC} $name (빈 파일)"
                ;;
            "missing")
                echo -e "${RED}❌${NC} $name"
                ;;
        esac
    done
    
    local percentage=$((completed * 100 / total))
    echo "----------------------------------------"
    echo "핵심 진행률: $(make_progress_bar $percentage)"
    echo "완료: $completed/$total"
    echo ""
    
    echo "$completed $total $percentage"
}

# 빠른 체크
quick_check() {
    echo -e "${BLUE}⚡ 빠른 상태 확인${NC}"
    echo "$(date '+%H:%M:%S')"
    echo ""
    
    local critical="src/lib/config/index.ts src/auth/webauthn/client.ts src/lib/cue/CueExtractor.ts src/components/auth/WebAuthnLogin.tsx"
    local ok=0
    local total=4
    
    for file in $critical; do
        local status=$(check_file_safe "$file")
        local name=$(basename "$file")
        
        if [ "$status" = "complete" ] || [ "$status" = "basic" ]; then
            echo -e "${GREEN}✅${NC} $name"
            ok=$((ok + 1))
        else
            echo -e "${RED}❌${NC} $name"
        fi
    done
    
    local percent=$((ok * 100 / total))
    echo ""
    echo "핵심 기능: $(make_progress_bar $percent)"
    echo "상태: $ok/$total 완료"
}

# 다음 할 일
next_todo() {
    echo -e "${CYAN}🎯 다음 할 일${NC}"
    echo "----------------------------------------"
    
    local priority="src/auth/webauthn/client.ts src/app/api/webauthn/authenticate/begin/route.ts src/app/api/webauthn/authenticate/complete/route.ts src/components/auth/WebAuthnRegister.tsx src/components/auth/AuthProvider.tsx"
    local count=1
    
    for file in $priority; do
        local status=$(check_file_safe "$file")
        local name=$(basename "$file")
        
        if [ "$status" = "missing" ] || [ "$status" = "empty" ]; then
            echo "  ${count}. $name"
            echo "     📁 $file"
            count=$((count + 1))
            
            if [ $count -gt 3 ]; then
                break
            fi
        fi
    done
    
    if [ $count -eq 1 ]; then
        echo -e "  🎉 ${GREEN}모든 우선 작업 완료!${NC}"
    fi
}

# 전체 상태
full_status() {
    clear
    echo "================================================================="
    echo -e "${WHITE}🎯 WebAuthn + DID + Cue 시스템 진행 상황${NC}"
    echo "마지막 업데이트: $(date '+%Y-%m-%d %H:%M:%S')"
    echo "================================================================="
    echo ""
    
    # 각 섹션 실행
    core_result=$(check_core)
    webauthn_result=$(check_webauthn)
    cue_result=$(check_cue)
    ui_result=$(check_ui)
    
    # 결과 파싱 (안전한 방법)
    core_completed=$(echo "$core_result" | tail -1 | cut -d' ' -f1)
    core_total=$(echo "$core_result" | tail -1 | cut -d' ' -f2)
    core_percent=$(echo "$core_result" | tail -1 | cut -d' ' -f3)
    
    webauthn_completed=$(echo "$webauthn_result" | tail -1 | cut -d' ' -f1)
    webauthn_total=$(echo "$webauthn_result" | tail -1 | cut -d' ' -f2)
    webauthn_percent=$(echo "$webauthn_result" | tail -1 | cut -d' ' -f3)
    
    cue_completed=$(echo "$cue_result" | tail -1 | cut -d' ' -f1)
    cue_total=$(echo "$cue_result" | tail -1 | cut -d' ' -f2)
    cue_percent=$(echo "$cue_result" | tail -1 | cut -d' ' -f3)
    
    ui_completed=$(echo "$ui_result" | tail -1 | cut -d' ' -f1)
    ui_total=$(echo "$ui_result" | tail -1 | cut -d' ' -f2)
    ui_percent=$(echo "$ui_result" | tail -1 | cut -d' ' -f3)
    
    # 전체 계산
    total_completed=$((core_completed + webauthn_completed + cue_completed + ui_completed))
    total_files=$((core_total + webauthn_total + cue_total + ui_total))
    overall_percent=$((total_completed * 100 / total_files))
    
    echo "================================================================="
    echo -e "${WHITE}📊 전체 요약${NC}"
    echo "================================================================="
    echo "전체 진행률: $(make_progress_bar $overall_percent)"
    echo "완료 파일: $total_completed/$total_files"
    echo ""
    echo "섹션별 완료율:"
    echo "  🔧 핵심: $core_percent% ($core_completed/$core_total)"
    echo "  🔐 WebAuthn: $webauthn_percent% ($webauthn_completed/$webauthn_total)"
    echo "  🧠 Cue: $cue_percent% ($cue_completed/$cue_total)"
    echo "  🎨 UI: $ui_percent% ($ui_completed/$ui_total)"
    echo ""
    
    # 다음 단계 제안
    echo -e "${YELLOW}🎯 다음 우선순위:${NC}"
    if [ $overall_percent -lt 50 ]; then
        echo "  1️⃣ 핵심 시스템 완성"
        echo "  2️⃣ WebAuthn 구현"
        echo "  3️⃣ 기본 UI 제작"
    else
        echo "  1️⃣ 시스템 통합"
        echo "  2️⃣ 테스트 및 디버깅"
        echo "  3️⃣ 최적화"
    fi
    
    echo ""
    echo -e "${GREEN}🚀 명령어:${NC}"
    echo "  npm run dev              # 개발 서버"
    echo "  bash safe_tracker.sh     # 재실행"
    echo "  bash safe_tracker.sh q   # 빠른 확인"
    echo "  bash safe_tracker.sh n   # 할 일"
    echo ""
    echo "================================================================="
}

# 메인 실행
case "${1:-}" in
    "q"|"quick")
        quick_check
        ;;
    "n"|"next")
        next_todo
        ;;
    "h"|"help")
        echo "사용법:"
        echo "  bash safe_tracker.sh       # 전체 상황"
        echo "  bash safe_tracker.sh q     # 빠른 확인"
        echo "  bash safe_tracker.sh n     # 다음 할 일"
        ;;
    *)
        full_status
        ;;
esac