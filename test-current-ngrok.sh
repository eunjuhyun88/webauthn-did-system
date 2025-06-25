#!/bin/bash

echo "🧪 현재 Ngrok URL 테스트"
echo "======================"
echo "🌐 URL: https://3c8e-125-142-232-68.ngrok-free.app"
echo ""

# 서버 상태 확인
echo "🔌 로컬 서버 상태 확인:"
for port in 3000 3001; do
    if curl -s http://localhost:$port >/dev/null 2>&1; then
        echo "  ✅ 포트 $port: 실행 중"
    else
        echo "  ❌ 포트 $port: 중지됨"
    fi
done

echo ""

# API 테스트
echo "📡 API 엔드포인트 테스트:"
apis=(
    "/api/system/status:시스템 상태"
    "/api/system/health:헬스체크"
    "/api/passport/update:AI Passport"
    "/api/zauri/chat:Zauri 채팅"
    "/api/zauri/tokens:토큰 관리"
)

for api_info in "${apis[@]}"; do
    IFS=':' read -r endpoint desc <<< "$api_info"
    
    echo "  📍 $desc"
    response=$(curl -s -w "%{http_code}" -o /dev/null "https://3c8e-125-142-232-68.ngrok-free.app$endpoint" 2>/dev/null)
    
    if [ "$response" = "200" ]; then
        echo "    ✅ 성공 (200)"
    elif [ "$response" = "000" ]; then
        echo "    ❌ 연결 실패"
    else
        echo "    ⚠️  응답: $response"
    fi
done

echo ""
echo "🎯 브라우저 테스트 URL들:"
echo "  🏠 홈페이지: https://3c8e-125-142-232-68.ngrok-free.app"
echo "  📊 대시보드: https://3c8e-125-142-232-68.ngrok-free.app/dashboard"
echo "  🔧 시스템 상태: https://3c8e-125-142-232-68.ngrok-free.app/api/system/status"
