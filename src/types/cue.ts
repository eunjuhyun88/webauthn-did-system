// =============================================================================
// 🧠 완전한 Cue 시스템 타입 정의
// src/types/cue.ts
// =============================================================================

// =============================================================================
// 1. 기본 Cue 오브젝트 타입들
// =============================================================================

/**
 * 🎯 플랫폼별 원천 ID 정의
 */
export type CuePlatform = 
  | 'chatgpt' 
  | 'claude' 
  | 'gemini' 
  | 'discord' 
  | 'telegram' 
  | 'slack'
  | 'notion'
  | 'obsidian'
  | 'github'
  | 'email'
  | 'web'
  | 'mobile'
  | 'desktop'
  | 'voice'
  | 'universal';

/**
 * 🧩 개별 Cue 객체 - 원자적 맥락 단위
 */
export interface CueObject {
  readonly id: string;
  readonly type: CueType;
  readonly content: string;
  readonly platform: CuePlatform;
  readonly timestamp: Date;
  readonly confidence: number;
  readonly metadata: CueMetadata;
  readonly relationships?: CueRelationship[];
  readonly tags?: string[];
  readonly embedding?: number[];
  readonly hash: string;
}

/**
 * 🎨 Cue 유형 분류 시스템
 */
export type CueType = 
  | 'intent'        // 사용자 의도
  | 'context'       // 상황적 맥락
  | 'preference'    // 개인 선호도
  | 'knowledge'     // 지식/정보
  | 'task'          // 작업/할일
  | 'emotion'       // 감정 상태
  | 'pattern'       // 행동 패턴
  | 'reminder'      // 리마인더
  | 'relationship'  // 관계 정보
  | 'temporal'      // 시간 정보
  | 'location'      // 위치 정보
  | 'entity'        // 엔티티 정보
  | 'event'         // 이벤트
  | 'decision'      // 의사결정
  | 'learning'      // 학습 내용
  | 'routine'       // 루틴/습관
  | 'goal'          // 목표
  | 'constraint'    // 제약사항
  | 'resource'      // 리소스
  | 'feedback';     // 피드백

/**
 * 📋 Cue 메타데이터 - 추가 컨텍스트 정보
 */
export interface CueMetadata {
  readonly extractedAt: Date;
  readonly source: {
    readonly platform: CuePlatform;
    readonly location: string;
    readonly conversationId?: string;
    readonly userId?: string;
    readonly sessionId?: string;
  };
  readonly extraction: {
    readonly method: ExtractionMethod;
    readonly version: string;
    readonly confidence: number;
    readonly processingTime: number;
  };
  readonly semantic: SemanticMetadata;
  readonly quality: QualityMetrics;
  readonly privacy: PrivacyMetadata;
}

/**
 * 🔍 추출 방법 정의
 */
export type ExtractionMethod = 
  | 'pattern_matching'
  | 'nlp_analysis' 
  | 'llm_inference'
  | 'keyword_extraction'
  | 'sentiment_analysis'
  | 'entity_recognition'
  | 'intent_classification'
  | 'topic_modeling'
  | 'context_analysis'
  | 'user_feedback'
  | 'automatic_learning'
  | 'hybrid_approach';

/**
 * 🧠 의미론적 메타데이터
 */
export interface SemanticMetadata {
  readonly entities: EntityMention[];
  readonly topics: TopicScore[];
  readonly sentiment: SentimentAnalysis;
  readonly intent: IntentClassification;
  readonly complexity: number;
  readonly abstractness: number;
  readonly temporality: TemporalInfo;
  readonly relationships: SemanticRelationship[];
}

/**
 * 🏷️ 엔티티 언급 정보
 */
export interface EntityMention {
  readonly entity: string;
  readonly type: EntityType;
  readonly confidence: number;
  readonly positions: TextPosition[];
  readonly aliases: string[];
  readonly metadata?: Record<string, unknown>;
}

