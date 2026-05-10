// 판례 분류 helpers — 죄명/패턴/연도 추출 (시드 cases.ts 의 summary·pattern 에서 추론)
import type { CourtCase } from '@/types/domain'

export type Charge = '입찰방해' | '사기' | '담합' | '국가계약법' | '복합'

export function inferCharges(c: CourtCase): Charge[] {
  const text = c.summary
  const list: Charge[] = []
  if (/입찰|낙찰|독식|독점/.test(text)) list.push('입찰방해')
  if (/사기|부당이득/.test(text)) list.push('사기')
  if (/담합/.test(text)) list.push('담합')
  if (/국가계약/.test(text)) list.push('국가계약법')
  if (list.length === 0) list.push('입찰방해')
  if (list.length >= 2) list.push('복합')
  return list
}

export type PatternTag = '가족명의' | '동일주소' | '폐업회전' | '차명'

export function inferPatterns(c: CourtCase): PatternTag[] {
  const tags: PatternTag[] = []
  if (/가족|배우자|자녀|형제|부부|친인척/.test(c.pattern.relationship)) {
    tags.push('가족명의')
  }
  if (c.pattern.sharedAddress) tags.push('동일주소')
  if (c.pattern.method.includes('폐업')) tags.push('폐업회전')
  if (c.pattern.method.includes('차명') || c.pattern.relationship.includes('차명')) {
    tags.push('차명')
  }
  return tags
}

export function inferYear(c: CourtCase): number {
  const m = c.date.match(/^(\d{4})/)
  return m ? Number(m[1]) : 0
}

export function patternBadgeText(c: CourtCase): string[] {
  return [
    `분신 ${c.pattern.shellCount}명`,
    c.pattern.method,
    ...(c.pattern.sharedAddress ? ['동일주소'] : []),
    ...(c.pattern.sharedPhone ? ['연락처 공유'] : []),
  ]
}
