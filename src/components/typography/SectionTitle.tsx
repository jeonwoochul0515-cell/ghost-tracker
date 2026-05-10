// 섹션 라벨 — IBM Plex Mono 10px uppercase, 트래킹 강함
import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

export function SectionTitle({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'font-mono text-[10px] uppercase tracking-[0.25em] text-ink-dim',
        className,
      )}
      {...rest}
    />
  )
}
