// 신호 12종 evaluate 정/오 케이스
import { describe, it, expect } from 'vitest'
import type { Bid, Business } from '@/types/domain'
import {
  CATEGORY_OMNIVORE,
  FAMILY_SURNAME,
  GEOGRAPHIC_MISMATCH,
  INCEPTION_CLUSTER,
  NEW_AND_BIG_WIN,
  REOPEN_AT_SAME_ADDRESS,
  SAME_ADDRESS_3PLUS,
  SAME_ADDRESS_5PLUS,
  SAME_SCHOOL_CO_BID,
  SHORT_LIVED,
  SINGLE_BUYER_DOMINANCE,
  WIN_RATE_INFLATION,
} from './signals'

function biz(over: Partial<Business> = {}): Business {
  return {
    bizNo: 'B' + Math.random().toString(36).slice(2, 9),
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

function bid(over: Partial<Bid> = {}): Bid {
  return {
    bidId: 'BID-' + Math.random().toString(36).slice(2, 9),
    schoolCode: 'PSN-001',
    schoolName: '학교',
    district: '동래구',
    bidDate: '2024-06-15',
    announceDate: '2024-06-18',
    category: '채소',
    estimatedPrice: 10_000_000,
    winnerBizNo: null,
    participants: [],
    ...over,
  }
}

describe('SAME_ADDRESS_3PLUS', () => {
  it('같은 주소 3명 → 발화', () => {
    const members = [biz(), biz(), biz()]
    expect(SAME_ADDRESS_3PLUS.evaluate({ members, bids: [] })).not.toBeNull()
  })
  it('같은 주소 2명 → null', () => {
    const members = [biz(), biz()]
    expect(SAME_ADDRESS_3PLUS.evaluate({ members, bids: [] })).toBeNull()
  })
  it('화이트리스트 주소는 카운트 제외', () => {
    const members = [biz(), biz(), biz()]
    const whitelist = new Set(['부산 동래구 가상로 11'])
    expect(
      SAME_ADDRESS_3PLUS.evaluate({ members, bids: [], whitelist }),
    ).toBeNull()
  })
})

describe('SAME_ADDRESS_5PLUS', () => {
  it('같은 주소 5명 → 발화', () => {
    const members = Array.from({ length: 5 }, () => biz())
    expect(SAME_ADDRESS_5PLUS.evaluate({ members, bids: [] })).not.toBeNull()
  })
  it('같은 주소 4명 → null', () => {
    const members = Array.from({ length: 4 }, () => biz())
    expect(SAME_ADDRESS_5PLUS.evaluate({ members, bids: [] })).toBeNull()
  })
})

describe('FAMILY_SURNAME', () => {
  it('같은 성씨 3명 → 발화', () => {
    const members = [
      biz({ repName: '김민' }),
      biz({ repName: '김철' }),
      biz({ repName: '김수' }),
    ]
    expect(FAMILY_SURNAME.evaluate({ members, bids: [] })).not.toBeNull()
  })
  it('같은 성씨 2명 → null', () => {
    const members = [
      biz({ repName: '김민' }),
      biz({ repName: '김철' }),
      biz({ repName: '박수' }),
    ]
    expect(FAMILY_SURNAME.evaluate({ members, bids: [] })).toBeNull()
  })
})

describe('INCEPTION_CLUSTER', () => {
  it('3명 60일 이내 등록 → 발화', () => {
    const members = [
      biz({ openDate: '2024-01-01' }),
      biz({ openDate: '2024-01-30' }),
      biz({ openDate: '2024-02-25' }),
    ]
    expect(INCEPTION_CLUSTER.evaluate({ members, bids: [] })).not.toBeNull()
  })
  it('3명 2년 간격 → null', () => {
    const members = [
      biz({ openDate: '2022-01-01' }),
      biz({ openDate: '2023-06-01' }),
      biz({ openDate: '2024-06-01' }),
    ]
    expect(INCEPTION_CLUSTER.evaluate({ members, bids: [] })).toBeNull()
  })
})

describe('SAME_SCHOOL_CO_BID', () => {
  it('같은 입찰에 멤버 2+ 동시 5건 → 발화', () => {
    const members = [biz({ bizNo: 'A' }), biz({ bizNo: 'B' })]
    const bids = Array.from({ length: 5 }, () =>
      bid({ participants: ['A', 'B', 'X'] }),
    )
    expect(SAME_SCHOOL_CO_BID.evaluate({ members, bids })).not.toBeNull()
  })
  it('동시 응찰 4건 → null', () => {
    const members = [biz({ bizNo: 'A' }), biz({ bizNo: 'B' })]
    const bids = Array.from({ length: 4 }, () =>
      bid({ participants: ['A', 'B', 'X'] }),
    )
    expect(SAME_SCHOOL_CO_BID.evaluate({ members, bids })).toBeNull()
  })
})

describe('WIN_RATE_INFLATION', () => {
  it('낙찰률 시장 평균의 2배+ → 발화', () => {
    const members = [biz({ bizNo: 'A' })]
    const bids = Array.from({ length: 10 }, (_, i) =>
      bid({
        participants: ['A', 'X'],
        winnerBizNo: i < 5 ? 'A' : 'X', // 50% 낙찰
      }),
    )
    expect(
      WIN_RATE_INFLATION.evaluate({
        members,
        bids,
        marketStats: { expectedWinRate: 0.2 }, // 5배
      }),
    ).not.toBeNull()
  })
  it('낙찰률 시장 평균과 비슷 → null', () => {
    const members = [biz({ bizNo: 'A' })]
    const bids = Array.from({ length: 10 }, (_, i) =>
      bid({
        participants: ['A', 'X'],
        winnerBizNo: i < 2 ? 'A' : 'X', // 20% 낙찰
      }),
    )
    expect(
      WIN_RATE_INFLATION.evaluate({
        members,
        bids,
        marketStats: { expectedWinRate: 0.2 },
      }),
    ).toBeNull()
  })
  it('marketStats 없으면 null', () => {
    expect(
      WIN_RATE_INFLATION.evaluate({ members: [biz()], bids: [] }),
    ).toBeNull()
  })
})

describe('REOPEN_AT_SAME_ADDRESS', () => {
  it('closed 후 같은 주소 active 등록 → 발화', () => {
    const members = [
      biz({
        bizNo: 'A',
        status: 'closed',
        closeDate: '2024-02-28',
        addressNormalized: '주소X',
        openDate: '2022-01-01',
      }),
      biz({
        bizNo: 'B',
        status: 'active',
        addressNormalized: '주소X',
        openDate: '2024-03-15',
      }),
    ]
    expect(
      REOPEN_AT_SAME_ADDRESS.evaluate({ members, bids: [] }),
    ).not.toBeNull()
  })
  it('다른 주소면 null', () => {
    const members = [
      biz({
        bizNo: 'A',
        status: 'closed',
        closeDate: '2024-02-28',
        addressNormalized: '주소X',
      }),
      biz({
        bizNo: 'B',
        status: 'active',
        addressNormalized: '주소Y',
        openDate: '2024-03-15',
      }),
    ]
    expect(REOPEN_AT_SAME_ADDRESS.evaluate({ members, bids: [] })).toBeNull()
  })
})

describe('NEW_AND_BIG_WIN', () => {
  it('신규 6개월 내 대형 낙찰 3회 → 발화', () => {
    const members = [biz({ bizNo: 'A', openDate: '2024-01-01' })]
    const bids = [
      bid({
        winnerBizNo: 'A',
        bidDate: '2024-02-01',
        estimatedPrice: 25_000_000,
      }),
      bid({
        winnerBizNo: 'A',
        bidDate: '2024-03-01',
        estimatedPrice: 30_000_000,
      }),
      bid({
        winnerBizNo: 'A',
        bidDate: '2024-04-01',
        estimatedPrice: 40_000_000,
      }),
    ]
    expect(NEW_AND_BIG_WIN.evaluate({ members, bids })).not.toBeNull()
  })
  it('소규모 낙찰만 → null', () => {
    const members = [biz({ bizNo: 'A', openDate: '2024-01-01' })]
    const bids = Array.from({ length: 5 }, () =>
      bid({
        winnerBizNo: 'A',
        bidDate: '2024-02-01',
        estimatedPrice: 5_000_000,
      }),
    )
    expect(NEW_AND_BIG_WIN.evaluate({ members, bids })).toBeNull()
  })
})

describe('SINGLE_BUYER_DOMINANCE', () => {
  it('단일 학교 80%+ → 발화', () => {
    const members = [biz({ bizNo: 'A' })]
    const bids = [
      ...Array.from({ length: 8 }, () =>
        bid({ winnerBizNo: 'A', schoolCode: 'PSN-001' }),
      ),
      bid({ winnerBizNo: 'A', schoolCode: 'PSN-002' }),
    ]
    expect(SINGLE_BUYER_DOMINANCE.evaluate({ members, bids })).not.toBeNull()
  })
  it('분산 분포 → null', () => {
    const members = [biz({ bizNo: 'A' })]
    const bids = [
      bid({ winnerBizNo: 'A', schoolCode: 'PSN-001' }),
      bid({ winnerBizNo: 'A', schoolCode: 'PSN-002' }),
      bid({ winnerBizNo: 'A', schoolCode: 'PSN-003' }),
      bid({ winnerBizNo: 'A', schoolCode: 'PSN-004' }),
      bid({ winnerBizNo: 'A', schoolCode: 'PSN-005' }),
    ]
    expect(SINGLE_BUYER_DOMINANCE.evaluate({ members, bids })).toBeNull()
  })
})

describe('CATEGORY_OMNIVORE', () => {
  it('4 카테고리 낙찰 → 발화', () => {
    const members = [biz({ bizNo: 'A' })]
    const bids = ['채소', '육류', '수산', '공산품'].map((c) =>
      bid({ winnerBizNo: 'A', category: c }),
    )
    expect(CATEGORY_OMNIVORE.evaluate({ members, bids })).not.toBeNull()
  })
  it('3 카테고리 → null', () => {
    const members = [biz({ bizNo: 'A' })]
    const bids = ['채소', '육류', '수산'].map((c) =>
      bid({ winnerBizNo: 'A', category: c }),
    )
    expect(CATEGORY_OMNIVORE.evaluate({ members, bids })).toBeNull()
  })
})

describe('GEOGRAPHIC_MISMATCH', () => {
  it('타 구·군 납품 50%+ → 발화', () => {
    const members = [
      biz({ bizNo: 'A', addressNormalized: '부산 동래구 가상로 11' }),
    ]
    const bids = [
      ...Array.from({ length: 6 }, () =>
        bid({ winnerBizNo: 'A', district: '해운대구' }),
      ),
      ...Array.from({ length: 4 }, () =>
        bid({ winnerBizNo: 'A', district: '동래구' }),
      ),
    ]
    expect(GEOGRAPHIC_MISMATCH.evaluate({ members, bids })).not.toBeNull()
  })
  it('동일 구 납품 → null', () => {
    const members = [
      biz({ bizNo: 'A', addressNormalized: '부산 동래구 가상로 11' }),
    ]
    const bids = Array.from({ length: 6 }, () =>
      bid({ winnerBizNo: 'A', district: '동래구' }),
    )
    expect(GEOGRAPHIC_MISMATCH.evaluate({ members, bids })).toBeNull()
  })
})

describe('SHORT_LIVED', () => {
  it('18개월 미만 폐업 멤버 → 발화', () => {
    const members = [
      biz({
        status: 'closed',
        openDate: '2024-01-01',
        closeDate: '2024-12-31',
      }),
    ]
    expect(SHORT_LIVED.evaluate({ members, bids: [] })).not.toBeNull()
  })
  it('2년 영업 후 폐업 → null', () => {
    const members = [
      biz({
        status: 'closed',
        openDate: '2022-01-01',
        closeDate: '2024-06-01',
      }),
    ]
    expect(SHORT_LIVED.evaluate({ members, bids: [] })).toBeNull()
  })
  it('운영 중인 멤버만 있으면 null', () => {
    const members = [biz({ status: 'active' })]
    expect(SHORT_LIVED.evaluate({ members, bids: [] })).toBeNull()
  })
})
