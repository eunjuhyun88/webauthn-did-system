#!/bin/bash

# =============================================================================
# 🔄 범용 Ngrok URL 업데이트 스크립트
# 언제든지 새로운 ngrok URL로 쉽게 변경할 수 있습니다
# =============================================================================

echo "🔄 Ngrok URL 업데이트 도구"
echo "======================="
echo "📅 $(date '+%Y-%m-%d %H:%M:%S')"
echo ""

# 색상 정의
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

log_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
log_success() { echo -e "${GREEN}✅ $1${NC}"; }
log_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
log_error() { echo -e "${RED}❌ $1${NC}"; }
log_highlight() { echo -e "${PURPLE}🌟 $1${NC}"; }
log_input() { echo -e "${CYAN}📝 $1${NC}"; }

# 1. 현재 설정 확인
show_current_config() {
    log_info "📍 현재 Ngrok 설정 확인 중..."
    
    if [ -f ".env.local" ]; then
        echo ""
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo "🔗 현재 설정된 URL들:"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        
        CURRENT_APP_URL=$(grep "NEXT_PUBLIC_APP_URL" .env.local | cut -d'=' -f2 2>/dev/null || echo "설정되지 않음")
        CURRENT_WEBAUTHN_ID=$(grep "WEBAUTHN_RP_ID" .env.local | cut -d'=' -f2 2>/dev/null || echo "설정되지 않음")
        CURRENT_WEBAUTHN_ORIGIN=$(grep "WEBAUTHN_ORIGIN" .env.local | cut -d'=' -f2 2>/dev/null || echo "설정되지 않음")
        
        echo "📱 APP URL: $CURRENT_APP_URL"
        echo "🔐 WebAuthn ID: $CURRENT_WEBAUTHN_ID"
        echo "🔐 WebAuthn Origin: $CURRENT_WEBAUTHN_ORIGIN"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    else
        log_warning ".env.local 파일이 없습니다"
    fi
    echo ""
}

