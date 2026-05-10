// 스코어링 엔진 공용 타입
import type { Bid, Business, SignalLevel } from '@/types/domain'

export interface MarketStats {
  /** 시장 평균 낙찰률 (0~1). 단순화로 1/평균 응찰자수 사용 권장. */
  expectedWinRate: number
}

export interface ClusterContext {
  members: Business[]                // 클러스터 멤버
  bids: Bid[]                        // 클러스터 멤버가 한 명이라도 참여한 입찰
  marketStats?: MarketStats
  whitelist?: Set<string>            // 정규화 주소 화이트리스트 (도매시장 등)
}

export interface SignalResult {
  id: string
  level: SignalLevel
  weight: number
  text: string                       // "동일주소 5인 등록"
  observation: string                // 관측 수치 설명
}

export interface SignalDef {
  id: string
  name: string
  description: string
  weight: number
  level: SignalLevel
  evaluate: (ctx: ClusterContext) => SignalResult | null
}

export interface ScoreResult {
  score: number                      // 0~100 클램프
  level: 'high' | 'mid' | 'low'
  reasons: SignalResult[]
}
