import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { createCandidateSeed } from '../../data/candidateSeed'
import { CandidateCard } from './CandidateCard'

describe('지원자 카드', () => {
  it('이름, 직무, 지원일과 현재 단계를 표시한다', () => {
    const [candidate] = createCandidateSeed(1)

    render(
      <ol>
        <CandidateCard candidate={candidate} />
      </ol>,
    )

    expect(
      screen.getByRole('article', { name: candidate.name }),
    ).toBeInTheDocument()
    expect(screen.getByText(candidate.role)).toBeInTheDocument()
    expect(screen.getByText(candidate.appliedAt.replaceAll('-', '.'))).toHaveAttribute(
      'datetime',
      candidate.appliedAt,
    )
    expect(screen.getByText('서류검토')).toBeInTheDocument()
  })
})
