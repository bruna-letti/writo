export const dynamic = 'force-dynamic'

import { createServiceClient } from '@/lib/supabase/server'
import { LANGUAGE_CODES, LANGUAGES, CefrLevel } from '@/lib/languages'
import LanguageCard from '@/components/LanguageCard'
import LogoutButton from '@/components/LogoutButton'
import { formatInTimeZone } from 'date-fns-tz'

type LanguageProgress = {
  language: string
  cefr_level: CefrLevel
  total_submissions: number
  current_streak: number
  last_submission_date: string | null
}

async function getProgress() {
  const supabase = createServiceClient()
  const today = formatInTimeZone(new Date(), 'America/Sao_Paulo', 'yyyy-MM-dd')

  const [{ data: progress }, { data: todaySubmissions }] = await Promise.all([
    supabase.from('language_progress').select('*').in('language', LANGUAGE_CODES),
    supabase.from('submissions').select('language').gte('created_at', `${today}T00:00:00`),
  ])

  const progressMap = Object.fromEntries(
    ((progress as LanguageProgress[]) ?? []).map((p) => [p.language, p])
  )
  const doneTodaySet = new Set(
    ((todaySubmissions as { language: string }[]) ?? []).map((s) => s.language)
  )

  return { progressMap, doneTodaySet }
}

export default async function DashboardPage() {
  const { progressMap, doneTodaySet } = await getProgress()

  const doneCount = LANGUAGE_CODES.filter((c) => doneTodaySet.has(c)).length

  return (
    <div className="min-h-screen">
      <header className="border-b border-[#0C2C47]/10 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-[#0C2C47] tracking-tight">Writo</h1>
            <p className="text-xs text-[#0C2C47]/40">Daily language practice</p>
          </div>
          <LogoutButton />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-[#0C2C47]">
            {doneCount === LANGUAGE_CODES.length
              ? 'All done today!'
              : doneCount > 0
              ? `${doneCount} of ${LANGUAGE_CODES.length} done today`
              : "What are we writing today?"}
          </h2>
          <p className="mt-1 text-[#0C2C47]/50 text-sm">
            {doneCount === LANGUAGE_CODES.length
              ? 'Come back tomorrow for new prompts.'
              : 'Pick a language and write with your AI partner.'}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {LANGUAGE_CODES.map((code) => {
            const p = progressMap[code]
            return (
              <LanguageCard
                key={code}
                code={code}
                level={(p?.cefr_level ?? 'A1') as CefrLevel}
                streak={p?.current_streak ?? 0}
                totalSubmissions={p?.total_submissions ?? 0}
                doneToday={doneTodaySet.has(code)}
              />
            )
          })}
        </div>
      </main>
    </div>
  )
}
