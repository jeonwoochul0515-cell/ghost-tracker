// Tooltip 기본 렌더 테스트 — children 은 항상 보이고 content 는 초기에 숨김
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Tooltip } from './Tooltip'

describe('Tooltip', () => {
  it('renders the trigger and hides content initially', () => {
    render(
      <Tooltip content="설명">
        <button type="button">트리거</button>
      </Tooltip>,
    )
    expect(screen.getByText('트리거')).toBeInTheDocument()
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
  })
})
