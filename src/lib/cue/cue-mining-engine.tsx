// =============================================================================
// 🎯 CUE 채굴 엔진
// =============================================================================

import { passportManager } from '../passport/passport-manager';
import { VaultDataPoint, ExtractionStep } from '@/types/passport/unified-passport';

export class CueMiningEngine {
  private extractionInProgress = false;

  public async extractFromPlatform(
    platformId: string, 
    onProgress?: (step: ExtractionStep) => void
  ): Promise<VaultDataPoint[]> {
    if (this.extractionInProgress) {
      throw new Error('이미 추출이 진행 중입니다');
    }

    this.extractionInProgress = true;
    const extractedData: VaultDataPoint[] = [];
    
    try {
      const steps: Omit<ExtractionStep, 'id' | 'completed' | 'timestamp'>[] = [
        { text: '🌐 브라우저 확장 활성화 중...', type: 'system' },
        { text: `🔍 ${platformId} 페이지 스캔 시작`, type: 'scanning' },
        { text: '💬 대화 메시지 발견됨', type: 'found', data: { messageCount: 15 } },
        { text: '🧠 AI 컨텍스트 패턴 분석 중...', type: 'processing' },
        { text: '🎯 개성 패턴 매칭됨', type: 'analysis', data: { personality: 'INTJ-A', confidence: 94 } },
        { text: '📊 데이터 볼트 업데이트', type: 'storage' },
        { text: '💎 CUE 토큰 채굴 완료', type: 'reward', data: { tokens: 5 } },
        { text: '✅ 추출 완료', type: 'complete' }
      ];

      for (let i = 0; i < steps.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 400));
        
        const step: ExtractionStep = {
          id: i,
          ...steps[i],
          completed: true,
          timestamp: new Date()
        };
        
        onProgress?.(step);

        // 실제 데이터 추출 시뮬레이션
        if (step.type === 'storage') {
          const newDataPoint: VaultDataPoint = {
            key: 'extracted_context',
            value: `컨텍스트 데이터 from ${platformId}`,
            source: platformId,
            timestamp: new Date()
          };
          extractedData.push(newDataPoint);
        }

        if (step.type === 'reward') {
          passportManager.addCueTokens(5, `${platformId}에서 데이터 추출`);
        }
      }

      return extractedData;
    } finally {
      this.extractionInProgress = false;
    }
  }

  public calculateCueValue(dataPoint: VaultDataPoint): number {
    // 데이터 포인트의 CUE 가치 계산 로직
    const baseValue = 1;
    const sourceMultiplier = dataPoint.source === 'chatgpt' ? 1.5 : 1.0;
    const freshnessMultiplier = this.calculateFreshnessMultiplier(dataPoint.timestamp);
    
    return Math.round(baseValue * sourceMultiplier * freshnessMultiplier);
  }

  private calculateFreshnessMultiplier(timestamp?: Date): number {
    if (!timestamp) return 1.0;
    
    const daysSinceExtraction = (Date.now() - timestamp.getTime()) / (1000 * 60 * 60 * 24);
    return Math.max(0.5, 1.0 - (daysSinceExtraction * 0.1));
  }
}

export const cueMiningEngine = new CueMiningEngine();
