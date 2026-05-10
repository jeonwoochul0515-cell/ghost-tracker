// 판례 라이브러리 — 좌측 필터(죄명/결과/패턴/연도) + 우측 카드 그리드
import { useMemo, useState } from 'react'
import { useCases } from '@/hooks/useCases'
import { PageShell } from '@/components/layout/PageShell'
import { DisplayHeading } from '@/components/typography/DisplayHeading'
import { SectionTitle } from '@/components/typography/SectionTitle'
import { CaseFilters, type VerdictFilter } from '@/features/cases/CaseFilters'
import { CaseCard } from '@/features/cases/CaseCard'
import {
  inferCharges,
  inferPatterns,
  inferYear,
  type Charge,
  type PatternTag,
} from '@/features/cases/classify'

export function CasesPage() {
  const { data: cases, loading, error } = useCases()

  const [charges, setCharges] = useState<Charge[]>([])
  const [verdict, setVerdict] = useState<VerdictFilter>('all')
  const [patterns, setPatterns] = useState<PatternTag[]>([])
  const [years, setYears] = useState<number[]>([])

  const filtered = useMemo(() => {
    if (!cases) return null
    return cases.filter((c) => {
      if (verdict !== 'all' && c.verdict !== verdict) return false
      if (charges.length > 0) {
        const cc = inferCharges(c)
        if (!charges.some((ch) => cc.includes(ch))) return false
      }
      if (patterns.length > 0) {
        const cp = inferPatterns(c)
        if (!patterns.some((p) => cp.includes(p))) return false
      }
      if (years.length > 0) {
        if (!years.includes(inferYear(c))) return false
      }
      return true
    })
  }, [cases, charges, verdict, patterns, years])

  return (
    <PageShell
      sidebar={
        <CaseFilters
          cases={cases ?? []}
          charges={charges}
          onChargesChange={setCharges}
          verdict={verdict}
          onVerdictChange={setVerdict}
          patterns={patterns}
          onPatternsChange={setPatterns}
          years={years}
          onYearsChange={setYears}
        />
      }
    >
      <SectionTitle>판례 라이브러리</SectionTitle>
      <DisplayHeading as="h1" className="mt-3">
        Cases
      </DisplayHeading>
      <p className="mt-3 text-ink-dim max-w-2xl leading-relaxed">
        학교급식 입찰방해·사기·담합 등의 공개 판례를 수집해 패턴별로 분류합니다.
        본 라이브러리는 시드 단계에서 가상 사건 8건으로 시작하며, 추후
        사법정보공유포털 API 연결 시 실제 판례로 갱신됩니다.
      </p>

      <div className="mt-10 flex items-baseline justify-between border-b border-line pb-4 gap-4 flex-wrap">
        <SectionTitle>사건 목록</SectionTitle>
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint">
          총 {filtered?.length ?? 0}건 / 전체 {cases?.length ?? 0}건
        </p>
      </div>

      {loading && (
        <p className="mt-12 text-ink-dim font-mono text-xs uppercase tracking-[0.2em]">
          로딩 중...
        </p>
      )}
      {error && (
        <p className="mt-12 text-danger font-mono text-xs">
          에러: {error.message}
        </p>
      )}
      {!loading && filtered && filtered.length === 0 && (
        <p className="mt-12 text-ink-dim font-mono text-xs uppercase tracking-[0.2em]">
          조건에 맞는 판례가 없습니다.
        </p>
      )}

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered?.map((c) => (
          <CaseCard key={c.id} c={c} />
        ))}
      </div>

      <p className="mt-16 pt-8 border-t border-line text-xs text-ink-faint leading-relaxed max-w-3xl">
        본 시드 데이터는 모두 (가상) 표기된 가짜 사건입니다. 실제 판례 연결은
        사법정보공유포털 API 인가를 받은 후 진행됩니다. 각 판례에 대한 매칭
        클러스터는 통계적 패턴 유사성을 의미하며 위법 단정이 아닙니다.
      </p>
    </PageShell>
  )
}
