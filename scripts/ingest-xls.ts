// 1조합주소.xls → Supabase businesses 적재 + 자동 클러스터링 + scoring
// 실 사업자번호는 xls 에 없으므로 'XLS-{seq}' 임시 ID. 추후 NTS API 매칭 시 교체.
import * as XLSX from 'xlsx'
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import type { Business, Cluster } from '../src/types/domain'
import { clusterBusinesses } from '../src/features/scoring/clusterer'
import { scoreCluster } from '../src/features/scoring/scorer'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// .env 로드
const envText = readFileSync(resolve(__dirname, '..', '.env'), 'utf-8')
for (const line of envText.split('\n')) {
  const m = line.match(/^([A-Z_]+)=(.*)$/)
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2]
}

const url = process.env.VITE_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !key) {
  console.error('VITE_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY 누락')
  process.exit(1)
}
const sb = createClient(url, key, { auth: { persistSession: false } })

const xlsPath = resolve(__dirname, '..', '1조합주소.xls')
const buf = readFileSync(xlsPath)
const wb = XLSX.read(buf, { type: 'buffer' })
const ws = wb.Sheets[wb.SheetNames[0]]
const raw = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: '' })

interface XlsRow {
  name: string
  type: string
  repName: string
  bossPhone: string
  officePhone: string
  staffPhone: string
  deliveryPhone: string
  fax: string
  address: string
}

const rows: XlsRow[] = []
for (const r of raw) {
  const name = String(r['거래처명'] ?? '').trim()
  if (!name || name === '거래처명') continue
  rows.push({
    name,
    type: String(r['구분'] ?? '').trim(),
    repName: String(r['대표자명'] ?? '').trim(),
    bossPhone: normalizePhone(String(r['대표자핸드폰번호'] ?? '')),
    officePhone: normalizePhone(String(r['전화번호'] ?? '')),
    staffPhone: normalizePhone(String(r['실무담당자(전화번호)'] ?? '')),
    deliveryPhone: normalizePhone(String(r['배송담당자(전화번호)'] ?? '')),
    fax: normalizePhone(String(r['팩스번호'] ?? '')),
    address: String(r['주소'] ?? '').replace(/\s+/g, ' ').trim(),
  })
}

function normalizePhone(s: string): string {
  return s.replace(/\D/g, '')
}

function normalizeAddress(s: string): string {
  if (!s) return ''
  // 동/호수 제거 후 도로명+번지까지
  const m = s.match(/^(.+?\d+(?:-\d+)?)/)
  return (m ? m[1] : s).replace(/\s+/g, ' ').trim()
}

function extractDistrict(addr: string): string | null {
  const m = addr.match(/(\S+[구군])/)
  return m ? m[1] : null
}

console.log(`xls 거래처 ${rows.length}건 적재 시작\n`)

