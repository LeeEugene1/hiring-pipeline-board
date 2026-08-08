import {
  PIPELINE_STAGES,
  PIPELINE_STAGE_LABELS,
  type Candidate,
  type CandidateStage,
} from '../../types/candidate'

export type PipelineStageDefinition = {
  id: CandidateStage
  label: string
}

export const PIPELINE_STAGE_DEFINITIONS: PipelineStageDefinition[] =
  PIPELINE_STAGES.map((stage) => ({
    id: stage,
    label: PIPELINE_STAGE_LABELS[stage],
  }))

export type CandidatesByStage = Record<CandidateStage, Candidate[]>

export function groupCandidatesByStage(
  candidates: Candidate[],
): CandidatesByStage {
  const groups: CandidatesByStage = {
    'document-review': [],
    interview: [],
    offer: [],
    hired: [],
    rejected: [],
  }

  candidates.forEach((candidate) => {
    groups[candidate.stage].push(candidate)
  })

  return groups
}
