// Mock 데이터 레이어 — supabase.ts 와 동일한 시그니처. VITE_USE_MOCK 토글로 활성화.
// 200~600ms 랜덤 지연으로 실제 네트워크 시뮬레이션. 시드 데이터는 src/lib/seed/* 에서 가져옴.
import type {
  Bid,
  Business,
  Cluster,
  CourtCase,
  Report,
  School,
} from '@/types/domain'
import { businessesSeed, clustersSeed } from './seed/clusters'
import { schoolsSeed } from './seed/schools'
import { bidsSeed } from './seed/bids'
import { casesSeed } from './seed/cases'
import type {
  ListBidsFilters,
  ListClustersFilters,
  ListSchoolsFilters,
} from './supabase'

function delay() {
  const ms = 200 + Math.random() * 400
  return new Promise<void>((r) => setTimeout(r, ms))
}

export async function listClusters(
  filters: ListClustersFilters = {},
): Promise<Cluster[]> {
  await delay()
  let result = [...clustersSeed].sort((a, b) => b.riskScore - a.riskScore)

  if (filters.riskLevel && filters.riskLevel !== 'all') {
    result = result.filter((c) => c.riskLevel === filters.riskLevel)
  }
  if (filters.district) {
    result = result.filter((c) => c.district === filters.district)
  }
  if (filters.signals && filters.signals.length > 0) {
    // signals 필터는 substring(OR) — 사용자가 "동일주소" 체크 시 "동일주소 5인 등록" 등 매칭.
    result = result.filter((c) =>
      filters.signals!.some((needle) =>
        c.signals.some((s) => s.text.includes(needle)),
      ),
    )
  }

  const offset = filters.offset ?? 0
  const end = filters.limit !== undefined ? offset + filters.limit : undefined
  return result.slice(offset, end)
}

export async function getCluster(id: string): Promise<Cluster | null> {
  await delay()
  return clustersSeed.find((c) => c.id === id) ?? null
}

export async function listBusinessesByBizNos(
  bizNos: string[],
): Promise<Business[]> {
  await delay()
  return businessesSeed.filter((b) => bizNos.includes(b.bizNo))
}

export async function listBids(
  filters: ListBidsFilters = {},
): Promise<Bid[]> {
  await delay()
  let result = [...bidsSeed]
  if (filters.bizNo) {
    result = result.filter((b) => b.participants.includes(filters.bizNo!))
  }
  if (filters.schoolCode) {
    result = result.filter((b) => b.schoolCode === filters.schoolCode)
  }
  result.sort((a, b) => (a.bidDate < b.bidDate ? 1 : -1))
  if (filters.limit) result = result.slice(0, filters.limit)
  return result
}

// TODO: 사법정보공유포털(portal.scourt.go.kr) API 인가 후 실제 판례로 교체.
// 현 시드 데이터는 모두 (가상) 표기된 가짜 사건이며, 실제 판례는
// P13 의 src/server/adapters/courtApi.ts 어댑터를 통해 연결될 예정.
export async function listCourtCases(): Promise<CourtCase[]> {
  await delay()
  return [...casesSeed].sort((a, b) => (a.date < b.date ? 1 : -1))
}

export async function getCourtCase(id: string): Promise<CourtCase | null> {
  await delay()
  return casesSeed.find((c) => c.id === id) ?? null
}

export async function listSchools(
  filters: ListSchoolsFilters = {},
): Promise<School[]> {
  await delay()
  let result = [...schoolsSeed]
  if (filters.district) {
    result = result.filter((s) => s.district === filters.district)
  }
  if (filters.query) {
    const q = filters.query.toLowerCase()
    result = result.filter((s) => s.name.toLowerCase().includes(q))
  }
  if (filters.limit) result = result.slice(0, filters.limit)
  return result
}

export async function getSchool(code: string): Promise<School | null> {
  await delay()
  return schoolsSeed.find((s) => s.code === code) ?? null
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
  await delay()
  console.info('[mockApi] submitReport', payload)
  const seq = Math.floor(1000 + Math.random() * 9000)
  return {
    id: `REPORT-2026-${seq}`,
    status: 'received',
  }
}
