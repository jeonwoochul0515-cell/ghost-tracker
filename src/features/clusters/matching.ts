// 클러스터 ↔ 판례 패턴 유사도 매칭. signals 텍스트 키워드 + case.pattern 의 method/relationship/sharedAddress 비교.
import type { Cluster, CourtCase } from '@/types/domain'

function hasSignalKeyword(cluster: Cluster, keyword: string): boolean {
  return cluster.signals.some((s) => s.text.includes(keyword))
}

/** 판례 ↔ 클러스터 패턴 점수. 양방향 매칭에서 동일 함수 사용. */
export function scoreCaseAgainstCluster(c: CourtCase, cluster: Cluster): number {
  let score = 0
  if (c.pattern.sharedAddress && hasSignalKeyword(cluster, '동일주소')) score += 3
  if (
    hasSignalKeyword(cluster, '가족') &&
    /가족|배우자|자녀|형제|부부/.test(c.pattern.relationship)
  ) {
    score += 3
  }
  if (c.pattern.method.includes('폐업') && hasSignalKeyword(cluster, '폐업')) score += 2
  if (
    c.pattern.method.includes('동시') &&
    hasSignalKeyword(cluster, '동시응찰')
  ) {
    score += 2
  }
  if (c.pattern.method.includes('차명') && hasSignalKeyword(cluster, '차명')) score += 2
  if (c.pattern.method.includes('단기') && hasSignalKeyword(cluster, '단기')) score += 1
  if (c.pattern.method.includes('신규') && hasSignalKeyword(cluster, '신규')) score += 2
  if (c.pattern.method.includes('mismatch') && hasSignalKeyword(cluster, 'mismatch')) score += 1
  if (c.pattern.method.includes('단일') && hasSignalKeyword(cluster, '단일')) score += 2
  return score
}

export function matchCases(
  cluster: Cluster,
  cases: CourtCase[],
  topN = 3,
): { case: CourtCase; score: number }[] {
  return cases
    .map((c) => ({ case: c, score: scoreCaseAgainstCluster(c, cluster) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topN)
}
