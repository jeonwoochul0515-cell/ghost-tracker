// 시드 의심 클러스터 12건 — high 4 + mid 5 + low 3.
// 사업자번호는 가짜임이 명백하도록 999XX 시작, 상호는 (주)데모/샘플 표기.
import type { Business, Cluster } from '@/types/domain'
import { maskAddress, maskBizNo, maskRepName } from '../masking'

function biz(
  bizNo: string,
  bizName: string,
  repName: string,
  address: string,
  openDate: string,
  status: Business['status'] = 'active',
  closeDate?: string,
): Business {
  return {
    bizNo,
    bizNoMasked: maskBizNo(bizNo),
    bizName,
    repName,
    repNameMasked: maskRepName(repName),
    address,
    addressNormalized: maskAddress(address),
    openDate,
    closeDate,
    status,
    industry: '식자재 도소매',
  }
}

export const clustersSeed: Cluster[] = [
  // ─── HIGH (riskScore 80+) ─────────────────────────────────────────────
  {
    id: 'BSN-2026-0001',
    title: '동래구 동일주소 5인',
    titleEn: 'Five businesses, one address (Dongnae)',
    district: '동래구',
    locationLabel: '부산 동래구 가상로 11번길',
    riskLevel: 'high',
    riskScore: 92,
    members: [
      biz('9991100001', '(주)데모유통A', '김영수', '부산광역시 동래구 가상로 11번길 5 101호', '2022-03-12'),
      biz('9991100002', '(주)데모유통B', '김영희', '부산광역시 동래구 가상로 11번길 5 102호', '2022-04-01'),
      biz('9991100003', '(주)샘플식품', '김영민', '부산광역시 동래구 가상로 11번길 5 103호', '2022-05-15'),
      biz('9991100004', '데모상사', '박영수', '부산광역시 동래구 가상로 11번길 5 201호', '2022-06-10'),
      biz('9991100005', '샘플무역', '김영도', '부산광역시 동래구 가상로 11번길 5 202호', '2022-07-22'),
    ],
    period: { from: '2024-05-01', to: '2026-04-30' },
    stats: {
      schoolCount: 18, totalWinAmount: 2_840_000_000, bidCount: 142, winCount: 38,
      schoolWinRate: 0.27, expectedRate: 0.06, multiplier: 4.5,
    },
    signals: [
      { text: '동일주소 5인 등록', level: 'S+' },
      { text: '같은 성씨 4명 가족 추정', level: 'A' },
      { text: '동일학교 동시응찰 24회', level: 'S' },
      { text: '낙찰률 4.5× 시장 평균', level: 'S' },
    ],
  },
  {
    id: 'BSN-2026-0002',
    title: '연제구 폐업 회전 패턴',
    titleEn: 'Reopen-at-same-address (Yeonje)',
    district: '연제구',
    locationLabel: '부산 연제구 가상대로 88',
    riskLevel: 'high',
    riskScore: 88,
    members: [
      biz('9992100001', '(주)데모푸드', '이정훈', '부산광역시 연제구 가상대로 88 1층', '2021-08-05', 'closed', '2024-02-28'),
      biz('9992100002', '데모푸드코리아', '이정훈', '부산광역시 연제구 가상대로 88 1층', '2024-03-15'),
      biz('9992100003', '(주)샘플식자재', '이수민', '부산광역시 연제구 가상대로 88 2층', '2023-01-10'),
    ],
    period: { from: '2024-05-01', to: '2026-04-30' },
    stats: {
      schoolCount: 12, totalWinAmount: 1_620_000_000, bidCount: 89, winCount: 22,
      schoolWinRate: 0.25, expectedRate: 0.07, multiplier: 3.6,
    },
    signals: [
      { text: '폐업 후 같은 주소 재등록', level: 'S+' },
      { text: '동일 대표자 연속 운영', level: 'S' },
      { text: '낙찰률 3.6× 시장 평균', level: 'A' },
    ],
  },
  {
    id: 'BSN-2026-0003',
    title: '해운대구 동일학교 동시응찰',
    titleEn: 'Co-bidding cluster (Haeundae)',
    district: '해운대구',
    locationLabel: '부산 해운대구 가상해변로',
    riskLevel: 'high',
    riskScore: 85,
    members: [
      biz('9993100001', '데모씨푸드', '최은영', '부산광역시 해운대구 가상해변로 12 301호', '2023-04-20'),
      biz('9993100002', '(주)샘플팜', '최은수', '부산광역시 해운대구 가상해변로 12 302호', '2023-05-11'),
      biz('9993100003', '데모축산', '최은호', '부산광역시 해운대구 가상해변로 12 303호', '2023-06-02'),
      biz('9993100004', '샘플채소', '최은아', '부산광역시 해운대구 가상해변로 12 304호', '2023-07-15'),
    ],
    period: { from: '2024-05-01', to: '2026-04-30' },
    stats: {
      schoolCount: 22, totalWinAmount: 2_180_000_000, bidCount: 186, winCount: 41,
      schoolWinRate: 0.22, expectedRate: 0.05, multiplier: 4.4,
    },
    signals: [
      { text: '동일학교 동시응찰 38회', level: 'S+' },
      { text: '동일주소 4인 등록', level: 'S' },
      { text: '카테고리 4종 모두 낙찰', level: 'B' },
    ],
  },
  {
    id: 'BSN-2026-0004',
    title: '사상구 신규 6개월 대형 낙찰',
    titleEn: 'Fresh entrant, big wins (Sasang)',
    district: '사상구',
    locationLabel: '부산 사상구 가상공단로',
    riskLevel: 'high',
    riskScore: 81,
    members: [
      biz('9994100001', '(주)데모물산', '정현우', '부산광역시 사상구 가상공단로 55 A동', '2025-09-01'),
      biz('9994100002', '샘플유통', '정현지', '부산광역시 사상구 가상공단로 55 B동', '2025-10-12'),
    ],
    period: { from: '2025-10-01', to: '2026-04-30' },
    stats: {
      schoolCount: 8, totalWinAmount: 1_240_000_000, bidCount: 47, winCount: 18,
      schoolWinRate: 0.38, expectedRate: 0.09, multiplier: 4.2,
    },
    signals: [
      { text: '신규 등록 6개월 내 대형 낙찰 18회', level: 'S' },
      { text: '동일주소 2인 등록', level: 'A' },
      { text: '낙찰률 4.2× 시장 평균', level: 'S' },
    ],
  },

  // ─── MID (riskScore 50-79) ───────────────────────────────────────────
  {
    id: 'BSN-2026-0005',
    title: '동래구 같은 성씨 3인',
    titleEn: 'Same surname trio (Dongnae)',
    district: '동래구',
    locationLabel: '부산 동래구 가상로',
    riskLevel: 'mid',
    riskScore: 72,
    members: [
      biz('9991200001', '데모축산', '한도윤', '부산광역시 동래구 가상로 22-1', '2022-11-18'),
      biz('9991200002', '샘플미트', '한지원', '부산광역시 동래구 가상로 24', '2023-02-04'),
      biz('9991200003', '데모육가공', '한현빈', '부산광역시 동래구 가상로 26', '2023-08-09'),
    ],
    period: { from: '2024-05-01', to: '2026-04-30' },
    stats: {
      schoolCount: 9, totalWinAmount: 720_000_000, bidCount: 64, winCount: 14,
      schoolWinRate: 0.22, expectedRate: 0.10, multiplier: 2.2,
    },
    signals: [
      { text: '동일 성씨 3명 인접 주소', level: 'A' },
      { text: '낙찰률 2.2× 시장 평균', level: 'B' },
    ],
  },
  {
    id: 'BSN-2026-0006',
    title: '연제구 단일 발주처 70%',
    titleEn: 'Single-buyer dominance (Yeonje)',
    district: '연제구',
    locationLabel: '부산 연제구 가상로',
    riskLevel: 'mid',
    riskScore: 68,
    members: [
      biz('9992200001', '(주)샘플상사', '오민재', '부산광역시 연제구 가상로 33', '2022-06-30'),
      biz('9992200002', '데모푸드서비스', '오민서', '부산광역시 연제구 가상로 33', '2022-09-14'),
    ],
    period: { from: '2024-05-01', to: '2026-04-30' },
    stats: {
      schoolCount: 4, totalWinAmount: 540_000_000, bidCount: 38, winCount: 27,
      schoolWinRate: 0.71, expectedRate: 0.12, multiplier: 5.9,
    },
    signals: [
      { text: '단일 발주처 점유 71%', level: 'S' },
      { text: '동일주소 2인 등록', level: 'A' },
    ],
  },
  {
    id: 'BSN-2026-0007',
    title: '해운대구 카테고리 omnivore',
    titleEn: 'Omnivore across categories (Haeundae)',
    district: '해운대구',
    locationLabel: '부산 해운대구 가상로',
    riskLevel: 'mid',
    riskScore: 64,
    members: [
      biz('9993200001', '데모종합식품', '윤태영', '부산광역시 해운대구 가상로 7', '2023-03-22'),
      biz('9993200002', '샘플올어바웃', '윤서윤', '부산광역시 해운대구 가상로 9', '2023-05-10'),
    ],
    period: { from: '2024-05-01', to: '2026-04-30' },
    stats: {
      schoolCount: 11, totalWinAmount: 480_000_000, bidCount: 72, winCount: 18,
      schoolWinRate: 0.25, expectedRate: 0.11, multiplier: 2.3,
    },
    signals: [
      { text: '전 카테고리(채소·육류·공산품·수산) 낙찰', level: 'B' },
      { text: '같은 성씨 + 인접 주소', level: 'B' },
      { text: '낙찰률 2.3× 시장 평균', level: 'B' },
    ],
  },
  {
    id: 'BSN-2026-0008',
    title: '사상구 단기 집중 후 폐업',
    titleEn: 'Short-lived burst (Sasang)',
    district: '사상구',
    locationLabel: '부산 사상구 가상공단로',
    riskLevel: 'mid',
    riskScore: 58,
    members: [
      biz('9994200001', '(주)데모팜', '서지호', '부산광역시 사상구 가상공단로 200', '2024-01-05', 'closed', '2025-04-30'),
      biz('9994200002', '샘플식품', '서지윤', '부산광역시 사상구 가상공단로 200', '2024-02-12'),
    ],
    period: { from: '2024-05-01', to: '2026-04-30' },
    stats: {
      schoolCount: 6, totalWinAmount: 290_000_000, bidCount: 31, winCount: 9,
      schoolWinRate: 0.29, expectedRate: 0.13, multiplier: 2.2,
    },
    signals: [
      { text: '15개월 단기 집중 후 폐업', level: 'A' },
      { text: '같은 주소 후속 사업자 등록', level: 'B' },
    ],
  },
  {
    id: 'BSN-2026-0009',
    title: '동래구 본점-납품지 거리 mismatch',
    titleEn: 'Geographic mismatch (Dongnae)',
    district: '동래구',
    locationLabel: '부산 동래구 가상대로',
    riskLevel: 'mid',
    riskScore: 53,
    members: [
      biz('9991300001', '데모식자재', '강예린', '부산광역시 동래구 가상대로 444', '2023-10-08'),
    ],
    period: { from: '2024-05-01', to: '2026-04-30' },
    stats: {
      schoolCount: 7, totalWinAmount: 180_000_000, bidCount: 28, winCount: 6,
      schoolWinRate: 0.21, expectedRate: 0.12, multiplier: 1.8,
    },
    signals: [
      { text: '본점-납품지 평균 거리 38km', level: 'B' },
      { text: '신규 등록 12개월 내 빠른 확장', level: 'C' },
    ],
  },

  // ─── LOW (riskScore 30-49) ───────────────────────────────────────────
  {
    id: 'BSN-2026-0010',
    title: '연제구 약한 신호',
    titleEn: 'Weak co-bid signal (Yeonje)',
    district: '연제구',
    locationLabel: '부산 연제구 가상로',
    riskLevel: 'low',
    riskScore: 42,
    members: [
      biz('9992300001', '데모상회', '백호윤', '부산광역시 연제구 가상로 77', '2022-04-18'),
      biz('9992300002', '샘플식자재', '백시아', '부산광역시 연제구 가상로 79', '2022-08-22'),
    ],
    period: { from: '2024-05-01', to: '2026-04-30' },
    stats: {
      schoolCount: 4, totalWinAmount: 96_000_000, bidCount: 22, winCount: 5,
      schoolWinRate: 0.23, expectedRate: 0.16, multiplier: 1.4,
    },
    signals: [
      { text: '동일학교 동시응찰 4회', level: 'C' },
    ],
  },
  {
    id: 'BSN-2026-0011',
    title: '해운대구 신규 등록 다수',
    titleEn: 'Many new entrants (Haeundae)',
    district: '해운대구',
    locationLabel: '부산 해운대구 가상해변로',
    riskLevel: 'low',
    riskScore: 38,
    members: [
      biz('9993300001', '(주)데모마린', '구가은', '부산광역시 해운대구 가상해변로 5', '2025-12-03'),
      biz('9993300002', '샘플시푸드', '구가현', '부산광역시 해운대구 가상해변로 5', '2026-01-15'),
    ],
    period: { from: '2025-12-01', to: '2026-04-30' },
    stats: {
      schoolCount: 2, totalWinAmount: 38_000_000, bidCount: 11, winCount: 2,
      schoolWinRate: 0.18, expectedRate: 0.14, multiplier: 1.3,
    },
    signals: [
      { text: '동일주소 신규 2인 등록', level: 'C' },
    ],
  },
  {
    id: 'BSN-2026-0012',
    title: '사상구 단일 신호',
    titleEn: 'Solo weak signal (Sasang)',
    district: '사상구',
    locationLabel: '부산 사상구 가상공단로',
    riskLevel: 'low',
    riskScore: 33,
    members: [
      biz('9994300001', '데모유통', '신라온', '부산광역시 사상구 가상공단로 99', '2023-11-25'),
    ],
    period: { from: '2024-05-01', to: '2026-04-30' },
    stats: {
      schoolCount: 3, totalWinAmount: 52_000_000, bidCount: 18, winCount: 3,
      schoolWinRate: 0.17, expectedRate: 0.13, multiplier: 1.3,
    },
    signals: [
      { text: '카테고리 3종 낙찰', level: 'C' },
    ],
  },
]

export const businessesSeed: Business[] = clustersSeed.flatMap((c) => c.members)
