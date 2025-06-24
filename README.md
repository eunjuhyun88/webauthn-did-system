# 🔐 WebAuthn + DID + DB 연동 시스템

4-Layer 아키텍처 기반의 WebAuthn 인증, DID 생성, 데이터베이스 연동 시스템

## 🚀 빠른 시작

### 1. 환경 설정
```bash
# 프로젝트 클론 후
npm install
cp .env.local.example .env.local
# .env.local 파일에서 API 키들 설정
```

### 2. 개발 서버 실행
```bash
# 개발 서버 시작
npm run dev

# ngrok 터널 시작 (별도 터미널)
ngrok http 3000
```

### 3. 데이터베이스 설정
```bash
# Supabase 마이그레이션 실행
npm run migrate
```

## 📁 프로젝트 구조

```
webauthn-did-system/
├── packages/          # 4-Layer 아키텍처 패키지들
│   ├── core/          # 핵심 인터페이스
│   ├── ui-layer/      # UI 구현체
│   ├── core-layer/    # 비즈니스 로직
│   ├── integration-layer/  # 외부 연동
│   ├── data-layer/    # 데이터 관리
│   └── system/        # 시스템 조립
├── apps/              # 실행 가능한 앱들
├── scripts/           # 개발/배포 스크립트
└── docs/              # 문서
```

## 🎯 주요 기능

- ✅ WebAuthn 생체 인증 (Touch ID, Face ID, Windows Hello)
- ✅ W3C DID 표준 준수 신원 관리
- ✅ Supabase 기반 실시간 데이터 저장
- ✅ Universal AI Agent 통합
- ✅ 다중 AI 모델 지원 (OpenAI, Claude, Gemini)

## 🔧 개발 스크립트

```bash
npm run dev          # 개발 서버 실행
npm run build        # 프로젝트 빌드
npm run migrate      # DB 마이그레이션
npm run type-check   # 타입 체크
```

## 📚 문서

- [아키텍처 가이드](./docs/architecture.md)
- [API 레퍼런스](./docs/api-reference.md)
- [배포 가이드](./docs/deployment.md)
