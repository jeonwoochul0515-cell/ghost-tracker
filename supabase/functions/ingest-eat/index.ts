// ingest-eat — eaT API 일배치 (cron 매일 06:00 호출 예정).
// 실제 API 호출 어댑터는 P13 의 src/server/adapters/eatApi.ts 에서 작성.
// 본 함수는 어댑터 출력을 받아 businesses + bids 테이블 upsert.
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { serviceClient } from '../_shared/supabase.ts'
import { log } from '../_shared/log.ts'
import { jsonResponse, preflight } from '../_shared/response.ts'

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return preflight()

  try {
    const fromDate = new URL(req.url).searchParams.get('fromDate')
    const toDate = new URL(req.url).searchParams.get('toDate')

    log('info', 'ingest-eat invoked', { fromDate, toDate })

    // TODO(P13): eatApi.listBids({fromDate, toDate}) → upsert
    //   businesses (winner + participants 의 메타데이터)
    //   bids (raw_data jsonb 에 원본 보존)
    // 트래픽 제한: 10,000/일. exponential backoff.

    const placeholder = {
      status: 'placeholder',
      note: 'P13 어댑터 연결 후 실제 동작',
      receivedFromDate: fromDate,
      receivedToDate: toDate,
    }
    return jsonResponse(placeholder, 200)
  } catch (e) {
    log('error', 'ingest-eat failed', { error: String(e) })
    return jsonResponse({ error: 'internal error' }, 500)
  }
})

// supabase 미사용 변수 경고 회피용 sentinel
void serviceClient
