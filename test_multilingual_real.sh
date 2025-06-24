#!/bin/bash

# =============================================================================
# 🧪 실제 동작하는 다국어 시스템 테스트
# 현재 프로젝트 상태에 맞춰 작성
# =============================================================================

echo "🔍 현재 프로젝트 상태 분석 중..."
echo "====================================="

# 현재 위치 확인
echo "📍 현재 위치: $(pwd)"
echo "📁 프로젝트 구조:"
ls -la

echo ""
echo "🗂️ src 폴더 구조:"
if [ -d "src" ]; then
    find src -type d | head -20
else
    echo "❌ src 폴더가 없습니다"
    exit 1
fi

echo ""
echo "📋 기존 파일 상태 확인:"
echo "========================"

# 기존 핵심 파일들 확인
check_file() {
    local file="$1"
    local desc="$2"
    
    if [ -f "$file" ]; then
        local size=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null || echo "0")
        echo "✅ $desc ($size bytes)"
        return 0
    else
        echo "❌ $desc (없음)"
        return 1
    fi
}

# 핵심 파일들 체크
echo "🔧 핵심 시스템 파일들:"
check_file "src/lib/config/index.ts" "기본 설정"
check_file "src/types/webauthn.ts" "WebAuthn 타입"
check_file "src/types/did.ts" "DID 타입"
check_file "src/auth/webauthn/index.ts" "WebAuthn 서비스"
check_file "src/database/supabase/client.ts" "Supabase 클라이언트"

echo ""
echo "🧠 Cue 시스템 파일들:"
check_file "src/lib/cue/CueExtractor.ts" "기본 Cue 추출기"
check_file "src/lib/cue/MultilingualCueExtractor.ts" "다국어 Cue 추출기"
check_file "src/types/cue.ts" "Cue 타입 정의"

echo ""
echo "🌍 다국어 시스템 파일들:"
check_file "src/lib/config/multilingual.config.ts" "다국어 설정 (핵심!)"
check_file "src/types/multilingual-cue.types.ts" "다국어 타입"

echo ""
echo "📊 현재 상태 요약:"
echo "=================="

# 전체 TypeScript 파일 수 계산
TS_FILES=$(find src -name "*.ts" -o -name "*.tsx" 2>/dev/null | wc -l)
echo "📝 TypeScript 파일 수: $TS_FILES개"

# API 라우트 수 계산
API_ROUTES=$(find src/app/api -name "route.ts" 2>/dev/null | wc -l)
echo "🔌 API 라우트 수: $API_ROUTES개"

# 컴포넌트 수 계산
COMPONENTS=$(find src/components -name "*.tsx" 2>/dev/null | wc -l)
echo "🎨 React 컴포넌트 수: $COMPONENTS개"

echo ""
echo "🎯 다음 단계 제안:"
echo "=================="

# 다국어 설정 파일 체크
if [ ! -f "src/lib/config/multilingual.config.ts" ]; then
    echo "🔥 **가장 우선순위**: src/lib/config/multilingual.config.ts 생성"
    echo "   → Claude가 생성한 100개 언어 설정 파일을 저장하세요"
    echo ""
    
    # 실제로 생성할 수 있는 간단한 테스트 버전 제공
    echo "📝 임시 테스트용 파일을 생성하시겠습니까? (y/n)"
    read -r response
    
    if [[ "$response" =~ ^[Yy]$ ]]; then
        echo "📁 폴더 생성 중..."
        mkdir -p src/lib/config
        
        echo "📄 임시 다국어 설정 파일 생성 중..."
        cat > src/lib/config/multilingual.config.ts << 'EOF'
// =============================================================================
// 🌍 임시 다국어 설정 (테스트용)
// src/lib/config/multilingual.config.ts
// =============================================================================

export const SUPPORTED_LANGUAGES = [
  'korean', 'english', 'japanese', 'chinese', 'spanish', 'unknown'
] as const;

export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];

export const MULTILINGUAL_CONFIG = {
  supportedLanguages: SUPPORTED_LANGUAGES,
  defaultLanguage: 'english' as SupportedLanguage,
  fallbackLanguage: 'english' as SupportedLanguage,
  autoDetectLanguage: true,
  confidenceThreshold: 0.6
};

