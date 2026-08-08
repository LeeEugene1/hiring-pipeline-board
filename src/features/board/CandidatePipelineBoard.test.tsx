import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, http } from 'msw'
import { setupServer } from 'msw/node'
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
} from 'vitest'

import { createCandidateSeed } from '../../data/candidateSeed'
import type { Candidate, CandidateStage } from '../../types/candidate'
import { CandidatePipelineBoard } from './CandidatePipelineBoard'

let candidates: Candidate[]
let requestedStage: CandidateStage | null
const server = setupServer(
  http.get('*/api/candidates', () => HttpResponse.json({ candidates })),
  http.patch(
    '*/api/candidates/:candidateId/stage',
    async ({ params, request }) => {
      const body = (await request.json()) as { stage: CandidateStage }
      requestedStage = body.stage
      const candidateId = String(params.candidateId)
      const currentCandidate = candidates.find(
        (candidate) => candidate.id === candidateId,
      )!
      const updatedCandidate = { ...currentCandidate, stage: body.stage }

      candidates = candidates.map((candidate) =>
        candidate.id === candidateId ? updatedCandidate : candidate,
      )

      return HttpResponse.json({ candidate: updatedCandidate })
    },
  ),
)

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' })
})

beforeEach(() => {
  candidates = createCandidateSeed(5)
  requestedStage = null
})

afterEach(() => {
  server.resetHandlers()
})

afterAll(() => {
  server.close()
})

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
}

describe('지원자 파이프라인 조회', () => {
  it('API 조회 결과를 단계별 카드로 표시한다', async () => {
    const queryClient = createTestQueryClient()

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

  it('키보드로 선택한 단계를 PATCH 요청하고 성공 후 컬럼을 이동한다', async () => {
    const user = userEvent.setup()
    const queryClient = createTestQueryClient()
    const candidate = candidates[0]
    const { unmount } = render(
      <QueryClientProvider client={queryClient}>
        <CandidatePipelineBoard />
      </QueryClientProvider>,
    )
    const trigger = await screen.findByRole('button', {
      name: `${candidate.name} 단계 변경`,
    })

    trigger.focus()
    await user.keyboard('{Enter}')

    expect(
      screen.getByRole('menuitem', { name: '서류검토 (현재)' }),
    ).toHaveAttribute('data-disabled')

    const interviewItem = screen.getByRole('menuitem', { name: '면접' })
    await waitFor(() => expect(interviewItem).toHaveFocus())
    await user.keyboard('{Enter}')

    const interviewColumn = await screen.findByRole('region', { name: '면접' })

    expect(requestedStage).toBe('interview')
    expect(
      within(interviewColumn).getByRole('article', { name: candidate.name }),
    ).toBeInTheDocument()

    unmount()

    const refreshedQueryClient = createTestQueryClient()
    render(
      <QueryClientProvider client={refreshedQueryClient}>
        <CandidatePipelineBoard />
      </QueryClientProvider>,
    )

    const refreshedInterviewColumn = await screen.findByRole('region', {
      name: '면접',
    })

    expect(
      within(refreshedInterviewColumn).getByRole('article', {
        name: candidate.name,
      }),
    ).toBeInTheDocument()
  })

  it('좌우 버튼으로 인접 단계를 이동하고 단계 경계에서는 버튼을 비활성화한다', async () => {
    const user = userEvent.setup()
    const queryClient = createTestQueryClient()
    const firstCandidate = candidates[0]
    const lastCandidate = candidates[4]

    render(
      <QueryClientProvider client={queryClient}>
        <CandidatePipelineBoard />
      </QueryClientProvider>,
    )

    expect(
      await screen.findByRole('button', {
        name: `${firstCandidate.name} 이전 단계로 이동`,
      }),
    ).toBeDisabled()
    expect(
      await screen.findByRole('button', {
        name: `${lastCandidate.name} 다음 단계로 이동`,
      }),
    ).toBeDisabled()

    await user.click(
      screen.getByRole('button', {
        name: `${firstCandidate.name} 다음 단계로 이동`,
      }),
    )

    const interviewColumn = await screen.findByRole('region', { name: '면접' })

    expect(requestedStage).toBe('interview')
    expect(
      within(interviewColumn).getByRole('article', {
        name: firstCandidate.name,
      }),
    ).toBeInTheDocument()
  })

  it('PATCH 실패 시 기존 컬럼을 유지하고 카드에 오류를 표시한다', async () => {
    server.use(
      http.patch('*/api/candidates/:candidateId/stage', () =>
        HttpResponse.json(
          { message: 'Mock API 요청에 실패했습니다.' },
          { status: 503 },
        ),
      ),
    )
    const user = userEvent.setup()
    const candidate = candidates[0]
    const queryClient = createTestQueryClient()

    render(
      <QueryClientProvider client={queryClient}>
        <CandidatePipelineBoard />
      </QueryClientProvider>,
    )

    await user.click(
      await screen.findByRole('button', {
        name: `${candidate.name} 단계 변경`,
      }),
    )
    await user.click(screen.getByRole('menuitem', { name: '면접' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Mock API 요청에 실패했습니다.',
    )
    expect(
      within(screen.getByRole('region', { name: '서류검토' })).getByRole(
        'article',
        { name: candidate.name },
      ),
    ).toBeInTheDocument()
  })
})
