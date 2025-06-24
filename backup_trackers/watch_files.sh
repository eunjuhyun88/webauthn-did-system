#!/bin/bash
echo "🔍 파일 변경 감지 시작..."

# fswatch 설치 (Mac)
# brew install fswatch

fswatch -o src/ | while read f; do
  clear
  echo "📝 파일이 변경되었습니다: $(date)"
  ./track_progress.sh
done
