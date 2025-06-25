# 🎯 AI Passport + Cue System

개인화 AI와 컨텍스트 채굴을 통합한 차세대 플랫폼

## ✨ 주요 기능

### 🎭 AI Passport
- **개성 프로필**: MBTI 기반 AI 개성 분석
- **통합 신원**: DID + WebAuthn 생체인증
- **데이터 볼트**: 암호화된 개인 데이터 저장소

### 💎 CUE 채굴 시스템
- **컨텍스트 채굴**: 대화 데이터에서 자동 CUE 토큰 생성
- **플랫폼 연동**: ChatGPT, Claude, Gemini 등 연결
- **실시간 동기화**: 크로스 플랫폼 데이터 통합

### 🤖 개인화 AI 에이전트
- **맞춤형 학습**: AI Passport 데이터로 학습
- **체크포인트 관리**: 모델 버전 관리 및 롤백
- **전문 에이전트**: 코딩, 창작, 분석 등 특화 AI

## 🚀 빠른 시작

### 1. 저장소 클론
```bash
git clone https://github.com/your-username/ai-passport-cue-system.git
cd ai-passport-cue-system
```

### 2. 의존성 설치
```bash
chmod +x install-dependencies.sh
./install-dependencies.sh
```

### 3. 환경 변수 설정
```bash
cp .env.example .env.local
# .env.local 파일을 편집하여 API 키들을 입력하세요
```

### 4. 개발 서버 실행
```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

## 📁 프로젝트 구조

```
src/
├── app/                     # Next.js App Router
│   ├── api/                # API 라우트들
│   │   ├── ai/chat/       # AI 채팅 API
│   │   ├── cue/mine/      # CUE 채굴 API
│   │   └── system/health/ # 시스템 상태 API
│   ├── layout.tsx         # 루트 레이아웃
│   └── page.tsx          # 메인 페이지
├── components/            # React 컴포넌트들
│   ├── chat/             # 채팅 인터페이스
│   ├── dashboard/        # 대시보드 컴포넌트
│   ├── passport/         # AI Passport 컴포넌트
│   └── ui/              # 기본 UI 컴포넌트
├── hooks/               # 커스텀 React 훅들
│   ├── chat/           # 채팅 관련 훅
│   └── passport/       # Passport 관련 훅
├── lib/                # 핵심 비즈니스 로직
│   ├── agents/        # AI 에이전트 관리
│   ├── config/        # 설정 파일들
│   ├── cue/          # CUE 채굴 엔진
│   ├── passport/     # AI Passport 관리
│   └── utils/        # 유틸리티 함수들
└── types/            # TypeScript 타입 정의
    └── passport/     # Passport 관련 타입들
```

## 🔧 주요 모듈

### PassportManager
```typescript
import { passportManager } from '@/lib/passport/passport-manager';

// CUE 토큰 추가
passportManager.addCueTokens(5, '데이터 추출');

// 신뢰도 점수 업데이트
passportManager.updateTrustScore(96.8);
```

### CueMiningEngine
```typescript
import { cueMiningEngine } from '@/lib/cue/cue-mining-engine';

// 플랫폼에서 데이터 추출
const extractedData = await cueMiningEngine.extractFromPlatform(
  'chatgpt',
  (step) => console.log(step.text)
);
```

### AgentTrainer
```typescript
import { agentTrainer } from '@/lib/agents/agent-trainer';

// AI 에이전트 학습 시작
const session = await agentTrainer.startTraining(
  agent,
  (session) => console.log(`진행률: ${session.currentEpoch}/${session.totalEpochs}`)
);
```

## 🎨 컴포넌트 사용법

### PassportCard
```tsx
import { PassportCard } from '@/components/passport/passport-card';

<PassportCard 
  onVaultClick={() => console.log('볼트 클릭')}
  onAnalyticsClick={() => console.log('분석 클릭')}
/>
```

### ChatInterface
```tsx
import { ChatInterface } from '@/components/chat/chat-interface';

<ChatInterface />
```

### MainDashboard
```tsx
import { MainDashboard } from '@/components/dashboard/main-dashboard';

export default function HomePage() {
  return <MainDashboard />;
}
```

## 🔌 API 엔드포인트

### AI 채팅
```http
POST /api/ai/chat
Content-Type: application/json

{
  "message": "안녕하세요",
  "passportData": {
    "vaults": ["전문 개발 지식", "커뮤니케이션 스타일"]
  }
}
```

### CUE 채굴
```http
POST /api/cue/mine
Content-Type: application/json

{
  "platformId": "chatgpt",
  "dataType": "conversation"
}
```

### 시스템 상태
```http
GET /api/system/health
```

## 🛠️ 개발 가이드

### 새로운 AI 에이전트 추가
1. `src/types/passport/unified-passport.ts`에서 에이전트 타입 확장
2. `src/lib/agents/agent-trainer.ts`에서 학습 로직 구현
3. `src/components/dashboard/main-dashboard.tsx`에서 UI 추가

### 새로운 플랫폼 연동
1. `src/lib/config/app.config.ts`의 `supportedPlatforms`에 추가
2. `src/lib/cue/cue-mining-engine.ts`에서 추출 로직 구현
3. 연결 단계를 `ConnectedPlatform` 타입에 정의

### 새로운 데이터 볼트 카테고리
1. `UnifiedDataVault`의 `category` 타입 확장
2. 해당 카테고리에 맞는 데이터 처리 로직 구현
3. UI에서 새 카테고리 아이콘 및 색상 정의

## 🧪 테스트

```bash
# 단위 테스트
npm run test

# E2E 테스트
npm run test:e2e

# 타입 체크
npm run type-check
```

## 📦 빌드 및 배포

```bash
# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm run start

# Docker로 실행
docker build -t ai-passport-cue .
docker run -p 3000:3000 ai-passport-cue
```

## 🔐 보안 고려사항

- **WebAuthn**: 생체인증을 통한 안전한 로그인
- **DID**: 탈중앙화 신원 관리
- **데이터 암호화**: 모든 개인 데이터는 end-to-end 암호화
- **API 보안**: Rate limiting 및 인증 토큰 사용

## 🌍 환경 변수

필수 환경 변수들:
- `OPENAI_API_KEY`: OpenAI API 키
- `ANTHROPIC_API_KEY`: Anthropic API 키
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase 프로젝트 URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase 익명 키

선택적 환경 변수들:
- `GOOGLE_AI_API_KEY`: Google AI API 키
- `NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID`: WalletConnect 프로젝트 ID

## 🤝 기여하기

1. 이 저장소를 포크하세요
2. 기능 브랜치를 생성하세요 (`git checkout -b feature/amazing-feature`)
3. 변경사항을 커밋하세요 (`git commit -m 'Add amazing feature'`)
4. 브랜치에 푸시하세요 (`git push origin feature/amazing-feature`)
5. Pull Request를 생성하세요

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. [LICENSE](LICENSE) 파일을 참조하세요.

## 🆘 지원

- 📧 이메일: support@ai-passport.dev
- 💬 Discord: [커뮤니티 참여](https://discord.gg/ai-passport)
- 📖 문서: [개발자 가이드](https://docs.ai-passport.dev)

---

AI 개인화의 미래를 위해 ❤️를 담아 개발되었습니다.
