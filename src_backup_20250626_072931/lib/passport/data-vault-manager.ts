// =============================================================================
// 🗄️ AI Passport 데이터 볼트 관리자
// =============================================================================

import { DataVault, VaultDataPoint } from '@/types/passport';

export class DataVaultManager {
  private vaults: Map<string, DataVault> = new Map();

  createVault(config: Partial<DataVault>): DataVault {
    const vault: DataVault = {
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
      name: config.name || 'New Vault',
      category: config.category || 'identity',
      description: config.description || '',
      dataCount: 0,
      cueCount: 0,
      encrypted: true,
      accessLevel: config.accessLevel || 'private',
      value: 0,
      dataPoints: [],
      usageCount: 0,
      sourcePlatforms: [],
      securityLevel: config.securityLevel || 3,
      ragIndex: 0,
      dagComplexity: 0
    };

    this.vaults.set(vault.id, vault);
    return vault;
  }

  addDataPoint(vaultId: string, dataPoint: Omit<VaultDataPoint, 'timestamp'>): boolean {
    const vault = this.vaults.get(vaultId);
    if (!vault) return false;

    const newDataPoint: VaultDataPoint = {
      ...dataPoint,
      timestamp: new Date()
    };

    vault.dataPoints.push(newDataPoint);
    vault.dataCount++;
    vault.updatedAt = new Date();
    
    // RAG 인덱스 업데이트
    this.updateRAGIndex(vault);
    
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
      ragIndex: vault.ragIndex,
      dagComplexity: vault.dagComplexity,
      lastUpdated: vault.updatedAt
    };
  }

  private updateRAGIndex(vault: DataVault): void {
    // 간단한 RAG 인덱스 계산
    const totalDataPoints = vault.dataPoints.length;
    const uniqueSources = new Set(vault.dataPoints.map(p => p.source)).size;
    
    vault.ragIndex = totalDataPoints > 0 ? (uniqueSources / totalDataPoints) * 0.9 + 0.1 : 0;
    vault.dagComplexity = Math.min(totalDataPoints / 100, 1);
  }

  getAllVaults(): DataVault[] {
    return Array.from(this.vaults.values());
  }

  getVault(vaultId: string): DataVault | null {
    return this.vaults.get(vaultId) || null;
  }

  updateVault(vaultId: string, updates: Partial<DataVault>): boolean {
    const vault = this.vaults.get(vaultId);
    if (!vault) return false;

    Object.assign(vault, updates, { updatedAt: new Date() });
    return true;
  }

  deleteVault(vaultId: string): boolean {
    return this.vaults.delete(vaultId);
  }
}

export const dataVaultManager = new DataVaultManager();
