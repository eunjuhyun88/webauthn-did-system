-- =============================================================================
-- 🗄️ WebAuthn + DID + CUE 시스템 통합 데이터베이스 스키마
-- 파일: src/database/migrations/001_initial_schema.sql
-- =============================================================================

-- 스키마 시작
BEGIN;

-- UUID 확장 활성화
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- 1. 사용자 기본 테이블
-- =============================================================================

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- 기본 정보
  username VARCHAR(100) UNIQUE NOT NULL,
  display_name VARCHAR(200) NOT NULL,
  email VARCHAR(255) UNIQUE,
  
  -- DID 정보
  did VARCHAR(500) UNIQUE, -- W3C DID 표준 식별자
  did_document JSONB, -- DID Document 전체
  did_method VARCHAR(50) DEFAULT 'web', -- did:web 또는 did:key
  
  -- 인증 상태
  auth_status VARCHAR(50) DEFAULT 'pending' CHECK (auth_status IN ('pending', 'verified', 'suspended', 'banned')),
  last_login TIMESTAMP WITH TIME ZONE,
  login_count INTEGER DEFAULT 0,
  
  -- 메타데이터
  profile_data JSONB DEFAULT '{}', -- 추가 프로필 정보
  preferences JSONB DEFAULT '{}', -- 사용자 설정
  metadata JSONB DEFAULT '{}', -- 시스템 메타데이터
  
  -- 추적 정보
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP WITH TIME ZONE,
  
  -- 인덱스
  CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' OR email IS NULL)
);

-- 사용자 테이블 인덱스
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_did ON users(did);
CREATE INDEX IF NOT EXISTS idx_users_auth_status ON users(auth_status);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

-- =============================================================================
-- 2. WebAuthn 인증 정보 테이블
-- =============================================================================

CREATE TABLE IF NOT EXISTS webauthn_credentials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- 연결 정보
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- WebAuthn 필수 정보
  credential_id TEXT UNIQUE NOT NULL, -- Base64URL 인코딩된 Credential ID
  public_key TEXT NOT NULL, -- 공개키 (PEM 또는 JWK 형식)
  counter BIGINT DEFAULT 0, -- 사용 카운터
  
  -- 인증기 정보
  aaguid UUID, -- Authenticator GUID
  transports TEXT[] DEFAULT ARRAY['internal'], -- ['usb', 'nfc', 'ble', 'internal']
  device_type VARCHAR(50) DEFAULT 'platform' CHECK (device_type IN ('platform', 'cross-platform')),
  backup_eligible BOOLEAN DEFAULT false,
  backup_state BOOLEAN DEFAULT false,
  
  -- 생체 인증 정보
  biometric_type VARCHAR(50) CHECK (biometric_type IN ('touchid', 'faceid', 'windowshello', 'fingerprint', 'iris', 'voice', 'unknown')),
  attestation_format VARCHAR(50), -- 'packed', 'tpm', 'android-key', 'android-safetynet', 'fido-u2f', 'apple', 'none'
  
  -- 디바이스 정보
  device_name VARCHAR(200), -- 사용자 지정 디바이스 이름
  user_agent TEXT, -- 등록시 User-Agent
  platform_info JSONB DEFAULT '{}', -- OS, 브라우저 정보
  
  -- 사용 통계
  usage_count INTEGER DEFAULT 0,
  last_used TIMESTAMP WITH TIME ZONE,
  
  -- 상태 관리
  is_active BOOLEAN DEFAULT true,
  revoked_at TIMESTAMP WITH TIME ZONE,
  revoke_reason TEXT,
  
  -- 메타데이터
  registration_data JSONB DEFAULT '{}', -- 등록시 추가 데이터
  metadata JSONB DEFAULT '{}', -- 시스템 메타데이터
  
  -- 추적 정보
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- WebAuthn 테이블 인덱스
CREATE INDEX IF NOT EXISTS idx_webauthn_user_id ON webauthn_credentials(user_id);
CREATE INDEX IF NOT EXISTS idx_webauthn_credential_id ON webauthn_credentials(credential_id);
CREATE INDEX IF NOT EXISTS idx_webauthn_biometric_type ON webauthn_credentials(biometric_type);
CREATE INDEX IF NOT EXISTS idx_webauthn_is_active ON webauthn_credentials(is_active);
CREATE INDEX IF NOT EXISTS idx_webauthn_created_at ON webauthn_credentials(created_at);

-- =============================================================================
-- 3. 개인화된 CUE 데이터 테이블
-- =============================================================================

