// 공개 화면 표시용 마스킹 — 사업자번호·대표자·주소

/**
 * 사업자번호 마스킹: "1234567890" → "123-XX-67890"
 * 입력에 하이픈/공백 섞여있어도 숫자만 추출. 10자리 아니면 입력 그대로.
 */
export function maskBizNo(bizno: string): string {
  const digits = bizno.replace(/\D/g, '')
  if (digits.length !== 10) return bizno
  return `${digits.slice(0, 3)}-XX-${digits.slice(5)}`
}

/**
 * 대표자명 마스킹: "김철수" → "김OO", "남궁민수" → "남궁OO".
 * 한 글자 성씨 기본, 두 글자 복성은 화이트리스트로 분기. 비한글은 그대로.
 */
const COMPOUND_SURNAMES = [
  '남궁', '황보', '제갈', '사공', '선우', '서문', '독고', '동방', '망절',
]

export function maskRepName(name: string): string {
  const trimmed = name.trim()
  if (!trimmed) return trimmed
  for (const surname of COMPOUND_SURNAMES) {
    if (trimmed.startsWith(surname) && trimmed.length > surname.length) {
      return surname + 'OO'
    }
  }
  if (/^[가-힣]{2,}$/.test(trimmed)) {
    return trimmed[0] + 'OO'
  }
  return trimmed
}

/**
 * 주소 마스킹: 동/읍/면/리까지만, 또는 도로명(로/길)까지만 표시. 번지·호수 제거.
 *  - "부산광역시 연제구 거제동 1234-5 OO빌라 101호" → "부산광역시 연제구 거제동"
 *  - "부산광역시 해운대구 마린시티1로 12-3" → "부산광역시 해운대구 마린시티1로"
 */
export function maskAddress(addr: string): string {
  const trimmed = addr.trim()
  if (!trimmed) return trimmed
  const dongMatch = trimmed.match(/^(.+?[동읍면리])(?:\s|$)/)
  if (dongMatch) return dongMatch[1]
  const roadMatch = trimmed.match(/^(.+?(?:로|길))(?:\s|$)/)
  if (roadMatch) return roadMatch[1]
  return trimmed
}
