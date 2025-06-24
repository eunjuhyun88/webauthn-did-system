#!/bin/bash

# =============================================================================
# 🧹 기존 추적기 정리 및 새 추적기 설치
# cleanup_and_install.sh
# 모든 기존 추적 스크립트를 정리하고 새로운 완벽한 추적기를 설치
# =============================================================================

echo "🧹 기존 추적 스크립트 정리 시작..."
echo "=================================="

# 기존 추적 스크립트들을 백업 폴더로 이동
if [ ! -d "backup_trackers" ]; then
    mkdir backup_trackers
    echo "📁 backup_trackers 폴더 생성"
fi

# 기존 스크립트들 백업
scripts_to_backup="stats.sh track_progress.sh track_complete_progress.sh update_progress.sh fixed_tracker.sh master_track.sh master_tracker.sh simple_tracker.sh currentstats.sh monitor.sh watch_files.sh setup_tracker.sh"

for script in $scripts_to_backup; do
    if [ -f "$script" ]; then
        mv "$script" "backup_trackers/"
        echo "📦 $script -> backup_trackers/"
    fi
done

# 기존 설정 파일들도 백업
config_files=".tracker_aliases .progress-status.json .file-status .status.txt .master-progress.json"

for config in $config_files; do
    if [ -f "$config" ]; then
        mv "$config" "backup_trackers/"
        echo "📦 $config -> backup_trackers/"
    fi
done

echo ""
echo "✅ 기존 스크립트 정리 완료"
echo ""

# perfect_tracker.sh가 있는지 확인
if [ ! -f "perfect_tracker.sh" ]; then
    echo "❌ perfect_tracker.sh 파일이 없습니다."
    echo "   먼저 perfect_tracker.sh 파일을 생성해주세요."
    exit 1
fi

# 실행 권한 부여
chmod +x perfect_tracker.sh
echo "✅ perfect_tracker.sh 실행 권한 설정"

# 새로운 편의 명령어 aliases 생성
cat > .aliases << 'EOF'
# =============================================================================
# 🎯 WebAuthn + DID + Cue 시스템 편의 명령어 (완벽한 버전)
# source .aliases 로 로드
# =============================================================================

alias track='bash perfect_tracker.sh'
alias quick='bash perfect_tracker.sh quick'
alias next='bash perfect_tracker.sh next'
alias watch-progress='bash perfect_tracker.sh watch'

# 개발 편의 명령어
alias dev='npm run dev'
alias build='npm run build'
alias test='npm test'

# Git 편의 명령어  
alias git-save='git add . && git commit -m "Progress: $(date +%H:%M)"'
alias git-push='git add . && git commit -m "Update" && git push'

echo "🎉 완벽한 추적기 명령어 로드됨!"
echo ""
echo "📊 사용 가능한 명령어:"
echo "   track       - 전체 진행 상황"
echo "   quick       - 빠른 상태 확인"
echo "   next        - 다음 할 일"
echo "   watch-progress - 실시간 모니터링"
echo ""
echo "🚀 개발 명령어:"
echo "   dev         - npm run dev"
echo "   git-save    - 빠른 Git 커밋"
echo ""
EOF

echo "✅ 새로운 편의 명령어 생성 (.aliases)"

# package.json 스크립트 제안
echo ""
echo "📦 package.json에 추가할 스크립트 제안:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo '"scripts": {'
echo '  "track": "bash perfect_tracker.sh",'
echo '  "track:quick": "bash perfect_tracker.sh quick",'
echo '  "track:next": "bash perfect_tracker.sh next",'
echo '  "track:watch": "bash perfect_tracker.sh watch"'
echo '}'
echo ""

# 첫 실행 테스트
echo "🧪 첫 실행 테스트:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
bash perfect_tracker.sh quick

echo ""
echo "🎉 설치 완료! 이제 다음 명령어들을 사용할 수 있습니다:"
echo ""
echo "📊 진행 상황 확인:"
echo "   bash perfect_tracker.sh          # 전체 상황"
echo "   bash perfect_tracker.sh quick    # 빠른 확인"
echo "   bash perfect_tracker.sh next     # 다음 할 일"
echo ""
echo "🔄 실시간 모니터링:"
echo "   bash perfect_tracker.sh watch    # 30초마다 업데이트"
echo ""
echo "🎯 편의 명령어 로드:"
echo "   source .aliases"
echo ""
echo "✨ 완벽한 추적기가 설치되었습니다!"