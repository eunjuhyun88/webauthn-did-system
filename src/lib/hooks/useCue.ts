/**
 * 🧠 useCue 훅 구현
 * src/lib/hooks/useCue.ts
 * 
 * AI 대화 맥락(Cue) 관리를 위한 React 훅
 * 실시간 Cue 추출, 저장, 조회, 분석 기능
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  CueObject, 
  CueExtractionResult, 
  CuePlatform,
  CueSearchQuery,
  QualityMetrics 
} from '@/types/cue';
import { cueRepository, CueStats, extractAndSaveCue, findSimilarCues } from '@/database/repositories/cues';
import { useAuth } from './useAuth';

// =============================================================================
// 🔖 Cue 훅 타입 정의
// =============================================================================

export interface CueState {
  cues: CueObject[];
  currentCue: CueObject | null;
  isExtracting: boolean;
  isLoading: boolean;
  error: string | null;
  stats: CueStats | null;
  similarCues: CueObject[];
  searchResults: CueObject[];
  totalSearchResults: number;
}

export interface CueActions {
  extractCue: (userMessage: string, aiResponse: string, platform: CuePlatform) => Promise<CueExtractionResult>;
  loadCues: (limit?: number) => Promise<void>;
  searchCues: (query: CueSearchQuery) => Promise<void>;
  getCueById: (id: string) => Promise<CueObject | null>;
  updateCue: (id: string, updates: Partial<CueObject>) => Promise<boolean>;
  deleteCue: (id: string) => Promise<boolean>;
  findSimilar: (cue: CueObject) => Promise<void>;
  loadStats: () => Promise<void>;
  clearError: () => void;
  resetSearch: () => void;
}

export interface UseCueOptions {
  autoLoad?: boolean;
  enableRealTimeExtraction?: boolean;
  qualityThreshold?: number;
  maxSimilarCues?: number;
}

// =============================================================================
// 🎣 메인 useCue 훅
// =============================================================================

export function useCue(options: UseCueOptions = {}): CueState & CueActions {
  const { user } = useAuth();
  const {
    autoLoad = true,
    enableRealTimeExtraction = true,
    qualityThreshold = 70,
    maxSimilarCues = 5
  } = options;

  // 상태 관리
  const [state, setState] = useState<CueState>({
    cues: [],
    currentCue: null,
    isExtracting: false,
    isLoading: false,
    error: null,
    stats: null,
    similarCues: [],
    searchResults: [],
    totalSearchResults: 0,
  });

  // 추출 중인 대화를 추적하기 위한 ref
  const extractionRef = useRef<Set<string>>(new Set());

  // =============================================================================
  // 🧠 Cue 추출 함수
  // =============================================================================

  const extractCue = useCallback(async (
    userMessage: string,
    aiResponse: string,
    platform: CuePlatform
  ): Promise<CueExtractionResult> => {
    if (!user) {
      return {
        success: false,
        confidenceScore: 0,
        extractionTime: 0,
        errors: ['인증이 필요합니다']
      };
    }

    // 중복 추출 방지
    const conversationKey = `${userMessage.substring(0, 50)}-${aiResponse.substring(0, 50)}`;
    if (extractionRef.current.has(conversationKey)) {
      console.log('⏭️ 중복 Cue 추출 요청 무시');
      return {
        success: false,
        confidenceScore: 0,
        extractionTime: 0,
        errors: ['이미 추출 중인 대화입니다']
      };
    }

    try {
      console.log(`🧠 Cue 추출 시작 - 플랫폼: ${platform}`);

      setState(prev => ({ 
        ...prev, 
        isExtracting: true, 
        error: null 
      }));

      extractionRef.current.add(conversationKey);

      // Cue 추출 및 저장
      const result = await extractAndSaveCue(
        userMessage,
        aiResponse,
        user.did,
        platform
      );

      if (result.success && result.cueObject) {
        // 품질 임계값 확인
        const qualityScore = result.cueObject.qualityMetrics.contextPreservationScore;
        
        if (qualityScore >= qualityThreshold) {
          // 새 Cue를 목록에 추가
          setState(prev => ({
            ...prev,
            cues: [result.cueObject!, ...prev.cues],
            currentCue: result.cueObject!,
            isExtracting: false,
          }));

          // 유사한 Cue 자동 탐색
          if (enableRealTimeExtraction) {
            findSimilar(result.cueObject!);
          }

          console.log(`✅ Cue 추출 완료 - 품질: ${qualityScore}%`);
        } else {
          console.log(`⚠️ Cue 품질 미달 - 품질: ${qualityScore}%, 임계값: ${qualityThreshold}%`);
          setState(prev => ({
            ...prev,
            isExtracting: false,
            error: `추출된 Cue의 품질이 임계값(${qualityThreshold}%)에 미달합니다`
          }));
        }
      } else {
        setState(prev => ({
          ...prev,
          isExtracting: false,
          error: result.errors?.[0] || 'Cue 추출 실패'
        }));
      }

      return result;

    } catch (error) {
      console.error('❌ Cue 추출 오류:', error);

      setState(prev => ({
        ...prev,
        isExtracting: false,
        error: error instanceof Error ? error.message : 'Cue 추출 오류'
      }));

      return {
        success: false,
        confidenceScore: 0,
        extractionTime: 0,
        errors: [error instanceof Error ? error.message : 'Cue 추출 오류']
      };

    } finally {
      extractionRef.current.delete(conversationKey);
    }
  }, [user, qualityThreshold, enableRealTimeExtraction]);

  // =============================================================================
  // 📋 Cue 목록 로드
  // =============================================================================

  const loadCues = useCallback(async (limit: number = 50): Promise<void> => {
    if (!user) {
      setState(prev => ({ ...prev, error: '인증이 필요합니다' }));
      return;
    }

    try {
      console.log(`📋 Cue 목록 로드 - 제한: ${limit}`);

      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const result = await cueRepository.findByUser(user.did, limit);

      if (result.success && result.cues) {
        setState(prev => ({
          ...prev,
          cues: result.cues!,
          isLoading: false,
        }));

        console.log(`✅ Cue 목록 로드 완료 - ${result.cues.length}개`);
      } else {
        throw new Error(result.error || 'Cue 목록 로드 실패');
      }

    } catch (error) {
      console.error('❌ Cue 목록 로드 실패:', error);

      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Cue 목록 로드 실패'
      }));
    }
  }, [user]);

  // =============================================================================
  // 🔍 Cue 검색
  // =============================================================================

  const searchCues = useCallback(async (query: CueSearchQuery): Promise<void> => {
    if (!user) {
      setState(prev => ({ ...prev, error: '인증이 필요합니다' }));
      return;
    }

    try {
      console.log(`🔍 Cue 검색 - 쿼리: ${query.query}`);

      setState(prev => ({ ...prev, isLoading: true, error: null }));

      // 사용자 필터 추가
      const searchQuery: CueSearchQuery = {
        ...query,
        filters: [
          ...(query.filters || []),
          { field: 'user_did', operator: 'eq', value: user.did },
          { field: 'is_archived', operator: 'eq', value: false }
        ]
      };

      const result = await cueRepository.search(searchQuery);

      if (result.success) {
        setState(prev => ({
          ...prev,
          searchResults: result.cues || [],
          totalSearchResults: result.total || 0,
          isLoading: false,
        }));

        console.log(`✅ Cue 검색 완료 - ${result.cues?.length || 0}개 결과`);
      } else {
        throw new Error(result.error || 'Cue 검색 실패');
      }

    } catch (error) {
      console.error('❌ Cue 검색 실패:', error);

      setState(prev => ({
        ...prev,
        isLoading: false,
        searchResults: [],
        totalSearchResults: 0,
        error: error instanceof Error ? error.message : 'Cue 검색 실패'
      }));
    }
  }, [user]);

  // =============================================================================
  // 🔍 개별 Cue 조회
  // =============================================================================

  const getCueById = useCallback(async (id: string): Promise<CueObject | null> => {
    try {
      console.log(`🔍 Cue 조회 - ID: ${id}`);

      const result = await cueRepository.findById(id);

      if (result.success && result.cue) {
        setState(prev => ({
          ...prev,
          currentCue: result.cue!,
        }));

        console.log(`✅ Cue 조회 완료 - ID: ${id}`);
        return result.cue;
      } else {
        console.warn('Cue를 찾을 수 없습니다:', result.error);
        return null;
      }

    } catch (error) {
      console.error('❌ Cue 조회 실패:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Cue 조회 실패'
      }));
      return null;
    }
  }, []);

  // =============================================================================
  // 📝 Cue 업데이트
  // =============================================================================

  const updateCue = useCallback(async (
    id: string, 
    updates: Partial<CueObject>
  ): Promise<boolean> => {
    try {
      console.log(`📝 Cue 업데이트 - ID: ${id}`);

      const result = await cueRepository.update(id, updates);

      if (result.success) {
        // 로컬 상태 업데이트
        setState(prev => ({
          ...prev,
          cues: prev.cues.map(cue => 
            cue.id === id ? { ...cue, ...updates } : cue
          ),
          currentCue: prev.currentCue?.id === id 
            ? { ...prev.currentCue, ...updates } 
            : prev.currentCue,
        }));

        console.log(`✅ Cue 업데이트 완료 - ID: ${id}`);
        return true;
      } else {
        throw new Error(result.error || 'Cue 업데이트 실패');
      }

    } catch (error) {
      console.error('❌ Cue 업데이트 실패:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Cue 업데이트 실패'
      }));
      return false;
    }
  }, []);

  // =============================================================================
  // 🗑️ Cue 삭제
  // =============================================================================

  const deleteCue = useCallback(async (id: string): Promise<boolean> => {
    try {
      console.log(`🗑️ Cue 삭제 - ID: ${id}`);

      const result = await cueRepository.delete(id);

      if (result.success) {
        // 로컬 상태에서 제거
        setState(prev => ({
          ...prev,
          cues: prev.cues.filter(cue => cue.id !== id),
          currentCue: prev.currentCue?.id === id ? null : prev.currentCue,
          similarCues: prev.similarCues.filter(cue => cue.id !== id),
          searchResults: prev.searchResults.filter(cue => cue.id !== id),
        }));

        console.log(`✅ Cue 삭제 완료 - ID: ${id}`);
        return true;
      } else {
        throw new Error(result.error || 'Cue 삭제 실패');
      }

    } catch (error) {
      console.error('❌ Cue 삭제 실패:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Cue 삭제 실패'
      }));
      return false;
    }
  }, []);

  // =============================================================================
  // 🔗 유사한 Cue 찾기
  // =============================================================================

  const findSimilar = useCallback(async (cue: CueObject): Promise<void> => {
    if (!user) return;

    try {
      console.log(`🔗 유사한 Cue 탐색 - ID: ${cue.id}`);

      const similarCues = await findSimilarCues(user.did, cue, maxSimilarCues);

      setState(prev => ({
        ...prev,
        similarCues,
      }));

      console.log(`✅ 유사한 Cue 탐색 완료 - ${similarCues.length}개 발견`);

    } catch (error) {
      console.error('❌ 유사한 Cue 탐색 실패:', error);
    }
  }, [user, maxSimilarCues]);

  // =============================================================================
  // 📊 통계 로드
  // =============================================================================

  const loadStats = useCallback(async (): Promise<void> => {
    if (!user) {
      setState(prev => ({ ...prev, error: '인증이 필요합니다' }));
      return;
    }

    try {
      console.log('📊 Cue 통계 로드');

      const result = await cueRepository.getStats(user.did);

      if (result.success && result.stats) {
        setState(prev => ({
          ...prev,
          stats: result.stats!,
        }));

        console.log('✅ Cue 통계 로드 완료');
      } else {
        throw new Error(result.error || 'Cue 통계 로드 실패');
      }

    } catch (error) {
      console.error('❌ Cue 통계 로드 실패:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Cue 통계 로드 실패'
      }));
    }
  }, [user]);

  // =============================================================================
  // 🛠️ 유틸리티 함수들
  // =============================================================================

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const resetSearch = useCallback(() => {
    setState(prev => ({
      ...prev,
      searchResults: [],
      totalSearchResults: 0,
    }));
  }, []);

  // =============================================================================
  // 🚀 초기화 및 이펙트
  // =============================================================================

  useEffect(() => {
    if (user && autoLoad) {
      loadCues();
      loadStats();
    }
  }, [user, autoLoad, loadCues, loadStats]);

  // 정리
  useEffect(() => {
    return () => {
      extractionRef.current.clear();
    };
  }, []);

  // 상태 및 액션 반환
  return {
    ...state,
    extractCue,
    loadCues,
    searchCues,
    getCueById,
    updateCue,
    deleteCue,
    findSimilar,
    loadStats,
    clearError,
    resetSearch,
  };
}

// =============================================================================
// 🎯 특화된 Cue 훅들
// =============================================================================

/**
 * 실시간 대화 추출을 위한 훅
 */
