// 클러스터별 점수 합산 — 발화 신호 weight 누적, 0~100 클램프, 임계로 high/mid/low.
import type {
  ClusterContext,
  ScoreResult,
  SignalDef,
  SignalResult,
} from './types'
import { ALL_SIGNALS } from './signals'

export const HIGH_THRESHOLD = 80
export const MID_THRESHOLD = 50

export function scoreCluster(
  ctx: ClusterContext,
  signals: SignalDef[] = ALL_SIGNALS,
): ScoreResult {
  const reasons: SignalResult[] = []
  let total = 0
  for (const def of signals) {
    const result = def.evaluate(ctx)
    if (result) {
      reasons.push(result)
      total += result.weight
    }
  }
  const score = Math.min(100, Math.max(0, total))
  const level: 'high' | 'mid' | 'low' =
    score >= HIGH_THRESHOLD ? 'high' : score >= MID_THRESHOLD ? 'mid' : 'low'
  return { score, level, reasons }
}
