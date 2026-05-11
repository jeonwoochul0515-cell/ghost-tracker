// 도메인 타입 — 사업자 / 클러스터 / 입찰 / 판례 / 제보

export type RiskLevel = 'high' | 'mid' | 'low'
export type SignalLevel = 'S+' | 'S' | 'A' | 'B' | 'C'

export interface Business {
  bizNo: string                    // 사업자번호 (정규화)
  bizNoMasked: string              // 마스킹 (123-XX-67890)
  bizName: string
  repName: string                  // 풀네임 (내부용)
  repNameMasked: string            // 성씨+OO (공개용)
  address: string
  addressNormalized: string
  openDate: string
  closeDate?: string
  status: 'active' | 'closed' | 'reopened'
  industry: string
}

export interface ClusterStats {
  schoolCount: number
  totalWinAmount: number           // 원
  bidCount: number
  winCount: number
  schoolWinRate: number            // 0-1
  expectedRate: number             // 0-1
  multiplier: number               // 실제/기대 비율
}

export interface ClusterSignal {
  text: string
  level: SignalLevel
}

export interface Cluster {
  id: string                       // BSN-2026-0017 형식
  title: string                    // 한글
  titleEn: string
  district: string                 // 부산 구
  locationLabel: string            // 마스킹된 주소 표시
  riskLevel: RiskLevel
  riskScore: number                // 0-100
  members: Business[]
  period: { from: string; to: string }
  stats: ClusterStats
  signals: ClusterSignal[]
}

export interface Bid {
  bidId: string
  schoolCode: string
  schoolName: string
  district: string
  bidDate: string
  announceDate: string
  category: string                 // 채소·육류·공산품 등
  estimatedPrice: number
  winnerBizNo: string | null
  participants: string[]           // 응찰 사업자번호들
}

export interface CourtCasePattern {
  shellCount: number
  relationship: string
  sharedAddress: boolean
  sharedPhone: boolean
  method: string
}

export interface CourtCase {
  id: string                       // 2023고단1234
  court: string
  verdict: '유죄' | '무죄' | '일부유죄'
  date: string
  summary: string
  pattern: CourtCasePattern
  evidence: string[]
  sentence: string
  fullTextUrl?: string
}

export interface Report {
  id: string
  type: 'tip' | 'objection'        // 제보 또는 이의제기
  targetClusterId?: string
  targetBizNo?: string
  content: string
  contactEmail?: string            // 익명 가능
  status: 'received' | 'reviewing' | 'resolved'
  createdAt: string
}

export interface School {
  code: string                     // 가상 코드 PSN-001 형식
  name: string
  address: string
  district: string                 // 부산 16개 구·군
  lat: number
  lon: number
  studentCount: number
}

/**
 * 발주·납품 이력 (학교 → 사업자 직거래 또는 정기 납품).
 * 핵심: bid 의 winnerBizNo 가 X 인데 delivery 의 bizNo 가 Y → Y 는 X 의 분신 의심.
 */
export interface Delivery {
  deliveryId: string
  schoolCode: string
  schoolName: string
  district: string
  bizNo: string                    // 실제 납품 사업자
  date: string                     // 발주일 또는 납품일
  category: string                 // 채소·육류·수산·공산품·과일
  amount: number                   // 발주 금액 (원)
  relatedBidId?: string            // 연결된 입찰 (있으면)
}
