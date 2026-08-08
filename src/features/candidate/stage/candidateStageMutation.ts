import { useMutation, useQueryClient } from '@tanstack/react-query'

import type { Candidate, CandidateStage } from '../../../types/candidate'
import { CANDIDATES_QUERY_KEY } from '../../board/candidateQueries'

type UpdateCandidateStageVariables = {
  candidateId: string
  stage: CandidateStage
}

type CandidateResponse = {
  candidate: Candidate
}

type ErrorResponse = {
  message?: string
}

async function getErrorMessage(response: Response) {
  try {
    const body = (await response.json()) as ErrorResponse

    if (body.message) {
      return body.message
    }
  } catch {
    // 응답 본문이 JSON이 아니면 공통 오류 메시지를 사용한다.
  }

  return '지원자 단계를 변경하지 못했습니다.'
}

export async function updateCandidateStage({
  candidateId,
  stage,
}: UpdateCandidateStageVariables): Promise<Candidate> {
  const endpoint = new URL(
    `/api/candidates/${candidateId}/stage`,
    window.location.origin,
  )
  const response = await fetch(endpoint, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ stage }),
  })

  if (!response.ok) {
    throw new Error(await getErrorMessage(response))
  }

  const data = (await response.json()) as CandidateResponse

  return data.candidate
}

export function useUpdateCandidateStage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateCandidateStage,
    onSuccess: (updatedCandidate) => {
      queryClient.setQueryData<Candidate[]>(
        CANDIDATES_QUERY_KEY,
        (candidates) =>
          candidates?.map((candidate) =>
            candidate.id === updatedCandidate.id ? updatedCandidate : candidate,
          ),
      )
    },
  })
}
