#!/bin/bash

echo "🚀 Zauri + AI Passport 의존성 패키지 설치 시작..."

# 기본 Next.js 패키지
npm install next@latest react@latest react-dom@latest typescript@latest

# UI 라이브러리
npm install lucide-react tailwindcss @tailwindcss/typography
npm install class-variance-authority clsx tailwind-merge
npm install framer-motion @headlessui/react react-hot-toast

# 인증 및 보안
npm install jose @simplewebauthn/browser @simplewebauthn/server
npm install crypto-js @types/crypto-js nanoid uuid @types/uuid

# 데이터베이스
npm install @supabase/supabase-js

# AI 서비스
npm install openai @anthropic-ai/sdk @google/generative-ai

# 개발 도구
npm install -D @types/node @types/react @types/react-dom
npm install -D eslint eslint-config-next autoprefixer postcss

echo "✅ 모든 패키지 설치 완료!"
echo "🔄 다음 단계: npm run dev로 개발 서버를 시작하세요."