/**
 * 🎭 엔티티 타입 분류
 */
export type EntityType = 
  | 'person'
  | 'organization'
  | 'location'
  | 'event'
  | 'product'
  | 'concept'
  | 'skill'
  | 'tool'
  | 'document'
  | 'project'
  | 'task'
  | 'deadline'
  | 'currency'
  | 'measurement'
  | 'technology'
  | 'methodology'
  | 'custom';

/**
 * 📍 텍스트 위치 정보
 */
export interface TextPosition {
  readonly start: number;
  readonly end: number;
  readonly text: string;
}

/**
 * 📈 토픽 점수 정보
 */
export interface TopicScore {
  readonly topic: string;
  readonly score: number;
  readonly keywords: string[];
}

/**
 * 😊 감정 분석 결과
 */
export interface SentimentAnalysis {
  readonly overall: number; // -1 to 1
  readonly emotions: EmotionScore[];
  readonly confidence: number;
}

/**
 * 🎭 감정 점수
 */
export interface EmotionScore {
  readonly emotion: EmotionType;
  readonly intensity: number; // 0 to 1
}

/**
 * 💭 감정 타입
 */
export type EmotionType = 
  | 'joy'
  | 'sadness'
  | 'anger'
  | 'fear'
  | 'surprise'
  | 'disgust'
  | 'trust'
  | 'anticipation'
  | 'neutral'
  | 'excitement'
  | 'frustration'
  | 'satisfaction'
  | 'curiosity'
  | 'confusion'
  | 'confidence';

/**
 * 🎯 의도 분류 결과
 */
export interface IntentClassification {
  readonly primaryIntent: IntentType;
  readonly secondaryIntents: IntentScore[];
  readonly confidence: number;
  readonly context: string[];
}

/**
 * 🚀 의도 타입
 */
export type IntentType = 
  | 'question'
  | 'request'
  | 'command'
  | 'information'
  | 'planning'
  | 'problem_solving'
  | 'creative'
  | 'learning'
  | 'decision_making'
  | 'collaboration'
  | 'reminder'
  | 'reflection'
  | 'analysis'
  | 'synthesis'
  | 'evaluation'
  | 'exploration'
  | 'confirmation'
  | 'clarification'
  | 'feedback'
  | 'other';

/**
 * 🎯 의도 점수
 */
export interface IntentScore {
  readonly intent: IntentType;
  readonly score: number;
}

/**
 * ⏰ 시간 정보
 */
export interface TemporalInfo {
  readonly timeframe: TimeFrame;
  readonly urgency: UrgencyLevel;
  readonly deadlines: Date[];
  readonly recurring: RecurringPattern | null;
}

/**
 * 📅 시간 프레임
 */
export type TimeFrame = 
  | 'immediate'
  | 'today'
  | 'this_week'
  | 'this_month'
  | 'this_quarter'
  | 'this_year'
  | 'long_term'
  | 'ongoing'
  | 'historical'
  | 'future'
  | 'indefinite';

/**
 * 🚨 긴급도 수준
 */
export type UrgencyLevel = 
  | 'critical'
  | 'high'
  | 'medium'
  | 'low'
  | 'none';

/**
 * 🔄 반복 패턴
 */
export interface RecurringPattern {
  readonly type: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';
  readonly interval: number;
  readonly endDate?: Date;
  readonly exceptions: Date[];
}

/**
 * 🔗 의미론적 관계
 */
export interface SemanticRelationship {
  readonly type: RelationshipType;
  readonly target: string;
  readonly strength: number;
  readonly bidirectional: boolean;
}

/**
 * 🌐 관계 타입
 */
export type RelationshipType = 
  | 'prerequisite'
  | 'dependency'
  | 'similar'
  | 'opposite'
  | 'part_of'
  | 'example_of'
  | 'caused_by'
  | 'leads_to'
  | 'related_to'
  | 'builds_on'
  | 'conflicts_with'
  | 'complements'
  | 'replaces'
  | 'references'
  | 'derived_from';

