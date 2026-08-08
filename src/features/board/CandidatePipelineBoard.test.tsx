import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { HttpResponse, http } from 'msw'
import { setupServer } from 'msw/node'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { createCandidateSeed } from '../../data/candidateSeed'
import { CandidatePipelineBoard } from './CandidatePipelineBoard'

const candidates = createCandidateSeed(5)
const server = setupServer(
  http.get('*/api/candidates', () => HttpResponse.json({ candidates })),
)

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' })
})

afterAll(() => {
  server.close()
})

describe('지원자 파이프라인 조회', () => {
  it('API 조회 결과를 단계별 카드로 표시한다', async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })

    render(
      <QueryClientProvider client={queryClient}>
        <CandidatePipelineBoard />
      </QueryClientProvider>,
    )

    expect(screen.getByRole('status')).toHaveTextContent(
      '지원자를 불러오는 중입니다.',
    )

    for (const candidate of candidates) {
      expect(
        await screen.findByRole('article', { name: candidate.name }),
      ).toBeInTheDocument()
    }
  })
})
