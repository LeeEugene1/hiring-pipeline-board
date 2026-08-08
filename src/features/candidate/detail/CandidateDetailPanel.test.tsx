import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef, useState } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { createCandidateSeed } from '../../../data/candidateSeed'
import { CandidateDetailPanel } from './CandidateDetailPanel'

const [candidate] = createCandidateSeed(1)

function DetailPanelHarness() {
  const [isOpen, setIsOpen] = useState(false)
  const triggerRef = createRef<HTMLButtonElement>()

  return (
    <>
      <button onClick={() => setIsOpen(true)} ref={triggerRef} type="button">
        {candidate.name} 상세 열기
      </button>
      <CandidateDetailPanel
        candidate={isOpen ? candidate : null}
        onClose={() => setIsOpen(false)}
        triggerRef={triggerRef}
      />
    </>
  )
}

describe('지원자 상세 패널', () => {
  it('접근성 이름과 지원자 상세 정보를 표시하고 닫기 버튼으로 닫는다', async () => {
    const user = userEvent.setup()
    render(<DetailPanelHarness />)

    await user.click(screen.getByRole('button', { name: /상세 열기/ }))

    expect(
      screen.getByRole('dialog', { name: `${candidate.name} 지원자 상세` }),
    ).toBeInTheDocument()
    expect(screen.getByText(candidate.email)).toBeInTheDocument()
    expect(screen.getByText(candidate.phone)).toBeInTheDocument()
    expect(screen.getByText(candidate.summary)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '상세 패널 닫기' })).toHaveFocus()

    await user.click(screen.getByRole('button', { name: '상세 패널 닫기' }))

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /상세 열기/ })).toHaveFocus()
  })

  it('오버레이 클릭으로 닫고 패널 내부 클릭으로는 유지한다', async () => {
    const user = userEvent.setup()
    render(<DetailPanelHarness />)

    await user.click(screen.getByRole('button', { name: /상세 열기/ }))
    await user.click(screen.getByText('연락처'))

    expect(screen.getByRole('dialog')).toBeInTheDocument()

    await user.click(screen.getByTestId('candidate-detail-overlay'))

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('ESC 입력으로 닫히지 않는다', async () => {
    const user = userEvent.setup()
    render(<DetailPanelHarness />)

    await user.click(screen.getByRole('button', { name: /상세 열기/ }))
    await user.keyboard('{Escape}')

    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('제어형 API의 닫기 콜백을 호출한다', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    const triggerRef = createRef<HTMLButtonElement>()

    render(
      <>
        <button ref={triggerRef} type="button">
          상세 열기
        </button>
        <CandidateDetailPanel
          candidate={candidate}
          onClose={onClose}
          triggerRef={triggerRef}
        />
      </>,
    )

    await user.click(screen.getByRole('button', { name: '상세 패널 닫기' }))

    expect(onClose).toHaveBeenCalledOnce()
  })
})
