// ingest-nts — 사업자번호 리스트로 국세청 API 상태·진위 확인 후 businesses 갱신.
// 실제 API 어댑터는 P13 의 src/server/adapters/ntsApi.ts.
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { serviceClient } from '../_shared/supabase.ts'
import { log } from '../_shared/log.ts'
import { jsonResponse, preflight } from '../_shared/response.ts'

interface IngestNtsPayload {
  bizNos?: string[]
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return preflight()
  if (req.method !== 'POST') {
    return jsonResponse({ error: 'method not allowed' }, 405)
  }

  try {
    const body = (await req.json()) as IngestNtsPayload
    const bizNos = body.bizNos ?? []

    log('info', 'ingest-nts invoked', { count: bizNos.length })

    // TODO(P13): ntsApi.statusBatch(bizNos) (최대 100개 단위) → businesses upsert.
    // 응답 status: 계속사업자 / 휴업자 / 폐업자 → status enum 매핑.

    return jsonResponse({ status: 'placeholder', count: bizNos.length }, 200)
  } catch (e) {
    log('error', 'ingest-nts failed', { error: String(e) })
    return jsonResponse({ error: 'internal error' }, 500)
  }
})

void serviceClient