# 2. 새 URL 입력 받기
get_new_url() {
    echo ""
    log_highlight "📝 새로운 Ngrok URL 입력"
    echo "========================"
    echo ""
    
    # 자동 감지 시도
    log_info "🔍 Ngrok 터널 자동 감지 시도 중..."
    
    # ngrok api로 터널 정보 가져오기 시도
    if command -v curl >/dev/null 2>&1; then
        DETECTED_URL=$(curl -s http://localhost:4040/api/tunnels 2>/dev/null | grep -o 'https://[^"]*\.ngrok[^"]*' | head -1 2>/dev/null || echo "")
        
        if [ ! -z "$DETECTED_URL" ]; then
            echo "🎯 자동 감지된 URL: $DETECTED_URL"
            echo ""
            
            while true; do
                read -p "💡 감지된 URL을 사용하시겠습니까? (y/n): " use_detected
                case $use_detected in
                    [Yy]* ) 
                        NEW_NGROK_URL="$DETECTED_URL"
                        log_success "감지된 URL 사용: $NEW_NGROK_URL"
                        break
                        ;;
                    [Nn]* ) 
                        log_info "수동 입력으로 진행합니다"
                        break
                        ;;
                    * ) 
                        echo "y 또는 n을 입력해주세요."
                        ;;
                esac
            done
        else
            log_warning "자동 감지 실패 (ngrok이 실행되지 않았거나 포트 4040이 닫힘)"
        fi
    fi
    
    # 수동 입력
    if [ -z "$NEW_NGROK_URL" ]; then
        echo ""
        log_input "새로운 Ngrok URL을 입력하세요:"
        echo "예시: https://abc123-12-34-56-78.ngrok-free.app"
        echo "     https://your-subdomain.ngrok.io"
        echo ""
        
        while true; do
            read -p "🌐 새 Ngrok URL: " input_url
            
            # URL 유효성 검사
            if [[ $input_url =~ ^https://.*\.ngrok.*$ ]]; then
                NEW_NGROK_URL="$input_url"
                log_success "유효한 URL입니다: $NEW_NGROK_URL"
                break
            elif [[ $input_url =~ ^http://.*\.ngrok.*$ ]]; then
                log_warning "HTTP URL은 WebAuthn과 호환되지 않습니다"
                read -p "HTTPS로 변경하시겠습니까? (y/n): " convert_https
                if [[ $convert_https =~ ^[Yy] ]]; then
                    NEW_NGROK_URL="${input_url/http:/https:}"
                    log_success "HTTPS로 변경됨: $NEW_NGROK_URL"
                    break
                fi
            elif [ -z "$input_url" ]; then
                log_error "URL을 입력해주세요"
            else
                log_error "올바른 ngrok URL 형식이 아닙니다"
                echo "형식: https://subdomain.ngrok-free.app 또는 https://subdomain.ngrok.io"
            fi
        done
    fi
    
    # 도메인 추출
    NEW_NGROK_DOMAIN=$(echo $NEW_NGROK_URL | sed 's|https://||' | sed 's|http://||' | sed 's|/.*||')
    
    echo ""
    log_success "설정될 정보:"
    echo "  🌐 URL: $NEW_NGROK_URL"
    echo "  🏠 도메인: $NEW_NGROK_DOMAIN"
}

# 3. 변경 사항 미리보기
show_preview() {
    echo ""
    log_highlight "🔍 변경 사항 미리보기"
    echo "==================="
    echo ""
    
    echo "┌─────────────────────────────────────────────────────────────┐"
    echo "│                        변경 전 → 변경 후                      │"
    echo "├─────────────────────────────────────────────────────────────┤"
    
    if [ -f ".env.local" ]; then
        OLD_APP_URL=$(grep "NEXT_PUBLIC_APP_URL" .env.local | cut -d'=' -f2 2>/dev/null || echo "설정되지 않음")
        OLD_WEBAUTHN_ID=$(grep "WEBAUTHN_RP_ID" .env.local | cut -d'=' -f2 2>/dev/null || echo "설정되지 않음")
        
        printf "│ %-25s │ %-30s │\n" "APP_URL" "${OLD_APP_URL:0:29}..."
        printf "│ %-25s │ %-30s │\n" "→ 새 URL" "${NEW_NGROK_URL:0:29}..."
        echo "├─────────────────────────────────────────────────────────────┤"
        printf "│ %-25s │ %-30s │\n" "WEBAUTHN_RP_ID" "${OLD_WEBAUTHN_ID:0:29}..."
        printf "│ %-25s │ %-30s │\n" "→ 새 도메인" "${NEW_NGROK_DOMAIN:0:29}..."
    else
        printf "│ %-25s │ %-30s │\n" "새로 생성" "${NEW_NGROK_URL:0:29}..."
    fi
    
    echo "└─────────────────────────────────────────────────────────────┘"
    echo ""
    
    while true; do
        read -p "🤔 변경을 진행하시겠습니까? (y/n): " confirm
        case $confirm in
            [Yy]* ) 
                log_success "변경을 진행합니다!"
                break
                ;;
            [Nn]* ) 
                log_warning "변경이 취소되었습니다"
                exit 0
                ;;
            * ) 
                echo "y 또는 n을 입력해주세요."
                ;;
        esac
    done
}

# 4. 백업 생성
create_backup() {
    log_info "💾 설정 파일 백업 생성 중..."
    
    BACKUP_DIR="./backups"
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    
    mkdir -p "$BACKUP_DIR"
    
    if [ -f ".env.local" ]; then
        cp .env.local "$BACKUP_DIR/.env.local.backup.$TIMESTAMP"
        log_success "백업 생성: $BACKUP_DIR/.env.local.backup.$TIMESTAMP"
    fi
    
    if [ -f "next.config.js" ]; then
        cp next.config.js "$BACKUP_DIR/next.config.js.backup.$TIMESTAMP"
        log_success "백업 생성: $BACKUP_DIR/next.config.js.backup.$TIMESTAMP"
    fi
}

# 5. 환경 변수 업데이트
update_env_variables() {
    log_info "🔧 환경 변수 업데이트 중..."
    
    # .env.local이 없으면 생성
    if [ ! -f ".env.local" ]; then
        log_info "새 .env.local 파일 생성 중..."
        touch .env.local
    fi
    
    # 각 설정 업데이트 (없으면 추가, 있으면 수정)
    update_env_var "NEXT_PUBLIC_APP_URL" "$NEW_NGROK_URL"
    update_env_var "NGROK_TUNNEL_URL" "$NEW_NGROK_URL"
    update_env_var "WEBAUTHN_RP_ID" "$NEW_NGROK_DOMAIN"
    update_env_var "WEBAUTHN_ORIGIN" "$NEW_NGROK_URL"
    update_env_var "DID_RESOLVER_URL" "$NEW_NGROK_URL"
    
    # Ngrok 관련 추가 설정
    update_env_var "NEXT_PUBLIC_IS_NGROK" "true"
    update_env_var "NEXT_PUBLIC_NGROK_DOMAIN" "$NEW_NGROK_DOMAIN"
    
    log_success "환경 변수 업데이트 완료"
}

