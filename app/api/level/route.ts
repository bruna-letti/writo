import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { LANGUAGE_CODES } from '@/lib/languages'

export async function GET() {
  const supabase = createServiceClient()

  const { data, error } = await supabase
    .from('language_progress')
    .select('*')
    .in('language', LANGUAGE_CODES)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  const { lang, level } = await request.json()
  const supabase = createServiceClient()

  const { data: current } = await supabase
    .from('language_progress')
    .select('cefr_level')
    .eq('language', lang)
    .single()

  const { error } = await supabase
    .from('language_progress')
    .update({ cefr_level: level, updated_at: new Date().toISOString() })
    .eq('language', lang)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  if (current?.cefr_level !== level) {
    await supabase.from('level_history').insert({
      language: lang,
      from_level: current?.cefr_level ?? null,
      to_level: level,
      reason: 'Manually set by user',
    })
  }

  return NextResponse.json({ ok: true })
}
