// 기본 버튼 — primary | ghost | danger / sm | md | lg
import type { ButtonHTMLAttributes, Ref } from 'react'
import { cn } from '@/lib/cn'

type ButtonVariant = 'primary' | 'ghost' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  ref?: Ref<HTMLButtonElement>
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-accent text-bg hover:bg-accent/90 focus-visible:ring-accent',
  ghost: 'bg-transparent text-ink border border-line hover:bg-bg-2 focus-visible:ring-ink-dim',
  danger: 'bg-danger text-ink hover:bg-danger/90 focus-visible:ring-danger',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-[10px]',
  md: 'h-10 px-4 text-xs',
  lg: 'h-12 px-6 text-sm',
}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  ref,
  ...rest
}: ButtonProps) {
  return (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-mono uppercase tracking-[0.15em]',
        'transition-colors disabled:opacity-50 disabled:pointer-events-none',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-bg',
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...rest}
    />
  )
}
