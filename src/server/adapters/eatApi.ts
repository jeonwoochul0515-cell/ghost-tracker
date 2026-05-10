// eaT(학교급식전자조달) 어댑터 — 공공데이터포털 B552845 API.
// 트래픽 제한: 10,000/일. 재시도 + exponential backoff.
//
// 실 엔드포인트 정확한 spec 은 발급 후 응답 메타로 확정. 여기는 일반적 패턴 가정:
//   GET http://apis.data.go.kr/B552845/eaTPubService/{operation}
//     ?serviceKey=...&pageNo=1&numOfRows=100&type=json&fromDate=...&toDate=...
import type { Bid } from '@/types/domain'
import { requireEnv } from '../env'
import { fetchWithRetry } from '../http'

const BASE_URL = 'http://apis.data.go.kr/B552845/eaTPubService'

export interface ListBidsParams {
  pageNo?: number
  numOfRows?: number
  fromDate?: string         // 'YYYYMMDD'
  toDate?: string
  region?: string           // 시·도 코드 (선택)
}

export interface EatRawBid {
  bidId: string
  schoolCode: string
  schoolName: string
  district: string
  bidDate: string           // 'YYYY-MM-DD'
  announceDate: string
  category: string
  estimatedPrice: number
  winnerBizNo: string | null
  participants: string[]
}

/**
 * 입찰 공고 + 결과 리스트 조회.
 *  1. eaTBidList 호출 (입찰 공고)
 *  2. eaTSucBidList 호출 (낙찰 결과)
 *  3. bidId 기준 병합 + 도메인 Bid 매핑
 *
 * 실제 응답 스키마는 포털 신청 승인 후 갱신 — 현재는 인터페이스 골격만.
 */
export async function listBids(params: ListBidsParams = {}): Promise<Bid[]> {
  const key = requireEnv('EAT_SERVICE_KEY')
  const search = new URLSearchParams({
    serviceKey: key,
    pageNo: String(params.pageNo ?? 1),
    numOfRows: String(params.numOfRows ?? 100),
    type: 'json',
    ...(params.fromDate ? { fromDate: params.fromDate } : {}),
    ...(params.toDate ? { toDate: params.toDate } : {}),
    ...(params.region ? { region: params.region } : {}),
  })
  const url = `${BASE_URL}/eaTBidList?${search.toString()}`
  const res = await fetchWithRetry(url, { timeoutMs: 15_000 })
  if (!res.ok) {
    if (res.status === 401 || res.status === 403) {
      throw new Error(
        'eaT 서비스키가 비활성 상태입니다. data.go.kr 에서 활성화 후 1시간 대기하세요.',
      )
    }
    throw new Error(`eaT API ${res.status}: ${await res.text().catch(() => '')}`)
  }
  const json = (await res.json()) as { response?: { body?: { items?: unknown } } }
  const items = json.response?.body?.items
  if (!items) return []
  return mapEatItems(items)
}

export async function getBidDetail(bidId: string): Promise<Bid | null> {
  const list = await listBids({ numOfRows: 1, pageNo: 1 })
  // 실제로는 eaTBidDetail 엔드포인트. 일반화 위해 list + filter.
  return list.find((b) => b.bidId === bidId) ?? null
}

function mapEatItems(items: unknown): Bid[] {
  // 공공데이터포털 응답이 단일 객체일 수도 / 배열일 수도. 정규화.
  const arr = Array.isArray(items)
    ? items
    : items && typeof items === 'object' && 'item' in items
      ? Array.isArray((items as { item?: unknown }).item)
        ? ((items as { item?: unknown[] }).item ?? [])
        : [(items as { item?: unknown }).item]
      : []
  return arr
    .filter((x): x is Record<string, unknown> => Boolean(x) && typeof x === 'object')
    .map((raw) => ({
      bidId: String(raw.bidId ?? raw.bidNo ?? ''),
      schoolCode: String(raw.schoolCode ?? raw.bidOfceCd ?? ''),
      schoolName: String(raw.schoolName ?? raw.bidOfceNm ?? ''),
      district: String(raw.district ?? raw.bidOfceLctnNm ?? ''),
      bidDate: String(raw.bidDate ?? raw.bidBeginDt ?? ''),
      announceDate: String(raw.announceDate ?? raw.bidNtceDt ?? ''),
      category: String(raw.category ?? raw.bidGoodsClass ?? ''),
      estimatedPrice: Number(raw.estimatedPrice ?? raw.estPrc ?? 0),
      winnerBizNo: raw.winnerBizNo ? String(raw.winnerBizNo) : null,
      participants: Array.isArray(raw.participants)
        ? (raw.participants as unknown[]).map(String)
        : [],
    }))
}
