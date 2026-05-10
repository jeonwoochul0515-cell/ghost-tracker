// 시드 학교급식 입찰방해 판례 8건 — 사건번호·내용 모두 가상 (식별을 위해 "(가상)" 표기).
// 실제 입찰방해죄(형법 §315), 사기죄(형법 §347), 국가계약법 위반 구조를 따름.
import type { CourtCase } from '@/types/domain'

export const casesSeed: CourtCase[] = [
  {
    id: '2023고단1234 (가상)',
    court: '부산지방법원',
    verdict: '유죄',
    date: '2023-08-14',
    summary:
      '학교급식 식자재 입찰에서 가족 명의 사업자 4개를 동원해 동일 추첨에 분산 응찰, 당첨 확률을 부풀린 입찰방해 사례.',
    pattern: {
      shellCount: 4,
      relationship: '배우자 · 자녀 · 형제',
      sharedAddress: true,
      sharedPhone: true,
      method: '가족 명의 분산 응찰',
    },
    evidence: [
      '동일 IP 응찰 로그',
      '주소·연락처 동일성 확인',
      '계좌 자금 흐름 분석',
      '자백 및 참고인 진술',
    ],
    sentence: '징역 1년 6월, 집행유예 2년, 추징 8억',
  },
  {
    id: '2022고합567 (가상)',
    court: '울산지방법원',
    verdict: '유죄',
    date: '2022-11-23',
    summary:
      '직원 명의로 사업자 6개를 차명 등록하여 5년간 학교급식 입찰을 독식, 12억 상당의 부당이득을 취한 사례.',
    pattern: {
      shellCount: 6,
      relationship: '직원 차명',
      sharedAddress: false,
      sharedPhone: true,
      method: '차명 사업자 다수 등록',
    },
    evidence: [
      '직원 진술 — 명의 빌려준 사실',
      '급여 명목 자금 환원 기록',
      '인감·통장 일괄 보관',
      '카드사 거래 내역',
    ],
    sentence: '징역 3년, 추징 12억',
  },
  {
    id: '2024고단891 (가상)',
    court: '대구지방법원',
    verdict: '일부유죄',
    date: '2024-04-09',
    summary:
      '같은 주소 5개 사업자가 동일 학교 입찰에 동시 응찰. 일부 건은 사기·일부는 입찰방해 인정, 일부는 무죄.',
    pattern: {
      shellCount: 5,
      relationship: '주소 공유 (가족 추정 입증 실패)',
      sharedAddress: true,
      sharedPhone: false,
      method: '동일주소 사업자 동시 응찰',
    },
    evidence: ['주소 공유 입증', '동일 응찰 패턴 로그', '재무제표 유사도'],
    sentence: '징역 10월, 집행유예 1년 6월, 추징 3억',
  },
  {
    id: '2023고단2056 (가상)',
    court: '광주지방법원',
    verdict: '유죄',
    date: '2023-12-18',
    summary:
      '본점이 광주에 등록되어 있으나 부산 학교에 단기간 다수 낙찰. 본점-납품지 거리 불일치 + 신규 등록 직후 대형 낙찰 패턴.',
    pattern: {
      shellCount: 3,
      relationship: '동업자 + 친인척',
      sharedAddress: false,
      sharedPhone: false,
      method: '본점-납품지 mismatch + 신규 대형 낙찰',
    },
    evidence: ['차량 운행 기록 분석', '운송 인보이스 검토', '실태조사 보고서'],
    sentence: '징역 2년, 집행유예 3년, 추징 6.5억',
  },
  {
    id: '2025고단145 (가상)',
    court: '서울중앙지방법원',
    verdict: '유죄',
    date: '2025-01-30',
    summary:
      '폐업 후 같은 주소·동일 대표자로 신규 사업자 등록을 반복 (3회 회전). 회당 평균 낙찰 7.5건의 패턴.',
    pattern: {
      shellCount: 3,
      relationship: '동일 대표자 반복 등록',
      sharedAddress: true,
      sharedPhone: true,
      method: '폐업 회전',
    },
    evidence: ['사업자 등록 이력', '동일 대표자 인감 사용 기록', '예금계좌 연속성'],
    sentence: '징역 1년 4월, 집행유예 2년, 추징 4.2억',
  },
  {
    id: '2022고합999 (가상)',
    court: '대전지방법원',
    verdict: '무죄',
    date: '2022-06-15',
    summary:
      '같은 도매시장에 입주한 5개 사업자 동시 응찰을 입찰방해로 기소했으나, 도매시장 입점 정상 영업으로 판단되어 무죄.',
    pattern: {
      shellCount: 5,
      relationship: '도매시장 공동 입점',
      sharedAddress: true,
      sharedPhone: false,
      method: '도매시장 동시 응찰',
    },
    evidence: ['도매시장 임대차 계약', '독립적 자금 흐름 입증'],
    sentence: '무죄',
  },
  {
    id: '2024고단2345 (가상)',
    court: '인천지방법원',
    verdict: '유죄',
    date: '2024-09-27',
    summary:
      '특정 학교에 대한 단일 발주처 점유율 78%. 같은 빌라 4개 사업자가 18개월간 사실상 독점 운영.',
    pattern: {
      shellCount: 4,
      relationship: '가족 + 지인',
      sharedAddress: true,
      sharedPhone: true,
      method: '단일 발주처 사실상 독점',
    },
    evidence: ['낙찰률 기록', '응찰가 분석 (담합 추정)', '발주처 진술'],
    sentence: '징역 2년 6월, 추징 7.8억',
  },
  {
    id: '2025고단678 (가상)',
    court: '수원지방법원',
    verdict: '유죄',
    date: '2025-05-08',
    summary:
      '신규 등록 6개월 내 대형 낙찰 12회 + 동일주소 2인 등록. 자본 출처 불분명.',
    pattern: {
      shellCount: 2,
      relationship: '부부 추정',
      sharedAddress: true,
      sharedPhone: true,
      method: '신규 등록 후 단기 대형 낙찰',
    },
    evidence: ['자본 출처 추적', '인접 등록일 패턴', '거래 상대 진술'],
    sentence: '징역 1년, 집행유예 2년, 추징 2.8억',
  },
]
