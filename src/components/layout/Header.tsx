// 사이트 헤더 — sticky, blur 배경, 로고 + 네비 + Live Beta 인디케이터
import { cn } from '@/lib/cn'

interface NavItem {
  label: string
  href: string
}

interface HeaderProps {
  navItems?: NavItem[]
  className?: string
}

const defaultNav: NavItem[] = [
  { label: 'Dashboard', href: '/' },
  { label: 'Clusters', href: '/clusters' },
  { label: 'Schools', href: '/schools' },
  { label: 'Cases', href: '/cases' },
  { label: 'Methodology', href: '/methodology' },
]

export function Header({ navItems = defaultNav, className }: HeaderProps) {
  return (
    <header
      className={cn(
        'sticky top-0 z-30 backdrop-blur-md bg-bg/70 border-b border-line',
        className,
      )}
    >
      <div className="max-w-[1400px] mx-auto flex items-center justify-between px-8 h-16">
        <a
          href="/"
          className="font-display font-black italic text-xl tracking-tight whitespace-nowrap"
        >
          Ghost<span className="text-accent mx-0.5">·</span>Tracker
        </a>
        <nav className="hidden md:flex items-center gap-6 font-mono text-[10px] uppercase tracking-[0.2em]">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-ink-dim hover:text-ink transition-colors"
            >
              {item.label}
            </a>
          ))}
        </nav>
        <span className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-dim">
          <span className="size-1.5 rounded-full bg-safe animate-pulse" />
          Live Beta
        </span>
      </div>
    </header>
  )
}
