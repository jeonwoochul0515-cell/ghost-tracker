// 모달 다이얼로그 — native <dialog> 기반, ESC/배경 클릭 닫기 지원
import { useEffect, useRef, type ReactNode } from 'react'
import { cn } from '@/lib/cn'

interface DialogProps {
  open: boolean
  onClose: () => void
  children: ReactNode
  className?: string
  ariaLabel?: string
}

export function Dialog({
  open,
  onClose,
  children,
  className,
  ariaLabel,
}: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (open && !el.open) el.showModal()
    if (!open && el.open) el.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose()
      }}
      aria-label={ariaLabel}
      className={cn(
        'bg-bg-2 border border-line text-ink p-8 max-w-lg w-full',
        'backdrop:bg-black/70 backdrop:backdrop-blur-sm',
        'open:animate-in open:fade-in',
        className,
      )}
    >
      {children}
    </dialog>
  )
}
