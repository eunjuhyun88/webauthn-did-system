/**
 * 🔐 자격증명 저장소 구현
 * src/database/repositories/credentials.ts
 * 
 * WebAuthn 자격증명 및 DID 관련 보안 정보 관리
 * 암호학적 검증 가능한 자격증명 저장소
 */

import { supabase } from '@/database/supabase/client';
import { WebAuthnCredential } from '@/auth/webauthn/server';
import { nanoid } from 'nanoid';

// =============================================================================
// 🔖 자격증명 타입 정의
// =============================================================================

export interface StoredCredential {
  id: string;
  user_did: string;
  credential_type: 'webauthn' | 'did_proof' | 'api_key' | 'oauth_token';
  credential_id: string;
  public_key?: string;
  private_key_encrypted?: string;
  metadata: CredentialMetadata;
  is_active: boolean;
  expires_at?: Date;
  created_at: Date;
  last_used?: Date;
}

export interface CredentialMetadata {
  device_type?: string;
  biometric_type?: string;
  authenticator_data?: any;
  counter?: number;
  user_agent?: string;
  platform?: string;
  attestation_type?: string;
  transport_methods?: string[];
}

export interface CredentialStats {
  totalCredentials: number;
  activeCredentials: number;
  webauthnCredentials: number;
  recentUsage: number;
  securityScore: number;
  lastActivity?: Date;
}

// =============================================================================
// 📊 자격증명 저장소 인터페이스
// =============================================================================

export interface CredentialRepository {
  create(credential: Omit<StoredCredential, 'id' | 'created_at'>): Promise<{ success: boolean; id?: string; error?: string }>;
  findByUser(userDID: string): Promise<{ success: boolean; credentials?: StoredCredential[]; error?: string }>;
  findByCredentialId(credentialId: string): Promise<{ success: boolean; credential?: StoredCredential; error?: string }>;
  updateLastUsed(credentialId: string): Promise<{ success: boolean; error?: string }>;
  deactivate(credentialId: string, userDID: string): Promise<{ success: boolean; error?: string }>;
  getStats(userDID: string): Promise<{ success: boolean; stats?: CredentialStats; error?: string }>;
  cleanup(): Promise<{ success: boolean; removed?: number; error?: string }>;
}

// =============================================================================
// 🏗️ 자격증명 저장소 구현 클래스
// =============================================================================

class CredentialRepositoryImpl implements CredentialRepository {

