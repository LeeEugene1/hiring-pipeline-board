import {
  PIPELINE_STAGES,
  PIPELINE_STAGE_LABELS,
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
