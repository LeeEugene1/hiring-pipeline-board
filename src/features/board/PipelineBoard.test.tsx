import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { createCandidateSeed } from '../../data/candidateSeed'
import { PipelineBoard } from './PipelineBoard'

describe('파이프라인 보드 레이아웃', () => {
  it('다섯 개 채용 단계를 정해진 순서로 표시한다', () => {
    render(<PipelineBoard />)

    const board = screen.getByRole('region', { name: '채용 단계 보드' })
    const stageHeadings = within(board).getAllByRole('heading', { level: 3 })

    expect(stageHeadings.map((heading) => heading.textContent)).toEqual([
      '서류검토',
      '면접',
      '처우협의',
      '최종합격',
      '불합격',
    ])
  })

  it('각 단계의 지원자 수를 표시한다', () => {
    render(<PipelineBoard />)

    expect(screen.getByLabelText('서류검토 지원자 0명')).toBeInTheDocument()
    expect(screen.getByLabelText('면접 지원자 0명')).toBeInTheDocument()
    expect(screen.getByLabelText('처우협의 지원자 0명')).toBeInTheDocument()
    expect(screen.getByLabelText('최종합격 지원자 0명')).toBeInTheDocument()
    expect(screen.getByLabelText('불합격 지원자 0명')).toBeInTheDocument()
  })

  it('지원자 배열을 단계별로 나누고 각 지원자를 한 번만 표시한다', () => {
    const candidates = createCandidateSeed(5)
    const queryClient = new QueryClient()

    render(
      <QueryClientProvider client={queryClient}>
        <PipelineBoard candidates={candidates} />
      </QueryClientProvider>,
    )

    candidates.forEach((candidate) => {
      expect(
        screen.getAllByRole('article', { name: candidate.name }),
      ).toHaveLength(1)
    })

    expect(screen.getByLabelText('서류검토 지원자 1명')).toBeInTheDocument()
    expect(screen.getByLabelText('면접 지원자 1명')).toBeInTheDocument()
    expect(screen.getByLabelText('처우협의 지원자 1명')).toBeInTheDocument()
    expect(screen.getByLabelText('최종합격 지원자 1명')).toBeInTheDocument()
    expect(screen.getByLabelText('불합격 지원자 1명')).toBeInTheDocument()
  })

  it('카드 정보 영역을 선택하면 지원자 상세 패널을 연다', async () => {
    const user = userEvent.setup()
    const [candidate] = createCandidateSeed(1)
    const queryClient = new QueryClient()

    render(
      <QueryClientProvider client={queryClient}>
        <PipelineBoard candidates={[candidate]} />
      </QueryClientProvider>,
    )

    await user.click(
      screen.getByRole('button', { name: `${candidate.name} 상세 보기` }),
    )

    expect(
      screen.getByRole('dialog', { name: `${candidate.name} 지원자 상세` }),
    ).toBeInTheDocument()
  })
})