/**
 * 📊 품질 메트릭
 */
export interface QualityMetrics {
  readonly completeness: number; // 0 to 1
  readonly clarity: number;      // 0 to 1
  readonly relevance: number;    // 0 to 1
  readonly specificity: number;  // 0 to 1
  readonly actionability: number; // 0 to 1
  readonly novelty: number;      // 0 to 1
  readonly consistency: number;  // 0 to 1
}

/**
 * 🔒 프라이버시 메타데이터
 */
export interface PrivacyMetadata {
  readonly sensitivityLevel: SensitivityLevel;
  readonly containsPII: boolean;
  readonly sharingPermissions: SharingPermission[];
  readonly retention: RetentionPolicy;
  readonly encryption: EncryptionInfo;
}

/**
 * 🛡️ 민감도 수준
 */
export type SensitivityLevel = 
  | 'public'
  | 'internal'
  | 'confidential'
  | 'restricted'
  | 'secret';

/**
 * 🤝 공유 권한
 */
export interface SharingPermission {
  readonly target: 'ai_models' | 'analytics' | 'third_party' | 'specific_user';
  readonly allowed: boolean;
  readonly restrictions: string[];
}

/**
 * 📋 보존 정책
 */
export interface RetentionPolicy {
  readonly duration: number; // days
  readonly autoDelete: boolean;
  readonly archiveAfter: number; // days
}

/**
 * 🔐 암호화 정보
 */
export interface EncryptionInfo {
  readonly encrypted: boolean;
  readonly algorithm?: string;
  readonly keyId?: string;
}

// =============================================================================
// 2. Cue 관계 및 연결성
// =============================================================================

/**
 * 🔗 Cue 간 관계
 */
export interface CueRelationship {
  readonly id: string;
  readonly type: CueRelationshipType;
  readonly sourceId: string;
  readonly targetId: string;
  readonly strength: number;     // 0 to 1
  readonly confidence: number;   // 0 to 1
  readonly bidirectional: boolean;
  readonly metadata: RelationshipMetadata;
  readonly createdAt: Date;
  readonly lastValidated: Date;
}

/**
 * 🌐 Cue 관계 타입
 */
export type CueRelationshipType = 
  | 'sequence'      // 순서 관계
  | 'hierarchy'     // 계층 관계
  | 'association'   // 연관 관계
  | 'causation'     // 인과 관계
  | 'correlation'   // 상관 관계
  | 'contradiction' // 모순 관계
  | 'refinement'    // 구체화 관계
  | 'generalization' // 일반화 관계
  | 'alternative'   // 대안 관계
  | 'component'     // 구성 요소 관계
  | 'temporal'      // 시간 관계
  | 'spatial'       // 공간 관계
  | 'logical'       // 논리 관계
  | 'functional'    // 기능 관계
  | 'conceptual';   // 개념 관계

/**
 * 📊 관계 메타데이터
 */
export interface RelationshipMetadata {
  readonly discoveryMethod: string;
  readonly validation: ValidationInfo;
  readonly context: string[];
  readonly examples: string[];
  readonly notes?: string;
}

/**
 * ✅ 검증 정보
 */
export interface ValidationInfo {
  readonly validated: boolean;
  readonly validator: 'system' | 'user' | 'ai';
  readonly validatedAt?: Date;
  readonly confidence: number;
}

// =============================================================================
// 3. Cue 추출 결과 및 처리
// =============================================================================

/**
 * 🎯 Cue 추출 결과
 */
export interface CueExtractionResult {
  readonly success: boolean;
  readonly cues: CueObject[];
  readonly metadata: ExtractionMetadata;
  readonly errors?: ExtractionError[];
  readonly warnings?: string[];
  readonly statistics: ExtractionStatistics;
  readonly recommendations?: string[];
}

/**
 * 📊 추출 메타데이터
 */
