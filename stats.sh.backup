#!/bin/bash

# =============================================================================
# 🔍 WebAuthn DID System 파일 추적 스크립트 (수정됨)
# =============================================================================

# 색상 설정
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# 프로젝트 루트 확인
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ package.json을 찾을 수 없습니다. webauthn-did-system 폴더에서 실행하세요.${NC}"
    exit 1
fi

echo -e "${CYAN}🔍 WebAuthn DID System 파일 추적기${NC}"
echo -e "${CYAN}===========================================${NC}"
echo ""

# 통계 변수 초기화
TOTAL_FILES=0
COMPLETED_FILES=0
MISSING_FILES=0

# 필수 파일 목록 (배열로 정의)
files=(
    # 🔧 설정 & 환경
    ".env.local:환경 변수 설정"
    "src/database/supabase/client.ts:Supabase 클라이언트"
    
    # 🤖 AI 서비스  
    "src/services/ai/index.ts:AI 서비스 통합"
    "src/app/api/ai/chat/route.ts:AI 채팅 API"
    "src/app/api/system/health/route.ts:시스템 상태 API"
    
    # 🔐 WebAuthn 타입 & 유틸
    "src/types/webauthn.ts:WebAuthn 타입 정의"
    "src/auth/webauthn/utils.ts:WebAuthn 유틸리티"
    "src/auth/webauthn/index.ts:WebAuthn 메인 서비스"
    "src/auth/webauthn/client.ts:WebAuthn 클라이언트"
    
    # 🔌 WebAuthn API 라우트
    "src/app/api/webauthn/register/begin/route.ts:등록 시작 API"
    "src/app/api/webauthn/register/complete/route.ts:등록 완료 API"
    "src/app/api/webauthn/authenticate/begin/route.ts:인증 시작 API"
    "src/app/api/webauthn/authenticate/complete/route.ts:인증 완료 API"
    
    # 🆔 DID 시스템
    "src/identity/did/index.ts:DID 메인 서비스"
    "src/identity/did/generator.ts:DID 생성기"
    "src/identity/did/resolver.ts:DID 해결기"
    
    # 🗄️ 데이터베이스
    "src/database/migrations/001_initial_schema.sql:데이터베이스 스키마"
    "src/database/repositories/users.ts:사용자 저장소"
    "src/database/repositories/credentials.ts:인증서 저장소"
    "src/database/repositories/conversations.ts:대화 저장소"
    
    # 🎨 UI 컴포넌트
    "src/components/auth/WebAuthnLogin.tsx:WebAuthn 로그인"
    "src/components/auth/WebAuthnRegister.tsx:WebAuthn 등록"
    "src/components/auth/AuthProvider.tsx:인증 컨텍스트"
    "src/components/dashboard/ChatInterface.tsx:채팅 인터페이스"
    
    # 📱 페이지
    "src/app/page.tsx:메인 홈페이지"
    "src/app/layout.tsx:루트 레이아웃"
    "src/app/(auth)/login/page.tsx:로그인 페이지"
    "src/app/(dashboard)/chat/page.tsx:채팅 페이지"
    
    # 🔗 훅 & 컨텍스트
    "src/lib/hooks/useAuth.ts:인증 훅"
    "src/lib/hooks/useWebAuthn.ts:WebAuthn 훅"
    "src/lib/hooks/useAI.ts:AI 채팅 훅"
    "src/lib/context/AuthContext.tsx:인증 컨텍스트"
    
    # 🔧 설정 & 유틸리티
    "src/lib/config/index.ts:시스템 설정"
    "src/lib/utils/crypto.ts:암호화 유틸리티"
    "src/lib/utils/validation.ts:검증 함수"
    "src/middleware.ts:Next.js 미들웨어"
)

