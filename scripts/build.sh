#!/bin/bash
echo "🏗️ 프로젝트 빌드 시작"

# 1. 타입 체크
echo "🔍 타입 체크 실행 중..."
npm run type-check

# 2. 패키지 빌드
echo "📦 패키지 빌드 중..."
npm run build:packages

# 3. 웹앱 빌드
echo "🌐 웹앱 빌드 중..."
npm run build:web

# 4. API 서버 빌드
echo "🔌 API 서버 빌드 중..."
npm run build:api

echo "✅ 빌드 완료"
