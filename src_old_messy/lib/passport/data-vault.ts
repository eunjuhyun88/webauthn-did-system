// =============================================================================
// 🗄️ AI Passport 데이터 볼트 관리자
// =============================================================================

import { UnifiedDataVault, VaultDataPoint } from '@/types/passport';

export class DataVaultManager {
  private vaults: Map<string, UnifiedDataVault> = new Map();

  createVault(config: Partial<UnifiedDataVault>): UnifiedDataVault {
    const vault: UnifiedDataVault = {
      id: crypto.randomUUID(),
      name: config.name || 'New Vault',
      category: config.category || 'identity',
      description: config.description || '',
      dataCount: 0,
      cueCount: 0,
      encrypted: true,
      lastUpdated: new Date(),
      accessLevel: config.accessLevel || 'private',
      value: 0,
      dataPoints: [],
      usageCount: 0,
      sourceplatforms: []
    };

    this.vaults.set(vault.id, vault);
    return vault;
  }

  addDataPoint(vaultId: string, dataPoint: VaultDataPoint): boolean {
    const vault = this.vaults.get(vaultId);
    if (!vault) return false;

    vault.dataPoints.push({
      ...dataPoint,
      timestamp: new Date()
    });
    
    vault.dataCount++;
    vault.lastUpdated = new Date();
    
    return true;
  }

  searchDataPoints(vaultId: string, query: string): VaultDataPoint[] {
    const vault = this.vaults.get(vaultId);
    if (!vault) return [];

    return vault.dataPoints.filter(point => 
      point.key.toLowerCase().includes(query.toLowerCase()) ||
      String(point.value).toLowerCase().includes(query.toLowerCase())
    );
  }

  getVaultStats(vaultId: string) {
    const vault = this.vaults.get(vaultId);
    if (!vault) return null;

    return {
      dataCount: vault.dataCount,
      cueCount: vault.cueCount,
      value: vault.value,
      usageCount: vault.usageCount,
      lastUpdated: vault.lastUpdated
    };
  }
}

export const dataVaultManager = new DataVaultManager();
