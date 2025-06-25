-- =============================================================================
-- 🧠 완전 새로운 Cue 최적화 WebAuthn + DID 시스템 스키마
-- src/database/migrations/001_fresh_cue_optimized_schema.sql
-- 기존 테이블 완전 삭제 후 Cue 시스템에 최적화된 새로운 구조 생성
-- =============================================================================

-- 🧹 기존 테이블 완전 정리 (CASCADE로 모든 종속성 제거)
DROP TABLE IF EXISTS system_metrics CASCADE;
DROP TABLE IF EXISTS usage_analytics CASCADE;
DROP TABLE IF EXISTS user_activity_logs CASCADE;
DROP TABLE IF EXISTS ai_messages CASCADE;
DROP TABLE IF EXISTS ai_conversations CASCADE;
DROP TABLE IF EXISTS ai_agents CASCADE;
DROP TABLE IF EXISTS did_documents CASCADE;
DROP TABLE IF EXISTS webauthn_credentials CASCADE;
DROP TABLE IF EXISTS auth_sessions CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 기존 함수들도 정리
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS generate_user_did() CASCADE;
DROP FUNCTION IF EXISTS generate_agent_did(TEXT, TEXT) CASCADE;

-- 필수 확장 기능 활성화
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- 텍스트 유사도 검색용

-- =============================================================================
-- 🎯 1. 핵심 사용자 프로필 (Cue 시스템 중심 설계)
-- =============================================================================

-- 사용자 프로필 (Cue 학습 및 개인화 최적화)
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  did TEXT UNIQUE NOT NULL,  -- W3C DID 표준: did:cue:user:xxxx
  
  -- 기본 정보
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  
  -- Cue 시스템 핵심 설정
  communication_style TEXT DEFAULT 'adaptive' CHECK (
    communication_style IN ('formal', 'casual', 'technical', 'creative', 'adaptive')
  ),
  response_preference TEXT DEFAULT 'balanced' CHECK (
    response_preference IN ('brief', 'detailed', 'examples', 'step-by-step', 'balanced')
  ),
  learning_style TEXT DEFAULT 'mixed' CHECK (
    learning_style IN ('visual', 'textual', 'interactive', 'structured', 'mixed')
  ),
  interaction_context TEXT DEFAULT 'general' CHECK (
    interaction_context IN ('work', 'study', 'personal', 'research', 'general')
  ),
  
  -- 개인화 메타데이터 (Cue 학습 기반)
  personality_profile JSONB DEFAULT '{
    "openness": 0.5,
    "conscientiousness": 0.5,
    "extraversion": 0.5,
    "agreeableness": 0.5,
    "neuroticism": 0.5,
    "curiosity": 0.7,
    "analytical": 0.6
  }',
  
  -- 언어 및 지역 설정
  primary_language TEXT DEFAULT 'ko',
  secondary_languages TEXT[] DEFAULT ARRAY['en'],
  timezone TEXT DEFAULT 'Asia/Seoul',
  
  -- Cue 학습 설정
  cue_learning_enabled BOOLEAN DEFAULT TRUE,
  auto_cue_extraction BOOLEAN DEFAULT TRUE,
  cue_confidence_threshold DECIMAL(3,2) DEFAULT 0.3,
  max_cues_per_type INTEGER DEFAULT 50,
  
  -- 프라이버시 및 보안 설정
  data_retention_days INTEGER DEFAULT 365,
  share_anonymized_data BOOLEAN DEFAULT FALSE,
  cross_platform_sync BOOLEAN DEFAULT TRUE,
  encryption_level TEXT DEFAULT 'standard' CHECK (encryption_level IN ('standard', 'high', 'maximum')),
  
  -- 상태 및 인증
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended', 'deleted')),
  auth_method TEXT DEFAULT 'webauthn' CHECK (auth_method IN ('webauthn', 'oauth', 'demo')),
  email_verified BOOLEAN DEFAULT FALSE,
  
  -- 통계 및 메트릭 (Cue 시스템 성능 추적)
  total_interactions INTEGER DEFAULT 0,
  successful_cue_applications INTEGER DEFAULT 0,
  average_satisfaction_score DECIMAL(3,2) DEFAULT 0.0,
  cue_learning_score DECIMAL(3,2) DEFAULT 0.0, -- 얼마나 잘 학습되고 있는지
  
  -- 타임스탬프
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login_at TIMESTAMP WITH TIME ZONE,
  last_cue_update_at TIMESTAMP WITH TIME ZONE,
  
  -- 검색 최적화
  search_vector TSVECTOR
);

-- 사용자 전문성 및 컨텍스트 (Cue 추출을 위한 기반 데이터)
CREATE TABLE user_expertise_contexts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_did TEXT REFERENCES user_profiles(did) ON DELETE CASCADE,
  
  -- 전문성 영역
  domain TEXT NOT NULL, -- 'programming', 'design', 'business', 'research', 'education' 등
  subdomain TEXT, -- 'react', 'ui_ux', 'marketing', 'machine_learning' 등
  skill_level TEXT DEFAULT 'learning' CHECK (
    skill_level IN ('novice', 'learning', 'competent', 'proficient', 'expert', 'master')
  ),
  
  -- Cue 학습 관련 신뢰도
  confidence_score DECIMAL(3,2) DEFAULT 0.5,
  evidence_strength TEXT DEFAULT 'low' CHECK (evidence_strength IN ('low', 'medium', 'high', 'verified')),
  source_evidence TEXT[] DEFAULT ARRAY[]::TEXT[], -- 증거가 된 메시지/대화 ID들
  
  -- 컨텍스트 정보
  typical_use_cases TEXT[] DEFAULT ARRAY[]::TEXT[],
  preferred_tools TEXT[] DEFAULT ARRAY[]::TEXT[],
  common_patterns JSONB DEFAULT '{}', -- 자주 사용하는 패턴들
  
  -- 학습 메타데이터
  learning_velocity DECIMAL(3,2) DEFAULT 0.5, -- 이 영역에서 얼마나 빨리 학습하는지
  interaction_frequency TEXT DEFAULT 'occasional' CHECK (
    interaction_frequency IN ('rare', 'occasional', 'frequent', 'daily', 'intensive')
  ),
  
  -- 시간 추적
  first_observed TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_reinforced TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_applied TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_did, domain, subdomain)
);

-- =============================================================================
-- 🔐 2. WebAuthn 보안 시스템 (Cue 컨텍스트 통합)
-- =============================================================================

-- WebAuthn 자격증명 (Cue 시스템과 연동된 컨텍스트 포함)
CREATE TABLE webauthn_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_did TEXT REFERENCES user_profiles(did) ON DELETE CASCADE,
  
  -- 핵심 WebAuthn 데이터
  credential_id TEXT UNIQUE NOT NULL,
  public_key BYTEA NOT NULL,
  counter BIGINT DEFAULT 0,
  
  -- 디바이스 및 인증기 정보
  aaguid UUID,
  device_type TEXT DEFAULT 'platform' CHECK (device_type IN ('platform', 'cross-platform', 'hybrid')),
  device_name TEXT,
  device_model TEXT,
  authenticator_attachment TEXT CHECK (authenticator_attachment IN ('platform', 'cross-platform')),
  transports TEXT[] DEFAULT ARRAY[]::TEXT[],
  
  -- 보안 설정
  backup_eligible BOOLEAN DEFAULT FALSE,
  backup_state BOOLEAN DEFAULT FALSE,
  user_verification TEXT DEFAULT 'preferred' CHECK (
    user_verification IN ('required', 'preferred', 'discouraged')
  ),
  resident_key BOOLEAN DEFAULT FALSE,
  
  -- Cue 시스템 연동 (사용 패턴 학습)
  usage_context JSONB DEFAULT '{}', -- 언제, 어떤 상황에서 사용하는지
  preferred_for_contexts TEXT[] DEFAULT ARRAY[]::TEXT[], -- 어떤 컨텍스트에서 선호하는지
  security_confidence DECIMAL(3,2) DEFAULT 1.0, -- 이 인증 방법의 신뢰도
  
  -- 사용 통계 (Cue 학습에 활용)
  total_uses INTEGER DEFAULT 0,
  successful_uses INTEGER DEFAULT 0,
  last_used_at TIMESTAMP WITH TIME ZONE,
  last_used_context TEXT, -- 마지막 사용 컨텍스트
  average_use_duration INTEGER DEFAULT 0, -- 평균 인증 소요 시간 (ms)
  
  -- 상태
  is_active BOOLEAN DEFAULT TRUE,
  is_primary BOOLEAN DEFAULT FALSE, -- 주 인증 수단인지
  
  -- 메타데이터
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- WebAuthn 인증 세션 (Cue 기반 적응형 보안)
CREATE TABLE webauthn_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_did TEXT REFERENCES user_profiles(did) ON DELETE CASCADE,
  credential_id TEXT REFERENCES webauthn_credentials(credential_id) ON DELETE CASCADE,
  
  -- 세션 정보
  session_type TEXT CHECK (session_type IN ('registration', 'authentication')),
  challenge TEXT UNIQUE NOT NULL,
  challenge_expires_at TIMESTAMP WITH TIME ZONE,
  
  -- 컨텍스트 정보 (Cue 학습용)
  request_context JSONB DEFAULT '{}', -- 요청 시점의 컨텍스트
  device_context JSONB DEFAULT '{}', -- 디바이스 정보
  location_context JSONB DEFAULT '{}', -- 위치 정보 (대략적)
  behavioral_context JSONB DEFAULT '{}', -- 행동 패턴 분석
  
  -- 보안 분석
  risk_score DECIMAL(3,2) DEFAULT 0.0, -- 0.0 (안전) ~ 1.0 (위험)
  anomaly_flags TEXT[] DEFAULT ARRAY[]::TEXT[],
  trust_level DECIMAL(3,2) DEFAULT 0.5,
  
  -- 세션 상태
  status TEXT DEFAULT 'pending' CHECK (
    status IN ('pending', 'completed', 'failed', 'expired', 'cancelled')
  ),
  completed_at TIMESTAMP WITH TIME ZONE,
  
  -- 결과 및 피드백
  success BOOLEAN,
  error_code TEXT,
  error_message TEXT,
  user_feedback TEXT CHECK (user_feedback IN ('smooth', 'difficult', 'failed', 'no_feedback')),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- 🆔 3. DID 시스템 (Cue 기반 신원 관리)
