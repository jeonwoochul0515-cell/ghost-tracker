// Supabase 클라이언트 + 타입 안전 헬퍼.
// 환경변수가 없으면 client = null 로 초기화. 호출 시 명확한 에러를 던지며,
// P05 의 mockApi.ts + hooks 가 VITE_USE_MOCK 토글로 자동 우회.
//
// 컬럼명은 P12 마이그레이션에서 snake_case 로 정의될 예정. 현 단계에서는
// 도메인 타입(camelCase)으로 직접 캐스팅하며, 실제 DB ↔ 도메인 매핑은
// P12 작업에서 명시적 어댑터로 분리한다.
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type {
  Bid,
  Business,
  Cluster,
  CourtCase,
} from '@/types/domain'
import type { RiskFilter } from '@/stores/filterStore'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

let client: SupabaseClient | null = null

if (url && anonKey) {
  client = createClient(url, anonKey, {
    auth: { persistSession: false },
  })
}

export function isSupabaseReady(): boolean {
  return client !== null
}

function ensureClient(): SupabaseClient {
  if (!client) {
    throw new Error(
      'Supabase 가 초기화되지 않았습니다. .env 의 VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY 를 설정하거나 VITE_USE_MOCK=true 로 시작하세요.',
    )
  }
  return client
}

export interface ListClustersFilters {
  riskLevel?: RiskFilter
  district?: string | null
  signals?: string[]
  limit?: number
  offset?: number
}

export async function listClusters(
  filters: ListClustersFilters = {},
): Promise<Cluster[]> {
  const c = ensureClient()
  let q = c.from('clusters').select('*').order('risk_score', { ascending: false })

  if (filters.riskLevel && filters.riskLevel !== 'all') {
    q = q.eq('risk_level', filters.riskLevel)
  }
  if (filters.district) {
    q = q.eq('district', filters.district)
  }
  if (filters.signals && filters.signals.length > 0) {
    q = q.contains('signal_codes', filters.signals)
  }
  if (filters.limit !== undefined) {
    q = q.limit(filters.limit)
    if (filters.offset !== undefined) {
      q = q.range(filters.offset, filters.offset + filters.limit - 1)
    }
  }

  const { data, error } = await q
  if (error) throw error
  return (data as unknown as Cluster[]) ?? []
}

export async function getCluster(id: string): Promise<Cluster | null> {
  const c = ensureClient()
  const { data, error } = await c
    .from('clusters')
    .select('*')
    .eq('id', id)
    .maybeSingle()
  if (error) throw error
  return (data as unknown as Cluster) ?? null
}

export async function listBusinessesByBizNos(
  bizNos: string[],
): Promise<Business[]> {
  if (bizNos.length === 0) return []
  const c = ensureClient()
  const { data, error } = await c
    .from('businesses_public')
    .select('*')
    .in('bizno', bizNos)
  if (error) throw error
  return (data as unknown as Business[]) ?? []
}

export interface ListBidsFilters {
  bizNo?: string
  schoolCode?: string
  limit?: number
}

export async function listBids(filters: ListBidsFilters = {}): Promise<Bid[]> {
  const c = ensureClient()
  let q = c.from('bids').select('*').order('bid_date', { ascending: false })
  if (filters.bizNo) q = q.contains('participants', [filters.bizNo])
  if (filters.schoolCode) q = q.eq('school_code', filters.schoolCode)
  if (filters.limit) q = q.limit(filters.limit)
  const { data, error } = await q
  if (error) throw error
  return (data as unknown as Bid[]) ?? []
}

export async function listCourtCases(): Promise<CourtCase[]> {
  const c = ensureClient()
  const { data, error } = await c
    .from('court_cases')
    .select('*')
    .order('date', { ascending: false })
  if (error) throw error
  return (data as unknown as CourtCase[]) ?? []
}

export async function getCourtCase(id: string): Promise<CourtCase | null> {
  const c = ensureClient()
  const { data, error } = await c
    .from('court_cases')
    .select('*')
    .eq('id', id)
    .maybeSingle()
  if (error) throw error
  return (data as unknown as CourtCase) ?? null
}
