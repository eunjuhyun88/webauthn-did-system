#!/bin/bash

# =============================================================================
# 🎯 WebAuthn + DID + Cue 시스템 완벽한 추적기 (에러 없는 최종 버전)
# perfect_tracker.sh
# 모든 셸에서 호환되고 에러 없이 작동하는 추적기
# =============================================================================

# 색상 정의 (호환성 보장)
if [ -t 1 ]; then
    RED='\033[0;31m'
    GREEN='\033[0;32m'
    YELLOW='\033[1;33m'
    BLUE='\033[0;34m'
    PURPLE='\033[0;35m'
    CYAN='\033[0;36m'
    WHITE='\033[1;37m'
    GRAY='\033[0;90m'
    NC='\033[0m'
else
    RED=''
    GREEN=''
    YELLOW=''
    BLUE=''
    PURPLE=''
    CYAN=''
    WHITE=''
    GRAY=''
    NC=''
fi

# 진행률 바 생성 (안전한 버전)
create_progress_bar() {
    local progress=$1
    local width=40
    local filled=$((progress * width / 100))
    local empty=$((width - filled))
    
    printf "["
    i=0
    while [ $i -lt $filled ]; do
        printf "█"
        i=$((i + 1))
    done
    i=0
    while [ $i -lt $empty ]; do
        printf "░"
        i=$((i + 1))
    done
    printf "] %3d%%" $progress
}

# 파일 체크 함수 (안전한 버전)
check_file() {
    local filepath="$1"
    if [ ! -f "$filepath" ]; then
        echo "missing"
        return
    fi
    
    local size=$(wc -c < "$filepath" 2>/dev/null || echo "0")
    if [ "$size" -lt 50 ]; then
        echo "empty"
    elif [ "$size" -lt 500 ]; then
        echo "basic"
    else
        echo "complete"
    fi
}

# 섹션별 파일 체크 (간단하고 안전한 버전)
check_webauthn_files() {
    local completed=0
    local total=7
    
    printf "${BLUE}🔐 WebAuthn 시스템${NC}\n"
    printf "${GRAY}----------------------------------------${NC}\n"
    
    # WebAuthn 파일들 체크
    local files="src/auth/webauthn/index.ts src/auth/webauthn/utils.ts src/auth/webauthn/client.ts src/app/api/webauthn/register/begin/route.ts src/app/api/webauthn/register/complete/route.ts src/app/api/webauthn/authenticate/begin/route.ts src/app/api/webauthn/authenticate/complete/route.ts"
    
    for file in $files; do
        local status=$(check_file "$file")
        case $status in
            "complete")
                printf "${GREEN}✅${NC} $(basename "$file")\n"
                completed=$((completed + 1))
                ;;
            "basic")
                printf "${YELLOW}⚠️${NC} $(basename "$file") (기본)\n"
                completed=$((completed + 1))
                ;;
            "empty")
                printf "${YELLOW}📝${NC} $(basename "$file") (빈 파일)\n"
                ;;
            "missing")
                printf "${RED}❌${NC} $(basename "$file")\n"
                ;;
        esac
    done
    
    local percentage=$((completed * 100 / total))
    printf "${GRAY}----------------------------------------${NC}\n"
    printf "진행률: $(create_progress_bar $percentage) (%d/%d)\n\n" $completed $total
    
    echo "$completed $total $percentage"
}

# Cue 시스템 체크
check_cue_files() {
    local completed=0
    local total=7
    
    printf "${CYAN}🧠 Cue 시스템${NC}\n"
    printf "${GRAY}----------------------------------------${NC}\n"
    
    local files="src/lib/cue/CueExtractor.ts src/lib/cue/PlatformSyncManager.ts src/lib/cue/CueApplicationEngine.ts src/types/cue.ts src/app/api/cue/extract/route.ts src/app/api/cue/sync/route.ts src/app/api/cue/apply/route.ts"
    
    for file in $files; do
        local status=$(check_file "$file")
        case $status in
            "complete")
                printf "${GREEN}✅${NC} $(basename "$file")\n"
                completed=$((completed + 1))
                ;;
            "basic")
                printf "${YELLOW}⚠️${NC} $(basename "$file") (기본)\n"
                completed=$((completed + 1))
                ;;
            "empty")
                printf "${YELLOW}📝${NC} $(basename "$file") (빈 파일)\n"
                ;;
            "missing")
                printf "${RED}❌${NC} $(basename "$file")\n"
                ;;
        esac
    done
    
    local percentage=$((completed * 100 / total))
    printf "${GRAY}----------------------------------------${NC}\n"
    printf "진행률: $(create_progress_bar $percentage) (%d/%d)\n\n" $completed $total
    
    echo "$completed $total $percentage"
}

