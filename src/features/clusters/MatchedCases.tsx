// 매칭 판례 섹션 — 패턴 유사 top 3 카드
import { Link } from 'react-router-dom'
import type { Cluster, CourtCase } from '@/types/domain'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { matchCases } from './matching'

interface MatchedCasesProps {
  cluster: Cluster
  cases: CourtCase[]
}

const VERDICT_VARIANT: Record<
  CourtCase['verdict'],
  'high' | 'mid' | 'low' | 'neutral'
> = {
  유죄: 'high',
  일부유죄: 'mid',
  무죄: 'low',
}

export function MatchedCases({ cluster, cases }: MatchedCasesProps) {
  const matched = matchCases(cluster, cases)

  if (matched.length === 0) {
    return (
      <p className="text-ink-faint font-mono text-xs">
        패턴이 일치하는 판례가 아직 없습니다.
      </p>
    )
  }

  return (
    <div className="space-y-4">
      <p className="text-ink-dim text-sm leading-relaxed max-w-2xl">
        이 클러스터의 패턴은 다음 판례와 유사합니다. 다만 각 판례는 별도 사실관계에서
        형사 책임이 인정·부정된 사례이며, 본 클러스터에 동일한 결론을 적용한다는 의미는
        아닙니다.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {matched.map(({ case: c, score }) => (
          <Link
            key={c.id}
            to={`/cases/${encodeURIComponent(c.id)}`}
            className="block group"
          >
            <Card className="p-5 h-full flex flex-col gap-3 group-hover:bg-bg-3/50 transition-colors">
              <div className="flex items-baseline justify-between gap-2">
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-dim">
                  {c.id}
                </span>
                <Badge variant={VERDICT_VARIANT[c.verdict]}>{c.verdict}</Badge>
              </div>
              <p className="text-sm text-ink leading-relaxed flex-1">{c.summary}</p>
              <div className="flex items-baseline justify-between text-xs">
                <span className="text-ink-faint">{c.court}</span>
                <span className="font-mono text-accent">유사도 {score}</span>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
