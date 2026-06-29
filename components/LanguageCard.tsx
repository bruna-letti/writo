import Link from 'next/link'
import { LANGUAGES, LanguageCode, CEFR_DESCRIPTIONS } from '@/lib/languages'
import LevelBadge from './LevelBadge'
import { CefrLevel } from '@/lib/languages'
import { Flame, BookOpen } from 'lucide-react'

type Props = {
  code: LanguageCode
  level: CefrLevel
  streak: number
  totalSubmissions: number
  doneToday: boolean
}

export default function LanguageCard({ code, level, streak, totalSubmissions, doneToday }: Props) {
  const lang = LANGUAGES[code]

  return (
    <Link href={`/${code}`} className="group block">
      <div className={`relative overflow-hidden rounded-2xl border-2 bg-white transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 ${doneToday ? 'border-[#2D5652]/30' : 'border-[#0C2C47]/5'}`}>
        {/* Color header */}
        <div className={`bg-gradient-to-br ${lang.gradient} p-5 pb-8`}>
          <div className="flex items-start justify-between">
            <div>
              <span className="text-3xl">{lang.flag}</span>
              <h2 className={`mt-2 text-xl font-bold ${lang.headerText}`}>{lang.name}</h2>
              <p className={`text-sm ${lang.headerTextSoft}`}>{lang.nativeName}</p>
            </div>
            <div className="text-right">
              <div className={`text-3xl font-black ${lang.headerTextFaint} group-hover:opacity-80 transition-opacity`}>
                {lang.persona[0]}
              </div>
              <p className={`text-xs font-medium ${lang.headerTextSoft} mt-1`}>with {lang.persona}</p>
            </div>
          </div>
        </div>

        {/* Stats section */}
        <div className="px-5 py-4 -mt-3">
          <div className={`${lang.bgLight} rounded-xl p-3 flex items-center justify-between`}>
            <LevelBadge level={level} showDescription />
            {streak > 0 && (
              <div className="flex items-center gap-1 text-sm font-semibold text-[#E2A54D]">
                <Flame className="h-4 w-4" />
                {streak}
              </div>
            )}
          </div>
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-sm text-[#0C2C47]/40">
              <BookOpen className="h-4 w-4" />
              {totalSubmissions} {totalSubmissions === 1 ? 'entry' : 'entries'}
            </div>
            {doneToday ? (
              <span className="text-xs font-medium text-[#2D5652] bg-[#E4F2EA] px-2.5 py-1 rounded-full">
                ✓ Done today
              </span>
            ) : (
              <span className="text-xs font-medium text-[#0C2C47]/60 bg-[#0C2C47]/5 px-2.5 py-1 rounded-full group-hover:bg-[#0C2C47]/10 transition-colors">
                Practice →
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