# UI 컴포넌트 체크
check_ui_files() {
    local completed=0
    local total=6
    
    printf "${GREEN}🎨 UI 컴포넌트${NC}\n"
    printf "${GRAY}----------------------------------------${NC}\n"
    
    local files="src/components/auth/WebAuthnLogin.tsx src/components/auth/WebAuthnRegister.tsx src/components/auth/AuthProvider.tsx src/components/dashboard/ChatInterface.tsx src/components/ui/Button.tsx src/components/ui/Modal.tsx"
    
    for file in $files; do
        local status=$(check_file "$file")
        case $status in
            "complete")
                printf "${GREEN}✅${NC} $(basename "$file")\n"
                completed=$((completed + 1))
                ;;
            "basic")
                printf "${YELLOW}⚠️${NC} $(basename "$file") (기본)\n"
                completed=$((completed + 1))
                ;;
            "empty")
                printf "${YELLOW}📝${NC} $(basename "$file") (빈 파일)\n"
                ;;
            "missing")
                printf "${RED}❌${NC} $(basename "$file")\n"
                ;;
        esac
    done
    
    local percentage=$((completed * 100 / total))
    printf "${GRAY}----------------------------------------${NC}\n"
    printf "진행률: $(create_progress_bar $percentage) (%d/%d)\n\n" $completed $total
    
    echo "$completed $total $percentage"
}

# 핵심 파일 체크
check_core_files() {
    local completed=0
    local total=5
    
    printf "${PURPLE}🔧 핵심 시스템${NC}\n"
    printf "${GRAY}----------------------------------------${NC}\n"
    
    local files="src/lib/config/index.ts src/types/webauthn.ts src/types/did.ts src/database/supabase/client.ts src/services/ai/index.ts"
    
    for file in $files; do
        local status=$(check_file "$file")
        case $status in
            "complete")
                printf "${GREEN}✅${NC} $(basename "$file")\n"
                completed=$((completed + 1))
                ;;
            "basic")
                printf "${YELLOW}⚠️${NC} $(basename "$file") (기본)\n"
                completed=$((completed + 1))
                ;;
            "empty")
                printf "${YELLOW}📝${NC} $(basename "$file") (빈 파일)\n"
                ;;
            "missing")
                printf "${RED}❌${NC} $(basename "$file")\n"
                ;;
        esac
    done
    
    local percentage=$((completed * 100 / total))
    printf "${GRAY}----------------------------------------${NC}\n"
    printf "진행률: $(create_progress_bar $percentage) (%d/%d)\n\n" $completed $total
    
    echo "$completed $total $percentage"
}

# 메인 추적 함수
main_track() {
    clear
    printf "${CYAN}=================================================================${NC}\n"
    printf "${WHITE}🎯 WebAuthn + DID + Cue 시스템 진행 상황${NC}\n"
    printf "${GRAY}마지막 업데이트: $(date '+%Y-%m-%d %H:%M:%S')${NC}\n"
    printf "${CYAN}=================================================================${NC}\n\n"
    
    # 각 섹션 체크
    webauthn_result=$(check_webauthn_files)
    webauthn_completed=$(echo $webauthn_result | cut -d' ' -f1)
    webauthn_total=$(echo $webauthn_result | cut -d' ' -f2)
    webauthn_percentage=$(echo $webauthn_result | cut -d' ' -f3)
    
    cue_result=$(check_cue_files)
    cue_completed=$(echo $cue_result | cut -d' ' -f1)
    cue_total=$(echo $cue_result | cut -d' ' -f2)
    cue_percentage=$(echo $cue_result | cut -d' ' -f3)
    
    ui_result=$(check_ui_files)
    ui_completed=$(echo $ui_result | cut -d' ' -f1)
    ui_total=$(echo $ui_result | cut -d' ' -f2)
    ui_percentage=$(echo $ui_result | cut -d' ' -f3)
    
    core_result=$(check_core_files)
    core_completed=$(echo $core_result | cut -d' ' -f1)
    core_total=$(echo $core_result | cut -d' ' -f2)
    core_percentage=$(echo $core_result | cut -d' ' -f3)
    
    # 전체 요약
    total_completed=$((webauthn_completed + cue_completed + ui_completed + core_completed))
    total_files=$((webauthn_total + cue_total + ui_total + core_total))
    overall_percentage=$((total_completed * 100 / total_files))
    
    printf "${CYAN}=================================================================${NC}\n"
    printf "${WHITE}📊 전체 요약${NC}\n"
    printf "${CYAN}=================================================================${NC}\n"
    printf "${WHITE}전체 진행률: $(create_progress_bar $overall_percentage) (%d/%d)${NC}\n\n" $total_completed $total_files
    
    printf "${WHITE}섹션별 완료율:${NC}\n"
    printf "  🔧 핵심 시스템: %d%% (%d/%d)\n" $core_percentage $core_completed $core_total
    printf "  🔐 WebAuthn: %d%% (%d/%d)\n" $webauthn_percentage $webauthn_completed $webauthn_total
    printf "  🧠 Cue 시스템: %d%% (%d/%d)\n" $cue_percentage $cue_completed $cue_total
    printf "  🎨 UI 컴포넌트: %d%% (%d/%d)\n\n" $ui_percentage $ui_completed $ui_total
    
    # 다음 우선순위
    printf "${YELLOW}🎯 다음 우선순위:${NC}\n"
    if [ $overall_percentage -lt 30 ]; then
        printf "  1️⃣ 핵심 시스템 파일 완성\n"
        printf "  2️⃣ WebAuthn 기본 구현\n"
        printf "  3️⃣ Cue 시스템 핵심 로직\n"
    elif [ $overall_percentage -lt 60 ]; then
        printf "  1️⃣ UI 컴포넌트 개발\n"
        printf "  2️⃣ Cue 시스템 API 완성\n"
        printf "  3️⃣ 통합 테스트\n"
    else
        printf "  1️⃣ 시스템 통합 및 테스트\n"
        printf "  2️⃣ 성능 최적화\n"
        printf "  3️⃣ 배포 준비\n"
    fi
    
    printf "\n${GREEN}🚀 실행 명령어:${NC}\n"
    printf "  npm run dev                    # 개발 서버 시작\n"
    printf "  bash perfect_tracker.sh       # 이 추적기 재실행\n"
    printf "  bash perfect_tracker.sh quick # 빠른 확인\n"
    printf "  bash perfect_tracker.sh watch # 실시간 모니터링\n"
    
    printf "\n${CYAN}=================================================================${NC}\n"
    
    # 상태 저장
    save_status
}

