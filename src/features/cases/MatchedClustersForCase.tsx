// 판례 → 매칭 클러스터 카드 3개
import { Link } from 'react-router-dom'
import type { Cluster, CourtCase } from '@/types/domain'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { matchClustersForCase } from './matchClusters'
import { formatRatio } from '@/lib/format'

interface MatchedClustersForCaseProps {
  c: CourtCase
  clusters: Cluster[]
}

const RISK_LABEL: Record<Cluster['riskLevel'], string> = {
  high: '고위험',
  mid: '중간',
  low: '관찰',
}

export function MatchedClustersForCase({
  c,
  clusters,
}: MatchedClustersForCaseProps) {
  const matched = matchClustersForCase(c, clusters)

  if (matched.length === 0) {
    return (
      <p className="text-ink-faint font-mono text-xs">
        패턴이 일치하는 클러스터가 아직 없습니다.
      </p>
    )
  }

  return (
    <div className="space-y-4">
      <p className="text-ink-dim text-sm leading-relaxed max-w-2xl">
        이 판례의 패턴(
        {c.pattern.method})은 우리 데이터의 다음 클러스터에서도 관측됩니다.
        다만 본 매칭은 통계적 유사성일 뿐, 위법 단정은 아닙니다.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {matched.map(({ cluster, score }) => (
          <Link
            key={cluster.id}
            to={`/clusters/${cluster.id}`}
            className="block group"
          >
            <Card className="p-5 h-full flex flex-col gap-3 group-hover:bg-bg-3/50 transition-colors">
              <div className="flex items-baseline justify-between gap-2">
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-dim">
                  {cluster.id}
                </span>
                <Badge
                  variant={
                    cluster.riskLevel === 'high'
                      ? 'high'
                      : cluster.riskLevel === 'mid'
                        ? 'mid'
                        : 'low'
                  }
                >
                  {RISK_LABEL[cluster.riskLevel]}
                </Badge>
              </div>
              <p className="text-sm text-ink leading-relaxed flex-1">
                {cluster.title}
              </p>
              <div className="flex items-baseline justify-between text-xs pt-2 border-t border-line/50">
                <span className="text-ink-faint">
                  {cluster.district} · {formatRatio(cluster.stats.multiplier)}
                </span>
                <span className="font-mono text-accent">유사도 {score}</span>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
