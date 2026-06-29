'use client'

import { useState, useEffect } from 'react'
import { CefrLevel } from '@/lib/languages'
import { FeedbackResult } from '@/lib/claude'
import LevelBadge from './LevelBadge'
import FeedbackDisplay from './FeedbackDisplay'
import { format } from 'date-fns'
import { ChevronDown, ChevronUp } from 'lucide-react'

type Submission = {
  id: string
  user_text: string
  feedback: FeedbackResult
  estimated_level: CefrLevel
  score: number
  created_at: string
  prompts: {
    id: string
    prompt_text: string
    prompt_type: string
    date: string
    target_words?: string[]
  }
}

export default function HistoryClient({ langCode }: { langCode: string }) {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const res = await fetch(`/api/history?lang=${langCode}&page=${page}`)
      const data = await res.json()
      setSubmissions(data.submissions ?? [])
      setTotal(data.total ?? 0)
      setLoading(false)
    }
    load()
  }, [langCode, page])

  const promptTypeLabel: Record<string, string> = {
    free_write: 'Free Writing',
    sentence_building: 'Sentence Building',
    describe: 'Description',
    dialogue: 'Dialogue',
    opinion: 'Opinion',
    story_start: 'Story',
    cultural: 'Cultural',
  }

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="h-6 w-6 rounded-full border-2 border-slate-200 border-t-slate-500 animate-spin" />
      </div>
    )
  }

  if (submissions.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
        <p className="text-slate-400">No submissions yet. Start practicing!</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
        Submissions ({total})
      </h2>

      {submissions.map((sub) => {
        const isOpen = expanded === sub.id
        return (
          <div key={sub.id} className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
            {/* Header row */}
            <button
              onClick={() => setExpanded(isOpen ? null : sub.id)}
              className="w-full flex items-start gap-3 p-4 text-left hover:bg-slate-50 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-xs font-medium text-slate-400">
                    {format(new Date(sub.created_at), 'MMM d, yyyy')}
                  </span>
                  <span className="text-slate-200">·</span>
                  <span className="text-xs text-slate-400">
                    {promptTypeLabel[sub.prompts?.prompt_type] ?? sub.prompts?.prompt_type}
                  </span>
                  <LevelBadge level={sub.estimated_level} size="sm" />
                  <span className="text-xs text-slate-400">{sub.score}/100</span>
                </div>
                <p className="text-sm text-slate-600 font-medium truncate">
                  {sub.prompts?.prompt_text}
                </p>
                <p className="text-sm text-slate-500 truncate mt-0.5">{sub.user_text}</p>
              </div>
              <div className="shrink-0 text-slate-300 mt-1">
                {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </div>
            </button>

            {/* Expanded content */}
            {isOpen && (
              <div className="border-t border-slate-100 p-4 space-y-4">
                {/* Their writing */}
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">Your writing</p>
                  <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed bg-slate-50 rounded-xl p-3">
                    {sub.user_text}
                  </p>
                </div>
                {/* Target words if any */}
                {sub.prompts?.target_words && sub.prompts.target_words.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {sub.prompts.target_words.map((w) => (
                      <span key={w} className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-mono text-slate-600">
                        {w}
                      </span>
                    ))}
                  </div>
                )}
                {/* Feedback */}
                {sub.feedback && <FeedbackDisplay feedback={sub.feedback} />}
              </div>
            )}
          </div>
        )
      })}

      {/* Pagination */}
      {total > 10 && (
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="text-sm text-slate-500 hover:text-slate-800 disabled:opacity-30 transition"
          >
            ← Older
          </button>
          <span className="text-xs text-slate-400">Page {page}</span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={page * 10 >= total}
            className="text-sm text-slate-500 hover:text-slate-800 disabled:opacity-30 transition"
          >
            Newer →
          </button>
        </div>
      )}
    </div>
  )
}
