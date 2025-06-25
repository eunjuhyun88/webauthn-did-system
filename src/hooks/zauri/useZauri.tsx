'use client';

import { useState, useEffect, useCallback } from 'react';
import { ZauriUser, ZauriMessage, ContextTransfer } from '@/types/zauri';
import { crossPlatformSync } from '@/lib/zauri/cross-platform-sync';
import { ragDagSystem } from '@/lib/zauri/rag-dag-system';

export const useZauri = () => {
  const [user, setUser] = useState<ZauriUser | null>(null);
  const [messages, setMessages] = useState<ZauriMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [activeTransfers, setActiveTransfers] = useState<ContextTransfer[]>([]);

  // Mock data - 실제 환경에서는 API 호출
  const mockUser: ZauriUser = {
    id: 'zauri-user-001',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date(),
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
      id: 'agent-passport-001',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date(),
      name: 'CodeMaster Pro',
      type: 'Development Expert',
      did: 'did:zauri:agent:0x742d35Cc6460C532FAEcE1dd25073C8d2FCAE857',
      passportNo: 'ZAP-2024-001',
      level: 47,
      trustScore: 98.7,
      avatar: '🧠',
      status: 'active',
      capabilities: [
        { name: 'TypeScript', score: 95, verified: true },
        { name: 'React', score: 92, verified: true },
        { name: 'AI Integration', score: 88, verified: true },
        { name: 'WebAuthn', score: 85, verified: true }
      ],
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
    connectedPlatforms: [
      {
        id: 'chatgpt',
        name: 'ChatGPT',
        connected: true,
        lastSync: new Date(),
        status: 'active',
        icon: '🤖',
        category: 'ai',
        cueCount: 1247,
        contextMined: 856,
        syncQuality: 94.5,
        compressionRatio: 0.15
      },
      {
        id: 'claude',
        name: 'Claude',
        connected: true,
        lastSync: new Date(),
        status: 'active',
        icon: '🧠',
        category: 'ai',
        cueCount: 923,
        contextMined: 678,
        syncQuality: 96.2,
        compressionRatio: 0.12
      }
    ],
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

  useEffect(() => {
    loadUser();
    startTransferPolling();
  }, []);

  const loadUser = useCallback(async () => {
    try {
      // 실제 환경에서는 API 호출
      await new Promise(resolve => setTimeout(resolve, 800)); // 로딩 시뮬레이션
      setUser(mockUser);
    } catch (error) {
      console.error('Failed to load user:', error);
    }
  }, []);

  const sendMessage = useCallback(async (content: string) => {
    if (!user) return;

    const userMessage: ZauriMessage = {
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
      content,
      type: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    try {
      // RAG-DAG 검색
      const relevantNodes = ragDagSystem.searchSimilarNodes(content, 3);
      
      // AI 응답 시뮬레이션
      setTimeout(() => {
        setIsTyping(false);
        
        const tokensEarned = Math.floor(Math.random() * 10) + 5;
        
        const aiResponse: ZauriMessage = {
          id: crypto.randomUUID(),
          createdAt: new Date(),
          updatedAt: new Date(),
          type: 'ai',
          content: `🤖 **RAG-DAG 기반 개인화 응답**

**검색된 지식 그래프:**
• 개인 전문성: ${user.profile.expertise.slice(0, 2).join(', ')}
• RAG 검색 점수: ${relevantNodes.length > 0 ? Math.round(relevantNodes[0].relevanceScore * 100) : 0}%
• 지식 노드 연결: ${relevantNodes.length}개

**크로스플랫폼 맥락:**
• ChatGPT 이전 대화: "${content}"과 관련된 3개 대화 발견
• Claude 전문 지식: TypeScript 최적화 패턴 적용
• 압축률: 28:1 (88% 의미 보존)

**개인화 응답:**
${content}에 대한 답변을 드리겠습니다.

당신의 ${user.agentPassport.personality.type} 성격과 "${user.agentPassport.personality.communicationStyle}" 소통 스타일을 고려하여, 구체적인 예시와 함께 단계별로 설명드리겠습니다.

이 답변은 ${user.connectedPlatforms.filter(p => p.connected).length}개 플랫폼의 컨텍스트를 종합하여 생성되었습니다.

💎 **채굴 완료**: +${tokensEarned} ZRP 토큰`,
          timestamp: new Date(),
          ragRelevance: relevantNodes.length > 0 ? relevantNodes[0].relevanceScore : 0.85,
          compressionRatio: 0.15,
          tokensEarned,
          contextUsed: ['conversation_history', 'knowledge_vault', 'platform_context'],
          platforms: user.connectedPlatforms.filter(p => p.connected).map(p => p.name)
        };
        
        setMessages(prev => [...prev, aiResponse]);
        
        // 토큰 업데이트
        setUser(prev => prev ? {
          ...prev,
          tokenBalances: {
            ...prev.tokenBalances,
            zrp: prev.tokenBalances.zrp + tokensEarned
          },
          agentPassport: {
            ...prev.agentPassport,
            earningsToday: prev.agentPassport.earningsToday + tokensEarned
          }
        } : null);
        
        // 지식 그래프에 새 노드 추가
        ragDagSystem.addKnowledgeNode(content, {
          type: 'user_query',
          timestamp: new Date(),
          response_id: aiResponse.id,
          user_id: user.id
        });
      }, 1500);
    } catch (error) {
      setIsTyping(false);
      console.error('Failed to send message:', error);
    }
  }, [user]);

  const startContextTransfer = useCallback(async (fromPlatform: string, toPlatform: string) => {
    const mockContext = [
      {
        content: `Recent conversation about ${fromPlatform} integration`,
        metadata: { type: 'conversation', priority: 'high', source: fromPlatform },
        platform: fromPlatform,
        timestamp: new Date()
      },
      {
        content: `User preferences for ${toPlatform} optimization`,
        metadata: { type: 'preference', priority: 'medium', source: fromPlatform },
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

  const getRAGStats = useCallback(() => {
    return ragDagSystem.getStats();
  }, []);

  const getTransferStats = useCallback(() => {
    return crossPlatformSync.getTransferStats();
  }, []);

  return {
    user,
    messages,
    isTyping,
    activeTransfers,
    sendMessage,
    startContextTransfer,
    loadUser,
    getRAGStats,
    getTransferStats
  };
};
