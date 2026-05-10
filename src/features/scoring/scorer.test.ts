// scorer 점수 합산·임계값 테스트
import { describe, it, expect } from 'vitest'
import type { Business } from '@/types/domain'
import { scoreCluster, HIGH_THRESHOLD, MID_THRESHOLD } from './scorer'
import type { SignalDef } from './types'

function biz(over: Partial<Business> = {}): Business {
  return {
    bizNo: 'X',
    bizNoMasked: '999-XX-00000',
    bizName: '데모',
    repName: '김철수',
    repNameMasked: '김OO',
    address: '부산 동래구 가상로 11',
    addressNormalized: '부산 동래구 가상로 11',
    openDate: '2024-01-01',
    status: 'active',
    industry: '식자재 도소매',
    ...over,
  }
}

function fixedSignal(weight: number, level: SignalDef['level'] = 'A'): SignalDef {
  return {
    id: `FX_${weight}`,
    name: 'FX',
    description: 'fixture',
    weight,
    level,
    evaluate: () => ({
      id: `FX_${weight}`,
      level,
      weight,
      text: `fx ${weight}`,
      observation: '',
    }),
  }
}

describe('scoreCluster', () => {
  it('발화 신호 없으면 score 0 / level low', () => {
    const result = scoreCluster({ members: [biz()], bids: [] }, [])
    expect(result.score).toBe(0)
    expect(result.level).toBe('low')
    expect(result.reasons).toHaveLength(0)
  })

  it('weight 누적', () => {
    const result = scoreCluster(
      { members: [biz()], bids: [] },
      [fixedSignal(20), fixedSignal(15)],
    )
    expect(result.score).toBe(35)
    expect(result.reasons).toHaveLength(2)
  })

  it('100 클램프', () => {
    const result = scoreCluster(
      { members: [biz()], bids: [] },
      [fixedSignal(70), fixedSignal(70)],
    )
    expect(result.score).toBe(100)
  })

  it(`HIGH_THRESHOLD(${HIGH_THRESHOLD}) 경계 → high`, () => {
    const result = scoreCluster(
      { members: [biz()], bids: [] },
      [fixedSignal(HIGH_THRESHOLD)],
    )
    expect(result.level).toBe('high')
  })

  it(`MID_THRESHOLD(${MID_THRESHOLD}) 경계 → mid`, () => {
    const result = scoreCluster(
      { members: [biz()], bids: [] },
      [fixedSignal(MID_THRESHOLD)],
    )
    expect(result.level).toBe('mid')
  })

  it(`MID_THRESHOLD-1 → low`, () => {
    const result = scoreCluster(
      { members: [biz()], bids: [] },
      [fixedSignal(MID_THRESHOLD - 1)],
    )
    expect(result.level).toBe('low')
  })

  it('null 반환 신호는 score 에 미포함', () => {
    const nullSig: SignalDef = {
      id: 'NULL',
      name: 'null',
      description: '',
      weight: 50,
      level: 'A',
      evaluate: () => null,
    }
    const result = scoreCluster(
      { members: [biz()], bids: [] },
      [nullSig, fixedSignal(20)],
    )
    expect(result.score).toBe(20)
    expect(result.reasons).toHaveLength(1)
  })
})
