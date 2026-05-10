// 사이드바 필터 — 검색 / 의심도(카운트) / 지역 / 신호 / 도구
import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import type { Cluster } from '@/types/domain'
import { useFilterStore, type RiskFilter } from '@/stores/filterStore'
import { Input } from '@/components/ui/Input'
import { SectionTitle } from '@/components/typography/SectionTitle'
import { cn } from '@/lib/cn'

interface ClusterFiltersProps {
  clusters: Cluster[] | null
  search: string
  onSearchChange: (v: string) => void
}

const RISK_OPTIONS: { value: RiskFilter; label: string }[] = [
  { value: 'all', label: '전부' },
  { value: 'high', label: '고위험' },
  { value: 'mid', label: '중간' },
  { value: 'low', label: '관찰' },
]

const SIGNAL_FILTERS = [
  { id: '동일주소', label: '동일주소' },
  { id: '가족', label: '가족 추정' },
  { id: '동일학교 동시응찰', label: '동일학교 동시응찰' },
  { id: '폐업', label: '폐업 회전' },
  { id: '신규 등록', label: '신규 즉시 낙찰' },
]

export function ClusterFilters({
  clusters,
  search,
  onSearchChange,
}: ClusterFiltersProps) {
  const riskLevel = useFilterStore((s) => s.riskLevel)
  const district = useFilterStore((s) => s.district)
  const signals = useFilterStore((s) => s.signals)
  const setRiskLevel = useFilterStore((s) => s.setRiskLevel)
  const setDistrict = useFilterStore((s) => s.setDistrict)
  const toggleSignal = useFilterStore((s) => s.toggleSignal)

  const counts = useMemo(() => {
    if (!clusters) return { all: 0, high: 0, mid: 0, low: 0 }
    return {
      all: clusters.length,
      high: clusters.filter((c) => c.riskLevel === 'high').length,
      mid: clusters.filter((c) => c.riskLevel === 'mid').length,
      low: clusters.filter((c) => c.riskLevel === 'low').length,
    }
  }, [clusters])

  const districts = useMemo(() => {
    if (!clusters) return [] as string[]
    return [...new Set(clusters.map((c) => c.district))].sort()
  }, [clusters])

  return (
    <div className="space-y-10">
      <div>
        <SectionTitle>검색</SectionTitle>
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="사업자번호 · 상호 · ID"
          className="mt-3"
        />
      </div>

      <div>
        <SectionTitle>의심도</SectionTitle>
        <ul className="mt-3 space-y-0.5">
          {RISK_OPTIONS.map((opt) => (
            <li key={opt.value}>
              <button
                type="button"
                onClick={() => setRiskLevel(opt.value)}
                className={cn(
                  'w-full flex items-center justify-between py-1.5 text-sm transition-colors',
                  riskLevel === opt.value
                    ? 'text-accent'
                    : 'text-ink-dim hover:text-ink',
                )}
              >
                <span>{opt.label}</span>
                <span className="font-mono text-[10px] text-ink-faint">
                  {counts[opt.value]}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <SectionTitle>지역</SectionTitle>
        <ul className="mt-3 space-y-0.5">
          <li>
            <button
              type="button"
              onClick={() => setDistrict(null)}
              className={cn(
                'w-full text-left py-1.5 text-sm transition-colors',
                district === null
                  ? 'text-accent'
                  : 'text-ink-dim hover:text-ink',
              )}
            >
              전체
            </button>
          </li>
          {districts.map((d) => (
            <li key={d}>
              <button
                type="button"
                onClick={() => setDistrict(d)}
                className={cn(
                  'w-full text-left py-1.5 text-sm transition-colors',
                  district === d
                    ? 'text-accent'
                    : 'text-ink-dim hover:text-ink',
                )}
              >
                {d}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <SectionTitle>신호</SectionTitle>
        <ul className="mt-3 space-y-0.5">
          {SIGNAL_FILTERS.map((sig) => {
            const checked = signals.includes(sig.id)
            return (
              <li key={sig.id}>
                <label className="flex items-center gap-2 py-1 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleSignal(sig.id)}
                    className="accent-accent"
                  />
                  <span
                    className={
                      checked ? 'text-accent' : 'text-ink-dim'
                    }
                  >
                    {sig.label}
                  </span>
                </label>
              </li>
            )
          })}
        </ul>
      </div>

      <div>
        <SectionTitle>도구</SectionTitle>
        <ul className="mt-3 space-y-1.5 text-sm">
          <li>
            <a className="text-ink-dim hover:text-ink" href="#">
              정보공개청구
            </a>
          </li>
          <li>
            <a className="text-ink-dim hover:text-ink" href="#">
              데이터 내려받기
            </a>
          </li>
          <li>
            <Link
              className="text-ink-dim hover:text-ink"
              to="/methodology"
            >
              방법론
            </Link>
          </li>
        </ul>
      </div>
    </div>
  )
}