# 빠른 확인
quick_check() {
    printf "${BLUE}⚡ 빠른 상태 확인${NC}\n"
    printf "${GRAY}$(date '+%H:%M:%S')${NC}\n\n"
    
    # 핵심 파일들만 빠르게 체크
    local critical_files="src/lib/config/index.ts src/auth/webauthn/client.ts src/lib/cue/CueExtractor.ts src/components/auth/WebAuthnLogin.tsx"
    local completed=0
    local total=0
    
    for file in $critical_files; do
        total=$((total + 1))
        local status=$(check_file "$file")
        if [ "$status" = "complete" ] || [ "$status" = "basic" ]; then
            printf "${GREEN}✅${NC} $(basename "$file")\n"
            completed=$((completed + 1))
        else
            printf "${RED}❌${NC} $(basename "$file")\n"
        fi
    done
    
    local percentage=$((completed * 100 / total))
    printf "\n핵심 기능: $(create_progress_bar $percentage) (%d/%d)\n" $completed $total
}

# 다음 할 일
next_tasks() {
    printf "${CYAN}🎯 다음 할 일 (우선순위)${NC}\n"
    printf "${GRAY}----------------------------------------${NC}\n"
    
    # 우선순위 파일들 체크
    local priority_files="src/auth/webauthn/client.ts src/app/api/webauthn/authenticate/begin/route.ts src/app/api/webauthn/authenticate/complete/route.ts src/components/auth/WebAuthnRegister.tsx src/components/auth/AuthProvider.tsx"
    local task_num=1
    
    for file in $priority_files; do
        local status=$(check_file "$file")
        if [ "$status" = "missing" ] || [ "$status" = "empty" ]; then
            printf "  %d️⃣ %s\n" $task_num "$(basename "$file")"
            printf "     📁 %s\n" "$file"
            task_num=$((task_num + 1))
            
            if [ $task_num -gt 3 ]; then
                break
            fi
        fi
    done
    
    if [ $task_num -eq 1 ]; then
        printf "  🎉 ${GREEN}핵심 작업 완료!${NC} 다음 단계로 진행하세요.\n"
    fi
}

# 상태 저장
save_status() {
    cat > .status.txt << EOF
LAST_UPDATE=$(date '+%Y-%m-%d %H:%M:%S')
OVERALL_PROGRESS=${overall_percentage:-0}
WEBAUTHN_PROGRESS=${webauthn_percentage:-0}
CUE_PROGRESS=${cue_percentage:-0}
UI_PROGRESS=${ui_percentage:-0}
CORE_PROGRESS=${core_percentage:-0}
EOF
}

# 실시간 모니터링
watch_mode() {
    printf "${BLUE}🔄 실시간 모니터링 시작 (30초 간격)${NC}\n"
    printf "${GRAY}Ctrl+C로 중지${NC}\n\n"
    
    while true; do
        main_track
        sleep 30
    done
}

# =============================================================================
# 메인 실행 로직
# =============================================================================

case "${1:-}" in
    "quick"|"q")
        quick_check
        ;;
    "next"|"n")
        next_tasks
        ;;
    "watch"|"w")
        watch_mode
        ;;
    "help"|"h"|"-h"|"--help")
        printf "${CYAN}사용법:${NC}\n"
        printf "  bash perfect_tracker.sh        # 전체 진행 상황\n"
        printf "  bash perfect_tracker.sh quick  # 빠른 확인\n"
        printf "  bash perfect_tracker.sh next   # 다음 할 일\n"
        printf "  bash perfect_tracker.sh watch  # 실시간 모니터링\n"
        ;;
    *)
        main_track
        ;;
esac