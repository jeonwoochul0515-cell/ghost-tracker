// Header 기본 렌더 테스트 — NavLink 사용으로 Router 컨텍스트 필요
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { Header } from './Header'

describe('Header', () => {
  it('renders the brand and Live Beta indicator', () => {
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>,
    )
    expect(screen.getByText('Tracker', { exact: false })).toBeInTheDocument()
    expect(screen.getByText('Live Beta')).toBeInTheDocument()
  })

  it('marks the active nav link with accent color', () => {
    render(
      <MemoryRouter initialEntries={['/cases']}>
        <Header />
      </MemoryRouter>,
    )
    const activeLink = screen.getByRole('link', { name: 'Cases' })
    expect(activeLink.className).toMatch(/text-accent/)
  })
})
