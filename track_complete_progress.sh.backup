#!/bin/bash

# =============================================================================
# 🎯 완전한 파일 추적기 - 원본 리스트 기반
# track_complete_progress.sh
# 처음에 제시한 전체 파일 리스트를 기반으로 정확한 진행 상황 추적
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

# 진행률 바 생성 함수
create_progress_bar() {
    local progress=$1
    local total=50
    local filled=$((progress * total / 100))
    local empty=$((total - filled))
    
    printf "["
    printf "%*s" $filled | tr ' ' '█'
    printf "%*s" $empty | tr ' ' '░'
    printf "] %d%%" $progress
}

echo -e "${CYAN}=============================================================================${NC}"
echo -e "${WHITE}🎯 WebAuthn + DID + Cue 시스템 완전 추적기${NC}"
echo -e "${CYAN}=============================================================================${NC}"
echo -e "${BLUE}📅 $(date '+%Y-%m-%d %H:%M:%S')${NC}"
echo ""

# =============================================================================
# 📋 원본 파일 리스트 정의 (처음에 제시한 것 기반)
# =============================================================================

declare -A CORE_CONFIG_FILES=(
    ["src/lib/config/index.ts"]="전체 시스템 설정"
    ["src/lib/utils/crypto.ts"]="암호화 유틸리티"
    ["src/lib/utils/validation.ts"]="입력 검증 함수들"
    ["src/types/webauthn.ts"]="WebAuthn 타입 정의"
    ["src/types/did.ts"]="DID 타입 정의"
    ["src/types/user.ts"]="사용자 타입 정의"
)

declare -A WEBAUTHN_FILES=(
    ["src/auth/webauthn/index.ts"]="WebAuthn 메인 서비스"
    ["src/auth/webauthn/utils.ts"]="WebAuthn 유틸리티"
    ["src/auth/webauthn/client.ts"]="클라이언트 WebAuthn 함수"
    ["src/app/api/webauthn/register/begin/route.ts"]="등록 시작 API"
    ["src/app/api/webauthn/register/complete/route.ts"]="등록 완료 API"
    ["src/app/api/webauthn/authenticate/begin/route.ts"]="인증 시작 API"
    ["src/app/api/webauthn/authenticate/complete/route.ts"]="인증 완료 API"
)

declare -A DID_SYSTEM_FILES=(
    ["src/identity/did/index.ts"]="DID 메인 서비스"
    ["src/identity/did/generator.ts"]="DID 생성기"
    ["src/identity/did/resolver.ts"]="DID 해결기"
    ["src/app/api/did/create/route.ts"]="DID 생성 API"
    ["src/app/api/did/resolve/[did]/route.ts"]="DID 조회 API"
    ["src/app/api/did/update/route.ts"]="DID 업데이트 API"
)

declare -A DATABASE_FILES=(
    ["src/database/supabase/client.ts"]="Supabase 클라이언트"
    ["src/database/migrations/001_initial_schema.sql"]="초기 스키마"
    ["src/database/repositories/users.ts"]="사용자 저장소"
    ["src/database/repositories/credentials.ts"]="인증서 저장소"
    ["src/database/repositories/conversations.ts"]="대화 저장소"
    ["src/database/repositories/did.ts"]="DID 저장소"
)

declare -A UI_COMPONENTS=(
    ["src/components/auth/WebAuthnLogin.tsx"]="WebAuthn 로그인 컴포넌트"
    ["src/components/auth/WebAuthnRegister.tsx"]="WebAuthn 등록 컴포넌트"
    ["src/components/auth/AuthProvider.tsx"]="인증 컨텍스트"
    ["src/components/dashboard/ChatInterface.tsx"]="채팅 인터페이스"
    ["src/components/dashboard/UserProfile.tsx"]="사용자 프로필"
    ["src/components/dashboard/DIDManager.tsx"]="DID 관리 컴포넌트"
    ["src/components/ui/Button.tsx"]="버튼 컴포넌트"
    ["src/components/ui/Modal.tsx"]="모달 컴포넌트"
    ["src/components/ui/Toast.tsx"]="토스트 알림"
)

declare -A PAGE_FILES=(
    ["src/app/page.tsx"]="메인 홈페이지"
    ["src/app/layout.tsx"]="루트 레이아웃"
    ["src/app/(auth)/login/page.tsx"]="로그인 페이지"
    ["src/app/(auth)/register/page.tsx"]="회원가입 페이지"
    ["src/app/(dashboard)/chat/page.tsx"]="채팅 페이지"
    ["src/app/(dashboard)/profile/page.tsx"]="프로필 페이지"
    ["src/app/(dashboard)/settings/page.tsx"]="설정 페이지"
)

