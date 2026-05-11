// 1조합주소.xls 분석 — 같은 주소·연락처를 공유하는 업체 클러스터 추출.
// "통합물류 의심" 패턴:
//   A. 동일 주소에 다수 사업자 등록 (도매시장·공동물류 단지 패턴)
//   B. 동일 배송담당자 핸드폰 공유 (다른 사업자명이지만 배송은 한 사람)
//   C. 동일 실무담당자 전화 공유
//   D. 동일 팩스번호 공유 (사실상 같은 사무실)
//   E. 동일 대표자 핸드폰 공유
import * as XLSX from 'xlsx'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

interface Row {
  거래처명: string
  구분: string
  대표자명: string
  대표자핸드폰번호: string
  전화번호: string
  '실무담당자(전화번호)': string
  '배송담당자(전화번호)': string
  팩스번호: string
  주소: string
}

const file = resolve(process.argv[2] ?? '1조합주소.xls')
const buf = readFileSync(file)
const wb = XLSX.read(buf, { type: 'buffer' })
const ws = wb.Sheets[wb.SheetNames[0]]
const raw = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: '' })

// 빈 헤더 row 들 + 데이터 정리
const rows: Row[] = []
for (const r of raw) {
  const name = String(r['거래처명'] ?? '').trim()
  if (!name || name === '거래처명') continue
  rows.push({
    거래처명: name,
    구분: String(r['구분'] ?? '').trim(),
    대표자명: String(r['대표자명'] ?? '').trim(),
    대표자핸드폰번호: normalizePhone(String(r['대표자핸드폰번호'] ?? '')),
    전화번호: normalizePhone(String(r['전화번호'] ?? '')),
    '실무담당자(전화번호)': normalizePhone(String(r['실무담당자(전화번호)'] ?? '')),
    '배송담당자(전화번호)': normalizePhone(String(r['배송담당자(전화번호)'] ?? '')),
    팩스번호: normalizePhone(String(r['팩스번호'] ?? '')),
    주소: normalizeAddress(String(r['주소'] ?? '')),
  })
}

function normalizePhone(s: string): string {
  return s.replace(/\D/g, '')
}

function normalizeAddress(s: string): string {
  return s.replace(/\s+/g, ' ').trim()
}

/** 주소를 "동/리/도로명" 까지로 압축 (호수·동·층 제거). */
function addrKey(addr: string): string {
  if (!addr) return ''
  // (동/번지 패턴)
  const m1 = addr.match(/^(.+?\d+(?:-\d+)?)/)
  if (m1) return m1[1].replace(/\s+/g, ' ').trim()
  return addr.replace(/\s+/g, ' ').trim()
}

console.log(`\n총 ${rows.length}개 거래처 (구분: 공급사 ${rows.filter((r) => r.구분 === '공급사').length} · 조합원 ${rows.filter((r) => r.구분 === '조합원').length})\n`)

// ─── A. 동일 주소 그룹 ──────────────────────────────────────────────
const byAddr = groupBy(rows, (r) => addrKey(r.주소))
const addrClusters = [...byAddr.entries()]
  .filter(([k, v]) => k && v.length >= 2)
  .sort((a, b) => b[1].length - a[1].length)

console.log('═══ A. 동일 주소(통합물류 의심) ' + '═'.repeat(40))
console.log(`주소 ${addrClusters.length}곳에서 2개 이상 사업자 등록 발견.\n`)
for (const [addr, list] of addrClusters.slice(0, 15)) {
  console.log(`■ ${addr}  (${list.length}개)`)
  for (const r of list) {
    console.log(`  · ${r.거래처명.padEnd(20)} | ${r.구분.padEnd(4)} | ${r.대표자명.padEnd(6)} | ${r.대표자핸드폰번호}`)
  }
  console.log()
}

// ─── B. 동일 배송담당자 전화 ─────────────────────────────────────────
const byDelivery = groupBy(
  rows.filter((r) => r['배송담당자(전화번호)']),
  (r) => r['배송담당자(전화번호)'],
)
const deliveryClusters = [...byDelivery.entries()]
  .filter(([_, v]) => v.length >= 2)
  .sort((a, b) => b[1].length - a[1].length)

console.log('═══ B. 동일 배송담당자 핸드폰 ' + '═'.repeat(40))
console.log(`전화 ${deliveryClusters.length}개가 2개 이상 거래처에서 공유.\n`)
for (const [phone, list] of deliveryClusters.slice(0, 15)) {
  console.log(`■ ${formatPhone(phone)}  (${list.length}개)`)
  for (const r of list) {
    console.log(`  · ${r.거래처명.padEnd(20)} | ${r.대표자명.padEnd(6)} | ${r.주소}`)
  }
  console.log()
}

// ─── C. 동일 실무담당자 전화 ─────────────────────────────────────────
const byOffice = groupBy(
  rows.filter((r) => r['실무담당자(전화번호)']),
  (r) => r['실무담당자(전화번호)'],
)
const officeClusters = [...byOffice.entries()]
  .filter(([_, v]) => v.length >= 2)
  .sort((a, b) => b[1].length - a[1].length)

