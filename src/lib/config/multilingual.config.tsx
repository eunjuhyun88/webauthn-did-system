// =============================================================================
// 🌍 다국어 Cue 시스템 완전 설정
// src/lib/config/multilingual.config.ts
// 100개 언어 지원 + 문화적 컨텍스트 + WebAuthn 통합
// =============================================================================

import { 
  SupportedLanguage, 
  LanguagePattern, 
  CulturalContext, 
  FormalityMarker,
  TechnicalTermDictionary,
  PatternCategory,
  MultilingualConfig,
  LanguageDetectionConfig,
  CulturalAdaptationConfig 
} from '@/types/multilingual-cue';

// =============================================================================
// 🎯 기본 다국어 시스템 설정
// =============================================================================

export const MULTILINGUAL_CONFIG: MultilingualConfig = {
  supportedLanguages: [
    // 주요 언어들 (상위 20개)
    'korean', 'english', 'japanese', 'chinese', 'spanish', 'french', 'german', 
    'italian', 'portuguese', 'russian', 'arabic', 'hindi', 'thai', 'vietnamese',
    'indonesian', 'malay', 'tagalog', 'dutch', 'polish', 'turkish',
    
    // 유럽 언어들 (20개)
    'swedish', 'norwegian', 'danish', 'finnish', 'icelandic', 'irish', 'welsh',
    'catalan', 'basque', 'galician', 'czech', 'slovak', 'hungarian', 'romanian',
    'bulgarian', 'serbian', 'croatian', 'slovene', 'lithuanian', 'latvian',
    
    // 아시아-태평양 언어들 (20개)  
    'bengali', 'punjabi', 'gujarati', 'marathi', 'telugu', 'kannada', 'malayalam',
    'tamil', 'sinhalese', 'burmese', 'khmer', 'lao', 'mongolian', 'tibetan',
    'urdu', 'persian', 'hebrew', 'georgian', 'armenian', 'azerbaijani',
    
    // 아프리카 언어들 (20개)
    'swahili', 'amharic', 'oromo', 'igbo', 'yoruba', 'hausa', 'zulu', 'xhosa',
    'afrikaans', 'somali', 'wolof', 'fulani', 'mandinka', 'bambara', 'akan',
    'ewe', 'gikuyu', 'luo', 'dholuo', 'shona',
    
    // 아메리카 대륙 언어들 (15개)
    'quechua', 'guarani', 'nahuatl', 'maya', 'mapuche', 'aymara', 'wayuu',
    'tupi', 'ojibwe', 'cherokee', 'navajo', 'inuktitut', 'greenlandic', 
    'haitian_creole', 'papiamento',
    
    // 특수 및 기타 (5개)
    'esperanto', 'latin', 'sanskrit', 'ancient_greek', 'unknown'
  ],
  defaultLanguage: 'english',
  fallbackLanguage: 'english',
  autoDetectLanguage: true,
  enableCulturalAdaptation: true,
  enableCodeSwitchingDetection: true,
  confidenceThreshold: 0.6,
  maxLanguagesPerUser: 5,
  translationCacheSize: 10000,
  culturalAdaptationLevel: 'moderate'
};

// =============================================================================
// 🔍 언어 감지 설정
// =============================================================================

export const LANGUAGE_DETECTION_CONFIG: LanguageDetectionConfig = {
  method: 'hybrid',
  confidenceThreshold: 0.6,
  contextWindow: 10,
  enableDialectDetection: true,
  enableFormalityDetection: true,
  fallbackBehavior: 'default_language'
};

// =============================================================================
// 🎭 문화적 적응 설정
// =============================================================================

export const CULTURAL_ADAPTATION_CONFIG: CulturalAdaptationConfig = {
  enableAdaptation: true,
  adaptationDepth: 'moderate',
  preserveOriginalMeaning: true,
  adaptCommunicationStyle: true,
  adaptFormality: true,
  adaptExamples: true,
  adaptMetaphors: false, // 초기에는 안전하게 비활성화
  adaptHumor: false      // 문화적 차이로 인한 오해 방지
};

// =============================================================================
// 🗣️ 언어 메타데이터 매핑
// =============================================================================