-- =============================================================================

-- DID 문서 (Cue 시스템과 통합된 분산 신원)
CREATE TABLE did_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_did TEXT REFERENCES user_profiles(did) ON DELETE CASCADE,
  
  -- W3C DID 표준 정보
  did_method TEXT DEFAULT 'cue' CHECK (did_method IN ('web', 'key', 'cue', 'ethr')),
  did_identifier TEXT UNIQUE NOT NULL,
  document JSONB NOT NULL, -- 완전한 DID Document
  
  -- Cue 시스템 확장
  cue_capabilities JSONB DEFAULT '{}', -- 이 DID가 지원하는 Cue 기능들
  cross_platform_identifiers JSONB DEFAULT '{}', -- 플랫폼별 연결된 식별자
  reputation_score DECIMAL(3,2) DEFAULT 0.5, -- 이 DID의 신뢰도/평판
  
  -- 검증 방법 (WebAuthn 통합)
  verification_methods JSONB NOT NULL DEFAULT '[]',
  authentication_methods JSONB DEFAULT '[]',
  assertion_methods JSONB DEFAULT '[]',
  
  -- 서비스 엔드포인트
  services JSONB DEFAULT '[]',
  
  -- 버전 관리
  version INTEGER DEFAULT 1,
  previous_version_hash TEXT,
  
  -- 상태
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'revoked', 'deactivated', 'suspended')),
  is_published BOOLEAN DEFAULT FALSE, -- 공개적으로 해결 가능한지
  
  -- 해결 정보
  resolver_metadata JSONB DEFAULT '{}',
  last_resolved_at TIMESTAMP WITH TIME ZONE,
  resolution_count INTEGER DEFAULT 0,
  
  -- 타임스탬프
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  published_at TIMESTAMP WITH TIME ZONE,
  deactivated_at TIMESTAMP WITH TIME ZONE
);

-- =============================================================================
-- 🤖 4. AI Agent 시스템 (Cue 기반 개인화)
-- =============================================================================

-- AI Agent 정의 (Cue 시스템 완전 통합)
CREATE TABLE ai_agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_did TEXT UNIQUE NOT NULL, -- Agent DID: did:cue:agent:provider:model:id
  
  -- 기본 정보
  name TEXT NOT NULL,
  description TEXT,
  version TEXT DEFAULT '1.0.0',
  provider TEXT NOT NULL, -- 'openai', 'anthropic', 'google', 'local', 'ensemble'
  model_name TEXT NOT NULL,
  model_version TEXT,
  
  -- Cue 시스템 핵심 기능
  cue_capabilities JSONB DEFAULT '{
    "extraction": true,
    "application": true,
    "learning": true,
    "adaptation": true,
    "cross_context": false,
    "real_time": true
  }',
  
  -- AI 모델 설정
  default_temperature DECIMAL(3,2) DEFAULT 0.7,
  default_max_tokens INTEGER DEFAULT 4000,
  default_top_p DECIMAL(3,2) DEFAULT 1.0,
  supports_streaming BOOLEAN DEFAULT TRUE,
  supports_function_calling BOOLEAN DEFAULT FALSE,
  
  -- Cue 통합 수준
  cue_integration_level TEXT DEFAULT 'full' CHECK (
    cue_integration_level IN ('none', 'basic', 'standard', 'full', 'advanced', 'experimental')
  ),
  personalization_strength DECIMAL(3,2) DEFAULT 0.7, -- 개인화 적용 강도
  
  -- 성능 및 특성
  average_response_time INTEGER DEFAULT 2000, -- 평균 응답 시간 (ms)
  context_window_size INTEGER DEFAULT 4000,
  supports_multimodal BOOLEAN DEFAULT FALSE,
  supported_languages TEXT[] DEFAULT ARRAY['ko', 'en'],
  
  -- 전문성 영역
  expertise_domains TEXT[] DEFAULT ARRAY[]::TEXT[],
  strength_areas TEXT[] DEFAULT ARRAY[]::TEXT[],
  weakness_areas TEXT[] DEFAULT ARRAY[]::TEXT[],
  
  -- 상태 및 설정
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'deprecated', 'experimental')),
  is_public BOOLEAN DEFAULT TRUE,
  requires_api_key BOOLEAN DEFAULT TRUE,
  
  -- 메타데이터
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 사용자-Agent 관계 및 개인화 설정
CREATE TABLE user_agent_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_did TEXT REFERENCES user_profiles(did) ON DELETE CASCADE,
  agent_did TEXT REFERENCES ai_agents(agent_did) ON DELETE CASCADE,
  
  -- 관계 식별
  relationship_id TEXT UNIQUE NOT NULL, -- user_did + agent_did 조합의 고유 ID
  nickname TEXT, -- 사용자가 이 Agent에 붙인 별명
  
  -- Cue 기반 개인화 설정
  personalization_config JSONB DEFAULT '{
    "style_adaptation": 0.8,
    "context_awareness": 0.9,
    "learning_rate": 0.7,
    "response_tone": "adaptive",
    "detail_level": "adaptive",
    "examples_preference": "when_helpful",
    "explanation_depth": "medium"
  }',
  
  -- 신뢰도 및 선호도
  trust_level DECIMAL(3,2) DEFAULT 0.5,
  satisfaction_score DECIMAL(3,2) DEFAULT 0.0,
  usage_frequency TEXT DEFAULT 'moderate' CHECK (
    usage_frequency IN ('rare', 'occasional', 'moderate', 'frequent', 'intensive')
  ),
  
  -- 성능 통계
  total_interactions INTEGER DEFAULT 0,
  successful_interactions INTEGER DEFAULT 0,
  average_response_quality DECIMAL(3,2) DEFAULT 0.0,
  total_tokens_used INTEGER DEFAULT 0,
  total_cost DECIMAL(10,4) DEFAULT 0.0,
  
  -- Cue 적용 효과
  cues_applied_count INTEGER DEFAULT 0,
  successful_cue_applications INTEGER DEFAULT 0,
  cue_effectiveness_score DECIMAL(3,2) DEFAULT 0.0,
  
  -- 커스터마이징
  custom_instructions TEXT,
  custom_system_prompt TEXT,
  conversation_starters TEXT[] DEFAULT ARRAY[]::TEXT[],
  
  -- 제한 및 설정
  daily_usage_limit INTEGER,
  cost_limit_daily DECIMAL(8,4),
  auto_cue_application BOOLEAN DEFAULT TRUE,
  
  -- 타임스탬프
  first_interaction_at TIMESTAMP WITH TIME ZONE,
  last_interaction_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_did, agent_did)
);

-- =============================================================================
-- 🧠 5. 핵심! Cue 시스템 - 개인화 학습의 핵심
-- =============================================================================

