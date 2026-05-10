// 사업자 → 클러스터 그룹화 (Union-Find).
// 1차: 정규화 주소 동일성 / 2차: 식자재 업종 + 동일 대표자 / 3차: 같은 성씨 + 같은 구·군.
// 화이트리스트 주소(도매시장 등)는 1차에서 제외.
import type { Business } from '@/types/domain'

class UnionFind {
  private parent = new Map<string, string>()

  ensure(x: string): void {
    if (!this.parent.has(x)) this.parent.set(x, x)
  }

  find(x: string): string {
    this.ensure(x)
    let cur = x
    while (this.parent.get(cur) !== cur) {
      cur = this.parent.get(cur)!
    }
    // path compression
    let node = x
    while (this.parent.get(node) !== cur) {
      const next = this.parent.get(node)!
      this.parent.set(node, cur)
      node = next
    }
    return cur
  }

  union(a: string, b: string): void {
    const ra = this.find(a)
    const rb = this.find(b)
    if (ra !== rb) this.parent.set(ra, rb)
  }

  groups(): Map<string, string[]> {
    const result = new Map<string, string[]>()
    for (const key of this.parent.keys()) {
      const root = this.find(key)
      const list = result.get(root) ?? []
      list.push(key)
      result.set(root, list)
    }
    return result
  }
}

function extractDistrict(addr: string): string | null {
  const m = addr.match(/(\S+[구군])/)
  return m ? m[1] : null
}

export interface ClustererOptions {
  whitelist?: Set<string>            // 정규화 주소 화이트리스트
  industryFilter?: string             // 2차 단계 적용 업종 (기본 '식자재 도소매')
  familyMinSameSurname?: number       // 3차 단계 같은 성씨 최소 수
}

export function clusterBusinesses(
  businesses: Business[],
  options: ClustererOptions = {},
): Business[][] {
  const whitelist = options.whitelist ?? new Set<string>()
  const industry = options.industryFilter ?? '식자재 도소매'
  const familyMin = options.familyMinSameSurname ?? 3

  const uf = new UnionFind()
  for (const b of businesses) uf.ensure(b.bizNo)

  // 1차: 정규화 주소 동일성 (화이트리스트 제외)
  const byAddr = new Map<string, Business[]>()
  for (const b of businesses) {
    if (whitelist.has(b.addressNormalized)) continue
    const list = byAddr.get(b.addressNormalized) ?? []
    list.push(b)
    byAddr.set(b.addressNormalized, list)
  }
  for (const list of byAddr.values()) {
    if (list.length < 2) continue
    for (let i = 1; i < list.length; i++) {
      uf.union(list[0].bizNo, list[i].bizNo)
    }
  }

  // 2차: 식자재 업종 + 동일 대표자명
  const byRep = new Map<string, Business[]>()
  for (const b of businesses) {
    if (b.industry !== industry) continue
    if (!b.repName) continue
    const list = byRep.get(b.repName) ?? []
    list.push(b)
    byRep.set(b.repName, list)
  }
  for (const list of byRep.values()) {
    if (list.length < 2) continue
    for (let i = 1; i < list.length; i++) {
      uf.union(list[0].bizNo, list[i].bizNo)
    }
  }

  // 3차: 같은 성씨 + 같은 구·군 (식자재 업종 한정, familyMin 이상)
  const byFamily = new Map<string, Business[]>()
  for (const b of businesses) {
    if (whitelist.has(b.addressNormalized)) continue
    if (b.industry !== industry) continue
    if (!b.repName) continue
    const surname = b.repName[0]
    const district = extractDistrict(b.addressNormalized) ?? ''
    if (!district) continue
    const key = `${surname}|${district}`
    const list = byFamily.get(key) ?? []
    list.push(b)
    byFamily.set(key, list)
  }
  for (const list of byFamily.values()) {
    if (list.length < familyMin) continue
    for (let i = 1; i < list.length; i++) {
      uf.union(list[0].bizNo, list[i].bizNo)
    }
  }

  // 결과: 그룹별 Business 리스트
  const groups = uf.groups()
  const byBizNo = new Map(businesses.map((b) => [b.bizNo, b]))
  const result: Business[][] = []
  for (const bizNos of groups.values()) {
    if (bizNos.length === 0) continue
    result.push(bizNos.map((no) => byBizNo.get(no)!).filter(Boolean))
  }
  return result
}
