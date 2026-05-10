// 판례 좌측 필터 — 죄명 / 결과 / 패턴 / 연도
import { useMemo } from 'react'
import type { CourtCase } from '@/types/domain'
import { SectionTitle } from '@/components/typography/SectionTitle'
import { cn } from '@/lib/cn'
import { inferYear, type Charge, type PatternTag } from './classify'

export type VerdictFilter = 'all' | CourtCase['verdict']

interface CaseFiltersProps {
  cases: CourtCase[]
  charges: Charge[]
  onChargesChange: (next: Charge[]) => void
  verdict: VerdictFilter
  onVerdictChange: (v: VerdictFilter) => void
  patterns: PatternTag[]
  onPatternsChange: (next: PatternTag[]) => void
  years: number[]
  onYearsChange: (next: number[]) => void
}

const CHARGE_OPTIONS: Charge[] = [
  '입찰방해',
  '사기',
  '담합',
  '국가계약법',
  '복합',
]

const VERDICT_OPTIONS: { value: VerdictFilter; label: string }[] = [
  { value: 'all', label: '전부' },
  { value: '유죄', label: '유죄' },
  { value: '일부유죄', label: '일부유죄' },
  { value: '무죄', label: '무죄' },
]

const PATTERN_OPTIONS: PatternTag[] = [
  '가족명의',
  '동일주소',
  '폐업회전',
  '차명',
]

function toggle<T>(arr: T[], item: T): T[] {
  return arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item]
}

export function CaseFilters({
  cases,
  charges,
  onChargesChange,
  verdict,
  onVerdictChange,
  patterns,
  onPatternsChange,
  years,
  onYearsChange,
}: CaseFiltersProps) {
  const yearOptions = useMemo(() => {
    return [...new Set(cases.map(inferYear))].sort((a, b) => b - a)
  }, [cases])

  return (
    <div className="space-y-8">
      <div>
        <SectionTitle>죄명</SectionTitle>
        <ul className="mt-3 space-y-0.5">
          {CHARGE_OPTIONS.map((opt) => {
            const checked = charges.includes(opt)
            return (
              <li key={opt}>
                <label className="flex items-center gap-2 py-1 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => onChargesChange(toggle(charges, opt))}
                    className="accent-accent"
                  />
                  <span className={checked ? 'text-accent' : 'text-ink-dim'}>
                    {opt}
                  </span>
                </label>
              </li>
            )
          })}
        </ul>
      </div>

      <div>
        <SectionTitle>결과</SectionTitle>
        <ul className="mt-3 space-y-0.5">
          {VERDICT_OPTIONS.map((opt) => (
            <li key={opt.value}>
              <button
                type="button"
                onClick={() => onVerdictChange(opt.value)}
                className={cn(
                  'w-full text-left py-1.5 text-sm transition-colors',
                  verdict === opt.value
                    ? 'text-accent'
                    : 'text-ink-dim hover:text-ink',
                )}
              >
                {opt.label}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <SectionTitle>패턴</SectionTitle>
        <ul className="mt-3 space-y-0.5">
          {PATTERN_OPTIONS.map((opt) => {
            const checked = patterns.includes(opt)
            return (
              <li key={opt}>
                <label className="flex items-center gap-2 py-1 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => onPatternsChange(toggle(patterns, opt))}
                    className="accent-accent"
                  />
                  <span className={checked ? 'text-accent' : 'text-ink-dim'}>
                    {opt}
                  </span>
                </label>
              </li>
            )
          })}
        </ul>
      </div>

      <div>
        <SectionTitle>연도</SectionTitle>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {yearOptions.map((y) => {
            const active = years.includes(y)
            return (
              <button
                key={y}
                type="button"
                onClick={() => onYearsChange(toggle(years, y))}
                className={cn(
                  'px-2 py-1 font-mono text-[10px] uppercase tracking-[0.15em] border transition-colors',
                  active
                    ? 'text-accent border-accent'
                    : 'text-ink-dim border-line hover:text-ink',
                )}
              >
                {y}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
