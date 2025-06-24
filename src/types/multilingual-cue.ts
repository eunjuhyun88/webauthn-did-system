// =============================================================================
// 🌍 다국어 Cue 시스템 타입 정의
// src/types/multilingual-cue.ts
// 100개 언어 지원을 위한 확장된 타입 시스템
// =============================================================================

// =============================================================================
// 🎯 기본 다국어 타입들
// =============================================================================

export type SupportedLanguage = 
  | 'korean' | 'english' | 'japanese' | 'chinese' | 'spanish' | 'french' 
  | 'german' | 'italian' | 'portuguese' | 'russian' | 'arabic' | 'hindi'
  | 'thai' | 'vietnamese' | 'indonesian' | 'malay' | 'tagalog' | 'swedish'
  | 'norwegian' | 'danish' | 'dutch' | 'polish' | 'czech' | 'hungarian'
  | 'romanian' | 'bulgarian' | 'serbian' | 'croatian' | 'slovak' | 'slovene'
  | 'lithuanian' | 'latvian' | 'estonian' | 'finnish' | 'icelandic' | 'irish'
  | 'welsh' | 'catalan' | 'basque' | 'galician' | 'maltese' | 'hebrew'
  | 'persian' | 'urdu' | 'bengali' | 'punjabi' | 'gujarati' | 'marathi'
  | 'telugu' | 'kannada' | 'malayalam' | 'tamil' | 'sinhalese' | 'burmese'
  | 'khmer' | 'lao' | 'mongolian' | 'tibetan' | 'korean_formal' | 'chinese_traditional'
  | 'japanese_formal' | 'arabic_formal' | 'unknown';

export type ScriptType = 
  | 'latin' | 'cyrillic' | 'arabic' | 'han' | 'hangul' | 'hiragana_katakana'
  | 'devanagari' | 'thai' | 'khmer' | 'myanmar' | 'ethiopic' | 'hebrew'
  | 'unknown';

export type CommunicationStyle = 
  | 'direct' | 'indirect' | 'hierarchical' | 'egalitarian' | 'contextual' | 'explicit';

export type FormalityLevel = 
  | 'intimate' | 'casual' | 'neutral' | 'polite' | 'formal' | 'honorific';

export type QuestioningStyle = 
  | 'open' | 'reserved' | 'detailed' | 'exploratory' | 'focused' | 'comprehensive';

export type FeedbackPreference = 
  | 'explicit' | 'implicit' | 'contextual' | 'visual' | 'structured' | 'narrative';

export type TimeOrientation = 
  | 'linear' | 'flexible' | 'cyclical' | 'event_based' | 'relationship_first';

// =============================================================================
// 🏛️ 문화적 컨텍스트 인터페이스들
// =============================================================================

export interface CulturalContext {
  region: string;
  communicationStyle: CommunicationStyle;
  formalityDefault: FormalityLevel;
  questioningStyle: QuestioningStyle;
  feedbackPreference: FeedbackPreference;
  timeOrientation: TimeOrientation;
  collectivismScore: number; // 0 (개인주의) ~ 1 (집단주의)
  powerDistanceScore: number; // 0 (평등) ~ 1 (위계적)
  uncertaintyAvoidanceScore: number; // 0 (불확실성 수용) ~ 1 (불확실성 회피)
  contextDependency: number; // 0 (저맥락) ~ 1 (고맥락)
}

export interface LanguageMetadata {
  iso639_1: string; // 2자리 코드 (ko, en, ja)
  iso639_2: string; // 3자리 코드 (kor, eng, jpn)
  nativeName: string; // 원어명
  englishName: string; // 영어명
  rtl: boolean; // 우측-좌측 읽기 여부
  script: ScriptType;
  region: string[];
  speakers: number; // 사용자 수 (백만 단위)
  difficulty: 'easy' | 'medium' | 'hard' | 'very_hard';
}

export interface DetectedLanguage {
  language: SupportedLanguage;
  confidence: number; // 0-1
  script: ScriptType;
  region?: string;
  dialect?: string;
  formalityDetected?: FormalityLevel;
}

// =============================================================================
// 🧩 패턴 및 규칙 인터페이스들
// =============================================================================

export interface LanguagePattern {
  language: SupportedLanguage;
  metadata: LanguageMetadata;
  patterns: Map<PatternCategory, RegExp[]>;
  culturalContext: CulturalContext;
  formalityMarkers: FormalityMarker[];
  idioms: LanguageIdiom[];
  stopWords: string[];
  technicalTerms: TechnicalTermDictionary;
}

export type PatternCategory = 
  | 'brief' | 'detailed' | 'examples' | 'learning' | 'problem_solving'
  | 'creativity' | 'analysis' | 'planning' | 'research' | 'collaboration'
  | 'urgent' | 'casual' | 'professional' | 'academic' | 'technical'
  | 'emotional_positive' | 'emotional_negative' | 'emotional_neutral'
  | 'time_sensitive' | 'follow_up' | 'clarification' | 'appreciation';