declare -A HOOKS_CONTEXT=(
    ["src/lib/hooks/useAuth.ts"]="인증 훅"
    ["src/lib/hooks/useWebAuthn.ts"]="WebAuthn 훅"
    ["src/lib/hooks/useAI.ts"]="AI 채팅 훅"
    ["src/lib/hooks/useDID.ts"]="DID 관리 훅"
    ["src/lib/context/AuthContext.tsx"]="인증 컨텍스트"
    ["src/lib/context/AIContext.tsx"]="AI 컨텍스트"
)

declare -A MIDDLEWARE_SECURITY=(
    ["src/middleware.ts"]="Next.js 미들웨어"
    ["src/lib/auth/jwt.ts"]="JWT 토큰 관리"
    ["src/lib/auth/session.ts"]="세션 관리"
    ["src/lib/security/rateLimit.ts"]="Rate Limiting"
    ["src/lib/security/encryption.ts"]="암호화 함수"
)

declare -A API_ROUTES=(
    ["src/app/api/auth/login/route.ts"]="일반 로그인 API"
    ["src/app/api/auth/logout/route.ts"]="로그아웃 API"
    ["src/app/api/auth/refresh/route.ts"]="토큰 갱신 API"
    ["src/app/api/user/profile/route.ts"]="사용자 프로필 API"
    ["src/app/api/conversations/route.ts"]="대화 목록 API"
    ["src/app/api/system/health/route.ts"]="시스템 상태 API"
)

# 🧠 Cue 시스템 파일들 (새로 추가)
declare -A CUE_SYSTEM_FILES=(
    ["src/lib/cue/CueExtractor.ts"]="맥락 추출 엔진"
    ["src/lib/cue/PlatformSyncManager.ts"]="플랫폼 간 동기화"
    ["src/lib/cue/CueApplicationEngine.ts"]="Cue 적용 엔진"
    ["src/types/cue.ts"]="Cue 시스템 타입"
    ["src/components/cue/CueManager.tsx"]="Cue 관리 컴포넌트"
    ["src/components/cue/CueInsights.tsx"]="Cue 인사이트"
    ["src/app/api/cue/extract/route.ts"]="Cue 추출 API"
    ["src/app/api/cue/apply/route.ts"]="Cue 적용 API"
)

# =============================================================================
# 📊 파일 상태 확인 함수
# =============================================================================

