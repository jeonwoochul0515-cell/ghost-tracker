// 학교별 보기 — 좌측 검색·정렬·리스트 / 가운데 부산 지도 / 우측 선택 학교 요약
import { useMemo, useState } from 'react'
import { useSchools } from '@/hooks/useSchools'
import { useBids } from '@/hooks/useBids'
import { useClusters } from '@/hooks/useClusters'
import { DisplayHeading } from '@/components/typography/DisplayHeading'
import { SectionTitle } from '@/components/typography/SectionTitle'
import { SchoolFilters, type SchoolSort } from '@/features/schools/SchoolFilters'
import { SchoolListMap } from '@/features/schools/SchoolListMap'
import { SchoolSummary } from '@/features/schools/SchoolSummary'
import {
  aggregateSchoolStats,
  type SchoolBidStats,
} from '@/features/schools/aggregate'

export function SchoolsPage() {
  const { data: schools } = useSchools()
  const { data: bids } = useBids()
  const { data: clusters } = useClusters()

  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<SchoolSort>('suspect')
  const [selectedCode, setSelectedCode] = useState<string | null>(null)

  const schoolStats = useMemo(() => {
    const map = new Map<string, SchoolBidStats>()
    if (!schools || !bids || !clusters) return map
    for (const school of schools) {
      map.set(school.code, aggregateSchoolStats(bids, school.code, clusters))
    }
    return map
  }, [schools, bids, clusters])

  const selectedSchool =
    schools?.find((s) => s.code === selectedCode) ?? null
  const selectedStats = selectedCode
    ? schoolStats.get(selectedCode) ?? null
    : null

  return (
    <div className="max-w-[1500px] mx-auto px-8 py-12 relative z-10">
      <SectionTitle>학교별 보기</SectionTitle>
      <DisplayHeading as="h1" className="mt-3">
        Schools
      </DisplayHeading>
      <p className="mt-3 text-ink-dim max-w-2xl">
        부산 16개 구·군 50개 학교의 입찰 패턴을 한 화면에서 살펴봅니다. 마커
        색상은 의심 클러스터 응찰 빈도(없음 → 회색 / 1~2건 → 주황 / 3건 이상 → 빨강)를
        의미합니다.
      </p>

      <div className="mt-10 grid grid-cols-1 lg:grid-cols-[260px_1fr_360px] gap-8">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          {schools && (
            <SchoolFilters
              schools={schools}
              schoolStats={schoolStats}
              search={search}
              onSearchChange={setSearch}
              sort={sort}
              onSortChange={setSort}
              selectedCode={selectedCode}
              onSelect={setSelectedCode}
            />
          )}
        </aside>

        <main>
          <SchoolListMap
            schools={schools ?? []}
            schoolStats={schoolStats}
            selectedCode={selectedCode}
            onSelect={setSelectedCode}
          />
        </main>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <SchoolSummary school={selectedSchool} stats={selectedStats} />
        </aside>
      </div>

      <p className="mt-16 pt-8 border-t border-line text-xs text-ink-faint leading-relaxed max-w-3xl">
        본 정보는 공개정보 통계 결합으로 산출된 추정이며 위법 단정이 아닙니다.
        시드 단계에서는 50개 학교만 표시됩니다 — 실제 운영 시 부산 600개교로 확장됩니다.
      </p>
    </div>
  )
}
