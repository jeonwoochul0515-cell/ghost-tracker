// Badge 기본 렌더 테스트
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Badge } from './Badge'

describe('Badge', () => {
  it('renders the variant content', () => {
    render(<Badge variant="high">고위험</Badge>)
    expect(screen.getByText('고위험')).toBeInTheDocument()
  })
})
