'use client';

import { useState, useCallback } from 'react';
import { Message } from '@/types/passport/unified-passport';
import { usePassport } from '../passport/use-passport';

export const useChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const { passport, addCueTokens } = usePassport();

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    // 사용자 메시지 추가
    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      type: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    // AI 응답 시뮬레이션
    setTimeout(() => {
      setIsTyping(false);
      
      const relevantVaults = passport?.dataVaults.filter(vault => 
        Math.random() > 0.3
      ).slice(0, 2) || [];
      
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: `🤖 **완전 개인화된 AI 응답**

**활용된 AI Passport 데이터:**
• 성격 유형: ${passport?.personalityProfile.type || 'INTJ-A'}
• 소통 스타일: ${passport?.personalityProfile.communicationStyle || 'Direct & Technical'}
• 학습 패턴: ${passport?.personalityProfile.learningPattern || 'Visual + Hands-on'}

**사용된 데이터 볼트:**
${relevantVaults.map(vault => 
  `• ${vault.name}: ${vault.dataCount}개 데이터 포인트 활용`
).join('\n')}

**Cue 채굴 정보:**
• 이 대화에서 3 CUE 토큰 채굴됨 💎
• 개성 프로필 정확도 +2% 향상
• 총 CUE 잔고: ${((passport?.cueTokens || 0) + 3).toLocaleString()}개

이 답변은 당신의 **완전한 디지털 정체성**을 바탕으로 생성되었습니다. 🎯`,
        timestamp: new Date(),
        usedPassportData: relevantVaults.map(v => v.name),
        cueTokensEarned: 3,
        verification: {
          biometric: true,
          did: true,
          signature: `0x${Math.random().toString(16).substr(2, 40)}`
        }
      };
      
      setMessages(prev => [...prev, aiResponse]);
      
      // CUE 토큰 추가
      addCueTokens(3, '개인화 AI 대화');
    }, 1500 + Math.random() * 1000);
  }, [passport, addCueTokens]);

  return {
    messages,
    isTyping,
    sendMessage
  };
};
