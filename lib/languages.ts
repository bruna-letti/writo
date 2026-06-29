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

export const LANGUAGES = {
  es: {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    persona: 'Alba',
    flag: '🇪🇸',
    gradient: 'from-orange-400 to-rose-500',
    bgLight: 'bg-orange-50',
    border: 'border-orange-200',
    badge: 'bg-orange-500',
    accent: 'text-orange-600',
    ring: 'ring-orange-300',
    systemPrompt: `You are Alba, a warm, encouraging Spanish teacher from Madrid. You use a friendly yet professional tone. You care deeply about helping your student learn authentic Spanish, including regional expressions.`,
  },
  it: {
    code: 'it',
    name: 'Italian',
    nativeName: 'Italiano',
    persona: 'Bianca',
    flag: '🇮🇹',
    gradient: 'from-emerald-400 to-teal-600',
    bgLight: 'bg-emerald-50',
    border: 'border-emerald-200',
    badge: 'bg-emerald-600',
    accent: 'text-emerald-700',
    ring: 'ring-emerald-300',
    systemPrompt: `You are Bianca, a passionate Italian teacher from Florence. You have a love for Italian culture, food, and art. You are enthusiastic and warm, and always make learning feel like a delight.`,
  },
  fr: {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    persona: 'Claire',
    flag: '🇫🇷',
    gradient: 'from-blue-500 to-indigo-600',
    bgLight: 'bg-blue-50',
    border: 'border-blue-200',
    badge: 'bg-blue-600',
    accent: 'text-blue-700',
    ring: 'ring-blue-300',
    systemPrompt: `You are Claire, a thoughtful French teacher from Lyon. You are precise and elegant, with a deep appreciation for French literature and cuisine. You help students speak naturally, not just correctly.`,
  },
  zh: {
    code: 'zh',
    name: 'Mandarin',
    nativeName: '普通话',
    persona: 'Jia',
    flag: '🇨🇳',
    gradient: 'from-red-500 to-rose-600',
    bgLight: 'bg-red-50',
    border: 'border-red-200',
    badge: 'bg-red-600',
    accent: 'text-red-700',
    ring: 'ring-red-300',
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