export const LANGUAGE_METADATA_MAP: Record<SupportedLanguage, {
  iso639_1: string;
  iso639_2: string;
  nativeName: string;
  englishName: string;
  script: string;
  rtl: boolean;
  region: string[];
  speakers: number; // millions
  difficulty: 'easy' | 'medium' | 'hard' | 'very_hard';
}> = {
  // === 아시아 언어들 ===
  korean: {
    iso639_1: 'ko', iso639_2: 'kor', nativeName: '한국어', englishName: 'Korean',
    script: 'hangul', rtl: false, region: ['Korea'], speakers: 77, difficulty: 'very_hard'
  },
  japanese: {
    iso639_1: 'ja', iso639_2: 'jpn', nativeName: '日本語', englishName: 'Japanese',
    script: 'hiragana_katakana', rtl: false, region: ['Japan'], speakers: 125, difficulty: 'very_hard'
  },
  chinese: {
    iso639_1: 'zh', iso639_2: 'zho', nativeName: '中文', englishName: 'Chinese',
    script: 'han', rtl: false, region: ['China', 'Taiwan', 'Singapore'], speakers: 1400, difficulty: 'very_hard'
  },
  thai: {
    iso639_1: 'th', iso639_2: 'tha', nativeName: 'ไทย', englishName: 'Thai',
    script: 'thai', rtl: false, region: ['Thailand'], speakers: 69, difficulty: 'very_hard'
  },
  vietnamese: {
    iso639_1: 'vi', iso639_2: 'vie', nativeName: 'Tiếng Việt', englishName: 'Vietnamese',
    script: 'latin', rtl: false, region: ['Vietnam'], speakers: 95, difficulty: 'medium'
  },
  hindi: {
    iso639_1: 'hi', iso639_2: 'hin', nativeName: 'हिन्दी', englishName: 'Hindi',
    script: 'devanagari', rtl: false, region: ['India'], speakers: 600, difficulty: 'hard'
  },
  bengali: {
    iso639_1: 'bn', iso639_2: 'ben', nativeName: 'বাংলা', englishName: 'Bengali',
    script: 'bengali', rtl: false, region: ['Bangladesh', 'India'], speakers: 265, difficulty: 'hard'
  },
  
  // === 유럽 언어들 ===
  english: {
    iso639_1: 'en', iso639_2: 'eng', nativeName: 'English', englishName: 'English',
    script: 'latin', rtl: false, region: ['Global'], speakers: 1500, difficulty: 'medium'
  },
  spanish: {
    iso639_1: 'es', iso639_2: 'spa', nativeName: 'Español', englishName: 'Spanish',
    script: 'latin', rtl: false, region: ['Spain', 'Latin America'], speakers: 500, difficulty: 'easy'
  },
  french: {
    iso639_1: 'fr', iso639_2: 'fra', nativeName: 'Français', englishName: 'French',
    script: 'latin', rtl: false, region: ['France', 'Africa'], speakers: 280, difficulty: 'medium'
  },
  german: {
    iso639_1: 'de', iso639_2: 'deu', nativeName: 'Deutsch', englishName: 'German',
    script: 'latin', rtl: false, region: ['Germany', 'Austria'], speakers: 100, difficulty: 'hard'
  },
  italian: {
    iso639_1: 'it', iso639_2: 'ita', nativeName: 'Italiano', englishName: 'Italian',
    script: 'latin', rtl: false, region: ['Italy'], speakers: 65, difficulty: 'medium'
  },
  portuguese: {
    iso639_1: 'pt', iso639_2: 'por', nativeName: 'Português', englishName: 'Portuguese',
    script: 'latin', rtl: false, region: ['Brazil', 'Portugal'], speakers: 260, difficulty: 'medium'
  },
  russian: {
    iso639_1: 'ru', iso639_2: 'rus', nativeName: 'Русский', englishName: 'Russian',
    script: 'cyrillic', rtl: false, region: ['Russia', 'CIS'], speakers: 260, difficulty: 'hard'
  },
  dutch: {
    iso639_1: 'nl', iso639_2: 'nld', nativeName: 'Nederlands', englishName: 'Dutch',
    script: 'latin', rtl: false, region: ['Netherlands', 'Belgium'], speakers: 24, difficulty: 'medium'
  },
  
  // === 중동 언어들 ===
  arabic: {
    iso639_1: 'ar', iso639_2: 'ara', nativeName: 'العربية', englishName: 'Arabic',
    script: 'arabic', rtl: true, region: ['Middle East', 'North Africa'], speakers: 400, difficulty: 'hard'
  },
  hebrew: {
    iso639_1: 'he', iso639_2: 'heb', nativeName: 'עברית', englishName: 'Hebrew',
    script: 'hebrew', rtl: true, region: ['Israel'], speakers: 9, difficulty: 'hard'
  },
  persian: {
    iso639_1: 'fa', iso639_2: 'fas', nativeName: 'فارسی', englishName: 'Persian',
    script: 'arabic', rtl: true, region: ['Iran', 'Afghanistan'], speakers: 110, difficulty: 'hard'
  },
  
  // === 동남아시아 언어들 ===
  indonesian: {
    iso639_1: 'id', iso639_2: 'ind', nativeName: 'Bahasa Indonesia', englishName: 'Indonesian',
    script: 'latin', rtl: false, region: ['Indonesia'], speakers: 270, difficulty: 'easy'
  },
  malay: {
    iso639_1: 'ms', iso639_2: 'msa', nativeName: 'Bahasa Melayu', englishName: 'Malay',
    script: 'latin', rtl: false, region: ['Malaysia', 'Singapore'], speakers: 33, difficulty: 'easy'
  },
  tagalog: {
    iso639_1: 'tl', iso639_2: 'tgl', nativeName: 'Tagalog', englishName: 'Tagalog',
    script: 'latin', rtl: false, region: ['Philippines'], speakers: 90, difficulty: 'medium'
  },
  
  // === 북유럽 언어들 ===
  swedish: {
    iso639_1: 'sv', iso639_2: 'swe', nativeName: 'Svenska', englishName: 'Swedish',
    script: 'latin', rtl: false, region: ['Sweden'], speakers: 10, difficulty: 'medium'
  },
  norwegian: {
    iso639_1: 'no', iso639_2: 'nor', nativeName: 'Norsk', englishName: 'Norwegian',
    script: 'latin', rtl: false, region: ['Norway'], speakers: 5, difficulty: 'medium'
  },
  danish: {
    iso639_1: 'da', iso639_2: 'dan', nativeName: 'Dansk', englishName: 'Danish',
    script: 'latin', rtl: false, region: ['Denmark'], speakers: 6, difficulty: 'medium'
  },
  finnish: {
    iso639_1: 'fi', iso639_2: 'fin', nativeName: 'Suomi', englishName: 'Finnish',
    script: 'latin', rtl: false, region: ['Finland'], speakers: 5, difficulty: 'very_hard'
  },
  
  // === 기타 주요 언어들 (간소화) ===
  polish: { iso639_1: 'pl', iso639_2: 'pol', nativeName: 'Polski', englishName: 'Polish', script: 'latin', rtl: false, region: ['Poland'], speakers: 40, difficulty: 'hard' },
  turkish: { iso639_1: 'tr', iso639_2: 'tur', nativeName: 'Türkçe', englishName: 'Turkish', script: 'latin', rtl: false, region: ['Turkey'], speakers: 80, difficulty: 'hard' },
  czech: { iso639_1: 'cs', iso639_2: 'ces', nativeName: 'Čeština', englishName: 'Czech', script: 'latin', rtl: false, region: ['Czech Republic'], speakers: 10, difficulty: 'hard' },
  hungarian: { iso639_1: 'hu', iso639_2: 'hun', nativeName: 'Magyar', englishName: 'Hungarian', script: 'latin', rtl: false, region: ['Hungary'], speakers: 13, difficulty: 'very_hard' },
  
  // === 간소화된 기타 언어들 ===
  icelandic: { iso639_1: 'is', iso639_2: 'isl', nativeName: 'Íslenska', englishName: 'Icelandic', script: 'latin', rtl: false, region: ['Iceland'], speakers: 0.3, difficulty: 'very_hard' },
  irish: { iso639_1: 'ga', iso639_2: 'gle', nativeName: 'Gaeilge', englishName: 'Irish', script: 'latin', rtl: false, region: ['Ireland'], speakers: 1.7, difficulty: 'hard' },
  welsh: { iso639_1: 'cy', iso639_2: 'cym', nativeName: 'Cymraeg', englishName: 'Welsh', script: 'latin', rtl: false, region: ['Wales'], speakers: 0.9, difficulty: 'hard' },
  catalan: { iso639_1: 'ca', iso639_2: 'cat', nativeName: 'Català', englishName: 'Catalan', script: 'latin', rtl: false, region: ['Catalonia'], speakers: 10, difficulty: 'medium' },
  basque: { iso639_1: 'eu', iso639_2: 'eus', nativeName: 'Euskera', englishName: 'Basque', script: 'latin', rtl: false, region: ['Basque Country'], speakers: 1.2, difficulty: 'very_hard' },
  galician: { iso639_1: 'gl', iso639_2: 'glg', nativeName: 'Galego', englishName: 'Galician', script: 'latin', rtl: false, region: ['Galicia'], speakers: 2.4, difficulty: 'medium' },
  
  // === 기타 아시아 언어들 (기본 설정) ===
  urdu: { iso639_1: 'ur', iso639_2: 'urd', nativeName: 'اردو', englishName: 'Urdu', script: 'arabic', rtl: true, region: ['Pakistan'], speakers: 230, difficulty: 'hard' },
  punjabi: { iso639_1: 'pa', iso639_2: 'pan', nativeName: 'ਪੰਜਾਬੀ', englishName: 'Punjabi', script: 'gurmukhi', rtl: false, region: ['Punjab'], speakers: 130, difficulty: 'hard' },
  gujarati: { iso639_1: 'gu', iso639_2: 'guj', nativeName: 'ગુજરાતી', englishName: 'Gujarati', script: 'gujarati', rtl: false, region: ['Gujarat'], speakers: 56, difficulty: 'hard' },
  marathi: { iso639_1: 'mr', iso639_2: 'mar', nativeName: 'मराठी', englishName: 'Marathi', script: 'devanagari', rtl: false, region: ['Maharashtra'], speakers: 83, difficulty: 'hard' },
  telugu: { iso639_1: 'te', iso639_2: 'tel', nativeName: 'తెలుగు', englishName: 'Telugu', script: 'telugu', rtl: false, region: ['Andhra Pradesh'], speakers: 96, difficulty: 'hard' },
  kannada: { iso639_1: 'kn', iso639_2: 'kan', nativeName: 'ಕನ್ನಡ', englishName: 'Kannada', script: 'kannada', rtl: false, region: ['Karnataka'], speakers: 60, difficulty: 'hard' },
  malayalam: { iso639_1: 'ml', iso639_2: 'mal', nativeName: 'മലയാളം', englishName: 'Malayalam', script: 'malayalam', rtl: false, region: ['Kerala'], speakers: 38, difficulty: 'hard' },
  tamil: { iso639_1: 'ta', iso639_2: 'tam', nativeName: 'தமிழ்', englishName: 'Tamil', script: 'tamil', rtl: false, region: ['Tamil Nadu'], speakers: 78, difficulty: 'hard' },
  
  // === 기타 언어들 (단순화) ===
  sinhalese: { iso639_1: 'si', iso639_2: 'sin', nativeName: 'සිංහල', englishName: 'Sinhalese', script: 'sinhala', rtl: false, region: ['Sri Lanka'], speakers: 16, difficulty: 'hard' },
  burmese: { iso639_1: 'my', iso639_2: 'mya', nativeName: 'မြန်မာ', englishName: 'Burmese', script: 'myanmar', rtl: false, region: ['Myanmar'], speakers: 33, difficulty: 'very_hard' },
  khmer: { iso639_1: 'km', iso639_2: 'khm', nativeName: 'ខ្មែរ', englishName: 'Khmer', script: 'khmer', rtl: false, region: ['Cambodia'], speakers: 16, difficulty: 'very_hard' },
  lao: { iso639_1: 'lo', iso639_2: 'lao', nativeName: 'ລາວ', englishName: 'Lao', script: 'lao', rtl: false, region: ['Laos'], speakers: 7, difficulty: 'very_hard' },
  
  // === 나머지 언어들은 기본 설정으로 ===
  unknown: { iso639_1: 'xx', iso639_2: 'xxx', nativeName: 'Unknown', englishName: 'Unknown', script: 'latin', rtl: false, region: ['Global'], speakers: 0, difficulty: 'medium' },
  
  // 나머지 언어들 (간소화된 기본 설정)
  slovak: { iso639_1: 'sk', iso639_2: 'slk', nativeName: 'Slovenčina', englishName: 'Slovak', script: 'latin', rtl: false, region: ['Slovakia'], speakers: 5, difficulty: 'medium' },
  romanian: { iso639_1: 'ro', iso639_2: 'ron', nativeName: 'Română', englishName: 'Romanian', script: 'latin', rtl: false, region: ['Romania'], speakers: 24, difficulty: 'medium' },
  bulgarian: { iso639_1: 'bg', iso639_2: 'bul', nativeName: 'Български', englishName: 'Bulgarian', script: 'cyrillic', rtl: false, region: ['Bulgaria'], speakers: 9, difficulty: 'medium' },
  serbian: { iso639_1: 'sr', iso639_2: 'srp', nativeName: 'Српски', englishName: 'Serbian', script: 'cyrillic', rtl: false, region: ['Serbia'], speakers: 12, difficulty: 'medium' },
  croatian: { iso639_1: 'hr', iso639_2: 'hrv', nativeName: 'Hrvatski', englishName: 'Croatian', script: 'latin', rtl: false, region: ['Croatia'], speakers: 5, difficulty: 'medium' },
  slovene: { iso639_1: 'sl', iso639_2: 'slv', nativeName: 'Slovenščina', englishName: 'Slovene', script: 'latin', rtl: false, region: ['Slovenia'], speakers: 2, difficulty: 'medium' },
  lithuanian: { iso639_1: 'lt', iso639_2: 'lit', nativeName: 'Lietuvių', englishName: 'Lithuanian', script: 'latin', rtl: false, region: ['Lithuania'], speakers: 3, difficulty: 'hard' },
  latvian: { iso639_1: 'lv', iso639_2: 'lav', nativeName: 'Latviešu', englishName: 'Latvian', script: 'latin', rtl: false, region: ['Latvia'], speakers: 2, difficulty: 'hard' },
  estonian: { iso639_1: 'et', iso639_2: 'est', nativeName: 'Eesti', englishName: 'Estonian', script: 'latin', rtl: false, region: ['Estonia'], speakers: 1, difficulty: 'hard' },
  
  // 기타 모든 언어들 - 기본값으로 처리
  mongolian: { iso639_1: 'mn', iso639_2: 'mon', nativeName: 'Монгол', englishName: 'Mongolian', script: 'cyrillic', rtl: false, region: ['Mongolia'], speakers: 5, difficulty: 'hard' },
  tibetan: { iso639_1: 'bo', iso639_2: 'bod', nativeName: 'བོད་', englishName: 'Tibetan', script: 'tibetan', rtl: false, region: ['Tibet'], speakers: 6, difficulty: 'very_hard' },
  georgian: { iso639_1: 'ka', iso639_2: 'kat', nativeName: 'ქართული', englishName: 'Georgian', script: 'georgian', rtl: false, region: ['Georgia'], speakers: 4, difficulty: 'very_hard' },
  armenian: { iso639_1: 'hy', iso639_2: 'hye', nativeName: 'Հայերեն', englishName: 'Armenian', script: 'armenian', rtl: false, region: ['Armenia'], speakers: 7, difficulty: 'hard' },
  azerbaijani: { iso639_1: 'az', iso639_2: 'aze', nativeName: 'Azərbaycan', englishName: 'Azerbaijani', script: 'latin', rtl: false, region: ['Azerbaijan'], speakers: 23, difficulty: 'medium' },
  
  // 아프리카 언어들 (기본 설정)
  swahili: { iso639_1: 'sw', iso639_2: 'swa', nativeName: 'Kiswahili', englishName: 'Swahili', script: 'latin', rtl: false, region: ['East Africa'], speakers: 200, difficulty: 'easy' },
  amharic: { iso639_1: 'am', iso639_2: 'amh', nativeName: 'አማርኛ', englishName: 'Amharic', script: 'ethiopic', rtl: false, region: ['Ethiopia'], speakers: 57, difficulty: 'hard' },
  oromo: { iso639_1: 'om', iso639_2: 'orm', nativeName: 'Oromoo', englishName: 'Oromo', script: 'latin', rtl: false, region: ['Ethiopia'], speakers: 37, difficulty: 'medium' },
  igbo: { iso639_1: 'ig', iso639_2: 'ibo', nativeName: 'Igbo', englishName: 'Igbo', script: 'latin', rtl: false, region: ['Nigeria'], speakers: 27, difficulty: 'medium' },
  yoruba: { iso639_1: 'yo', iso639_2: 'yor', nativeName: 'Yorùbá', englishName: 'Yoruba', script: 'latin', rtl: false, region: ['Nigeria'], speakers: 45, difficulty: 'medium' },
  hausa: { iso639_1: 'ha', iso639_2: 'hau', nativeName: 'Hausa', englishName: 'Hausa', script: 'latin', rtl: false, region: ['West Africa'], speakers: 85, difficulty: 'medium' },
  zulu: { iso639_1: 'zu', iso639_2: 'zul', nativeName: 'isiZulu', englishName: 'Zulu', script: 'latin', rtl: false, region: ['South Africa'], speakers: 12, difficulty: 'medium' },
  xhosa: { iso639_1: 'xh', iso639_2: 'xho', nativeName: 'isiXhosa', englishName: 'Xhosa', script: 'latin', rtl: false, region: ['South Africa'], speakers: 8, difficulty: 'medium' },
  afrikaans: { iso639_1: 'af', iso639_2: 'afr', nativeName: 'Afrikaans', englishName: 'Afrikaans', script: 'latin', rtl: false, region: ['South Africa'], speakers: 7, difficulty: 'easy' },
  
  // 나머지 아프리카 언어들 (단순화)
  somali: { iso639_1: 'so', iso639_2: 'som', nativeName: 'Soomaali', englishName: 'Somali', script: 'latin', rtl: false, region: ['Somalia'], speakers: 24, difficulty: 'medium' },
  wolof: { iso639_1: 'wo', iso639_2: 'wol', nativeName: 'Wolof', englishName: 'Wolof', script: 'latin', rtl: false, region: ['Senegal'], speakers: 10, difficulty: 'medium' },
  fulani: { iso639_1: 'ff', iso639_2: 'ful', nativeName: 'Fulfulde', englishName: 'Fulani', script: 'latin', rtl: false, region: ['West Africa'], speakers: 65, difficulty: 'medium' },
  mandinka: { iso639_1: 'mn', iso639_2: 'mnk', nativeName: 'Mandinka', englishName: 'Mandinka', script: 'latin', rtl: false, region: ['West Africa'], speakers: 2, difficulty: 'medium' },
  bambara: { iso639_1: 'bm', iso639_2: 'bam', nativeName: 'Bamanankan', englishName: 'Bambara', script: 'latin', rtl: false, region: ['Mali'], speakers: 15, difficulty: 'medium' },
  akan: { iso639_1: 'ak', iso639_2: 'aka', nativeName: 'Akan', englishName: 'Akan', script: 'latin', rtl: false, region: ['Ghana'], speakers: 11, difficulty: 'medium' },
  ewe: { iso639_1: 'ee', iso639_2: 'ewe', nativeName: 'Eʋegbe', englishName: 'Ewe', script: 'latin', rtl: false, region: ['Ghana'], speakers: 7, difficulty: 'medium' },
  gikuyu: { iso639_1: 'ki', iso639_2: 'kik', nativeName: 'Gĩkũyũ', englishName: 'Gikuyu', script: 'latin', rtl: false, region: ['Kenya'], speakers: 8, difficulty: 'medium' },
  luo: { iso639_1: 'luo', iso639_2: 'luo', nativeName: 'Dholuo', englishName: 'Luo', script: 'latin', rtl: false, region: ['Kenya'], speakers: 4, difficulty: 'medium' },
  dholuo: { iso639_1: 'luo', iso639_2: 'luo', nativeName: 'Dholuo', englishName: 'Dholuo', script: 'latin', rtl: false, region: ['Kenya'], speakers: 4, difficulty: 'medium' },
  shona: { iso639_1: 'sn', iso639_2: 'sna', nativeName: 'Shona', englishName: 'Shona', script: 'latin', rtl: false, region: ['Zimbabwe'], speakers: 15, difficulty: 'medium' },
  
  // 아메리카 대륙 언어들 (기본 설정)
  quechua: { iso639_1: 'qu', iso639_2: 'que', nativeName: 'Runasimi', englishName: 'Quechua', script: 'latin', rtl: false, region: ['Andes'], speakers: 8, difficulty: 'hard' },
  guarani: { iso639_1: 'gn', iso639_2: 'grn', nativeName: 'Avañe\'ẽ', englishName: 'Guarani', script: 'latin', rtl: false, region: ['Paraguay'], speakers: 6, difficulty: 'medium' },
  nahuatl: { iso639_1: 'nah', iso639_2: 'nah', nativeName: 'Nāhuatl', englishName: 'Nahuatl', script: 'latin', rtl: false, region: ['Mexico'], speakers: 2, difficulty: 'hard' },
  maya: { iso639_1: 'myn', iso639_2: 'myn', nativeName: 'Maya', englishName: 'Maya', script: 'latin', rtl: false, region: ['Mesoamerica'], speakers: 6, difficulty: 'hard' },
  mapuche: { iso639_1: 'arn', iso639_2: 'arn', nativeName: 'Mapudungun', englishName: 'Mapuche', script: 'latin', rtl: false, region: ['Chile'], speakers: 0.8, difficulty: 'hard' },
  aymara: { iso639_1: 'ay', iso639_2: 'aym', nativeName: 'Aymar aru', englishName: 'Aymara', script: 'latin', rtl: false, region: ['Bolivia'], speakers: 2, difficulty: 'hard' },
  wayuu: { iso639_1: 'guc', iso639_2: 'guc', nativeName: 'Wayuunaiki', englishName: 'Wayuu', script: 'latin', rtl: false, region: ['Colombia'], speakers: 0.4, difficulty: 'medium' },
  tupi: { iso639_1: 'tpn', iso639_2: 'tup', nativeName: 'Tupi', englishName: 'Tupi', script: 'latin', rtl: false, region: ['Brazil'], speakers: 0.03, difficulty: 'medium' },
  ojibwe: { iso639_1: 'oj', iso639_2: 'oji', nativeName: 'Anishinaabemowin', englishName: 'Ojibwe', script: 'latin', rtl: false, region: ['North America'], speakers: 0.06, difficulty: 'hard' },
  cherokee: { iso639_1: 'chr', iso639_2: 'chr', nativeName: 'ᏣᎳᎩ', englishName: 'Cherokee', script: 'cherokee', rtl: false, region: ['USA'], speakers: 0.02, difficulty: 'very_hard' },
  navajo: { iso639_1: 'nv', iso639_2: 'nav', nativeName: 'Diné bizaad', englishName: 'Navajo', script: 'latin', rtl: false, region: ['USA'], speakers: 0.17, difficulty: 'very_hard' },
  inuktitut: { iso639_1: 'iu', iso639_2: 'iku', nativeName: 'ᐃᓄᒃᑎᑐᑦ', englishName: 'Inuktitut', script: 'canadian_syllabics', rtl: false, region: ['Canada'], speakers: 0.04, difficulty: 'very_hard' },
  greenlandic: { iso639_1: 'kl', iso639_2: 'kal', nativeName: 'Kalaallisut', englishName: 'Greenlandic', script: 'latin', rtl: false, region: ['Greenland'], speakers: 0.06, difficulty: 'hard' },
  haitian_creole: { iso639_1: 'ht', iso639_2: 'hat', nativeName: 'Kreyòl ayisyen', englishName: 'Haitian Creole', script: 'latin', rtl: false, region: ['Haiti'], speakers: 12, difficulty: 'easy' },
  papiamento: { iso639_1: 'pap', iso639_2: 'pap', nativeName: 'Papiamentu', englishName: 'Papiamento', script: 'latin', rtl: false, region: ['Aruba'], speakers: 0.33, difficulty: 'easy' },
  
  // 특수 언어들
  esperanto: { iso639_1: 'eo', iso639_2: 'epo', nativeName: 'Esperanto', englishName: 'Esperanto', script: 'latin', rtl: false, region: ['Global'], speakers: 2, difficulty: 'easy' },
  latin: { iso639_1: 'la', iso639_2: 'lat', nativeName: 'Latina', englishName: 'Latin', script: 'latin', rtl: false, region: ['Historical'], speakers: 0, difficulty: 'hard' },
  sanskrit: { iso639_1: 'sa', iso639_2: 'san', nativeName: 'संस्कृतम्', englishName: 'Sanskrit', script: 'devanagari', rtl: false, region: ['Historical'], speakers: 0.025, difficulty: 'very_hard' },
  ancient_greek: { iso639_1: 'grc', iso639_2: 'grc', nativeName: 'Ἀρχαία Ἑλληνικὴ', englishName: 'Ancient Greek', script: 'greek', rtl: false, region: ['Historical'], speakers: 0, difficulty: 'very_hard' }
};

