// 클러스터 필터 상태 — 위험도 / 지역(부산 구) / 신호(분신 추정 시그널)
import { create } from 'zustand'

export type RiskFilter = 'all' | 'high' | 'mid' | 'low'

interface FilterState {
  riskLevel: RiskFilter
  district: string | null
  signals: string[]
  setRiskLevel: (v: RiskFilter) => void
  setDistrict: (v: string | null) => void
  toggleSignal: (id: string) => void
  reset: () => void
}

const initial = {
  riskLevel: 'all' as RiskFilter,
  district: null as string | null,
  signals: [] as string[],
}

export const useFilterStore = create<FilterState>((set) => ({
  ...initial,
  setRiskLevel: (riskLevel) => set({ riskLevel }),
  setDistrict: (district) => set({ district }),
  toggleSignal: (id) =>
    set((s) => ({
      signals: s.signals.includes(id)
        ? s.signals.filter((x) => x !== id)
        : [...s.signals, id],
    })),
  reset: () => set(initial),
}))
