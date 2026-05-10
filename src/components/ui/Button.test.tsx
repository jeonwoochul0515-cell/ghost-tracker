// Button 기본 렌더 테스트
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Button } from './Button'

describe('Button', () => {
  it('renders the label as a button element', () => {
    render(<Button>제출</Button>)
    expect(screen.getByRole('button', { name: '제출' })).toBeInTheDocument()
  })
})