// =============================================================================
// 🎭 문화적 컨텍스트 매핑
// =============================================================================

export const CULTURAL_CONTEXTS: Record<SupportedLanguage, CulturalContext> = {
  // === 동아시아 (고맥락, 집단주의) ===
  korean: {
    region: 'Korea',
    communicationStyle: 'hierarchical',
    formalityDefault: 'polite',
    questioningStyle: 'reserved',
    feedbackPreference: 'implicit',
    timeOrientation: 'flexible',
    collectivismScore: 80,
    powerDistanceScore: 70,
    uncertaintyAvoidanceScore: 60,
    contextDependency: 80
  },
  
  japanese: {
    region: 'Japan',
    communicationStyle: 'indirect',
    formalityDefault: 'formal',
    questioningStyle: 'reserved',
    feedbackPreference: 'contextual',
    timeOrientation: 'flexible',
    collectivismScore: 75,
    powerDistanceScore: 60,
    uncertaintyAvoidanceScore: 90,
    contextDependency: 90
  },
  
  chinese: {
    region: 'China',
    communicationStyle: 'indirect',
    formalityDefault: 'polite',
    questioningStyle: 'detailed',
    feedbackPreference: 'contextual',
    timeOrientation: 'flexible',
    collectivismScore: 80,
    powerDistanceScore: 80,
    uncertaintyAvoidanceScore: 60,
    contextDependency: 80
  },
  
  // === 서구 (저맥락, 개인주의) ===
  english: {
    region: 'Global',
    communicationStyle: 'direct',
    formalityDefault: 'neutral',
    questioningStyle: 'open',
    feedbackPreference: 'explicit',
    timeOrientation: 'linear',
    collectivismScore: 30,
    powerDistanceScore: 40,
    uncertaintyAvoidanceScore: 50,
    contextDependency: 30
  },
  
  german: {
    region: 'Germany',
    communicationStyle: 'direct',
    formalityDefault: 'formal',
    questioningStyle: 'detailed',
    feedbackPreference: 'explicit',
    timeOrientation: 'linear',
    collectivismScore: 35,
    powerDistanceScore: 35,
    uncertaintyAvoidanceScore: 75,
    contextDependency: 25
  },
  
  // === 라틴 문화권 ===
  spanish: {
    region: 'Spain/Latin America',
    communicationStyle: 'direct',
    formalityDefault: 'polite',
    questioningStyle: 'open',
    feedbackPreference: 'explicit',
    timeOrientation: 'flexible',
    collectivismScore: 60,
    powerDistanceScore: 60,
    uncertaintyAvoidanceScore: 70,
    contextDependency: 50
  },
  
  french: {
    region: 'France',
    communicationStyle: 'direct',
    formalityDefault: 'formal',
    questioningStyle: 'open',
    feedbackPreference: 'explicit',
    timeOrientation: 'linear',
    collectivismScore: 30,
    powerDistanceScore: 70,
    uncertaintyAvoidanceScore: 75,
    contextDependency: 40
  },
  
  // === 중동 문화권 ===
  arabic: {
    region: 'Middle East',
    communicationStyle: 'indirect',
    formalityDefault: 'formal',
    questioningStyle: 'reserved',
    feedbackPreference: 'contextual',
    timeOrientation: 'flexible',
    collectivismScore: 70,
    powerDistanceScore: 80,
    uncertaintyAvoidanceScore: 70,
    contextDependency: 75
  },
  
  // === 기본값 (나머지 언어들) ===
  unknown: {
    region: 'Global',
    communicationStyle: 'direct',
    formalityDefault: 'neutral',
    questioningStyle: 'open',
    feedbackPreference: 'explicit',
    timeOrientation: 'linear',
    collectivismScore: 50,
    powerDistanceScore: 50,
    uncertaintyAvoidanceScore: 50,
    contextDependency: 50
  }
};

