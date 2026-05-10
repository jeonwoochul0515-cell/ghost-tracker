// Footer 기본 렌더 테스트
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Footer } from './Footer'

describe('Footer', () => {
  it('renders operator, sources and disclaimer sections', () => {
    render(<Footer />)
    expect(screen.getByText('Operator')).toBeInTheDocument()
    expect(screen.getByText('Sources')).toBeInTheDocument()
    expect(screen.getByText('Disclaimer')).toBeInTheDocument()
  })
})
