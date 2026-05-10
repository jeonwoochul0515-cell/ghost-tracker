// 기본 카드 — 다크 보조 배경 + 라인 보더
import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

export function Card({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('bg-bg-2 border border-line p-6', className)}
      {...rest}
    />
  )
}
