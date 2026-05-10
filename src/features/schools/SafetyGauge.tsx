// 안전성 지수 5칸 게이지 — score 만큼 채워짐, 색은 점수에 따라
import type { SafetyScore } from './aggregate'
import { cn } from '@/lib/cn'

interface SafetyGaugeProps {
  score: SafetyScore
  description: string
}

const COLOR: Record<SafetyScore, string> = {
  1: 'bg-danger',
  2: 'bg-warning',
  3: 'bg-warning/70',
  4: 'bg-safe/70',
  5: 'bg-safe',
}

export function SafetyGauge({ score, description }: SafetyGaugeProps) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-4 mb-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-ink-dim">
          학교 안전성 지수
        </p>
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint">
          {score} / 5
        </p>
      </div>
      <div className="grid grid-cols-5 gap-1.5">
        {[1, 2, 3, 4, 5].map((cell) => (
          <div
            key={cell}
            className={cn(
              'h-3',
              cell <= score ? COLOR[score] : 'bg-line',
            )}
            aria-hidden
          />
        ))}
      </div>
      <p className="mt-3 text-sm text-ink-dim leading-relaxed">{description}</p>
    </div>
  )
}
