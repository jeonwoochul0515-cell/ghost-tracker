// 통계 숫자 — Bodoni Moda 900, unit 라벨 옵션
import { cn } from '@/lib/cn'

interface StatNumberProps {
  value: string | number
  unit?: string
  className?: string
}

export function StatNumber({ value, unit, className }: StatNumberProps) {
  return (
    <span className={cn('inline-flex items-baseline gap-1.5', className)}>
      <span className="font-display font-black text-5xl md:text-6xl tracking-tight tabular-nums">
        {value}
      </span>
      {unit && (
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-dim">
          {unit}
        </span>
      )}
    </span>
  )
}
