// DisplayHeading 기본 렌더 테스트
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { DisplayHeading } from './DisplayHeading'

describe('DisplayHeading', () => {
  it('renders as h1 by default', () => {
    render(<DisplayHeading>헤드라인</DisplayHeading>)
    const heading = screen.getByRole('heading', { level: 1, name: '헤드라인' })
    expect(heading).toBeInTheDocument()
  })
})