-- 개인화 큐 저장 (시스템의 절대 핵심 테이블)
CREATE TABLE personal_cues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_did TEXT REFERENCES user_profiles(did) ON DELETE CASCADE,
  
  -- Cue 분류
  cue_type TEXT NOT NULL CHECK (
    cue_type IN ('preference', 'context', 'behavior', 'goal', 'expertise', 'communication', 'workflow')
  ),
  cue_category TEXT, -- 더 세부적인 분류
  
  -- Cue 핵심 내용
  key TEXT NOT NULL, -- 'response_style', 'code_language', 'explanation_depth'
  value TEXT NOT NULL, -- 'concise', 'typescript', 'detailed'
  description TEXT NOT NULL, -- 인간이 읽을 수 있는 설명
  
  -- 학습 및 신뢰도 (핵심 알고리즘)
  confidence_score DECIMAL(3,2) DEFAULT 0.5 CHECK (confidence_score >= 0.0 AND confidence_score <= 1.0),
  evidence_count INTEGER DEFAULT 1,
  evidence_quality TEXT DEFAULT 'medium' CHECK (evidence_quality IN ('low', 'medium', 'high', 'verified')),
  source_interactions TEXT[] DEFAULT ARRAY[]::TEXT[], -- 근거가 된 상호작용 ID들
  
  -- 적용 컨텍스트
  applicable_contexts TEXT[] DEFAULT ARRAY[]::TEXT[], -- 어떤 상황에서 적용할지
  context_specificity TEXT DEFAULT 'general' CHECK (
    context_specificity IN ('general', 'domain_specific', 'task_specific', 'situational')
  ),
  
  -- 시간 및 사용 패턴
  first_observed TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_reinforced TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_used TIMESTAMP WITH TIME ZONE,
  usage_frequency DECIMAL(3,2) DEFAULT 0.0, -- 0.0 ~ 10.0
  decay_rate DECIMAL(3,2) DEFAULT 0.02, -- 시간에 따른 신뢰도 감소율
  
  -- 학습 소스
  platform_sources TEXT[] DEFAULT ARRAY[]::TEXT[], -- 어떤 플랫폼에서 학습했는지
  extraction_method TEXT DEFAULT 'pattern' CHECK (
    extraction_method IN ('explicit', 'pattern', 'inference', 'feedback', 'correction')
  ),
  
  -- 효과 및 검증
  application_success_rate DECIMAL(3,2) DEFAULT 0.0,
  user_feedback_score DECIMAL(3,2) DEFAULT 0.0,
  validation_status TEXT DEFAULT 'unvalidated' CHECK (
    validation_status IN ('unvalidated', 'user_confirmed', 'system_verified', 'deprecated')
  ),
  
  -- 관련성 및 태깅
  related_cues UUID[] DEFAULT ARRAY[]::UUID[], -- 관련된 다른 큐들
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  topics TEXT[] DEFAULT ARRAY[]::TEXT[],
  
  -- 메타데이터
  metadata JSONB DEFAULT '{}',
  
  -- 상태
  is_active BOOLEAN DEFAULT TRUE,
  is_global BOOLEAN DEFAULT FALSE, -- 모든 컨텍스트에서 적용할지
  priority INTEGER DEFAULT 5 CHECK (priority >= 1 AND priority <= 10),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_did, cue_type, key)
);

-- Cue 사용 이력 및 효과 측정 (학습 피드백 루프)
CREATE TABLE cue_usage_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cue_id UUID REFERENCES personal_cues(id) ON DELETE CASCADE,
  user_did TEXT REFERENCES user_profiles(did) ON DELETE CASCADE,
  agent_did TEXT REFERENCES ai_agents(agent_did) ON DELETE CASCADE,
  
  -- 사용 컨텍스트
  interaction_id TEXT NOT NULL, -- 특정 상호작용의 고유 ID
  conversation_context TEXT,
  query_text TEXT, -- 사용자의 원래 질문/요청
  applied_modification TEXT, -- Cue로 인해 어떻게 수정되었는지
  
  -- 적용 방식
  application_method TEXT CHECK (
    application_method IN ('automatic', 'suggested', 'manual', 'reinforcement')
  ),
  application_confidence DECIMAL(3,2), -- 이 적용에 대한 확신도
  context_relevance DECIMAL(3,2), -- 컨텍스트와의 관련성
  
  -- 효과 측정
  immediate_effectiveness DECIMAL(3,2), -- 즉시 효과
  user_satisfaction DECIMAL(3,2), -- 사용자 만족도
  response_improvement DECIMAL(3,2), -- 응답 개선 정도
  task_completion_help DECIMAL(3,2), -- 작업 완료에 도움이 된 정도
  
  -- 피드백
  user_feedback TEXT CHECK (
    user_feedback IN ('very_helpful', 'helpful', 'neutral', 'unhelpful', 'harmful', 'no_feedback')
  ),
  user_feedback_text TEXT, -- 구체적인 피드백
  
  -- 결과 분석
  led_to_follow_up BOOLEAN DEFAULT FALSE,
  created_new_cue BOOLEAN DEFAULT FALSE,
  modified_existing_cue BOOLEAN DEFAULT FALSE,
  
  -- 성능 데이터
  response_time_impact INTEGER DEFAULT 0, -- 응답 시간 변화 (ms)
  token_usage_impact INTEGER DEFAULT 0, -- 토큰 사용량 변화
  
  used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cue 상호작용 및 학습 패턴
CREATE TABLE cue_interaction_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_did TEXT REFERENCES user_profiles(did) ON DELETE CASCADE,
  
  -- 패턴 정보
  pattern_type TEXT CHECK (
    pattern_type IN ('temporal', 'contextual', 'sequential', 'conditional', 'behavioral')
  ),
  pattern_name TEXT NOT NULL,
  pattern_description TEXT,
  
  -- 패턴 정의
  trigger_conditions JSONB NOT NULL, -- 언제 이 패턴이 활성화되는지
  associated_cues UUID[] DEFAULT ARRAY[]::UUID[], -- 관련된 큐들
  sequence_order INTEGER[], -- 큐들의 적용 순서
  
  -- 패턴 통계
  activation_count INTEGER DEFAULT 0,
  success_rate DECIMAL(3,2) DEFAULT 0.0,
  average_effectiveness DECIMAL(3,2) DEFAULT 0.0,
  
  -- 학습된 조건
  time_patterns JSONB DEFAULT '{}', -- 시간 관련 패턴
  context_patterns JSONB DEFAULT '{}', -- 컨텍스트 관련 패턴
  interaction_patterns JSONB DEFAULT '{}', -- 상호작용 관련 패턴
  
  -- 상태
  is_active BOOLEAN DEFAULT TRUE,
  confidence_level DECIMAL(3,2) DEFAULT 0.5,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_activated_at TIMESTAMP WITH TIME ZONE
);

-- =============================================================================
-- 📚 6. 컨텍스트 데이터 저장 및 처리
-- =============================================================================

-- 플랫폼별 원시 컨텍스트 데이터 (효율적 압축 저장)
CREATE TABLE raw_context_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_did TEXT REFERENCES user_profiles(did) ON DELETE CASCADE,
  
  -- 소스 정보
  platform TEXT NOT NULL, -- 'chatgpt', 'claude', 'discord', 'gmail', 'slack', 'notion' 등
  platform_conversation_id TEXT, -- 플랫폼별 대화 ID
  data_type TEXT DEFAULT 'conversation' CHECK (
    data_type IN ('conversation', 'document', 'email', 'message', 'file', 'media')
  ),
  
  -- 압축된 데이터 저장
  raw_content BYTEA, -- 압축된 원본 데이터
  content_hash TEXT UNIQUE NOT NULL, -- SHA-256 해시 (중복 방지)
  content_type TEXT DEFAULT 'json',
  compression_method TEXT DEFAULT 'gzip' CHECK (
    compression_method IN ('none', 'gzip', 'brotli', 'lz4')
  ),
  
  -- 메타데이터
  original_size INTEGER,
  compressed_size INTEGER,
  compression_ratio DECIMAL(4,2),
  
  -- 추출 정보
  extraction_method TEXT, -- 어떻게 데이터를 가져왔는지
  extraction_timestamp TIMESTAMP WITH TIME ZONE,
  source_url TEXT,
  source_metadata JSONB DEFAULT '{}',
  
  -- 처리 상태
  processing_status TEXT DEFAULT 'pending' CHECK (
    processing_status IN ('pending', 'processing', 'processed', 'failed', 'skipped')
  ),
  processing_priority INTEGER DEFAULT 5 CHECK (processing_priority >= 1 AND processing_priority <= 10),
  processed_at TIMESTAMP WITH TIME ZONE,
  processing_duration INTEGER, -- 처리 소요 시간 (ms)
  
  -- 에러 정보
  error_message TEXT,
  error_code TEXT,
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_did, platform, content_hash)
);

-- 정규화된 상호작용 데이터 (Cue 추출을 위한 구조화)
CREATE TABLE normalized_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  raw_context_id UUID REFERENCES raw_context_data(id) ON DELETE CASCADE,
  user_did TEXT REFERENCES user_profiles(did) ON DELETE CASCADE,
  
  -- 상호작용 식별
  interaction_id TEXT UNIQUE NOT NULL, -- 플랫폼별 고유 ID
  conversation_thread_id TEXT,
  parent_interaction_id TEXT, -- 이전 상호작용과의 연결
  
  -- 메시지 정보
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system', 'tool')),
  content TEXT NOT NULL,
  content_length INTEGER,
  language TEXT DEFAULT 'ko',
  
  -- 플랫폼 및 AI 정보
  platform TEXT NOT NULL,
  agent_used TEXT, -- 어떤 AI가 응답했는지
  model_version TEXT,
  tokens_used INTEGER DEFAULT 0,
  response_time INTEGER, -- 응답 시간 (ms)
  
  -- 시간 정보
  original_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  normalized_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Cue 추출을 위한 분석 결과
  intent_categories TEXT[] DEFAULT ARRAY[]::TEXT[],
  sentiment_score DECIMAL(3,2),
  emotion_scores JSONB DEFAULT '{}', -- 감정 분석 결과
  complexity_level TEXT CHECK (complexity_level IN ('simple', 'moderate', 'complex', 'expert')),
  
  -- 컨텍스트 분석
  topics TEXT[] DEFAULT ARRAY[]::TEXT[],
  entities JSONB DEFAULT '{}', -- 명명된 개체
  keywords TEXT[] DEFAULT ARRAY[]::TEXT[],
  concepts TEXT[] DEFAULT ARRAY[]::TEXT[],
  
  -- 상호작용 특성
  interaction_type TEXT, -- 'question', 'request', 'clarification', 'feedback' 등
  urgency_level TEXT DEFAULT 'normal' CHECK (urgency_level IN ('low', 'normal', 'high', 'urgent')),
  quality_score DECIMAL(3,2) DEFAULT 0.0,
  usefulness_score DECIMAL(3,2) DEFAULT 0.0,
  
  -- Cue 관련 처리
  cue_extraction_status TEXT DEFAULT 'pending' CHECK (
    cue_extraction_status IN ('pending', 'processing', 'extracted', 'no_cues', 'failed')
  ),
  extracted_cues_count INTEGER DEFAULT 0,
  potential_cues JSONB DEFAULT '{}', -- 추출 가능한 큐들
  
  -- 학습 가치
  learning_value DECIMAL(3,2) DEFAULT 0.5, -- 이 상호작용이 학습에 얼마나 유용한지
  pattern_significance DECIMAL(3,2) DEFAULT 0.0, -- 패턴 학습에 대한 중요도
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- 🔄 7. 플랫폼 동기화 및 통합 관리
-- =============================================================================

