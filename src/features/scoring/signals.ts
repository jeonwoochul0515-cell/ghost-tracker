// 의심도 신호 정의 12종 — 각 evaluate 는 ClusterContext 를 받아 SignalResult 또는 null 반환.
//
// 점수 누적 의도: SAME_ADDRESS_3PLUS 와 5PLUS 는 별도 발화(누적 가능). scorer 가 100 클램프.
import type { SignalDef, SignalResult } from './types'

const FAMILY_MIN_SAMENAMES = 3
const SAME_SCHOOL_CO_BID_MIN = 5
const WIN_INFLATION_MIN_BIDS = 10
const WIN_INFLATION_MIN_RATIO = 2
const NEW_AND_BIG_MIN = 3
const NEW_AND_BIG_PRICE = 20_000_000
const NEW_AND_BIG_DAYS = 180
const SHORT_LIVED_DAYS = 540 // 18개월
const DOMINANCE_MIN_TOTAL = 5
const DOMINANCE_RATIO = 0.8
const CATEGORY_OMNIVORE_MIN = 4
const MISMATCH_RATIO = 0.5
const INCEPTION_MAX_SPAN_DAYS = 365

function makeResult(
  def: Pick<SignalDef, 'id' | 'level' | 'weight'>,
  text: string,
  observation: string,
): SignalResult {
  return {
    id: def.id,
    level: def.level,
    weight: def.weight,
    text,
    observation,
  }
}

function extractDistrict(addr: string): string | null {
  const m = addr.match(/(\S+[구군])/)
  return m ? m[1] : null
}

export const SAME_ADDRESS_3PLUS: SignalDef = {
  id: 'SAME_ADDRESS_3PLUS',
  name: '동일주소 3인 이상',
  description: '같은 정규화 주소에 3개 이상의 사업자가 등록된 경우',
  weight: 35,
  level: 'A',
  evaluate(ctx) {
    if (ctx.members.length < 3) return null
    const counts = new Map<string, number>()
    for (const m of ctx.members) {
      if (ctx.whitelist?.has(m.addressNormalized)) continue
      counts.set(
        m.addressNormalized,
        (counts.get(m.addressNormalized) ?? 0) + 1,
      )
    }
    const max = Math.max(0, ...counts.values())
    if (max < 3) return null
    return makeResult(
      this,
      `동일주소 ${max}인 등록`,
      `정규화 주소에 ${max}개 사업자 매칭`,
    )
  },
}

export const SAME_ADDRESS_5PLUS: SignalDef = {
  id: 'SAME_ADDRESS_5PLUS',
  name: '동일주소 5인 이상',
  description: '같은 정규화 주소에 5개 이상의 사업자가 등록된 경우',
  weight: 45,
  level: 'S+',
  evaluate(ctx) {
    if (ctx.members.length < 5) return null
    const counts = new Map<string, number>()
    for (const m of ctx.members) {
      if (ctx.whitelist?.has(m.addressNormalized)) continue
      counts.set(
        m.addressNormalized,
        (counts.get(m.addressNormalized) ?? 0) + 1,
      )
    }
    const max = Math.max(0, ...counts.values())
    if (max < 5) return null
    return makeResult(
      this,
      `동일주소 ${max}인 등록`,
      `정규화 주소에 ${max}개 사업자 매칭 (5+ 임계 초과)`,
    )
  },
}

export const FAMILY_SURNAME: SignalDef = {
  id: 'FAMILY_SURNAME',
  name: '같은 성씨 다수',
  description: '클러스터 멤버 중 같은 성씨가 3명 이상',
  weight: 20,
  level: 'B',
  evaluate(ctx) {
    if (ctx.members.length < FAMILY_MIN_SAMENAMES) return null
    const counts = new Map<string, number>()
    for (const m of ctx.members) {
      if (!m.repName) continue
      const surname = m.repName[0]
      counts.set(surname, (counts.get(surname) ?? 0) + 1)
    }
    const [topSurname, topCount] = [...counts.entries()].reduce(
      (best, cur) => (cur[1] > best[1] ? cur : best),
      ['', 0],
    )
    if (topCount < FAMILY_MIN_SAMENAMES) return null
    return makeResult(
      this,
      `같은 성씨 ${topCount}명 가족 추정`,
      `'${topSurname}' 성씨 ${topCount}명`,
    )
  },
}

export const INCEPTION_CLUSTER: SignalDef = {
  id: 'INCEPTION_CLUSTER',
  name: '인접 개업일',
  description: '모든 멤버가 인접한 시기에 개업한 패턴',
  weight: 15,
  level: 'B',
  evaluate(ctx) {
    if (ctx.members.length < 3) return null
    const dates = ctx.members
      .map((m) => Date.parse(m.openDate))
      .filter((t) => !Number.isNaN(t))
      .sort((a, b) => a - b)
    if (dates.length < 3) return null
    const spanDays = (dates[dates.length - 1] - dates[0]) / 86_400_000
    if (spanDays > INCEPTION_MAX_SPAN_DAYS) return null
    return makeResult(
      this,
      `${dates.length}명 ${Math.round(spanDays)}일 내 인접 등록`,
      `최초 ↔ 최종 개업일 간격 ${Math.round(spanDays)}일`,
    )
  },
}

