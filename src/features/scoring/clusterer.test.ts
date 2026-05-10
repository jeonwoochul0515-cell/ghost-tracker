// clusterer Union-Find 그룹화 테스트
import { describe, it, expect } from 'vitest'
import type { Business } from '@/types/domain'
import { clusterBusinesses } from './clusterer'

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

describe('clusterBusinesses', () => {
  it('같은 정규화 주소 → 한 그룹 (대표자명 다르게)', () => {
    const list = [
      biz({ bizNo: 'A', addressNormalized: '주소A', repName: '오민재' }),
      biz({ bizNo: 'B', addressNormalized: '주소A', repName: '한지원' }),
      biz({ bizNo: 'C', addressNormalized: '주소B', repName: '백시아' }),
    ]
    const groups = clusterBusinesses(list)
    expect(groups.length).toBe(2)
    const merged = groups.find((g) => g.length === 2)
    expect(merged?.map((b) => b.bizNo).sort()).toEqual(['A', 'B'])
  })

  it('화이트리스트 주소는 1차/3차 단계에서 제외 (대표자명·업종 다른 케이스)', () => {
    const list = [
      biz({
        bizNo: 'A',
        repName: '오민재',
        addressNormalized: '도매시장',
        industry: '음식점',
      }),
      biz({
        bizNo: 'B',
        repName: '한지원',
        addressNormalized: '도매시장',
        industry: '음식점',
      }),
      biz({
        bizNo: 'C',
        repName: '백시아',
        addressNormalized: '도매시장',
        industry: '음식점',
      }),
    ]
    const groups = clusterBusinesses(list, {
      whitelist: new Set(['도매시장']),
    })
    expect(groups.length).toBe(3) // 모두 분리
  })

  it('같은 식자재 업종 + 동일 대표자 → 한 그룹', () => {
    const list = [
      biz({ bizNo: 'A', repName: '오민재', addressNormalized: 'X' }),
      biz({ bizNo: 'B', repName: '오민재', addressNormalized: 'Y' }),
    ]
    const groups = clusterBusinesses(list)
    expect(groups.length).toBe(1)
    expect(groups[0].length).toBe(2)
  })

  it('업종이 다르면 대표자 동일해도 별도 그룹', () => {
    const list = [
      biz({
        bizNo: 'A',
        repName: '오민재',
        addressNormalized: 'X',
        industry: '식자재 도소매',
      }),
      biz({
        bizNo: 'B',
        repName: '오민재',
        addressNormalized: 'Y',
        industry: '음식점',
      }),
    ]
    const groups = clusterBusinesses(list)
    expect(groups.length).toBe(2)
  })

  it('같은 성씨 + 같은 구·군 3명 → 가족 추정 그룹화', () => {
    const list = [
      biz({
        bizNo: 'A',
        repName: '한도윤',
        addressNormalized: '부산 동래구 가상로 22',
      }),
      biz({
        bizNo: 'B',
        repName: '한지원',
        addressNormalized: '부산 동래구 가상로 24',
      }),
      biz({
        bizNo: 'C',
        repName: '한현빈',
        addressNormalized: '부산 동래구 가상로 26',
      }),
    ]
    const groups = clusterBusinesses(list)
    expect(groups.length).toBe(1)
    expect(groups[0].length).toBe(3)
  })

  it('단일 사업자도 그룹으로 반환', () => {
    const list = [biz({ bizNo: 'A', addressNormalized: 'unique' })]
    const groups = clusterBusinesses(list)
    expect(groups.length).toBe(1)
    expect(groups[0]).toHaveLength(1)
  })
})
