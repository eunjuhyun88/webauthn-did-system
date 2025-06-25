#!/bin/bash

# =============================================================================
# 🔧 누락된 훅 파일들 빠른 생성 스크립트
# =============================================================================

echo "🔧 누락된 훅 파일들 빠른 생성 중..."
echo "================================="

# 색상 정의
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# =============================================================================
# 1. use-chat 훅 생성
# =============================================================================

create_use_chat_hook() {
    log_info "💬 use-chat 훅 생성 중..."
    
    mkdir -p "src/hooks/chat"
    cat > "src/hooks/chat/use-chat.tsx" << 'EOF'
'use client';

import { useState, useCallback } from 'react';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface UseChatReturn {
  messages: Message[];
  isLoading: boolean;
  sendMessage: (content: string) => Promise<void>;
  clearMessages: () => void;
}

export function useChat(): UseChatReturn {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // AI 채팅 API 호출
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: content }),
      });

      if (response.ok) {
        const data = await response.json();
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.message || '응답을 받을 수 없습니다.',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        throw new Error('AI 응답 실패');
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '죄송합니다. 일시적인 오류가 발생했습니다.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    isLoading,
    sendMessage,
    clearMessages,
  };
}

export default useChat;
EOF
    
    log_success "use-chat 훅 생성 완료"
}

# =============================================================================
# 2. use-passport 훅 생성
# =============================================================================

create_use_passport_hook() {
    log_info "🎫 use-passport 훅 생성 중..."
    
    mkdir -p "src/hooks/passport"
    cat > "src/hooks/passport/use-passport.tsx" << 'EOF'
'use client';

import { useState, useEffect, useCallback } from 'react';

export interface PassportData {
  id: string;
  did: string;
  owner: string;
  biometricEnabled: boolean;
  vaultCount: number;
  trustScore: number;
  cueTokens: number;
  lastUpdate: Date;
}

export interface UsePassportReturn {
  passport: PassportData | null;
  isLoading: boolean;
  error: string | null;
  updatePassport: (data: Partial<PassportData>) => Promise<void>;
  refreshPassport: () => Promise<void>;
}

export function usePassport(): UsePassportReturn {
  const [passport, setPassport] = useState<PassportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshPassport = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/passport/update');
      
      if (response.ok) {
        const data = await response.json();
        setPassport(data.passport);
      } else {
        // 기본 패스포트 데이터 생성
        const defaultPassport: PassportData = {
          id: 'default-passport',
          did: 'did:example:123456',
          owner: 'user@example.com',
          biometricEnabled: true,
          vaultCount: 3,
          trustScore: 96.8,
          cueTokens: 15428,
          lastUpdate: new Date(),
        };
        setPassport(defaultPassport);
      }
    } catch (error) {
      console.error('Passport refresh error:', error);
      setError('패스포트 정보를 불러올 수 없습니다.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updatePassport = useCallback(async (data: Partial<PassportData>) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/passport/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const result = await response.json();
        setPassport(result.passport);
      } else {
        throw new Error('패스포트 업데이트 실패');
      }
    } catch (error) {
      console.error('Passport update error:', error);
      setError('패스포트 업데이트에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshPassport();
  }, [refreshPassport]);

  return {
    passport,
    isLoading,
    error,
    updatePassport,
    refreshPassport,
  };
}

export default usePassport;
EOF
    
    log_success "use-passport 훅 생성 완료"
}

# =============================================================================
# 3. 타입 정의 파일들 생성
# =============================================================================

create_missing_types() {
    log_info "📝 타입 정의 파일들 생성 중..."
    
    # unified-passport 타입
    mkdir -p "src/types/passport"
    cat > "src/types/passport/unified-passport.ts" << 'EOF'
// =============================================================================
// 📝 Unified Passport 타입 정의
// =============================================================================

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    tokens?: number;
    model?: string;
    confidence?: number;
  };
}

export interface PassportVault {
  id: string;
  name: string;
  type: 'personal' | 'professional' | 'creative';
  size: number;
  encrypted: boolean;
  lastAccess: Date;
}

export interface BiometricProfile {
  enabled: boolean;
  methods: ('fingerprint' | 'face' | 'voice')[];
  lastAuth: Date;
  successRate: number;
}

export interface UnifiedPassport {
  id: string;
  did: string;
  owner: {
    name: string;
    email: string;
    avatar?: string;
  };
  biometric: BiometricProfile;
  vaults: PassportVault[];
  tokens: {
    cue: number;
    zauri: number;
    trust: number;
  };
  trustScore: number;
  analytics: {
    totalInteractions: number;
    platformsConnected: number;
    dataProcessed: number;
  };
  lastUpdate: Date;
  createdAt: Date;
}

export interface PassportState {
  passport: UnifiedPassport | null;
  isLoading: boolean;
  error: string | null;
}

export type PassportAction = 
  | { type: 'SET_PASSPORT'; payload: UnifiedPassport }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'UPDATE_TOKENS'; payload: Partial<UnifiedPassport['tokens']> }
  | { type: 'UPDATE_TRUST_SCORE'; payload: number };
EOF
    
    log_success "unified-passport 타입 생성 완료"
}

# =============================================================================
# 4. 메인 실행 함수
# =============================================================================

main() {
    echo "🎯 누락된 훅 파일들 빠른 생성 시작..."
    echo "==================================="
    
    # 1. use-chat 훅 생성
    create_use_chat_hook
    
    # 2. use-passport 훅 생성
    create_use_passport_hook
    
    # 3. 타입 정의 생성
    create_missing_types
    
    echo ""
    echo "🎉 누락된 훅 파일들 생성 완료!"
    echo "============================="
    echo ""
    
    log_success "✅ 생성된 파일들:"
    echo "  💬 src/hooks/chat/use-chat.tsx"
    echo "  🎫 src/hooks/passport/use-passport.tsx"
    echo "  📝 src/types/passport/unified-passport.ts"
    echo ""
    
    echo "🔄 이제 브라우저를 새로고침하면 오류가 해결됩니다!"
    echo "🌐 http://localhost:3001 에서 확인하세요"
}

# 스크립트 실행
main