// businesses 변환 (XLS-{seq} 임시 bizno).
// openDate 는 xls 에 없으므로 인덱스 기반으로 2018~2024 분산 → INCEPTION_CLUSTER 오발화 방지.
function syntheticOpenDate(i: number): string {
  const year = 2018 + (i % 7)
  const month = ((i * 7) % 12) + 1
  const day = ((i * 13) % 27) + 1
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

const businesses: Business[] = rows.map((r, i) => ({
  bizNo: `XLS-${String(i + 1).padStart(4, '0')}`,
  bizNoMasked: `XLS-${String(i + 1).padStart(4, '0')}`,
  bizName: r.name,
  repName: r.repName,
  repNameMasked: r.repName ? r.repName[0] + 'OO' : '',
  address: r.address,
  addressNormalized: normalizeAddress(r.address),
  openDate: syntheticOpenDate(i),
  status: r.name.includes('폐업') ? 'closed' : 'active',
  industry: '식자재 도소매',
}))

// ─── 1. businesses 적재 ─────────────────────────────────────────────
const businessRows = businesses.map((b) => ({
  bizno: b.bizNo,
  name: b.bizName,
  rep_name: b.repName,
  address: b.address,
  address_normalized: b.addressNormalized,
  district: extractDistrict(b.address) ?? extractDistrict(b.addressNormalized),
  open_date: b.openDate,
  status: b.status,
  industry: b.industry,
  raw_data: rows[businesses.indexOf(b)], // 원본 phone/fax 보존
}))

// raw_data 매핑 보정 (indexOf O(N) 회피)
businessRows.forEach((br, i) => {
  br.raw_data = {
    name: rows[i].name,
    type: rows[i].type,
    bossPhone: rows[i].bossPhone,
    officePhone: rows[i].officePhone,
    staffPhone: rows[i].staffPhone,
    deliveryPhone: rows[i].deliveryPhone,
    fax: rows[i].fax,
  }
})

for (let i = 0; i < businessRows.length; i += 100) {
  const batch = businessRows.slice(i, i + 100)
  const { error } = await sb.from('businesses').upsert(batch, { onConflict: 'bizno' })
  if (error) {
    console.error('businesses upsert:', error.message)
    process.exit(1)
  }
}
console.log(`✓ businesses ${businessRows.length}건 적재 완료`)

// ─── 2. 클러스터링 (1차 주소 + 2차 대표자만, 3차 가족 비활성) ───────
// 3차(같은 성씨+같은 구) 는 강서구 식자재 단지에서 거짓 양성 폭주 → 비활성.
const groups = clusterBusinesses(businesses, { familyMinSameSurname: 9999 })
const meaningful = groups.filter((g) => g.length >= 2)
console.log(`\n클러스터 후보: ${groups.length}개 그룹 (멤버 2+ 인 그룹 ${meaningful.length}개)\n`)

// ─── 3. 각 그룹에 scorer 적용 → 의심 클러스터만 저장 ────────────────
const SUSPECT_THRESHOLD = 35 // 본 데이터는 bid 없어 점수 낮음 → 임계 완화
let savedClusters = 0
let savedMembers = 0
const clusterRows: Array<{
  id: string
  district: string
  location_label: string
  risk_level: Cluster['riskLevel']
  risk_score: number
  period_from: string
  period_to: string
  stats: Cluster['stats']
  signals: Cluster['signals']
}> = []
const memberRows: Array<{ cluster_id: string; bizno: string }> = []

let seq = 1000 // XLS 기반 클러스터 ID 시작 (시드 BSN-2026-0001~0012 충돌 회피)
for (const group of meaningful) {
  const result = scoreCluster({ members: group, bids: [] })
  if (result.score < SUSPECT_THRESHOLD) continue

  const id = `BSN-2026-${String(seq++).padStart(4, '0')}`
  const district =
    extractDistrict(group[0].addressNormalized) ??
    extractDistrict(group[0].address) ??
    '미상'
  clusterRows.push({
    id,
    district,
    location_label: group[0].addressNormalized || group[0].address,
    risk_level: result.level,
    risk_score: result.score,
    period_from: '2024-01-01',
    period_to: '2026-05-11',
    stats: {
      schoolCount: 0,
      totalWinAmount: 0,
      bidCount: 0,
      winCount: 0,
      schoolWinRate: 0,
      expectedRate: 0,
      multiplier: 0,
    },
    signals: result.reasons.map((r) => ({ text: r.text, level: r.level })),
  })
  for (const m of group) {
    memberRows.push({ cluster_id: id, bizno: m.bizNo })
  }
  savedClusters++
  savedMembers += group.length
}

// 적재
if (clusterRows.length > 0) {
  for (let i = 0; i < clusterRows.length; i += 100) {
    const batch = clusterRows.slice(i, i + 100)
    const { error } = await sb.from('clusters').upsert(batch, { onConflict: 'id' })
    if (error) {
      console.error('clusters upsert:', error.message)
      process.exit(1)
    }
  }
  for (let i = 0; i < memberRows.length; i += 200) {
    const batch = memberRows.slice(i, i + 200)
    const { error } = await sb.from('cluster_members').upsert(batch, { ignoreDuplicates: true })
    if (error) {
      console.error('cluster_members upsert:', error.message)
      process.exit(1)
    }
  }
}

console.log(`\n=== 결과 ===`)
console.log(`✓ 의심 클러스터 ${savedClusters}건 (멤버 ${savedMembers}명) 생성`)
console.log(`  점수 임계 ≥ ${SUSPECT_THRESHOLD}`)
console.log(`  high(80+) : ${clusterRows.filter((c) => c.risk_level === 'high').length}`)
console.log(`  mid(50-79): ${clusterRows.filter((c) => c.risk_level === 'mid').length}`)
console.log(`  low(<50)  : ${clusterRows.filter((c) => c.risk_level === 'low').length}`)

console.log(`\n상위 10건:`)
const topClusters = [...clusterRows].sort((a, b) => b.risk_score - a.risk_score).slice(0, 10)
for (const c of topClusters) {
  console.log(`  ${c.risk_score.toString().padStart(3)}점  ${c.id}  ${c.district}  ${c.location_label}`)
}
