import { delay, http, HttpResponse, type RequestHandler } from 'msw'

import { readCandidates, updateCandidateStage } from '../data/candidateStore'
import { isCandidateStage } from '../types/candidate'
import { getRandomNetworkDelay, shouldFailRequest } from './networkPolicy'

async function applyNetworkConditions(request: Request) {
  await delay(getRandomNetworkDelay())

  if (request.signal.aborted) {
    return 'aborted'
  }

  return shouldFailRequest(request) ? 'failed' : 'success'
}

function createFailureResponse() {
  return HttpResponse.json(
    { message: 'Mock API 요청에 실패했습니다.' },
    { status: 503 },
  )
}

export const handlers: RequestHandler[] = [
  http.get('*/api/candidates', async ({ request }) => {
    const networkResult = await applyNetworkConditions(request)

    if (networkResult === 'aborted') {
      return new HttpResponse(null, { status: 499 })
    }

    if (networkResult === 'failed') {
      return createFailureResponse()
    }

    return HttpResponse.json({ candidates: readCandidates() })
  }),

  http.patch(
    '*/api/candidates/:candidateId/stage',
    async ({ params, request }) => {
      const networkResult = await applyNetworkConditions(request)

      if (networkResult === 'aborted') {
        return new HttpResponse(null, { status: 499 })
      }

      if (networkResult === 'failed') {
        return createFailureResponse()
      }

      const candidateId = Array.isArray(params.candidateId)
        ? params.candidateId[0]
        : params.candidateId
      let body: unknown

      try {
        body = await request.json()
      } catch {
        return HttpResponse.json(
          { message: '요청 본문이 올바른 JSON 형식이 아닙니다.' },
          { status: 400 },
        )
      }

      const stage =
        typeof body === 'object' && body !== null
          ? (body as Record<string, unknown>).stage
          : undefined

      if (!isCandidateStage(stage)) {
        return HttpResponse.json(
          { message: '유효한 채용 단계를 입력해야 합니다.' },
          { status: 400 },
        )
      }

      const updatedCandidate = updateCandidateStage(candidateId ?? '', stage)

      if (updatedCandidate === null) {
        return HttpResponse.json(
          { message: '지원자를 찾을 수 없습니다.' },
          { status: 404 },
        )
      }

      return HttpResponse.json({ candidate: updatedCandidate })
    },
  ),
]
