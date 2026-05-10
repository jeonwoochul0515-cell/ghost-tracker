// 텍스트 입력 — 다크 톤, 포커스 시 accent 보더
import type { InputHTMLAttributes, Ref } from 'react'
import { cn } from '@/lib/cn'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  ref?: Ref<HTMLInputElement>
}

export function Input({ className, type = 'text', ref, ...rest }: InputProps) {
  return (
    <input
      ref={ref}
      type={type}
      className={cn(
        'h-10 w-full bg-bg border border-line px-3 text-sm text-ink placeholder:text-ink-faint',
        'font-mono',
        'focus-visible:outline-none focus-visible:border-accent focus-visible:ring-1 focus-visible:ring-accent',
        'disabled:opacity-50',
        className,
      )}
      {...rest}
    />
  )
}