// 나머지 언어들에 대한 기본 문화적 컨텍스트 설정
[
  'thai', 'vietnamese', 'indonesian', 'malay', 'tagalog', 'hindi', 'bengali',
  'italian', 'portuguese', 'russian', 'dutch', 'polish', 'turkish', 'czech',
  'hungarian', 'swedish', 'norwegian', 'danish', 'finnish', 'icelandic',
  'irish', 'welsh', 'catalan', 'basque', 'galician', 'slovak', 'romanian',
  'bulgarian', 'serbian', 'croatian', 'slovene', 'lithuanian', 'latvian',
  'estonian', 'urdu', 'punjabi', 'gujarati', 'marathi', 'telugu', 'kannada',
  'malayalam', 'tamil', 'sinhalese', 'burmese', 'khmer', 'lao', 'mongolian',
  'tibetan', 'hebrew', 'persian', 'georgian', 'armenian', 'azerbaijani',
  'swahili', 'amharic', 'oromo', 'igbo', 'yoruba', 'hausa', 'zulu', 'xhosa',
  'afrikaans', 'somali', 'wolof', 'fulani', 'mandinka', 'bambara', 'akan',
  'ewe', 'gikuyu', 'luo', 'dholuo', 'shona', 'quechua', 'guarani', 'nahuatl',
  'maya', 'mapuche', 'aymara', 'wayuu', 'tupi', 'ojibwe', 'cherokee',
  'navajo', 'inuktitut', 'greenlandic', 'haitian_creole', 'papiamento',
  'esperanto', 'latin', 'sanskrit', 'ancient_greek'
].forEach(lang => {
  if (!CULTURAL_CONTEXTS[lang as SupportedLanguage]) {
    CULTURAL_CONTEXTS[lang as SupportedLanguage] = {
      ...CULTURAL_CONTEXTS.unknown,
      region: LANGUAGE_METADATA_MAP[lang as SupportedLanguage]?.region[0] || 'Global'
    };
  }
});