check_file_status() {
    local file_path=$1
    local description=$2
    
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

# 섹션별 상태 확인 함수
check_section() {
    local section_name=$1
    local -n files_ref=$2
    local completed=0
    local total=0
    
    echo -e "\n${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${WHITE}📂 $section_name${NC}"
    echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    
    for file_path in "${!files_ref[@]}"; do
        description="${files_ref[$file_path]}"
        total=$((total + 1))
        
        if check_file_status "$file_path" "$description"; then
            completed=$((completed + 1))
        fi
    done
    
    local percentage=$((completed * 100 / total))
    echo -e "\n${CYAN}📊 $section_name 진행률: $completed/$total $(create_progress_bar $percentage)${NC}"
    
    # 전역 카운터 업데이트
    TOTAL_COMPLETED=$((TOTAL_COMPLETED + completed))
    TOTAL_FILES=$((TOTAL_FILES + total))
    
    return $percentage
}

# =============================================================================
# 📈 메인 실행
# =============================================================================

TOTAL_COMPLETED=0
TOTAL_FILES=0

# 각 섹션별 확인
check_section "🔧 핵심 설정 & 유틸리티" CORE_CONFIG_FILES
CORE_PROGRESS=$?

check_section "🔐 WebAuthn 완전 구현" WEBAUTHN_FILES
WEBAUTHN_PROGRESS=$?

check_section "🆔 DID 시스템" DID_SYSTEM_FILES
DID_PROGRESS=$?

check_section "🗄️ 데이터베이스 레이어" DATABASE_FILES
DB_PROGRESS=$?

check_section "🎨 UI 컴포넌트들" UI_COMPONENTS
UI_PROGRESS=$?

check_section "📱 페이지들" PAGE_FILES
PAGES_PROGRESS=$?

check_section "🔗 훅(Hooks) & 컨텍스트" HOOKS_CONTEXT
HOOKS_PROGRESS=$?

check_section "🔧 미들웨어 & 보안" MIDDLEWARE_SECURITY
MIDDLEWARE_PROGRESS=$?

check_section "📊 추가 API 라우트들" API_ROUTES
API_PROGRESS=$?

check_section "🧠 Cue 시스템 (핵심!)" CUE_SYSTEM_FILES
CUE_PROGRESS=$?

# =============================================================================
# 📊 전체 요약
# =============================================================================

echo -e "\n${CYAN}=============================================================================${NC}"
echo -e "${WHITE}📈 전체 진행 상황 요약${NC}"
echo -e "${CYAN}=============================================================================${NC}"

OVERALL_PERCENTAGE=$((TOTAL_COMPLETED * 100 / TOTAL_FILES))

echo -e "${WHITE}완료된 파일: ${GREEN}$TOTAL_COMPLETED${NC}${WHITE}/$TOTAL_FILES${NC}"
echo -e "${WHITE}전체 완료율: $(create_progress_bar $OVERALL_PERCENTAGE)${NC}"
echo ""

# 섹션별 요약
echo -e "${BLUE}📊 섹션별 완료율:${NC}"
echo -e "  🔧 핵심 설정: $(create_progress_bar $CORE_PROGRESS)"
echo -e "  🔐 WebAuthn: $(create_progress_bar $WEBAUTHN_PROGRESS)"
echo -e "  🆔 DID 시스템: $(create_progress_bar $DID_PROGRESS)"
echo -e "  🗄️ 데이터베이스: $(create_progress_bar $DB_PROGRESS)"
echo -e "  🎨 UI 컴포넌트: $(create_progress_bar $UI_PROGRESS)"
echo -e "  📱 페이지들: $(create_progress_bar $PAGES_PROGRESS)"
echo -e "  🔗 훅 & 컨텍스트: $(create_progress_bar $HOOKS_PROGRESS)"
echo -e "  🔧 미들웨어: $(create_progress_bar $MIDDLEWARE_PROGRESS)"
echo -e "  📊 API 라우트: $(create_progress_bar $API_PROGRESS)"
echo -e "  🧠 Cue 시스템: $(create_progress_bar $CUE_PROGRESS)"

# =============================================================================
# 🎯 다음 우선순위 제안
# =============================================================================

echo -e "\n${YELLOW}🎯 다음 우선 작업 제안:${NC}"

# 가장 낮은 완료율 섹션들 찾기
declare -a priorities
if [ $CUE_PROGRESS -lt 50 ]; then
    priorities+=("🧠 Cue 시스템 완성 (시스템의 핵심!)")
fi
if [ $WEBAUTHN_PROGRESS -lt 80 ]; then
    priorities+=("🔐 WebAuthn 인증 API 완성")
fi
if [ $UI_PROGRESS -lt 30 ]; then
    priorities+=("🎨 UI 컴포넌트 생성")
fi
if [ $HOOKS_PROGRESS -lt 20 ]; then
    priorities+=("🔗 React 훅 및 컨텍스트")
fi

counter=1
for priority in "${priorities[@]}"; do
    echo -e "  ${counter}️⃣ $priority"
    counter=$((counter + 1))
done

if [ ${#priorities[@]} -eq 0 ]; then
    echo -e "  🎉 ${GREEN}모든 핵심 기능이 완성되었습니다!${NC}"
fi

# =============================================================================
# 📝 실행 명령어 제안
# =============================================================================

echo -e "\n${BLUE}🚀 추천 실행 명령어들:${NC}"
echo -e "  ${CYAN}# 실시간 추적${NC}"
echo -e "  watch -n 30 './track_complete_progress.sh'"
echo -e ""
echo -e "  ${CYAN}# 개발 서버 시작${NC}"
echo -e "  npm run dev"
echo -e ""
echo -e "  ${CYAN}# 타입 체크${NC}"
echo -e "  npm run type-check"
echo -e ""
echo -e "  ${CYAN}# 빌드 테스트${NC}"
echo -e "  npm run build"

# =============================================================================
# 💾 상태 저장
# =============================================================================

# 결과를 JSON 파일로 저장
cat > .progress-status.json << EOF
{
  "timestamp": "$(date -Iseconds)",
  "totalFiles": $TOTAL_FILES,
  "completedFiles": $TOTAL_COMPLETED,
  "overallProgress": $OVERALL_PERCENTAGE,
  "sections": {
    "core": $CORE_PROGRESS,
    "webauthn": $WEBAUTHN_PROGRESS,
    "did": $DID_PROGRESS,
    "database": $DB_PROGRESS,
    "ui": $UI_PROGRESS,
    "pages": $PAGES_PROGRESS,
    "hooks": $HOOKS_PROGRESS,
    "middleware": $MIDDLEWARE_PROGRESS,
    "api": $API_PROGRESS,
    "cue": $CUE_PROGRESS
  }
}
EOF

echo -e "\n${GREEN}💾 진행 상황이 .progress-status.json 파일에 저장되었습니다.${NC}"

echo -e "\n${CYAN}=============================================================================${NC}"
echo -e "${WHITE}🎯 추적 완료! 실시간 모니터링을 원하면: ${YELLOW}watch -n 30 './track_complete_progress.sh'${NC}"
echo -e "${CYAN}=============================================================================${NC}"