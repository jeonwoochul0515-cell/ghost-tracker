// 의심 클러스터 응찰 이력 타임라인 — 시간순 응찰 리스트, 의심 표시
import { Link } from 'react-router-dom'
import type { Bid, Cluster } from '@/types/domain'
import { Badge } from '@/components/ui/Badge'
import { formatKRW } from '@/lib/format'

interface SchoolBidHistoryProps {
  bids: Bid[]
  clusters: Cluster[]
  limit?: number
}

interface ClusterIndex {
  clusterId: string
  clusterTitle: string
}

export function SchoolBidHistory({
  bids,
  clusters,
  limit = 30,
}: SchoolBidHistoryProps) {
  const memberToCluster = new Map<string, ClusterIndex>()
  for (const c of clusters) {
    for (const m of c.members) {
      memberToCluster.set(m.bizNo, { clusterId: c.id, clusterTitle: c.title })
    }
  }
  const sorted = [...bids].sort((a, b) =>
    a.bidDate < b.bidDate ? 1 : -1,
  ).slice(0, limit)

  if (sorted.length === 0) {
    return (
      <p className="text-ink-faint font-mono text-xs">
        응찰 이력이 없습니다.
      </p>
    )
  }

  return (
    <ol className="space-y-3">
      {sorted.map((bid) => {
        const suspectMembers = bid.participants
          .map((p) => memberToCluster.get(p))
          .filter((x): x is ClusterIndex => x !== undefined)
        const suspectClusterIds = [
          ...new Set(suspectMembers.map((m) => m.clusterId)),
        ]
        const winnerCluster = bid.winnerBizNo
          ? memberToCluster.get(bid.winnerBizNo)
          : null

        return (
          <li
            key={bid.bidId}
            className="flex items-start gap-4 py-3 border-b border-line/50"
          >
            <div className="font-mono text-xs text-ink-dim w-24 shrink-0 pt-0.5">
              {bid.bidDate}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm text-ink">{bid.category}</span>
                <span className="font-mono text-[10px] text-ink-faint">
                  추정가 {formatKRW(bid.estimatedPrice)}
                </span>
                <span className="font-mono text-[10px] text-ink-faint">
                  · 응찰 {bid.participants.length}명
                </span>
              </div>
              {suspectClusterIds.length > 0 && (
                <div className="mt-1 flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-warning">
                    의심 응찰
                  </span>
                  {suspectClusterIds.map((cid) => (
                    <Link
                      key={cid}
                      to={`/clusters/${cid}`}
                      className="font-mono text-[10px] text-accent hover:underline"
                    >
                      {cid}
                    </Link>
                  ))}
                </div>
              )}
            </div>
            <div className="text-right shrink-0">
              {winnerCluster ? (
                <Badge variant="high">의심 낙찰</Badge>
              ) : bid.winnerBizNo ? (
                <Badge variant="neutral">정상 낙찰</Badge>
              ) : (
                <span className="text-ink-faint text-xs">유찰</span>
              )}
            </div>
          </li>
        )
      })}
    </ol>
  )
}
