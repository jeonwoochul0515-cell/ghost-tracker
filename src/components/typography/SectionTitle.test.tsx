// SectionTitle 기본 렌더 테스트
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { SectionTitle } from './SectionTitle'

describe('SectionTitle', () => {
  it('renders the label text', () => {
    render(<SectionTitle>의심 클러스터</SectionTitle>)
    expect(screen.getByText('의심 클러스터')).toBeInTheDocument()
  })
})
