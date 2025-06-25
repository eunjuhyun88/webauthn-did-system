// =============================================================================
// 🤖 Agent Passport Manager - 간단 버전
// =============================================================================

import type { AgentPassport, WebAuthnUser, AuthResult } from '../types/agent';

export class AgentPassportManager {
  async createFromWebAuthn(authResult: AuthResult): Promise<AgentPassport | null> {
    try {
      if (!authResult.success || !authResult.user) {
        throw new Error('Invalid auth result');
      }

      const user = authResult.user;
      
      // 간단한 Agent Passport 생성
      const agentPassport: AgentPassport = {
        id: `agent-${Date.now()}`,
        did: `agent:${user.did}`,
        name: `${user.displayName}'s AI Agent`,
        type: 'personal-assistant',
        avatar: '🤖',
        level: 1,
        trustScore: 85,
        createdAt: new Date(),
        ownerDID: user.did
      };

      console.log('✅ Agent Passport 생성:', agentPassport.name);
      return agentPassport;
      
    } catch (error) {
      console.error('❌ Agent Passport 생성 실패:', error);
      return null;
    }
  }
}
