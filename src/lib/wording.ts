// 표현 가이드 — 본 프로젝트에서 사용 금지 / 권장 단어 사전.
// ESLint 커스텀 룰 (.eslintrc 또는 eslint.config.js) 에서 본 사전을 import 하여 검출 가능.

export const FORBIDDEN_PHRASES: { phrase: string; suggestion: string; reason: string }[] = [
  {
    phrase: '유령사업자',
    suggestion: '의심 클러스터',
    reason: '단정적 표현 — 통계 추정에 그쳐야 함',
  },
  {
    phrase: '페이퍼컴퍼니',
    suggestion: '실체 확인 미완 사업자',
    reason: '단정적 표현',
  },
  {
    phrase: '범죄자',
    suggestion: '관련 사업자 / 추적 대상',
    reason: '판결 전 단정 금지',
  },
  {
    phrase: '사기꾼',
    suggestion: '의심 사업자',
    reason: '명예훼손 위험',
  },
  {
    phrase: '확실한',
    suggestion: '추정되는 / 통계적으로 유의한',
    reason: '확신 표현 회피',
  },
]

export const PREFERRED_PHRASES = {
  cluster: '의심 클러스터',
  signal: '통계적 패턴',
  suspect: '추정',
  estimate: '관측',
  evidence: '신호',
} as const

/**
 * 본문 텍스트에서 금지 표현 검출. 빈 배열이면 통과.
 */
export function lintText(text: string): { phrase: string; suggestion: string; reason: string }[] {
  return FORBIDDEN_PHRASES.filter((f) => text.includes(f.phrase))
}
