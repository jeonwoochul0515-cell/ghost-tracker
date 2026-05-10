// 학교 상세 — 메타 + 통계 + TOP 응찰자 + 의심 클러스터 응찰 타임라인 + 안전성 지수
import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useSchool } from '@/hooks/useSchool'
import { useBids } from '@/hooks/useBids'
import { useClusters } from '@/hooks/useClusters'
import { PageShell } from '@/components/layout/PageShell'
import { DisplayHeading } from '@/components/typography/DisplayHeading'
import { SectionTitle } from '@/components/typography/SectionTitle'
import {
  aggregateSchoolStats,
  safetyScore,
  topBidders,
} from '@/features/schools/aggregate'
import { SafetyGauge } from '@/features/schools/SafetyGauge'
import { TopBidders } from '@/features/schools/TopBidders'
import { SchoolBidHistory } from '@/features/schools/SchoolBidHistory'
import { formatKRW } from '@/lib/format'

export function SchoolDetailPage() {
  const { code } = useParams<{ code: string }>()
  const { data: school, loading, error } = useSchool(code)
  const { data: bids } = useBids({ schoolCode: code })
  const { data: clusters } = useClusters()

  const stats = useMemo(() => {
    if (!bids || !clusters || !code) return null
    return aggregateSchoolStats(bids, code, clusters)
  }, [bids, clusters, code])

  const topRows = useMemo(() => {
    if (!bids || !clusters || !code) return []
    return topBidders(bids, code, clusters, 10)
  }, [bids, clusters, code])

  const safety = stats ? safetyScore(stats) : null

  if (loading) {
    return (
      <PageShell>
        <p className="text-ink-dim font-mono text-xs uppercase tracking-[0.2em]">
          로딩 중...
        </p>
      </PageShell>
    )
  }

  if (error || !school) {
    return (
      <PageShell>
        <SectionTitle>오류</SectionTitle>
        <DisplayHeading as="h1" className="mt-3">
          학교를 찾을 수 없습니다
        </DisplayHeading>
        <p className="mt-6 text-ink-dim">
          {error?.message ?? `코드 "${code}" 에 해당하는 학교가 없습니다.`}
        </p>
        <Link
          to="/schools"
          className="mt-6 inline-block font-mono text-xs uppercase tracking-[0.2em] text-accent"
        >
          ← 학교별 보기로
        </Link>
      </PageShell>
    )
  }

  return (
    <PageShell>
      {/* 메타 */}
      <section className="border-b border-line pb-10">
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-ink-dim">
          {school.code} · {school.district}
        </p>
        <DisplayHeading as="h1" className="mt-3">
          {school.name}
        </DisplayHeading>
        <p className="mt-4 text-ink-dim">{school.address}</p>
        <p className="mt-1 text-sm text-ink-faint font-mono">
          학생수 {school.studentCount.toLocaleString('ko-KR')}명 · ({school.lat.toFixed(4)},{' '}
          {school.lon.toFixed(4)})
        </p>
      </section>

      {/* 통계 */}
      {stats && (
        <section className="mt-10">
          <SectionTitle>최근 입찰 통계</SectionTitle>
          <p className="mt-2 text-xs text-ink-faint">
            시드 데이터 기준 24개월 누적 통계입니다.
          </p>
          <dl className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-6">
            <div>
              <dt className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint">
                응찰 건수
              </dt>
              <dd className="mt-2 font-display font-black text-3xl tabular-nums text-ink">
                {stats.bidCount}
              </dd>
            </div>
            <div>
              <dt className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint">
                평균 응찰자
              </dt>
              <dd className="mt-2 font-display font-black text-3xl tabular-nums text-ink">
                {stats.avgParticipants.toFixed(1)}
              </dd>
            </div>
            <div>
              <dt className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint">
                의심 응찰 / 낙찰
              </dt>
              <dd className="mt-2 font-display font-black text-3xl tabular-nums">
                <span className="text-warning">{stats.suspectBidCount}</span>
                <span className="text-ink-faint mx-1">/</span>
                <span className="text-danger">{stats.suspectWinCount}</span>
              </dd>
            </div>
            <div>
              <dt className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint">
                총 의심 낙찰액
              </dt>
              <dd className="mt-2 text-ink text-2xl font-display font-black">
                {formatKRW(stats.totalWinAmount)}
              </dd>
            </div>
          </dl>
        </section>
      )}

      {/* 안전성 지수 */}
      {safety && (
        <section className="mt-12 pt-8 border-t border-line max-w-2xl">
          <SafetyGauge score={safety.score} description={safety.description} />
          <p className="mt-4 text-xs text-ink-faint leading-relaxed">
            안전성 지수는 전체 응찰 대비 의심 클러스터 응찰 비율로 산출됩니다.
            계산 방법은{' '}
            <Link
              to="/methodology"
              className="text-ink-dim hover:text-ink underline underline-offset-4"
            >
              방법론 페이지
            </Link>
            에서 확인할 수 있습니다.
          </p>
        </section>
      )}

      {/* TOP 응찰자 */}
      <section className="mt-16">
        <SectionTitle>단골 응찰자 TOP {Math.min(10, topRows.length)}</SectionTitle>
        <p className="mt-2 text-xs text-ink-faint">
          클러스터 소속이 표시된 사업자는 의심 클러스터 멤버입니다 — 행 클릭 시 클러스터 상세로 이동.
        </p>
        <div className="mt-6">
          <TopBidders rows={topRows} />
        </div>
      </section>

      {/* 의심 클러스터 응찰 타임라인 */}
      <section className="mt-16">
        <SectionTitle>응찰 이력</SectionTitle>
        <p className="mt-2 text-xs text-ink-faint">최근 30건까지 표시.</p>
        <div className="mt-6">
          <SchoolBidHistory bids={bids ?? []} clusters={clusters ?? []} />
        </div>
      </section>

      {/* 면책 */}
      <section className="mt-16 pt-8 border-t border-line">
        <p className="text-xs text-ink-faint leading-relaxed max-w-3xl">
          본 추적은 공개정보 통계 결합으로 산출된 패턴 추정이며 위법 단정이 아닙니다.
          학교 안전성 지수는 의심 클러스터 응찰 빈도에 따른 통계 지표일 뿐, 학교
          자체의 신뢰도를 평가하는 수치가 아닙니다. 이의제기는{' '}
          <Link
            to="/report"
            className="text-ink-dim hover:text-ink underline underline-offset-4"
          >
            제보·이의제기 페이지
          </Link>
          에서 접수됩니다.
        </p>
      </section>
    </PageShell>
  )
}
