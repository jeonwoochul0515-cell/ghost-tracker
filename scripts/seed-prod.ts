// 시드 풀버전 (TS) → Supabase 프로덕션 DB 일괄 upsert.
// 실행: tsx scripts/seed-prod.ts  (SUPABASE_SERVICE_ROLE_KEY 환경변수 필요)
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

// .env 직접 로드 (dotenv 의존성 회피)
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const envText = readFileSync(resolve(__dirname, '..', '.env'), 'utf-8')
for (const line of envText.split('\n')) {
  const m = line.match(/^([A-Z_]+)=(.*)$/)
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2]
}

import { clustersSeed, businessesSeed } from '../src/lib/seed/clusters'
import { schoolsSeed } from '../src/lib/seed/schools'
import { bidsSeed } from '../src/lib/seed/bids'
import { casesSeed } from '../src/lib/seed/cases'
import { reportsSeed } from '../src/lib/seed/reports'

const url = process.env.VITE_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !key) {
  console.error('VITE_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY 누락')
  process.exit(1)
}

const sb = createClient(url, key, { auth: { persistSession: false } })

function extractDistrict(addr: string): string | null {
  const m = addr.match(/(\S+[구군])/)
  return m ? m[1] : null
}

async function bulkUpsert<T>(
  table: string,
  rows: T[],
  options: { onConflict?: string; ignoreDuplicates?: boolean } = {},
  batchSize = 100,
): Promise<void> {
  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize)
    const { error } = await sb.from(table).upsert(batch, options)
    if (error) throw new Error(`${table} upsert: ${error.message}`)
  }
}

async function main() {
  // ─── businesses ─────────────────────────────────────────────────────
  const businesses = businessesSeed.map((b) => ({
    bizno: b.bizNo,
    name: b.bizName,
    rep_name: b.repName,
    address: b.address,
    address_normalized: b.addressNormalized,
    district: extractDistrict(b.addressNormalized),
    open_date: b.openDate,
    close_date: b.closeDate ?? null,
    status: b.status,
    industry: b.industry,
  }))
  await bulkUpsert('businesses', businesses, { onConflict: 'bizno' })
  console.log(`businesses: ${businesses.length}`)

  // ─── schools ────────────────────────────────────────────────────────
  const schools = schoolsSeed.map((s) => ({
    code: s.code,
    name: s.name,
    address: s.address,
    district: s.district,
    lat: s.lat,
    lon: s.lon,
    student_count: s.studentCount,
  }))
  await bulkUpsert('schools', schools, { onConflict: 'code' })
  console.log(`schools: ${schools.length}`)

  // ─── bids (생성된 시드, ~500건) ─────────────────────────────────────
  const bids = bidsSeed.map((b) => ({
    id: b.bidId,
    school_code: b.schoolCode,
    school_name: b.schoolName,
    district: b.district,
    bid_date: b.bidDate,
    announce_date: b.announceDate,
    category: b.category,
    estimated_price: b.estimatedPrice,
    winner_bizno: b.winnerBizNo,
    participants: b.participants,
  }))
  await bulkUpsert('bids', bids, { onConflict: 'id' })
  console.log(`bids: ${bids.length}`)

  // ─── clusters ───────────────────────────────────────────────────────
  const clusters = clustersSeed.map((c) => ({
    id: c.id,
    district: c.district,
    location_label: c.locationLabel,
    risk_level: c.riskLevel,
    risk_score: c.riskScore,
    period_from: c.period.from,
    period_to: c.period.to,
    stats: c.stats,
    signals: c.signals,
  }))
  await bulkUpsert('clusters', clusters, { onConflict: 'id' })
  console.log(`clusters: ${clusters.length}`)

  // ─── cluster_members ────────────────────────────────────────────────
  const members = clustersSeed.flatMap((c) =>
    c.members.map((m) => ({ cluster_id: c.id, bizno: m.bizNo })),
  )
  await bulkUpsert('cluster_members', members, { ignoreDuplicates: true })
  console.log(`cluster_members: ${members.length}`)

  // ─── court_cases ────────────────────────────────────────────────────
  const cases = casesSeed.map((cc) => ({
    id: cc.id,
    court: cc.court,
    verdict: cc.verdict,
    date: cc.date,
    summary: cc.summary,
    pattern: cc.pattern,
    evidence: cc.evidence,
    sentence: cc.sentence,
    full_text_url: cc.fullTextUrl ?? null,
  }))
  await bulkUpsert('court_cases', cases, { onConflict: 'id' })
  console.log(`court_cases: ${cases.length}`)

  // ─── reports (시연용 3건) ───────────────────────────────────────────
  const reports = reportsSeed.map((r) => ({
    type: r.type,
    target_cluster_id: r.targetClusterId ?? null,
    target_bizno: r.targetBizNo ?? null,
    content: r.content,
    contact_email: r.contactEmail ?? null,
    status: r.status,
  }))
  // reports id 는 DB 가 sequence 로 생성. 중복 방지를 위해 기존 데이터 있으면 skip.
  const { data: existing } = await sb.from('reports').select('id').limit(1)
  if (!existing || existing.length === 0) {
    const { error } = await sb.from('reports').insert(reports)
    if (error) console.warn(`reports insert: ${error.message}`)
    else console.log(`reports: ${reports.length}`)
  } else {
    console.log('reports: skipped (existing data)')
  }

  console.log('seed-prod done.')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
