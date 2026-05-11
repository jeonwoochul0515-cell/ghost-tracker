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
  Report,
  School,
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
  let q = c
    .from('clusters')
    .select(
      `*, cluster_members(bizno, businesses_public(bizno, bizno_masked, name, rep_name_masked, address_normalized, district, open_date, close_date, status, industry))`,
    )
    .order('risk_score', { ascending: false })

  if (filters.riskLevel && filters.riskLevel !== 'all') {
    q = q.eq('risk_level', filters.riskLevel)
  }
  if (filters.district) {
    q = q.eq('district', filters.district)
  }
  // signals 필터는 클라이언트 측에서 (DB 컬럼에 별도 인덱스 없음)
  if (filters.limit !== undefined) {
    q = q.limit(filters.limit)
    if (filters.offset !== undefined) {
      q = q.range(filters.offset, filters.offset + filters.limit - 1)
    }
  }

  const { data, error } = await q
  if (error) throw error
  return (data ?? []).map(rowToCluster)
}

export async function getCluster(id: string): Promise<Cluster | null> {
  const c = ensureClient()
  const { data, error } = await c
    .from('clusters')
    .select(
      `*, cluster_members(bizno, businesses_public(bizno, bizno_masked, name, rep_name_masked, address_normalized, district, open_date, close_date, status, industry))`,
    )
    .eq('id', id)
    .maybeSingle()
  if (error) throw error
  return data ? rowToCluster(data) : null
}

interface ClusterRow {
  id: string
  district: string
  location_label: string
  risk_level: 'high' | 'mid' | 'low'
  risk_score: number
  period_from: string
  period_to: string
  stats: Cluster['stats']
  signals: Cluster['signals']
  cluster_members?: Array<{
    bizno: string
    businesses_public: BusinessPublicRow | null
  }>
}

interface BusinessPublicRow {
  bizno: string
  bizno_masked: string
  name: string
  rep_name_masked: string
  address_normalized: string
  district: string
  open_date: string
  close_date: string | null
  status: Business['status']
  industry: string
}

function rowToCluster(row: ClusterRow): Cluster {
  const members: Business[] =
    row.cluster_members?.flatMap((cm) =>
      cm.businesses_public
        ? [
            {
              bizNo: cm.businesses_public.bizno,
              bizNoMasked: cm.businesses_public.bizno_masked,
              bizName: cm.businesses_public.name,
              repName: cm.businesses_public.rep_name_masked, // 원본은 RLS 차단
              repNameMasked: cm.businesses_public.rep_name_masked,
              address: cm.businesses_public.address_normalized,
              addressNormalized: cm.businesses_public.address_normalized,
              openDate: cm.businesses_public.open_date,
              closeDate: cm.businesses_public.close_date ?? undefined,
              status: cm.businesses_public.status,
              industry: cm.businesses_public.industry,
            } satisfies Business,
          ]
        : [],
    ) ?? []
  return {
    id: row.id,
    title: row.location_label,
    titleEn: row.location_label,
    district: row.district,
    locationLabel: row.location_label,
    riskLevel: row.risk_level,
    riskScore: row.risk_score,
    members,
    period: { from: row.period_from, to: row.period_to },
    stats: row.stats,
    signals: row.signals ?? [],
  }
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
  return (data ?? []).map((r) => {
    const row = r as BusinessPublicRow
    return {
      bizNo: row.bizno,
      bizNoMasked: row.bizno_masked,
      bizName: row.name,
      repName: row.rep_name_masked,
      repNameMasked: row.rep_name_masked,
      address: row.address_normalized,
      addressNormalized: row.address_normalized,
      openDate: row.open_date,
      closeDate: row.close_date ?? undefined,
      status: row.status,
      industry: row.industry,
    }
  })
}

export interface ListBidsFilters {
  bizNo?: string
  schoolCode?: string
  limit?: number
}

interface BidRow {
  id: string
  school_code: string
  school_name: string
  district: string
  bid_date: string
  announce_date: string
  category: string
  estimated_price: number
  winner_bizno: string | null
  participants: string[]
}

