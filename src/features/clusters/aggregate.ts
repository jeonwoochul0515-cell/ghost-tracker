// 클러스터 단위 집계 유틸 — 멤버별 wins/bids, 24개월 monthly 버킷
import type { Bid, Cluster } from '@/types/domain'

export interface MemberStats {
  bizNo: string
  bids: number
  wins: number
}

export interface MonthBucket {
  month: string                  // 'YYYY-MM'
  bids: number
  wins: number
}

export function aggregateMembers(bids: Bid[], cluster: Cluster): MemberStats[] {
  const memberSet = new Set(cluster.members.map((m) => m.bizNo))
  const map = new Map<string, MemberStats>()
  for (const m of cluster.members) {
    map.set(m.bizNo, { bizNo: m.bizNo, bids: 0, wins: 0 })
  }
  for (const bid of bids) {
    for (const p of bid.participants) {
      if (memberSet.has(p)) {
        const s = map.get(p)
        if (s) s.bids++
      }
    }
    if (bid.winnerBizNo && memberSet.has(bid.winnerBizNo)) {
      const s = map.get(bid.winnerBizNo)
      if (s) s.wins++
    }
  }
  return cluster.members.map((m) => map.get(m.bizNo)!)
}

export function aggregateMonthly(
  bids: Bid[],
  cluster: Cluster,
  months = 24,
): MonthBucket[] {
  const memberSet = new Set(cluster.members.map((m) => m.bizNo))
  const start = new Date(cluster.period.from)
  const buckets: MonthBucket[] = []
  for (let i = 0; i < months; i++) {
    const d = new Date(start.getFullYear(), start.getMonth() + i, 1)
    buckets.push({
      month: `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`,
      bids: 0,
      wins: 0,
    })
  }
  const idx = new Map(buckets.map((b, i) => [b.month, i]))
  for (const bid of bids) {
    const ym = bid.bidDate.slice(0, 7)
    const i = idx.get(ym)
    if (i === undefined) continue
    const involved = bid.participants.some((p) => memberSet.has(p))
    if (!involved) continue
    buckets[i].bids++
    if (bid.winnerBizNo && memberSet.has(bid.winnerBizNo)) {
      buckets[i].wins++
    }
  }
  return buckets
}
