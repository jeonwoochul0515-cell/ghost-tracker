// 확률 왜곡 통계 검증 — 이항분포 z-score 기반 one-sided test.

export interface ChanceTestInput {
  totalBids: number          // 클러스터가 참여한 총 입찰 수
  observedWins: number       // 실제 낙찰 횟수
  expectedRate: number       // 기대 낙찰률 (0~1, 1/평균 응찰자수 권장)
}

export interface ChanceTestResult {
  expected: number
  observed: number
  zScore: number
  pValue: number             // one-sided (관측치 이상 발생 확률)
  description: string
}

export function chanceTest(input: ChanceTestInput): ChanceTestResult {
  const { totalBids, observedWins, expectedRate } = input
  if (totalBids <= 0 || expectedRate <= 0 || expectedRate >= 1) {
    return {
      expected: totalBids * expectedRate,
      observed: observedWins,
      zScore: 0,
      pValue: 1,
      description: '검정에 충분한 데이터가 없습니다.',
    }
  }
  const expected = totalBids * expectedRate
  const variance = totalBids * expectedRate * (1 - expectedRate)
  const std = Math.sqrt(variance)
  const z = std === 0 ? 0 : (observedWins - expected) / std
  const pValue = Math.max(0, Math.min(1, 1 - normalCdf(z)))
  return {
    expected,
    observed: observedWins,
    zScore: z,
    pValue,
    description: `이 클러스터의 합산 낙찰률은 우연만으로 발생할 확률이 ${(pValue * 100).toFixed(2)}%입니다.`,
  }
}

/** 표준정규분포 누적분포함수 — Abramowitz & Stegun 26.2.17 근사. */
export function normalCdf(z: number): number {
  const t = 1 / (1 + 0.2316419 * Math.abs(z))
  const d = 0.3989422804014327 * Math.exp((-z * z) / 2)
  let p =
    d *
    t *
    (0.31938153 +
      t *
        (-0.356563782 +
          t *
            (1.781477937 +
              t * (-1.821255978 + t * 1.330274429))))
  if (z > 0) p = 1 - p
  return p
}
