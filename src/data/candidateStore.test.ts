import { beforeEach, describe, expect, it } from 'vitest'

import {
  CANDIDATE_STORAGE_KEY,
  clearCandidateStore,
  readCandidates,
  updateCandidateStage,
} from './candidateStore'

describe('후보자 저장소', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('저장된 데이터가 없으면 seed를 저장하고 반환한다', () => {
    const candidates = readCandidates()

    expect(candidates.length).toBeGreaterThanOrEqual(200)
    expect(localStorage.getItem(CANDIDATE_STORAGE_KEY)).not.toBeNull()
  })

  it('후보자 단계를 변경하고 다시 읽을 수 있다', () => {
    const [candidate] = readCandidates()
    const updatedCandidate = updateCandidateStage(candidate.id, 'interview')
    const persistedCandidate = readCandidates().find(
      ({ id }) => id === candidate.id,
    )

    expect(updatedCandidate?.stage).toBe('interview')
    expect(persistedCandidate?.stage).toBe('interview')
  })

  it('손상된 저장 데이터는 seed로 복구한다', () => {
    localStorage.setItem(CANDIDATE_STORAGE_KEY, '{invalid-json')

    expect(readCandidates().length).toBeGreaterThanOrEqual(200)
  })

  it('초기화를 위해 저장된 후보자를 제거한다', () => {
    readCandidates()
    clearCandidateStore()

    expect(localStorage.getItem(CANDIDATE_STORAGE_KEY)).toBeNull()
  })
})
