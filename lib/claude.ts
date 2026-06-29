import Anthropic from '@anthropic-ai/sdk'
import { CefrLevel, LANGUAGES, LanguageCode } from './languages'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export type PromptResult = {
  prompt_text: string
  prompt_type: string
  target_words?: string[]
  instructions?: string
}

export type FeedbackResult = {
  corrections: Array<{
    original: string
    corrected: string
    explanation: string
    type: 'grammar' | 'spelling' | 'phrasing' | 'vocabulary'
  }>
  suggestions: string[]
  positive_notes: string[]
  overall: string
  estimated_level: CefrLevel
  score: number
  level_note: string
}

export async function generatePrompt(
  langCode: LanguageCode,
  cefrLevel: CefrLevel,
  recentPromptTypes: string[]
): Promise<PromptResult> {
  const lang = LANGUAGES[langCode]
  const avoidTypes = recentPromptTypes.slice(0, 3).join(', ')

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 512,
    system: lang.systemPrompt,
    messages: [
      {
        role: 'user',
        content: `Generate a writing prompt for a ${cefrLevel} level ${lang.name} learner.
${avoidTypes ? `Avoid these recently used prompt types: ${avoidTypes}.` : ''}

Prompt types to choose from:
- "free_write": Write a short paragraph or text about a topic
- "sentence_building": Create sentences using specific provided words
- "describe": Describe something (a place, image, feeling, memory)
- "dialogue": Write a short dialogue between two people
- "opinion": Give your opinion on a simple topic
- "story_start": Continue a story from a given opening line
- "cultural": Write about something related to the culture of the language

Rules:
- The prompt should be engaging, culturally relevant, and appropriately challenging for ${cefrLevel}
- Keep the prompt short and clear (1-3 sentences)
- For sentence_building, provide 3-5 target words appropriate for the level
- For lower levels (A1/A2), keep topics concrete and everyday
- For higher levels (B2+), introduce abstract topics, nuance, and idioms

Respond with ONLY valid JSON (no markdown):
{
  "prompt_text": "the prompt in English",
  "prompt_type": "one of the types above",
  "target_words": ["word1", "word2"] or null,
  "instructions": "brief instruction like 'Write 3-5 sentences' or null"
}`,
      },
    ],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''
  return JSON.parse(text)
}

export async function getFeedback(
  langCode: LanguageCode,
  cefrLevel: CefrLevel,
  promptText: string,
  userText: string
): Promise<FeedbackResult> {
  const lang = LANGUAGES[langCode]

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1500,
    system: lang.systemPrompt,
    messages: [
      {
        role: 'user',
        content: `A student at ${cefrLevel} level submitted the following response to a writing prompt.

Prompt: "${promptText}"

Student's text:
"""
${userText}
"""

Provide detailed, constructive feedback. Be encouraging but honest. Identify ALL errors (grammar, spelling, word choice, unnatural phrasing). Also note what they did well.

Estimate the student's CEFR level based on this writing (A1, A2, B1, B2, C1, or C2) and give a score from 0-100.

Respond with ONLY valid JSON (no markdown):
{
  "corrections": [
    {
      "original": "the exact text with error",
      "corrected": "the corrected version",
      "explanation": "brief explanation",
      "type": "grammar" | "spelling" | "phrasing" | "vocabulary"
    }
  ],
  "suggestions": ["suggestion for improvement"],
  "positive_notes": ["something they did well"],
  "overall": "2-3 sentence overall feedback message in a warm, encouraging tone",
  "estimated_level": "A1" | "A2" | "B1" | "B2" | "C1" | "C2",
  "score": 0-100,
  "level_note": "one sentence on why you estimated this level"
}`,
      },
    ],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''
  return JSON.parse(text)
}

export async function assessLevel(
  langCode: LanguageCode,
  recentScores: number[],
  recentEstimates: CefrLevel[],
  currentLevel: CefrLevel
): Promise<{ newLevel: CefrLevel; reason: string } | null> {
  if (recentScores.length < 5) return null

  const lang = LANGUAGES[langCode]
  const avgScore = recentScores.reduce((a, b) => a + b, 0) / recentScores.length
  const estimateCounts = recentEstimates.reduce((acc, l) => {
    acc[l] = (acc[l] ?? 0) + 1
    return acc
  }, {} as Record<string, number>)
  const mostCommonEstimate = Object.entries(estimateCounts).sort((a, b) => b[1] - a[1])[0][0] as CefrLevel

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 256,
    system: lang.systemPrompt,
    messages: [
      {
        role: 'user',
        content: `Based on the last ${recentScores.length} submissions from a ${lang.name} student:
- Current assigned level: ${currentLevel}
- Average score: ${avgScore.toFixed(1)}/100
- Most common estimated level from submissions: ${mostCommonEstimate}
- All recent estimates: ${recentEstimates.join(', ')}

Should the student's level be updated? Only suggest a change if the evidence is clear and consistent.

Respond with ONLY valid JSON:
{
  "should_update": true | false,
  "new_level": "${currentLevel}" or a different CEFR level,
  "reason": "brief explanation"
}`,
      },
    ],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''
  const result = JSON.parse(text)

  if (!result.should_update || result.new_level === currentLevel) return null
  return { newLevel: result.new_level, reason: result.reason }
}
