import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { getLanguage } from '@/lib/languages'

export async function GET(request: NextRequest) {
  const lang = request.nextUrl.searchParams.get('lang')
  const page = parseInt(request.nextUrl.searchParams.get('page') ?? '1')
  const limit = 10
  const offset = (page - 1) * limit

  if (!lang || !getLanguage(lang)) {
    return NextResponse.json({ error: 'Invalid language' }, { status: 400 })
  }

  const supabase = createServiceClient()

  const { data, error, count } = await supabase
    .from('submissions')
    .select(
      `
      id, user_text, feedback, estimated_level, score, created_at,
      prompts (id, prompt_text, prompt_type, date, target_words)
    `,
      { count: 'exact' }
    )
    .eq('language', lang)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ submissions: data, total: count, page, limit })
}