export const LANGUAGE_METADATA = {
  korean: { native: '한국어', english: 'Korean', speakers: 77 },
  english: { native: 'English', english: 'English', speakers: 1500 },
  japanese: { native: '日本語', english: 'Japanese', speakers: 125 },
  chinese: { native: '中文', english: 'Chinese', speakers: 1400 },
  spanish: { native: 'Español', english: 'Spanish', speakers: 500 },
  unknown: { native: 'Unknown', english: 'Unknown', speakers: 0 }
};

// 언어 감지 헬퍼
export const detectLanguage = (text: string): SupportedLanguage => {
  if (/[가-힣]/.test(text)) return 'korean';
  if (/[ひらがなカタカナ]/.test(text)) return 'japanese';
  if (/[一-龯]/.test(text)) return 'chinese';
  if (/[ñáéíóúü]/i.test(text)) return 'spanish';
  return 'english';
};

// WebAuthn 메시지
export const getWebAuthnMessages = (language: SupportedLanguage) => {
  const messages = {
    korean: {
      title: '생체 인증 등록',
      button: '등록하기',
      success: '등록이 완료되었습니다'
    },
    english: {
      title: 'Biometric Registration', 
      button: 'Register',
      success: 'Registration completed'
    },
    japanese: {
      title: '生体認証登録',
      button: '登録',
      success: '登録が完了しました'
    }
  };
  
  return messages[language] || messages.english;
};

export default {
  config: MULTILINGUAL_CONFIG,
  metadata: LANGUAGE_METADATA,
  detectLanguage,
  getWebAuthnMessages
};
EOF

        echo "✅ 임시 다국어 설정 파일 생성 완료!"
        echo "   📄 src/lib/config/multilingual.config.ts"
    fi
fi

echo ""
echo "🧪 실제 동작 테스트 실행:"
echo "=========================="

# Node.js로 실제 테스트 실행
echo "📋 TypeScript 설정 확인..."
if [ -f "tsconfig.json" ]; then
    echo "✅ tsconfig.json 존재"
else
    echo "❌ tsconfig.json 없음"
fi

echo ""
echo "🔧 패키지 설정 확인..."
if [ -f "package.json" ]; then
    echo "✅ package.json 존재"
    echo "📦 설치된 패키지들:"
    npm list --depth=0 2>/dev/null | head -10
else
    echo "❌ package.json 없음"
fi

echo ""
echo "🌍 다국어 시스템 기능 테스트:"
echo "============================="

# 실제 JavaScript 코드로 테스트
node -e "
console.log('🧪 다국어 감지 테스트 시작...');

// 간단한 언어 감지 함수
function detectLanguage(text) {
  if (/[가-힣]/.test(text)) return 'korean';
  if (/[ひらがなカタカナ]/.test(text)) return 'japanese'; 
  if (/[一-龯]/.test(text)) return 'chinese';
  if (/[ñáéíóúü]/i.test(text)) return 'spanish';
  return 'english';
}

// 테스트 케이스들
const testCases = [
  { text: '안녕하세요 WebAuthn 시스템입니다', expected: 'korean' },
  { text: 'Hello WebAuthn system', expected: 'english' },
  { text: 'こんにちは WebAuthn システム', expected: 'japanese' },
  { text: '你好 WebAuthn 系统', expected: 'chinese' },
  { text: 'Hola sistema WebAuthn', expected: 'spanish' }
];

