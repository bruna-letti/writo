import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { getFeedback, assessLevel } from '@/lib/claude'
import { getLanguage, CefrLevel, LanguageCode } from '@/lib/languages'
import { getBrasiliaDate } from '@/lib/date'

export async function POST(request: NextRequest) {
  const { prompt_id, lang, user_text } = await request.json()

  if (!prompt_id || !lang || !user_text?.trim()) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const language = getLanguage(lang)
  if (!language) return NextResponse.json({ error: 'Invalid language' }, { status: 400 })

  try {
    const supabase = createServiceClient()

    // Get prompt and current level
    const [{ data: prompt }, { data: progress }] = await Promise.all([
      supabase.from('prompts').select('*').eq('id', prompt_id).single(),
      supabase.from('language_progress').select('*').eq('language', lang).single(),
    ])

    if (!prompt) return NextResponse.json({ error: 'Prompt not found' }, { status: 404 })

    const cefrLevel = (progress?.cefr_level ?? 'A1') as CefrLevel

    // Get feedback from Claude
    const feedback = await getFeedback(lang as LanguageCode, cefrLevel, prompt.prompt_text, user_text)

    // Save submission
    const { data: submission, error: subError } = await supabase
      .from('submissions')
      .insert({
        prompt_id,
        language: lang,
        user_text,
        feedback,
        estimated_level: feedback.estimated_level,
        score: feedback.score,
      })
      .select()
      .single()

    if (subError) {
      console.error('Failed to save submission:', subError)
      return NextResponse.json({ error: subError.message }, { status: 500 })
    }

    // Update submission count and streak (Brasilia day boundary, matching prompt generation)
    const today = getBrasiliaDate()
    const lastDate = progress?.last_submission_date
    const isConsecutive =
      lastDate &&
      new Date(today).getTime() - new Date(lastDate).getTime() === 86400000

    await supabase
      .from('language_progress')
      .update({
        total_submissions: (progress?.total_submissions ?? 0) + 1,
        current_streak: isConsecutive ? (progress?.current_streak ?? 0) + 1 : 1,
        last_submission_date: today,
        updated_at: new Date().toISOString(),
      })
      .eq('language', lang)

    // Check if level should be updated (every 5 submissions). This is a nice-to-have
    // on top of an already-successful submission, so a failure here must not take
    // down the response — the user should still see their feedback either way.
    let levelUpdate = null
    const totalSubs = (progress?.total_submissions ?? 0) + 1
    if (totalSubs % 5 === 0) {
      try {
        const { data: recent } = await supabase
          .from('submissions')
          .select('score, estimated_level')
          .eq('language', lang)
          .order('created_at', { ascending: false })
          .limit(10)

        if (recent && recent.length >= 5) {
          const scores = recent.map((s: { score: number }) => s.score)
          const estimates = recent.map((s: { estimated_level: CefrLevel }) => s.estimated_level)
          const assessment = await assessLevel(lang as LanguageCode, scores, estimates, cefrLevel)

          if (assessment) {
            await supabase
              .from('language_progress')
              .update({ cefr_level: assessment.newLevel })
              .eq('language', lang)

            await supabase.from('level_history').insert({
              language: lang,
              from_level: cefrLevel,
              to_level: assessment.newLevel,
              reason: assessment.reason,
            })

            levelUpdate = assessment
          }
        }
      } catch (err) {
        console.error('Level assessment failed (non-fatal):', err)
      }
    }

    return NextResponse.json({ submission, feedback, levelUpdate })
  } catch (err) {
    console.error('Failed to process submission:', err)
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
