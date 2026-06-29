import { CefrLevel, CEFR_DESCRIPTIONS } from '@/lib/languages'

const levelColors: Record<CefrLevel, string> = {
  A1: 'bg-[#EFEAE6] text-[#0C2C47]/70 border-[#0C2C47]/10',
  A2: 'bg-[#97D3CD]/20 text-[#0C2C47] border-[#97D3CD]/50',
  B1: 'bg-[#E4F2EA] text-[#2D5652] border-[#2D5652]/20',
  B2: 'bg-[#E2A54D]/20 text-[#0C2C47] border-[#E2A54D]/50',
  C1: 'bg-[#2D5652]/10 text-[#2D5652] border-[#2D5652]/30',
  C2: 'bg-[#0C2C47]/10 text-[#0C2C47] border-[#0C2C47]/30',
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
