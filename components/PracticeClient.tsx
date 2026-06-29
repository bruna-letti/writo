'use client'

import { useState, useEffect, useCallback } from 'react'
import { CefrLevel } from '@/lib/languages'
import { FeedbackResult } from '@/lib/claude'
import FeedbackDisplay from './FeedbackDisplay'
import LevelBadge from './LevelBadge'
import { Send, RefreshCw, Sparkles, ArrowUpCircle } from 'lucide-react'

type Prompt = {
  id: string
  prompt_text: string
  prompt_type: string
  target_words?: string[]
  instructions?: string
  difficulty: CefrLevel
}

type Props = {
  langCode: string
  cefrLevel: CefrLevel
  totalSubmissions: number
}

export default function PracticeClient({ langCode, cefrLevel, totalSubmissions }: Props) {
  const [prompt, setPrompt] = useState<Prompt | null>(null)
  const [loadingPrompt, setLoadingPrompt] = useState(true)
  const [text, setText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [feedback, setFeedback] = useState<FeedbackResult | null>(null)
  const [levelUpdate, setLevelUpdate] = useState<{ newLevel: CefrLevel; reason: string } | null>(null)
  const [alreadyDone, setAlreadyDone] = useState(false)
  const [currentLevel, setCurrentLevel] = useState<CefrLevel>(cefrLevel)

  const fetchPrompt = useCallback(async () => {
    setLoadingPrompt(true)
    try {
      const res = await fetch(`/api/prompt?lang=${langCode}`)
      const data = await res.json()
      setPrompt(data)
    } finally {
      setLoadingPrompt(false)
    }
  }, [langCode])

  useEffect(() => {
    fetchPrompt()
  }, [fetchPrompt])

  // Check if already submitted today
  useEffect(() => {
    async function checkToday() {
      const res = await fetch(`/api/history?lang=${langCode}&page=1`)
      const data = await res.json()
      if (data.submissions?.length > 0) {
        const latest = data.submissions[0]
        const latestDate = new Date(latest.created_at).toDateString()
        if (latestDate === new Date().toDateString()) {
          setAlreadyDone(true)
          setFeedback(latest.feedback)
          setText(latest.user_text)
        }
      }
    }
    checkToday()
  }, [langCode])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!prompt || !text.trim()) return
    setSubmitting(true)

    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt_id: prompt.id, lang: langCode, user_text: text }),
      })
      const data = await res.json()
      setFeedback(data.feedback)
      setAlreadyDone(true)
      if (data.levelUpdate) {
        setLevelUpdate(data.levelUpdate)
        setCurrentLevel(data.levelUpdate.newLevel)
      }
    } finally {
      setSubmitting(false)
    }
  }

  const promptTypeLabel: Record<string, string> = {
    free_write: 'Free Writing',
    sentence_building: 'Sentence Building',
    describe: 'Description',
    dialogue: 'Dialogue',
    opinion: 'Opinion',
    story_start: 'Story',
    cultural: 'Cultural',
  }

  if (loadingPrompt) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <div className="h-8 w-8 rounded-full border-2 border-slate-300 border-t-slate-700 animate-spin" />
        <p className="text-sm text-slate-400">Preparing today's prompt…</p>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Level update banner */}
      {levelUpdate && (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <ArrowUpCircle className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold text-amber-800">Level up!</p>
            <p className="text-sm text-amber-700 mt-0.5">
              You've been promoted to <strong>{levelUpdate.newLevel}</strong>. {levelUpdate.reason}
            </p>
          </div>
        </div>
      )}

      {/* Prompt card */}
      {prompt && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-slate-400" />
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Today's prompt · {promptTypeLabel[prompt.prompt_type] ?? prompt.prompt_type}
              </span>
            </div>
            <LevelBadge level={prompt.difficulty} size="sm" />
          </div>

          <p className="text-slate-800 text-base leading-relaxed font-medium">{prompt.prompt_text}</p>

          {prompt.target_words && prompt.target_words.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {prompt.target_words.map((word) => (
                <span
                  key={word}
                  className="rounded-lg bg-slate-100 px-2.5 py-1 text-sm font-mono text-slate-700"
                >
                  {word}
                </span>
              ))}
            </div>
          )}

          {prompt.instructions && (
            <p className="mt-2 text-sm text-slate-500 italic">{prompt.instructions}</p>
          )}
        </div>
      )}

      {/* Writing area */}
      {!alreadyDone ? (
        <form onSubmit={handleSubmit} className="space-y-3">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write your response here…"
            rows={7}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-slate-300 transition resize-none shadow-sm"
          />
          <button
            type="submit"
            disabled={submitting || !text.trim()}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50 transition"
          >
            {submitting ? (
              <>
                <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                Getting feedback…
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Submit for feedback
              </>
            )}
          </button>
        </form>
      ) : (
        <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">Your writing</p>
          <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{text}</p>
          <p className="mt-3 text-xs text-slate-400">
            Come back tomorrow for a new prompt.
          </p>
        </div>
      )}

      {/* Feedback */}
      {feedback && (
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 mb-3">Feedback</h2>
          <FeedbackDisplay feedback={feedback} />
        </div>
      )}
    </div>
  )
}
