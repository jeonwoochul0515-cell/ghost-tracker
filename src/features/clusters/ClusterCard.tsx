// 클러스터 카드 — 헤더(ID/기간/위험도) · 제목 · 정보+신호 · 클릭 시 expanded(멤버표/관계망/타임라인/액션)
import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Bid, Cluster, ClusterSignal } from '@/types/domain'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { useUiStore } from '@/stores/uiStore'
import { aggregateMembers, aggregateMonthly } from './aggregate'
import { TimelineBars } from './TimelineBars'
import { NetworkGraph } from './NetworkGraph'
import { formatKRW, formatRatio } from '@/lib/format'
import { cn } from '@/lib/cn'

interface ClusterCardProps {
  cluster: Cluster
  bids: Bid[]
}

const RISK_META: Record<
  Cluster['riskLevel'],
  { label: string; variant: 'high' | 'mid' | 'low' }
> = {
  high: { label: '고위험', variant: 'high' },
  mid: { label: '중간', variant: 'mid' },
  low: { label: '관찰', variant: 'low' },
}

const STATUS_LABEL: Record<
  'active' | 'closed' | 'reopened',
  string
> = { active: '운영', closed: '폐업', reopened: '재개' }

function signalClass(level: ClusterSignal['level']): string {
  if (level === 'S+' || level === 'S') return 'text-danger border-danger/40'
  if (level === 'A') return 'text-warning border-warning/40'
  return 'text-ink-faint border-line'
}

export function ClusterCard({ cluster, bids }: ClusterCardProps) {
  const navigate = useNavigate()
  const expanded = useUiStore((s) => s.expandedClusterIds.includes(cluster.id))
  const toggleExpanded = useUiStore((s) => s.toggleExpandedCluster)

  const memberStats = useMemo(
    () => aggregateMembers(bids, cluster),
    [bids, cluster],
  )
  const monthly = useMemo(
    () => aggregateMonthly(bids, cluster),
    [bids, cluster],
  )

  const risk = RISK_META[cluster.riskLevel]

  return (
    <Card className="p-0 overflow-hidden">
      <button
        type="button"
        onClick={() => toggleExpanded(cluster.id)}
        aria-expanded={expanded}
        className="w-full text-left p-6 hover:bg-bg-3/40 transition-colors"
      >
        <div className="flex items-baseline justify-between gap-4 flex-wrap">
          <div className="flex items-baseline gap-3 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-dim">
            <span>{cluster.id}</span>
            <span className="text-ink-faint">·</span>
            <span>
              {cluster.period.from} — {cluster.period.to}
            </span>
            <span className="text-ink-faint">·</span>
            <span>{cluster.district}</span>
          </div>
          <Badge variant={risk.variant}>
            {risk.label} {cluster.riskScore}
          </Badge>
        </div>
        <h3 className="mt-4 font-display italic font-black text-2xl md:text-[2rem] leading-[1.05] text-ink">
          {cluster.titleEn}
        </h3>
        <p className="mt-1 text-ink-dim">{cluster.title}</p>
        <div className="mt-6 grid md:grid-cols-2 gap-6">
          <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm self-start">
            <dt className="text-ink-faint font-mono text-[10px] uppercase tracking-[0.2em]">멤버</dt>
            <dd className="text-ink">{cluster.members.length}명</dd>
            <dt className="text-ink-faint font-mono text-[10px] uppercase tracking-[0.2em]">학교</dt>
            <dd className="text-ink">{cluster.stats.schoolCount}개교</dd>
            <dt className="text-ink-faint font-mono text-[10px] uppercase tracking-[0.2em]">합산 낙찰</dt>
            <dd className="text-ink">{formatKRW(cluster.stats.totalWinAmount)}</dd>
            <dt className="text-ink-faint font-mono text-[10px] uppercase tracking-[0.2em]">분신 배수</dt>
            <dd className="text-accent font-mono">{formatRatio(cluster.stats.multiplier)}</dd>
          </dl>
          <ul className="space-y-2">
            {cluster.signals.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span
                  className={cn(
                    'font-mono text-[9px] uppercase mt-0.5 px-1.5 py-0.5 border',
                    signalClass(s.level),
                  )}
                >
                  {s.level}
                </span>
                <span className="text-ink-dim flex-1 leading-relaxed">{s.text}</span>
              </li>
            ))}
          </ul>
        </div>
      </button>

      {expanded && (
        <div className="border-t border-line p-6 space-y-10 bg-bg-3/30">
          <section>
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-ink-dim mb-4">
              구성 사업자
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b border-line">
                    <th className="py-2 pr-4 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint font-normal">
                      사업자번호
                    </th>
                    <th className="py-2 pr-4 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint font-normal">
                      대표
                    </th>
                    <th className="py-2 pr-4 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint font-normal">
                      개업
                    </th>
                    <th className="py-2 pr-4 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint font-normal">
                      상태
                    </th>
                    <th className="py-2 pl-4 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint font-normal text-right">
                      낙찰/응찰
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {cluster.members.map((m) => {
                    const s = memberStats.find((it) => it.bizNo === m.bizNo)
                    return (
                      <tr key={m.bizNo} className="border-b border-line/50">
                        <td className="py-2 pr-4 font-mono text-xs text-ink">
                          {m.bizNoMasked}
                        </td>
                        <td className="py-2 pr-4 text-ink">{m.repNameMasked}</td>
                        <td className="py-2 pr-4 font-mono text-xs text-ink-dim">
                          {m.openDate}
                        </td>
                        <td className="py-2 pr-4 text-ink-dim text-xs">
                          {STATUS_LABEL[m.status]}
                          {m.closeDate && (
                            <span className="ml-1 text-ink-faint">
                              ({m.closeDate})
                            </span>
                          )}
                        </td>
                        <td className="py-2 pl-4 text-right font-mono text-xs">
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

          <section className="grid md:grid-cols-2 gap-8 items-start">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-ink-dim mb-4">
                관계망
              </p>
              <NetworkGraph
                clusterId={cluster.id}
                members={cluster.members}
                stats={memberStats}
              />
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-ink-dim mb-4">
                24개월 타임라인
              </p>
              <TimelineBars data={monthly} />
              <div className="mt-3 flex items-center gap-4 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint">
                <span className="inline-flex items-center gap-1.5">
                  <span className="size-2 bg-accent" /> 낙찰
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="size-2 bg-ink-faint/60" /> 응찰
                </span>
                <span className="ml-auto">
                  {monthly[0]?.month} → {monthly[monthly.length - 1]?.month}
                </span>
              </div>
            </div>
          </section>

          <section className="flex flex-wrap gap-3 pt-2 border-t border-line/50">
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate(`/clusters/${cluster.id}`)}
            >
              상세 보기
            </Button>
            <Button variant="ghost" size="sm">정보공개청구</Button>
            <Button variant="ghost" size="sm">CSV 다운로드</Button>
            <Button variant="ghost" size="sm">공유 링크</Button>
          </section>
        </div>
      )}
    </Card>
  )
}
