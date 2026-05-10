// 페이지 컨테이너 — max-width 1400px, 32px 좌우 패딩, 사이드바 옵션
import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

interface PageShellProps {
  children: ReactNode
  sidebar?: ReactNode
  className?: string
}

export function PageShell({ children, sidebar, className }: PageShellProps) {
  return (
    <div className={cn('max-w-[1400px] mx-auto px-8 py-8 relative z-10', className)}>
      {sidebar ? (
        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-12">
          <aside className="lg:sticky lg:top-24 lg:self-start">{sidebar}</aside>
          <main>{children}</main>
        </div>
      ) : (
        <main>{children}</main>
      )}
    </div>
  )
}