# 환경 변수 업데이트 헬퍼 함수
update_env_var() {
    local key="$1"
    local value="$2"
    
    if grep -q "^$key=" .env.local; then
        # 기존 값 수정 (macOS/Linux 호환)
        if [[ "$OSTYPE" == "darwin"* ]]; then
            sed -i '' "s|^$key=.*|$key=$value|" .env.local
        else
            sed -i "s|^$key=.*|$key=$value|" .env.local
        fi
        echo "  ✅ 수정: $key=$value"
    else
        # 새 값 추가
        echo "$key=$value" >> .env.local
        echo "  ✅ 추가: $key=$value"
    fi
}

# 6. Next.js 설정 업데이트
update_nextjs_config() {
    log_info "⚙️ Next.js 설정 업데이트 중..."
    
    cat > next.config.js << EOF
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ngrok 환경 최적화
  experimental: {
    serverActions: {
      allowedOrigins: [
        'localhost:3000',
        'localhost:3001', 
        '*.ngrok-free.app',
        '*.ngrok.io',
        '$NEW_NGROK_DOMAIN'
      ]
    }
  },
  
  // HTTPS 및 CORS 헤더
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          }
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
        ],
      },
    ];
  },
  
  // Ngrok 호환성
  poweredByHeader: false,
  compress: true,
  
  // 개발 환경 설정
  ...(process.env.NODE_ENV === 'development' && {
    reactStrictMode: false,
  })
};

module.exports = nextConfig;
EOF

    log_success "Next.js 설정 업데이트 완료"
}

# 7. 캐시 정리 및 재시작 준비
prepare_restart() {
    log_info "🧹 캐시 정리 및 재시작 준비 중..."
    
    # 프로세스 정리
    pkill -f "next dev" 2>/dev/null || true
    sleep 2
    
    # 캐시 정리
    rm -rf .next 2>/dev/null || true
    rm -rf node_modules/.cache 2>/dev/null || true
    
    log_success "재시작 준비 완료"
}

# 8. 테스트 스크립트 생성
create_test_script() {
    log_info "🧪 새 URL용 테스트 스크립트 생성 중..."
    
    cat > test-current-ngrok.sh << EOF
#!/bin/bash

echo "🧪 현재 Ngrok URL 테스트"
echo "======================"
echo "🌐 URL: $NEW_NGROK_URL"
echo ""

# 서버 상태 확인
echo "🔌 로컬 서버 상태 확인:"
for port in 3000 3001; do
    if curl -s http://localhost:\$port >/dev/null 2>&1; then
        echo "  ✅ 포트 \$port: 실행 중"
    else
        echo "  ❌ 포트 \$port: 중지됨"
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

for api_info in "\${apis[@]}"; do
    IFS=':' read -r endpoint desc <<< "\$api_info"
    
    echo "  📍 \$desc"
    response=\$(curl -s -w "%{http_code}" -o /dev/null "$NEW_NGROK_URL\$endpoint" 2>/dev/null)
    
    if [ "\$response" = "200" ]; then
        echo "    ✅ 성공 (200)"
    elif [ "\$response" = "000" ]; then
        echo "    ❌ 연결 실패"
    else
        echo "    ⚠️  응답: \$response"
    fi
done

echo ""
echo "🎯 브라우저 테스트 URL들:"
echo "  🏠 홈페이지: $NEW_NGROK_URL"
echo "  📊 대시보드: $NEW_NGROK_URL/dashboard"
echo "  🔧 시스템 상태: $NEW_NGROK_URL/api/system/status"
EOF

    chmod +x test-current-ngrok.sh
    
    log_success "테스트 스크립트 생성: ./test-current-ngrok.sh"
}