  /**
   * 새로운 자격증명 생성 및 저장
   */
  async create(
    credential: Omit<StoredCredential, 'id' | 'created_at'>
  ): Promise<{ success: boolean; id?: string; error?: string }> {
    try {
      console.log(`🔐 자격증명 저장 시작 - 타입: ${credential.credential_type}, 사용자: ${credential.user_did}`);

      const credentialRecord = {
        id: nanoid(),
        user_did: credential.user_did,
        credential_type: credential.credential_type,
        credential_id: credential.credential_id,
        public_key: credential.public_key,
        private_key_encrypted: credential.private_key_encrypted,
        metadata: credential.metadata,
        is_active: credential.is_active,
        expires_at: credential.expires_at?.toISOString(),
        created_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('user_credentials')
        .insert(credentialRecord)
        .select('id')
        .single();

      if (error) {
        throw new Error(`자격증명 저장 실패: ${error.message}`);
      }

      console.log(`✅ 자격증명 저장 완료 - ID: ${data.id}`);

      return {
        success: true,
        id: data.id
      };

    } catch (error) {
      console.error('❌ 자격증명 저장 실패:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '자격증명 저장 실패'
      };
    }
  }

  /**
   * 사용자별 자격증명 목록 조회
   */
  async findByUser(
    userDID: string
  ): Promise<{ success: boolean; credentials?: StoredCredential[]; error?: string }> {
    try {
      console.log(`📋 사용자 자격증명 조회 - DID: ${userDID}`);

      const { data, error } = await supabase
        .from('user_credentials')
        .select('*')
        .eq('user_did', userDID)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      const credentials = data?.map(record => this.mapToStoredCredential(record)) || [];

      console.log(`✅ 사용자 자격증명 조회 완료 - ${credentials.length}개`);

      return {
        success: true,
        credentials
      };

    } catch (error) {
      console.error('❌ 사용자 자격증명 조회 실패:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '사용자 자격증명 조회 실패'
      };
    }
  }

  /**
   * 자격증명 ID로 단일 자격증명 조회
   */
  async findByCredentialId(
    credentialId: string
  ): Promise<{ success: boolean; credential?: StoredCredential; error?: string }> {
    try {
      console.log(`🔍 자격증명 조회 - ID: ${credentialId}`);

      const { data, error } = await supabase
        .from('user_credentials')
        .select('*')
        .eq('credential_id', credentialId)
        .eq('is_active', true)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return {
            success: false,
            error: '자격증명을 찾을 수 없습니다'
          };
        }
        throw error;
      }

      const credential = this.mapToStoredCredential(data);

      console.log(`✅ 자격증명 조회 완료 - ID: ${credentialId}`);

      return {
        success: true,
        credential
      };

    } catch (error) {
      console.error('❌ 자격증명 조회 실패:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '자격증명 조회 실패'
      };
    }
  }

  /**
   * 자격증명 최종 사용시간 업데이트
   */
  async updateLastUsed(
    credentialId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      console.log(`🕒 자격증명 사용시간 업데이트 - ID: ${credentialId}`);

      const { error } = await supabase
        .from('user_credentials')
        .update({
          last_used: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('credential_id', credentialId);

      if (error) {
        throw error;
      }

      console.log(`✅ 자격증명 사용시간 업데이트 완료`);

      return { success: true };

    } catch (error) {
      console.error('❌ 자격증명 사용시간 업데이트 실패:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '사용시간 업데이트 실패'
      };
    }
  }

  /**
   * 자격증명 비활성화
   */
  async deactivate(
    credentialId: string,
    userDID: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      console.log(`🔒 자격증명 비활성화 - ID: ${credentialId}, 사용자: ${userDID}`);

      const { error } = await supabase
        .from('user_credentials')
        .update({
          is_active: false,
          updated_at: new Date().toISOString()
        })
        .eq('credential_id', credentialId)
        .eq('user_did', userDID);

      if (error) {
        throw error;
      }

      console.log(`✅ 자격증명 비활성화 완료`);

      return { success: true };

    } catch (error) {
      console.error('❌ 자격증명 비활성화 실패:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '자격증명 비활성화 실패'
      };
    }
  }

  /**
   * 사용자 자격증명 통계 조회
   */
  async getStats(
    userDID: string
  ): Promise<{ success: boolean; stats?: CredentialStats; error?: string }> {
    try {
      console.log(`📊 자격증명 통계 조회 - DID: ${userDID}`);

      const { data, error } = await supabase
        .from('user_credentials')
        .select('credential_type, is_active, last_used, created_at')
        .eq('user_did', userDID);

      if (error) {
        throw error;
      }

      if (!data) {
        throw new Error('통계 조회 실패');
      }

      const totalCredentials = data.length;
      const activeCredentials = data.filter(c => c.is_active).length;
      const webauthnCredentials = data.filter(c => c.credential_type === 'webauthn').length;

      // 최근 7일간 사용된 자격증명 수
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const recentUsage = data.filter(c => 
        c.last_used && new Date(c.last_used) > weekAgo
      ).length;

      // 보안 점수 계산 (활성화된 자격증명 비율 기반)
      const securityScore = totalCredentials > 0 
        ? Math.round((activeCredentials / totalCredentials) * 100)
        : 0;

      // 최근 활동
      const lastActivityDates = data
        .map(c => c.last_used)
        .filter(date => date)
        .map(date => new Date(date))
        .sort((a, b) => b.getTime() - a.getTime());

      const lastActivity = lastActivityDates.length > 0 ? lastActivityDates[0] : undefined;

      const stats: CredentialStats = {
        totalCredentials,
        activeCredentials,
        webauthnCredentials,
        recentUsage,
        securityScore,
        lastActivity
      };

      console.log(`✅ 자격증명 통계 조회 완료 - 총 ${totalCredentials}개`);

      return {
        success: true,
        stats
      };

    } catch (error) {
      console.error('❌ 자격증명 통계 조회 실패:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '자격증명 통계 조회 실패'
      };
    }
  }

  /**
   * 만료된 자격증명 정리
   */
  async cleanup(): Promise<{ success: boolean; removed?: number; error?: string }> {
    try {
      console.log(`🧹 만료된 자격증명 정리 시작`);

      const now = new Date().toISOString();

      // 만료된 자격증명 비활성화
      const { data, error } = await supabase
        .from('user_credentials')
        .update({
          is_active: false,
          updated_at: now
        })
        .lt('expires_at', now)
        .eq('is_active', true)
        .select('id');

      if (error) {
        throw error;
      }

      const removedCount = data?.length || 0;

      console.log(`✅ 만료된 자격증명 정리 완료 - ${removedCount}개 비활성화`);

      return {
        success: true,
        removed: removedCount
      };

    } catch (error) {
      console.error('❌ 만료된 자격증명 정리 실패:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '자격증명 정리 실패'
      };
    }
  }

  // =============================================================================
  // 🛠️ 내부 유틸리티 메서드들
  // =============================================================================

  /**
   * 데이터베이스 레코드를 StoredCredential로 변환
   */
  private mapToStoredCredential(record: any): StoredCredential {
    return {
      id: record.id,
      user_did: record.user_did,
      credential_type: record.credential_type,
      credential_id: record.credential_id,
      public_key: record.public_key,
      private_key_encrypted: record.private_key_encrypted,
      metadata: record.metadata || {},
      is_active: record.is_active,
      expires_at: record.expires_at ? new Date(record.expires_at) : undefined,
      created_at: new Date(record.created_at),
      last_used: record.last_used ? new Date(record.last_used) : undefined,
    };
  }
}

