import {
  useMutation,
  useMutationState,
  useQueryClient,
} from '@tanstack/react-query'

import type { Candidate, CandidateStage } from '../../../types/candidate'
import { CANDIDATES_QUERY_KEY } from '../../board/candidateQueries'

export type UpdateCandidateStageVariables = {
  candidateId: string
  stage: CandidateStage
}

type UpdateCandidateStageContext = {
  previousCandidate?: Candidate
}

type CandidateResponse = {
  candidate: Candidate
}

type ErrorResponse = {
  message?: string
}

export const CANDIDATE_STAGE_MUTATION_KEY = ['candidate-stage'] as const

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

  return useMutation<
    Candidate,
    Error,
    UpdateCandidateStageVariables,
    UpdateCandidateStageContext
  >({
    mutationKey: CANDIDATE_STAGE_MUTATION_KEY,
    mutationFn: updateCandidateStage,
    onMutate: async ({ candidateId, stage }) => {
      await queryClient.cancelQueries({ queryKey: CANDIDATES_QUERY_KEY })

      const candidates = queryClient.getQueryData<Candidate[]>(
        CANDIDATES_QUERY_KEY,
      )
      const previousCandidate = candidates?.find(
        (candidate) => candidate.id === candidateId,
      )

      queryClient.setQueryData<Candidate[]>(
        CANDIDATES_QUERY_KEY,
        (currentCandidates) =>
          currentCandidates?.map((candidate) =>
            candidate.id === candidateId
              ? { ...candidate, stage }
              : candidate,
          ),
      )

      return { previousCandidate }
    },
    onError: (_error, { candidateId }, context) => {
      if (!context?.previousCandidate) {
        return
      }

      queryClient.setQueryData<Candidate[]>(
        CANDIDATES_QUERY_KEY,
        (candidates) =>
          candidates?.map((candidate) =>
            candidate.id === candidateId
              ? context.previousCandidate!
              : candidate,
          ),
      )
    },
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

export function useCandidateStageMutationState(candidateId: string) {
  const mutationStates = useMutationState({
    filters: { mutationKey: CANDIDATE_STAGE_MUTATION_KEY },
    select: (mutation) => ({
      error: mutation.state.error,
      status: mutation.state.status,
      submittedAt: mutation.state.submittedAt,
      variables: mutation.state.variables as
        | UpdateCandidateStageVariables
        | undefined,
    }),
  })
  const latestState = mutationStates
    .filter((state) => state.variables?.candidateId === candidateId)
    .sort((first, second) => first.submittedAt - second.submittedAt)
    .at(-1)

  return {
    error:
      latestState?.status === 'error' && latestState.error instanceof Error
        ? latestState.error
        : null,
    isPending: latestState?.status === 'pending',
  }
}
