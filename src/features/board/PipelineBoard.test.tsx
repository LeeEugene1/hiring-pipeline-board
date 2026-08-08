import { render, screen, within } from '@testing-library/react'
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

    render(<PipelineBoard candidates={candidates} />)

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
})
