// 판례 → 매칭 클러스터 (역방향). 동일 score 함수를 features/clusters/matching.ts 에서 재사용.
import type { Cluster, CourtCase } from '@/types/domain'
import { scoreCaseAgainstCluster } from '@/features/clusters/matching'

export function matchClustersForCase(
  c: CourtCase,
  clusters: Cluster[],
  topN = 3,
): { cluster: Cluster; score: number }[] {
  return clusters
    .map((cluster) => ({ cluster, score: scoreCaseAgainstCluster(c, cluster) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topN)
}
