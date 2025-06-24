#!/bin/bash

# =============================================================================
# 🎯 수정된 파일 추적기 - 에러 없는 버전
# fixed_tracker.sh
# stats1.sh의 division by 0 에러를 수정한 안정적인 버전
# =============================================================================

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m' # No Color

# 진행률 바 생성 함수 (안전한 버전)
create_progress_bar() {
    local progress=${1:-0}
    local total=50
    
    # 진행률이 0-100 범위를 벗어나지 않도록 보장
    if [ "$progress" -lt 0 ]; then progress=0; fi
    if [ "$progress" -gt 100 ]; then progress=100; fi
    
    local filled=$((progress * total / 100))
    local empty=$((total - filled))
    
    printf "["
    printf "%*s" $filled | tr ' ' '█'
    printf "%*s" $empty | tr ' ' '░'
    printf "] %d%%" $progress
}

echo -e "${CYAN}=============================================================================${NC}"
echo -e "${WHITE}🎯 WebAuthn + DID + Cue 시스템 완전 추적기 (수정 버전)${NC}"
echo -e "${CYAN}=============================================================================${NC}"
echo -e "${BLUE}📅 $(date '+%Y-%m-%d %H:%M:%S')${NC}"
echo ""

# =============================================================================
# 📊 파일 상태 확인 함수 (안전한 버전)
# =============================================================================

check_file_status() {
    local file_path="$1"
    local description="$2"
    
    if [ -f "$file_path" ]; then
        local size=$(wc -c < "$file_path" 2>/dev/null || echo "0")
        if [ "$size" -gt 100 ]; then
            echo -e "${GREEN}✅${NC} $description ${CYAN}($size bytes)${NC}"
            return 0
        else
            echo -e "${YELLOW}⚠️ ${NC} $description ${YELLOW}(파일 있음, 내용 부족: $size bytes)${NC}"
            return 1
        fi
    else
        echo -e "${RED}❌${NC} $description ${RED}(파일 없음)${NC}"
        return 2
    fi
}

