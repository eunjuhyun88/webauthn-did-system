#!/bin/bash

echo "📦 필요한 패키지 설치 중..."

# React 및 Next.js 관련
npm install react@latest react-dom@latest next@latest

# TypeScript
npm install -D typescript @types/react @types/react-dom @types/node

# UI 라이브러리
npm install lucide-react @headlessui/react framer-motion

# 상태 관리 및 유틸리티
npm install zustand class-variance-authority clsx tailwind-merge

# 인증 및 보안
npm install @simplewebauthn/browser @simplewebauthn/server
npm install jose nanoid uuid @types/uuid

# AI 서비스
npm install openai @anthropic-ai/sdk @google/generative-ai

# 개발 도구
npm install -D tailwindcss postcss autoprefixer
npm install -D eslint eslint-config-next

echo "✅ 패키지 설치 완료!"
echo "🔄 다음으로 'npm run dev'를 실행하세요."