-- 플랫폼별 동기화 상태 및 설정
CREATE TABLE platform_sync_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_did TEXT REFERENCES user_profiles(did) ON DELETE CASCADE,
  
  -- 플랫폼 정보
  platform TEXT NOT NULL,
  platform_version TEXT,
  connection_type TEXT CHECK (connection_type IN ('api', 'export', 'manual', 'webhook')),
  
  -- 인증 정보 (암호화됨)
  credentials_encrypted BYTEA, -- 암호화된 인증 정보
  encryption_key_hash TEXT,
  
  -- 동기화 설정
  sync_frequency TEXT DEFAULT 'daily' CHECK (
    sync_frequency IN ('realtime', 'hourly', 'daily', 'weekly', 'manual', 'disabled')
  ),
  auto_sync_enabled BOOLEAN DEFAULT TRUE,
  selective_sync BOOLEAN DEFAULT FALSE,
  sync_filters JSONB DEFAULT '{}', -- 어떤 데이터를 동기화할지
  
  -- 동기화 범위
  historical_sync_enabled BOOLEAN DEFAULT TRUE,
  max_historical_days INTEGER DEFAULT 365,
  include_attachments BOOLEAN DEFAULT FALSE,
  include_metadata BOOLEAN DEFAULT TRUE,
  
  -- 상태 추적
  status TEXT DEFAULT 'inactive' CHECK (
    status IN ('active', 'inactive', 'error', 'rate_limited', 'unauthorized', 'disabled')
  ),
  last_sync_attempt TIMESTAMP WITH TIME ZONE,
  last_successful_sync TIMESTAMP WITH TIME ZONE,
  next_scheduled_sync TIMESTAMP WITH TIME ZONE,
  
  -- 통계
  total_syncs INTEGER DEFAULT 0,
  successful_syncs INTEGER DEFAULT 0,
  failed_syncs INTEGER DEFAULT 0,
  total_items_synced INTEGER DEFAULT 0,
  
  -- 에러 관리
  current_error_message TEXT,
  error_count INTEGER DEFAULT 0,
  last_error_at TIMESTAMP WITH TIME ZONE,
  retry_backoff_until TIMESTAMP WITH TIME ZONE,
  
  -- 성능 메트릭
  average_sync_duration INTEGER DEFAULT 0, -- 평균 동기화 시간 (초)
  average_items_per_sync INTEGER DEFAULT 0,
  data_transfer_rate DECIMAL(8,2) DEFAULT 0.0, -- MB/s
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_did, platform)
);

-- 컨텍스트 처리 및 병합 작업
CREATE TABLE context_processing_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_did TEXT REFERENCES user_profiles(did) ON DELETE CASCADE,
  
  -- 작업 정보
  job_type TEXT DEFAULT 'cue_extraction' CHECK (
    job_type IN ('data_import', 'normalization', 'cue_extraction', 'pattern_analysis', 'full_reprocess')
  ),
  job_name TEXT,
  job_description TEXT,
  
  -- 처리 범위
  target_platforms TEXT[] DEFAULT ARRAY[]::TEXT[],
  date_range_start TIMESTAMP WITH TIME ZONE,
  date_range_end TIMESTAMP WITH TIME ZONE,
  max_items_to_process INTEGER,
  
  -- 상태 및 진행
  status TEXT DEFAULT 'queued' CHECK (
    status IN ('queued', 'starting', 'processing', 'paused', 'completed', 'failed', 'cancelled')
  ),
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  current_stage TEXT,
  
  -- 처리 결과
  items_processed INTEGER DEFAULT 0,
  items_successful INTEGER DEFAULT 0,
  items_failed INTEGER DEFAULT 0,
  items_skipped INTEGER DEFAULT 0,
  
  -- Cue 처리 결과
  cues_extracted INTEGER DEFAULT 0,
  cues_updated INTEGER DEFAULT 0,
  cues_validated INTEGER DEFAULT 0,
  patterns_discovered INTEGER DEFAULT 0,
  
  -- 시간 추적
  queued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  estimated_completion TIMESTAMP WITH TIME ZONE,
  
  -- 성능 메트릭
  processing_rate DECIMAL(6,2), -- 항목/초
  total_processing_time INTEGER, -- 총 처리 시간 (초)
  cpu_usage_avg DECIMAL(4,2),
  memory_usage_peak INTEGER, -- MB
  
  -- 상세 로그 및 결과
  processing_log JSONB DEFAULT '{}',
  error_log JSONB DEFAULT '{}',
  result_summary JSONB DEFAULT '{}',
  
  -- 설정
  priority INTEGER DEFAULT 5 CHECK (priority >= 1 AND priority <= 10),
  auto_retry BOOLEAN DEFAULT TRUE,
  max_retries INTEGER DEFAULT 3,
  retry_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- 📊 8. 분석, 모니터링 및 성능 추적
-- =============================================================================

-- 상세한 사용 분석 및 Cue 시스템 성능
CREATE TABLE usage_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_did TEXT REFERENCES user_profiles(did) ON DELETE CASCADE,
  agent_did TEXT REFERENCES ai_agents(agent_did) ON DELETE SET NULL,
  
  -- 시간 단위 (다중 레벨 집계 지원)
  date DATE NOT NULL,
  hour INTEGER CHECK (hour >= 0 AND hour <= 23), -- NULL이면 일간 집계
  
  -- 기본 사용 지표
  total_interactions INTEGER DEFAULT 0,
  successful_interactions INTEGER DEFAULT 0,
  failed_interactions INTEGER DEFAULT 0,
  tokens_consumed INTEGER DEFAULT 0,
  total_cost DECIMAL(10,4) DEFAULT 0.0,
  
  -- 성능 지표
  average_response_time INTEGER DEFAULT 0, -- ms
  median_response_time INTEGER DEFAULT 0,
  p95_response_time INTEGER DEFAULT 0,
  fastest_response_time INTEGER DEFAULT 0,
  slowest_response_time INTEGER DEFAULT 0,
  
  -- Cue 시스템 성능 (핵심 지표)
  cues_applied INTEGER DEFAULT 0,
  cues_successful INTEGER DEFAULT 0,
  cue_application_rate DECIMAL(4,2) DEFAULT 0.0, -- 적용 비율
  cue_success_rate DECIMAL(4,2) DEFAULT 0.0, -- 성공 비율
  average_cue_effectiveness DECIMAL(3,2) DEFAULT 0.0,
  
  -- 개인화 효과
  personalization_score DECIMAL(3,2) DEFAULT 0.0, -- 개인화 정도
  user_satisfaction_avg DECIMAL(3,2) DEFAULT 0.0,
  response_quality_avg DECIMAL(3,2) DEFAULT 0.0,
  task_completion_rate DECIMAL(4,2) DEFAULT 0.0,
  
  -- 학습 진전
  new_cues_learned INTEGER DEFAULT 0,
  cues_reinforced INTEGER DEFAULT 0,
  cues_deprecated INTEGER DEFAULT 0,
  patterns_discovered INTEGER DEFAULT 0,
  
  -- 컨텍스트 정보
  primary_platforms TEXT[] DEFAULT ARRAY[]::TEXT[],
  primary_topics TEXT[] DEFAULT ARRAY[]::TEXT[],
  interaction_types JSONB DEFAULT '{}', -- 상호작용 유형별 분포
  
  -- 행동 패턴
  peak_usage_hours INTEGER[], -- 주요 사용 시간대
  session_duration_avg INTEGER DEFAULT 0, -- 평균 세션 길이 (분)
  interactions_per_session DECIMAL(4,2) DEFAULT 0.0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_did, agent_did, date, hour)
);

-- 시스템 레벨 성능 메트릭
CREATE TABLE system_performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- 메트릭 분류
  metric_category TEXT NOT NULL CHECK (
    metric_category IN ('cue_system', 'webauthn', 'did', 'sync', 'ai_performance', 'user_engagement')
  ),
  metric_name TEXT NOT NULL,
  metric_description TEXT,
  
  -- 메트릭 값
  metric_value DECIMAL(12,4) NOT NULL,
  metric_unit TEXT,
  metric_type TEXT CHECK (metric_type IN ('counter', 'gauge', 'histogram', 'rate')),
  
  -- 컨텍스트
  dimensions JSONB DEFAULT '{}', -- 메트릭의 차원 (user_segment, platform, model 등)
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  
  -- 집계 정보
  aggregation_level TEXT CHECK (aggregation_level IN ('raw', 'hourly', 'daily', 'weekly', 'monthly')),
  aggregation_window INTERVAL,
  sample_count INTEGER DEFAULT 1,
  
  -- 시간 범위
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  period_start TIMESTAMP WITH TIME ZONE,
  period_end TIMESTAMP WITH TIME ZONE,
  
  -- 메타데이터
  metadata JSONB DEFAULT '{}'
);

