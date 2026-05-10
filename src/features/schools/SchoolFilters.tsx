// 학교 좌측 필터 — 검색 + 정렬(이름/구/의심응찰빈도) + 학교 리스트
import { useMemo } from 'react'
import type { School } from '@/types/domain'
import type { SchoolBidStats } from './aggregate'
import { Input } from '@/components/ui/Input'
import { SectionTitle } from '@/components/typography/SectionTitle'
import { cn } from '@/lib/cn'

export type SchoolSort = 'name' | 'district' | 'suspect'

interface SchoolFiltersProps {
  schools: School[]
  schoolStats: Map<string, SchoolBidStats>
  search: string
  onSearchChange: (v: string) => void
  sort: SchoolSort
  onSortChange: (v: SchoolSort) => void
  selectedCode: string | null
  onSelect: (code: string) => void
}

const SORT_OPTIONS: { value: SchoolSort; label: string }[] = [
  { value: 'suspect', label: '의심 응찰 빈도' },
  { value: 'name', label: '이름' },
  { value: 'district', label: '구·군' },
]

export function SchoolFilters({
  schools,
  schoolStats,
  search,
  onSearchChange,
  sort,
  onSortChange,
  selectedCode,
  onSelect,
}: SchoolFiltersProps) {
  const visible = useMemo(() => {
    const q = search.trim().toLowerCase()
    let result = q
      ? schools.filter(
          (s) =>
            s.name.toLowerCase().includes(q) ||
            s.district.toLowerCase().includes(q),
        )
      : [...schools]
    if (sort === 'name') {
      result.sort((a, b) => a.name.localeCompare(b.name, 'ko'))
    } else if (sort === 'district') {
      result.sort((a, b) =>
        a.district.localeCompare(b.district, 'ko') ||
        a.name.localeCompare(b.name, 'ko'),
      )
    } else {
      result.sort((a, b) => {
        const sa = schoolStats.get(a.code)?.suspectBidCount ?? 0
        const sb = schoolStats.get(b.code)?.suspectBidCount ?? 0
        return sb - sa
      })
    }
    return result
  }, [schools, schoolStats, search, sort])

  return (
    <div className="space-y-8">
      <div>
        <SectionTitle>검색</SectionTitle>
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="학교명 · 구·군"
          className="mt-3"
        />
      </div>

      <div>
        <SectionTitle>정렬</SectionTitle>
        <ul className="mt-3 space-y-0.5">
          {SORT_OPTIONS.map((opt) => (
            <li key={opt.value}>
              <button
                type="button"
                onClick={() => onSortChange(opt.value)}
                className={cn(
                  'w-full text-left py-1.5 text-sm transition-colors',
                  sort === opt.value
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
        <SectionTitle>학교 ({visible.length})</SectionTitle>
        <ul className="mt-3 max-h-[480px] overflow-y-auto space-y-0.5 -mx-1">
          {visible.map((school) => {
            const stats = schoolStats.get(school.code)
            const isActive = selectedCode === school.code
            const suspect = stats?.suspectBidCount ?? 0
            return (
              <li key={school.code}>
                <button
                  type="button"
                  onClick={() => onSelect(school.code)}
                  className={cn(
                    'w-full flex items-baseline justify-between gap-2 px-1 py-1.5 text-sm transition-colors text-left',
                    isActive
                      ? 'text-accent'
                      : 'text-ink-dim hover:text-ink',
                  )}
                >
                  <span className="flex-1 truncate">{school.name}</span>
                  <span className="font-mono text-[10px] text-ink-faint shrink-0">
                    {suspect}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
