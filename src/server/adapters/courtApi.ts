// 사법정보공유포털(portal.scourt.go.kr) 어댑터 — placeholder.
// 우철님이 신청 중인 API 인가가 떨어지면 본 어댑터를 활성화한다.
//
// 신청 진행 상태 (2026-05-10):
//   - 사법정보공유포털: API 인가 신청 진행 중
//   - 발급 후 본 파일을 갱신하여 src/lib/seed/cases.ts 의 가상 데이터를 실 판례로 교체.
import type { CourtCase } from '@/types/domain'
import { optionalEnv } from '../env'

export interface ListCourtCasesParams {
  query?: string
  fromDate?: string
  toDate?: string
  pageNo?: number
  numOfRows?: number
}

export async function listCourtCases(
  _params: ListCourtCasesParams = {},
): Promise<CourtCase[]> {
  const key = optionalEnv('COURT_API_KEY')
  if (!key) {
    throw new CourtApiNotReadyError(
      '사법정보공유포털 API 인가 진행 중입니다. 발급 후 COURT_API_KEY 환경변수에 등록하세요.',
    )
  }
  // TODO(post-approval):
  //   1. portal.scourt.go.kr OpenAPI 스펙 확인
  //   2. 죄명 코드(입찰방해 §315, 사기 §347 등) 필터로 페이징 호출
  //   3. 응답 필드 → CourtCase 매핑 (사건번호·법원·결과·요약·판결문URL)
  return []
}

export async function getCourtCase(_id: string): Promise<CourtCase | null> {
  const key = optionalEnv('COURT_API_KEY')
  if (!key) {
    throw new CourtApiNotReadyError(
      '사법정보공유포털 API 인가 진행 중입니다.',
    )
  }
  return null
}

export class CourtApiNotReadyError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'CourtApiNotReadyError'
  }
}