export const SAME_SCHOOL_CO_BID: SignalDef = {
  id: 'SAME_SCHOOL_CO_BID',
  name: '동일학교 동시응찰',
  description: '한 입찰에 클러스터 멤버 2명 이상이 동시 응찰',
  weight: 40,
  level: 'S',
  evaluate(ctx) {
    const memberSet = new Set(ctx.members.map((m) => m.bizNo))
    let count = 0
    for (const bid of ctx.bids) {
      const memberCount = bid.participants.filter((p) =>
        memberSet.has(p),
      ).length
      if (memberCount >= 2) count++
    }
    if (count < SAME_SCHOOL_CO_BID_MIN) return null
    return makeResult(
      this,
      `동일학교 동시응찰 ${count}회`,
      `같은 입찰 건에 멤버 2+ 동시 참여 ${count}회`,
    )
  },
}

export const WIN_RATE_INFLATION: SignalDef = {
  id: 'WIN_RATE_INFLATION',
  name: '낙찰률 시장 평균 대비 왜곡',
  description: '시장 평균 낙찰률 대비 N배 이상 낙찰',
  weight: 35,
  level: 'S',
  evaluate(ctx) {
    if (!ctx.marketStats) return null
    const memberSet = new Set(ctx.members.map((m) => m.bizNo))
    const participated = ctx.bids.filter((b) =>
      b.participants.some((p) => memberSet.has(p)),
    ).length
    if (participated < WIN_INFLATION_MIN_BIDS) return null
    const wins = ctx.bids.filter(
      (b) => b.winnerBizNo && memberSet.has(b.winnerBizNo),
    ).length
    if (ctx.marketStats.expectedWinRate <= 0) return null
    const observed = wins / participated
    const multiplier = observed / ctx.marketStats.expectedWinRate
    if (multiplier < WIN_INFLATION_MIN_RATIO) return null
    return makeResult(
      this,
      `낙찰률 ${multiplier.toFixed(1)}× 시장 평균`,
      `참여 ${participated}회 중 낙찰 ${wins}회 (관측 ${(observed * 100).toFixed(1)}% / 기대 ${(ctx.marketStats.expectedWinRate * 100).toFixed(1)}%)`,
    )
  },
}

export const REOPEN_AT_SAME_ADDRESS: SignalDef = {
  id: 'REOPEN_AT_SAME_ADDRESS',
  name: '폐업 후 같은 주소 재등록',
  description: 'closed 멤버의 주소에서 그 후 active 멤버가 새로 등록',
  weight: 25,
  level: 'A',
  evaluate(ctx) {
    const closedAt = new Map<string, number>()
    for (const m of ctx.members) {
      if (m.status !== 'closed' || !m.closeDate) continue
      const t = Date.parse(m.closeDate)
      if (Number.isNaN(t)) continue
      const cur = closedAt.get(m.addressNormalized) ?? 0
      if (t > cur) closedAt.set(m.addressNormalized, t)
    }
    let count = 0
    for (const m of ctx.members) {
      if (m.status === 'closed') continue
      const closed = closedAt.get(m.addressNormalized)
      if (!closed) continue
      const opened = Date.parse(m.openDate)
      if (Number.isNaN(opened)) continue
      if (opened > closed) count++
    }
    if (count === 0) return null
    return makeResult(
      this,
      `폐업 후 같은 주소 재등록 ${count}건`,
      `closed 후 active 등록 ${count}건`,
    )
  },
}

export const NEW_AND_BIG_WIN: SignalDef = {
  id: 'NEW_AND_BIG_WIN',
  name: '신규 6개월 내 대형 낙찰',
  description: '개업 6개월 이내에 추정가 2천만원 이상 낙찰 다수',
  weight: 20,
  level: 'A',
  evaluate(ctx) {
    let bigWins = 0
    for (const m of ctx.members) {
      const opened = Date.parse(m.openDate)
      if (Number.isNaN(opened)) continue
      const sixMonthsLater = opened + NEW_AND_BIG_DAYS * 86_400_000
      for (const bid of ctx.bids) {
        if (bid.winnerBizNo !== m.bizNo) continue
        const bd = Date.parse(bid.bidDate)
        if (Number.isNaN(bd)) continue
        if (
          bd >= opened &&
          bd <= sixMonthsLater &&
          bid.estimatedPrice >= NEW_AND_BIG_PRICE
        ) {
          bigWins++
        }
      }
    }
    if (bigWins < NEW_AND_BIG_MIN) return null
    return makeResult(
      this,
      `신규 ${NEW_AND_BIG_DAYS}일 내 대형 낙찰 ${bigWins}회`,
      `추정가 ${NEW_AND_BIG_PRICE.toLocaleString('ko-KR')}원 이상 낙찰 ${bigWins}회`,
    )
  },
}

