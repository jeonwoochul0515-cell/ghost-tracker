// Dialog 기본 렌더 테스트 — open=false 상태에서 dialog 엘리먼트가 DOM 에 존재하는지
import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Dialog } from './Dialog'

describe('Dialog', () => {
  it('renders a <dialog> element when closed', () => {
    const { container } = render(
      <Dialog open={false} onClose={() => {}}>
        본문
      </Dialog>,
    )
    expect(container.querySelector('dialog')).toBeInTheDocument()
  })
})
