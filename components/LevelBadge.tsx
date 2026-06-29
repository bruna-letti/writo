import { CefrLevel, CEFR_DESCRIPTIONS } from '@/lib/languages'

const levelColors: Record<CefrLevel, string> = {
  A1: 'bg-slate-100 text-slate-600 border-slate-200',
  A2: 'bg-blue-50 text-blue-600 border-blue-200',
  B1: 'bg-teal-50 text-teal-700 border-teal-200',
  B2: 'bg-violet-50 text-violet-700 border-violet-200',
  C1: 'bg-amber-50 text-amber-700 border-amber-200',
  C2: 'bg-rose-50 text-rose-700 border-rose-200',
}

export default function LevelBadge({
  level,
  showDescription = false,
  size = 'md',
}: {
  level: CefrLevel
  showDescription?: boolean
  size?: 'sm' | 'md' | 'lg'
}) {
  const sizeClass = size === 'sm' ? 'text-xs px-2 py-0.5' : size === 'lg' ? 'text-base px-4 py-1.5 font-bold' : 'text-sm px-3 py-1'

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border font-semibold ${levelColors[level]} ${sizeClass}`}>
      {level}
      {showDescription && (
        <span className="font-normal opacity-70">· {CEFR_DESCRIPTIONS[level]}</span>
      )}
    </span>
  )
}
