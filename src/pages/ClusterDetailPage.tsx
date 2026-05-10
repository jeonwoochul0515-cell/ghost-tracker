// 클러스터 상세 — 상단 패널 + 신호 4분할 + 멤버 테이블(drawer) + 시계열 + 지도 + 판례 + 액션바
import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useCluster } from '@/hooks/useCluster'
import { useBids } from '@/hooks/useBids'
import { useSchools } from '@/hooks/useSchools'
import { useCases } from '@/hooks/useCases'
import { PageShell } from '@/components/layout/PageShell'
import { DisplayHeading } from '@/components/typography/DisplayHeading'
import { SectionTitle } from '@/components/typography/SectionTitle'
import { Badge } from '@/components/ui/Badge'
import { RiskGauge } from '@/features/clusters/RiskGauge'
import { SignalPanel } from '@/features/clusters/SignalPanel'
import { ClusterTimeSeriesChart } from '@/features/clusters/ClusterTimeSeriesChart'
import { SchoolMap } from '@/features/clusters/SchoolMap'
import { MatchedCases } from '@/features/clusters/MatchedCases'
import { ActionBar } from '@/features/clusters/ActionBar'
import { MemberDrawer } from '@/features/clusters/MemberDrawer'
import { FoiaDialog } from '@/features/clusters/FoiaDialog'
import {
  aggregateMembers,
  aggregateMonthly,
  aggregateSchoolWins,
} from '@/features/clusters/aggregate'
import { formatKRW, formatRatio } from '@/lib/format'
import type { Cluster } from '@/types/domain'

const RISK_LABEL: Record<Cluster['riskLevel'], string> = {
  high: '고위험',
  mid: '중간',
  low: '관찰',
}

const STATUS_LABEL: Record<'active' | 'closed' | 'reopened', string> = {
  active: '운영',
  closed: '폐업',
  reopened: '재개',
}