console.log('═══ C. 동일 실무담당자 전화 ' + '═'.repeat(40))
console.log(`전화 ${officeClusters.length}개가 2개 이상 거래처에서 공유.\n`)
for (const [phone, list] of officeClusters.slice(0, 10)) {
  console.log(`■ ${formatPhone(phone)}  (${list.length}개)`)
  for (const r of list) {
    console.log(`  · ${r.거래처명.padEnd(20)} | ${r.대표자명.padEnd(6)} | ${r.주소}`)
  }
  console.log()
}

// ─── D. 동일 팩스 ───────────────────────────────────────────────────
const byFax = groupBy(
  rows.filter((r) => r.팩스번호 && r.팩스번호.length >= 7),
  (r) => r.팩스번호,
)
const faxClusters = [...byFax.entries()]
  .filter(([_, v]) => v.length >= 2)
  .sort((a, b) => b[1].length - a[1].length)

console.log('═══ D. 동일 팩스 ' + '═'.repeat(50))
console.log(`팩스 ${faxClusters.length}개가 2개 이상 거래처에서 공유.\n`)
for (const [fax, list] of faxClusters.slice(0, 10)) {
  console.log(`■ ${formatPhone(fax)}  (${list.length}개)`)
  for (const r of list) {
    console.log(`  · ${r.거래처명.padEnd(20)} | ${r.대표자명.padEnd(6)} | ${r.주소}`)
  }
  console.log()
}

// ─── E. 동일 대표자 핸드폰 ──────────────────────────────────────────
const byBoss = groupBy(
  rows.filter((r) => r.대표자핸드폰번호 && r.대표자핸드폰번호.length >= 10),
  (r) => r.대표자핸드폰번호,
)
const bossClusters = [...byBoss.entries()]
  .filter(([_, v]) => v.length >= 2)
  .sort((a, b) => b[1].length - a[1].length)

console.log('═══ E. 동일 대표자 핸드폰 ' + '═'.repeat(45))
console.log(`핸드폰 ${bossClusters.length}개가 2개 이상 거래처에서 공유.\n`)
for (const [phone, list] of bossClusters.slice(0, 10)) {
  console.log(`■ ${formatPhone(phone)}  (${list.length}개)`)
  for (const r of list) {
    console.log(`  · ${r.거래처명.padEnd(20)} | ${r.구분.padEnd(4)} | ${r.대표자명.padEnd(6)} | ${r.주소}`)
  }
  console.log()
}

// ─── F. 종합 의심 점수 ──────────────────────────────────────────────
console.log('═══ F. 종합 의심 점수 (Top 20) ' + '═'.repeat(40))
const suspectScore = new Map<string, { row: Row; score: number; reasons: string[] }>()

function bump(r: Row, points: number, reason: string) {
  const cur = suspectScore.get(r.거래처명) ?? { row: r, score: 0, reasons: [] }
  cur.score += points
  cur.reasons.push(reason)
  suspectScore.set(r.거래처명, cur)
}

for (const [addr, list] of addrClusters) {
  if (list.length >= 3) for (const r of list) bump(r, 30, `동일주소 ${list.length}인`)
  else if (list.length >= 2) for (const r of list) bump(r, 15, `동일주소 ${list.length}인`)
}
for (const [_, list] of deliveryClusters) {
  if (list.length >= 3) for (const r of list) bump(r, 35, `배송담당자 공유 ${list.length}곳`)
  else if (list.length >= 2) for (const r of list) bump(r, 20, `배송담당자 공유 ${list.length}곳`)
}
for (const [_, list] of officeClusters) {
  if (list.length >= 2) for (const r of list) bump(r, 15, `실무담당자 공유 ${list.length}곳`)
}
for (const [_, list] of faxClusters) {
  if (list.length >= 2) for (const r of list) bump(r, 10, `팩스 공유 ${list.length}곳`)
}
for (const [_, list] of bossClusters) {
  if (list.length >= 2) for (const r of list) bump(r, 25, `대표 핸드폰 공유 ${list.length}곳`)
}

const top = [...suspectScore.values()].sort((a, b) => b.score - a.score).slice(0, 30)
for (const t of top) {
  console.log(
    `${String(t.score).padStart(3)}점  ${t.row.거래처명.padEnd(20)} | ${t.row.구분.padEnd(4)} | ${t.row.대표자명.padEnd(6)} | ${t.row.주소}`,
  )
  console.log(`         ${t.reasons.join(' · ')}`)
}

function formatPhone(s: string): string {
  if (s.length === 11) return `${s.slice(0, 3)}-${s.slice(3, 7)}-${s.slice(7)}`
  if (s.length === 10) return `${s.slice(0, 3)}-${s.slice(3, 6)}-${s.slice(6)}`
  return s
}

function groupBy<T>(arr: T[], key: (t: T) => string): Map<string, T[]> {
  const m = new Map<string, T[]>()
  for (const x of arr) {
    const k = key(x)
    if (!k) continue
    const list = m.get(k) ?? []
    list.push(x)
    m.set(k, list)
  }
  return m
}
