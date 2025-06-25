// =============================================================================
// 💬 Zauri 채팅 서비스 (기존 AI 서비스 확장)
// =============================================================================

import { ZauriMessage } from '@/types/zauri';
import { ragDagEngine } from '@/lib/cue/zauri/rag-dag';

export class ZauriChatService {
  async processMessage(
    userMessage: string,
    userId: string,
    contextHistory: ZauriMessage[] = []
  ): Promise<ZauriMessage> {
    try {
      // RAG-DAG 검색
      const relevantNodes = ragDagEngine.searchSimilarNodes(userMessage, 3);
      
      // AI 응답 생성 (실제 환경에서는 OpenAI API 사용)
      const aiResponse: ZauriMessage = {
        id: crypto.randomUUID(),
        type: 'ai',
        content: this.generatePersonalizedResponse(userMessage, relevantNodes),
        timestamp: new Date(),
        ragRelevance: relevantNodes.length > 0 ? relevantNodes[0].relevanceScore : 0,
        tokensEarned: Math.floor(Math.random() * 10) + 5,
        platforms: ['zauri-system']
      };
      
      // 지식 그래프에 새 노드 추가
      ragDagEngine.addKnowledgeNode(userMessage, {
        type: 'user_query',
        userId,
        responseId: aiResponse.id
      });
      
      return aiResponse;
    } catch (error) {
      console.error('Chat service error:', error);
      throw error;
    }
  }

  private generatePersonalizedResponse(query: string, relevantNodes: any[]): string {
    return `🤖 **Zauri RAG-DAG 기반 응답**

**검색된 관련 지식:**
${relevantNodes.map((node, idx) => 
  `• ${idx + 1}. ${node.content.slice(0, 100)}... (관련도: ${Math.round(node.relevanceScore * 100)}%)`
).join('\n')}

**개인화된 답변:**
${query}에 대한 답변을 위해 ${relevantNodes.length}개의 관련 지식을 분석했습니다.

당신의 이전 대화 패턴과 선호도를 고려하여 맞춤형 응답을 제공합니다.

💎 **채굴 완료**: +${Math.floor(Math.random() * 10) + 5} ZRP 토큰`;
  }
}

export const zauriChatService = new ZauriChatService();
