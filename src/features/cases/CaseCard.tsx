// 판례 카드 — ID·법원·결과 + 1줄 요약 + 패턴 태그 + 형량/추징 + 외부 링크
import { Link } from 'react-router-dom'
import type { CourtCase } from '@/types/domain'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { patternBadgeText } from './classify'

interface CaseCardProps {
  c: CourtCase
}

const VERDICT_VARIANT: Record<
  CourtCase['verdict'],
  'high' | 'mid' | 'low' | 'neutral'
> = {
  유죄: 'high',
  일부유죄: 'mid',
  무죄: 'low',
}

export function CaseCard({ c }: CaseCardProps) {
  const tags = patternBadgeText(c)

  return (
    <Card className="p-6 flex flex-col gap-4 h-full">
      <div className="flex items-baseline justify-between gap-3 flex-wrap">
        <Link
          to={`/cases/${encodeURIComponent(c.id)}`}
          className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink hover:text-accent transition-colors"
        >
          {c.id}
        </Link>
        <Badge variant={VERDICT_VARIANT[c.verdict]}>{c.verdict}</Badge>
      </div>
      <Link to={`/cases/${encodeURIComponent(c.id)}`} className="block group">
        <p className="font-display italic font-black text-lg leading-snug text-ink group-hover:text-accent transition-colors">
          {c.summary}
        </p>
      </Link>
      <ul className="flex flex-wrap gap-1.5">
        {tags.map((t, i) => (
          <li
            key={i}
            className="font-mono text-[10px] uppercase tracking-[0.15em] px-1.5 py-0.5 border border-line text-ink-dim"
          >
            {t}
          </li>
        ))}
      </ul>
      <div className="mt-auto pt-3 border-t border-line/50 flex items-baseline justify-between gap-3 text-xs">
        <span className="text-ink-faint font-mono">
          {c.court} · {c.date}
        </span>
        <span className="text-ink-dim text-right">{c.sentence}</span>
      </div>
      {c.fullTextUrl && (
        <a
          href={c.fullTextUrl}
          target="_blank"
          rel="noreferrer noopener"
          className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-dim hover:text-accent transition-colors"
        >
          판결문 외부 링크 ↗
        </a>
      )}
    </Card>
  )
}