// =============================================================================
// 🎯 고급 자격증명 작업 함수들
// =============================================================================

/**
 * WebAuthn 자격증명을 저장소에 저장
 */
export async function storeWebAuthnCredential(
  userDID: string,
  webauthnCredential: WebAuthnCredential,
  userAgent?: string
): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    console.log(`🔐 WebAuthn 자격증명 저장 - DID: ${userDID}`);

    const credential: Omit<StoredCredential, 'id' | 'created_at'> = {
      user_did: userDID,
      credential_type: 'webauthn',
      credential_id: webauthnCredential.credential_id,
      public_key: webauthnCredential.public_key,
      metadata: {
        device_type: webauthnCredential.device_type,
        biometric_type: webauthnCredential.biometric_type,
        counter: webauthnCredential.counter,
        user_agent: userAgent,
        platform: 'web',
        transport_methods: ['internal'], // Touch ID, Face ID, Windows Hello
      },
      is_active: true,
    };

    const result = await credentialRepository.create(credential);

    console.log(`✅ WebAuthn 자격증명 저장 완료`);

    return result;

  } catch (error) {
    console.error('❌ WebAuthn 자격증명 저장 실패:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'WebAuthn 자격증명 저장 실패'
    };
  }
}

/**
 * 사용자의 활성 WebAuthn 자격증명 조회
 */
export async function getActiveWebAuthnCredentials(
  userDID: string
): Promise<StoredCredential[]> {
  try {
    const result = await credentialRepository.findByUser(userDID);
    
    if (!result.success || !result.credentials) {
      return [];
    }

    return result.credentials.filter(
      cred => cred.credential_type === 'webauthn' && cred.is_active
    );

  } catch (error) {
    console.error('활성 WebAuthn 자격증명 조회 실패:', error);
    return [];
  }
}

