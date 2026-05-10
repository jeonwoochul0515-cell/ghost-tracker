// 우측 선택 학교 요약 — 메타 + 통계 + 안전성 지수 + 상세 페이지 링크
import { Link } from 'react-router-dom'
import type { School } from '@/types/domain'
import { Card } from '@/components/ui/Card'
import { SectionTitle } from '@/components/typography/SectionTitle'
import { safetyScore, type SchoolBidStats } from './aggregate'
import { SafetyGauge } from './SafetyGauge'
import { formatKRW } from '@/lib/format'

interface SchoolSummaryProps {
  school: School | null
  stats: SchoolBidStats | null
}

export function SchoolSummary({ school, stats }: SchoolSummaryProps) {
  if (!school) {
    return (
      <Card className="p-6">
        <p className="text-sm text-ink-faint leading-relaxed">
          지도에서 학교를 클릭하거나 좌측 목록에서 선택하세요.
        </p>
      </Card>
    )
  }
  const safety = stats ? safetyScore(stats) : null

  return (
    <Card className="p-6 space-y-6">
      <div>
        <SectionTitle>{school.district}</SectionTitle>
        <h3 className="mt-2 font-display italic font-black text-2xl leading-tight text-ink">
          {school.name}
        </h3>
        <p className="mt-1 text-sm text-ink-dim">{school.address}</p>
        <p className="mt-1 text-xs text-ink-faint font-mono">
          {school.code} · 학생수 {school.studentCount.toLocaleString('ko-KR')}명
        </p>
      </div>

      {stats && (
        <dl className="grid grid-cols-2 gap-4 text-sm pt-4 border-t border-line">
          <div>
            <dt className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint">
              응찰 건수
            </dt>
            <dd className="mt-1 font-display font-black text-xl tabular-nums text-ink">
              {stats.bidCount}
            </dd>
          </div>
          <div>
            <dt className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint">
              의심 응찰
            </dt>
            <dd className="mt-1 font-display font-black text-xl tabular-nums text-warning">
              {stats.suspectBidCount}
            </dd>
          </div>
          <div>
            <dt className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint">
              의심 낙찰
            </dt>
            <dd className="mt-1 font-display font-black text-xl tabular-nums text-danger">
              {stats.suspectWinCount}
            </dd>
          </div>
          <div>
            <dt className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint">
              총 낙찰액
            </dt>
            <dd className="mt-1 text-ink">{formatKRW(stats.totalWinAmount)}</dd>
          </div>
        </dl>
      )}

      {safety && (
        <div className="pt-4 border-t border-line">
          <SafetyGauge score={safety.score} description={safety.description} />
        </div>
      )}

      <Link
        to={`/schools/${school.code}`}
        className="inline-block font-mono text-[10px] uppercase tracking-[0.2em] text-accent hover:text-ink transition-colors"
      >
        학교 상세 페이지 →
      </Link>
    </Card>
  )
}