export interface FormalityMarker {
  level: FormalityLevel;
  markers: string[];
  responseStyle: ResponseStyleHint;
  culturalWeight: number; // 문화권에서의 중요도
}

export interface ResponseStyleHint {
  tone: 'respectful' | 'courteous' | 'friendly' | 'casual' | 'professional' | 'academic';
  length: 'brief' | 'moderate' | 'detailed' | 'comprehensive';
  structure: 'linear' | 'hierarchical' | 'narrative' | 'bullet_points';
  examples: 'minimal' | 'some' | 'many' | 'comprehensive';
}

export interface LanguageIdiom {
  phrase: string;
  meaning: string;
  context: string;
  formality: FormalityLevel;
  frequency: 'rare' | 'uncommon' | 'common' | 'very_common';
}

export interface TechnicalTermDictionary {
  domains: Record<TechnicalDomain, string[]>;
  localizations: Record<string, string>; // 영어 -> 현지어 매핑
  difficulty: Record<string, 'beginner' | 'intermediate' | 'advanced' | 'expert'>;
}

export type TechnicalDomain = 
  | 'web_development' | 'mobile_development' | 'data_science' | 'machine_learning'
  | 'devops' | 'cybersecurity' | 'blockchain' | 'iot' | 'cloud_computing'
  | 'artificial_intelligence' | 'robotics' | 'game_development' | 'ui_ux_design'
  | 'database' | 'networking' | 'system_administration' | 'quality_assurance'
  | 'project_management' | 'business_analysis' | 'digital_marketing';

// =============================================================================
// 🎯 확장된 Cue 타입들
// =============================================================================

export interface MultilingualPersonalCue extends Omit<PersonalCue, 'metadata'> {
  language: SupportedLanguage;
  culturalContext?: CulturalContext;
  translatedValues?: Record<SupportedLanguage, string>;
  crossCulturalAdaptations?: CrossCulturalAdaptation[];
  metadata: MultilingualCueMetadata;
}

export interface CrossCulturalAdaptation {
  targetCulture: string;
  adaptedValue: string;
  adaptationReason: string;
  confidence: number;
}

export interface MultilingualCueMetadata {
  platform: string;
  language: SupportedLanguage;
  originalLanguage: SupportedLanguage;
  detectionConfidence: number;
  culturalContext: CulturalContext;
  formalityLevel: FormalityLevel;
  regionalVariant?: string;
  dialectMarkers?: string[];
  translationQuality?: number;
  extractedAt: string;
  conversationId?: string;
  userTimezone?: string;
  deviceLanguage?: string;
}

// =============================================================================
// 📊 분석 및 통계 타입들
// =============================================================================

export interface LanguageUsageStatistics {
  primaryLanguage: SupportedLanguage;
  languageDistribution: Record<SupportedLanguage, number>; // 사용 비율
  codeswittchingFrequency: number; // 언어 전환 빈도
  formalityTrends: Record<FormalityLevel, number>;
  culturalAdaptationScore: number;
  communicationEffectiveness: number;
}

export interface MultilingualExtractionResult extends Omit<ExtractionResult, 'newCues'> {
  newCues: MultilingualPersonalCue[];
  languageDistribution: Record<SupportedLanguage, number>;
  culturalInsights: CulturalInsight[];
  translationSuggestions: TranslationSuggestion[];
  adaptationRecommendations: AdaptationRecommendation[];
}

export interface CulturalInsight {
  type: 'communication_style' | 'formality_preference' | 'questioning_pattern' | 'feedback_style';
  description: string;
  confidence: number;
  culturalFactors: string[];
  recommendations: string[];
}

export interface TranslationSuggestion {
  originalText: string;
  suggestedTranslation: string;
  targetLanguage: SupportedLanguage;
  reason: string;
  confidence: number;
}

export interface AdaptationRecommendation {
  context: string;
  recommendation: string;
  culturalReason: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  examples: string[];
}

// =============================================================================
// 🔧 설정 및 구성 타입들
// =============================================================================

export interface MultilingualConfig {
  supportedLanguages: SupportedLanguage[];
  defaultLanguage: SupportedLanguage;
  fallbackLanguage: SupportedLanguage;
  autoDetectLanguage: boolean;
  enableCulturalAdaptation: boolean;
  enableCodeSwitchingDetection: boolean;
  confidenceThreshold: number;
  maxLanguagesPerUser: number;
  translationCacheSize: number;
  culturalAdaptationLevel: 'basic' | 'moderate' | 'advanced' | 'expert';
}

export interface LanguageDetectionConfig {
  method: 'rule_based' | 'ml_based' | 'hybrid';
  confidenceThreshold: number;
  contextWindow: number;
  enableDialectDetection: boolean;
  enableFormalityDetection: boolean;
  fallbackBehavior: 'default_language' | 'best_guess' | 'ask_user';
}

