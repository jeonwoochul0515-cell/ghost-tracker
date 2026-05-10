// ingest-eat — eaT(학교급식전자조달) 입찰·낙찰 페치 + DB upsert.
//
// 호출 방법:
//   POST /functions/v1/ingest-eat?fromDate=20260501&toDate=20260510
//   → 기본: 최근 7일
//
// 동작:
//   1. eaT API 페이징 (100건/페이지) 모두 수집
//   2. bids 테이블 upsert (id PK)
//   3. participants/winner_bizno 의 새 사업자번호 → businesses 에 minimal row (NTS enrich 대기)
//
// 트래픽 제한: 1일 10,000 호출. 1주일 분량은 보통 100~200 페이지 = 충분.
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { serviceClient } from '../_shared/supabase.ts'
import { log } from '../_shared/log.ts'
import { jsonResponse, preflight } from '../_shared/response.ts'

const EAT_BASE = 'https://apis.data.go.kr/B552845/eaTPubService'
const MAX_PAGES = 100

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return preflight()

  try {
    const key = Deno.env.get('EAT_SERVICE_KEY')
    if (!key) {
      return jsonResponse({ error: 'EAT_SERVICE_KEY 누락' }, 500)
    }

    const url = new URL(req.url)
    const fromDate = url.searchParams.get('fromDate') ?? defaultFrom()
    const toDate = url.searchParams.get('toDate') ?? defaultTo()
    log('info', 'ingest-eat start', { fromDate, toDate })

    let pageNo = 1
    let totalBids = 0
    let totalBizNos = 0
    const seenBizNos = new Set<string>()

    while (pageNo <= MAX_PAGES) {
      const params = new URLSearchParams({
        serviceKey: key,
        pageNo: String(pageNo),
        numOfRows: '100',
        type: 'json',
        fromDate,
        toDate,
      })
      const res = await fetch(`${EAT_BASE}/eaTBidList?${params}`)
      if (!res.ok) {
        const body = await res.text().catch(() => '')
        if (res.status === 401 || res.status === 403) {
          throw new Error(`eaT 서비스키 비활성 (status ${res.status}). data.go.kr 활용신청 → 1시간 대기.`)
        }
        throw new Error(`eaT API ${res.status}: ${body.slice(0, 200)}`)
      }
      const json = await res.json().catch(() => null)
      const items = extractItems(json)
      if (items.length === 0) break

      const bids = items.map(toBidRow)
      const { error: bidErr } = await serviceClient.from('bids').upsert(bids, { onConflict: 'id' })
      if (bidErr) throw new Error(`bids upsert: ${bidErr.message}`)
      totalBids += bids.length

      // 새 bizno 들 → businesses 에 minimal placeholder
      const bizNos: string[] = []
      for (const b of bids) {
        if (b.winner_bizno && !seenBizNos.has(b.winner_bizno)) {
          seenBizNos.add(b.winner_bizno)
          bizNos.push(b.winner_bizno)
        }
        for (const p of b.participants) {
          if (!seenBizNos.has(p)) {
            seenBizNos.add(p)
            bizNos.push(p)
          }
        }
      }
      if (bizNos.length > 0) {
        const placeholders = bizNos.map((bizno) => ({
          bizno,
          name: '조회 대기',
          status: 'active' as const,
          industry: '식자재 도소매',
        }))
        const { error: bizErr } = await serviceClient
          .from('businesses')
          .upsert(placeholders, { onConflict: 'bizno', ignoreDuplicates: true })
        if (bizErr) throw new Error(`businesses upsert: ${bizErr.message}`)
        totalBizNos += bizNos.length
      }

      if (items.length < 100) break
      pageNo++
    }

    log('info', 'ingest-eat done', { bids: totalBids, newBizNos: totalBizNos, pages: pageNo })
    return jsonResponse(
      { status: 'ok', bids: totalBids, newBizNos: totalBizNos, pages: pageNo },
      200,
    )
  } catch (e) {
    log('error', 'ingest-eat failed', { error: String(e) })
    return jsonResponse({ error: String(e) }, 500)
  }
})

function defaultFrom(): string {
  const d = new Date(Date.now() - 7 * 86_400_000)
  return d.toISOString().slice(0, 10).replace(/-/g, '')
}

function defaultTo(): string {
  return new Date().toISOString().slice(0, 10).replace(/-/g, '')
}

function extractItems(json: unknown): Record<string, unknown>[] {
  const body = (json as { response?: { body?: { items?: unknown } } })?.response?.body?.items
  if (!body) return []
  if (Array.isArray(body)) {
    return body.filter((x): x is Record<string, unknown> => typeof x === 'object' && x !== null)
  }
  if (typeof body === 'object' && body !== null && 'item' in body) {
    const item = (body as { item?: unknown }).item
    if (Array.isArray(item)) {
      return item.filter((x): x is Record<string, unknown> => typeof x === 'object' && x !== null)
    }
    if (typeof item === 'object' && item !== null) return [item as Record<string, unknown>]
  }
  return []
}

interface BidRow {
  id: string
  school_code: string
  school_name: string
  district: string
  bid_date: string | null
  announce_date: string | null
  category: string
  estimated_price: number
  winner_bizno: string | null
  participants: string[]
  raw_data: unknown
}

function toBidRow(raw: Record<string, unknown>): BidRow {
  const id = String(
    raw.bidNtceNo ?? raw.bidId ?? raw.bidNo ?? `EAT-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  )
  return {
    id,
    school_code: String(raw.bidOfceCd ?? raw.schoolCode ?? ''),
    school_name: String(raw.bidOfceNm ?? raw.schoolName ?? ''),
    district: String(raw.bidOfceLctnNm ?? raw.district ?? ''),
    bid_date: parseYmd(raw.bidBeginDt ?? raw.bidDate),
    announce_date: parseYmd(raw.bidNtceDt ?? raw.announceDate),
    category: String(raw.bidGoodsClass ?? raw.category ?? ''),
    estimated_price: Number(raw.estPrc ?? raw.estimatedPrice ?? 0) || 0,
    winner_bizno: pickBizNo(raw.lastWinnerBizno ?? raw.winnerBizNo),
    participants: Array.isArray(raw.participants)
      ? (raw.participants as unknown[]).map(String).filter(Boolean)
      : [],
    raw_data: raw,
  }
}

function pickBizNo(v: unknown): string | null {
  if (!v) return null
  const s = String(v).replace(/\D/g, '')
  return s.length === 10 ? s : null
}

function parseYmd(v: unknown): string | null {
  if (!v) return null
  const s = String(v)
  const ymd = s.match(/^(\d{4})(\d{2})(\d{2})/)
  if (ymd) return `${ymd[1]}-${ymd[2]}-${ymd[3]}`
  const iso = s.match(/^(\d{4}-\d{2}-\d{2})/)
  if (iso) return iso[1]
  return null
}
