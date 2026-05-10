// ingest-nts — businesses 의 미확인 사업자번호를 국세청 API 로 status batch 호출 → 갱신.
//
// 호출:
//   POST /functions/v1/ingest-nts                 # name='조회 대기' 자동 picked up (최대 500개)
//   POST /functions/v1/ingest-nts                 # body: { bizNos: ["1234567890", ...] }
//
// 1회 호출 100개 단위로 batch. 1일 100만건 제한 (실질 무제한).
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { serviceClient } from '../_shared/supabase.ts'
import { log } from '../_shared/log.ts'
import { jsonResponse, preflight } from '../_shared/response.ts'

const NTS_BASE = 'https://api.odcloud.kr/api/nts-businessman/v1'
const BATCH_SIZE = 100
const MAX_BATCHES_PER_RUN = 5

interface StatusRow {
  b_no?: string
  b_stt?: string
  b_stt_cd?: string
  tax_type?: string
  tax_type_cd?: string
  end_dt?: string
  utcc_yn?: string
  rbf_tax_type?: string
  rbf_tax_type_cd?: string
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return preflight()

  try {
    const key = Deno.env.get('NTS_SERVICE_KEY')
    if (!key) return jsonResponse({ error: 'NTS_SERVICE_KEY 누락' }, 500)

    let bizNos: string[] = []
    if (req.method === 'POST') {
      const body = await req.json().catch(() => null)
      if (body && Array.isArray((body as { bizNos?: unknown }).bizNos)) {
        bizNos = ((body as { bizNos: unknown[] }).bizNos).map(String).filter(Boolean)
      }
    }

    // body 미지정 시 DB 에서 미확인 사업자 자동 수집
    if (bizNos.length === 0) {
      const { data, error } = await serviceClient
        .from('businesses')
        .select('bizno')
        .eq('name', '조회 대기')
        .limit(BATCH_SIZE * MAX_BATCHES_PER_RUN)
      if (error) throw new Error(`businesses select: ${error.message}`)
      bizNos = (data ?? []).map((r) => r.bizno as string)
    }

    if (bizNos.length === 0) {
      log('info', 'ingest-nts no-op', { reason: 'no pending businesses' })
      return jsonResponse({ status: 'ok', updated: 0, note: '확인 대기 사업자가 없습니다.' })
    }

    log('info', 'ingest-nts start', { count: bizNos.length })

    let updated = 0
    for (let i = 0; i < bizNos.length; i += BATCH_SIZE) {
      const batch = bizNos.slice(i, i + BATCH_SIZE)
      const url = `${NTS_BASE}/status?serviceKey=${encodeURIComponent(key)}`
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ b_no: batch }),
      })
      if (!res.ok) {
        const body = await res.text().catch(() => '')
        if (res.status === 401 || res.status === 403) {
          throw new Error(`NTS 서비스키 비활성 (status ${res.status}). data.go.kr 활용신청 → 1시간 대기.`)
        }
        throw new Error(`NTS API ${res.status}: ${body.slice(0, 200)}`)
      }
      const json = (await res.json().catch(() => null)) as { data?: StatusRow[] } | null
      const rows = json?.data ?? []
      for (const row of rows) {
        if (!row.b_no) continue
        const mapped = mapStatus(row)
        const { error } = await serviceClient
          .from('businesses')
          .update({
            status: mapped.status,
            close_date: mapped.closeDate,
            // tax_type 등은 raw_data 에 보관
            raw_data: row,
            updated_at: new Date().toISOString(),
          })
          .eq('bizno', row.b_no)
        if (error) {
          log('warn', 'business update failed', { bizno: row.b_no, error: error.message })
          continue
        }
        updated++
      }
    }

    log('info', 'ingest-nts done', { updated })
    return jsonResponse({ status: 'ok', updated })
  } catch (e) {
    log('error', 'ingest-nts failed', { error: String(e) })
    return jsonResponse({ error: String(e) }, 500)
  }
})

function mapStatus(row: StatusRow): { status: 'active' | 'closed' | 'reopened'; closeDate: string | null } {
  // NTS b_stt_cd: 01=계속사업자 / 02=휴업자 / 03=폐업자
  if (row.b_stt_cd === '03') {
    return { status: 'closed', closeDate: row.end_dt ? toYmd(row.end_dt) : null }
  }
  if (row.b_stt_cd === '02') {
    // 휴업자도 closed 로 매핑 (도메인 enum 에 suspended 없음)
    return { status: 'closed', closeDate: null }
  }
  return { status: 'active', closeDate: null }
}

function toYmd(s: string): string | null {
  const ymd = s.match(/^(\d{4})(\d{2})(\d{2})/)
  if (ymd) return `${ymd[1]}-${ymd[2]}-${ymd[3]}`
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10)
  return null
}