export function ClusterDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: cluster, loading, error } = useCluster(id)
  const { data: bids } = useBids()
  const { data: schools } = useSchools()
  const { data: cases } = useCases()

  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null)
  const [foiaOpen, setFoiaOpen] = useState(false)

  const memberStats = useMemo(() => {
    if (!cluster || !bids) return []
    return aggregateMembers(bids, cluster)
  }, [cluster, bids])

  const monthly = useMemo(() => {
    if (!cluster || !bids) return []
    return aggregateMonthly(bids, cluster)
  }, [cluster, bids])

  const schoolWins = useMemo(() => {
    if (!cluster || !bids || !schools) return []
    const wins = aggregateSchoolWins(bids, cluster)
    return wins
      .map((w) => {
        const school = schools.find((s) => s.code === w.schoolCode)
        return school ? { school, wins: w.wins } : null
      })
      .filter((x): x is { school: typeof schools[number]; wins: number } => x !== null)
  }, [cluster, bids, schools])

  const selectedMember = cluster?.members.find((m) => m.bizNo === selectedMemberId) ?? null
  const selectedStats = memberStats.find((s) => s.bizNo === selectedMemberId) ?? null

  if (loading) {
    return (
      <PageShell>
        <p className="text-ink-dim font-mono text-xs uppercase tracking-[0.2em]">
          로딩 중...
        </p>
      </PageShell>
    )
  }

  if (error || !cluster) {
    return (
      <PageShell>
        <SectionTitle>오류</SectionTitle>
        <DisplayHeading as="h1" className="mt-3">
          클러스터를 찾을 수 없습니다
        </DisplayHeading>
        <p className="mt-6 text-ink-dim">
          {error?.message ?? `ID "${id}" 에 해당하는 클러스터가 없습니다.`}
        </p>
        <Link
          to="/"
          className="mt-6 inline-block font-mono text-xs uppercase tracking-[0.2em] text-accent"
        >
          ← 대시보드로
        </Link>
      </PageShell>
    )
  }

  return (
    <>
      <PageShell>
        {/* ─── 1. 상단 패널 ─── */}
        <section className="grid grid-cols-1 md:grid-cols-[1fr_240px] gap-8 items-start border-b border-line pb-10">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-ink-dim">
              {cluster.id} · {cluster.period.from} ~ {cluster.period.to}
            </p>
            <DisplayHeading as="h1" className="mt-4">
              <span className="italic">{cluster.titleEn}</span>
            </DisplayHeading>
            <p className="mt-2 text-ink-dim text-xl">{cluster.title}</p>
            <div className="mt-6 flex flex-wrap items-center gap-3 text-sm">
              <Badge
                variant={
                  cluster.riskLevel === 'high'
                    ? 'high'
                    : cluster.riskLevel === 'mid'
                      ? 'mid'
                      : 'low'
                }
              >
                {RISK_LABEL[cluster.riskLevel]} · {cluster.riskScore}
              </Badge>
              <span className="text-ink-dim">{cluster.district}</span>
              <span className="text-ink-faint">·</span>
              <span className="text-ink-dim">{cluster.locationLabel}</span>
            </div>
            <dl className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-3 text-sm">
              <div>
                <dt className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint">
                  멤버
                </dt>
                <dd className="mt-1 font-display font-black text-2xl tabular-nums text-ink">
                  {cluster.members.length}
                </dd>
              </div>
              <div>
                <dt className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint">
                  학교
                </dt>
                <dd className="mt-1 font-display font-black text-2xl tabular-nums text-ink">
                  {cluster.stats.schoolCount}
                </dd>
              </div>
              <div>
                <dt className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint">
                  합산 낙찰
                </dt>
                <dd className="mt-1 text-ink">
                  {formatKRW(cluster.stats.totalWinAmount)}
                </dd>
              </div>
              <div>
                <dt className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint">
                  분신 배수
                </dt>
                <dd className="mt-1 text-accent font-mono">
                  {formatRatio(cluster.stats.multiplier)}
                </dd>
              </div>
            </dl>
          </div>
          <div className="self-start">
            <RiskGauge
              score={cluster.riskScore}
              level={cluster.riskLevel}
              className="w-full max-w-[240px]"
            />
          </div>
        </section>

        {/* ─── 2. 신호 패널 ─── */}
        <section className="mt-12">
          <SectionTitle>핵심 신호</SectionTitle>
          <div className="mt-4">
            <SignalPanel cluster={cluster} />
          </div>
        </section>

        {/* ─── 3. 멤버 테이블 ─── */}
        <section className="mt-16">
          <SectionTitle>구성 사업자</SectionTitle>
          <p className="mt-2 text-xs text-ink-faint">
            행을 클릭하면 사업자 디테일이 우측에 슬라이드 됩니다.
          </p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-line">
                  <th className="py-3 pr-4 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint font-normal">사업자번호</th>
                  <th className="py-3 pr-4 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint font-normal">대표</th>
                  <th className="py-3 pr-4 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint font-normal">개업</th>
                  <th className="py-3 pr-4 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint font-normal">폐업</th>
                  <th className="py-3 pr-4 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint font-normal">상태</th>
                  <th className="py-3 pl-4 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint font-normal text-right">낙찰/응찰</th>
                </tr>
              </thead>
              <tbody>
                {cluster.members.map((m) => {
                  const s = memberStats.find((it) => it.bizNo === m.bizNo)
                  return (
                    <tr
                      key={m.bizNo}
                      onClick={() => setSelectedMemberId(m.bizNo)}
                      className="border-b border-line/50 cursor-pointer hover:bg-bg-3/40 transition-colors"
                    >
                      <td className="py-3 pr-4 font-mono text-xs text-ink">{m.bizNoMasked}</td>
                      <td className="py-3 pr-4 text-ink">{m.repNameMasked}</td>
                      <td className="py-3 pr-4 font-mono text-xs text-ink-dim">{m.openDate}</td>
                      <td className="py-3 pr-4 font-mono text-xs text-ink-faint">
                        {m.closeDate ?? '—'}
                      </td>
                      <td className="py-3 pr-4 text-ink-dim text-xs">
                        {STATUS_LABEL[m.status]}
                      </td>
                      <td className="py-3 pl-4 text-right font-mono text-xs">
                        <span className="text-accent">{s?.wins ?? 0}</span>
                        <span className="text-ink-faint mx-1">/</span>
                        <span className="text-ink">{s?.bids ?? 0}</span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* ─── 4. 시계열 차트 ─── */}
        <section className="mt-16">
          <SectionTitle>응찰·낙찰 시계열</SectionTitle>
          <p className="mt-2 text-xs text-ink-faint">
            X축: 월 (YY-MM) · 좌측 Y: 응찰 수 · 우측 Y: 합산 낙찰액
          </p>
          <div className="mt-6">
            <ClusterTimeSeriesChart monthly={monthly} />
          </div>
        </section>

        {/* ─── 5. 학교 분포 지도 ─── */}
        <section className="mt-16">
          <SectionTitle>학교 분포</SectionTitle>
          <p className="mt-2 text-xs text-ink-faint">
            마커 크기는 해당 학교에서의 클러스터 낙찰 횟수에 비례합니다.
          </p>
          <div className="mt-6">
            <SchoolMap schoolWins={schoolWins} />
          </div>
        </section>

        {/* ─── 6. 매칭 판례 ─── */}
        <section className="mt-16">
          <SectionTitle>매칭 판례</SectionTitle>
          <div className="mt-6">
            <MatchedCases cluster={cluster} cases={cases ?? []} />
          </div>
        </section>

        {/* ─── 7. 면책 ─── */}
        <section className="mt-16 pt-8 border-t border-line">
          <p className="text-xs text-ink-faint leading-relaxed max-w-3xl">
            본 추적은 공개정보 통계 결합으로 산출된 패턴 추정이며 위법 단정이 아닙니다.
            사업자번호·대표자명·주소는 마스킹되어 표시되며, 이의제기는{' '}
            <Link to="/report" className="text-ink-dim hover:text-ink underline underline-offset-4">
              제보·이의제기 페이지
            </Link>{' '}
            에서 접수되며 24시간 내 비공개 처리됩니다. 출처: 공공데이터포털(eaT · 국세청) ·
            도로명주소 · 사법정보공유포털 / 라이선스 공공누리 1유형.
          </p>
        </section>
      </PageShell>

      {/* ─── 8. Sticky Action Bar ─── */}
      <ActionBar
        onFoia={() => setFoiaOpen(true)}
        onObjection={() =>
          navigate(`/report?cluster_id=${encodeURIComponent(cluster.id)}`)
        }
        onCsv={() => console.info(`[${cluster.id}] CSV 다운로드 (P12 후 구현)`)}
        onShare={() => {
          void navigator.clipboard?.writeText(window.location.href)
          console.info(`[${cluster.id}] 공유 링크 복사됨`)
        }}
      />

      {/* ─── 9. Member Drawer ─── */}
      <MemberDrawer
        member={selectedMember}
        stats={selectedStats}
        onClose={() => setSelectedMemberId(null)}
      />

      {/* ─── 10. FOIA Dialog ─── */}
      <FoiaDialog
        cluster={cluster}
        open={foiaOpen}
        onClose={() => setFoiaOpen(false)}
      />
    </>
  )
}
