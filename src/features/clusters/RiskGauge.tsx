// 의심도 게이지 — 반원 호 (stroke-dasharray 로 % 표현). 색상은 위험도 등급에 따라.
import type { RiskLevel } from '@/types/domain'

interface RiskGaugeProps {
  score: number          // 0-100
  level: RiskLevel
  className?: string
}

const COLOR_BY_LEVEL: Record<RiskLevel, string> = {
  high: '#c14545',
  mid: '#d4843c',
  low: '#5a8a5a',
}

const LABEL_BY_LEVEL: Record<RiskLevel, string> = {
  high: '고위험',
  mid: '중간',
  low: '관찰',
}

export function RiskGauge({ score, level, className }: RiskGaugeProps) {
  const cx = 100
  const cy = 90
  const radius = 76
  const strokeWidth = 14
  const arcLength = Math.PI * radius
  const filled = Math.max(0, Math.min(100, score)) / 100
  const color = COLOR_BY_LEVEL[level]
  const path = `M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`

  return (
    <svg
      viewBox="0 0 200 110"
      className={className}
      role="img"
      aria-label={`의심도 ${score}점 / 100점`}
    >
      <path
        d={path}
        fill="none"
        stroke="#2a2825"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={`${filled * arcLength} ${arcLength}`}
      />
      <text
        x={cx}
        y={cy - 6}
        textAnchor="middle"
        className="font-display fill-ink"
        fontSize="42"
        fontWeight="900"
      >
        {score}
      </text>
      <text
        x={cx}
        y={cy + 14}
        textAnchor="middle"
        className="font-mono fill-ink-faint"
        fontSize="9"
        letterSpacing="0.25em"
      >
        {LABEL_BY_LEVEL[level].toUpperCase()} · /100
      </text>
    </svg>
  )
}