export interface CulturalAdaptationConfig {
  enableAdaptation: boolean;
  adaptationDepth: 'surface' | 'moderate' | 'deep' | 'native_level';
  preserveOriginalMeaning: boolean;
  adaptCommunicationStyle: boolean;
  adaptFormality: boolean;
  adaptExamples: boolean;
  adaptMetaphors: boolean;
  adaptHumor: boolean;
}

// =============================================================================
// 🔄 동기화 및 학습 타입들
// =============================================================================

export interface LanguageLearningProgress {
  userId: string;
  language: SupportedLanguage;
  proficiencyLevel: 'beginner' | 'elementary' | 'intermediate' | 'advanced' | 'native';
  skillAreas: {
    vocabulary: number; // 0-100
    grammar: number;
    comprehension: number;
    culturalUnderstanding: number;
  };
  recentImprovements: string[];
  suggestedFocus: string[];
  lastAssessed: Date;
}

export interface CrossLinguisticTransfer {
  sourceLanguage: SupportedLanguage;
  targetLanguage: SupportedLanguage;
  transferredConcepts: string[];
  adaptationNeeded: boolean;
  culturalGaps: string[];
  recommendations: string[];
}

// =============================================================================
// 🎭 확장된 이벤트 타입들
// =============================================================================

export interface MultilingualCueEvent {
  type: 'cue_extracted' | 'language_detected' | 'culture_adapted' | 'translation_suggested';
  timestamp: Date;
  userId: string;
  language: SupportedLanguage;
  cue?: MultilingualPersonalCue;
  culturalContext?: CulturalContext;
  metadata: Record<string, any>;
}

export interface LanguageSwitchEvent {
  type: 'language_switch';
  timestamp: Date;
  userId: string;
  fromLanguage: SupportedLanguage;
  toLanguage: SupportedLanguage;
  context: string;
  reason: 'user_preference' | 'auto_detected' | 'cultural_adaptation' | 'technical_term';
  confidence: number;
}

// =============================================================================
// 🔍 검색 및 필터링 타입들
// =============================================================================

export interface MultilingualCueQuery {
  languages?: SupportedLanguage[];
  culturalContexts?: string[];
  formalityLevels?: FormalityLevel[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  confidenceThreshold?: number;
  cueTypes?: CueType[];
  technicalDomains?: TechnicalDomain[];
}

export interface LanguagePreference {
  userId: string;
  preferredLanguages: SupportedLanguage[];
  culturalAdaptationLevel: number;
  formalityPreference: FormalityLevel;
  communicationStyle: CommunicationStyle;
  learningLanguages: SupportedLanguage[];
  avoidedLanguages: SupportedLanguage[];
  lastUpdated: Date;
}

// =============================================================================
// 📊 분석 리포트 타입들
// =============================================================================

export interface MultilingualAnalyticsReport {
  period: {
    start: Date;
    end: Date;
  };
  languageUsage: LanguageUsageStatistics;
  culturalAdaptations: number;
  translationAccuracy: number;
  userSatisfactionScore: number;
  recommendationsFollowed: number;
  keyInsights: string[];
  trendsIdentified: string[];
  improvementAreas: string[];
}

export interface GlobalizationMetrics {
  totalLanguagesSupported: number;
  activeLanguages: SupportedLanguage[];
  averageDetectionAccuracy: number;
  culturalAdaptationSuccess: number;
  crossCulturalEngagement: number;
  localizationCoverage: number;
  userLanguagePreferences: Record<SupportedLanguage, number>;
}

// =============================================================================
// 🔧 유틸리티 타입들
// =============================================================================

export type LanguagePair = {
  source: SupportedLanguage;
  target: SupportedLanguage;
};

export type CulturalDimensionScore = {
  individualism: number; // 0-100
  powerDistance: number; // 0-100
  uncertaintyAvoidance: number; // 0-100
  longTermOrientation: number; // 0-100
  masculinity: number; // 0-100
  indulgence: number; // 0-100
};

export interface LanguageCapability {
  language: SupportedLanguage;
  supported: boolean;
  quality: 'basic' | 'good' | 'excellent' | 'native';
  features: {
    patternRecognition: boolean;
    culturalAdaptation: boolean;
    formalityDetection: boolean;
    dialectSupport: boolean;
    technicalTerms: boolean;
  };
  lastUpdated: Date;
}

// =============================================================================
// 📁 레거시 호환성을 위한 재-export
// =============================================================================

// 기존 cue.types.ts의 타입들도 여전히 사용 가능
export type { PersonalCue, CueType, MessageContext, ExtractionResult } from './cue.types';

// =============================================================================
// 🚀 기본 export
// =============================================================================

export default MultilingualPersonalCue;