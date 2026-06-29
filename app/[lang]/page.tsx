export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import { getLanguage, CefrLevel, CEFR_DESCRIPTIONS } from '@/lib/languages'
import { createServiceClient } from '@/lib/supabase/server'
import LevelBadge from '@/components/LevelBadge'
import PracticeClient from '@/components/PracticeClient'
import Link from 'next/link'
import { ArrowLeft, History } from 'lucide-react'

export default async function LanguagePage({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  const language = getLanguage(lang)
  if (!language) notFound()

  const supabase = createServiceClient()
  const { data: progress } = await supabase
    .from('language_progress')
    .select('*')
    .eq('language', lang)
    .single()

  const cefrLevel = (progress?.cefr_level ?? 'A1') as CefrLevel

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className={`bg-gradient-to-r ${language.gradient} text-white`}>
        <div className="max-w-2xl mx-auto px-4 py-5">
          <div className="flex items-center justify-between mb-4">
            <Link
              href="/"
              className="flex items-center gap-1.5 text-sm text-white/70 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Dashboard
            </Link>
            <Link
              href={`/${lang}/history`}
              className="flex items-center gap-1.5 text-sm text-white/70 hover:text-white transition-colors"
            >
              <History className="h-4 w-4" />
              History
            </Link>
          </div>

          <div className="flex items-end justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">{language.flag}</span>
                <h1 className="text-2xl font-black">{language.name}</h1>
              </div>
              <p className="text-white/70 text-sm">with {language.persona}</p>
            </div>
            <div className="text-right">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl px-3 py-2">
                <div className="text-xs text-white/70 mb-0.5">Your level</div>
                <div className="text-xl font-black">{cefrLevel}</div>
                <div className="text-xs text-white/70">{CEFR_DESCRIPTIONS[cefrLevel]}</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Practice area */}
      <main className="max-w-2xl mx-auto px-4 py-6">
        <PracticeClient
          langCode={lang}
          cefrLevel={cefrLevel}
          totalSubmissions={progress?.total_submissions ?? 0}
        />
      </main>
    </div>
  )
}