function rowToBid(row: BidRow): Bid {
  return {
    bidId: row.id,
    schoolCode: row.school_code,
    schoolName: row.school_name,
    district: row.district,
    bidDate: row.bid_date,
    announceDate: row.announce_date,
    category: row.category,
    estimatedPrice: Number(row.estimated_price),
    winnerBizNo: row.winner_bizno,
    participants: row.participants ?? [],
  }
}

export async function listBids(filters: ListBidsFilters = {}): Promise<Bid[]> {
  const c = ensureClient()
  let q = c.from('bids').select('*').order('bid_date', { ascending: false })
  if (filters.bizNo) q = q.contains('participants', [filters.bizNo])
  if (filters.schoolCode) q = q.eq('school_code', filters.schoolCode)
  if (filters.limit) q = q.limit(filters.limit)
  const { data, error } = await q
  if (error) throw error
  return (data ?? []).map((r) => rowToBid(r as BidRow))
}

interface CourtCaseRow {
  id: string
  court: string
  verdict: CourtCase['verdict']
  date: string
  summary: string
  pattern: CourtCase['pattern']
  evidence: string[]
  sentence: string
  full_text_url: string | null
}

function rowToCourtCase(row: CourtCaseRow): CourtCase {
  return {
    id: row.id,
    court: row.court,
    verdict: row.verdict,
    date: row.date,
    summary: row.summary,
    pattern: row.pattern,
    evidence: row.evidence ?? [],
    sentence: row.sentence,
    fullTextUrl: row.full_text_url ?? undefined,
  }
}

export async function listCourtCases(): Promise<CourtCase[]> {
  const c = ensureClient()
  const { data, error } = await c
    .from('court_cases')
    .select('*')
    .order('date', { ascending: false })
  if (error) throw error
  return (data ?? []).map((r) => rowToCourtCase(r as CourtCaseRow))
}

export async function getCourtCase(id: string): Promise<CourtCase | null> {
  const c = ensureClient()
  const { data, error } = await c
    .from('court_cases')
    .select('*')
    .eq('id', id)
    .maybeSingle()
  if (error) throw error
  return data ? rowToCourtCase(data as CourtCaseRow) : null
}

export interface ListSchoolsFilters {
  district?: string | null
  query?: string
  limit?: number
}

interface SchoolRow {
  code: string
  name: string
  address: string
  district: string
  lat: number
  lon: number
  student_count: number
}

function rowToSchool(row: SchoolRow): School {
  return {
    code: row.code,
    name: row.name,
    address: row.address,
    district: row.district,
    lat: Number(row.lat),
    lon: Number(row.lon),
    studentCount: row.student_count,
  }
}

export async function listSchools(
  filters: ListSchoolsFilters = {},
): Promise<School[]> {
  const c = ensureClient()
  let q = c.from('schools').select('*').order('name', { ascending: true })
  if (filters.district) q = q.eq('district', filters.district)
  if (filters.query) q = q.ilike('name', `%${filters.query}%`)
  if (filters.limit) q = q.limit(filters.limit)
  const { data, error } = await q
  if (error) throw error
  return (data ?? []).map((r) => rowToSchool(r as SchoolRow))
}

export async function getSchool(code: string): Promise<School | null> {
  const c = ensureClient()
  const { data, error } = await c
    .from('schools')
    .select('*')
    .eq('code', code)
    .maybeSingle()
  if (error) throw error
  return data ? rowToSchool(data as SchoolRow) : null
}

export interface SubmitReportPayload {
  type: Report['type']
  targetClusterId?: string
  targetBizNo?: string
  content: string
  contactEmail?: string
}

export async function submitReport(
  payload: SubmitReportPayload,
): Promise<{ id: string; status: 'received' }> {
  const c = ensureClient()
  const { data, error } = await c
    .from('reports')
    .insert({
      type: payload.type,
      target_cluster_id: payload.targetClusterId ?? null,
      target_bizno: payload.targetBizNo ?? null,
      content: payload.content,
      contact_email: payload.contactEmail ?? null,
      status: 'received',
    })
    .select('id, status')
    .single()
  if (error) throw error
  return data as { id: string; status: 'received' }
}