// =============================================================================
// 🔤 언어별 패턴 매핑
// =============================================================================

export const LANGUAGE_PATTERNS: Record<SupportedLanguage, Map<PatternCategory, RegExp[]>> = {
  korean: new Map([
    ['brief', [/간단히?|간략히?|짧게|요약해?|빨리/]],
    ['detailed', [/자세히?|상세히?|구체적으로|상세한|자세한|정확히?/]],
    ['examples', [/예시|예제|사례|예를 들어|보기/]],
    ['learning', [/배우고 싶|학습|공부|익히고|알고 싶|가르쳐/]],
    ['problem_solving', [/문제|해결|에러|오류|안 돼|작동 안|고장|버그/]],
    ['creativity', [/창의적|아이디어|만들어|디자인|생각해/]],
    ['analysis', [/분석|검토|평가|비교|조사/]],
    ['planning', [/계획|일정|스케줄|준비|전략/]],
    ['urgent', [/급해|빨리|즉시|긴급|서둘러/]],
    ['casual', [/그냥|막|대충|아무거나/]],
    ['professional', [/업무|비즈니스|회사|전문적|공식/]]
  ]),
  
  english: new Map([
    ['brief', [/brief|short|concise|summary|quickly|fast/i]],
    ['detailed', [/detailed?|specific|elaborate|comprehensive|thoroughly|in-depth/i]],
    ['examples', [/example|instance|sample|demonstrate|show me|illustrate/i]],
    ['learning', [/learn|study|understand|master|teach me|explain/i]],
    ['problem_solving', [/problem|solve|fix|error|bug|issue|troubleshoot|debug/i]],
    ['creativity', [/creative|brainstorm|design|innovative|imagine|idea/i]],
    ['analysis', [/analyze|review|evaluate|compare|assess|examine/i]],
    ['planning', [/plan|schedule|organize|prepare|strategy|roadmap/i]],
    ['urgent', [/urgent|asap|immediately|quickly|rush|emergency/i]],
    ['casual', [/casual|informal|relaxed|friendly|chill/i]],
    ['professional', [/professional|business|formal|corporate|official/i]]
  ]),
  
  japanese: new Map([
    ['brief', [/簡単に|短く|要約|簡潔に|手短に/]],
    ['detailed', [/詳しく|具体的に|詳細に|丁寧に/]],
    ['examples', [/例|サンプル|実例|例えば|具体例/]],
    ['learning', [/学習|勉強|覚える|理解|教えて/]],
    ['problem_solving', [/問題|解決|エラー|バグ|困って|直す/]],
    ['creativity', [/創造的|アイデア|デザイン|工夫/]],
    ['analysis', [/分析|検討|評価|比較|調査/]],
    ['planning', [/計画|予定|スケジュール|準備|戦略/]],
    ['urgent', [/急ぎ|緊急|すぐに|至急/]],
    ['casual', [/気軽に|カジュアル|普通に/]],
    ['professional', [/仕事|ビジネス|正式|専門的/]]
  ]),
  
  chinese: new Map([
    ['brief', [/简单|简要|简洁|总结|快速/]],
    ['detailed', [/详细|具体|详细说明|仔细|深入/]],
    ['examples', [/例子|例如|比如|举例|示例/]],
    ['learning', [/学习|学会|了解|掌握|教我/]],
    ['problem_solving', [/问题|解决|错误|故障|帮助|修复/]],
    ['creativity', [/创意|想法|设计|创新|创造/]],
    ['analysis', [/分析|评估|比较|研究|检查/]],
    ['planning', [/计划|安排|准备|策略|规划/]],
    ['urgent', [/紧急|急需|立即|赶快|马上/]],
    ['casual', [/随便|轻松|简单|普通/]],
    ['professional', [/专业|商务|正式|工作|企业/]]
  ]),
  
  spanish: new Map([
    ['brief', [/breve|corto|resumen|simple|rápido/i]],
    ['detailed', [/detallado|específico|completo|exhaustivo|profundo/i]],
    ['examples', [/ejemplo|muestra|caso|demostrar|ilustrar/i]],
    ['learning', [/aprender|estudiar|entender|dominar|enseñar/i]],
    ['problem_solving', [/problema|resolver|error|solucionar|arreglar/i]],
    ['creativity', [/creativo|idea|diseñar|innovar|imaginar/i]],
    ['analysis', [/analizar|evaluar|comparar|examinar|revisar/i]],
    ['planning', [/planificar|programar|organizar|preparar|estrategia/i]],
    ['urgent', [/urgente|rápido|inmediato|prisa|emergencia/i]],
    ['casual', [/casual|informal|relajado|amigable/i]],
    ['professional', [/profesional|negocio|formal|corporativo|oficial/i]]
  ]),
  
  french: new Map([
    ['brief', [/bref|court|résumé|simple|rapide/i]],
    ['detailed', [/détaillé|spécifique|complet|approfondi|précis/i]],
    ['examples', [/exemple|échantillon|cas|démontrer|illustrer/i]],
    ['learning', [/apprendre|étudier|comprendre|maîtriser|enseigner/i]],
    ['problem_solving', [/problème|résoudre|erreur|réparer|corriger/i]],
    ['creativity', [/créatif|idée|concevoir|innover|imaginer/i]],
    ['analysis', [/analyser|évaluer|comparer|examiner|réviser/i]],
    ['planning', [/planifier|programmer|organiser|préparer|stratégie/i]],
    ['urgent', [/urgent|rapide|immédiat|pressé|urgence/i]],
    ['casual', [/décontracté|informel|amical|détendu/i]],
    ['professional', [/professionnel|affaires|formel|corporatif|officiel/i]]
  ]),
  
  german: new Map([
    ['brief', [/kurz|knapp|zusammenfassung|einfach|schnell/i]],
    ['detailed', [/detailliert|spezifisch|ausführlich|gründlich|genau/i]],
    ['examples', [/beispiel|muster|fall|demonstrieren|zeigen/i]],
    ['learning', [/lernen|studieren|verstehen|beherrschen|lehren/i]],
    ['problem_solving', [/problem|lösen|fehler|reparieren|beheben/i]],
    ['creativity', [/kreativ|idee|entwerfen|innovativ|vorstellen/i]],
    ['analysis', [/analysieren|bewerten|vergleichen|prüfen|untersuchen/i]],
    ['planning', [/planen|terminieren|organisieren|vorbereiten|strategie/i]],
    ['urgent', [/dringend|schnell|sofort|eilig|notfall/i]],
    ['casual', [/lässig|informell|entspannt|freundlich/i]],
    ['professional', [/professionell|geschäft|formell|unternehmen|offiziell/i]]
  ])
};