export const SINGLE_BUYER_DOMINANCE: SignalDef = {
  id: 'SINGLE_BUYER_DOMINANCE',
  name: '단일 발주처 점유',
  description: '클러스터 낙찰의 80% 이상이 한 학교에 집중',
  weight: 15,
  level: 'B',
  evaluate(ctx) {
    const memberSet = new Set(ctx.members.map((m) => m.bizNo))
    const wins = new Map<string, number>()
    let total = 0
    for (const bid of ctx.bids) {
      if (!bid.winnerBizNo || !memberSet.has(bid.winnerBizNo)) continue
      wins.set(bid.schoolCode, (wins.get(bid.schoolCode) ?? 0) + 1)
      total++
    }
    if (total < DOMINANCE_MIN_TOTAL) return null
    const max = Math.max(0, ...wins.values())
    const ratio = max / total
    if (ratio < DOMINANCE_RATIO) return null
    return makeResult(
      this,
      `단일 발주처 점유 ${Math.round(ratio * 100)}%`,
      `한 학교에서 ${max}회 / 총 ${total}회 낙찰`,
    )
  },
}

export const CATEGORY_OMNIVORE: SignalDef = {
  id: 'CATEGORY_OMNIVORE',
  name: '전 카테고리 낙찰',
  description: '4개 이상 식자재 카테고리에서 낙찰',
  weight: 10,
  level: 'C',
  evaluate(ctx) {
    const memberSet = new Set(ctx.members.map((m) => m.bizNo))
    const cats = new Set<string>()
    for (const bid of ctx.bids) {
      if (!bid.winnerBizNo || !memberSet.has(bid.winnerBizNo)) continue
      cats.add(bid.category)
    }
    if (cats.size < CATEGORY_OMNIVORE_MIN) return null
    return makeResult(
      this,
      `전 카테고리(${cats.size}종) 낙찰`,
      `${[...cats].join(' · ')}`,
    )
  },
}

export const GEOGRAPHIC_MISMATCH: SignalDef = {
  id: 'GEOGRAPHIC_MISMATCH',
  name: '본점-납품지 거리',
  description: '본점이 등록된 구·군과 납품 학교 구·군 불일치 비율',
  weight: 15,
  level: 'B',
  evaluate(ctx) {
    const memberDistricts = new Set(
      ctx.members
        .map((m) => extractDistrict(m.addressNormalized))
        .filter((x): x is string => Boolean(x)),
    )
    if (memberDistricts.size === 0) return null
    const memberSet = new Set(ctx.members.map((m) => m.bizNo))
    let mismatch = 0
    let total = 0
    for (const bid of ctx.bids) {
      if (!bid.winnerBizNo || !memberSet.has(bid.winnerBizNo)) continue
      total++
      if (!memberDistricts.has(bid.district)) mismatch++
    }
    if (total < DOMINANCE_MIN_TOTAL) return null
    const ratio = mismatch / total
    if (ratio < MISMATCH_RATIO) return null
    return makeResult(
      this,
      `타 구·군 납품 ${Math.round(ratio * 100)}%`,
      `${mismatch} / ${total} 회 본점-납품지 구·군 불일치`,
    )
  },
}

export const SHORT_LIVED: SignalDef = {
  id: 'SHORT_LIVED',
  name: '단기 집중 후 폐업',
  description: '18개월 미만 영업 후 폐업한 멤버 존재',
  weight: 20,
  level: 'A',
  evaluate(ctx) {
    let count = 0
    for (const m of ctx.members) {
      if (m.status !== 'closed' || !m.closeDate) continue
      const opened = Date.parse(m.openDate)
      const closed = Date.parse(m.closeDate)
      if (Number.isNaN(opened) || Number.isNaN(closed)) continue
      const days = (closed - opened) / 86_400_000
      if (days < SHORT_LIVED_DAYS) count++
    }
    if (count === 0) return null
    return makeResult(
      this,
      `${count}명 단기(<18개월) 집중 후 폐업`,
      `closed 멤버 중 영업기간 ${SHORT_LIVED_DAYS}일 미만 ${count}명`,
    )
  },
}

export const ALL_SIGNALS: SignalDef[] = [
  SAME_ADDRESS_3PLUS,
  SAME_ADDRESS_5PLUS,
  FAMILY_SURNAME,
  INCEPTION_CLUSTER,
  SAME_SCHOOL_CO_BID,
  WIN_RATE_INFLATION,
  REOPEN_AT_SAME_ADDRESS,
  NEW_AND_BIG_WIN,
  SINGLE_BUYER_DOMINANCE,
  CATEGORY_OMNIVORE,
  GEOGRAPHIC_MISMATCH,
  SHORT_LIVED,
]
