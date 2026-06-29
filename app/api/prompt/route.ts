import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { generatePrompt } from '@/lib/claude'
import { getLanguage, LanguageCode } from '@/lib/languages'
import { getBrasiliaDate } from '@/lib/date'

export async function GET(request: NextRequest) {
  const lang = request.nextUrl.searchParams.get('lang') as LanguageCode
  if (!getLanguage(lang)) {
    return NextResponse.json({ error: 'Invalid language' }, { status: 400 })
  }

  try {
    const supabase = createServiceClient()
    const today = getBrasiliaDate()

    // Return existing prompt if already generated today
    const { data: existing } = await supabase
      .from('prompts')
      .select('*')
      .eq('language', lang)
      .eq('date', today)
      .single()

    if (existing) return NextResponse.json(existing)

    // Get current level
    const { data: progress } = await supabase
      .from('language_progress')
      .select('cefr_level')
      .eq('language', lang)
      .single()

    const cefrLevel = progress?.cefr_level ?? 'A1'

    // Get recent prompt types to avoid repetition
    const { data: recentPrompts } = await supabase
      .from('prompts')
      .select('prompt_type')
      .eq('language', lang)
      .order('date', { ascending: false })
      .limit(5)

    const recentTypes = (recentPrompts ?? []).map((p: { prompt_type: string }) => p.prompt_type)

    const generated = await generatePrompt(lang, cefrLevel, recentTypes)

    const { data: inserted, error } = await supabase
      .from('prompts')
      .insert({
        language: lang,
        date: today,
        prompt_text: generated.prompt_text,
        prompt_type: generated.prompt_type,
        target_words: generated.target_words ?? null,
        instructions: generated.instructions ?? null,
        difficulty: cefrLevel,
      })
      .select()
      .single()

    if (error) {
      console.error('Failed to insert prompt:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json(inserted)
  } catch (err) {
    console.error('Failed to generate prompt:', err)
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