CREATE TABLE IF NOT EXISTS personal_cues (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- 연결 정보
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- CUE 기본 정보
  cue_type VARCHAR(100) NOT NULL, -- 'context', 'intent', 'preference', 'behavior', 'knowledge'
  cue_category VARCHAR(100), -- 'personal', 'professional', 'social', 'technical'
  cue_name VARCHAR(200) NOT NULL,
  cue_description TEXT,
  
  -- CUE 내용
  cue_data JSONB NOT NULL DEFAULT '{}', -- 실제 CUE 데이터
  extracted_patterns JSONB DEFAULT '{}', -- 추출된 패턴들
  confidence_score DECIMAL(5,4) DEFAULT 0.0 CHECK (confidence_score >= 0.0 AND confidence_score <= 1.0),
  
  -- 컨텍스트 정보
  context_data JSONB DEFAULT '{}', -- 상황별 컨텍스트
  platform_source VARCHAR(100), -- 'chat', 'email', 'calendar', 'document', 'voice', 'manual'
  original_input TEXT, -- 원본 입력 데이터
  processed_input JSONB DEFAULT '{}', -- 처리된 입력 데이터
  
  -- AI 처리 정보
  ai_model_used VARCHAR(100), -- 'gpt-4', 'claude-3', 'gemini-pro' 등
  processing_metadata JSONB DEFAULT '{}', -- AI 처리 메타데이터
  
  -- 사용 통계
  access_count INTEGER DEFAULT 0,
  last_accessed TIMESTAMP WITH TIME ZONE,
  effectiveness_score DECIMAL(5,4) DEFAULT 0.0, -- 유효성 점수
  
  -- 관계 및 연결
  parent_cue_id UUID REFERENCES personal_cues(id), -- 상위 CUE 연결
  related_cue_ids UUID[] DEFAULT ARRAY[]::UUID[], -- 관련 CUE들
  
  -- 라이프사이클 관리
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived', 'deprecated')),
  expires_at TIMESTAMP WITH TIME ZONE, -- 만료 시간 (선택적)
  
  -- 추적 정보
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  -- 제약 조건
  CONSTRAINT unique_user_cue_name UNIQUE(user_id, cue_name)
);

-- CUE 테이블 인덱스
CREATE INDEX IF NOT EXISTS idx_cues_user_id ON personal_cues(user_id);
CREATE INDEX IF NOT EXISTS idx_cues_type ON personal_cues(cue_type);
CREATE INDEX IF NOT EXISTS idx_cues_category ON personal_cues(cue_category);
CREATE INDEX IF NOT EXISTS idx_cues_platform_source ON personal_cues(platform_source);
CREATE INDEX IF NOT EXISTS idx_cues_status ON personal_cues(status);
CREATE INDEX IF NOT EXISTS idx_cues_confidence_score ON personal_cues(confidence_score);
CREATE INDEX IF NOT EXISTS idx_cues_created_at ON personal_cues(created_at);

-- GIN 인덱스 (JSONB 검색용)
CREATE INDEX IF NOT EXISTS idx_cues_data_gin ON personal_cues USING GIN (cue_data);
CREATE INDEX IF NOT EXISTS idx_cues_patterns_gin ON personal_cues USING GIN (extracted_patterns);
CREATE INDEX IF NOT EXISTS idx_cues_context_gin ON personal_cues USING GIN (context_data);

-- =============================================================================
-- 4. AI 에이전트 정보 테이블
-- =============================================================================

CREATE TABLE IF NOT EXISTS ai_agents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- 기본 정보
  agent_id VARCHAR(100) UNIQUE NOT NULL, -- 'claude-3', 'gpt-4', 'gemini-pro'
  agent_name VARCHAR(200) NOT NULL,
  agent_type VARCHAR(100) NOT NULL, -- 'llm', 'assistant', 'specialist'
  
  -- 에이전트 설정
  model_config JSONB DEFAULT '{}', -- 모델별 설정
  system_prompt TEXT, -- 기본 시스템 프롬프트
  capabilities TEXT[] DEFAULT ARRAY[]::TEXT[], -- ['text', 'code', 'analysis', 'vision']
  
  -- API 정보
  api_provider VARCHAR(100), -- 'openai', 'anthropic', 'google', 'huggingface'
  api_endpoint TEXT,
  rate_limits JSONB DEFAULT '{}', -- API 제한사항
  
  -- 상태 및 통계
  is_active BOOLEAN DEFAULT true,
  total_requests INTEGER DEFAULT 0,
  total_tokens_used BIGINT DEFAULT 0,
  average_response_time DECIMAL(10,3) DEFAULT 0.0, -- 평균 응답시간 (초)
  
  -- 비용 정보
  cost_per_token DECIMAL(10,8) DEFAULT 0.0,
  total_cost DECIMAL(15,4) DEFAULT 0.0,
  
  -- 추적 정보
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- AI 에이전트 인덱스
CREATE INDEX IF NOT EXISTS idx_agents_agent_id ON ai_agents(agent_id);
CREATE INDEX IF NOT EXISTS idx_agents_type ON ai_agents(agent_type);
CREATE INDEX IF NOT EXISTS idx_agents_provider ON ai_agents(api_provider);
CREATE INDEX IF NOT EXISTS idx_agents_active ON ai_agents(is_active);