-- Cue 시스템 특화 인사이트 및 권장사항
CREATE TABLE cue_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_did TEXT REFERENCES user_profiles(did) ON DELETE CASCADE,
  
  -- 인사이트 정보
  insight_type TEXT CHECK (
    insight_type IN ('preference_change', 'new_pattern', 'improvement_opportunity', 'anomaly', 'achievement')
  ),
  insight_category TEXT, -- 'productivity', 'personalization', 'learning' 등
  
  -- 내용
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  detailed_analysis TEXT,
  confidence_level DECIMAL(3,2) DEFAULT 0.5,
  
  -- 관련 데이터
  related_cues UUID[] DEFAULT ARRAY[]::UUID[],
  supporting_data JSONB DEFAULT '{}',
  evidence_strength TEXT CHECK (evidence_strength IN ('weak', 'moderate', 'strong', 'conclusive')),
  
  -- 권장사항
  recommendations TEXT[] DEFAULT ARRAY[]::TEXT[],
  actionable_steps JSONB DEFAULT '{}',
  expected_benefit TEXT,
  implementation_difficulty TEXT CHECK (
    implementation_difficulty IN ('easy', 'moderate', 'difficult', 'complex')
  ),
  
  -- 사용자 반응
  user_viewed BOOLEAN DEFAULT FALSE,
  user_feedback TEXT CHECK (user_feedback IN ('helpful', 'not_helpful', 'irrelevant', 'no_feedback')),
  user_action_taken BOOLEAN DEFAULT FALSE,
  action_details TEXT,
  
  -- 상태
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived', 'dismissed', 'implemented')),
  priority INTEGER DEFAULT 5 CHECK (priority >= 1 AND priority <= 10),
  
  -- 시간
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  viewed_at TIMESTAMP WITH TIME ZONE,
  acted_upon_at TIMESTAMP WITH TIME ZONE
);

-- =============================================================================
-- 🏗️ 인덱스 생성 (성능 최적화)
-- =============================================================================

-- 사용자 프로필 인덱스
CREATE INDEX idx_user_profiles_did ON user_profiles(did);
CREATE INDEX idx_user_profiles_username ON user_profiles(username);
CREATE INDEX idx_user_profiles_email ON user_profiles(email);
CREATE INDEX idx_user_profiles_status ON user_profiles(status);
CREATE INDEX idx_user_profiles_cue_learning ON user_profiles(cue_learning_enabled);
CREATE INDEX idx_user_profiles_updated_at ON user_profiles(updated_at);

-- 전문성 컨텍스트 인덱스
CREATE INDEX idx_user_expertise_user_did ON user_expertise_contexts(user_did);
CREATE INDEX idx_user_expertise_domain ON user_expertise_contexts(domain, subdomain);
CREATE INDEX idx_user_expertise_skill_level ON user_expertise_contexts(skill_level);
CREATE INDEX idx_user_expertise_confidence ON user_expertise_contexts(confidence_score DESC);

-- WebAuthn 인덱스
CREATE INDEX idx_webauthn_credentials_user_did ON webauthn_credentials(user_did);
CREATE INDEX idx_webauthn_credentials_credential_id ON webauthn_credentials(credential_id);
CREATE INDEX idx_webauthn_credentials_active ON webauthn_credentials(is_active);
CREATE INDEX idx_webauthn_credentials_primary ON webauthn_credentials(is_primary);

CREATE INDEX idx_webauthn_sessions_user_did ON webauthn_sessions(user_did);
CREATE INDEX idx_webauthn_sessions_challenge ON webauthn_sessions(challenge);
CREATE INDEX idx_webauthn_sessions_status ON webauthn_sessions(status);
CREATE INDEX idx_webauthn_sessions_expires ON webauthn_sessions(challenge_expires_at);

-- DID 문서 인덱스
CREATE INDEX idx_did_documents_user_did ON did_documents(user_did);
CREATE INDEX idx_did_documents_identifier ON did_documents(did_identifier);
CREATE INDEX idx_did_documents_method ON did_documents(did_method);
CREATE INDEX idx_did_documents_status ON did_documents(status);

-- AI Agent 인덱스
CREATE INDEX idx_ai_agents_did ON ai_agents(agent_did);
CREATE INDEX idx_ai_agents_provider ON ai_agents(provider, model_name);
CREATE INDEX idx_ai_agents_status ON ai_agents(status);
CREATE INDEX idx_ai_agents_cue_level ON ai_agents(cue_integration_level);

CREATE INDEX idx_user_agent_rel_user_did ON user_agent_relationships(user_did);
CREATE INDEX idx_user_agent_rel_agent_did ON user_agent_relationships(agent_did);
CREATE INDEX idx_user_agent_rel_trust ON user_agent_relationships(trust_level DESC);

-- 핵심! Personal Cues 인덱스 (성능 최적화)
CREATE INDEX idx_personal_cues_user_did ON personal_cues(user_did);
CREATE INDEX idx_personal_cues_type_key ON personal_cues(cue_type, key);
CREATE INDEX idx_personal_cues_confidence ON personal_cues(confidence_score DESC);
CREATE INDEX idx_personal_cues_last_used ON personal_cues(last_used DESC NULLS LAST);
CREATE INDEX idx_personal_cues_active ON personal_cues(is_active);
CREATE INDEX idx_personal_cues_priority ON personal_cues(priority DESC);
CREATE INDEX idx_personal_cues_updated_at ON personal_cues(updated_at);

-- Cue 사용 이력 인덱스
CREATE INDEX idx_cue_usage_cue_id ON cue_usage_history(cue_id);
CREATE INDEX idx_cue_usage_user_did ON cue_usage_history(user_did);
CREATE INDEX idx_cue_usage_interaction ON cue_usage_history(interaction_id);
CREATE INDEX idx_cue_usage_effectiveness ON cue_usage_history(immediate_effectiveness DESC);
CREATE INDEX idx_cue_usage_timestamp ON cue_usage_history(used_at DESC);

-- 컨텍스트 데이터 인덱스
CREATE INDEX idx_raw_context_user_did ON raw_context_data(user_did);
CREATE INDEX idx_raw_context_platform ON raw_context_data(platform);
CREATE INDEX idx_raw_context_hash ON raw_context_data(content_hash);
CREATE INDEX idx_raw_context_status ON raw_context_data(processing_status);
CREATE INDEX idx_raw_context_created ON raw_context_data(created_at DESC);

CREATE INDEX idx_normalized_interactions_user_did ON normalized_interactions(user_did);
CREATE INDEX idx_normalized_interactions_id ON normalized_interactions(interaction_id);
CREATE INDEX idx_normalized_interactions_timestamp ON normalized_interactions(original_timestamp DESC);
CREATE INDEX idx_normalized_interactions_platform ON normalized_interactions(platform);
CREATE INDEX idx_normalized_interactions_cue_status ON normalized_interactions(cue_extraction_status);
CREATE INDEX idx_normalized_interactions_quality ON normalized_interactions(learning_value DESC);

-- 동기화 및 작업 인덱스
CREATE INDEX idx_platform_sync_user_did ON platform_sync_configurations(user_did);
CREATE INDEX idx_platform_sync_platform ON platform_sync_configurations(platform);
CREATE INDEX idx_platform_sync_status ON platform_sync_configurations(status);
CREATE INDEX idx_platform_sync_next_sync ON platform_sync_configurations(next_scheduled_sync);

CREATE INDEX idx_context_jobs_user_did ON context_processing_jobs(user_did);
CREATE INDEX idx_context_jobs_status ON context_processing_jobs(status);
CREATE INDEX idx_context_jobs_priority ON context_processing_jobs(priority DESC);
CREATE INDEX idx_context_jobs_queued ON context_processing_jobs(queued_at);

-- 분석 및 성능 인덱스
CREATE INDEX idx_usage_analytics_user_date ON usage_analytics(user_did, date DESC);
CREATE INDEX idx_usage_analytics_agent_date ON usage_analytics(agent_did, date DESC);
CREATE INDEX idx_usage_analytics_personalization ON usage_analytics(personalization_score DESC);

CREATE INDEX idx_system_metrics_category ON system_performance_metrics(metric_category, metric_name);
CREATE INDEX idx_system_metrics_timestamp ON system_performance_metrics(timestamp DESC);

CREATE INDEX idx_cue_insights_user_did ON cue_insights(user_did);
CREATE INDEX idx_cue_insights_type ON cue_insights(insight_type);
CREATE INDEX idx_cue_insights_priority ON cue_insights(priority DESC);
CREATE INDEX idx_cue_insights_status ON cue_insights(status);

-- 전문 검색용 GIN 인덱스
CREATE INDEX idx_user_profiles_search ON user_profiles USING gin(search_vector);
CREATE INDEX idx_normalized_interactions_content ON normalized_interactions 
  USING gin(to_tsvector('korean', content));
CREATE INDEX idx_normalized_interactions_topics ON normalized_interactions 
  USING gin(topics);