// 나머지 언어들에 대한 기본 패턴 설정 (영어 패턴 기반)
[
  'italian', 'portuguese', 'russian', 'dutch', 'polish', 'turkish', 'thai',
  'vietnamese', 'indonesian', 'malay', 'tagalog', 'hindi', 'bengali', 'arabic',
  'hebrew', 'persian', 'unknown'
].forEach(lang => {
  if (!LANGUAGE_PATTERNS[lang as SupportedLanguage]) {
    LANGUAGE_PATTERNS[lang as SupportedLanguage] = LANGUAGE_PATTERNS.english;
  }
});

// =============================================================================
// 🎯 정중함 마커 매핑
// =============================================================================

export const FORMALITY_MARKERS: Record<SupportedLanguage, FormalityMarker[]> = {
  korean: [
    { 
      level: 'formal', 
      markers: ['습니다', '하십시오', '께서', '님', '드립니다'], 
      responseStyle: { tone: 'respectful', length: 'moderate', structure: 'hierarchical', examples: 'some' },
      culturalWeight: 0.9 
    },
    { 
      level: 'polite', 
      markers: ['해요', '이에요', '주세요', '감사', '죄송'], 
      responseStyle: { tone: 'courteous', length: 'moderate', structure: 'linear', examples: 'some' },
      culturalWeight: 0.8 
    },
    { 
      level: 'casual', 
      markers: ['해', '야', '어', '지', 'ㅋㅋ'], 
      responseStyle: { tone: 'friendly', length: 'brief', structure: 'narrative', examples: 'minimal' },
      culturalWeight: 0.6 
    }
  ],
  
  english: [
    { 
      level: 'formal', 
      markers: ['please', 'would you', 'could you', 'thank you', 'sir', 'madam'], 
      responseStyle: { tone: 'professional', length: 'moderate', structure: 'linear', examples: 'some' },
      culturalWeight: 0.7 
    },
    { 
      level: 'casual', 
      markers: ['hey', 'yeah', 'gonna', 'wanna', 'thanks'], 
      responseStyle: { tone: 'relaxed', length: 'brief', structure: 'narrative', examples: 'minimal' },
      culturalWeight: 0.5 
    }
  ],
  
  japanese: [
    { 
      level: 'formal', 
      markers: ['です', 'ます', 'ございます', 'いらっしゃる', 'される'], 
      responseStyle: { tone: 'respectful', length: 'detailed', structure: 'hierarchical', examples: 'comprehensive' },
      culturalWeight: 0.9 
    },
    { 
      level: 'casual', 
      markers: ['だ', 'である', 'だよ', 'だね', 'じゃん'], 
      responseStyle: { tone: 'friendly', length: 'brief', structure: 'narrative', examples: 'minimal' },
      culturalWeight: 0.6 
    }
  ],
  
  chinese: [
    { 
      level: 'formal', 
      markers: ['您', '请', '谢谢', '不好意思', '敬请'], 
      responseStyle: { tone: 'respectful', length: 'moderate', structure: 'hierarchical', examples: 'some' },
      culturalWeight: 0.8 
    },
    { 
      level: 'casual', 
      markers: ['你', '吧', '呢', '啊', '哈哈'], 
      responseStyle: { tone: 'friendly', length: 'brief', structure: 'narrative', examples: 'minimal' },
      culturalWeight: 0.5 
    }
  ]
};

// 나머지 언어들에 대한 기본 정중함 마커 (영어 기반)
[
  'spanish', 'french', 'german', 'italian', 'portuguese', 'russian', 'arabic',
  'thai', 'vietnamese', 'hindi', 'unknown'
].forEach(lang => {
  if (!FORMALITY_MARKERS[lang as SupportedLanguage]) {
    FORMALITY_MARKERS[lang as SupportedLanguage] = FORMALITY_MARKERS.english;
  }
});

// =============================================================================
// 🔧 기술 용어 사전
// =============================================================================

export const TECHNICAL_TERMS: Record<SupportedLanguage, TechnicalTermDictionary> = {
  korean: {
    domains: {
      'web_development': ['웹개발', '프론트엔드', '백엔드', 'html', 'css', 'javascript', '자바스크립트', 'react', '리액트'],
      'mobile_development': ['앱개발', '모바일', 'android', '안드로이드', 'ios', '아이오에스'],
      'data_science': ['데이터분석', '머신러닝', '인공지능', 'ai', 'python', '파이썬'],
      'devops': ['데브옵스', '배포', '클라우드', 'docker', '도커', 'kubernetes'],
      'cybersecurity': ['보안', '사이버보안', '해킹', '방화벽', '암호화'],
      'artificial_intelligence': ['인공지능', 'AI', '딥러닝', '머신러닝', '신경망']
    },
    localizations: {
      'development': '개발',
      'programming': '프로그래밍',
      'software': '소프트웨어',
      'hardware': '하드웨어',
      'database': '데이터베이스',
      'algorithm': '알고리즘'
    },
    difficulty: {
      'basic': 'beginner',
      'intermediate': 'intermediate',
      'advanced': 'advanced'
    }
  },
  
  english: {
    domains: {
      'web_development': ['html', 'css', 'javascript', 'react', 'vue', 'angular', 'frontend', 'backend'],
      'mobile_development': ['android', 'ios', 'flutter', 'react native', 'swift', 'kotlin'],
      'data_science': ['python', 'pandas', 'numpy', 'machine learning', 'ai', 'data analysis'],
      'devops': ['docker', 'kubernetes', 'aws', 'cloud', 'ci/cd', 'deployment'],
      'cybersecurity': ['security', 'encryption', 'firewall', 'penetration testing', 'vulnerability'],
      'artificial_intelligence': ['ai', 'machine learning', 'deep learning', 'neural networks', 'nlp']
    },
    localizations: {},
    difficulty: {
      'beginner': 'beginner',
      'intermediate': 'intermediate', 
      'advanced': 'advanced'
    }
  },
  
  japanese: {
    domains: {
      'web_development': ['ウェブ開発', 'フロントエンド', 'バックエンド', 'html', 'css', 'javascript'],
      'mobile_development': ['アプリ開発', 'モバイル', 'android', 'ios'],
      'data_science': ['データ分析', '機械学習', '人工知能', 'ai', 'python'],
      'devops': ['デブオプス', 'デプロイ', 'クラウド', 'docker'],
      'cybersecurity': ['セキュリティ', 'サイバーセキュリティ', '暗号化'],
      'artificial_intelligence': ['人工知能', 'AI', 'ディープラーニング', '機械学習']
    },
    localizations: {
      'development': '開発',
      'programming': 'プログラミング',
      'software': 'ソフトウェア',
      'database': 'データベース'
    },
    difficulty: {
      'basic': 'beginner',
      'intermediate': 'intermediate',
      'advanced': 'advanced'
    }
  }
};

// 나머지 언어들에 대한 기본 기술 용어 (영어 기반)
[
  'chinese', 'spanish', 'french', 'german', 'italian', 'portuguese', 'russian',
  'arabic', 'hindi', 'thai', 'vietnamese', 'unknown'
].forEach(lang => {
  if (!TECHNICAL_TERMS[lang as SupportedLanguage]) {
    TECHNICAL_TERMS[lang as SupportedLanguage] = TECHNICAL_TERMS.english;
  }
});

// =============================================================================
// 🚀 유틸리티 함수들
// =============================================================================

/**
 * 지원되는 언어인지 확인
 */
export function isSupportedLanguage(code: string): code is SupportedLanguage {
  return MULTILINGUAL_CONFIG.supportedLanguages.includes(code as SupportedLanguage);
}

/**
 * 언어 메타데이터 가져오기
 */
