#!/bin/bash

# =============================================================================
# 🎯 WebAuthn + DID + Cue 시스템 통일 추적기
# master_tracker.sh
# 원본 파일 리스트 기반 정확한 진행 상황 추적
# =============================================================================

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
GRAY='\033[0;90m'
NC='\033[0m'

# 진행률 바 생성
create_progress_bar() {
    local progress=$1
    local width=40
    local filled=$((progress * width / 100))
    local empty=$((width - filled))
    
    printf "["
    printf "%*s" $filled | tr ' ' '█'
    printf "%*s" $empty | tr ' ' '░'
    printf "] %3d%%" $progress
}

# 파일 크기와 완성도 체크
check_file_completion() {
    local filepath=$1
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

# 메인 추적 함수
track_progress() {
    echo -e "${CYAN}=============================================================================${NC}"
    echo -e "${WHITE}🎯 WebAuthn + DID + Cue 시스템 통합 진행 상황${NC}"
    echo -e "${GRAY}마지막 업데이트: $(date '+%Y-%m-%d %H:%M:%S')${NC}"
    echo -e "${CYAN}=============================================================================${NC}"
    echo ""

    # =============================================================================
    # 📋 원본 파일 리스트 정의 (당신이 처음에 만든 리스트)
    # =============================================================================
    
    # 🔧 핵심 설정 & 유틸리티 (6개)
    declare -a core_config=(
        "src/lib/config/index.ts:전체 시스템 설정"
        "src/lib/utils/crypto.ts:암호화 유틸리티"
        "src/lib/utils/validation.ts:입력 검증 함수들"
        "src/types/webauthn.ts:WebAuthn 타입 정의"
        "src/types/did.ts:DID 타입 정의"
        "src/types/user.ts:사용자 타입 정의"
    )

    # 🔐 WebAuthn 완전 구현 (7개)
    declare -a webauthn_files=(
        "src/auth/webauthn/index.ts:WebAuthn 메인 서비스"
        "src/auth/webauthn/utils.ts:WebAuthn 유틸리티"
        "src/auth/webauthn/client.ts:클라이언트 WebAuthn 함수"
        "src/app/api/webauthn/register/begin/route.ts:등록 시작 API"
        "src/app/api/webauthn/register/complete/route.ts:등록 완료 API"
        "src/app/api/webauthn/authenticate/begin/route.ts:인증 시작 API"
        "src/app/api/webauthn/authenticate/complete/route.ts:인증 완료 API"
    )

    # 🆔 DID 시스템 (5개)
    declare -a did_files=(
        "src/identity/did/index.ts:DID 메인 서비스"
        "src/identity/did/generator.ts:DID 생성기"
        "src/identity/did/resolver.ts:DID 해결기"
        "src/app/api/did/create/route.ts:DID 생성 API"
        "src/app/api/did/resolve/[did]/route.ts:DID 조회 API"
    )

    # 🧠 Cue 시스템 (7개) - 새로 추가된 핵심!
    declare -a cue_files=(
        "src/lib/cue/CueExtractor.ts:맥락 추출 엔진"
        "src/lib/cue/PlatformSyncManager.ts:플랫폼 동기화"
        "src/lib/cue/CueApplicationEngine.ts:AI 응답 개인화"
        "src/types/cue.ts:Cue 타입 정의"
        "src/app/api/cue/extract/route.ts:맥락 추출 API"
        "src/app/api/cue/sync/route.ts:동기화 API"
        "src/app/api/cue/apply/route.ts:적용 API"
    )

    # 🗄️ 데이터베이스 레이어 (6개)
    declare -a database_files=(
        "src/database/supabase/client.ts:Supabase 클라이언트"
        "src/database/migrations/001_initial_schema.sql:초기 스키마"
        "src/database/repositories/users.ts:사용자 저장소"
        "src/database/repositories/credentials.ts:인증서 저장소"
        "src/database/repositories/conversations.ts:대화 저장소"
        "src/database/repositories/did.ts:DID 저장소"
    )

    # 🎨 UI 컴포넌트들 (9개)
    declare -a ui_components=(
        "src/components/auth/WebAuthnLogin.tsx:WebAuthn 로그인"
        "src/components/auth/WebAuthnRegister.tsx:WebAuthn 등록"
        "src/components/auth/AuthProvider.tsx:인증 컨텍스트"
        "src/components/dashboard/ChatInterface.tsx:채팅 인터페이스"
        "src/components/dashboard/UserProfile.tsx:사용자 프로필"
        "src/components/dashboard/DIDManager.tsx:DID 관리"
        "src/components/ui/Button.tsx:버튼 컴포넌트"
        "src/components/ui/Modal.tsx:모달 컴포넌트"
        "src/components/ui/Toast.tsx:토스트 알림"
    )

    # 📱 페이지들 (6개)
    declare -a page_files=(
        "src/app/page.tsx:메인 홈페이지"
        "src/app/layout.tsx:루트 레이아웃"
        "src/app/(auth)/login/page.tsx:로그인 페이지"
        "src/app/(auth)/register/page.tsx:회원가입 페이지"
        "src/app/(dashboard)/chat/page.tsx:채팅 페이지"
        "src/app/(dashboard)/profile/page.tsx:프로필 페이지"
    )

    # 🔗 훅(Hooks) & 컨텍스트 (8개)
    declare -a hooks_files=(
        "src/lib/hooks/useAuth.ts:인증 훅"
        "src/lib/hooks/useWebAuthn.ts:WebAuthn 훅"
        "src/lib/hooks/useAI.ts:AI 채팅 훅"
        "src/lib/hooks/useDID.ts:DID 관리 훅"
        "src/lib/hooks/useCue.ts:Cue 시스템 훅"
        "src/lib/context/AuthContext.tsx:인증 컨텍스트"
        "src/lib/context/AIContext.tsx:AI 컨텍스트"
        "src/lib/context/CueContext.tsx:Cue 컨텍스트"
    )

    # 🔧 미들웨어 & 보안 (5개)
    declare -a security_files=(
        "src/middleware.ts:Next.js 미들웨어"
        "src/lib/auth/jwt.ts:JWT 토큰 관리"
        "src/lib/auth/session.ts:세션 관리"
        "src/lib/security/rateLimit.ts:Rate Limiting"
        "src/lib/security/encryption.ts:암호화 함수"
    )

    # 📊 추가 API 라우트들 (7개)
    declare -a api_files=(
        "src/app/api/auth/login/route.ts:일반 로그인 API"
        "src/app/api/auth/logout/route.ts:로그아웃 API"
        "src/app/api/auth/refresh/route.ts:토큰 갱신 API"
        "src/app/api/user/profile/route.ts:사용자 프로필 API"
        "src/app/api/conversations/route.ts:대화 목록 API"
        "src/app/api/system/health/route.ts:시스템 상태 API"
        "src/app/api/ai/chat/route.ts:AI 채팅 API"
    )

    # =============================================================================
    # 섹션별 진행률 계산 및 표시
    # =============================================================================
    
    local total_completed=0
    local total_files=0

    # 섹션별 처리 함수
    process_section() {
        local section_name=$1
        local icon=$2
        local color=$3
        local -n files_array=$4
        
        local completed=0
        local section_total=${#files_array[@]}
        total_files=$((total_files + section_total))
        
        echo -e "${color}${icon} ${section_name}${NC}"
        echo -e "${GRAY}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        
        for item in "${files_array[@]}"; do
            IFS=':' read -ra PARTS <<< "$item"
            local filepath="${PARTS[0]}"
            local description="${PARTS[1]}"
            local status=$(check_file_completion "$filepath")
            
            case $status in
                "complete")
                    echo -e "  ${GREEN}✅${NC} ${GREEN}$description${NC}"
                    echo -e "     ${GRAY}📁 $filepath${NC}"
                    completed=$((completed + 1))
                    ;;
                "basic")
                    echo -e "  ${YELLOW}⚠️${NC} ${YELLOW}$description${NC} ${GRAY}(기본 구조만)${NC}"
                    echo -e "     ${GRAY}📁 $filepath${NC}"
                    completed=$((completed + 1))
                    ;;
                "empty")
                    echo -e "  ${YELLOW}📝${NC} $description ${GRAY}(빈 파일)${NC}"
                    echo -e "     ${GRAY}📁 $filepath${NC}"
                    ;;
                "missing")
                    echo -e "  ${RED}❌${NC} $description"
                    echo -e "     ${GRAY}📁 $filepath${NC}"
                    ;;
            esac
        done
        
        total_completed=$((total_completed + completed))
        local percentage=$((completed * 100 / section_total))
        
        echo -e "${GRAY}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "  진행률: $(create_progress_bar $percentage) ${WHITE}($completed/$section_total)${NC}"
        echo ""
    }

    # 각 섹션 처리
    process_section "핵심 설정 & 유틸리티" "🔧" "$BLUE" core_config
    process_section "WebAuthn 완전 구현" "🔐" "$GREEN" webauthn_files
    process_section "DID 시스템" "🆔" "$PURPLE" did_files
    process_section "Cue 시스템 (핵심!)" "🧠" "$CYAN" cue_files
    process_section "데이터베이스 레이어" "🗄️" "$YELLOW" database_files
    process_section "UI 컴포넌트들" "🎨" "$GREEN" ui_components
    process_section "페이지들" "📱" "$BLUE" page_files
    process_section "훅 & 컨텍스트" "🔗" "$PURPLE" hooks_files
    process_section "미들웨어 & 보안" "🔧" "$RED" security_files
    process_section "추가 API 라우트들" "📊" "$CYAN" api_files

    # =============================================================================
    # 전체 요약
    # =============================================================================
    
    local overall_percentage=$((total_completed * 100 / total_files))
    
    echo -e "${CYAN}=============================================================================${NC}"
    echo -e "${WHITE}📊 전체 프로젝트 진행 요약${NC}"
    echo -e "${CYAN}=============================================================================${NC}"
    echo -e "${WHITE}전체 진행률: $(create_progress_bar $overall_percentage) ($total_completed/$total_files)${NC}"
    echo ""
    
    # 우선순위 제안
    echo -e "${YELLOW}🎯 다음 우선순위 (중요도 순):${NC}"
    
    if [ $overall_percentage -lt 30 ]; then
        echo -e "  1️⃣ ${CYAN}Cue 시스템 핵심 파일들${NC} - 시스템의 핵심!"
        echo -e "  2️⃣ ${GREEN}WebAuthn 인증 완료${NC} - 보안 기반"
        echo -e "  3️⃣ ${BLUE}기본 UI 컴포넌트${NC} - 사용자 인터페이스"
    elif [ $overall_percentage -lt 60 ]; then
        echo -e "  1️⃣ ${GREEN}UI 컴포넌트 완성${NC} - 사용자 경험"
        echo -e "  2️⃣ ${PURPLE}훅과 컨텍스트${NC} - 상태 관리"
        echo -e "  3️⃣ ${YELLOW}데이터베이스 연동${NC} - 데이터 영속성"
    else
        echo -e "  1️⃣ ${RED}보안 미들웨어${NC} - 운영 준비"
        echo -e "  2️⃣ ${CYAN}API 라우트 완성${NC} - 서비스 완성"
        echo -e "  3️⃣ ${WHITE}통합 테스트${NC} - 품질 보증"
    fi
    
    echo ""
    echo -e "${GREEN}🚀 빠른 실행 명령어:${NC}"
    echo -e "  ${GRAY}npm run dev${NC}                   # 개발 서버 시작"
    echo -e "  ${GRAY}./master_tracker.sh quick${NC}     # 빠른 상태만 확인"
    echo -e "  ${GRAY}./master_tracker.sh next${NC}      # 다음 할 일만 표시"
    echo -e "  ${GRAY}./master_tracker.sh add [파일]${NC} # 새 파일 추가 알림"
    
    # JSON 파일로 상태 저장
    save_progress_json
}

