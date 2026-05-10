// Card 기본 렌더 테스트
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Card } from './Card'

describe('Card', () => {
  it('renders children inside the card container', () => {
    render(<Card>본문</Card>)
    expect(screen.getByText('본문')).toBeInTheDocument()
  })
})