/**
 * 자격증명 보안 검증
 */
export async function validateCredentialSecurity(
  credentialId: string
): Promise<{
  isValid: boolean;
  securityLevel: 'low' | 'medium' | 'high' | 'critical';
  issues: string[];
  recommendations: string[];
}> {
  try {
    const result = await credentialRepository.findByCredentialId(credentialId);
    
    if (!result.success || !result.credential) {
      return {
        isValid: false,
        securityLevel: 'low',
        issues: ['자격증명을 찾을 수 없습니다'],
        recommendations: ['새로운 자격증명을 등록하세요']
      };
    }

    const credential = result.credential;
    const issues: string[] = [];
    const recommendations: string[] = [];
    let securityLevel: 'low' | 'medium' | 'high' | 'critical' = 'high';

    // 만료 검사
    if (credential.expires_at && credential.expires_at < new Date()) {
      issues.push('자격증명이 만료되었습니다');
      securityLevel = 'low';
      recommendations.push('새로운 자격증명을 등록하세요');
    }

    // 최근 사용 검사
    const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    if (!credential.last_used || credential.last_used < monthAgo) {
      issues.push('장기간 사용되지 않은 자격증명입니다');
      if (securityLevel === 'high') securityLevel = 'medium';
      recommendations.push('정기적으로 자격증명을 사용하여 보안을 유지하세요');
    }

    // 생체 인증 검사
    if (credential.credential_type === 'webauthn') {
      const hasBiometric = credential.metadata.biometric_type && 
        credential.metadata.biometric_type !== 'none';
      
      if (!hasBiometric) {
        issues.push('생체 인증이 설정되지 않았습니다');
        if (securityLevel === 'high') securityLevel = 'medium';
        recommendations.push('Touch ID, Face ID 등 생체 인증을 활성화하세요');
      }
    }

    // 플랫폼 인증기 검사
    if (credential.metadata.device_type !== 'platform') {
      issues.push('외부 보안 키를 사용 중입니다');
      recommendations.push('플랫폼 내장 인증기 사용을 권장합니다');
    }

    return {
      isValid: credential.is_active && issues.length === 0,
      securityLevel,
      issues,
      recommendations
    };

  } catch (error) {
    console.error('자격증명 보안 검증 실패:', error);
    return {
      isValid: false,
      securityLevel: 'low',
      issues: ['보안 검증 중 오류가 발생했습니다'],
      recommendations: ['관리자에게 문의하세요']
    };
  }
}

/**
 * 백업 자격증명 생성 추천
 */
export async function recommendBackupCredentials(
  userDID: string
): Promise<{
  needsBackup: boolean;
  currentCredentials: number;
  recommendations: string[];
}> {
  try {
    const activeCredentials = await getActiveWebAuthnCredentials(userDID);
    const currentCredentials = activeCredentials.length;
    const needsBackup = currentCredentials < 2;

    const recommendations: string[] = [];

    if (needsBackup) {
      recommendations.push('최소 2개 이상의 인증 방법을 등록하는 것을 권장합니다');
      
      if (currentCredentials === 0) {
        recommendations.push('주 인증 방법을 먼저 등록하세요');
      } else {
        recommendations.push('백업용 인증 방법을 추가로 등록하세요');
        recommendations.push('다른 기기나 보안 키를 사용할 수 있습니다');
      }
    } else {
      recommendations.push('충분한 백업 인증 방법이 설정되어 있습니다');
      recommendations.push('정기적으로 모든 인증 방법을 테스트하세요');
    }

    return {
      needsBackup,
      currentCredentials,
      recommendations
    };

  } catch (error) {
    console.error('백업 자격증명 추천 실패:', error);
    return {
      needsBackup: true,
      currentCredentials: 0,
      recommendations: ['오류가 발생했습니다. 관리자에게 문의하세요']
    };
  }
}

// 싱글톤 인스턴스 생성 및 내보내기
export const credentialRepository: CredentialRepository = new CredentialRepositoryImpl();