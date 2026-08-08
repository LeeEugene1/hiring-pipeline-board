import { CANDIDATE_SEED } from './candidateSeed'
import {
  isCandidateStage,
  type Candidate,
  type CandidateStage,
} from '../types/candidate'

export const CANDIDATE_STORAGE_KEY = 'hiring-pipeline:candidates'

type CandidateStorage = Pick<Storage, 'getItem' | 'removeItem' | 'setItem'>

function cloneSeed(): Candidate[] {
  return CANDIDATE_SEED.map((candidate) => ({ ...candidate }))
}

function isCandidate(value: unknown): value is Candidate {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const candidate = value as Record<string, unknown>

  return (
    typeof candidate.id === 'string' &&
    typeof candidate.name === 'string' &&
    typeof candidate.role === 'string' &&
    typeof candidate.appliedAt === 'string' &&
    isCandidateStage(candidate.stage) &&
    typeof candidate.email === 'string' &&
    typeof candidate.phone === 'string' &&
    typeof candidate.experienceYears === 'number' &&
    typeof candidate.summary === 'string'
  )
}

function isCandidateList(value: unknown): value is Candidate[] {
  return Array.isArray(value) && value.every(isCandidate)
}

function persistCandidates(candidates: Candidate[], storage: CandidateStorage) {
  storage.setItem(CANDIDATE_STORAGE_KEY, JSON.stringify(candidates))
}

export function resetCandidateStore(storage: CandidateStorage = localStorage) {
  const candidates = cloneSeed()

  persistCandidates(candidates, storage)

  return candidates
}

export function readCandidates(storage: CandidateStorage = localStorage) {
  const storedCandidates = storage.getItem(CANDIDATE_STORAGE_KEY)

  if (storedCandidates === null) {
    return resetCandidateStore(storage)
  }

  try {
    const parsedCandidates: unknown = JSON.parse(storedCandidates)

    if (isCandidateList(parsedCandidates)) {
      return parsedCandidates
    }
  } catch {
    // 손상된 저장 데이터는 초기 seed로 복구한다.
  }

  return resetCandidateStore(storage)
}

export function updateCandidateStage(
  candidateId: string,
  stage: CandidateStage,
  storage: CandidateStorage = localStorage,
) {
  const candidates = readCandidates(storage)
  const candidateIndex = candidates.findIndex(
    (candidate) => candidate.id === candidateId,
  )

  if (candidateIndex === -1) {
    return null
  }

  const updatedCandidate = {
    ...candidates[candidateIndex],
    stage,
  }
  const nextCandidates = candidates.map((candidate, index) =>
    index === candidateIndex ? updatedCandidate : candidate,
  )

  persistCandidates(nextCandidates, storage)

  return updatedCandidate
}

export function clearCandidateStore(storage: CandidateStorage = localStorage) {
  storage.removeItem(CANDIDATE_STORAGE_KEY)
}