export interface ExtractionMetadata {
  readonly extractorVersion: string;
  readonly extractedAt: Date;
  readonly processingTime: number;
  readonly inputCharacterCount: number;
  readonly totalCuesExtracted: number;
  readonly averageConfidence: number;
  readonly methodsUsed: ExtractionMethod[];
  readonly modelVersions: Record<string, string>;
}

/**
 * ❌ 추출 오류
 */
export interface ExtractionError {
  readonly code: string;
  readonly message: string;
  readonly severity: 'warning' | 'error' | 'critical';
  readonly context?: string;
  readonly suggestion?: string;
}

/**
 * 📈 추출 통계
 */
export interface ExtractionStatistics {
  readonly cuesByType: Record<CueType, number>;
  readonly cuesByPlatform: Record<CuePlatform, number>;
  readonly confidenceDistribution: ConfidenceDistribution;
  readonly processingBreakdown: ProcessingBreakdown;
  readonly qualityMetrics: QualityMetrics;
}

/**
 * 📊 신뢰도 분포
 */
export interface ConfidenceDistribution {
  readonly high: number;    // > 0.8
  readonly medium: number;  // 0.5 - 0.8
  readonly low: number;     // < 0.5
  readonly average: number;
}

/**
 * ⚙️ 처리 세부사항
 */
export interface ProcessingBreakdown {
  readonly preprocessing: number; // ms
  readonly extraction: number;    // ms
  readonly analysis: number;      // ms
  readonly postprocessing: number; // ms
  readonly total: number;         // ms
}

// =============================================================================
// 4. Cue 적용 및 활용
// =============================================================================

/**
 * 🎯 Cue 적용 요청
 */
export interface CueApplicationRequest {
  readonly targetPlatform: CuePlatform;
  readonly context: ApplicationContext;
  readonly preferences: ApplicationPreferences;
  readonly constraints: ApplicationConstraint[];
  readonly goals: ApplicationGoal[];
}

/**
 * 🌍 적용 컨텍스트
 */
export interface ApplicationContext {
  readonly currentConversation?: ConversationContext;
  readonly userState: UserState;
  readonly platformState: PlatformState;
  readonly temporalContext: TemporalContext;
  readonly taskContext?: TaskContext;
}

/**
 * 💬 대화 컨텍스트
 */
export interface ConversationContext {
  readonly conversationId: string;
  readonly platform: CuePlatform;
  readonly participants: string[];
  readonly topic?: string;
  readonly messages: ConversationMessage[];
  readonly startedAt: Date;
  readonly lastActivity: Date;
}

/**
 * 💭 대화 메시지
 */
export interface ConversationMessage {
  readonly id: string;
  readonly content: string;
  readonly sender: string;
  readonly timestamp: Date;
  readonly type: 'text' | 'image' | 'file' | 'system';
  readonly metadata?: Record<string, any>;
}

/**
 * 👤 사용자 상태
 */
export interface UserState {
  readonly mood?: EmotionScore[];
  readonly availability: AvailabilityStatus;
  readonly currentFocus?: string[];
  readonly recentActivity: ActivitySummary;
  readonly preferences: UserPreferences;
  readonly capabilities: UserCapabilities;
}

/**
 * 📅 가용성 상태
 */
export type AvailabilityStatus = 
  | 'available'
  | 'busy'
  | 'away'
  | 'do_not_disturb'
  | 'offline'
  | 'unknown';

/**
 * 📊 활동 요약
 */
export interface ActivitySummary {
  readonly lastSeen: Date;
  readonly recentPlatforms: CuePlatform[];
  readonly recentTopics: string[];
  readonly interactionCount: number;
}

/**
 * ⚙️ 사용자 선호도
 */
export interface UserPreferences {
  readonly communicationStyle: CommunicationStyle;
  readonly responseFormat: ResponseFormat;
  readonly privacyLevel: PrivacyLevel;
  readonly automationLevel: AutomationLevel;
  readonly languages: string[];
  readonly timeZone: string;
}