export function useRealtimeCueExtraction(platform: CuePlatform) {
  const { extractCue, isExtracting, currentCue, error } = useCue({
    enableRealTimeExtraction: true,
    qualityThreshold: 70,
  });

  const [conversationBuffer, setConversationBuffer] = useState<{
    userMessage: string;
    aiResponse: string;
    timestamp: Date;
  } | null>(null);

  const extractFromConversation = useCallback(async (
    userMessage: string,
    aiResponse: string
  ) => {
    // 대화 버퍼 업데이트
    setConversationBuffer({
      userMessage,
      aiResponse,
      timestamp: new Date(),
    });

    // Cue 추출 실행
    return await extractCue(userMessage, aiResponse, platform);
  }, [extractCue, platform]);

  return {
    extractFromConversation,
    isExtracting,
    currentCue,
    error,
    conversationBuffer,
  };
}

/**
 * Cue 품질 분석을 위한 훅
 */
export function useCueQualityAnalysis() {
  const { cues, stats } = useCue();

  const [qualityAnalysis, setQualityAnalysis] = useState<{
    averageQuality: number;
    qualityTrend: 'improving' | 'stable' | 'declining';
    topQualityCues: CueObject[];
    lowQualityCues: CueObject[];
    qualityDistribution: { range: string; count: number }[];
  } | null>(null);

  const analyzeQuality = useCallback(() => {
    if (cues.length === 0) {
      setQualityAnalysis(null);
      return;
    }

    const qualities = cues.map(cue => cue.qualityMetrics.contextPreservationScore);
    const averageQuality = qualities.reduce((sum, q) => sum + q, 0) / qualities.length;

    // 품질 트렌드 계산 (최근 10개 vs 이전 10개)
    const recentQualities = qualities.slice(0, 10);
    const olderQualities = qualities.slice(10, 20);
    const recentAvg = recentQualities.reduce((sum, q) => sum + q, 0) / recentQualities.length;
    const olderAvg = olderQualities.reduce((sum, q) => sum + q, 0) / olderQualities.length;
    
    let qualityTrend: 'improving' | 'stable' | 'declining' = 'stable';
    if (recentAvg > olderAvg + 5) qualityTrend = 'improving';
    else if (recentAvg < olderAvg - 5) qualityTrend = 'declining';

    // 상위/하위 품질 Cue
    const sortedCues = [...cues].sort((a, b) => 
      b.qualityMetrics.contextPreservationScore - a.qualityMetrics.contextPreservationScore
    );
    const topQualityCues = sortedCues.slice(0, 5);
    const lowQualityCues = sortedCues.slice(-5).reverse();

    // 품질 분포
    const qualityDistribution = [
      { range: '90-100%', count: qualities.filter(q => q >= 90).length },
      { range: '80-89%', count: qualities.filter(q => q >= 80 && q < 90).length },
      { range: '70-79%', count: qualities.filter(q => q >= 70 && q < 80).length },
      { range: '60-69%', count: qualities.filter(q => q >= 60 && q < 70).length },
      { range: '0-59%', count: qualities.filter(q => q < 60).length },
    ];

    setQualityAnalysis({
      averageQuality,
      qualityTrend,
      topQualityCues,
      lowQualityCues,
      qualityDistribution,
    });

  }, [cues]);

  useEffect(() => {
    analyzeQuality();
  }, [analyzeQuality]);

  return {
    qualityAnalysis,
    analyzeQuality,
    stats,
  };
}

