import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { BoardEmptyState } from './BoardEmptyState'
import { BoardErrorState } from './BoardErrorState'
import { BoardLoadingState } from './BoardLoadingState'

describe('보드 상태 UI', () => {
  it('초기 로딩을 보드 형태 스켈레톤과 접근성 상태로 표시한다', () => {
    const { container } = render(<BoardLoadingState />)

    expect(screen.getByRole('status')).toHaveAccessibleName(
      '채용 단계 보드 로딩',
    )
    expect(screen.getByRole('status')).toHaveAttribute('aria-busy', 'true')
    expect(screen.getByText('지원자를 불러오는 중입니다.')).toHaveClass(
      'sr-only',
    )
    expect(container.querySelectorAll('.grid-cols-5 > div')).toHaveLength(5)
  })

  it('조회 오류와 재시도 액션을 제공한다', async () => {
    const user = userEvent.setup()
    const onRetry = vi.fn()

    render(<BoardErrorState onRetry={onRetry} />)

    expect(screen.getByRole('alert')).toHaveTextContent(
      '지원자를 불러오지 못했습니다',
    )
    await user.click(screen.getByRole('button', { name: '다시 시도' }))

    expect(onRetry).toHaveBeenCalledOnce()
  })

  it('재시도 중에는 중복 요청을 막는다', () => {
    render(<BoardErrorState isRetrying onRetry={vi.fn()} />)

    expect(screen.getByRole('button', { name: '다시 시도 중...' })).toBeDisabled()
  })

  it('지원자 전체가 비었을 때 등록 전 상태를 표시한다', () => {
    render(<BoardEmptyState kind="all" />)

    expect(screen.getByRole('status')).toHaveTextContent(
      '등록된 지원자가 없습니다',
    )
    expect(
      screen.queryByRole('button', { name: '필터 초기화' }),
    ).not.toBeInTheDocument()
  })

  it('필터 결과가 비었을 때 필터 초기화 액션을 제공한다', async () => {
    const user = userEvent.setup()
    const onResetFilters = vi.fn()

    render(
      <BoardEmptyState kind="filtered" onResetFilters={onResetFilters} />,
    )

    expect(screen.getByRole('status')).toHaveTextContent(
      '조건에 맞는 지원자가 없습니다',
    )
    await user.click(screen.getByRole('button', { name: '필터 초기화' }))

    expect(onResetFilters).toHaveBeenCalledOnce()
  })
})