/**
 * 💬 커뮤니케이션 스타일
 */
export type CommunicationStyle = 
  | 'formal'
  | 'casual'
  | 'technical'
  | 'friendly'
  | 'concise'
  | 'detailed'
  | 'adaptive';

/**
 * 📋 응답 형식
 */
export type ResponseFormat = 
  | 'text'
  | 'bullet_points'
  | 'structured'
  | 'conversational'
  | 'code'
  | 'visual'
  | 'mixed';

/**
 * 🔒 프라이버시 수준
 */
export type PrivacyLevel = 
  | 'minimal'
  | 'balanced'
  | 'strict'
  | 'paranoid';

/**
 * 🤖 자동화 수준
 */
export type AutomationLevel = 
  | 'manual'
  | 'semi_automatic'
  | 'automatic'
  | 'intelligent';

/**
 * 🎯 사용자 역량
 */
export interface UserCapabilities {
  readonly technicalSkills: SkillLevel[];
  readonly domains: DomainExpertise[];
  readonly tools: ToolProficiency[];
  readonly languages: LanguageProficiency[];
}

/**
 * 🛠️ 기술 수준
 */
export interface SkillLevel {
  readonly skill: string;
  readonly level: ProficiencyLevel;
  readonly lastAssessed: Date;
}

/**
 * 📚 도메인 전문성
 */
export interface DomainExpertise {
  readonly domain: string;
  readonly level: ProficiencyLevel;
  readonly certifications?: string[];
  readonly experience?: number; // years
}

/**
 * 🔧 도구 숙련도
 */
export interface ToolProficiency {
  readonly tool: string;
  readonly level: ProficiencyLevel;
  readonly version?: string;
  readonly features: string[];
}

/**
 * 🌐 언어 숙련도
 */
export interface LanguageProficiency {
  readonly language: string;
  readonly level: LanguageLevel;
  readonly native: boolean;
}

/**
 * 📊 숙련도 수준
 */
export type ProficiencyLevel = 
  | 'beginner'
  | 'intermediate'
  | 'advanced'
  | 'expert'
  | 'master';

/**
 * 🗣️ 언어 수준
 */
export type LanguageLevel = 
  | 'basic'
  | 'conversational'
  | 'professional'
  | 'native'
  | 'academic';

/**
 * 🖥️ 플랫폼 상태
 */
export interface PlatformState {
  readonly platform: CuePlatform;
  readonly version: string;
  readonly capabilities: PlatformCapability[];
  readonly limitations: PlatformLimitation[];
  readonly currentSession: SessionInfo;
}

/**
 * ⚡ 플랫폼 기능
 */
export interface PlatformCapability {
  readonly type: CapabilityType;
  readonly available: boolean;
  readonly version?: string;
  readonly limitations?: string[];
}

/**
 * 🔧 기능 타입
 */
export type CapabilityType = 
  | 'text_input'
  | 'voice_input'
  | 'image_input'
  | 'file_upload'
  | 'code_execution'
  | 'web_search'
  | 'memory'
  | 'persistence'
  | 'custom_instructions'
  | 'plugins'
  | 'api_access';

/**
 * ⚠️ 플랫폼 제한사항
 */
export interface PlatformLimitation {
  readonly type: LimitationType;
  readonly description: string;
  readonly severity: 'minor' | 'moderate' | 'severe';
  readonly workaround?: string;
}

/**
 * 🚫 제한사항 타입
 */
export type LimitationType = 
  | 'token_limit'
  | 'rate_limit'
  | 'feature_unavailable'
  | 'format_restriction'
  | 'content_policy'
  | 'technical_limitation'
  | 'temporary_issue';

/**
 * 📱 세션 정보
 */
export interface SessionInfo {
  readonly sessionId: string;
  readonly startedAt: Date;
  readonly lastActivity: Date;
  readonly messageCount: number;
  readonly tokensUsed: number;
  readonly features: string[];
}

