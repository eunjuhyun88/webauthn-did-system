# =============================================================================
# 🔄 기존 webauthn-did-system 구조에 Fusion AI Dashboard 통합
# =============================================================================

echo "🔍 기존 폴더 구조 분석 완료"
echo "✅ 이미 좋은 구조가 있습니다!"

# 1️⃣ 기존 구조를 기반으로 필요한 폴더만 추가
echo ""
echo "📁 기존 구조 기반 추가 폴더 생성 중..."

# App Router API 경로 (기존 src/api 구조와 병행)
mkdir -p src/app/api/webauthn/{register,authenticate}
mkdir -p src/app/api/webauthn/register/{begin,complete}
mkdir -p src/app/api/webauthn/authenticate/{begin,complete}
mkdir -p src/app/api/did/{resolve,update}
mkdir -p src/app/api/ai/{chat,voice}
mkdir -p src/app/api/user/{profile,settings}
mkdir -p src/app/api/system/health

# Dashboard 페이지 구조
mkdir -p src/app/\(dashboard\)/{chat,profile,knowledge,analytics}
mkdir -p src/app/\(auth\)/{login,register}

# Components 구조 (기존 구조 보완)
mkdir -p src/components/{dashboard,chat,knowledge,profile,ui}
mkdir -p src/components/auth  # webauthn, google은 이미 src/auth에 있음
mkdir -p src/components/dashboard/{stats,charts,widgets,sidebar}
mkdir -p src/components/chat/{messages,input,voice}
mkdir -p src/components/ui/{buttons,forms,modals,notifications,layout}
mkdir -p src/components/profile/{agent,passport,settings}

# 기존 구조 활용을 위한 추가 폴더들
mkdir -p src/services/ai/{openai,anthropic,gemini}
mkdir -p src/services/knowledge
mkdir -p src/services/analytics
mkdir -p src/database/migrations
mkdir -p src/database/seeds

# Utils 및 Hooks
mkdir -p src/lib/{hooks,utils,context}
mkdir -p src/lib/hooks/{auth,ai,knowledge}
mkdir -p src/lib/utils/{crypto,validation,formatting}

echo "✅ 추가 폴더 생성 완료"

# 2️⃣ 필수 패키지 설치
echo ""
echo "📦 필수 패키지 설치 중..."

# AI 서비스 패키지들
npm install openai @anthropic-ai/sdk @google/generative-ai

# Crypto 및 WebAuthn 관련
npm install jose nanoid uuid @types/uuid crypto-js @types/crypto-js

# UI 및 사용자 경험
npm install react-hot-toast framer-motion @headlessui/react lucide-react

# 유틸리티
npm install class-variance-authority clsx tailwind-merge

echo "✅ 패키지 설치 완료"

# 3️⃣ 환경 변수 추가 (기존 .env.local에 병합)
echo ""
echo "🔧 환경 변수 업데이트 중..."


echo "✅ 환경 변수 업데이트 완료"

# 4️⃣ 핵심 설정 파일들 생성
echo ""
echo "📝 핵심 설정 파일 생성 중..."

# 기존 구조에 맞춘 설정 파일들 생성
# src/types에 추가 타입 정의
touch src/types/dashboard.ts
touch src/types/ai.ts
touch src/types/knowledge.ts
touch src/types/analytics.ts

# src/services에 AI 서비스 구현
touch src/services/ai/openai.ts
touch src/services/ai/anthropic.ts
touch src/services/ai/gemini.ts
touch src/services/ai/index.ts

# 데이터베이스 관련
touch src/database/migrations/001_add_dashboard_tables.sql
touch src/database/repositories/aiConversations.ts
touch src/database/repositories/knowledgeGraph.ts

# API 라우트들
touch src/app/api/ai/chat/route.ts
touch src/app/api/system/health/route.ts

echo "✅ 핵심 파일들 생성 완료"

# 5️⃣ 현재 상태 확인
echo ""
echo "📊 현재 프로젝트 상태:"
echo "========================"

echo "📂 총 폴더 수: $(find src -type d | wc -l)"
echo "📄 총 파일 수: $(find src -type f | wc -l)"

echo ""
echo "🔍 주요 구조:"
echo "├── src/"
echo "│   ├── app/                    # Next.js App Router"
echo "│   │   ├── api/               # API Routes (새로 추가)"
echo "│   │   ├── (dashboard)/       # Dashboard 페이지"
echo "│   │   └── (auth)/            # 인증 페이지"
echo "│   ├── components/            # React 컴포넌트"
echo "│   ├── services/              # 비즈니스 로직 (기존 + AI 추가)"
echo "│   ├── database/              # 데이터베이스 관련"
echo "│   ├── auth/                  # 인증 (기존)"
echo "│   ├── identity/              # DID 관련 (기존)"
echo "│   └── types/                 # TypeScript 타입"

echo ""
echo "🎯 다음 단계:"
echo "1. 핵심 설정 파일 구현"
echo "2. AI 서비스 통합 구현"
echo "3. Dashboard 컴포넌트 구현"
echo "4. API 라우트 구현"
echo "5. 데이터베이스 스키마 업데이트"

echo ""
echo "✅ 기존 구조 기반 통합 준비 완료!"