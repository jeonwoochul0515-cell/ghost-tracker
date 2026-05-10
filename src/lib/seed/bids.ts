// 시드 응찰·낙찰 24개월 — mulberry32 PRNG 로 결정적 생성.
// 클러스터 멤버 + filler 사업자 60명을 mix 하여 자연스러운 응찰자 pool.
import type { Bid } from '@/types/domain'
import { clustersSeed } from './clusters'
import { schoolsSeed } from './schools'

function mulberry32(seed: number): () => number {
  let s = seed >>> 0
  return () => {
    s = (s + 0x6d2b79f5) >>> 0
    let t = s
    t = Math.imul(t ^ (t >>> 15), 1 | t)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const CATEGORIES = ['채소', '육류', '수산', '공산품', '과일'] as const

// filler 응찰자 60명 (가짜 999800XX)
const FILLER_BIZNOS = Array.from(
  { length: 60 },
  (_, i) => `999800${i.toString().padStart(4, '0')}`,
)

function generateBids(): Bid[] {
  const rng = mulberry32(42)
  const bids: Bid[] = []
  const startYear = 2024
  const startMonth = 5 // 2024-05
  let bidIndex = 1

  for (let monthOffset = 0; monthOffset < 24; monthOffset++) {
    const date = new Date(startYear, startMonth - 1 + monthOffset, 1)
    const ym = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`

    for (const cluster of clustersSeed) {
      const monthlyBids = 1 + Math.floor(rng() * 3)
      for (let i = 0; i < monthlyBids; i++) {
        const day = 1 + Math.floor(rng() * 27)
        const bidDate = `${ym}-${day.toString().padStart(2, '0')}`
        const announceDay = Math.min(day + 3, 28)
        const announceDate = `${ym}-${announceDay.toString().padStart(2, '0')}`

        const school = schoolsSeed[Math.floor(rng() * schoolsSeed.length)]
        const category = CATEGORIES[Math.floor(rng() * CATEGORIES.length)]
        const estimatedPrice =
          Math.round((5_000_000 + rng() * 35_000_000) / 1000) * 1000

        const memberPool = cluster.members
        const memberCount = 1 + Math.floor(rng() * Math.min(2, memberPool.length))
        const members: string[] = []
        for (let j = 0; j < memberCount; j++) {
          const m = memberPool[Math.floor(rng() * memberPool.length)]
          if (!members.includes(m.bizNo)) members.push(m.bizNo)
        }

        const fillerCount = 2 + Math.floor(rng() * 3)
        const fillers: string[] = []
        for (let j = 0; j < fillerCount; j++) {
          const f = FILLER_BIZNOS[Math.floor(rng() * FILLER_BIZNOS.length)]
          if (!fillers.includes(f) && !members.includes(f)) fillers.push(f)
        }

        const participants = [...members, ...fillers]
        const winChance =
          cluster.riskLevel === 'high'
            ? 0.42
            : cluster.riskLevel === 'mid'
              ? 0.28
              : 0.16
        const winnerBizNo =
          rng() < winChance
            ? members[0]
            : participants[Math.floor(rng() * participants.length)]

        bids.push({
          bidId: `BID-${bidIndex.toString().padStart(6, '0')}`,
          schoolCode: school.code,
          schoolName: school.name,
          district: school.district,
          bidDate,
          announceDate,
          category,
          estimatedPrice,
          winnerBizNo,
          participants,
        })
        bidIndex++
      }
    }
  }
  return bids
}

export const bidsSeed: Bid[] = generateBids()
