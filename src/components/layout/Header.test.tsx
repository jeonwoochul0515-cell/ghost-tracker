// Header 기본 렌더 테스트
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Header } from './Header'

describe('Header', () => {
  it('renders the brand and Live Beta indicator', () => {
    render(<Header />)
    expect(screen.getByText('Tracker', { exact: false })).toBeInTheDocument()
    expect(screen.getByText('Live Beta')).toBeInTheDocument()
  })
})
