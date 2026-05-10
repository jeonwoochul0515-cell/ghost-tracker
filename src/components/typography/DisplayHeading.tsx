// 디스플레이 헤딩 — Bodoni Moda 900, italic 옵션
import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/cn'

interface DisplayHeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  as?: 'h1' | 'h2' | 'h3'
  italic?: boolean
  children: ReactNode
}

export function DisplayHeading({
  as: Tag = 'h1',
  italic,
  children,
  className,
  ...rest
}: DisplayHeadingProps) {
  return (
    <Tag
      className={cn(
        'font-display font-black leading-[0.95] tracking-[-0.02em]',
        italic && 'italic',
        Tag === 'h1' && 'text-5xl md:text-7xl',
        Tag === 'h2' && 'text-4xl md:text-5xl',
        Tag === 'h3' && 'text-2xl md:text-3xl',
        className,
      )}
      {...rest}
    >
      {children}
    </Tag>
  )
}
