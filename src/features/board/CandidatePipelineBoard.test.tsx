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
import { CANDIDATES_QUERY_KEY } from './candidateQueries'

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

function createDeferred() {
  let resolve = () => {}
  const promise = new Promise<void>((promiseResolve) => {
    resolve = promiseResolve
  })

  return { promise, resolve }
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

  it('이름 검색과 직무 필터를 함께 적용하고 초기화한다', async () => {
    const user = userEvent.setup()
    const queryClient = createTestQueryClient()

    render(
      <QueryClientProvider client={queryClient}>
        <CandidatePipelineBoard />
      </QueryClientProvider>,
    )

    await screen.findByRole('article', { name: candidates[0].name })

    await user.type(screen.getByRole('searchbox', { name: '이름 검색' }), '김')
    await user.selectOptions(
      screen.getByRole('combobox', { name: '지원 직무' }),
      candidates[0].role,
    )

    await waitFor(() => {
      expect(screen.getByLabelText('검색 결과 1 / 5명')).toBeInTheDocument()
    })
    expect(
      screen.getByRole('article', { name: candidates[0].name }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('article', { name: candidates[1].name }),
    ).not.toBeInTheDocument()

    await user.clear(screen.getByRole('searchbox', { name: '이름 검색' }))
    await user.type(
      screen.getByRole('searchbox', { name: '이름 검색' }),
      '없는 지원자',
    )

    await waitFor(() => {
      expect(screen.getByLabelText('검색 결과 0 / 5명')).toBeInTheDocument()
    })

    await user.click(
      screen.getByRole('button', { name: '검색 및 필터 초기화' }),
    )

    await waitFor(() => {
      expect(screen.getByLabelText('검색 결과 5 / 5명')).toBeInTheDocument()
    })
    expect(screen.getByRole('searchbox', { name: '이름 검색' })).toHaveValue(
      '',
    )
    expect(screen.getByRole('combobox', { name: '지원 직무' })).toHaveValue(
      'all',
    )
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

  it('응답 전에 이동하고 PATCH 실패 시 snapshot으로 복구한다', async () => {
    let releaseFailureResponse = () => {}
    const failureResponseGate = new Promise<void>((resolve) => {
      releaseFailureResponse = resolve
    })
    server.use(
      http.patch('*/api/candidates/:candidateId/stage', async () => {
        await failureResponseGate

        return HttpResponse.json(
          { message: 'Mock API 요청에 실패했습니다.' },
          { status: 503 },
        )
      }),
    )
    const user = userEvent.setup()
    const candidate = candidates[0]
    const otherCandidate = candidates[1]
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

    expect(
      within(screen.getByRole('region', { name: '면접' })).getByRole(
        'article',
        { name: candidate.name },
      ),
    ).toBeInTheDocument()

    queryClient.setQueryData<Candidate[]>(CANDIDATES_QUERY_KEY, (current) =>
      current?.map((currentCandidate) =>
        currentCandidate.id === otherCandidate.id
          ? { ...currentCandidate, stage: 'offer' }
          : currentCandidate,
      ),
    )
    releaseFailureResponse()

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Mock API 요청에 실패했습니다.',
    )
    expect(
      within(screen.getByRole('region', { name: '서류검토' })).getByRole(
        'article',
        { name: candidate.name },
      ),
    ).toBeInTheDocument()
    expect(
      within(screen.getByRole('region', { name: '처우협의' })).getByRole(
        'article',
        { name: otherCandidate.name },
      ),
    ).toBeInTheDocument()
  })

  it('동일 후보자의 응답 순서가 역전되어도 마지막 단계를 유지한다', async () => {
    const firstRequestStarted = createDeferred()
    const secondRequestStarted = createDeferred()
    const firstResponse = createDeferred()
    const secondResponse = createDeferred()
    const firstRequestFinished = createDeferred()

    server.use(
      http.patch(
        '*/api/candidates/:candidateId/stage',
        async ({ params, request }) => {
          const body = (await request.json()) as { stage: CandidateStage }
          const isFirstRequest = body.stage === 'interview'

          if (isFirstRequest) {
            firstRequestStarted.resolve()
            await firstResponse.promise
          } else {
            secondRequestStarted.resolve()
            await secondResponse.promise
          }

          if (request.signal.aborted) {
            if (isFirstRequest) {
              firstRequestFinished.resolve()
            }

            return new HttpResponse(null, { status: 499 })
          }

          const candidateId = String(params.candidateId)
          const currentCandidate = candidates.find(
            (candidate) => candidate.id === candidateId,
          )!
          const updatedCandidate = { ...currentCandidate, stage: body.stage }

          candidates = candidates.map((candidate) =>
            candidate.id === candidateId ? updatedCandidate : candidate,
          )

          if (isFirstRequest) {
            firstRequestFinished.resolve()
          }

          return HttpResponse.json({ candidate: updatedCandidate })
        },
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
        name: `${candidate.name} 다음 단계로 이동`,
      }),
    )
    await firstRequestStarted.promise

    await user.click(
      screen.getByRole('button', {
        name: `${candidate.name} 다음 단계로 이동`,
      }),
    )
    await secondRequestStarted.promise

    expect(
      within(screen.getByRole('region', { name: '처우협의' })).getByRole(
        'article',
        { name: candidate.name },
      ),
    ).toBeInTheDocument()

    secondResponse.resolve()
    await waitFor(() => expect(candidates[0].stage).toBe('offer'))

    firstResponse.resolve()
    await firstRequestFinished.promise
    await waitFor(() => {
      expect(
        queryClient
          .getQueryData<Candidate[]>(CANDIDATES_QUERY_KEY)
          ?.find(({ id }) => id === candidate.id)?.stage,
      ).toBe('offer')
    })

    expect(candidates[0].stage).toBe('offer')
    expect(
      within(screen.getByRole('region', { name: '처우협의' })).getByRole(
        'article',
        { name: candidate.name },
      ),
    ).toBeInTheDocument()
  })
})