export function getLanguageMetadata(language: SupportedLanguage) {
  return LANGUAGE_METADATA_MAP[language] || LANGUAGE_METADATA_MAP.unknown;
}

/**
 * 문화적 컨텍스트 가져오기
 */
export function getCulturalContext(language: SupportedLanguage): CulturalContext {
  return CULTURAL_CONTEXTS[language] || CULTURAL_CONTEXTS.unknown;
}

/**
 * 언어별 패턴 가져오기
 */
export function getLanguagePatterns(language: SupportedLanguage): Map<PatternCategory, RegExp[]> {
  return LANGUAGE_PATTERNS[language] || LANGUAGE_PATTERNS.english;
}

/**
 * 정중함 마커 가져오기
 */
export function getFormalityMarkers(language: SupportedLanguage): FormalityMarker[] {
  return FORMALITY_MARKERS[language] || FORMALITY_MARKERS.english;
}

/**
 * 기술 용어 사전 가져오기
 */
export function getTechnicalTerms(language: SupportedLanguage): TechnicalTermDictionary {
  return TECHNICAL_TERMS[language] || TECHNICAL_TERMS.english;
}

/**
 * ISO 코드로 언어 찾기
 */
export function findLanguageByISO(iso: string): SupportedLanguage | null {
  for (const [lang, metadata] of Object.entries(LANGUAGE_METADATA_MAP)) {
    if (metadata.iso639_1 === iso || metadata.iso639_2 === iso) {
      return lang as SupportedLanguage;
    }
  }
  return null;
}

/**
 * 지역별 언어 목록 가져오기
 */
export function getLanguagesByRegion(region: string): SupportedLanguage[] {
  return Object.entries(LANGUAGE_METADATA_MAP)
    .filter(([_, metadata]) => metadata.region.includes(region))
    .map(([lang, _]) => lang as SupportedLanguage);
}

/**
 * 언어 난이도별 분류
 */
export function getLanguagesByDifficulty(difficulty: 'easy' | 'medium' | 'hard' | 'very_hard'): SupportedLanguage[] {
  return Object.entries(LANGUAGE_METADATA_MAP)
    .filter(([_, metadata]) => metadata.difficulty === difficulty)
    .map(([lang, _]) => lang as SupportedLanguage);
}

/**
 * RTL 언어 목록
 */
export function getRTLLanguages(): SupportedLanguage[] {
  return Object.entries(LANGUAGE_METADATA_MAP)
    .filter(([_, metadata]) => metadata.rtl)
    .map(([lang, _]) => lang as SupportedLanguage);
}

/**
 * 문화적 차원 점수로 언어 분류
 */
export function getLanguagesByCulturalDimension(
  dimension: keyof Pick<CulturalContext, 'collectivismScore' | 'powerDistanceScore' | 'uncertaintyAvoidanceScore' | 'contextDependency'>,
  threshold: number,
  above: boolean = true
): SupportedLanguage[] {
  return Object.entries(CULTURAL_CONTEXTS)
    .filter(([_, context]) => {
      const score = context[dimension];
      return above ? score >= threshold : score < threshold;
    })
    .map(([lang, _]) => lang as SupportedLanguage);
}

/**
 * 언어별 사용자 수 순위
 */
export function getLanguagesByPopularity(): Array<{ language: SupportedLanguage; speakers: number }> {
  return Object.entries(LANGUAGE_METADATA_MAP)
    .map(([lang, metadata]) => ({ language: lang as SupportedLanguage, speakers: metadata.speakers }))
    .sort((a, b) => b.speakers - a.speakers);
}

/**
 * 스크립트별 언어 그룹
 */
export function getLanguagesByScript(script: string): SupportedLanguage[] {
  return Object.entries(LANGUAGE_METADATA_MAP)
    .filter(([_, metadata]) => metadata.script === script)
    .map(([lang, _]) => lang as SupportedLanguage);
}

/**
 * 문화적 적응 필요성 평가
 */
export function assessCulturalAdaptationNeed(
  sourceLanguage: SupportedLanguage,
  targetLanguage: SupportedLanguage
): {
  adaptationNeeded: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
  differences: Array<{
    dimension: string;
    sourcValue: number;
    targetValue: number;
    gap: number;
  }>;
} {
  const sourceContext = getCulturalContext(sourceLanguage);
  const targetContext = getCulturalContext(targetLanguage);
  
  const differences = [
    {
      dimension: 'collectivism',
      sourceValue: sourceContext.collectivismScore,
      targetValue: targetContext.collectivismScore,
      gap: Math.abs(sourceContext.collectivismScore - targetContext.collectivismScore)
    },
    {
      dimension: 'powerDistance',
      sourceValue: sourceContext.powerDistanceScore,
      targetValue: targetContext.powerDistanceScore,
      gap: Math.abs(sourceContext.powerDistanceScore - targetContext.powerDistanceScore)
    },
    {
      dimension: 'contextDependency',
      sourceValue: sourceContext.contextDependency,
      targetValue: targetContext.contextDependency,
      gap: Math.abs(sourceContext.contextDependency - targetContext.contextDependency)
    }
  ];
  
  const maxGap = Math.max(...differences.map(d => d.gap));
  const avgGap = differences.reduce((sum, d) => sum + d.gap, 0) / differences.length;
  
  let priority: 'low' | 'medium' | 'high' | 'critical' = 'low';
  let adaptationNeeded = false;
  
  if (maxGap > 50 || avgGap > 30) {
    priority = 'critical';
    adaptationNeeded = true;
  } else if (maxGap > 30 || avgGap > 20) {
    priority = 'high';
    adaptationNeeded = true;
  } else if (maxGap > 20 || avgGap > 15) {
    priority = 'medium';
    adaptationNeeded = true;
  } else if (maxGap > 10) {
    priority = 'low';
    adaptationNeeded = true;
  }
  
  return {
    adaptationNeeded,
    priority,
    differences
  };
}

/**
 * 언어 감지를 위한 휴리스틱 함수들
 */