-- =============================================================================
-- 5. 대화 세션 테이블
-- =============================================================================

CREATE TABLE IF NOT EXISTS conversation_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- 연결 정보
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES ai_agents(id),
  
  -- 세션 정보
  session_title VARCHAR(500),
  session_context JSONB DEFAULT '{}', -- 세션별 컨텍스트
  
  -- CUE 연동
  applied_cues UUID[] DEFAULT ARRAY[]::UUID[], -- 적용된 CUE ID들
  generated_cues UUID[] DEFAULT ARRAY[]::UUID[], -- 생성된 CUE ID들
  
  -- 통계
  message_count INTEGER DEFAULT 0,
  total_tokens INTEGER DEFAULT 0,
  session_cost DECIMAL(10,4) DEFAULT 0.0,
  
  -- 상태
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'archived')),
  
  -- 추적 정보
  started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  ended_at TIMESTAMP WITH TIME ZONE,
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 대화 세션 인덱스
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON conversation_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_agent_id ON conversation_sessions(agent_id);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON conversation_sessions(status);
CREATE INDEX IF NOT EXISTS idx_sessions_last_activity ON conversation_sessions(last_activity);

-- =============================================================================
-- 6. 대화 메시지 테이블
-- =============================================================================

CREATE TABLE IF NOT EXISTS conversation_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- 연결 정보
  session_id UUID NOT NULL REFERENCES conversation_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- 메시지 정보
  message_type VARCHAR(50) NOT NULL CHECK (message_type IN ('user', 'assistant', 'system', 'function')),
  message_role VARCHAR(50) NOT NULL, -- 'user', 'assistant', 'system'
  message_content TEXT NOT NULL,
  message_metadata JSONB DEFAULT '{}',
  
  -- CUE 추출 정보
  extracted_cues JSONB DEFAULT '{}', -- 이 메시지에서 추출된 CUE들
  cue_confidence DECIMAL(5,4) DEFAULT 0.0,
  
  -- AI 처리 정보
  model_used VARCHAR(100),
  tokens_used INTEGER DEFAULT 0,
  processing_time DECIMAL(10,3) DEFAULT 0.0, -- 처리시간 (초)
  
  -- 추적 정보
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 메시지 테이블 인덱스
CREATE INDEX IF NOT EXISTS idx_messages_session_id ON conversation_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_messages_user_id ON conversation_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_type ON conversation_messages(message_type);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON conversation_messages(created_at);

-- =============================================================================
-- 7. 시스템 이벤트 로그 테이블
-- =============================================================================

CREATE TABLE IF NOT EXISTS system_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- 이벤트 정보
  event_type VARCHAR(100) NOT NULL, -- 'auth', 'cue_extraction', 'conversation', 'error'
  event_category VARCHAR(100), -- 'security', 'performance', 'user_action', 'system'
  event_name VARCHAR(200) NOT NULL,
  event_description TEXT,
  
  -- 연결 정보
  user_id UUID REFERENCES users(id),
  session_id VARCHAR(500), -- 웹 세션 ID 또는 기타 세션 식별자
  
  -- 이벤트 데이터
  event_data JSONB DEFAULT '{}',
  context_data JSONB DEFAULT '{}',
  
  -- 추적 정보
  ip_address INET,
  user_agent TEXT,
  request_id VARCHAR(100),
  
  -- 상태
  severity VARCHAR(50) DEFAULT 'info' CHECK (severity IN ('debug', 'info', 'warning', 'error', 'critical')),
  
  -- 타임스탬프
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 시스템 이벤트 인덱스
CREATE INDEX IF NOT EXISTS idx_events_type ON system_events(event_type);
CREATE INDEX IF NOT EXISTS idx_events_category ON system_events(event_category);
CREATE INDEX IF NOT EXISTS idx_events_user_id ON system_events(user_id);
CREATE INDEX IF NOT EXISTS idx_events_severity ON system_events(severity);
CREATE INDEX IF NOT EXISTS idx_events_created_at ON system_events(created_at);

