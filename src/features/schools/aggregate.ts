// 학교별 입찰 집계 + 안전성 지수 + TOP 응찰자 추출
import type { Bid, Cluster } from '@/types/domain'
import { maskBizNo } from '@/lib/masking'

export interface SchoolBidStats {
  schoolCode: string
  bidCount: number              // 응찰 건수
  totalWinAmount: number        // 총 낙찰액
  avgParticipants: number       // 평균 응찰자 수
  suspectBidCount: number       // 의심 클러스터 멤버가 참여한 응찰 건수
  suspectWinCount: number       // 의심 클러스터 멤버가 낙찰한 건수
}

export function aggregateSchoolStats(
  bids: Bid[],
  schoolCode: string,
  clusters: Cluster[],
): SchoolBidStats {
  const clusterBiznos = new Set(
    clusters.flatMap((c) => c.members.map((m) => m.bizNo)),
  )
  const schoolBids = bids.filter((b) => b.schoolCode === schoolCode)
  let suspectBidCount = 0
  let suspectWinCount = 0
  let totalWinAmount = 0
  let participantsTotal = 0
  for (const bid of schoolBids) {
    if (bid.participants.some((p) => clusterBiznos.has(p))) suspectBidCount++
    if (bid.winnerBizNo && clusterBiznos.has(bid.winnerBizNo)) {
      suspectWinCount++
      totalWinAmount += bid.estimatedPrice
    }
    participantsTotal += bid.participants.length
  }
  return {
    schoolCode,
    bidCount: schoolBids.length,
    totalWinAmount,
    avgParticipants:
      schoolBids.length > 0 ? participantsTotal / schoolBids.length : 0,
    suspectBidCount,
    suspectWinCount,
  }
}

export type SafetyScore = 1 | 2 | 3 | 4 | 5

export interface SafetyResult {
  score: SafetyScore
  description: string
}

export function safetyScore(stats: SchoolBidStats): SafetyResult {
  if (stats.bidCount === 0) {
    return {
      score: 5,
      description: '관측된 입찰 데이터가 없습니다 — 추가 데이터 확보 시 재평가됩니다.',
    }
  }
  const ratio = stats.suspectBidCount / stats.bidCount
  if (ratio === 0) {
    return {
      score: 5,
      description: '의심 클러스터 응찰 사례가 관측되지 않았습니다.',
    }
  }
  if (ratio < 0.1) {
    return {
      score: 4,
      description: '의심 클러스터 응찰이 드물게 관측됩니다.',
    }
  }
  if (ratio < 0.25) {
    return {
      score: 3,
      description: '일부 응찰에 의심 클러스터가 포함됩니다.',
    }
  }
  if (ratio < 0.5) {
    return {
      score: 2,
      description: '의심 클러스터 응찰 비중이 높은 편입니다.',
    }
  }
  return {
    score: 1,
    description: '의심 클러스터 응찰 빈도가 매우 높습니다. 추가 검토가 권장됩니다.',
  }
}

export interface BidderRow {
  bizNo: string
  bizNoMasked: string
  bizName: string
  repNameMasked: string
  bids: number
  wins: number
  clusterId: string | null
}

export function topBidders(
  bids: Bid[],
  schoolCode: string,
  clusters: Cluster[],
  topN = 10,
): BidderRow[] {
  const schoolBids = bids.filter((b) => b.schoolCode === schoolCode)
  const map = new Map<string, { bids: number; wins: number }>()
  for (const bid of schoolBids) {
    for (const p of bid.participants) {
      const cur = map.get(p) ?? { bids: 0, wins: 0 }
      cur.bids++
      if (bid.winnerBizNo === p) cur.wins++
      map.set(p, cur)
    }
  }
  const memberIndex = new Map<
    string,
    { clusterId: string; bizName: string; bizNoMasked: string; repNameMasked: string }
  >()
  for (const cluster of clusters) {
    for (const m of cluster.members) {
      memberIndex.set(m.bizNo, {
        clusterId: cluster.id,
        bizName: m.bizName,
        bizNoMasked: m.bizNoMasked,
        repNameMasked: m.repNameMasked,
      })
    }
  }
  return [...map.entries()]
    .sort((a, b) => b[1].bids - a[1].bids)
    .slice(0, topN)
    .map(([bizNo, stat]) => {
      const linked = memberIndex.get(bizNo)
      return {
        bizNo,
        bizNoMasked: linked?.bizNoMasked ?? maskBizNo(bizNo),
        bizName: linked?.bizName ?? '미등록 사업자',
        repNameMasked: linked?.repNameMasked ?? '—',
        bids: stat.bids,
        wins: stat.wins,
        clusterId: linked?.clusterId ?? null,
      }
    })
}
