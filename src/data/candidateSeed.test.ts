import { describe, expect, it } from 'vitest'

import { isCandidateStage } from '../types/candidate'
import { CANDIDATE_SEED } from './candidateSeed'

describe('후보자 seed 데이터', () => {
  it('서로 다른 ID를 가진 후보자를 200명 이상 생성한다', () => {
    const candidateIds = new Set(
      CANDIDATE_SEED.map((candidate) => candidate.id),
    )

    expect(CANDIDATE_SEED.length).toBeGreaterThanOrEqual(200)
    expect(candidateIds.size).toBe(CANDIDATE_SEED.length)
  })

  it('모든 후보자에게 유효한 단계와 필수 상세 정보를 제공한다', () => {
    expect(
      CANDIDATE_SEED.every(
        (candidate) =>
          isCandidateStage(candidate.stage) &&
          candidate.name.length > 0 &&
          candidate.role.length > 0 &&
          candidate.appliedAt.length > 0 &&
          candidate.email.length > 0,
      ),
    ).toBe(true)
  })
})