# 빠른 상태 확인
quick_status() {
    echo -e "${BLUE}⚡ 빠른 상태 확인${NC}"
    echo -e "${GRAY}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    
    # 핵심 파일들만 빠르게 체크
    declare -a critical_files=(
        "src/lib/config/index.ts:⚙️ 시스템 설정"
        "src/lib/cue/CueExtractor.ts:🧠 Cue 추출기"
        "src/auth/webauthn/client.ts:🔐 WebAuthn"
        "src/components/auth/WebAuthnLogin.tsx:🎨 로그인 UI"
        "src/app/api/webauthn/authenticate/begin/route.ts:🔑 인증 API"
    )
    
    local quick_completed=0
    local quick_total=${#critical_files[@]}
    
    for item in "${critical_files[@]}"; do
        IFS=':' read -ra PARTS <<< "$item"
        local filepath="${PARTS[0]}"
        local description="${PARTS[1]}"
        local status=$(check_file_completion "$filepath")
        
        if [ "$status" = "complete" ] || [ "$status" = "basic" ]; then
            echo -e "  ${GREEN}✅${NC} $description"
            quick_completed=$((quick_completed + 1))
        else
            echo -e "  ${RED}❌${NC} $description"
        fi
    done
    
    local quick_percentage=$((quick_completed * 100 / quick_total))
    echo -e "${GRAY}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${WHITE}핵심 기능: $(create_progress_bar $quick_percentage) ($quick_completed/$quick_total)${NC}"
}

# 다음 할 일 제안
suggest_next() {
    echo -e "${CYAN}🎯 다음 할 일 제안${NC}"
    echo -e "${GRAY}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    
    # 우선순위별 체크
    declare -a priority_check=(
        "src/lib/cue/CueExtractor.ts:🧠 Cue 추출 엔진 (최우선!)"
        "src/app/api/webauthn/authenticate/begin/route.ts:🔑 WebAuthn 인증 시작"
        "src/app/api/webauthn/authenticate/complete/route.ts:✅ WebAuthn 인증 완료"
        "src/components/auth/WebAuthnLogin.tsx:🎨 로그인 컴포넌트"
        "src/components/auth/WebAuthnRegister.tsx:📝 회원가입 컴포넌트"
    )
    
    local suggestion_count=1
    for item in "${priority_check[@]}"; do
        IFS=':' read -ra PARTS <<< "$item"
        local filepath="${PARTS[0]}"
        local description="${PARTS[1]}"
        local status=$(check_file_completion "$filepath")
        
        if [ "$status" = "missing" ] || [ "$status" = "empty" ]; then
            echo -e "  ${suggestion_count}️⃣ $description"
            echo -e "     📁 ${GRAY}$filepath${NC}"
            suggestion_count=$((suggestion_count + 1))
            
            if [ $suggestion_count -gt 3 ]; then
                break
            fi
        fi
    done
    
    if [ $suggestion_count -eq 1 ]; then
        echo -e "  🎉 ${GREEN}핵심 파일들이 모두 완성되었습니다!${NC}"
        echo -e "     다음은 UI 컴포넌트나 테스트를 진행하세요."
    fi
}

# 파일 추가 알림
add_file() {
    local filepath=$1
    local description=${2:-"새 파일"}
    
    if [ -f "$filepath" ]; then
        local size=$(wc -c < "$filepath" 2>/dev/null || echo "0")
        echo -e "${GREEN}🎉 파일 추가 완료!${NC}"
        echo -e "   📁 ${CYAN}$filepath${NC}"
        echo -e "   📝 $description"
        echo -e "   📊 크기: ${size} bytes"
        echo -e "   ⏰ $(date '+%H:%M:%S')"
        
        # 간단한 진행률 업데이트
        echo ""
        quick_status
    else
        echo -e "${RED}❌ 파일을 찾을 수 없습니다: $filepath${NC}"
    fi
}

# JSON 상태 저장
save_progress_json() {
    cat > .master-progress.json << EOF
{
  "timestamp": "$(date -Iseconds)",
  "overallProgress": $overall_percentage,
  "totalFiles": $total_files,
  "completedFiles": $total_completed,
  "lastUpdate": "$(date '+%Y-%m-%d %H:%M:%S')"
}
EOF
}

# =============================================================================
# 메인 실행 로직
# =============================================================================

case "$1" in
    "quick"|"q")
        quick_status
        ;;
    "next"|"n")
        suggest_next
        ;;
    "add")
        if [ -n "$2" ]; then
            add_file "$2" "$3"
        else
            echo -e "${YELLOW}사용법: ./master_tracker.sh add [파일경로] [설명]${NC}"
        fi
        ;;
    "watch"|"w")
        echo -e "${BLUE}🔄 실시간 모니터링 시작 (30초 간격)${NC}"
        echo -e "${GRAY}Ctrl+C로 중지${NC}"
        echo ""
        while true; do
            clear
            quick_status
            sleep 30
        done
        ;;
    *)
        track_progress
        ;;
esac