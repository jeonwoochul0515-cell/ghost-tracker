// Mock 데이터 레이어 — supabase.ts 와 동일한 시그니처. VITE_USE_MOCK 토글로 활성화.
// 200~600ms 랜덤 지연으로 실제 네트워크 시뮬레이션. 시드 데이터는 src/lib/seed/* 에서 가져옴.
import type {
  Bid,
  Business,
  Cluster,
  CourtCase,
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
    const wanted = new Set(filters.signals)
    result = result.filter((c) =>
      c.signals.some((s) => wanted.has(s.text)),
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