/**
 * ⏰ 시간적 컨텍스트
 */
export interface TemporalContext {
  readonly currentTime: Date;
  readonly timeZone: string;
  readonly dayOfWeek: string;
  readonly timeOfDay: TimeOfDay;
  readonly businessHours: boolean;
  readonly deadlines: Deadline[];
  readonly schedule: ScheduleItem[];
}

/**
 * 🕐 하루 중 시간
 */
export type TimeOfDay = 
  | 'early_morning'  // 5-8
  | 'morning'        // 8-12
  | 'afternoon'      // 12-17
  | 'evening'        // 17-21
  | 'night'          // 21-24
  | 'late_night';    // 0-5

/**
 * ⏰ 마감일 정보
 */
export interface Deadline {
  readonly id: string;
  readonly title: string;
  readonly date: Date;
  readonly priority: UrgencyLevel;
  readonly type: 'hard' | 'soft' | 'flexible';
  readonly status: 'upcoming' | 'overdue' | 'completed';
}

/**
 * 📅 일정 항목
 */
export interface ScheduleItem {
  readonly id: string;
  readonly title: string;
  readonly startTime: Date;
  readonly endTime: Date;
  readonly type: 'meeting' | 'task' | 'event' | 'reminder';
  readonly attendees?: string[];
  readonly location?: string;
}

/**
 * 🎯 작업 컨텍스트
 */
export interface TaskContext {
  readonly currentTask?: CurrentTask;
  readonly taskQueue: QueuedTask[];
  readonly completedToday: CompletedTask[];
  readonly workingMemory: WorkingMemoryItem[];
}

/**
 * 📋 현재 작업
 */
export interface CurrentTask {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly startedAt: Date;
  readonly estimatedDuration: number; // minutes
  readonly progress: number; // 0-100
  readonly blockers: string[];
  readonly resources: string[];
}

/**
 * 📝 대기 중인 작업
 */
export interface QueuedTask {
  readonly id: string;
  readonly title: string;
  readonly priority: UrgencyLevel;
  readonly dependencies: string[];
  readonly estimatedDuration: number;
}

/**
 * ✅ 완료된 작업
 */
export interface CompletedTask {
  readonly id: string;
  readonly title: string;
  readonly completedAt: Date;
  readonly actualDuration: number;
  readonly outcome: 'success' | 'partial' | 'failed';
}

/**
 * 🧠 작업 메모리 항목
 */
export interface WorkingMemoryItem {
  readonly id: string;
  readonly content: string;
  readonly type: 'note' | 'reminder' | 'idea' | 'question' | 'decision';
  readonly createdAt: Date;
  readonly relevance: number;
}

/**
 * ⚙️ 적용 선호도
 */
export interface ApplicationPreferences {
  readonly adaptationLevel: AdaptationLevel;
  readonly responseStyle: ResponseStyle;
  readonly cueSelection: CueSelectionStrategy;
  readonly feedbackMechanism: FeedbackMechanism;
  readonly learningEnabled: boolean;
  readonly contextualHints: boolean;
}

/**
 * 🎛️ 적응 수준
 */
export type AdaptationLevel = 
  | 'minimal'     // Only apply most relevant cues
  | 'moderate'    // Apply contextually appropriate cues
  | 'aggressive'  // Apply all relevant cues
  | 'intelligent' // AI-driven adaptive cue application
  | 'custom';     // User-defined rules

/**
 * 💬 응답 스타일
 */
export interface ResponseStyle {
  readonly tone: ToneType;
  readonly verbosity: VerbosityLevel;
  readonly format: ResponseFormat;
  readonly personalization: PersonalizationLevel;
}

/**
 * 🎭 톤 타입
 */
export type ToneType = 
  | 'professional'
  | 'casual'
  | 'friendly'
  | 'authoritative'
  | 'empathetic'
  | 'analytical'
  | 'creative'
  | 'supportive'
  | 'challenging'
  | 'adaptive';

