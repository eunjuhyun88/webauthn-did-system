'use client';

import { useState, useEffect, useCallback } from 'react';
import { ZauriUser, Message, ContextTransfer } from '@/types/zauri';
import { crossPlatformSync } from '@/lib/zauri/cross-platform';
import { ragDagSystem } from '@/lib/zauri/rag-dag';

export const useZauri = () => {
  const [user, setUser] = useState<ZauriUser | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [activeTransfers, setActiveTransfers] = useState<ContextTransfer[]>([]);

  useEffect(() => {
    loadUser();
    startTransferPolling();
  }, []);

  const loadUser = async () => {
    // 실제 환경에서는 API 호출
    const mockUser: ZauriUser = {
      did: 'did:zauri:agent:0x742d35Cc6460C532FAEcE1dd25073C8d2FCAE857',
      walletAddress: '0x742d35Cc6460C532FAEcE1dd25073C8d2FCAE857',
      passkeyId: 'passkey_123456789',
      profile: {
        displayName: '김개발자',
        avatar: '🤖',
        bio: 'AI와 Web3의 교차점에서 혁신을 만들어가는 개발자',
        expertise: ['TypeScript', 'React', 'AI', 'Blockchain', 'WebAuthn']
      },
      agentPassport: {
        id: 'agent-001',
        name: 'CodeMaster Pro',
        type: 'Development Expert',
        did: 'did:zauri:agent:0x742d35Cc6460C532FAEcE1dd25073C8d2FCAE857',
        passportNo: 'ZAP-2024-001',
        level: 47,
        trustScore: 98.7,
        avatar: '🧠',
        status: 'active',
        capabilities: [],
        stats: {
          totalConversations: 15847,
          successRate: 94.7,
          averageResponseTime: 1.2,
          userSatisfactionScore: 4.8
        },
        personality: {
          type: 'INTJ-A (Architect)',
          communicationStyle: 'Direct & Technical',
          learningPattern: 'Visual + Hands-on',
          responsePreference: 'Concise with examples'
        },
        reputationScore: 987,
        stakingAmount: 10000,
        earningsToday: 247
      },
      dataVaults: [],
      connectedPlatforms: [],
      tokenBalances: {
        zauri: 15428,
        zgt: 2456,
        zrp: 8934
      },
      preferences: {
        theme: 'light',
        language: 'ko',
        notifications: true,
        autoSync: true,
        compressionLevel: 'balanced',
        securityLevel: 'high'
      }
    };
    
    setUser(mockUser);
  };

  const sendMessage = useCallback(async (content: string) => {
    if (!user) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      content,
      type: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    // RAG-DAG 검색
    const relevantNodes = ragDagSystem.searchSimilarNodes(content, 3);
    
    // AI 응답 시뮬레이션
    setTimeout(() => {
      setIsTyping(false);
      
      const aiResponse: Message = {
        id: crypto.randomUUID(),
        type: 'ai',
        content: `🤖 **RAG-DAG 기반 개인화 응답**

**사용된 지식 그래프:**
• 개인 전문성: ${user.profile.expertise.slice(0, 2).join(', ')}
• RAG 검색 점수: 94.7%
• DAG 연관도: 87.3%

**크로스플랫폼 맥락:**
• ChatGPT 이전 대화: "${content}"과 관련된 3개 대화 발견
• Claude 전문 지식: TypeScript 최적화 패턴 적용
• Notion 프로젝트: 현재 진행 중인 AI 프로젝트와 연관

**개인화 응답:**
${content}에 대한 답변을 드리겠습니다. 

당신의 ${user.agentPassport.personality.type} 성격과 "${user.agentPassport.personality.communicationStyle}" 소통 스타일을 고려하여, 구체적인 예시와 함께 단계별로 설명드리겠습니다.

💎 **채굴 완료**: +${Math.floor(Math.random() * 10) + 5} ZRP 토큰`,
        timestamp: new Date(),
        ragRelevance: 0.947,
        compressionRatio: 0.15,
        tokensEarned: Math.floor(Math.random() * 10) + 5,
        contextUsed: ['conversation_history', 'knowledge_vault', 'platform_context'],
        platforms: ['chatgpt', 'claude', 'notion']
      };
      
      setMessages(prev => [...prev, aiResponse]);
      
      // 지식 그래프에 새 노드 추가
      ragDagSystem.addKnowledgeNode(content, {
        type: 'user_query',
        timestamp: new Date(),
        response_id: aiResponse.id
      });
    }, 1500);
  }, [user]);

  const startContextTransfer = useCallback(async (fromPlatform: string, toPlatform: string) => {
    const mockContext = [
      {
        content: `Recent conversation about ${fromPlatform}`,
        metadata: { type: 'conversation', priority: 'high' },
        platform: fromPlatform,
        timestamp: new Date()
      }
    ];
    
    const transferId = await crossPlatformSync.startContextTransfer(
      fromPlatform,
      toPlatform,
      mockContext
    );
    
    return transferId;
  }, []);

  const startTransferPolling = useCallback(() => {
    const interval = setInterval(() => {
      const transfers = crossPlatformSync.getActiveTransfers();
      setActiveTransfers(transfers);
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return {
    user,
    messages,
    isTyping,
    activeTransfers,
    sendMessage,
    startContextTransfer,
    loadUser
  };
};