/**
 * Cue 검색 및 필터링을 위한 훅
 */
export function useCueSearch() {
  const { searchCues, searchResults, totalSearchResults, isLoading, resetSearch } = useCue();

  const [activeFilters, setActiveFilters] = useState<{
    platform?: CuePlatform;
    dateRange?: { start: Date; end: Date };
    qualityRange?: { min: number; max: number };
    tags?: string[];
  }>({});

  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  const performSearch = useCallback(async (
    query: string,
    filters?: typeof activeFilters
  ) => {
    const searchQuery: CueSearchQuery = {
      query,
      filters: [],
      limit: 50,
      sortBy: 'created_at',
      sortOrder: 'desc',
    };

    // 필터 적용
    const appliedFilters = { ...activeFilters, ...filters };

    if (appliedFilters.platform) {
      searchQuery.filters!.push({
        field: 'source_platform',
        operator: 'eq',
        value: appliedFilters.platform
      });
    }

    if (appliedFilters.dateRange) {
      searchQuery.filters!.push({
        field: 'created_at',
        operator: 'gte',
        value: appliedFilters.dateRange.start.toISOString()
      });
      searchQuery.filters!.push({
        field: 'created_at',
        operator: 'lte',
        value: appliedFilters.dateRange.end.toISOString()
      });
    }

    if (appliedFilters.qualityRange) {
      searchQuery.filters!.push({
        field: 'quality_metrics->contextPreservationScore',
        operator: 'gte',
        value: appliedFilters.qualityRange.min
      });
      searchQuery.filters!.push({
        field: 'quality_metrics->contextPreservationScore',
        operator: 'lte',
        value: appliedFilters.qualityRange.max
      });
    }

    await searchCues(searchQuery);

    // 검색 기록 업데이트
    if (query.trim()) {
      setSearchHistory(prev => {
        const newHistory = [query, ...prev.filter(h => h !== query)];
        return newHistory.slice(0, 10); // 최대 10개
      });
    }

    setActiveFilters(appliedFilters);
  }, [searchCues, activeFilters]);

  const clearFilters = useCallback(() => {
    setActiveFilters({});
    resetSearch();
  }, [resetSearch]);

  return {
    performSearch,
    searchResults,
    totalSearchResults,
    isLoading,
    activeFilters,
    setActiveFilters,
    searchHistory,
    clearFilters,
    resetSearch,
  };
}