/**
 * 📏 상세도 수준
 */
export type VerbosityLevel = 
  | 'concise'
  | 'normal'
  | 'detailed'
  | 'comprehensive'
  | 'adaptive';

/**
 * 🎯 개인화 수준
 */
export type PersonalizationLevel = 
  | 'none'
  | 'basic'
  | 'moderate'
  | 'high'
  | 'maximum';

/**
 * 🎯 Cue 선택 전략
 */
export interface CueSelectionStrategy {
  readonly strategy: SelectionStrategyType;
  readonly maxCues: number;
  readonly confidenceThreshold: number;
  readonly recencyWeight: number;
  readonly relevanceWeight: number;
  readonly diversityWeight: number;
  readonly filters: CueFilter[];
}

/**
 * 📊 선택 전략 타입
 */
export type SelectionStrategyType = 
  | 'top_confidence'    // Highest confidence cues
  | 'most_recent'       // Most recently extracted cues
  | 'most_relevant'     // Most contextually relevant
  | 'balanced'          // Balanced selection
  | 'diverse'           // Maximum diversity
  | 'weighted_score'    // Custom weighted scoring
  | 'ai_optimized';     // AI-driven optimization

/**
 * 🔍 Cue 필터
 */
export interface CueFilter {
  readonly type: FilterType;
  readonly criteria: FilterCriteria;
  readonly operator: FilterOperator;
  readonly value: unknown;
}

/**
 * 🏷️ 필터 타입
 */
export type FilterType = 
  | 'cue_type'
  | 'platform'
  | 'confidence'
  | 'recency'
  | 'tag'
  | 'entity'
  | 'sentiment'
  | 'quality'
  | 'privacy'
  | 'custom';

/**
 * 📋 필터 기준
 */
export type FilterCriteria = 
  | 'equals'
  | 'not_equals'
  | 'contains'
  | 'not_contains'
  | 'greater_than'
  | 'less_than'
  | 'in_range'
  | 'matches_pattern'
  | 'has_property'
  | 'custom_function';

/**
 * ⚙️ 필터 연산자
 */
export type FilterOperator = 
  | 'and'
  | 'or'
  | 'not'
  | 'xor';

/**
 * 📝 피드백 메커니즘
 */
export interface FeedbackMechanism {
  readonly enabled: boolean;
  readonly explicit: boolean;     // Direct user feedback
  readonly implicit: boolean;     // Behavioral feedback
  readonly frequency: FeedbackFrequency;
  readonly methods: FeedbackMethod[];
}

/**
 * 📊 피드백 빈도
 */
export type FeedbackFrequency = 
  | 'immediate'   // After each application
  | 'periodic'    // At regular intervals
  | 'adaptive'    // Based on context
  | 'on_request'  // Only when requested
  | 'never';

/**
 * 🔄 피드백 방법
 */
export type FeedbackMethod = 
  | 'rating'      // Numerical rating
  | 'thumbs'      // Thumbs up/down
  | 'selection'   // Select best options
  | 'text'        // Free text feedback
  | 'implicit'    // Usage patterns
  | 'correction'  // Direct corrections
  | 'suggestion'; // User suggestions

/**
 * 🚫 적용 제약사항
 */
export interface ApplicationConstraint {
  readonly type: ConstraintType;
  readonly description: string;
  readonly severity: 'soft' | 'hard';
  readonly condition: ConstraintCondition;
  readonly action: ConstraintAction;
}

/**
 * ⚠️ 제약사항 타입
 */
export type ConstraintType = 
  | 'privacy'       // Privacy restrictions
  | 'content'       // Content restrictions
  | 'timing'        // Time-based restrictions
  | 'platform'      // Platform limitations
  | 'context'       // Context-specific restrictions
  | 'user_defined'  // User-defined constraints
  | 'policy'        // Policy-based restrictions
  | 'technical';    // Technical limitations

/**
 * 📋 제약 조건
 */
