#!/bin/bash

# =============================================================================
# 🎯 간단하고 안정적인 진행 상황 추적기
# simple_tracker.sh - 에러 없는 깔끔한 버전
# =============================================================================

# 색상 정의
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m'

echo -e "${CYAN}================================================================================================${NC}"
echo -e "${WHITE}🎯 WebAuthn + DID + Cue 시스템 진행 상황${NC}"
echo -e "${CYAN}================================================================================================${NC}"
echo -e "${BLUE}📅 $(date '+%Y-%m-%d %H:%M:%S')${NC}"
echo ""

# 파일 체크 함수
check_file() {
    local file="$1"
    local desc="$2"
    
    if [ -f "$file" ]; then
        local size=$(wc -c < "$file" 2>/dev/null || echo "0")
        if [ "$size" -gt 100 ]; then
            echo -e "${GREEN}✅${NC} $desc ${CYAN}($size bytes)${NC}"
            return 0
        else
            echo -e "${YELLOW}⚠️${NC} $desc ${YELLOW}($size bytes - 내용 부족)${NC}"
            return 1
        fi
    else
        echo -e "${RED}❌${NC} $desc ${RED}(파일 없음)${NC}"
        return 2
    fi
}

# 진행률 바 생성 (간단 버전)
progress_bar() {
    local current=$1
    local total=$2
    local percentage=$((current * 100 / total))
    local filled=$((percentage / 2))
    local empty=$((50 - filled))
    
    printf "["
    printf "%*s" $filled | tr ' ' '█'
    printf "%*s" $empty | tr ' ' '░'
    printf "] %d%% (%d/%d)" $percentage $current $total
}

# =============================================================================
# 🔐 WebAuthn 시스템 체크
# =============================================================================

echo -e "${BLUE}🔐 WebAuthn 시스템${NC}"
echo -e "${CYAN}------------------------------------------------------------------------------------------------${NC}"

webauthn_files=(
    "src/auth/webauthn/index.ts:WebAuthn 메인 서비스"
    "src/auth/webauthn/utils.ts:WebAuthn 유틸리티"
    "src/auth/webauthn/client.ts:WebAuthn 클라이언트"
    "src/app/api/webauthn/register/begin/route.ts:등록 시작 API"
    "src/app/api/webauthn/register/complete/route.ts:등록 완료 API"
    "src/app/api/webauthn/authenticate/begin/route.ts:인증 시작 API"
    "src/app/api/webauthn/authenticate/complete/route.ts:인증 완료 API"
)

webauthn_completed=0
for file_info in "${webauthn_files[@]}"; do
    IFS=':' read -r file desc <<< "$file_info"
    if check_file "$file" "$desc"; then
        webauthn_completed=$((webauthn_completed + 1))
    fi
done

echo -e "${CYAN}진행률: $(progress_bar $webauthn_completed ${#webauthn_files[@]})${NC}"
echo ""

# =============================================================================
# 🧠 Cue 시스템 체크
# =============================================================================

echo -e "${BLUE}🧠 Cue 시스템${NC}"
echo -e "${CYAN}------------------------------------------------------------------------------------------------${NC}"

cue_files=(
    "src/lib/cue/CueExtractor.ts:맥락 추출 엔진"
    "src/lib/cue/PlatformSyncManager.ts:플랫폼 동기화"
    "src/lib/cue/CueApplicationEngine.ts:Cue 적용 엔진"
    "src/types/cue.ts:Cue 타입 정의"
    "src/components/cue/CueManager.tsx:Cue 관리 컴포넌트"
    "src/app/api/cue/extract/route.ts:Cue 추출 API"
    "src/app/api/cue/apply/route.ts:Cue 적용 API"
)

cue_completed=0
for file_info in "${cue_files[@]}"; do
    IFS=':' read -r file desc <<< "$file_info"
    if check_file "$file" "$desc"; then
        cue_completed=$((cue_completed + 1))
    fi
done

echo -e "${CYAN}진행률: $(progress_bar $cue_completed ${#cue_files[@]})${NC}"
echo ""

