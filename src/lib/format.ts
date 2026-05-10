// 표시 포매팅 — 금액(원 → 억/만), 퍼센트, 배수

const EOK = 1_0000_0000        // 1억
const MAN = 1_0000             // 1만

/**
 * 원 단위 금액 → 한글 약식 표기.
 *  1240000000 → "12.4억원"
 *  3500000    → "350만원"
 *  9000       → "9,000원"
 *  음수 부호 보존. NaN/Infinity 는 "—".
 */
export function formatKRW(n: number): string {
  if (!Number.isFinite(n)) return '—'
  const sign = n < 0 ? '-' : ''
  const abs = Math.abs(n)
  if (abs >= EOK) {
    return `${sign}${stripTrailingZero((abs / EOK).toFixed(1))}억원`
  }
  if (abs >= MAN) {
    return `${sign}${stripTrailingZero((abs / MAN).toFixed(1))}만원`
  }
  return `${sign}${abs.toLocaleString('ko-KR')}원`
}

/**
 * 비율(0~1) → 백분율 문자열. 0.124 → "12.4%". NaN/Infinity 는 "—".
 */
export function formatPercent(n: number): string {
  if (!Number.isFinite(n)) return '—'
  return `${stripTrailingZero((n * 100).toFixed(1))}%`
}

/**
 * 배수 → "4.4×" / "10×". NaN/Infinity 는 "—".
 */
export function formatRatio(n: number): string {
  if (!Number.isFinite(n)) return '—'
  return `${stripTrailingZero(n.toFixed(1))}×`
}

function stripTrailingZero(s: string): string {
  return s.replace(/\.0$/, '')
}
