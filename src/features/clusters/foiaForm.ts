// 정보공개청구 양식 생성 — Word 호환 HTML 문자열로 출력. 확장자 .doc 다운로드.
//
// 의존성을 늘리지 않기 위해 docx 패키지 대신 Word 가 인식하는 HTML 을
// 'application/msword' MIME 으로 저장. Google Docs / 한글 / Word 모두 열림.
import type { Cluster } from '@/types/domain'

export interface FoiaFormData {
  agency: string
  agencyDescription: string
  subject: string
  purpose: string
  scope: string
  bizNos: string[]
  periodFrom: string
  periodTo: string
  fields: string[]
  legalBasis: string
}

export function buildFoiaFormData(cluster: Cluster): FoiaFormData {
  return {
    agency: '한국농수산식품유통공사',
    agencyDescription: '학교급식 전자조달시스템(eaT) 운영기관',
    subject: `${cluster.id} 클러스터 응찰·낙찰 이력 정보공개청구`,
    purpose:
      '학교급식 식자재 입찰 시장의 투명성·공정성에 대한 공익 모니터링 및 시민·기자·연구자 대상 데이터 공개',
    scope: `${cluster.id}(${cluster.title})에 포함된 ${cluster.members.length}개 사업자의 최근 24개월 응찰·낙찰 이력`,
    bizNos: cluster.members.map((m) => m.bizNoMasked),
    periodFrom: cluster.period.from,
    periodTo: cluster.period.to,
    fields: [
      '응찰 학교 (학교명·학교코드)',
      '응찰일시 (날짜·시각)',
      '응찰가 / 추정가',
      '응찰 단말정보 (IP·기기 식별자)',
      '낙찰 여부 및 낙찰가',
      '발주 카테고리 (채소·육류·수산·공산품·과일)',
    ],
    legalBasis:
      '공공기관의 정보공개에 관한 법률 제3조 및 제5조, 동법 시행령 제3조',
  }
}

export function renderFoiaHtml(form: FoiaFormData): string {
  return `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8" />
<title>정보공개청구서 - ${escapeHtml(form.subject)}</title>
<style>
  body { font-family: 'Noto Serif KR', '바탕', serif; line-height: 1.7; color: #111; padding: 40px; }
  h1 { font-size: 22pt; text-align: center; letter-spacing: 4px; border-bottom: 2px solid #111; padding-bottom: 8px; margin-bottom: 32px; }
  h2 { font-size: 13pt; margin-top: 28px; margin-bottom: 8px; border-left: 4px solid #555; padding-left: 8px; }
  table { width: 100%; border-collapse: collapse; margin-top: 8px; }
  th, td { border: 1px solid #888; padding: 8px 12px; text-align: left; vertical-align: top; }
  th { background: #f3f3f3; width: 30%; }
  ul, ol { margin: 0; padding-left: 20px; }
  li { margin: 4px 0; }
  .meta { color: #666; font-size: 10pt; margin-top: 32px; padding-top: 16px; border-top: 1px solid #ccc; }
</style>
</head>
<body>
<h1>정 보 공 개 청 구 서</h1>

<table>
  <tr><th>청구기관</th><td>${escapeHtml(form.agency)}<br /><small>${escapeHtml(form.agencyDescription)}</small></td></tr>
  <tr><th>청구 제목</th><td>${escapeHtml(form.subject)}</td></tr>
  <tr><th>청구 목적</th><td>${escapeHtml(form.purpose)}</td></tr>
</table>

<h2>1. 청구 범위</h2>
<p>${escapeHtml(form.scope)}</p>
<table>
  <tr><th>대상 사업자번호 (마스킹)</th><td>${form.bizNos.map(escapeHtml).join('<br />')}</td></tr>
  <tr><th>대상 기간</th><td>${escapeHtml(form.periodFrom)} ~ ${escapeHtml(form.periodTo)} (24개월)</td></tr>
</table>

<h2>2. 공개 요청 항목</h2>
<ol>
${form.fields.map((f) => `  <li>${escapeHtml(f)}</li>`).join('\n')}
</ol>

<h2>3. 법적 근거</h2>
<p>${escapeHtml(form.legalBasis)}</p>

<h2>4. 공개 형식</h2>
<p>전자파일 (CSV 또는 Excel) — 청구인 이메일 또는 정보공개포털 통한 수령</p>

<div class="meta">
청구인: ___________________________ (성명 / 소속)<br />
연락처: ___________________________ (이메일 / 휴대전화)<br />
청구일: ${new Date().toISOString().slice(0, 10)}<br />
<br />
※ 본 양식은 Ghost Bidder Tracker 가 자동 생성한 초안이며, 실제 제출 전에 청구인 정보를 기재하고 정보공개포털 (https://www.open.go.kr) 에서 확정 제출하시기 바랍니다.
</div>
</body>
</html>`
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export function downloadFoiaDoc(cluster: Cluster) {
  const data = buildFoiaFormData(cluster)
  const html = renderFoiaHtml(data)
  const blob = new Blob(['﻿', html], { type: 'application/msword' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${cluster.id}-정보공개청구.doc`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
