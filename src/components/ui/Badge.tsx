// 위험도 배지 — high | mid | low | neutral
import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

type BadgeVariant = 'high' | 'mid' | 'low' | 'neutral'

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
}

const variantClasses: Record<BadgeVariant, string> = {
  high: 'bg-danger/15 text-danger border-danger/30',
  mid: 'bg-warning/15 text-warning border-warning/30',
  low: 'bg-safe/15 text-safe border-safe/30',
  neutral: 'bg-bg-2 text-ink-dim border-line',
}

export function Badge({ variant = 'neutral', className, ...rest }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono uppercase tracking-[0.15em] border rounded-sm',
        variantClasses[variant],
        className,
      )}
      {...rest}
    />
  )
}
