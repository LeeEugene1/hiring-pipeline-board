import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import {
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  LoaderCircle,
} from 'lucide-react'

import {
  PIPELINE_STAGES,
  PIPELINE_STAGE_LABELS,
  type Candidate,
  type CandidateStage,
} from '../../../types/candidate'
import {
  useCandidateStageMutationState,
  useUpdateCandidateStage,
} from './candidateStageMutation'

type CandidateStageMenuProps = {
  candidate: Candidate
}

export function CandidateStageMenu({ candidate }: CandidateStageMenuProps) {
  const stageMutation = useUpdateCandidateStage()
  const mutationState = useCandidateStageMutationState(candidate.id)
  const currentStageIndex = PIPELINE_STAGES.indexOf(candidate.stage)
  const previousStage = PIPELINE_STAGES[currentStageIndex - 1]
  const nextStage = PIPELINE_STAGES[currentStageIndex + 1]

  function handleStageSelect(stage: CandidateStage) {
    if (stage === candidate.stage) {
      return
    }

    stageMutation.mutateStage({ candidateId: candidate.id, stage })
  }

  return (
    <div>
      <div className="grid grid-cols-[1.75rem_1fr_1.75rem] items-center gap-1">
        <button
          type="button"
          title="이전 단계"
          aria-label={`${candidate.name} 이전 단계로 이동`}
          disabled={previousStage === undefined}
          onClick={() => {
            if (previousStage) {
              handleStageSelect(previousStage)
            }
          }}
          className="inline-flex size-7 shrink-0 items-center justify-center rounded-sm border border-slate-200 bg-white text-slate-600 outline-none hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-35"
        >
          <ChevronLeft aria-hidden="true" className="size-4" />
        </button>

        <DropdownMenu.Root
        >
          <DropdownMenu.Trigger asChild>
            <button
              type="button"
              aria-label={`${candidate.name} 단계 변경`}
              aria-busy={mutationState.isPending}
              className="inline-flex min-h-7 w-full items-center justify-center gap-1 rounded-sm border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-medium text-slate-700 outline-none hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-70"
            >
              <>
                {PIPELINE_STAGE_LABELS[candidate.stage]}
                {mutationState.isPending ? (
                  <LoaderCircle
                    aria-hidden="true"
                    className="size-3.5 animate-spin"
                  />
                ) : (
                  <ChevronDown aria-hidden="true" className="size-3.5" />
                )}
              </>
            </button>
          </DropdownMenu.Trigger>

          <DropdownMenu.Portal>
            <DropdownMenu.Content
              align="end"
              sideOffset={6}
              aria-label={`${candidate.name} 채용 단계 선택`}
              className="z-50 min-w-40 rounded-md border border-slate-200 bg-white p-1 shadow-lg"
            >
              {PIPELINE_STAGES.map((stage) => {
                const isCurrentStage = stage === candidate.stage

                return (
                  <DropdownMenu.Item
                    key={stage}
                    disabled={isCurrentStage}
                    onSelect={() => handleStageSelect(stage)}
                    className="flex min-h-9 cursor-default select-none items-center justify-between gap-3 rounded-sm px-3 py-2 text-sm text-slate-700 outline-none data-[disabled]:text-slate-400 data-[highlighted]:bg-emerald-50 data-[highlighted]:text-emerald-950"
                  >
                    <span>
                      {PIPELINE_STAGE_LABELS[stage]}
                      {isCurrentStage ? ' (현재)' : ''}
                    </span>
                    {isCurrentStage ? (
                      <Check aria-hidden="true" className="size-4" />
                    ) : null}
                  </DropdownMenu.Item>
                )
              })}
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>

        <button
          type="button"
          title="다음 단계"
          aria-label={`${candidate.name} 다음 단계로 이동`}
          disabled={nextStage === undefined}
          onClick={() => {
            if (nextStage) {
              handleStageSelect(nextStage)
            }
          }}
          className="inline-flex size-7 shrink-0 items-center justify-center rounded-sm border border-slate-200 bg-white text-slate-600 outline-none hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-35"
        >
          <ChevronRight aria-hidden="true" className="size-4" />
        </button>
      </div>

      {mutationState.error ? (
        <p role="alert" className="mt-2 max-w-40 text-xs text-rose-700">
          {mutationState.error.message}
        </p>
      ) : null}
    </div>
  )
}
