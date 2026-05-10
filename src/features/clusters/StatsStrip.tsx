// 4분할 통계 — 의심 클러스터 / 관찰 사업자 / 상위 10 합산 낙찰 / 평균 분신 배수
import { useMemo, type CSSProperties } from 'react'
import type { Cluster } from '@/types/domain'
import { StatNumber } from '@/components/typography/StatNumber'
import { SectionTitle } from '@/components/typography/SectionTitle'
import { formatKRW, formatRatio } from '@/lib/format'

interface StatsStripProps {
  clusters: Cluster[]
}

function splitNumberAndUnit(formatted: string): {
  value: string
  unit: string
} {
  const m = formatted.match(/^(-?[\d.]+)(.*)$/)
  return m
    ? { value: m[1], unit: m[2].trim() }
    : { value: formatted, unit: '' }
}

export function StatsStrip({ clusters }: StatsStripProps) {
  const items = useMemo(() => {
    const sorted = [...clusters].sort((a, b) => b.riskScore - a.riskScore)
    const top10 = sorted.slice(0, 10)
    const businessCount = clusters.reduce(
      (sum, c) => sum + c.members.length,
      0,
    )
    const top10Win = top10.reduce((sum, c) => sum + c.stats.totalWinAmount, 0)
    const avgMultiplier =
      clusters.length === 0
        ? 0
        : clusters.reduce((sum, c) => sum + c.stats.multiplier, 0) /
          clusters.length

    const krw = splitNumberAndUnit(formatKRW(top10Win))
    const ratio = splitNumberAndUnit(formatRatio(avgMultiplier))

    return [
      { label: '의심 클러스터', value: clusters.length, unit: '개' },
      { label: '관찰 사업자', value: businessCount, unit: '명' },
      { label: '상위 10 합산 낙찰액', value: krw.value, unit: krw.unit },
      { label: '평균 분신 배수', value: ratio.value, unit: ratio.unit },
    ]
  }, [clusters])

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 border-y border-line py-10 gap-x-8 gap-y-6">
      {items.map((item, i) => (
        <div
          key={item.label}
          className="stagger-fade-up"
          style={{ ['--i' as string]: i } as CSSProperties}
        >
          <SectionTitle>{item.label}</SectionTitle>
          <div className="mt-3">
            <StatNumber value={item.value} unit={item.unit} />
          </div>
        </div>
      ))}
    </div>
  )
}
