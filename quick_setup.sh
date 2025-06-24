#!/bin/bash

# =============================================================================
# ⚡ 추적기 빠른 설정 스크립트
# quick_setup.sh
# 모든 추적 스크립트를 정리하고 마스터 추적기로 통일
# =============================================================================

echo "🚀 WebAuthn + DID + Cue 시스템 추적기 설정 중..."

# 기존 추적 스크립트들 정리
echo "📁 기존 스크립트 정리..."
if [ -f "track_progress.sh" ]; then
    mv track_progress.sh track_progress.sh.backup
    echo "   track_progress.sh -> track_progress.sh.backup"
fi

if [ -f "stats.sh" ]; then
    mv stats.sh stats.sh.backup
    echo "   stats.sh -> stats.sh.backup"
fi

if [ -f "track_complete_progress.sh" ]; then
    mv track_complete_progress.sh track_complete_progress.sh.backup
    echo "   track_complete_progress.sh -> track_complete_progress.sh.backup"
fi

if [ -f "update_progress.sh" ]; then
    mv update_progress.sh update_progress.sh.backup
    echo "   update_progress.sh -> update_progress.sh.backup"
fi

# master_tracker.sh 실행 권한 부여
if [ -f "master_tracker.sh" ]; then
    chmod +x master_tracker.sh
    echo "✅ master_tracker.sh 실행 권한 설정 완료"
else
    echo "❌ master_tracker.sh 파일이 필요합니다. 먼저 생성해주세요."
    exit 1
fi

# 편의 명령어 aliases 생성
cat > .tracker_aliases << 'EOF'
# =============================================================================
# 🎯 WebAuthn + DID + Cue 시스템 편의 명령어
# source .tracker_aliases 로 로드
# =============================================================================

alias track='./master_tracker.sh'
alias quick='./master_tracker.sh quick'
alias next='./master_tracker.sh next'
alias watch-progress='./master_tracker.sh watch'
alias add-file='./master_tracker.sh add'

# 개발 편의 명령어
alias dev='npm run dev'
alias build='npm run build'
alias test='npm test'

# Git 편의 명령어  
alias git-progress='git add . && git commit -m "Progress update: $(date +%H:%M)"'
alias git-quick='git add . && git commit -m "Quick update"'

echo "🎉 추적기 편의 명령어 로드됨!"
echo "   track       - 전체 진행 상황"
echo "   quick       - 빠른 상태 확인"
echo "   next        - 다음 할 일"
echo "   watch-progress - 실시간 모니터링"
echo "   add-file    - 새 파일 추가 알림"
EOF

# package.json에 스크립트 추가 제안
echo ""
echo "📦 package.json 스크립트 추가 제안:"
echo "   아래 내용을 package.json의 scripts에 추가하세요:"
echo ""
echo '  "scripts": {'
echo '    "track": "bash master_tracker.sh",'
echo '    "track:quick": "bash master_tracker.sh quick",'
echo '    "track:next": "bash master_tracker.sh next",'
echo '    "track:watch": "bash master_tracker.sh watch"'
echo '  }'

# 첫 실행
echo ""
echo "🎯 설정 완료! 첫 실행 테스트:"
echo ""
source .tracker_aliases
./master_tracker.sh quick

echo ""
echo "✅ 설정 완료! 이제 다음 명령어들을 사용할 수 있습니다:"
echo ""
echo "📊 진행 상황 확인:"
echo "   track              # 전체 상황"
echo "   quick              # 빠른 확인"
echo "   next               # 다음 할 일"
echo ""
echo "🔄 실시간 모니터링:"
echo "   watch-progress     # 30초마다 업데이트"
echo ""
echo "📝 파일 추가 알림:"
echo "   add-file 'src/path/file.ts' '설명'"
echo ""
echo "🎯 편의 명령어 로드:"
echo "   source .tracker_aliases"
echo ""
echo "🚀 개발 서버 시작:"
echo "   dev"