# 9. 빠른 시작 스크립트 생성
create_quick_start() {
    log_info "⚡ 빠른 시작 스크립트 생성 중..."
    
    cat > start-with-current-ngrok.sh << EOF
#!/bin/bash

echo "⚡ Zauri + AI Passport 빠른 시작"
echo "==============================="
echo "🌐 Ngrok URL: $NEW_NGROK_URL"
echo ""

# 환경 정리
echo "🧹 환경 정리 중..."
pkill -f "next dev" 2>/dev/null || true
rm -rf .next node_modules/.cache 2>/dev/null || true

# 포트 확인 및 정리
for port in 3000 3001; do
    PID=\$(lsof -ti:\$port 2>/dev/null)
    if [ ! -z "\$PID" ]; then
        kill -9 \$PID 2>/dev/null || true
        echo "  ✅ 포트 \$port 해제됨"
    fi
done

sleep 3

# 서버 시작
echo ""
echo "🚀 개발 서버 시작 중..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "서버가 시작되면 다음 URL로 접속하세요:"
echo "🏠 $NEW_NGROK_URL"
echo "📊 $NEW_NGROK_URL/dashboard"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 포트 3001로 시작 (ngrok 기본 설정)
PORT=3001 npm run dev
EOF

    chmod +x start-with-current-ngrok.sh
    
    log_success "빠른 시작 스크립트 생성: ./start-with-current-ngrok.sh"
}

# 10. 완료 요약 및 다음 단계
show_completion() {
    echo ""
    echo "🎉 Ngrok URL 업데이트 완료!"
    echo "=========================="
    echo ""
    
    log_success "✅ 완료된 작업:"
    echo "  💾 설정 파일 백업 생성"
    echo "  🔧 환경 변수 업데이트"
    echo "  ⚙️ Next.js 설정 업데이트"  
    echo "  🧹 캐시 정리"
    echo "  🧪 테스트 스크립트 생성"
    echo "  ⚡ 빠른 시작 스크립트 생성"
    echo ""
    
    echo "🌐 새로 설정된 URL:"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "  📍 메인 URL: $NEW_NGROK_URL"
    echo "  🔐 WebAuthn 도메인: $NEW_NGROK_DOMAIN"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    
    log_highlight "🚀 다음 단계 (선택):"
    echo ""
    echo "1️⃣ 빠른 시작:"
    echo "   ./start-with-current-ngrok.sh"
    echo ""
    echo "2️⃣ 일반 시작:"
    echo "   PORT=3001 npm run dev"
    echo ""
    echo "3️⃣ 테스트 먼저:"
    echo "   ./test-current-ngrok.sh"
    echo "   PORT=3001 npm run dev"
    echo ""
    
    log_info "💡 팁:"
    echo "  • 이 스크립트를 다시 실행하면 언제든지 URL을 변경할 수 있습니다"
    echo "  • 백업 파일들은 ./backups/ 폴더에 저장됩니다"
    echo "  • WebAuthn은 새 도메인에서 다시 등록이 필요할 수 있습니다"
    echo ""
    
    echo "🎯 새 URL로 완전한 Zauri + AI Passport 시스템을 체험하세요!"
}

# 11. 메뉴 기반 실행 옵션
show_menu() {
    while true; do
        echo ""
        log_highlight "🔄 Ngrok URL 업데이트 도구"
        echo "========================="
        echo ""
        echo "다음 중 원하는 작업을 선택하세요:"
        echo ""
        echo "1) 🆕 새 Ngrok URL로 변경"
        echo "2) 📍 현재 설정 확인"
        echo "3) 🔍 Ngrok 터널 자동 감지"
        echo "4) 💾 설정 백업만 생성"
        echo "5) ❌ 종료"
        echo ""
        
        read -p "선택 (1-5): " choice
        
        case $choice in
            1)
                log_info "새 URL 변경을 시작합니다..."
                break
                ;;
            2)
                show_current_config
                ;;
            3)
                if command -v curl >/dev/null 2>&1; then
                    DETECTED=$(curl -s http://localhost:4040/api/tunnels 2>/dev/null | grep -o 'https://[^"]*\.ngrok[^"]*' | head -1 2>/dev/null || echo "")
                    if [ ! -z "$DETECTED" ]; then
                        echo "🎯 감지된 URL: $DETECTED"
                    else
                        log_warning "감지된 URL이 없습니다 (ngrok이 실행되지 않았을 수 있음)"
                    fi
                else
                    log_error "curl이 설치되지 않았습니다"
                fi
                ;;
            4)
                create_backup
                ;;
            5)
                log_info "프로그램을 종료합니다"
                exit 0
                ;;
            *)
                log_error "올바른 번호를 선택해주세요 (1-5)"
                ;;
        esac
    done
}

# 메인 실행 함수
main() {
    # 인자가 있으면 바로 실행, 없으면 메뉴 표시
    if [ $# -eq 0 ]; then
        show_menu
    fi
    
    show_current_config
    get_new_url
    show_preview
    create_backup
    update_env_variables
    update_nextjs_config
    prepare_restart
    create_test_script
    create_quick_start
    show_completion
}

# 스크립트 실행
main "$@"