export const LANGUAGE_DETECTION_HELPERS = {
  /**
   * 문자 스크립트 기반 언어 추정
   */
  detectByScript(text: string): SupportedLanguage[] {
    const candidates: SupportedLanguage[] = [];
    
    // 한글
    if (/[가-힣]/.test(text)) candidates.push('korean');
    
    // 일본어 (히라가나, 가타카나)
    if (/[ひらがなカタカナ]/.test(text)) candidates.push('japanese');
    
    // 중국어 (한자)
    if (/[一-龯]/.test(text)) candidates.push('chinese');
    
    // 아랍어
    if (/[\u0600-\u06FF]/.test(text)) candidates.push('arabic');
    
    // 히브리어
    if (/[\u0590-\u05FF]/.test(text)) candidates.push('hebrew');
    
    // 태국어
    if (/[\u0E00-\u0E7F]/.test(text)) candidates.push('thai');
    
    // 러시아어 (키릴 문자)
    if (/[а-яё]/i.test(text)) candidates.push('russian');
    
    // 힌디어/데바나가리
    if (/[\u0900-\u097F]/.test(text)) candidates.push('hindi');
    
    // 라틴 문자 기반 언어들
    if (/[a-zA-Z]/.test(text)) {
      // 특수 문자로 구분
      if (/[ñáéíóúü]/i.test(text)) candidates.push('spanish');
      if (/[àâäçéèêëïîôùûüÿ]/i.test(text)) candidates.push('french');
      if (/[äöüß]/i.test(text)) candidates.push('german');
      if (/[àèéìíîòóù]/i.test(text)) candidates.push('italian');
      if (/[ãáàâçéêíóôõú]/i.test(text)) candidates.push('portuguese');
      
      // 기본적으로 영어 후보에 추가
      candidates.push('english');
    }
    
    return candidates;
  },
  
  /**
   * 키워드 기반 언어 추정
   */
  detectByKeywords(text: string): Array<{ language: SupportedLanguage; confidence: number }> {
    const lowerText = text.toLowerCase();
    const results: Array<{ language: SupportedLanguage; confidence: number }> = [];
    
    // 언어별 특징적 키워드
    const keywordPatterns = {
      korean: {
        keywords: ['는', '이', '가', '을', '를', '에', '에서', '으로', '와', '과', '입니다', '합니다'],
        weight: 0.9
      },
      japanese: {
        keywords: ['は', 'が', 'を', 'に', 'で', 'と', 'から', 'まで', 'です', 'ます', 'した'],
        weight: 0.9
      },
      chinese: {
        keywords: ['的', '是', '在', '有', '我', '你', '他', '她', '这', '那', '了', '吗'],
        weight: 0.8
      },
      english: {
        keywords: ['the', 'is', 'are', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'with'],
        weight: 0.7
      },
      spanish: {
        keywords: ['el', 'la', 'es', 'son', 'y', 'o', 'pero', 'en', 'de', 'para', 'con', 'que'],
        weight: 0.7
      },
      french: {
        keywords: ['le', 'la', 'est', 'sont', 'et', 'ou', 'mais', 'dans', 'de', 'pour', 'avec', 'que'],
        weight: 0.7
      },
      german: {
        keywords: ['der', 'die', 'das', 'ist', 'sind', 'und', 'oder', 'aber', 'in', 'von', 'für', 'mit'],
        weight: 0.7
      }
    };
    
    for (const [lang, pattern] of Object.entries(keywordPatterns)) {
      const matchCount = pattern.keywords.reduce((count, keyword) => {
        const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
        return count + (lowerText.match(regex) || []).length;
      }, 0);
      
      if (matchCount > 0) {
        const confidence = Math.min(0.9, (matchCount / pattern.keywords.length) * pattern.weight);
        results.push({ 
          language: lang as SupportedLanguage, 
          confidence 
        });
      }
    }
    
    return results.sort((a, b) => b.confidence - a.confidence);
  },
  
  /**
   * 문장 구조 기반 언어 추정
   */
  detectBySentenceStructure(text: string): Array<{ language: SupportedLanguage; confidence: number }> {
    const results: Array<{ language: SupportedLanguage; confidence: number }> = [];
    
    // SOV (Subject-Object-Verb) 언어들 - 한국어, 일본어
    if (/\S+\s+\S+\s+(습니다|합니다|입니다|했습니다|다|요)$/m.test(text)) {
      results.push({ language: 'korean', confidence: 0.8 });
    }
    
    if (/\S+\s+\S+\s+(です|ます|した|だ|である)$/m.test(text)) {
      results.push({ language: 'japanese', confidence: 0.8 });
    }
    
    // SVO (Subject-Verb-Object) 언어들 - 영어, 중국어, 스페인어 등
    // 영어 특유의 패턴
    if (/\b(I|you|he|she|it|we|they)\s+(am|is|are|was|were|have|has|had|will|would|can|could|should|shall)\b/i.test(text)) {
      results.push({ language: 'english', confidence: 0.7 });
    }
    
    return results;
  }
};

/**
 * 다국어 WebAuthn 메시지 생성
 */
export function getWebAuthnMessages(language: SupportedLanguage): {
  registration: Record<string, string>;
  authentication: Record<string, string>;
  errors: Record<string, string>;
} {
  const messages = {
    korean: {
      registration: {
        title: '생체 인증 등록',
        description: '기기의 생체 인증을 사용하여 안전하게 계정을 등록하세요.',
        button: '등록하기',
        success: '생체 인증 등록이 완료되었습니다.',
        instructions: '브라우저의 지시에 따라 생체 정보를 등록해주세요.'
      },
      authentication: {
        title: '생체 인증',
        description: '등록된 생체 인증으로 로그인하세요.',
        button: '인증하기',
        success: '인증이 완료되었습니다.',
        instructions: '등록된 생체 정보로 인증을 진행해주세요.'
      },
      errors: {
        not_supported: '이 기기에서는 생체 인증을 지원하지 않습니다.',
        permission_denied: '생체 인증 권한이 거부되었습니다.',
        not_enrolled: '기기에 생체 정보가 등록되지 않았습니다.',
        security_error: '보안 오류가 발생했습니다.',
        network_error: '네트워크 연결을 확인해주세요.',
        timeout: '인증 시간이 초과되었습니다.',
        unknown_error: '알 수 없는 오류가 발생했습니다.'
      }
    },
    english: {
      registration: {
        title: 'Biometric Registration',
        description: 'Register your account securely using biometric authentication.',
        button: 'Register',
        success: 'Biometric registration completed successfully.',
        instructions: 'Follow your browser\'s instructions to register your biometric data.'
      },
      authentication: {
        title: 'Biometric Authentication',
        description: 'Sign in using your registered biometric authentication.',
        button: 'Authenticate',
        success: 'Authentication completed successfully.',
        instructions: 'Use your registered biometric data to authenticate.'
      },
      errors: {
        not_supported: 'Biometric authentication is not supported on this device.',
        permission_denied: 'Permission for biometric authentication was denied.',
        not_enrolled: 'No biometric data is enrolled on this device.',
        security_error: 'A security error occurred.',
        network_error: 'Please check your network connection.',
        timeout: 'Authentication timed out.',
        unknown_error: 'An unknown error occurred.'
      }
    },
    japanese: {
      registration: {
        title: '生体認証登録',
        description: '生体認証を使用してアカウントを安全に登録してください。',
        button: '登録',
        success: '生体認証の登録が完了しました。',
        instructions: 'ブラウザの指示に従って生体情報を登録してください。'
      },
      authentication: {
        title: '生体認証',
        description: '登録された生体認証でサインインしてください。',
        button: '認証',
        success: '認証が完了しました。',
        instructions: '登録された生体情報を使用して認証してください。'
      },
      errors: {
        not_supported: 'このデバイスでは生体認証がサポートされていません。',
        permission_denied: '生体認証の許可が拒否されました。',
        not_enrolled: 'このデバイスに生体情報が登録されていません。',
        security_error: 'セキュリティエラーが発生しました。',
        network_error: 'ネットワーク接続をご確認ください。',
        timeout: '認証がタイムアウトしました。',
        unknown_error: '不明なエラーが発生しました。'
      }
    }
  };
  
  return messages[language] || messages.english;
}

/**
 * 다국어 설정 검증
 */
export function validateMultilingualConfig(): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // 필수 언어 확인
  const requiredLanguages: SupportedLanguage[] = ['english', 'korean', 'unknown'];
  for (const lang of requiredLanguages) {
    if (!MULTILINGUAL_CONFIG.supportedLanguages.includes(lang)) {
      errors.push(`Required language missing: ${lang}`);
    }
  }
  
  // 기본 언어 확인
  if (!isSupportedLanguage(MULTILINGUAL_CONFIG.defaultLanguage)) {
    errors.push(`Default language not supported: ${MULTILINGUAL_CONFIG.defaultLanguage}`);
  }
  
  // 폴백 언어 확인
  if (!isSupportedLanguage(MULTILINGUAL_CONFIG.fallbackLanguage)) {
    errors.push(`Fallback language not supported: ${MULTILINGUAL_CONFIG.fallbackLanguage}`);
  }
  
  // 메타데이터 일관성 확인
  for (const lang of MULTILINGUAL_CONFIG.supportedLanguages) {
    if (!LANGUAGE_METADATA_MAP[lang]) {
      warnings.push(`Missing metadata for language: ${lang}`);
    }
    
    if (!CULTURAL_CONTEXTS[lang]) {
      warnings.push(`Missing cultural context for language: ${lang}`);
    }
    
    if (!LANGUAGE_PATTERNS[lang]) {
      warnings.push(`Missing language patterns for language: ${lang}`);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

// =============================================================================
// 🚀 기본 export
// =============================================================================

export default {
  config: MULTILINGUAL_CONFIG,
  detection: LANGUAGE_DETECTION_CONFIG,
  adaptation: CULTURAL_ADAPTATION_CONFIG,
  metadata: LANGUAGE_METADATA_MAP,
  contexts: CULTURAL_CONTEXTS,
  patterns: LANGUAGE_PATTERNS,
  formality: FORMALITY_MARKERS,
  technical: TECHNICAL_TERMS,
  helpers: LANGUAGE_DETECTION_HELPERS,
  utils: {
    isSupportedLanguage,
    getLanguageMetadata,
    getCulturalContext,
    getLanguagePatterns,
    getFormalityMarkers,
    getTechnicalTerms,
    findLanguageByISO,
    getLanguagesByRegion,
    getLanguagesByDifficulty,
    getRTLLanguages,
    getLanguagesByCulturalDimension,
    getLanguagesByPopularity,
    getLanguagesByScript,
    assessCulturalAdaptationNeed,
    getWebAuthnMessages,
    validateMultilingualConfig
  }
};