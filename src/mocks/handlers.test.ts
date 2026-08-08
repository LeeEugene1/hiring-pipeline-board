import { setupServer } from 'msw/node'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'

import {
  CANDIDATE_STORAGE_KEY,
  readCandidates,
} from '../data/candidateStore'
import type { Candidate } from '../types/candidate'
import { handlers } from './handlers'

const server = setupServer(...handlers)

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' })
})

beforeEach(() => {
  localStorage.clear()
})

afterAll(() => {
  server.close()
})

describe('후보자 Mock API', () => {
  it('GET 요청으로 seed 후보자를 조회한다', async () => {
    const response = await fetch(
      'http://localhost/api/candidates?mockFailure=never',
    )
    const body = (await response.json()) as { candidates: Candidate[] }

    expect(response.status).toBe(200)
    expect(body.candidates.length).toBeGreaterThanOrEqual(200)
  })

  it('PATCH 요청으로 후보자 단계를 저장한다', async () => {
    const [candidate] = readCandidates()
    const response = await fetch(
      `http://localhost/api/candidates/${candidate.id}/stage?mockFailure=never`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: 'offer' }),
      },
    )
    const body = (await response.json()) as { candidate: Candidate }
    const persistedCandidates = JSON.parse(
      localStorage.getItem(CANDIDATE_STORAGE_KEY) ?? '[]',
    ) as Candidate[]

    expect(response.status).toBe(200)
    expect(body.candidate.stage).toBe('offer')
    expect(
      persistedCandidates.find(({ id }) => id === candidate.id)?.stage,
    ).toBe('offer')
  })

  it('강제 실패 요청에 503 응답을 반환한다', async () => {
    const response = await fetch(
      'http://localhost/api/candidates?mockFailure=always',
    )

    expect(response.status).toBe(503)
  })

  it('존재하지 않는 후보자의 단계 변경에 404를 반환한다', async () => {
    const response = await fetch(
      'http://localhost/api/candidates/missing/stage?mockFailure=never',
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: 'interview' }),
      },
    )

    expect(response.status).toBe(404)
  })

  it('유효하지 않은 단계 변경에 400을 반환한다', async () => {
    const [candidate] = readCandidates()
    const response = await fetch(
      `http://localhost/api/candidates/${candidate.id}/stage?mockFailure=never`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: 'unknown' }),
      },
    )

    expect(response.status).toBe(400)
  })
})
