#!/bin/bash

echo "⚡ Zauri + AI Passport 빠른 시작"
echo "==============================="
echo "🌐 Ngrok URL: https://3c8e-125-142-232-68.ngrok-free.app"
echo ""

# 환경 정리
echo "🧹 환경 정리 중..."
pkill -f "next dev" 2>/dev/null || true
rm -rf .next node_modules/.cache 2>/dev/null || true

# 포트 확인 및 정리
for port in 3000 3001; do
    PID=$(lsof -ti:$port 2>/dev/null)
    if [ ! -z "$PID" ]; then
        kill -9 $PID 2>/dev/null || true
        echo "  ✅ 포트 $port 해제됨"
    fi
done

sleep 3

# 서버 시작
echo ""
echo "🚀 개발 서버 시작 중..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "서버가 시작되면 다음 URL로 접속하세요:"
echo "🏠 https://3c8e-125-142-232-68.ngrok-free.app"
echo "📊 https://3c8e-125-142-232-68.ngrok-free.app/dashboard"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 포트 3001로 시작 (ngrok 기본 설정)
PORT=3001 npm run dev
