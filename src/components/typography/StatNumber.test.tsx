// StatNumber 기본 렌더 테스트
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { StatNumber } from './StatNumber'

describe('StatNumber', () => {
  it('renders value and unit', () => {
    render(<StatNumber value="12" unit="개" />)
    expect(screen.getByText('12')).toBeInTheDocument()
    expect(screen.getByText('개')).toBeInTheDocument()
  })
})
