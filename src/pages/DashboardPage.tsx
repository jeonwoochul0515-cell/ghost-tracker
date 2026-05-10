// 대시보드 — Hero + StatsStrip + 사이드바 필터 + ClusterCard 리스트(5개 페이지네이션)
import { useEffect, useMemo, useState } from 'react'
import { useClusters } from '@/hooks/useClusters'
import { useBids } from '@/hooks/useBids'
import { useFilterStore } from '@/stores/filterStore'
import { PageShell } from '@/components/layout/PageShell'
import { DisplayHeading } from '@/components/typography/DisplayHeading'
import { SectionTitle } from '@/components/typography/SectionTitle'
import { StatsStrip } from '@/features/clusters/StatsStrip'
import { ClusterCard } from '@/features/clusters/ClusterCard'
import { ClusterFilters } from '@/features/clusters/ClusterFilters'
import { cn } from '@/lib/cn'

const PAGE_SIZE = 5

export function DashboardPage() {
  const riskLevel = useFilterStore((s) => s.riskLevel)
  const district = useFilterStore((s) => s.district)
  const signals = useFilterStore((s) => s.signals)

  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  // filters 객체를 stringify 로 안정화
  const filtersKey = JSON.stringify({ riskLevel, district, signals })
  const filters = useMemo(() => JSON.parse(filtersKey), [filtersKey])

  const { data: rawClusters, loading, error } = useClusters(filters)
  const { data: bids } = useBids()

  // 검색 필터 (클라이언트 측: cluster.id / title / 멤버 사업자명·번호)
  const filtered = useMemo(() => {
    if (!rawClusters) return null
    const q = search.trim().toLowerCase()
    if (!q) return rawClusters
    return rawClusters.filter((c) => {
      if (c.id.toLowerCase().includes(q)) return true
      if (c.title.toLowerCase().includes(q)) return true
      return c.members.some(
        (m) =>
          m.bizName.toLowerCase().includes(q) ||
          m.bizNoMasked.toLowerCase().includes(q) ||
          m.bizNo.includes(q),
      )
    })
  }, [rawClusters, search])

  // 필터/검색 변경 시 1페이지로 리셋
  useEffect(() => {
    setPage(1)
  }, [filtersKey, search])

  const totalPages = filtered
    ? Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
    : 0
  const visible = filtered?.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE) ?? []

  return (
    <>
      {/* Hero */}
      <section className="border-b border-line relative z-10">
        <div className="max-w-[1400px] mx-auto px-8 py-16 md:py-24">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-ink-dim">
            Vol. 01 — 2026.01.03 — 04.30 — Public Interest Monitor
          </p>
          <DisplayHeading className="mt-6">
            <span className="italic">Ghost bidders</span>
            <br />
            in our school cafeterias.
          </DisplayHeading>
          <p className="mt-6 text-xl md:text-2xl font-serif-kr text-ink-dim max-w-2xl leading-relaxed">
            우리 아이들 식탁 뒤에 숨은 분신 응찰을 추적합니다.
          </p>
          <p className="mt-8 max-w-3xl text-ink-dim leading-relaxed text-base">
            부산 학교급식 식자재 입찰은{' '}
            <span className="text-ink">제한최저가 + 추첨</span> 방식이라 낙찰 확률이
            응찰 사업자 수에 좌우됩니다. 한 운영자가 가족·지인 명의로 사업자 N개를 만들어
            같은 추첨에 분산 응찰하면 당첨 확률이 N배로 부풀려지는 — 이른바
            <span className="text-accent"> "분신술"</span> 이 시장 왜곡의 핵심 메커니즘입니다.
            본 도구는 공공데이터(eaT · 국세청 · 도로명주소) 와 공개 판례를 결합해
            "같은 실체로 추정되는 사업자 클러스터" 를 자동 탐지하고 통계적 패턴으로 공개합니다.
          </p>
        </div>
      </section>

      {/* Stats Strip */}
      <div className="max-w-[1400px] mx-auto px-8 relative z-10">
        {rawClusters ? (
          <StatsStrip clusters={rawClusters} />
        ) : (
          <div className="border-y border-line py-10 text-ink-faint font-mono text-xs">
            통계 로딩 중...
          </div>
        )}
      </div>

      {/* Main grid */}
      <PageShell
        sidebar={
          <ClusterFilters
            clusters={rawClusters}
            search={search}
            onSearchChange={setSearch}
          />
        }
      >
        <div className="flex items-baseline justify-between border-b border-line pb-4 gap-4 flex-wrap">
          <SectionTitle>의심 클러스터</SectionTitle>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint">
            의심도 내림차순 · 총 {filtered?.length ?? 0}건
            {totalPages > 1 && ` · ${page} / ${totalPages} 페이지`}
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
            조건에 맞는 클러스터가 없습니다.
          </p>
        )}

        <div className="mt-8 space-y-6">
          {visible.map((c) => (
            <ClusterCard key={c.id} cluster={c} bids={bids ?? []} />
          ))}
        </div>

        {totalPages > 1 && (
          <nav className="mt-12 flex items-center justify-center gap-1 font-mono text-xs">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 text-ink-dim hover:text-ink disabled:opacity-30 disabled:pointer-events-none"
            >
              ←
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPage(p)}
                className={cn(
                  'size-8 inline-flex items-center justify-center transition-colors',
                  page === p
                    ? 'text-accent border border-accent'
                    : 'text-ink-dim hover:text-ink',
                )}
              >
                {p}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1 text-ink-dim hover:text-ink disabled:opacity-30 disabled:pointer-events-none"
            >
              →
            </button>
          </nav>
        )}

        <p className="mt-16 pt-8 border-t border-line text-xs text-ink-faint leading-relaxed max-w-3xl">
          본 화면은 공개정보 통계 결합으로 산출된 추정 결과를 보여주며, 위법 단정이 아닙니다.
          이의제기는{' '}
          <a href="/report" className="text-ink-dim hover:text-ink underline underline-offset-4">
            제보·이의제기 페이지
          </a>{' '}
          에서 접수되며, 24시간 내 비공개 처리됩니다.
        </p>
      </PageShell>
    </>
  )
}
