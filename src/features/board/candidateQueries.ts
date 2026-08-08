import { useQuery } from '@tanstack/react-query'

import type { Candidate } from '../../types/candidate'

type CandidatesResponse = {
  candidates: Candidate[]
}

export const CANDIDATES_QUERY_KEY = ['candidates'] as const

export async function fetchCandidates(): Promise<Candidate[]> {
  const endpoint = new URL('/api/candidates', window.location.origin)
  const response = await fetch(endpoint)

  if (!response.ok) {
    throw new Error('지원자 목록을 불러오지 못했습니다.')
  }

  const data = (await response.json()) as CandidatesResponse

  return data.candidates
}

export function useCandidates() {
  return useQuery({
    queryKey: CANDIDATES_QUERY_KEY,
    queryFn: fetchCandidates,
  })
}
