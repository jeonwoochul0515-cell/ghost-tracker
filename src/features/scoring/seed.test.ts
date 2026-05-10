// 시드 데이터에 엔진 적용 — 기대 등급 범위 내 산출 sanity check
import { describe, it, expect } from 'vitest'
import { clustersSeed } from '@/lib/seed/clusters'
import { bidsSeed } from '@/lib/seed/bids'
import { scoreCluster } from './scorer'

function contextFromSeed(clusterId: string) {
  const cluster = clustersSeed.find((c) => c.id === clusterId)
  if (!cluster) throw new Error(`seed cluster ${clusterId} not found`)
  const memberSet = new Set(cluster.members.map((m) => m.bizNo))
  const bids = bidsSeed.filter((b) =>
    b.participants.some((p) => memberSet.has(p)),
  )
  return {
    cluster,
    ctx: {
      members: cluster.members,
      bids,
      marketStats: { expectedWinRate: 0.15 },
    },
  }
}

describe('scoring on seed data', () => {
  it('BSN-2026-0001 (시드 high) → 엔진에서도 high', () => {
    const { ctx } = contextFromSeed('BSN-2026-0001')
    const result = scoreCluster(ctx)
    expect(result.level).toBe('high')
    expect(result.reasons.length).toBeGreaterThanOrEqual(2)
  })

  it('BSN-2026-0002 (시드 high, 폐업회전) → high 또는 mid', () => {
    const { ctx } = contextFromSeed('BSN-2026-0002')
    const result = scoreCluster(ctx)
    expect(['high', 'mid']).toContain(result.level)
  })

  it('BSN-2026-0012 (시드 low, 단일 멤버) → high 등급은 아님', () => {
    const { ctx } = contextFromSeed('BSN-2026-0012')
    const result = scoreCluster(ctx)
    expect(result.level).not.toBe('high')
  })
})
