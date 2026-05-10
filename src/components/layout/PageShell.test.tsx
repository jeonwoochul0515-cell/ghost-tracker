// PageShell 기본 렌더 테스트 — sidebar 옵션 동작 확인
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { PageShell } from './PageShell'

describe('PageShell', () => {
  it('renders main content', () => {
    render(<PageShell>본문</PageShell>)
    expect(screen.getByText('본문')).toBeInTheDocument()
  })

  it('renders sidebar slot when provided', () => {
    render(<PageShell sidebar={<nav>사이드</nav>}>본문</PageShell>)
    expect(screen.getByText('사이드')).toBeInTheDocument()
    expect(screen.getByText('본문')).toBeInTheDocument()
  })
})