-- =============================================================================
-- 8. 업데이트 트리거 함수
-- =============================================================================

-- updated_at 자동 업데이트 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 트리거 생성
CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON users 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_webauthn_credentials_updated_at 
  BEFORE UPDATE ON webauthn_credentials 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_personal_cues_updated_at 
  BEFORE UPDATE ON personal_cues 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_agents_updated_at 
  BEFORE UPDATE ON ai_agents 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversation_messages_updated_at 
  BEFORE UPDATE ON conversation_messages 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- 9. 기본 데이터 삽입
-- =============================================================================

-- 기본 AI 에이전트들 삽입
INSERT INTO ai_agents (agent_id, agent_name, agent_type, api_provider, capabilities, model_config, is_active) 
VALUES 
  ('gpt-4', 'GPT-4', 'llm', 'openai', ARRAY['text', 'code', 'analysis'], '{"model": "gpt-4", "max_tokens": 8192}', true),
  ('claude-3', 'Claude 3', 'assistant', 'anthropic', ARRAY['text', 'analysis', 'reasoning'], '{"model": "claude-3-sonnet-20241022", "max_tokens": 4096}', true),
  ('gemini-pro', 'Gemini Pro', 'llm', 'google', ARRAY['text', 'multimodal'], '{"model": "gemini-pro", "max_tokens": 2048}', true)
ON CONFLICT (agent_id) DO NOTHING;

-- 데모 사용자 생성 (개발용)
INSERT INTO users (username, display_name, email, auth_status, did_method)
VALUES 
  ('demo_user', 'Demo User', 'demo@example.com', 'verified', 'web'),
  ('test_admin', 'Test Administrator', 'admin@example.com', 'verified', 'web')
ON CONFLICT (username) DO NOTHING;

-- =============================================================================
-- 10. 뷰 생성 (편의를 위한)
-- =============================================================================

-- 사용자 종합 정보 뷰
CREATE OR REPLACE VIEW user_summary AS
SELECT 
  u.id,
  u.username,
  u.display_name,
  u.email,
  u.did,
  u.auth_status,
  u.last_login,
  u.login_count,
  COUNT(wc.id) as webauthn_credentials_count,
  COUNT(pc.id) as personal_cues_count,
  u.created_at,
  u.updated_at
FROM users u
LEFT JOIN webauthn_credentials wc ON u.id = wc.user_id AND wc.is_active = true
LEFT JOIN personal_cues pc ON u.id = pc.user_id AND pc.status = 'active'
GROUP BY u.id, u.username, u.display_name, u.email, u.did, u.auth_status, u.last_login, u.login_count, u.created_at, u.updated_at;

-- 활성 CUE 통계 뷰
CREATE OR REPLACE VIEW cue_statistics AS
SELECT 
  cue_type,
  cue_category,
  COUNT(*) as total_cues,
  AVG(confidence_score) as avg_confidence,
  AVG(effectiveness_score) as avg_effectiveness,
  COUNT(DISTINCT user_id) as users_with_cues
FROM personal_cues 
WHERE status = 'active'
GROUP BY cue_type, cue_category
ORDER BY total_cues DESC;

-- =============================================================================
-- 11. RLS (Row Level Security) 설정
-- =============================================================================

-- RLS 활성화
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE webauthn_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE personal_cues ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_messages ENABLE ROW LEVEL SECURITY;

-- 기본 RLS 정책 (각 사용자는 자신의 데이터만 접근 가능)
CREATE POLICY users_policy ON users FOR ALL USING (auth.uid()::text = id::text);
CREATE POLICY webauthn_policy ON webauthn_credentials FOR ALL USING (user_id::text = auth.uid()::text);
CREATE POLICY cues_policy ON personal_cues FOR ALL USING (user_id::text = auth.uid()::text);
CREATE POLICY sessions_policy ON conversation_sessions FOR ALL USING (user_id::text = auth.uid()::text);
CREATE POLICY messages_policy ON conversation_messages FOR ALL USING (user_id::text = auth.uid()::text);

COMMIT;

-- =============================================================================
-- 스키마 생성 완료
-- =============================================================================