// =============================================================================
// 🎯 AI Passport 통합 관리자
// =============================================================================

import { UnifiedAIPassport, UnifiedDataVault, ConnectedPlatform } from '@/types/passport/unified-passport';

export class PassportManager {
  private passport: UnifiedAIPassport | null = null;

  constructor() {
    this.loadPassport();
  }

  private loadPassport(): void {
    // localStorage나 API에서 패스포트 데이터 로드
    const stored = localStorage.getItem('unified-passport');
    if (stored) {
      this.passport = JSON.parse(stored);
    }
  }

  public savePassport(): void {
    if (this.passport) {
      localStorage.setItem('unified-passport', JSON.stringify(this.passport));
    }
  }

  public getPassport(): UnifiedAIPassport | null {
    return this.passport;
  }

  public updateTrustScore(newScore: number): void {
    if (this.passport) {
      this.passport.trustScore = newScore;
      this.savePassport();
    }
  }

  public addCueTokens(amount: number, reason: string): void {
    if (this.passport) {
      this.passport.cueTokens += amount;
      this.passport.cueHistory.push({
        id: Date.now().toString(),
        amount,
        type: 'earned',
        timestamp: new Date(),
        description: reason
      });
      this.savePassport();
    }
  }

  public updateDataVault(vaultId: string, updates: Partial<UnifiedDataVault>): void {
    if (this.passport) {
      const vaultIndex = this.passport.dataVaults.findIndex(v => v.id === vaultId);
      if (vaultIndex !== -1) {
        this.passport.dataVaults[vaultIndex] = {
          ...this.passport.dataVaults[vaultIndex],
          ...updates,
          lastUpdated: new Date()
        };
        this.savePassport();
      }
    }
  }

  public connectPlatform(platform: ConnectedPlatform): void {
    if (this.passport) {
      const existingIndex = this.passport.connectedPlatforms.findIndex(p => p.id === platform.id);
      if (existingIndex !== -1) {
        this.passport.connectedPlatforms[existingIndex] = platform;
      } else {
        this.passport.connectedPlatforms.push(platform);
      }
      this.savePassport();
    }
  }
}

export const passportManager = new PassportManager();
