export const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const
export type CefrLevel = typeof CEFR_LEVELS[number]

export const CEFR_DESCRIPTIONS: Record<CefrLevel, string> = {
  A1: 'Beginner',
  A2: 'Elementary',
  B1: 'Intermediate',
  B2: 'Upper Intermediate',
  C1: 'Advanced',
  C2: 'Mastery',
}

export const BRAND = {
  navy: '#0C2C47',
  green: '#2D5652',
  yellow: '#E2A54D',
  aqua: '#97D3CD',
  pink: '#EFEAE6',
  mint: '#E4F2EA',
}

export const LANGUAGES = {
  es: {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    persona: 'Alba',
    flag: '🇪🇸',
    gradient: 'from-[#E2A54D] to-[#E2A54D]/75',
    headerText: 'text-[#0C2C47]',
    headerTextSoft: 'text-[#0C2C47]/70',
    headerTextFaint: 'text-[#0C2C47]/15',
    headerChip: 'bg-[#0C2C47]/10',
    bgLight: 'bg-[#EFEAE6]',
    systemPrompt: `You are Alba, a warm, encouraging Spanish teacher from Madrid. You use a friendly yet professional tone. You care deeply about helping your student learn authentic Spanish, including regional expressions.`,
  },
  it: {
    code: 'it',
    name: 'Italian',
    nativeName: 'Italiano',
    persona: 'Bianca',
    flag: '🇮🇹',
    gradient: 'from-[#2D5652] to-[#2D5652]/75',
    headerText: 'text-white',
    headerTextSoft: 'text-white/70',
    headerTextFaint: 'text-white/20',
    headerChip: 'bg-white/20',
    bgLight: 'bg-[#E4F2EA]',
    systemPrompt: `You are Bianca, a passionate Italian teacher from Florence. You have a love for Italian culture, food, and art. You are enthusiastic and warm, and always make learning feel like a delight.`,
  },
  fr: {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    persona: 'Claire',
    flag: '🇫🇷',
    gradient: 'from-[#0C2C47] to-[#0C2C47]/75',
    headerText: 'text-white',
    headerTextSoft: 'text-white/70',
    headerTextFaint: 'text-white/20',
    headerChip: 'bg-white/20',
    bgLight: 'bg-[#EFEAE6]',
    systemPrompt: `You are Claire, a thoughtful French teacher from Lyon. You are precise and elegant, with a deep appreciation for French literature and cuisine. You help students speak naturally, not just correctly.`,
  },
  zh: {
    code: 'zh',
    name: 'Mandarin',
    nativeName: '普通话',
    persona: 'Jia',
    flag: '🇨🇳',
    gradient: 'from-[#97D3CD] to-[#97D3CD]/75',
    headerText: 'text-[#0C2C47]',
    headerTextSoft: 'text-[#0C2C47]/70',
    headerTextFaint: 'text-[#0C2C47]/15',
    headerChip: 'bg-[#0C2C47]/10',
    bgLight: 'bg-[#E4F2EA]',
    systemPrompt: `You are Jia (嘉), a patient and insightful Mandarin teacher from Beijing. You understand the challenges non-native speakers face and guide them gently through tones, characters, and grammar with clarity and warmth.`,
  },
} as const

export type LanguageCode = keyof typeof LANGUAGES
export const LANGUAGE_CODES = Object.keys(LANGUAGES) as LanguageCode[]

export function getLanguage(code: string) {
  if (code in LANGUAGES) return LANGUAGES[code as LanguageCode]
  return null
}

export function cefrToScore(level: CefrLevel): number {
  const map: Record<CefrLevel, number> = { A1: 1, A2: 2, B1: 3, B2: 4, C1: 5, C2: 6 }
  return map[level]
}

export function scoreToCefr(score: number): CefrLevel {
  if (score <= 15) return 'A1'
  if (score <= 30) return 'A2'
  if (score <= 50) return 'B1'
  if (score <= 65) return 'B2'
  if (score <= 80) return 'C1'
  return 'C2'
}
