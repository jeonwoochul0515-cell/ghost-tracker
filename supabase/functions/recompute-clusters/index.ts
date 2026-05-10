// recompute-clusters — 매일 새벽 cron. clusterer + scorer 실행 후 clusters/cluster_members 갱신.
// 현 시점 placeholder. P13 이후 features/scoring/* 코드를 Deno 호환 형태로 포팅 또는
// supabase/functions/_shared/scoring/* 로 mirror 한 뒤 실 적재.
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { serviceClient } from '../_shared/supabase.ts'
import { log } from '../_shared/log.ts'
import { jsonResponse, preflight } from '../_shared/response.ts'

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return preflight()

  try {
    log('info', 'recompute-clusters invoked')

    // 1. SELECT * FROM businesses, bids, whitelist_addresses
    // 2. clusterBusinesses(businesses, { whitelist }) — Union-Find 그룹화
    // 3. for each group: scoreCluster(ctx, ALL_SIGNALS) → score/level/reasons
    // 4. UPSERT clusters + cluster_members (트랜잭션)
    // 5. 변경 분 로그 (clusters_added/updated/removed)

    return jsonResponse(
      { status: 'placeholder', note: 'P13 이후 실제 재계산' },
      200,
    )
  } catch (e) {
    log('error', 'recompute-clusters failed', { error: String(e) })
    return jsonResponse({ error: 'internal error' }, 500)
  }
})

void serviceClient
