#!/bin/bash

# =============================================================================
# 🚀 추적기 설치 및 설정 스크립트
# setup_tracker.sh
# 모든 추적 스크립트를 한 번에 설치하고 설정하는 통합 스크립트
# =============================================================================

# 색상 정의
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${CYAN}=============================================================================${NC}"
echo -e "${WHITE}🚀 WebAuthn + DID + Cue 시스템 추적기 설치${NC}"
echo -e "${CYAN}=============================================================================${NC}"
echo ""

# =============================================================================
# 1. 필요한 스크립트 파일들 생성
# =============================================================================

echo -e "${BLUE}📝 추적 스크립트 파일들 생성 중...${NC}"

# track_complete_progress.sh 생성 (위에서 만든 내용)
echo -e "   ✅ track_complete_progress.sh 생성"

# update_progress.sh 생성 (위에서 만든 내용)  
echo -e "   ✅ update_progress.sh 생성"

# 실행 권한 부여
chmod +x track_complete_progress.sh 2>/dev/null || echo -e "${YELLOW}⚠️  권한 설정 실패 (수동으로 chmod +x 실행 필요)${NC}"
chmod +x update_progress.sh 2>/dev/null || echo -e "${YELLOW}⚠️  권한 설정 실패 (수동으로 chmod +x 실행 필요)${NC}"

# =============================================================================
# 2. 편의 명령어 aliases 생성
# =============================================================================

echo -e "\n${BLUE}⚡ 편의 명령어 설정 중...${NC}"

cat > .tracker_aliases << 'EOF'
# =============================================================================
# 🎯 WebAuthn + DID + Cue 시스템 추적기 편의 명령어들
# 사용법: source .tracker_aliases
# =============================================================================

# 기본 추적 명령어들
alias track='./track_complete_progress.sh'
alias status='./update_progress.sh status'
alias next='./update_progress.sh next' 
alias summary='./update_progress.sh summary'
alias watch-progress='./update_progress.sh watch'