CREATE INDEX idx_personal_cues_tags ON personal_cues 
  USING gin(tags);
CREATE INDEX idx_personal_cues_contexts ON personal_cues 
  USING gin(applicable_contexts);

-- =============================================================================
-- ⚡ 트리거 및 자동화 함수들
-- =============================================================================

-- updated_at 자동 업데이트 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 사용자 검색 벡터 업데이트
CREATE OR REPLACE FUNCTION update_user_search_vector()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector := to_tsvector('korean',
        COALESCE(NEW.username, '') || ' ' ||
        COALESCE(NEW.display_name, '') || ' ' ||
        COALESCE(NEW.email, '') || ' ' ||
        COALESCE(NEW.communication_style, '') || ' ' ||
        COALESCE(NEW.interaction_context, '')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Cue 사용 시 last_used 및 frequency 업데이트
CREATE OR REPLACE FUNCTION update_cue_usage_stats()
RETURNS TRIGGER AS $$
DECLARE
    current_frequency DECIMAL(3,2);
    decay_factor DECIMAL(3,2) := 0.95; -- 시간에 따른 감소
    boost_factor DECIMAL(3,2) := 0.2; -- 사용 시 증가
BEGIN
    -- 현재 사용 빈도 조회 및 업데이트
    SELECT usage_frequency INTO current_frequency
    FROM personal_cues WHERE id = NEW.cue_id;
    
    UPDATE personal_cues 
    SET 
        last_used = NOW(),
        usage_frequency = LEAST(10.0, 
            (COALESCE(current_frequency, 0.0) * decay_factor) + boost_factor
        ),
        application_success_rate = CASE 
            WHEN NEW.immediate_effectiveness >= 0.7 THEN 
                LEAST(1.0, COALESCE(application_success_rate, 0.0) + 0.1)
            WHEN NEW.immediate_effectiveness <= 0.3 THEN
                GREATEST(0.0, COALESCE(application_success_rate, 0.0) - 0.05)
            ELSE application_success_rate
        END
    WHERE id = NEW.cue_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 사용자 통계 업데이트
CREATE OR REPLACE FUNCTION update_user_interaction_stats()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE user_profiles 
    SET 
        total_interactions = total_interactions + 1,
        last_cue_update_at = CASE 
            WHEN NEW.cue_extraction_status = 'extracted' THEN NOW()
            ELSE last_cue_update_at
        END
    WHERE did = NEW.user_did;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 트리거 생성
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_search_vector_trigger
    BEFORE INSERT OR UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_user_search_vector();

CREATE TRIGGER update_user_expertise_updated_at
    BEFORE UPDATE ON user_expertise_contexts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_webauthn_credentials_updated_at
    BEFORE UPDATE ON webauthn_credentials
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_did_documents_updated_at
    BEFORE UPDATE ON did_documents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_agents_updated_at
    BEFORE UPDATE ON ai_agents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_agent_relationships_updated_at
    BEFORE UPDATE ON user_agent_relationships
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_personal_cues_updated_at
    BEFORE UPDATE ON personal_cues
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_platform_sync_updated_at
    BEFORE UPDATE ON platform_sync_configurations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cue_usage_stats_trigger
    AFTER INSERT ON cue_usage_history
    FOR EACH ROW EXECUTE FUNCTION update_cue_usage_stats();

CREATE TRIGGER update_user_interaction_stats_trigger
    AFTER INSERT ON normalized_interactions
    FOR EACH ROW EXECUTE FUNCTION update_user_interaction_stats();

-- =============================================================================
-- 🔧 Cue 시스템 특화 유틸리티 함수들
-- =============================================================================

-- 새로운 사용자 DID 생성
CREATE OR REPLACE FUNCTION generate_user_did()
RETURNS TEXT AS $$
BEGIN
    RETURN 'did:cue:user:' || encode(gen_random_bytes(16), 'hex');
END;
$$ LANGUAGE plpgsql;

-- Agent DID 생성
CREATE OR REPLACE FUNCTION generate_agent_did(provider TEXT, model_name TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN 'did:cue:agent:' || provider || ':' || model_name || ':' || encode(gen_random_bytes(8), 'hex');
END;
$$ LANGUAGE plpgsql;

-- 고유한 상호작용 ID 생성
CREATE OR REPLACE FUNCTION generate_interaction_id()
RETURNS TEXT AS $$
BEGIN
    RETURN 'int_' || to_char(NOW(), 'YYYYMMDD') || '_' || encode(gen_random_bytes(8), 'hex');
END;
$$ LANGUAGE plpgsql;

-- 완전한 사용자 프로필 생성 (Cue 시스템 최적화)
CREATE OR REPLACE FUNCTION create_cue_user_profile(
    p_email TEXT,
    p_display_name TEXT,
    p_username TEXT DEFAULT NULL,
    p_communication_style TEXT DEFAULT 'adaptive',
    p_learning_style TEXT DEFAULT 'mixed'
)
RETURNS TEXT AS $$
DECLARE
    new_did TEXT;
    computed_username TEXT;
BEGIN
    -- DID 생성
    new_did := generate_user_did();
    
    -- 사용자명 결정
    computed_username := COALESCE(p_username, split_part(p_email, '@', 1));
    
    -- 사용자 프로필 생성
    INSERT INTO user_profiles (
        did, email, display_name, username, 
        communication_style, learning_style,
        cue_learning_enabled, auto_cue_extraction
    ) VALUES (
        new_did, p_email, p_display_name, computed_username,
        p_communication_style, p_learning_style,
        TRUE, TRUE
    );
    
    -- 기본 전문성 컨텍스트 설정
    INSERT INTO user_expertise_contexts (user_did, domain, skill_level, confidence_score) VALUES
        (new_did, 'general_knowledge', 'learning', 0.5),
        (new_did, 'ai_interaction', 'learning', 0.3),
        (new_did, 'digital_literacy', 'competent', 0.6);
    
    -- 기본 플랫폼 동기화 설정
    INSERT INTO platform_sync_configurations (user_did, platform, status, sync_frequency) VALUES
        (new_did, 'chatgpt', 'inactive', 'daily'),
        (new_did, 'claude', 'inactive', 'daily'),
        (new_did, 'discord', 'inactive', 'weekly'),
        (new_did, 'gmail', 'inactive', 'weekly');
    
    -- 기본 큐들 생성 (학습 시작점)
    INSERT INTO personal_cues (user_did, cue_type, key, value, description, confidence_score) VALUES
        (new_did, 'communication', 'tone', 'friendly', '친근한 대화 톤 선호', 0.4),
        (new_did, 'preference', 'language', 'korean', '한국어 응답 선호', 0.9),
        (new_did, 'context', 'new_user', 'true', '새로운 사용자', 0.8);
    
    RETURN new_did;
END;
$$ LANGUAGE plpgsql;

-- Cue 강화 함수 (학습 알고리즘의 핵심)
CREATE OR REPLACE FUNCTION reinforce_cue(
    p_user_did TEXT,
    p_cue_type TEXT,
    p_key TEXT,
    p_effectiveness DECIMAL DEFAULT 0.8,
    p_evidence TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    current_confidence DECIMAL(3,2);
    current_evidence_count INTEGER;
    new_confidence DECIMAL(3,2);
    learning_rate DECIMAL(3,2) := 0.1;
BEGIN
    -- 현재 큐 정보 조회
    SELECT confidence_score, evidence_count 
    INTO current_confidence, current_evidence_count
    FROM personal_cues
    WHERE user_did = p_user_did AND cue_type = p_cue_type AND key = p_key;
    
    IF current_confidence IS NULL THEN
        RETURN FALSE; -- 큐가 존재하지 않음
    END IF;
    
    -- 적응형 학습률 (증거가 많을수록 학습률 감소)
    learning_rate := learning_rate / (1 + current_evidence_count * 0.1);
    
    -- 새로운 신뢰도 계산 (효과성 기반)
    new_confidence := LEAST(1.0, 
        current_confidence + (learning_rate * (p_effectiveness - current_confidence))
    );
    
    -- 큐 업데이트
    UPDATE personal_cues
    SET 
        confidence_score = new_confidence,
        evidence_count = evidence_count + 1,
        last_reinforced = NOW(),
        source_interactions = CASE 
            WHEN p_evidence IS NOT NULL 
            THEN array_append(source_interactions, p_evidence)
            ELSE source_interactions
        END,
        evidence_quality = CASE 
            WHEN p_effectiveness >= 0.8 THEN 'high'
            WHEN p_effectiveness >= 0.6 THEN 'medium'
            ELSE 'low'
        END
    WHERE user_did = p_user_did AND cue_type = p_cue_type AND key = p_key;
    
    RETURN TRUE;
END;
$ LANGUAGE plpgsql;

-- 사용자별 개인화된 큐 조회 (성능 최적화)
CREATE OR REPLACE FUNCTION get_active_user_cues(
    p_user_did TEXT,
    p_context TEXT DEFAULT NULL,
    p_cue_type TEXT DEFAULT NULL,
    p_min_confidence DECIMAL DEFAULT 0.3,
    p_limit INTEGER DEFAULT 50
)
RETURNS TABLE (
    cue_id UUID,
    cue_type TEXT,
    key TEXT,
    value TEXT,
    description TEXT,
    confidence_score DECIMAL,
    last_used TIMESTAMP WITH TIME ZONE,
    usage_frequency DECIMAL,
    applicable_contexts TEXT[]
) AS $
BEGIN
    RETURN QUERY
    SELECT 
        pc.id,
        pc.cue_type,
        pc.key,
        pc.value,
        pc.description,
        pc.confidence_score,
        pc.last_used,
        pc.usage_frequency,
        pc.applicable_contexts
    FROM personal_cues pc
    WHERE pc.user_did = p_user_did
    AND pc.is_active = TRUE
    AND (p_cue_type IS NULL OR pc.cue_type = p_cue_type)
    AND pc.confidence_score >= p_min_confidence
    AND (p_context IS NULL OR p_context = ANY(pc.applicable_contexts) OR pc.is_global = TRUE)
    ORDER BY 
        pc.priority DESC,
        pc.confidence_score DESC, 
        pc.usage_frequency DESC,
        pc.last_used DESC NULLS LAST
    LIMIT p_limit;
END;
$ LANGUAGE plpgsql;

-- 컨텍스트 처리 작업 생성
CREATE OR REPLACE FUNCTION create_context_processing_job(
    p_user_did TEXT,
    p_job_type TEXT DEFAULT 'cue_extraction',
    p_platforms TEXT[] DEFAULT ARRAY['chatgpt', 'claude'],
    p_priority INTEGER DEFAULT 5
)
RETURNS UUID AS $
DECLARE
    job_id UUID;
BEGIN
    INSERT INTO context_processing_jobs (
        user_did,
        job_type,
        target_platforms,
        date_range_start,
        date_range_end,
        priority,
        status
    )
    VALUES (
        p_user_did,
        p_job_type,
        p_platforms,
        NOW() - INTERVAL '30 days',
        NOW(),
        p_priority,
        'queued'
    )
    RETURNING id INTO job_id;
    
    RETURN job_id;
END;
$ LANGUAGE plpgsql;

-- 사용자 Cue 시스템 통계 조회
CREATE OR REPLACE FUNCTION get_user_cue_stats(p_user_did TEXT)
RETURNS JSONB AS $
DECLARE
    stats JSONB;
BEGIN
    SELECT jsonb_build_object(
        'total_cues', COUNT(*),
        'active_cues', COUNT(*) FILTER (WHERE is_active = TRUE),
        'high_confidence_cues', COUNT(*) FILTER (WHERE confidence_score >= 0.7),
        'recent_cues', COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days'),
        'avg_confidence', ROUND(AVG(confidence_score), 2),
        'most_used_type', mode() WITHIN GROUP (ORDER BY cue_type),
        'total_applications', COALESCE(SUM(
            (SELECT COUNT(*) FROM cue_usage_history WHERE cue_id = personal_cues.id)
        ), 0),
        'learning_velocity', ROUND(
            COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') / 30.0, 2
        ),
        'cue_types_distribution', jsonb_object_agg(
            cue_type, 
            COUNT(*) FILTER (WHERE cue_type = personal_cues.cue_type)
        )
    ) INTO stats
    FROM personal_cues
    WHERE user_did = p_user_did;
    
    RETURN stats;
END;
$ LANGUAGE plpgsql;

-- Cue 패턴 분석 및 인사이트 생성
CREATE OR REPLACE FUNCTION analyze_cue_patterns(p_user_did TEXT)
RETURNS VOID AS $
DECLARE
    pattern_record RECORD;
    insight_text TEXT;
BEGIN
    -- 최근 Cue 사용 패턴 분석
    FOR pattern_record IN
        SELECT 
            c.cue_type,
            COUNT(*) as usage_count,
            AVG(h.immediate_effectiveness) as avg_effectiveness,
            STRING_AGG(DISTINCT h.user_feedback, ', ') as feedback_summary
        FROM personal_cues c
        JOIN cue_usage_history h ON c.id = h.cue_id
        WHERE c.user_did = p_user_did 
        AND h.used_at >= NOW() - INTERVAL '7 days'
        GROUP BY c.cue_type
        HAVING COUNT(*) >= 3
    LOOP
        -- 효과적인 Cue 타입 발견
        IF pattern_record.avg_effectiveness >= 0.8 THEN
            insight_text := format(
                '%s 타입의 개인화 설정이 매우 효과적입니다. (효과성: %.1f%%)',
                pattern_record.cue_type,
                pattern_record.avg_effectiveness * 100
            );
            
            INSERT INTO cue_insights (
                user_did, insight_type, insight_category, title, description,
                confidence_level, status, priority
            ) VALUES (
                p_user_did, 'achievement', 'personalization',
                '효과적인 개인화 패턴 발견',
                insight_text,
                0.8, 'active', 7
            );
        END IF;
        
        -- 개선이 필요한 영역 발견
        IF pattern_record.avg_effectiveness <= 0.4 AND pattern_record.usage_count >= 5 THEN
            insight_text := format(
                '%s 타입의 설정을 재검토해보세요. 현재 효과성이 낮습니다.',
                pattern_record.cue_type
            );
            
            INSERT INTO cue_insights (
                user_did, insight_type, insight_category, title, description,
                confidence_level, status, priority
            ) VALUES (
                p_user_did, 'improvement_opportunity', 'optimization',
                '개인화 설정 개선 기회',
                insight_text,
                0.7, 'active', 6
            );
        END IF;
    END LOOP;
END;
$ LANGUAGE plpgsql;

-- =============================================================================
-- 🌱 기본 데이터 삽입 (Cue 시스템 최적화)
-- =============================================================================

-- 기본 AI 에이전트들 (Cue 시스템 완전 통합)
INSERT INTO ai_agents (
    agent_did, name, description, provider, model_name, 
    cue_capabilities, cue_integration_level, supports_multimodal,
    expertise_domains, strength_areas
) VALUES
(
    'did:cue:agent:openai:gpt4-turbo:001',
    'ChatGPT-4 Turbo (Cue Enhanced)',
    'Cue 학습으로 개인화된 GPT-4 터보 모델',
    'openai', 'gpt-4-turbo',
    '{"extraction": true, "application": true, "learning": true, "adaptation": true, "cross_context": true, "real_time": true}',
    'full', TRUE,
    ARRAY['programming', 'writing', 'analysis', 'problem_solving'],
    ARRAY['code_generation', 'creative_writing', 'detailed_explanations']
),
(
    'did:cue:agent:anthropic:claude-sonnet:001',
    'Claude Sonnet 4 (Cue Aware)',
    'Cue 인식으로 개인화된 Claude 3 Sonnet',
    'anthropic', 'claude-3-sonnet',
    '{"extraction": true, "application": true, "learning": true, "adaptation": true, "cross_context": false, "real_time": true}',
    'full', FALSE,
    ARRAY['reasoning', 'analysis', 'research', 'ethics'],
    ARRAY['logical_reasoning', 'research_assistance', 'ethical_analysis']
),
(
    'did:cue:agent:google:gemini-pro:001',
    'Gemini Pro (Context Aware)',
    '컨텍스트 인식으로 최적화된 Gemini Pro',
    'google', 'gemini-pro',
    '{"extraction": true, "application": true, "learning": false, "adaptation": true, "cross_context": true, "real_time": false}',
    'standard', TRUE,
    ARRAY['multimodal', 'creativity', 'problem_solving', 'language'],
    ARRAY['image_analysis', 'creative_tasks', 'multilingual_support']
),
(
    'did:cue:agent:system:cue-extractor:001',
    'Cue Extraction Agent',
    'Cue 추출 및 패턴 분석 전용 시스템',
    'system', 'cue-extractor-v2',
    '{"extraction": true, "application": false, "learning": true, "adaptation": false, "cross_context": true, "real_time": true}',
    'experimental', FALSE,
    ARRAY['pattern_analysis', 'preference_learning', 'behavior_analysis'],
    ARRAY['cue_extraction', 'pattern_recognition', 'user_modeling']
);

-- =============================================================================
-- 🔐 Row Level Security 설정 (개발 환경 최적화)
-- =============================================================================

-- 모든 테이블에 RLS 활성화
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_expertise_contexts ENABLE ROW LEVEL SECURITY;
ALTER TABLE webauthn_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE webauthn_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE did_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_agent_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE personal_cues ENABLE ROW LEVEL SECURITY;
ALTER TABLE cue_usage_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE cue_interaction_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE raw_context_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE normalized_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_sync_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE context_processing_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE cue_insights ENABLE ROW LEVEL SECURITY;

-- 개발 환경용 정책 (모든 접근 허용 - 추후 프로덕션에서 사용자별 제한 적용)
CREATE POLICY "Development access policy" ON user_profiles FOR ALL USING (true);
CREATE POLICY "Development access policy" ON user_expertise_contexts FOR ALL USING (true);
CREATE POLICY "Development access policy" ON webauthn_credentials FOR ALL USING (true);
CREATE POLICY "Development access policy" ON webauthn_sessions FOR ALL USING (true);
CREATE POLICY "Development access policy" ON did_documents FOR ALL USING (true);
CREATE POLICY "Development access policy" ON ai_agents FOR ALL USING (true);
CREATE POLICY "Development access policy" ON user_agent_relationships FOR ALL USING (true);
CREATE POLICY "Development access policy" ON personal_cues FOR ALL USING (true);
CREATE POLICY "Development access policy" ON cue_usage_history FOR ALL USING (true);
CREATE POLICY "Development access policy" ON cue_interaction_patterns FOR ALL USING (true);
CREATE POLICY "Development access policy" ON raw_context_data FOR ALL USING (true);
CREATE POLICY "Development access policy" ON normalized_interactions FOR ALL USING (true);
CREATE POLICY "Development access policy" ON platform_sync_configurations FOR ALL USING (true);
CREATE POLICY "Development access policy" ON context_processing_jobs FOR ALL USING (true);
CREATE POLICY "Development access policy" ON usage_analytics FOR ALL USING (true);
CREATE POLICY "Development access policy" ON system_performance_metrics FOR ALL USING (true);
CREATE POLICY "Development access policy" ON cue_insights FOR ALL USING (true);

-- =============================================================================
-- 🧪 테스트 데이터 생성
-- =============================================================================

-- 샘플 사용자 생성 및 기본 Cue 데이터
DO $
DECLARE
    test_user_did TEXT;
    test_agent_did TEXT;
    test_cue_id UUID;
    test_interaction_id TEXT;
BEGIN
    -- 테스트 사용자 생성
    test_user_did := create_cue_user_profile(
        'test@cue-system.dev',
        'Cue System Test User',
        'cue_tester',
        'technical',
        'interactive'
    );
    
    -- 추가 샘플 큐들 생성
    INSERT INTO personal_cues (user_did, cue_type, key, value, description, confidence_score, evidence_count) VALUES
    (test_user_did, 'preference', 'response_style', 'detailed_with_examples', '예시를 포함한 상세한 답변 선호', 0.8, 5),
    (test_user_did, 'preference', 'code_language', 'typescript', 'TypeScript 코드 예시 선호', 0.9, 8),
    (test_user_did, 'expertise', 'programming_level', 'intermediate', '프로그래밍 중급 수준', 0.7, 3),
    (test_user_did, 'context', 'work_domain', 'web_development', '웹 개발 관련 업무', 0.8, 6),
    (test_user_did, 'behavior', 'question_pattern', 'step_by_step', '단계별 설명 요청 패턴', 0.6, 4),
    (test_user_did, 'goal', 'learning_focus', 'ai_integration', 'AI 통합 기술 학습 목표', 0.7, 2),
    (test_user_did, 'communication', 'formality', 'casual_professional', '친근하지만 전문적인 톤', 0.8, 7),
    (test_user_did, 'workflow', 'documentation', 'comprehensive', '포괄적인 문서화 선호', 0.6, 3);
    
    -- Agent와의 관계 설정
    test_agent_did := 'did:cue:agent:openai:gpt4-turbo:001';
    
    INSERT INTO user_agent_relationships (
        user_did, agent_did, relationship_id, nickname, trust_level, 
        total_interactions, successful_interactions, cue_effectiveness_score
    ) VALUES (
        test_user_did, test_agent_did, 
        test_user_did || ':' || test_agent_did,
        'My AI Assistant',
        0.8, 25, 23, 0.85
    );
    
    -- 샘플 상호작용 및 Cue 사용 이력
    test_interaction_id := generate_interaction_id();
    
    INSERT INTO normalized_interactions (
        interaction_id, user_did, role, content, platform, 
        original_timestamp, intent_categories, topics, quality_score
    ) VALUES (
        test_interaction_id, test_user_did, 'user', 
        'TypeScript로 WebAuthn을 구현하는 방법을 단계별로 알려주세요.',
        'chatgpt', NOW() - INTERVAL '1 hour',
        ARRAY['question', 'tutorial_request'],
        ARRAY['typescript', 'webauthn', 'implementation'],
        0.9
    );
    
    -- Cue 사용 이력 추가
    SELECT id INTO test_cue_id FROM personal_cues 
    WHERE user_did = test_user_did AND key = 'code_language' LIMIT 1;
    
    INSERT INTO cue_usage_history (
        cue_id, user_did, agent_did, interaction_id,
        immediate_effectiveness, user_satisfaction, user_feedback
    ) VALUES (
        test_cue_id, test_user_did, test_agent_did, test_interaction_id,
        0.9, 0.85, 'very_helpful'
    );
    
    -- 샘플 인사이트 생성
    INSERT INTO cue_insights (
        user_did, insight_type, insight_category, title, description,
        confidence_level, priority, status
    ) VALUES (
        test_user_did, 'achievement', 'personalization',
        'TypeScript 개인화 설정 효과적',
        'TypeScript 코드 예시를 선호하는 설정이 매우 효과적으로 작동하고 있습니다. 지속적으로 이 패턴을 유지하세요.',
        0.9, 8, 'active'
    );
    
    RAISE NOTICE '✅ 테스트 사용자 생성 완료: %', test_user_did;
    RAISE NOTICE '🧠 샘플 큐 8개 생성됨';
    RAISE NOTICE '🔗 Agent 관계 설정됨';
    RAISE NOTICE '💬 샘플 상호작용 생성됨';
    RAISE NOTICE '📊 Cue 사용 이력 생성됨';
END $;

-- =============================================================================
-- ✅ 완전 새로운 Cue 최적화 스키마 완료
-- =============================================================================

-- 최종 검증 및 요약
DO $
DECLARE
    table_count INTEGER;
    index_count INTEGER;
    function_count INTEGER;
    trigger_count INTEGER;
    sample_user_count INTEGER;
BEGIN
    -- 테이블 수 확인
    SELECT COUNT(*) INTO table_count 
    FROM information_schema.tables 
    WHERE table_schema = 'public';
    
    -- 인덱스 수 확인  
    SELECT COUNT(*) INTO index_count
    FROM pg_indexes 
    WHERE schemaname = 'public';
    
    -- 함수 수 확인
    SELECT COUNT(*) INTO function_count
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public'
    AND p.prokind = 'f';
    
    -- 트리거 수 확인
    SELECT COUNT(*) INTO trigger_count
    FROM information_schema.triggers
    WHERE trigger_schema = 'public';
    
    -- 샘플 사용자 확인
    SELECT COUNT(*) INTO sample_user_count
    FROM user_profiles;
    
    RAISE NOTICE '';
    RAISE NOTICE '🎉 ===== Cue 시스템 완전 최적화 스키마 구축 완료! =====';
    RAISE NOTICE '';
    RAISE NOTICE '📊 생성된 구성 요소:';
    RAISE NOTICE '   📋 테이블: %개 (Cue 시스템 특화)', table_count;
    RAISE NOTICE '   🔍 인덱스: %개 (성능 최적화)', index_count;
    RAISE NOTICE '   ⚙️  함수: %개 (Cue 학습 알고리즘)', function_count;
    RAISE NOTICE '   🔄 트리거: %개 (자동화)', trigger_count;
    RAISE NOTICE '';
    RAISE NOTICE '🧠 핵심 Cue 시스템 기능:';
    RAISE NOTICE '   ✅ personal_cues - 개인화 큐 저장 및 학습';
    RAISE NOTICE '   ✅ cue_usage_history - 효과 측정 및 피드백';
    RAISE NOTICE '   ✅ normalized_interactions - 구조화된 상호작용';
    RAISE NOTICE '   ✅ user_expertise_contexts - 전문성 컨텍스트';
    RAISE NOTICE '   ✅ cue_interaction_patterns - 사용 패턴 분석';
    RAISE NOTICE '   ✅ platform_sync_configurations - 다중 플랫폼 동기화';
    RAISE NOTICE '';
    RAISE NOTICE '🔐 보안 및 인증:';
    RAISE NOTICE '   ✅ WebAuthn 완전 통합 (Cue 컨텍스트 포함)';
    RAISE NOTICE '   ✅ DID 기반 분산 신원 관리';
    RAISE NOTICE '   ✅ 적응형 보안 (행동 기반 위험 분석)';
    RAISE NOTICE '';
    RAISE NOTICE '🤖 AI Agent 통합:';
    RAISE NOTICE '   ✅ Cue 인식 AI Agent 시스템';
    RAISE NOTICE '   ✅ 개인화된 Agent 관계 관리';
    RAISE NOTICE '   ✅ 실시간 Cue 적용 및 학습';
    RAISE NOTICE '';
    RAISE NOTICE '📈 분석 및 최적화:';
    RAISE NOTICE '   ✅ 실시간 성능 모니터링';
    RAISE NOTICE '   ✅ 사용자별 개인화 효과 추적';
    RAISE NOTICE '   ✅ 자동 인사이트 생성';
    RAISE NOTICE '';
    RAISE NOTICE '👤 테스트 데이터:';
    RAISE NOTICE '   🧪 샘플 사용자: %명', sample_user_count;
    RAISE NOTICE '   🧠 샘플 큐: 8개 생성됨';
    RAISE NOTICE '   🔗 Agent 관계 설정됨';
    RAISE NOTICE '';
    RAISE NOTICE '🚀 다음 단계:';
    RAISE NOTICE '   1. 웹 인터페이스에서 Cue 시스템 테스트';
    RAISE NOTICE '   2. 실제 사용자 상호작용으로 Cue 학습 검증';
    RAISE NOTICE '   3. 다중 플랫폼 동기화 구현';
    RAISE NOTICE '   4. 고급 패턴 분석 알고리즘 추가';
    RAISE NOTICE '';
    RAISE NOTICE '✨ Cue 기반 개인화 AI 시스템이 완전히 준비되었습니다!';
    RAISE NOTICE '';
END $;