# 섹션별 상태 확인 함수 (안전한 버전)
check_section() {
    local section_name="$1"
    shift
    local files=("$@")
    local completed=0
    local total=${#files[@]}
    
    echo -e "\n${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${WHITE}📂 $section_name${NC}"
    echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    
    for file_info in "${files[@]}"; do
        IFS=':' read -r file_path description <<< "$file_info"
        if check_file_status "$file_path" "$description"; then
            completed=$((completed + 1))
        fi
    done
    
    # 안전한 백분율 계산
    local percentage=0
    if [ "$total" -gt 0 ]; then
        percentage=$((completed * 100 / total))
    fi
    
    echo -e "\n${CYAN}📊 $section_name 진행률: $completed/$total $(create_progress_bar $percentage)${NC}"
    
    # 전역 카운터 업데이트
    TOTAL_COMPLETED=$((TOTAL_COMPLETED + completed))
    TOTAL_FILES=$((TOTAL_FILES + total))
    
    echo "$percentage"
}

# =============================================================================
# 📋 파일 리스트 정의 (안전한 형식)
# =============================================================================

# 핵심 설정 & 유틸리티
CORE_CONFIG_FILES=(
    "src/lib/config/index.ts:전체 시스템 설정"
    "src/lib/utils/crypto.ts:암호화 유틸리티"
    "src/lib/utils/validation.ts:입력 검증 함수들"
    "src/types/webauthn.ts:WebAuthn 타입 정의"
    "src/types/did.ts:DID 타입 정의"
    "src/types/user.ts:사용자 타입 정의"
)

# WebAuthn 시스템
WEBAUTHN_FILES=(
    "src/auth/webauthn/index.ts:WebAuthn 메인 서비스"
    "src/auth/webauthn/utils.ts:WebAuthn 유틸리티"
    "src/auth/webauthn/client.ts:클라이언트 WebAuthn 함수"
    "src/app/api/webauthn/register/begin/route.ts:등록 시작 API"
    "src/app/api/webauthn/register/complete/route.ts:등록 완료 API"
    "src/app/api/webauthn/authenticate/begin/route.ts:인증 시작 API"
    "src/app/api/webauthn/authenticate/complete/route.ts:인증 완료 API"
)

# Cue 시스템
CUE_SYSTEM_FILES=(
    "src/lib/cue/CueExtractor.ts:맥락 추출 엔진"
    "src/lib/cue/PlatformSyncManager.ts:플랫폼 간 동기화"
    "src/lib/cue/CueApplicationEngine.ts:Cue 적용 엔진"
    "src/types/cue.ts:Cue 시스템 타입"
    "src/components/cue/CueManager.tsx:Cue 관리 컴포넌트"
    "src/app/api/cue/extract/route.ts:Cue 추출 API"
    "src/app/api/cue/apply/route.ts:Cue 적용 API"
)

# UI 컴포넌트
UI_COMPONENTS=(
    "src/components/auth/WebAuthnLogin.tsx:WebAuthn 로그인 컴포넌트"
    "src/components/auth/WebAuthnRegister.tsx:WebAuthn 등록 컴포넌트"
    "src/components/auth/AuthProvider.tsx:인증 컨텍스트"
    "src/components/dashboard/ChatInterface.tsx:채팅 인터페이스"
    "src/components/ui/Button.tsx:버튼 컴포넌트"
    "src/components/ui/Modal.tsx:모달 컴포넌트"
)

# 데이터베이스
DATABASE_FILES=(
    "src/database/supabase/client.ts:Supabase 클라이언트"
    "src/database/migrations/001_initial_schema.sql:초기 스키마"
    "src/database/repositories/users.ts:사용자 저장소"
    "src/database/repositories/credentials.ts:인증서 저장소"
)

# =============================================================================
# 📈 메인 실행
# =============================================================================

TOTAL_COMPLETED=0
TOTAL_FILES=0

# 각 섹션별 확인
CORE_PROGRESS=$(check_section "🔧 핵심 설정 & 유틸리티" "${CORE_CONFIG_FILES[@]}")
WEBAUTHN_PROGRESS=$(check_section "🔐 WebAuthn 완전 구현" "${WEBAUTHN_FILES[@]}")
CUE_PROGRESS=$(check_section "🧠 Cue 시스템 (핵심!)" "${CUE_SYSTEM_FILES[@]}")
UI_PROGRESS=$(check_section "🎨 UI 컴포넌트들" "${UI_COMPONENTS[@]}")
DB_PROGRESS=$(check_section "🗄️ 데이터베이스 레이어" "${DATABASE_FILES[@]}")

# =============================================================================
# 📊 전체 요약
# =============================================================================

echo -e "\n${CYAN}=============================================================================${NC}"
echo -e "${WHITE}📈 전체 진행 상황 요약${NC}"
echo -e "${CYAN}=============================================================================${NC}"

# 안전한 전체 진행률 계산
OVERALL_PERCENTAGE=0
if [ "$TOTAL_FILES" -gt 0 ]; then
    OVERALL_PERCENTAGE=$((TOTAL_COMPLETED * 100 / TOTAL_FILES))
fi

echo -e "${WHITE}완료된 파일: ${GREEN}$TOTAL_COMPLETED${NC}${WHITE}/$TOTAL_FILES${NC}"
echo -e "${WHITE}전체 완료율: $(create_progress_bar $OVERALL_PERCENTAGE)${NC}"
echo ""

# 섹션별 요약
echo -e "${BLUE}📊 섹션별 완료율:${NC}"
echo -e "  🔧 핵심 설정: $(create_progress_bar $CORE_PROGRESS)"
echo -e "  🔐 WebAuthn: $(create_progress_bar $WEBAUTHN_PROGRESS)"
echo -e "  🧠 Cue 시스템: $(create_progress_bar $CUE_PROGRESS)"
echo -e "  🎨 UI 컴포넌트: $(create_progress_bar $UI_PROGRESS)"
echo -e "  🗄️ 데이터베이스: $(create_progress_bar $DB_PROGRESS)"

# =============================================================================
# 🎯 다음 우선순위 제안
# =============================================================================

echo -e "\n${YELLOW}🎯 다음 우선 작업 제안:${NC}"

if [ "$WEBAUTHN_PROGRESS" -lt 100 ]; then
    echo -e "  1️⃣ 🔐 WebAuthn 인증 API 완성 (authenticate 폴더에 파일 없음)"
fi
if [ "$UI_PROGRESS" -lt 50 ]; then
    echo -e "  2️⃣ 🎨 UI 컴포넌트 생성 (로그인/회원가입)"
fi
if [ "$CUE_PROGRESS" -lt 80 ]; then
    echo -e "  3️⃣ 🧠 Cue 시스템 API 완성"
fi

echo -e "\n${GREEN}🚀 추천 실행 명령어들:${NC}"
echo -e "  ${CYAN}bash fixed_tracker.sh${NC}        # 이 스크립트 재실행"
echo -e "  ${CYAN}npm run dev${NC}                 # 개발 서버 시작"
echo -e "  ${CYAN}npm run type-check${NC}          # 타입 체크"

# =============================================================================
# 💾 상태 저장 (안전한 버전)
# =============================================================================

cat > .progress-status.json << EOF
{
  "timestamp": "$(date -Iseconds)",
  "totalFiles": $TOTAL_FILES,
  "completedFiles": $TOTAL_COMPLETED,
  "overallProgress": $OVERALL_PERCENTAGE,
  "sections": {
    "core": $CORE_PROGRESS,
    "webauthn": $WEBAUTHN_PROGRESS,
    "cue": $CUE_PROGRESS,
    "ui": $UI_PROGRESS,
    "database": $DB_PROGRESS
  }
}
EOF

echo -e "\n${GREEN}💾 진행 상황이 .progress-status.json 파일에 저장되었습니다.${NC}"

echo -e "\n${CYAN}=============================================================================${NC}"
echo -e "${WHITE}🎯 추적 완료! 실시간 모니터링: ${YELLOW}watch -n 30 'bash fixed_tracker.sh'${NC}"
echo -e "${CYAN}=============================================================================${NC}"