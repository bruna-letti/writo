'use client'

import { FeedbackResult } from '@/lib/claude'
import LevelBadge from './LevelBadge'
import { CheckCircle, AlertCircle, Lightbulb, TrendingUp } from 'lucide-react'

export default function FeedbackDisplay({ feedback }: { feedback: FeedbackResult }) {
  const typeLabel: Record<string, string> = {
    grammar: 'Grammar',
    spelling: 'Spelling',
    phrasing: 'Phrasing',
    vocabulary: 'Vocabulary',
  }

  const typeColor: Record<string, string> = {
    grammar: 'border-l-amber-400 bg-amber-50',
    spelling: 'border-l-red-400 bg-red-50',
    phrasing: 'border-l-blue-400 bg-blue-50',
    vocabulary: 'border-l-violet-400 bg-violet-50',
  }

  return (
    <div className="space-y-5">
      {/* Overall feedback */}
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <p className="text-slate-700 leading-relaxed">{feedback.overall}</p>
        <div className="mt-3 flex items-center gap-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-slate-400" />
            <span className="text-sm text-slate-500">Level estimate:</span>
            <LevelBadge level={feedback.estimated_level} size="sm" />
          </div>
          <div className="h-4 w-px bg-slate-200" />
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-24 rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 transition-all"
                style={{ width: `${feedback.score}%` }}
              />
            </div>
            <span className="text-sm font-medium text-slate-600">{feedback.score}/100</span>
          </div>
        </div>
        {feedback.level_note && (
          <p className="mt-2 text-xs text-slate-400 italic">{feedback.level_note}</p>
        )}
      </div>

      {/* Corrections */}
      {feedback.corrections.length > 0 && (
        <div>
          <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-slate-600 uppercase tracking-wide">
            <AlertCircle className="h-4 w-4" />
            Corrections
          </h3>
          <div className="space-y-2">
            {feedback.corrections.map((c, i) => (
              <div key={i} className={`border-l-4 rounded-r-lg p-3 ${typeColor[c.type] ?? 'border-l-slate-300 bg-slate-50'}`}>
                <div className="flex flex-wrap items-baseline gap-2 mb-1">
                  <span className="text-xs font-medium uppercase tracking-wide opacity-60">{typeLabel[c.type]}</span>
                  <span className="line-through text-red-600 font-mono text-sm">{c.original}</span>
                  <span className="text-slate-400">→</span>
                  <span className="text-green-700 font-mono text-sm font-medium">{c.corrected}</span>
                </div>
                <p className="text-sm text-slate-600">{c.explanation}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Positive notes */}
      {feedback.positive_notes.length > 0 && (
        <div>
          <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-slate-600 uppercase tracking-wide">
            <CheckCircle className="h-4 w-4 text-green-500" />
            What you did well
          </h3>
          <ul className="space-y-1">
            {feedback.positive_notes.map((note, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                <span className="mt-0.5 text-green-500">✓</span>
                {note}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Suggestions */}
      {feedback.suggestions.length > 0 && (
        <div>
          <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-slate-600 uppercase tracking-wide">
            <Lightbulb className="h-4 w-4 text-amber-500" />
            Suggestions
          </h3>
          <ul className="space-y-1">
            {feedback.suggestions.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                <span className="mt-0.5 text-amber-500">→</span>
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
