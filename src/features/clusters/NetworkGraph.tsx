// 클러스터 관계망 — SVG 원형 배치 (5명까지), 중앙=클러스터 / 외곽=멤버 / 점선 연결
import type { Business } from '@/types/domain'
import type { MemberStats } from './aggregate'

interface NetworkGraphProps {
  clusterId: string
  members: Business[]
  stats: MemberStats[]
  className?: string
}

export function NetworkGraph({
  clusterId,
  members,
  stats,
  className,
}: NetworkGraphProps) {
  const visible = members.slice(0, 5)
  const cx = 200
  const cy = 150
  const radius = 100
  return (
    <svg
      viewBox="0 0 400 280"
      className={`w-full max-w-md ${className ?? ''}`}
      role="img"
      aria-label="클러스터 관계망"
    >
      <circle cx={cx} cy={cy} r={6} fill="#d4ad3c" />
      <text
        x={cx}
        y={cy + 22}
        textAnchor="middle"
        className="font-mono fill-ink-dim"
        fontSize="10"
        letterSpacing="0.15em"
      >
        {clusterId}
      </text>
      {visible.map((member, i) => {
        const angle = -Math.PI / 2 + (i * 2 * Math.PI) / visible.length
        const x = cx + Math.cos(angle) * radius
        const y = cy + Math.sin(angle) * radius
        const s = stats.find((it) => it.bizNo === member.bizNo)
        return (
          <g key={member.bizNo}>
            <line
              x1={cx}
              y1={cy}
              x2={x}
              y2={y}
              stroke="#5a564f"
              strokeWidth={1}
              strokeDasharray="2 3"
            />
            <circle cx={x} cy={y} r={4} fill="#f5f1e8" />
            <text
              x={x}
              y={y - 12}
              textAnchor="middle"
              className="fill-ink"
              fontSize="10"
            >
              {member.repNameMasked}
            </text>
            <text
              x={x}
              y={y + 14}
              textAnchor="middle"
              className="font-mono fill-ink-faint"
              fontSize="9"
            >
              {s?.wins ?? 0}/{s?.bids ?? 0}
            </text>
            <text
              x={x}
              y={y + 25}
              textAnchor="middle"
              className="font-mono fill-ink-faint"
              fontSize="8"
            >
              {member.openDate.slice(0, 7)}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
