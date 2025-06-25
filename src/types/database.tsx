// =============================================================================
// 🗄️ 데이터베이스 타입 정의
// 파일: src/types/database.ts
// =============================================================================

// =============================================================================
// Supabase Database 스키마 타입 정의
// =============================================================================

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          username: string;
          display_name: string;
          email: string | null;
          did: string | null;
          did_document: Json | null;
          did_method: string;
          auth_status: string;
          last_login: string | null;
          login_count: number;
          profile_data: Json;
          preferences: Json;
          metadata: Json;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          username: string;
          display_name: string;
          email?: string | null;
          did?: string | null;
          did_document?: Json | null;
          did_method?: string;
          auth_status?: string;
          last_login?: string | null;
          login_count?: number;
          profile_data?: Json;
          preferences?: Json;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          username?: string;
          display_name?: string;
          email?: string | null;
          did?: string | null;
          did_document?: Json | null;
          did_method?: string;
          auth_status?: string;
          last_login?: string | null;
          login_count?: number;
          profile_data?: Json;
          preferences?: Json;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
      };

      webauthn_credentials: {
        Row: {
          id: string;
          user_id: string;
          credential_id: string;
          public_key: string;
          counter: number;
          aaguid: string | null;
          transports: string[] | null;
          device_type: string;
          backup_eligible: boolean;
          backup_state: boolean;
          biometric_type: string | null;
          attestation_format: string | null;
          device_name: string | null;
          user_agent: string | null;
          platform_info: Json;
          usage_count: number;
          last_used: string | null;
          is_active: boolean;
          revoked_at: string | null;
          revoke_reason: string | null;
          registration_data: Json;
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          credential_id: string;
          public_key: string;
          counter?: number;
          aaguid?: string | null;
          transports?: string[] | null;
          device_type?: string;
          backup_eligible?: boolean;
          backup_state?: boolean;
          biometric_type?: string | null;
          attestation_format?: string | null;
          device_name?: string | null;
          user_agent?: string | null;
          platform_info?: Json;
          usage_count?: number;
          last_used?: string | null;
          is_active?: boolean;
          revoked_at?: string | null;
          revoke_reason?: string | null;
          registration_data?: Json;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          credential_id?: string;
          public_key?: string;
          counter?: number;
          aaguid?: string | null;
          transports?: string[] | null;
          device_type?: string;
          backup_eligible?: boolean;
          backup_state?: boolean;
          biometric_type?: string | null;
          attestation_format?: string | null;
          device_name?: string | null;
          user_agent?: string | null;
          platform_info?: Json;
          usage_count?: number;
          last_used?: string | null;
          is_active?: boolean;
          revoked_at?: string | null;
          revoke_reason?: string | null;
          registration_data?: Json;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };

      personal_cues: {
        Row: {
          id: string;
          user_id: string;
          cue_type: string;
          cue_category: string | null;
          cue_name: string;
          cue_description: string | null;
          cue_data: Json;
          extracted_patterns: Json;
          confidence_score: number;
          context_data: Json;
          platform_source: string | null;
          original_input: string | null;
          processed_input: Json;
          ai_model_used: string | null;
          processing_metadata: Json;
          access_count: number;
          last_accessed: string | null;
          effectiveness_score: number;
          parent_cue_id: string | null;
          related_cue_ids: string[];
          status: string;
          expires_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          cue_type: string;
          cue_category?: string | null;
          cue_name: string;
          cue_description?: string | null;
          cue_data: Json;
          extracted_patterns?: Json;
          confidence_score: number;
          context_data?: Json;
          platform_source?: string | null;
          original_input?: string | null;
          processed_input?: Json;
          ai_model_used?: string | null;
          processing_metadata?: Json;
          access_count?: number;
          last_accessed?: string | null;
          effectiveness_score?: number;
          parent_cue_id?: string | null;
          related_cue_ids?: string[];
          status?: string;
          expires_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          cue_type?: string;
          cue_category?: string | null;
          cue_name?: string;
          cue_description?: string | null;
          cue_data?: Json;
          extracted_patterns?: Json;
          confidence_score?: number;
          context_data?: Json;
          platform_source?: string | null;
          original_input?: string | null;
          processed_input?: Json;
          ai_model_used?: string | null;
          processing_metadata?: Json;
          access_count?: number;
          last_accessed?: string | null;
          effectiveness_score?: number;
          parent_cue_id?: string | null;
          related_cue_ids?: string[];
          status?: string;
          expires_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };

      ai_agents: {
        Row: {
          id: string;
          agent_id: string;
          agent_name: string;
          agent_type: string;
          model_config: Json;
          system_prompt: string | null;
          capabilities: string[];
          api_provider: string | null;
          api_endpoint: string | null;
          rate_limits: Json;
          is_active: boolean;
          total_requests: number;
          total_tokens_used: number;
          average_response_time: number;
          cost_per_token: number;
          total_cost: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          agent_id: string;
          agent_name: string;
          agent_type: string;
          model_config?: Json;
          system_prompt?: string | null;
          capabilities?: string[];
          api_provider?: string | null;
          api_endpoint?: string | null;
          rate_limits?: Json;
          is_active?: boolean;
          total_requests?: number;
          total_tokens_used?: number;
          average_response_time?: number;
          cost_per_token?: number;
          total_cost?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          agent_id?: string;
          agent_name?: string;
          agent_type?: string;
          model_config?: Json;
          system_prompt?: string | null;
          capabilities?: string[];
          api_provider?: string | null;
          api_endpoint?: string | null;
          rate_limits?: Json;
          is_active?: boolean;
          total_requests?: number;
          total_tokens_used?: number;
          average_response_time?: number;
          cost_per_token?: number;
          total_cost?: number;
          created_at?: string;
          updated_at?: string;
        };
      };

      conversation_sessions: {
        Row: {
          id: string;
          user_id: string;
          agent_id: string | null;
          session_title: string | null;
          session_context: Json;
          applied_cues: string[];
          generated_cues: string[];
          message_count: number;
          total_tokens: number;
          session_cost: number;
          status: string;
          started_at: string;
          ended_at: string | null;
          last_activity: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          agent_id?: string | null;
          session_title?: string | null;
          session_context?: Json;
          applied_cues?: string[];
          generated_cues?: string[];
          message_count?: number;
          total_tokens?: number;
          session_cost?: number;
          status?: string;
          started_at?: string;
          ended_at?: string | null;
          last_activity?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          agent_id?: string | null;
          session_title?: string | null;
          session_context?: Json;
          applied_cues?: string[];
          generated_cues?: string[];
          message_count?: number;
          total_tokens?: number;
          session_cost?: number;
          status?: string;
          started_at?: string;
          ended_at?: string | null;
          last_activity?: string;
          created_at?: string;
        };
      };

      conversation_messages: {
        Row: {
          id: string;
          session_id: string;
          user_id: string;
          message_type: string;
          message_role: string;
          message_content: string;
          message_metadata: Json;
          extracted_cues: Json;
          cue_confidence: number;
          model_used: string | null;
          tokens_used: number;
          processing_time: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          user_id: string;
          message_type: string;
          message_role: string;
          message_content: string;
          message_metadata?: Json;
          extracted_cues?: Json;
          cue_confidence?: number;
          model_used?: string | null;
          tokens_used?: number;
          processing_time?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string;
          user_id?: string;
          message_type?: string;
          message_role?: string;
          message_content?: string;
          message_metadata?: Json;
          extracted_cues?: Json;
          cue_confidence?: number;
          model_used?: string | null;
          tokens_used?: number;
          processing_time?: number;
          created_at?: string;
          updated_at?: string;
        };
      };

      system_events: {
        Row: {
          id: string;
          event_type: string;
          event_category: string | null;
          event_name: string;
          event_description: string | null;
          user_id: string | null;
          session_id: string | null;
          event_data: Json;
          context_data: Json;
          ip_address: string | null;
          user_agent: string | null;
          request_id: string | null;
          severity: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          event_type: string;
          event_category?: string | null;
          event_name: string;
          event_description?: string | null;
          user_id?: string | null;
          session_id?: string | null;
          event_data?: Json;
          context_data?: Json;
          ip_address?: string | null;
          user_agent?: string | null;
          request_id?: string | null;
          severity?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          event_type?: string;
          event_category?: string | null;
          event_name?: string;
          event_description?: string | null;
          user_id?: string | null;
          session_id?: string | null;
          event_data?: Json;
          context_data?: Json;
          ip_address?: string | null;
          user_agent?: string | null;
          request_id?: string | null;
          severity?: string;
          created_at?: string;
        };
      };
    };
    Views: {
      user_summary: {
        Row: {
          id: string;
          username: string;
          display_name: string;
          email: string | null;
          did: string | null;
          auth_status: string;
          last_login: string | null;
          login_count: number;
          webauthn_credentials_count: number;
          personal_cues_count: number;
          created_at: string;
          updated_at: string;
        };
      };
      cue_statistics: {
        Row: {
          cue_type: string;
          cue_category: string | null;
          total_cues: number;
          avg_confidence: number;
          avg_effectiveness: number;
          users_with_cues: number;
        };
      };
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

// =============================================================================
// JSON 타입 정의
// =============================================================================

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// =============================================================================
// 헬퍼 타입들
// =============================================================================

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];

// =============================================================================
// 구체적인 테이블 타입들
// =============================================================================

export type User = Tables<'users'>;
export type UserInsert = TablesInsert<'users'>;
export type UserUpdate = TablesUpdate<'users'>;

export type WebAuthnCredential = Tables<'webauthn_credentials'>;
export type WebAuthnCredentialInsert = TablesInsert<'webauthn_credentials'>;
export type WebAuthnCredentialUpdate = TablesUpdate<'webauthn_credentials'>;

export type PersonalCueDB = Tables<'personal_cues'>;
export type PersonalCueInsert = TablesInsert<'personal_cues'>;
export type PersonalCueUpdate = TablesUpdate<'personal_cues'>;

export type AIAgent = Tables<'ai_agents'>;
export type AIAgentInsert = TablesInsert<'ai_agents'>;
export type AIAgentUpdate = TablesUpdate<'ai_agents'>;

export type ConversationSession = Tables<'conversation_sessions'>;
export type ConversationSessionInsert = TablesInsert<'conversation_sessions'>;
export type ConversationSessionUpdate = TablesUpdate<'conversation_sessions'>;

export type ConversationMessage = Tables<'conversation_messages'>;
export type ConversationMessageInsert = TablesInsert<'conversation_messages'>;
export type ConversationMessageUpdate = TablesUpdate<'conversation_messages'>;

export type SystemEvent = Tables<'system_events'>;
export type SystemEventInsert = TablesInsert<'system_events'>;
export type SystemEventUpdate = TablesUpdate<'system_events'>;

// =============================================================================
// 뷰 타입들
// =============================================================================

export type UserSummary = Database['public']['Views']['user_summary']['Row'];
export type CueStatisticsView = Database['public']['Views']['cue_statistics']['Row'];

// =============================================================================
// 데이터베이스 연결 관련 타입들
// =============================================================================

export interface DatabaseConnectionInfo {
  url: string;
  hasAnonKey: boolean;
  hasServiceKey: boolean;
  schema: string;
  environment: string;
}

export interface DatabaseConnectionResult {
  success: boolean;
  message: string;
  details?: {
    tablesChecked: number;
    accessibleTables: number;
    tableResults: Array<{
      table: string;
      accessible: boolean;
      error: string | null;
    }>;
    migrationNeeded: boolean;
    connectionInfo: DatabaseConnectionInfo;
  };
}

export interface DatabaseInitializationResult {
  success: boolean;
  message: string;
  details: {
    connection: DatabaseConnectionResult;
    agents: {
      success: boolean;
      message: string;
      agentsCreated?: number;
    };
    timestamp: string;
  };
}

// =============================================================================
// 데이터베이스 쿼리 헬퍼 타입들
// =============================================================================

export interface QueryOptions {
  limit?: number;
  offset?: number;
  orderBy?: string;
  ascending?: boolean;
  count?: boolean;
}

export interface FilterOptions<T = Record<string, unknown>> {
  eq?: Partial<T>;
  neq?: Partial<T>;
  gt?: Partial<T>;
  gte?: Partial<T>;
  lt?: Partial<T>;
  lte?: Partial<T>;
  like?: Partial<T>;
  ilike?: Partial<T>;
  in?: Partial<Record<keyof T, unknown[]>>;
  contains?: Partial<T>;
}

export interface DatabaseQueryResult<T = unknown> {
  success: boolean;
  data?: T;
  count?: number;
  error?: string;
}

// =============================================================================
// RPC 함수 타입들 (향후 확장용)
// =============================================================================

export interface RPCFunctions {
  find_similar_cues: {
    args: {
      p_user_id: string;
      p_content: string;
      p_cue_type: string;
      p_limit: number;
      p_similarity_threshold: number;
    };
    returns: PersonalCueDB[];
  };
  
  increment_usage_count: {
    args: {
      credential_id: string;
    };
    returns: number;
  };
  
  get_user_cue_analytics: {
    args: {
      p_user_id: string;
      p_days: number;
    };
    returns: {
      total_cues: number;
      avg_confidence: number;
      most_common_type: string;
      recent_activity: Json;
    };
  };
}

// =============================================================================
// 기본 내보내기
// =============================================================================

export default Database;