# =============================================================================
# 🎨 UI 컴포넌트 체크
# =============================================================================

echo -e "${BLUE}🎨 UI 컴포넌트${NC}"
echo -e "${CYAN}------------------------------------------------------------------------------------------------${NC}"

ui_files=(
    "src/components/auth/WebAuthnLogin.tsx:로그인 컴포넌트"
    "src/components/auth/WebAuthnRegister.tsx:회원가입 컴포넌트"
    "src/components/auth/AuthProvider.tsx:인증 컨텍스트"
    "src/components/dashboard/ChatInterface.tsx:채팅 인터페이스"
    "src/components/ui/Button.tsx:버튼 컴포넌트"
    "src/components/ui/Modal.tsx:모달 컴포넌트"
)

ui_completed=0
for file_info in "${ui_files[@]}"; do
    IFS=':' read -r file desc <<< "$file_info"
    if check_file "$file" "$desc"; then
        ui_completed=$((ui_completed + 1))
    fi
done

echo -e "${CYAN}진행률: $(progress_bar $ui_completed ${#ui_files[@]})${NC}"
echo ""

# =============================================================================
# 📊 전체 요약
# =============================================================================

total_files=$((${#webauthn_files[@]} + ${#cue_files[@]} + ${#ui_files[@]}))
total_completed=$((webauthn_completed + cue_completed + ui_completed))

echo -e "${CYAN}================================================================================================${NC}"
echo -e "${WHITE}📊 전체 요약${NC}"
echo -e "${CYAN}================================================================================================${NC}"

echo -e "${WHITE}전체 진행률: $(progress_bar $total_completed $total_files)${NC}"
echo ""

echo -e "${BLUE}섹션별 완료율:${NC}"
echo -e "  🔐 WebAuthn: $webauthn_completed/${#webauthn_files[@]} ($(( webauthn_completed * 100 / ${#webauthn_files[@]} ))%)"
echo -e "  🧠 Cue 시스템: $cue_completed/${#cue_files[@]} ($(( cue_completed * 100 / ${#cue_files[@]} ))%)"
echo -e "  🎨 UI 컴포넌트: $ui_completed/${#ui_files[@]} ($(( ui_completed * 100 / ${#ui_files[@]} ))%)"

# =============================================================================
# 🎯 다음 우선순위
# =============================================================================

echo ""
echo -e "${YELLOW}🎯 다음 우선 작업:${NC}"

if [ $ui_completed -lt ${#ui_files[@]} ]; then
    echo -e "  1️⃣ UI 컴포넌트 완성 (회원가입, 인증 컨텍스트 등)"
fi

if [ $cue_completed -lt ${#cue_files[@]} ]; then
    echo -e "  2️⃣ Cue 시스템 API 완성 (extract, apply API)"
fi

if [ $webauthn_completed -eq ${#webauthn_files[@]} ] && [ $cue_completed -eq ${#cue_files[@]} ] && [ $ui_completed -eq ${#ui_files[@]} ]; then
    echo -e "  🎉 ${GREEN}모든 핵심 기능 완성! 테스트 및 통합 단계로 진행${NC}"
fi

echo ""
echo -e "${GREEN}🚀 실행 명령어:${NC}"
echo -e "  ${CYAN}npm run dev${NC}                 # 개발 서버 시작"
echo -e "  ${CYAN}bash simple_tracker.sh${NC}     # 진행 상황 재확인"
echo -e "  ${CYAN}watch -n 30 'bash simple_tracker.sh'${NC}  # 실시간 모니터링"

# Node.js 버전 경고
if node -v | grep -q "v18"; then
    echo ""
    echo -e "${YELLOW}⚠️  Node.js 버전 업그레이드 권장:${NC}"
    echo -e "   현재: $(node -v)"
    echo -e "   권장: v20.0.0 이상 (WebAuthn 라이브러리 최적화)"
fi

echo ""
echo -e "${CYAN}================================================================================================${NC}"
echo -e "${WHITE}📝 상태 저장됨: $(date)${NC}"
echo -e "${CYAN}================================================================================================${NC}"