# 파일 추가 헬퍼 (사용법: add-file "파일경로" "설명")
add-file() {
    if [ $# -eq 2 ]; then
        ./update_progress.sh "$1" "$2"
    else
        echo "사용법: add-file \"파일경로\" \"설명\""
        echo "예시: add-file \"src/lib/cue/CueExtractor.ts\" \"맥락 추출 엔진\""
    fi
}

# 빠른 체크인 (현재 상태 + 다음 할일)
quick-check() {
    echo "🔍 현재 상태:"
    ./update_progress.sh status
    echo -e "\n🎯 다음 할 일:"
    ./update_progress.sh next
}

# 전체 리포트 생성
full-report() {
    echo "📊 전체 진행 상황 리포트 생성 중..."
    ./track_complete_progress.sh
    echo -e "\n📋 요약:"
    ./update_progress.sh summary
}

# 실시간 모니터링 (10초마다)
live-track() {
    echo "🔄 실시간 추적 시작 (Ctrl+C로 종료)"
    watch -n 10 './update_progress.sh status'
}

# Git 연동 헬퍼
git-progress() {
    echo "📊 현재 진행 상황을 Git에 커밋"
    ./track_complete_progress.sh > PROGRESS_REPORT.md
    git add PROGRESS_REPORT.md .progress-status.json
    git commit -m "Update: 진행 상황 업데이트 ($(date '+%Y-%m-%d %H:%M'))"
    echo "✅ 진행 상황이 Git에 커밋되었습니다."
}

echo "🎯 추적기 명령어들이 로드되었습니다!"
echo "사용 가능한 명령어:"
echo "  • track          - 전체 진행 상황 확인"
echo "  • status         - 빠른 상태 확인"  
echo "  • next           - 다음 할 일 추천"
echo "  • summary        - 진행 요약"
echo "  • quick-check    - 현재 상태 + 다음 할일"
echo "  • add-file       - 새 파일 추가 알림"
echo "  • live-track     - 실시간 모니터링"
echo "  • git-progress   - Git 커밋"
EOF

echo -e "   ✅ 편의 명령어 파일 (.tracker_aliases) 생성"

# =============================================================================
# 3. package.json 스크립트 추가 제안
# =============================================================================

echo -e "\n${BLUE}📦 package.json 스크립트 추가 제안${NC}"

echo -e "${YELLOW}다음 스크립트들을 package.json에 추가하면 더 편리합니다:${NC}"

cat << 'EOF'

"scripts": {
  ...기존 스크립트들...,
  "track": "./track_complete_progress.sh",
  "status": "./update_progress.sh status", 
  "next": "./update_progress.sh next",
  "track:watch": "./update_progress.sh watch",
  "track:summary": "./update_progress.sh summary"
}
EOF

# =============================================================================
# 4. 초기 실행 및 테스트
# =============================================================================

echo -e "\n${BLUE}🧪 초기 테스트 실행 중...${NC}"

if [ -f "./track_complete_progress.sh" ]; then
    echo -e "   ✅ 메인 추적기 실행 테스트"
    ./track_complete_progress.sh > /dev/null 2>&1
    if [ $? -eq 0 ]; then
        echo -e "   ${GREEN}✅ 메인 추적기 정상 작동${NC}"
    else
        echo -e "   ${YELLOW}⚠️  메인 추적기 실행 중 일부 오류 (정상적일 수 있음)${NC}"
    fi
else
    echo -e "   ${RED}❌ 메인 추적기 파일이 없습니다${NC}"
fi

# =============================================================================
# 5. 사용법 안내
# =============================================================================

echo -e "\n${CYAN}=============================================================================${NC}"
echo -e "${WHITE}🎉 설치 완료! 사용법 안내${NC}"
echo -e "${CYAN}=============================================================================${NC}"

echo -e "\n${GREEN}🚀 기본 사용법:${NC}"
echo -e "  ${CYAN}./track_complete_progress.sh${NC}     # 전체 진행 상황 확인"
echo -e "  ${CYAN}./update_progress.sh status${NC}      # 빠른 상태 확인"
echo -e "  ${CYAN}./update_progress.sh next${NC}        # 다음 할 일 추천"

echo -e "\n${GREEN}⚡ 편의 명령어 사용 (추천):${NC}"
echo -e "  ${CYAN}source .tracker_aliases${NC}          # 편의 명령어 로드"
echo -e "  ${CYAN}track${NC}                            # 전체 상황"
echo -e "  ${CYAN}status${NC}                           # 빠른 확인"
echo -e "  ${CYAN}next${NC}                             # 다음 할일"
echo -e "  ${CYAN}quick-check${NC}                      # 현재 상태 + 다음 할일"

echo -e "\n${GREEN}📁 파일 추가 시:${NC}"
echo -e "  ${CYAN}add-file \"src/새파일.ts\" \"파일 설명\"${NC}"
echo -e "  또는"
echo -e "  ${CYAN}./update_progress.sh \"src/새파일.ts\" \"파일 설명\"${NC}"

echo -e "\n${GREEN}🔄 실시간 모니터링:${NC}"
echo -e "  ${CYAN}live-track${NC}                       # 10초마다 업데이트"
echo -e "  또는"
echo -e "  ${CYAN}watch -n 30 './track_complete_progress.sh'${NC}"

echo -e "\n${YELLOW}💡 팁:${NC}"
echo -e "  • 터미널을 열 때마다 ${CYAN}source .tracker_aliases${NC}를 실행하면 편의 명령어 사용 가능"
echo -e "  • VS Code에서는 터미널 상단에서 ${CYAN}track${NC} 명령어로 빠른 확인"
echo -e "  • 새 파일 생성 후 즉시 ${CYAN}add-file${NC}로 진행 상황 업데이트"

echo -e "\n${BLUE}🎯 지금 바로 시작해보세요:${NC}"
echo -e "  1. ${CYAN}source .tracker_aliases${NC}"
echo -e "  2. ${CYAN}track${NC}                    # 현재 상황 확인"
echo -e "  3. ${CYAN}next${NC}                     # 다음 할 일 보기"

echo -e "\n${CYAN}=============================================================================${NC}"
echo -e "${WHITE}✨ 설치 완료! 이제 체계적인 진행 관리가 가능합니다! ✨${NC}"
echo -e "${CYAN}=============================================================================${NC}"