# 총 파일 수 계산
TOTAL_FILES=${#files[@]}

echo -e "${BLUE}📊 파일 상태 검사 중...${NC}"
echo ""

# 파일 존재 여부 확인 및 상태 출력
for item in "${files[@]}"; do
    # ':' 구분자로 파일명과 설명 분리
    file=$(echo "$item" | cut -d':' -f1)
    description=$(echo "$item" | cut -d':' -f2)
    
    if [ -f "$file" ]; then
        # 파일 크기 확인 (실제 내용이 있는지)
        if [ "$(uname)" = "Darwin" ]; then
            # macOS
            size=$(stat -f%z "$file" 2>/dev/null || echo "0")
        else
            # Linux
            size=$(stat -c%s "$file" 2>/dev/null || echo "0")
        fi
        
        if [ "$size" -gt 100 ]; then
            echo -e "${GREEN}✅ $file${NC} - $description (${size} bytes)"
            COMPLETED_FILES=$((COMPLETED_FILES + 1))
        else
            echo -e "${YELLOW}⚠️  $file${NC} - $description (파일이 너무 작음: ${size} bytes)"
            MISSING_FILES=$((MISSING_FILES + 1))
        fi
    else
        echo -e "${RED}❌ $file${NC} - $description (파일 없음)"
        MISSING_FILES=$((MISSING_FILES + 1))
    fi
done

echo ""
echo -e "${CYAN}===========================================${NC}"

# 완료율 계산
if [ $TOTAL_FILES -gt 0 ]; then
    COMPLETION_RATE=$((COMPLETED_FILES * 100 / TOTAL_FILES))
else
    COMPLETION_RATE=0
fi

# 진행 상황 출력
echo -e "${PURPLE}📈 전체 진행 상황${NC}"
echo -e "완료된 파일: ${GREEN}${COMPLETED_FILES}${NC}/${TOTAL_FILES}"
echo -e "누락된 파일: ${RED}${MISSING_FILES}${NC}/${TOTAL_FILES}"
echo -e "완료율: ${GREEN}${COMPLETION_RATE}%${NC}"
echo ""

# 진행 상황 바 생성
PROGRESS_BAR_LENGTH=40
FILLED_LENGTH=$((COMPLETION_RATE * PROGRESS_BAR_LENGTH / 100))
EMPTY_LENGTH=$((PROGRESS_BAR_LENGTH - FILLED_LENGTH))

echo -n "["
for ((i=0; i<FILLED_LENGTH; i++)); do echo -n "█"; done
for ((i=0; i<EMPTY_LENGTH; i++)); do echo -n "░"; done
echo "] ${COMPLETION_RATE}%"
echo ""

# 다음 작업 우선순위 제안
echo -e "${YELLOW}🎯 다음 우선 작업 제안:${NC}"

priority_files=(
    "src/auth/webauthn/client.ts:WebAuthn 클라이언트 함수"
    "src/app/api/webauthn/register/begin/route.ts:등록 시작 API"
    "src/database/migrations/001_initial_schema.sql:데이터베이스 스키마"
    "src/identity/did/generator.ts:DID 생성기"
    "src/components/auth/WebAuthnLogin.tsx:로그인 컴포넌트"
)

counter=1
for item in "${priority_files[@]}"; do
    file=$(echo "$item" | cut -d':' -f1)
    description=$(echo "$item" | cut -d':' -f2)
    
    if [ ! -f "$file" ]; then
        echo -e "${YELLOW}${counter}️⃣ $file - $description${NC}"
        counter=$((counter + 1))
        if [ $counter -gt 3 ]; then
            break
        fi
    fi
done

echo ""

# 개발 서버 상태 확인
echo -e "${BLUE}🔍 개발 환경 상태 확인${NC}"

# Node.js 실행 중인지 확인
if pgrep -f "next.*dev" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Next.js 개발 서버 실행 중${NC}"
else
    echo -e "${RED}❌ Next.js 개발 서버가 실행되지 않음${NC}"
    echo -e "   실행: ${CYAN}npm run dev${NC}"
fi

# ngrok 실행 중인지 확인
if pgrep -f "ngrok" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ ngrok 터널 실행 중${NC}"
else
    echo -e "${YELLOW}⚠️  ngrok 터널이 실행되지 않음 (WebAuthn 테스트 시 필요)${NC}"
    echo -e "   실행: ${CYAN}ngrok http 3000${NC}"
fi

# package.json 의존성 확인
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✅ node_modules 설치됨${NC}"
else
    echo -e "${RED}❌ node_modules가 없음${NC}"
    echo -e "   실행: ${CYAN}npm install${NC}"
fi

echo ""
echo -e "${CYAN}===========================================${NC}"
echo -e "${GREEN}🚀 실행 명령어들:${NC}"
echo ""
echo -e "${CYAN}# 개발 서버 시작${NC}"
echo -e "npm run dev"
echo ""
echo -e "${CYAN}# 별도 터미널에서 ngrok 시작${NC}"
echo -e "ngrok http 3000"
echo ""
echo -e "${CYAN}# API 테스트${NC}"
echo -e "curl http://localhost:3000/api/system/health"
echo ""
echo -e "${CYAN}# 파일 추적기 재실행${NC}"
echo -e "bash stats.sh"
echo ""

# 상태를 파일로 저장
echo "# WebAuthn DID System - 파일 추적 상태" > .file-status
echo "# 마지막 업데이트: $(date)" >> .file-status
echo "완료: ${COMPLETED_FILES}/${TOTAL_FILES} (${COMPLETION_RATE}%)" >> .file-status
echo "누락: ${MISSING_FILES}" >> .file-status
echo "" >> .file-status

for item in "${files[@]}"; do
    file=$(echo "$item" | cut -d':' -f1)
    if [ -f "$file" ]; then
        echo "✅ $file" >> .file-status
    else
        echo "❌ $file" >> .file-status
    fi
done

echo -e "${GREEN}📝 상태가 .file-status 파일에 저장되었습니다.${NC}"

# 실시간 추적을 위한 watch 명령어 안내
echo ""
echo -e "${BLUE}💡 실시간 추적을 원한다면:${NC}"
echo -e "${CYAN}watch -n 30 'bash stats.sh'${NC}"