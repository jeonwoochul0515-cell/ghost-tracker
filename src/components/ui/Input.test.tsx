// Input 기본 렌더 테스트
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Input } from './Input'

describe('Input', () => {
  it('renders an input with placeholder', () => {
    render(<Input placeholder="검색어" />)
    expect(screen.getByPlaceholderText('검색어')).toBeInTheDocument()
  })
})
