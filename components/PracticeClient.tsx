'use client'

import { useState, useEffect } from 'react'
import { CefrLevel } from '@/lib/languages'
import { FeedbackResult } from '@/lib/claude'
import FeedbackDisplay from './FeedbackDisplay'
import LevelBadge from './LevelBadge'
import { Send, Sparkles, ArrowUpCircle } from 'lucide-react'

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
}

export default function PracticeClient({ langCode }: Props) {
  const [prompt, setPrompt] = useState<Prompt | null>(null)
  const [loadingPrompt, setLoadingPrompt] = useState(true)
  const [text, setText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [feedback, setFeedback] = useState<FeedbackResult | null>(null)
  const [levelUpdate, setLevelUpdate] = useState<{ newLevel: CefrLevel; reason: string } | null>(null)
  const [alreadyDone, setAlreadyDone] = useState(false)

  // Load today's prompt, then check whether it's already been answered
  // (matched by prompt id, not by date, so this is immune to timezone drift
  // between the browser and the Brasilia-time day boundary used server-side).
  useEffect(() => {
    async function init() {
      setLoadingPrompt(true)
      try {
        const promptRes = await fetch(`/api/prompt?lang=${langCode}`)
        const promptData = await promptRes.json()
        setPrompt(promptData)

        const historyRes = await fetch(`/api/history?lang=${langCode}&page=1`)
        const historyData = await historyRes.json()
        const match = historyData.submissions?.find(
          (s: { prompts?: { id: string } }) => s.prompts?.id === promptData.id
        )
        if (match) {
          setAlreadyDone(true)
          setFeedback(match.feedback)
          setText(match.user_text)
        }
      } finally {
        setLoadingPrompt(false)
      }
    }
    init()
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
        <div className="h-8 w-8 rounded-full border-2 border-[#0C2C47]/15 border-t-[#0C2C47] animate-spin" />
        <p className="text-sm text-[#0C2C47]/40">Preparing today's prompt…</p>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Level update banner */}
      {levelUpdate && (
        <div className="flex items-start gap-3 rounded-2xl border border-[#E2A54D]/40 bg-[#E2A54D]/15 p-4">
          <ArrowUpCircle className="h-5 w-5 text-[#E2A54D] mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold text-[#0C2C47]">Level up!</p>
            <p className="text-sm text-[#0C2C47]/70 mt-0.5">
              You've been promoted to <strong>{levelUpdate.newLevel}</strong>. {levelUpdate.reason}
            </p>
          </div>
        </div>
      )}

      {/* Prompt card */}
      {prompt && (
        <div className="rounded-2xl border border-[#0C2C47]/10 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#0C2C47]/30" />
              <span className="text-xs font-semibold uppercase tracking-wide text-[#0C2C47]/40">
                Today's prompt · {promptTypeLabel[prompt.prompt_type] ?? prompt.prompt_type}
              </span>
            </div>
            <LevelBadge level={prompt.difficulty} size="sm" />
          </div>

          <p className="text-[#0C2C47] text-base leading-relaxed font-medium">{prompt.prompt_text}</p>

          {prompt.target_words && prompt.target_words.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {prompt.target_words.map((word) => (
                <span
                  key={word}
                  className="rounded-lg bg-[#0C2C47]/5 px-2.5 py-1 text-sm font-mono text-[#0C2C47]/80"
                >
                  {word}
                </span>
              ))}
            </div>
          )}

          {prompt.instructions && (
            <p className="mt-2 text-sm text-[#0C2C47]/50 italic">{prompt.instructions}</p>
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
            className="w-full rounded-2xl border border-[#0C2C47]/10 bg-white px-4 py-3 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#97D3CD] transition resize-none shadow-sm"
          />
          <button
            type="submit"
            disabled={submitting || !text.trim()}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0C2C47] py-3 text-sm font-semibold text-white hover:bg-[#0C2C47]/90 disabled:opacity-50 transition"
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
        <div className="rounded-xl border border-[#0C2C47]/5 bg-[#EFEAE6]/50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#0C2C47]/40 mb-2">Your writing</p>
          <p className="text-sm text-[#0C2C47]/80 whitespace-pre-wrap leading-relaxed">{text}</p>
          <p className="mt-3 text-xs text-[#0C2C47]/40">
            Come back tomorrow for a new prompt.
          </p>
        </div>
      )}

      {/* Feedback */}
      {feedback && (
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[#0C2C47]/50 mb-3">Feedback</h2>
          <FeedbackDisplay feedback={feedback} />
        </div>
      )}
    </div>
  )
}
