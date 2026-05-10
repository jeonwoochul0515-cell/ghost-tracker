// 사이트 헤더 — sticky, blur 배경, NavLink 기반 active 표시 + Live Beta 인디케이터
import { NavLink } from 'react-router-dom'
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
        <NavLink
          to="/"
          className="font-display font-black italic text-xl tracking-tight whitespace-nowrap"
        >
          Ghost<span className="text-accent mx-0.5">·</span>Tracker
        </NavLink>
        <nav className="hidden md:flex items-center gap-6 font-mono text-[10px] uppercase tracking-[0.2em]">
          {navItems.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              end={item.href === '/'}
              className={({ isActive }) =>
                cn(
                  'transition-colors',
                  isActive ? 'text-accent' : 'text-ink-dim hover:text-ink',
                )
              }
            >
              {item.label}
            </NavLink>
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
