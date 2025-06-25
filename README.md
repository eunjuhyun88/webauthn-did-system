# 🚀 Zauri + AI Passport 통합 시스템

WebAuthn 기반 생체인증과 RAG-DAG 지식 그래프를 결합한 차세대 개인화 AI 플랫폼

## ✨ 주요 기능

### 🔐 AI Passport 시스템
- **WebAuthn 생체인증**: Touch ID, Face ID를 통한 안전한 로그인
- **DID 신원 관리**: 탈중앙화 신원 증명
- **데이터 볼트**: 개인 데이터의 암호화된 저장소
- **개인화 AI 에이전트**: 사용자 맞춤형 AI 모델 학습
- **CUE 토큰 채굴**: 대화를 통한 토큰 획득

### 🌐 Zauri 크로스플랫폼 시스템
- **RAG-DAG 지식 그래프**: 의미적 연관성 기반 지식 저장
- **28:1 압축 기술**: 88% 의미 보존으로 효율적 데이터 전송
- **실시간 동기화**: ChatGPT, Claude, Notion 등 플랫폼 간 맥락 공유
- **토큰 경제**: ZAURI, ZGT, ZRP 다중 토큰 시스템

## 🏗️ 기술 스택

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Supabase
- **인증**: WebAuthn, DID, JWT
- **AI**: OpenAI GPT-4, Anthropic Claude, Google Gemini
- **UI**: Lucide React, Framer Motion, HeadlessUI
- **데이터베이스**: Supabase PostgreSQL

## 📁 프로젝트 구조

```
src/
├── components/           # React 컴포넌트
│   ├── passport/        # AI Passport 관련
│   ├── zauri/          # Zauri 시스템 관련
│   ├── auth/           # 인증 컴포넌트
│   └── ui/             # 공통 UI 컴포넌트
├── lib/                # 핵심 라이브러리
│   ├── passport/       # AI Passport 로직
│   ├── zauri/          # Zauri 시스템 로직
│   └── config/         # 설정 파일
├── types/              # TypeScript 타입 정의
│   ├── passport/       # AI Passport 타입
│   ├── zauri/          # Zauri 타입
│   └── common/         # 공통 타입
├── hooks/              # 커스텀 React 훅
├── app/                # Next.js App Router
│   └── api/            # API 라우트
└── utils/              # 유틸리티 함수
```

## 🚀 시작하기

### 1. 프로젝트 클론 및 설정

```bash
# 저장소 클론
git clone [repository-url]
cd zauri-ai-passport

# 의존성 설치
./install-dependencies.sh

# 환경 변수 설정
cp .env.example .env.local
```

### 2. 환경 변수 설정

`.env.local` 파일을 편집하여 필요한 API 키들을 설정하세요:

```env
# Supabase 설정
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# AI 서비스 API 키
OPENAI_API_KEY=your_openai_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key

# 기타 설정...
```

### 3. 개발 서버 실행

```bash
npm run dev
```

http://localhost:3000에서 애플리케이션을 확인하세요.

## 🔧 주요 컴포넌트

### AI Passport 카드
```tsx
import { PassportCard } from '@/components/passport/passport-card/PassportCard';

<PassportCard 
  passport={userPassport}
  onViewAnalytics={() => setView('analytics')}
/>
```

### Zauri 채팅 인터페이스
```tsx
import { ChatInterface } from '@/components/zauri/chat/ChatInterface';

<ChatInterface
  user={zauriUser}
  messages={messages}
  onSendMessage={handleSendMessage}
/>
```

### 데이터 볼트 관리
```tsx
import { dataVaultManager } from '@/lib/passport/data-vault';

const vault = dataVaultManager.createVault({
  name: '전문 지식',
  category: 'professional'
});
```

## 🔄 크로스플랫폼 동기화

```tsx
import { crossPlatformSync } from '@/lib/zauri/cross-platform';

const transferId = await crossPlatformSync.startContextTransfer(
  'chatgpt',
  'claude',
  contextData
);
```

## 🧠 RAG-DAG 지식 그래프

```tsx
import { ragDagSystem } from '@/lib/zauri/rag-dag';

// 지식 노드 추가
const nodeId = ragDagSystem.addKnowledgeNode(
  '사용자 질문 내용',
  { type: 'user_query', timestamp: new Date() }
);

// 유사한 노드 검색
const similarNodes = ragDagSystem.searchSimilarNodes('검색어', 5);
```

## 🔐 보안 기능

- **WebAuthn 생체인증**: 비밀번호 없는 안전한 로그인
- **End-to-End 암호화**: 모든 개인 데이터 암호화
- **DID 기반 신원**: 탈중앙화된 신원 증명
- **토큰 기반 권한**: 세밀한 접근 제어

## 🌟 고급 기능

### 개인화 AI 에이전트 훈련
- 사용자별 맞춤 AI 모델
- 체크포인트 기반 버전 관리
- 성능 메트릭 추적

### 토큰 경제 시스템
- **ZAURI**: 유틸리티 토큰
- **ZGT**: 거버넌스 토큰  
- **ZRP**: 보상 토큰
- **CUE**: 컨텍스트 마이닝 토큰

## 📚 API 참조

### AI Passport API
- `PUT /api/passport/update` - Passport 정보 업데이트
- `GET /api/passport/vaults` - 데이터 볼트 목록
- `POST /api/passport/agents/train` - AI 에이전트 훈련

### Zauri API
- `POST /api/zauri/chat` - AI 채팅 메시지
- `POST /api/zauri/transfer` - 크로스플랫폼 전송
- `GET /api/zauri/transfers` - 전송 상태 조회

## 🤝 기여하기

1. 이 저장소를 포크하세요
2. 기능 브랜치를 생성하세요 (`git checkout -b feature/amazing-feature`)
3. 변경사항을 커밋하세요 (`git commit -m 'Add amazing feature'`)
4. 브랜치에 푸시하세요 (`git push origin feature/amazing-feature`)
5. Pull Request를 생성하세요

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. [LICENSE](LICENSE) 파일을 참조하세요.

## 🆘 지원

- 📧 이메일: support@zauri.ai
- 💬 Discord: [커뮤니티 참여](https://discord.gg/zauri)
- 📖 문서: [개발자 가이드](https://docs.zauri.ai)

---

AI 개인화의 미래를 위해 ❤️를 담아 개발되었습니다.
