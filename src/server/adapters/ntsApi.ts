// 국세청(NTS) 사업자등록정보 어댑터 — 공공데이터포털 nts-businessman API.
// status: 사업자번호 상태 조회 (계속사업자/휴업자/폐업자)
// validate: 사업자등록 진위확인 (대표자명·개업일 매칭)
import { requireEnv } from '../env'
import { fetchWithRetry } from '../http'

const BASE_URL = 'http://api.odcloud.kr/api/nts-businessman/v1'

export interface BusinessStatus {
  bizNo: string
  taxType: string                      // 부가가치세 일반/간이/면세사업자
  status: 'active' | 'closed' | 'suspended' | 'unknown'
  closedDate?: string
}

const STATUS_MAP: Record<string, BusinessStatus['status']> = {
  '01': 'active',
  '02': 'suspended',
  '03': 'closed',
}

/**
 * 사업자번호 N개 (최대 100) 의 상태 조회.
 */
export async function statusBatch(bizNos: string[]): Promise<BusinessStatus[]> {
  if (bizNos.length === 0) return []
  const key = requireEnv('NTS_SERVICE_KEY')
  const url = `${BASE_URL}/status?serviceKey=${encodeURIComponent(key)}`
  const res = await fetchWithRetry(url, {
    timeoutMs: 15_000,
    init: {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ b_no: bizNos }),
    },
  })
  if (!res.ok) {
    throw new Error(`NTS status API ${res.status}: ${await res.text().catch(() => '')}`)
  }
  const json = (await res.json()) as { data?: unknown[] }
  if (!Array.isArray(json.data)) return []
  return json.data
    .filter((x): x is Record<string, unknown> => Boolean(x) && typeof x === 'object')
    .map((row) => {
      const code = String(row.b_stt_cd ?? '')
      return {
        bizNo: String(row.b_no ?? ''),
        taxType: String(row.tax_type ?? ''),
        status: STATUS_MAP[code] ?? 'unknown',
        closedDate: row.end_dt ? String(row.end_dt) : undefined,
      }
    })
}

export interface ValidateInput {
  bizNo: string
  startDt: string                  // 'YYYYMMDD' — 개업일
  pName: string                    // 대표자명
}

export interface ValidateOutput {
  bizNo: string
  valid: boolean
  message?: string
}

export async function validateBatch(
  inputs: ValidateInput[],
): Promise<ValidateOutput[]> {
  if (inputs.length === 0) return []
  const key = requireEnv('NTS_SERVICE_KEY')
  const url = `${BASE_URL}/validate?serviceKey=${encodeURIComponent(key)}`
  const res = await fetchWithRetry(url, {
    timeoutMs: 15_000,
    init: {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        businesses: inputs.map((i) => ({
          b_no: i.bizNo,
          start_dt: i.startDt,
          p_nm: i.pName,
        })),
      }),
    },
  })
  if (!res.ok) {
    throw new Error(`NTS validate API ${res.status}`)
  }
  const json = (await res.json()) as { data?: unknown[] }
  if (!Array.isArray(json.data)) return []
  return json.data
    .filter((x): x is Record<string, unknown> => Boolean(x) && typeof x === 'object')
    .map((row) => ({
      bizNo: String(row.b_no ?? ''),
      valid: row.valid === '01' || row.valid === true,
      message: row.valid_msg ? String(row.valid_msg) : undefined,
    }))
}
