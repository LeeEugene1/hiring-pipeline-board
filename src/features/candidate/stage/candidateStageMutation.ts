import {
  useMutation,
  useMutationState,
  useQueryClient,
} from '@tanstack/react-query'

import type { Candidate, CandidateStage } from '../../../types/candidate'
import { CANDIDATES_QUERY_KEY } from '../../board/candidateQueries'

export type UpdateCandidateStageVariables = {
  candidateId: string
  requestId: number
  signal: AbortSignal
  stage: CandidateStage
}

type CandidateStageSelection = Pick<
  UpdateCandidateStageVariables,
  'candidateId' | 'stage'
>

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

let nextRequestId = 0
const latestRequestIdByCandidate = new Map<string, number>()
const requestControllerByCandidate = new Map<string, AbortController>()
const confirmedCandidateById = new Map<string, Candidate>()

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
  signal,
  stage,
}: UpdateCandidateStageVariables): Promise<Candidate> {
  const endpoint = new URL(
    `/api/candidates/${candidateId}/stage`,
    window.location.origin,
  )
  const response = await fetch(endpoint, {
    method: 'PATCH',
    signal,
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

  const mutation = useMutation<
    Candidate,
    Error,
    UpdateCandidateStageVariables,
    UpdateCandidateStageContext
  >({
    mutationKey: CANDIDATE_STAGE_MUTATION_KEY,
    mutationFn: updateCandidateStage,
    onMutate: async ({ candidateId, requestId, stage }) => {
      await queryClient.cancelQueries({ queryKey: CANDIDATES_QUERY_KEY })

      const candidates = queryClient.getQueryData<Candidate[]>(
        CANDIDATES_QUERY_KEY,
      )
      const previousCandidate = candidates?.find(
        (candidate) => candidate.id === candidateId,
      )

      if (previousCandidate && !confirmedCandidateById.has(candidateId)) {
        confirmedCandidateById.set(candidateId, previousCandidate)
      }

      queryClient.setQueryData<Candidate[]>(
        CANDIDATES_QUERY_KEY,
        (currentCandidates) =>
          currentCandidates?.map((candidate) =>
            candidate.id === candidateId
              ? { ...candidate, stage }
              : candidate,
          ),
      )

      return {
        previousCandidate:
          confirmedCandidateById.get(candidateId) ?? previousCandidate,
        requestId,
      }
    },
    onError: (_error, { candidateId, requestId }, context) => {
      if (latestRequestIdByCandidate.get(candidateId) !== requestId) {
        return
      }

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
    onSuccess: (updatedCandidate, { candidateId, requestId }) => {
      if (latestRequestIdByCandidate.get(candidateId) !== requestId) {
        return
      }

      queryClient.setQueryData<Candidate[]>(
        CANDIDATES_QUERY_KEY,
        (candidates) =>
          candidates?.map((candidate) =>
            candidate.id === updatedCandidate.id ? updatedCandidate : candidate,
          ),
      )
    },
    onSettled: (_data, _error, { candidateId, requestId }) => {
      if (latestRequestIdByCandidate.get(candidateId) !== requestId) {
        return
      }

      latestRequestIdByCandidate.delete(candidateId)
      requestControllerByCandidate.delete(candidateId)
      confirmedCandidateById.delete(candidateId)
    },
  })

  function mutateStage(selection: CandidateStageSelection) {
    requestControllerByCandidate.get(selection.candidateId)?.abort()

    const controller = new AbortController()
    const requestId = ++nextRequestId

    requestControllerByCandidate.set(selection.candidateId, controller)
    latestRequestIdByCandidate.set(selection.candidateId, requestId)
    mutation.mutate({ ...selection, requestId, signal: controller.signal })
  }

  return { ...mutation, mutateStage }
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
    .sort(
      (first, second) =>
        (first.variables?.requestId ?? first.submittedAt) -
        (second.variables?.requestId ?? second.submittedAt),
    )
    .at(-1)

  return {
    error:
      latestState?.status === 'error' && latestState.error instanceof Error
        ? latestState.error
        : null,
    isPending: latestState?.status === 'pending',
  }
}