export interface ConstraintCondition {
  readonly field: string;
  readonly operator: FilterOperator;
  readonly value: any;
  readonly context?: string[];
}

/**
 * 🎯 제약 액션
 */
export type ConstraintAction = 
  | 'exclude'     // Exclude matching cues
  | 'modify'      // Modify cue content
  | 'warn'        // Show warning
  | 'ask'         // Ask for permission
  | 'defer'       // Defer to later
  | 'alternative' // Suggest alternatives
  | 'block';      // Block completely

/**
 * 🎯 적용 목표
 */
export interface ApplicationGoal {
  readonly type: GoalType;
  readonly priority: number; // 1-10
  readonly metrics: GoalMetric[];
  readonly constraints: string[];
  readonly deadline?: Date;
}

/**
 * 🎯 목표 타입
 */
export type GoalType = 
  | 'efficiency'      // Improve efficiency
  | 'accuracy'        // Improve accuracy
  | 'personalization' // Better personalization
  | 'user_satisfaction' // User satisfaction
  | 'learning'        // Learning objectives
  | 'productivity'    // Productivity goals
  | 'creativity'      // Creative enhancement
  | 'collaboration'   // Better collaboration
  | 'decision_making' // Decision support
  | 'problem_solving' // Problem-solving aid
  | 'custom';         // Custom objectives

/**
 * 📊 목표 메트릭
 */
export interface GoalMetric {
  readonly name: string;
  readonly target: number;
  readonly current?: number;
  readonly unit: string;
  readonly measurement: MeasurementMethod;
}

/**
 * 📏 측정 방법
 */
export type MeasurementMethod = 
  | 'automatic'   // Automatically measured
  | 'user_input'  // User provides input
  | 'ai_analysis' // AI-based analysis
  | 'external'    // External system
  | 'manual';     // Manual calculation

// =============================================================================
// 5. Cue 적용 결과
// =============================================================================

/**
 * 🎯 Cue 적용 결과
 */
export interface CueApplicationResult {
  readonly success: boolean;
  readonly appliedCues: AppliedCue[];
  readonly output: ApplicationOutput;
  readonly metadata: ApplicationMetadata;
  readonly feedback?: ApplicationFeedback;
  readonly errors?: ApplicationError[];
  readonly recommendations?: string[];
}

/**
 * ✅ 적용된 Cue
 */
export interface AppliedCue {
  readonly cueId: string;
  readonly cue: CueObject;
  readonly application: CueApplication;
  readonly impact: ApplicationImpact;
  readonly feedback?: CueFeedback;
}

/**
 * 🎯 Cue 적용 방식
 */
export interface CueApplication {
  readonly method: ApplicationMethod;
  readonly timing: ApplicationTiming;
  readonly location: ApplicationLocation;
  readonly transformation: ContentTransformation;
  readonly context: ApplicationContext;
}

/**
 * ⚙️ 적용 방법
 */
export type ApplicationMethod = 
  | 'direct_injection'    // Direct content injection
  | 'contextual_hint'     // Contextual hints
  | 'response_adaptation' // Response style adaptation
  | 'proactive_suggestion' // Proactive suggestions
  | 'background_influence' // Background influence
  | 'metadata_enhancement' // Metadata enhancement
  | 'workflow_optimization' // Workflow optimization
  | 'personalization'     // Personalization
  | 'automation'          // Automated actions
  | 'custom';             // Custom method

/**
 * ⏰ 적용 타이밍
 */
export interface ApplicationTiming {
  readonly phase: ApplicationPhase;
  readonly delay?: number; // milliseconds
  readonly duration?: number; // milliseconds
  readonly trigger: TriggerEvent;
}

/**
 * 📊 적용 단계
 */
export type ApplicationPhase = 
  | 'pre_processing'   // Before main processing
  | 'processing'       // During main processing
  | 'post_processing'  // After main processing
  | 'response_generation' // During response generation
  | 'response_delivery' // During response delivery