// =============================================================================
// 🧠 CUE 데이터 저장소
// 파일: src/database/repositories/cues.ts
// =============================================================================

import { supabase, supabaseAdmin } from '@/lib/database/supabase';
import type { 
  PersonalCue, 
  CueType, 
  CueContext,
  ExtractedCue,
  CueQueryOptions,
  CueStatistics,
  CreateCueInput,
  PartialCue
} from '@/types/cue';
import type { Database } from '@/types/database';

// =============================================================================
// CUE 저장소 클래스
// =============================================================================

export class CueRepository {
  
  // =============================================================================
  // CUE 생성 및 저장
  // =============================================================================

  async createCue(cueData: {
    user_id: string;
    cue_type: CueType;
    cue_category?: string;
    cue_name: string;
    cue_description?: string;
    cue_data: Record<string, unknown>;
    confidence_score: number;
    context_data?: Record<string, unknown>;
    platform_source?: string;
    original_input?: string;
    processed_input?: Record<string, unknown>;
    ai_model_used?: string;
    processing_metadata?: Record<string, unknown>;
    parent_cue_id?: string;
    related_cue_ids?: string[];
  }): Promise<{ success: boolean; data?: PersonalCue; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('personal_cues')
        .insert({
          ...cueData,
          related_cue_ids: cueData.related_cue_ids || []
        })
        .select()
        .single();

      if (error) {
        console.error('❌ CUE 생성 실패:', error);
        return { success: false, error: error.message };
      }

      console.log('✅ CUE 생성 성공:', data.id);
      return { success: true, data: data as PersonalCue };

    } catch (error) {
      console.error('❌ CUE 생성 중 오류:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '알 수 없는 오류'
      };
    }
  }

  // =============================================================================
  // CUE 조회
  // =============================================================================

  async getCueById(cueId: string): Promise<{ success: boolean; data?: PersonalCue; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('personal_cues')
        .select('*')
        .eq('id', cueId)
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data: data as PersonalCue };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '조회 실패'
      };
    }
  }

  async getUserCues(
    userId: string,
    options: CueQueryOptions = {}
  ): Promise<{ success: boolean; data?: PersonalCue[]; count?: number; error?: string }> {
    try {
      let query = supabase
        .from('personal_cues')
        .select('*', { count: 'exact' })
        .eq('user_id', userId);

      // 상태 필터
      if (options.status) {
        query = query.eq('status', options.status);
      } else {
        query = query.eq('status', 'active'); // 기본값
      }

      // 타입 필터
      if (options.types && options.types.length > 0) {
        query = query.in('cue_type', options.types);
      }

      // 카테고리 필터
      if (options.category) {
        query = query.eq('cue_category', options.category);
      }

      // 신뢰도 필터
      if (options.minConfidence !== undefined) {
        query = query.gte('confidence_score', options.minConfidence);
      }

      // 플랫폼 소스 필터
      if (options.platformSource) {
        query = query.eq('platform_source', options.platformSource);
      }

      // 텍스트 검색
      if (options.searchText) {
        query = query.or(`cue_name.ilike.%${options.searchText}%,cue_description.ilike.%${options.searchText}%`);
      }

      // 정렬
      if (options.sortBy) {
        const ascending = options.sortOrder !== 'desc';
        query = query.order(options.sortBy, { ascending });
      } else {
        query = query.order('confidence_score', { ascending: false });
        query = query.order('created_at', { ascending: false });
      }

      // 페이지네이션
      if (options.limit) {
        query = query.limit(options.limit);
      }

      if (options.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 50) - 1);
      }

      const { data, error, count } = await query;

      if (error) {
        console.error('❌ 사용자 CUE 조회 실패:', error);
        return { success: false, error: error.message };
      }

      return {
        success: true,
        data: data as PersonalCue[],
        count: count || 0
      };

    } catch (error) {
      console.error('❌ 사용자 CUE 조회 중 오류:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '조회 실패'
      };
    }
  }

  // =============================================================================
  // 컨텍스트 기반 CUE 조회
  // =============================================================================

  async getRelevantCues(
    userId: string,
    context: CueContext,
    limit: number = 10
  ): Promise<{ success: boolean; data?: PersonalCue[]; error?: string }> {
    try {
      let query = supabase
        .from('personal_cues')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active');

      // 플랫폼 매칭
      if (context.platform) {
        query = query.eq('platform_source', context.platform);
      }

      // 도메인 매칭 (context_data에서 검색)
      if (context.domain) {
        query = query.contains('context_data', { domain: context.domain });
      }

      // 신뢰도 순으로 정렬
      query = query
        .order('confidence_score', { ascending: false })
        .order('access_count', { ascending: false })
        .limit(limit);

      const { data, error } = await query;

      if (error) {
        console.error('❌ 관련 CUE 조회 실패:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data: data as PersonalCue[] };

    } catch (error) {
      console.error('❌ 관련 CUE 조회 중 오류:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '조회 실패'
      };
    }
  }

  // =============================================================================
  // CUE 패턴 분석
  // =============================================================================

  async findSimilarCues(
    userId: string,
    cueContent: string,
    cueType: CueType,
    limit: number = 5
  ): Promise<{ success: boolean; data?: PersonalCue[]; error?: string }> {
    try {
      // 텍스트 유사성 기반 검색 (PostgreSQL의 similarity 함수 사용)
      const { data, error } = await supabase
        .rpc('find_similar_cues', {
          p_user_id: userId,
          p_content: cueContent,
          p_cue_type: cueType,
          p_limit: limit,
          p_similarity_threshold: 0.3
        });

      if (error) {
        console.error('❌ 유사 CUE 조회 실패:', error);
        // RPC 함수가 없는 경우 기본 검색으로 대체
        return await this.findSimilarCuesBasic(userId, cueContent, cueType, limit);
      }

      return { success: true, data: data as PersonalCue[] };

    } catch (error) {
      console.error('❌ 유사 CUE 조회 중 오류:', error);
      return await this.findSimilarCuesBasic(userId, cueContent, cueType, limit);
    }
  }

  private async findSimilarCuesBasic(
    userId: string,
    cueContent: string,
    cueType: CueType,
    limit: number
  ): Promise<{ success: boolean; data?: PersonalCue[]; error?: string }> {
    try {
      // 기본 텍스트 검색
      const keywords = cueContent.split(' ').filter(word => word.length > 2);
      const searchPattern = keywords.join('|');

      const { data, error } = await supabase
        .from('personal_cues')
        .select('*')
        .eq('user_id', userId)
        .eq('cue_type', cueType)
        .eq('status', 'active')
        .or(`cue_name.ilike.%${searchPattern}%,cue_data->>content.ilike.%${searchPattern}%`)
        .order('confidence_score', { ascending: false })
        .limit(limit);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data: data as PersonalCue[] };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '기본 검색 실패'
      };
    }
  }

  // =============================================================================
  // CUE 업데이트
  // =============================================================================

  async updateCue(
    cueId: string,
    updates: Partial<{
      cue_name: string;
      cue_description: string;
      cue_data: Record<string, unknown>;
      confidence_score: number;
      context_data: Record<string, unknown>;
      effectiveness_score: number;
      status: string;
      related_cue_ids: string[];
    }>
  ): Promise<{ success: boolean; data?: PersonalCue; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('personal_cues')
        .update(updates)
        .eq('id', cueId)
        .select()
        .single();

      if (error) {
        console.error('❌ CUE 업데이트 실패:', error);
        return { success: false, error: error.message };
      }

      console.log('✅ CUE 업데이트 성공:', cueId);
      return { success: true, data: data as PersonalCue };

    } catch (error) {
      console.error('❌ CUE 업데이트 중 오류:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '업데이트 실패'
      };
    }
  }

  // =============================================================================
  // CUE 사용 통계 업데이트
  // =============================================================================

  async incrementCueAccess(cueId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('personal_cues')
        .update({
          access_count: supabase.raw('access_count + 1'),
          last_accessed: new Date().toISOString()
        })
        .eq('id', cueId);

      if (error) {
        console.error('❌ CUE 접근 횟수 업데이트 실패:', error);
        return { success: false, error: error.message };
      }

      return { success: true };

    } catch (error) {
      console.error('❌ CUE 접근 횟수 업데이트 중 오류:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '업데이트 실패'
      };
    }
  }

  async updateEffectivenessScore(
    cueId: string,
    effectivenessScore: number
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('personal_cues')
        .update({ effectiveness_score: effectivenessScore })
        .eq('id', cueId);

      if (error) {
        console.error('❌ CUE 유효성 점수 업데이트 실패:', error);
        return { success: false, error: error.message };
      }

      return { success: true };

    } catch (error) {
      console.error('❌ CUE 유효성 점수 업데이트 중 오류:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '업데이트 실패'
      };
    }
  }

  // =============================================================================
  // CUE 삭제
  // =============================================================================

  async deleteCue(cueId: string, softDelete: boolean = true): Promise<{ success: boolean; error?: string }> {
    try {
      if (softDelete) {
        // 소프트 삭제 (상태만 변경)
        const { error } = await supabase
          .from('personal_cues')
          .update({ status: 'archived' })
          .eq('id', cueId);

        if (error) {
          return { success: false, error: error.message };
        }
      } else {
        // 하드 삭제 (완전 삭제)
        const { error } = await supabase
          .from('personal_cues')
          .delete()
          .eq('id', cueId);

        if (error) {
          return { success: false, error: error.message };
        }
      }

      console.log('✅ CUE 삭제 성공:', cueId);
      return { success: true };

    } catch (error) {
      console.error('❌ CUE 삭제 중 오류:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '삭제 실패'
      };
    }
  }

  // =============================================================================
  // CUE 통계 및 분석
  // =============================================================================

  async getUserCueStatistics(userId: string): Promise<{ success: boolean; data?: CueStatistics; error?: string }> {
    try {
      // 기본 통계 조회
      const { data: basicStats, error: basicError } = await supabase
        .from('personal_cues')
        .select('cue_type, status, confidence_score, effectiveness_score, created_at')
        .eq('user_id', userId);

      if (basicError) {
        return { success: false, error: basicError.message };
      }

      // 통계 계산
      const totalCues = basicStats.length;
      const activeCues = basicStats.filter(c => c.status === 'active').length;
      
      const typeDistribution = basicStats.reduce((acc, cue) => {
        acc[cue.cue_type] = (acc[cue.cue_type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const avgConfidence = basicStats.length > 0 
        ? basicStats.reduce((sum, cue) => sum + (cue.confidence_score || 0), 0) / basicStats.length 
        : 0;

      const avgEffectiveness = basicStats.length > 0
        ? basicStats.reduce((sum, cue) => sum + (cue.effectiveness_score || 0), 0) / basicStats.length
        : 0;

      // 최근 활동
      const recentCues = basicStats
        .filter(c => c.created_at)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 10);

      const statistics: CueStatistics = {
        userId,
        totalCues,
        activeCues,
        archivedCues: totalCues - activeCues,
        averageConfidence: avgConfidence,
        averageEffectiveness: avgEffectiveness,
        typeDistribution,
        recentActivity: recentCues.map(c => ({
          date: c.created_at,
          type: c.cue_type,
          confidence: c.confidence_score || 0
        })),
        generatedAt: new Date().toISOString()
      };

      return { success: true, data: statistics };

    } catch (error) {
      console.error('❌ CUE 통계 조회 중 오류:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '통계 조회 실패'
      };
    }
  }

  // =============================================================================
  // 배치 작업
  // =============================================================================

  async createMultipleCues(
    cuesData: Array<{
      user_id: string;
      cue_type: CueType;
      cue_category?: string;
      cue_name: string;
      cue_data: Record<string, unknown>;
      confidence_score: number;
      context_data?: Record<string, unknown>;
    }>
  ): Promise<{ success: boolean; data?: PersonalCue[]; created: number; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('personal_cues')
        .insert(cuesData)
        .select();

      if (error) {
        console.error('❌ 배치 CUE 생성 실패:', error);
        return { success: false, error: error.message, created: 0 };
      }

      console.log(`✅ 배치 CUE 생성 성공: ${data.length}개`);
      return {
        success: true,
        data: data as PersonalCue[],
        created: data.length
      };

    } catch (error) {
      console.error('❌ 배치 CUE 생성 중 오류:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '배치 생성 실패',
        created: 0
      };
    }
  }

  // =============================================================================
  // 관리자 기능
  // =============================================================================

  async getSystemCueStatistics(): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      if (!supabaseAdmin) {
        return { success: false, error: '관리자 권한이 필요합니다' };
      }

      const { data, error } = await supabaseAdmin
        .from('cue_statistics')
        .select('*')
        .order('total_cues', { ascending: false });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '시스템 통계 조회 실패'
      };
    }
  }

  async cleanupOldCues(daysOld: number = 90): Promise<{ success: boolean; deleted: number; error?: string }> {
    try {
      if (!supabaseAdmin) {
        return { success: false, error: '관리자 권한이 필요합니다', deleted: 0 };
      }

      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const { data, error } = await supabaseAdmin
        .from('personal_cues')
        .delete()
        .eq('status', 'archived')
        .lt('updated_at', cutoffDate.toISOString())
        .select('id');

      if (error) {
        return { success: false, error: error.message, deleted: 0 };
      }

      const deletedCount = data.length;
      console.log(`✅ 오래된 CUE ${deletedCount}개 정리 완료`);
      
      return { success: true, deleted: deletedCount };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'CUE 정리 실패',
        deleted: 0
      };
    }
  }
}

// =============================================================================
// 싱글톤 인스턴스
// =============================================================================

let cueRepositoryInstance: CueRepository | null = null;

export function getCueRepository(): CueRepository {
  if (!cueRepositoryInstance) {
    cueRepositoryInstance = new CueRepository();
  }
  return cueRepositoryInstance;
}

// 기본 내보내기
export default CueRepository;