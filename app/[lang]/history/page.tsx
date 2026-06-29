export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import { getLanguage, CefrLevel } from '@/lib/languages'
import { createServiceClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import LevelBadge from '@/components/LevelBadge'
import { FeedbackResult } from '@/lib/claude'
import { format } from 'date-fns'
import HistoryClient from '@/components/HistoryClient'

export default async function HistoryPage({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  const language = getLanguage(lang)
  if (!language) notFound()

  const supabase = createServiceClient()

  const [{ data: progress }, { data: levelHistory }] = await Promise.all([
    supabase.from('language_progress').select('*').eq('language', lang).single(),
    supabase
      .from('level_history')
      .select('*')
      .eq('language', lang)
      .order('changed_at', { ascending: false })
      .limit(10),
  ])

  return (
    <div className="min-h-screen">
      <header className={`bg-gradient-to-r ${language.gradient} text-white`}>
        <div className="max-w-2xl mx-auto px-4 py-5">
          <div className="flex items-center justify-between mb-4">
            <Link
              href={`/${lang}`}
              className="flex items-center gap-1.5 text-sm text-white/70 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Practice
            </Link>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">{language.flag}</span>
                <h1 className="text-2xl font-black">{language.name} — History</h1>
              </div>
              <p className="text-white/70 text-sm">
                {progress?.total_submissions ?? 0} total entries
              </p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl px-3 py-2 text-center">
              <div className="text-xs text-white/70 mb-0.5">Level</div>
              <div className="text-2xl font-black">{progress?.cefr_level ?? 'A1'}</div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Level progression */}
        {levelHistory && levelHistory.length > 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400 mb-3">Level history</h2>
            <div className="space-y-2">
              {levelHistory.map((entry: { id: string; from_level: CefrLevel | null; to_level: CefrLevel; reason: string; changed_at: string }) => (
                <div key={entry.id} className="flex items-start gap-3 text-sm">
                  <div className="flex items-center gap-1.5 shrink-0">
                    {entry.from_level && (
                      <>
                        <LevelBadge level={entry.from_level} size="sm" />
                        <span className="text-slate-300">→</span>
                      </>
                    )}
                    <LevelBadge level={entry.to_level} size="sm" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-slate-600 truncate">{entry.reason}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {format(new Date(entry.changed_at), 'MMM d, yyyy')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Submissions list */}
        <HistoryClient langCode={lang} />
      </main>
    </div>
  )
}