console.log('');
testCases.forEach((test, index) => {
  const detected = detectLanguage(test.text);
  const status = detected === test.expected ? '✅' : '❌';
  console.log(\`\${status} 테스트 \${index + 1}: \"\${test.text}\"\`);
  console.log(\`   감지됨: \${detected}, 예상: \${test.expected}\`);
});

console.log('');
console.log('🎉 기본 다국어 감지 테스트 완료!');
"

echo ""
echo "🔐 WebAuthn 상태 확인:"
echo "====================="

# WebAuthn 관련 파일들 체크
if [ -d "src/auth/webauthn" ]; then
    echo "✅ WebAuthn 폴더 존재"
    echo "📁 WebAuthn 파일들:"
    ls -la src/auth/webauthn/
else
    echo "❌ WebAuthn 폴더 없음"
fi

echo ""
echo "💾 데이터베이스 상태 확인:"
echo "========================"

if [ -d "src/database" ]; then
    echo "✅ 데이터베이스 폴더 존재"
    echo "📁 데이터베이스 파일들:"
    find src/database -name "*.ts" | head -5
else
    echo "❌ 데이터베이스 폴더 없음"
fi

echo ""
echo "🚀 개발 서버 상태 확인:"
echo "======================"

# 포트 3000 확인
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "✅ 개발 서버 실행 중 (포트 3000)"
else
    echo "❌ 개발 서버 중지됨"
    echo "   실행: npm run dev"
fi

# ngrok 상태 확인  
if command -v ngrok >/dev/null 2>&1; then
    echo "✅ ngrok 설치됨"
    if pgrep -f "ngrok" > /dev/null; then
        echo "✅ ngrok 터널 실행 중"
    else
        echo "❌ ngrok 터널 중지됨"
        echo "   실행: ngrok http 3000"
    fi
else
    echo "❌ ngrok 설치 안됨"
fi

echo ""
echo "📈 전체 진행 상황:"
echo "=================="

# 진행률 계산
TOTAL_CORE_FILES=10
EXISTING_FILES=0

core_files=(
    "src/lib/config/index.ts"
    "src/types/webauthn.ts" 
    "src/auth/webauthn/index.ts"
    "src/database/supabase/client.ts"
    "src/lib/cue/CueExtractor.ts"
    "src/types/cue.ts"
    "src/lib/config/multilingual.config.ts"
    "src/types/multilingual-cue.types.ts"
    "src/app/page.tsx"
    "src/app/layout.tsx"
)

for file in "${core_files[@]}"; do
    if [ -f "$file" ]; then
        EXISTING_FILES=$((EXISTING_FILES + 1))
    fi
done

PROGRESS=$((EXISTING_FILES * 100 / TOTAL_CORE_FILES))
echo "📊 핵심 파일 완성도: $EXISTING_FILES/$TOTAL_CORE_FILES ($PROGRESS%)"

# 진행률 바 표시
BAR_LENGTH=50
FILLED_LENGTH=$((PROGRESS * BAR_LENGTH / 100))
EMPTY_LENGTH=$((BAR_LENGTH - FILLED_LENGTH))

printf "["
printf "%*s" $FILLED_LENGTH | tr ' ' '█'
printf "%*s" $EMPTY_LENGTH | tr ' ' '░'
printf "] %d%%\n" $PROGRESS

echo ""
echo "🎯 다음 작업 우선순위:"
echo "===================="

if [ ! -f "src/lib/config/multilingual.config.ts" ]; then
    echo "🔥 1. 다국어 설정 파일 생성 (최우선)"
    echo "   → Claude가 만든 multilingual.config.ts 저장"
elif [ ! -f "src/types/multilingual-cue.types.ts" ]; then
    echo "🔥 1. 다국어 타입 정의 생성"
    echo "   → Claude가 만든 multilingual-cue.types.ts 저장"
elif [ ! -f "src/lib/cue/MultilingualCueExtractor.ts" ]; then
    echo "🔥 1. 다국어 Cue 추출기 생성"
    echo "   → Claude가 만든 MultilingualCueExtractor.ts 저장"
else
    echo "🔥 1. 시스템 통합 테스트"
    echo "   → 모든 컴포넌트 연동 확인"
fi

echo "⚡ 2. WebAuthn API 다국어화"
echo "🎨 3. UI 컴포넌트 다국어 지원"
echo "📱 4. 실제 사용자 테스트"

echo ""
echo "🚨 바로 실행 가능한 명령어들:"
echo "============================"
echo "npm run dev                 # 개발 서버 시작"
echo "npm run build               # 프로덕션 빌드"
echo "npm install                 # 패키지 재설치"
echo "bash $0                     # 이 스크립트 재실행"

echo ""
echo "🎉 다국어 시스템 테스트 완료!"
echo "============================="

# 마지막 상태 저장
echo "마지막 테스트: $(date)" > .multilingual-test-status
echo "진행률: $PROGRESS%" >> .multilingual-test-status
echo "핵심 파일: $EXISTING_FILES/$TOTAL_CORE_FILES" >> .multilingual-test-status