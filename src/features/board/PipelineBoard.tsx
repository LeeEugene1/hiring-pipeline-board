import type { Candidate } from '../../types/candidate'
import { CandidateCard } from './CandidateCard'
import { PipelineColumn } from './PipelineColumn'
import {
  groupCandidatesByStage,
  PIPELINE_STAGE_DEFINITIONS,
} from './pipeline'

type PipelineBoardProps = {
  candidates?: Candidate[]
}

export function PipelineBoard({ candidates = [] }: PipelineBoardProps) {
  const candidatesByStage = groupCandidatesByStage(candidates)

  return (
    <section aria-labelledby="pipeline-board-title" className="min-w-0">
      <h2 id="pipeline-board-title" className="sr-only">
        채용 단계 보드
      </h2>
      <div className="overflow-x-auto pb-4">
        <div className="grid min-w-[87rem] grid-cols-5 gap-4">
          {PIPELINE_STAGE_DEFINITIONS.map((stage) => (
            <PipelineColumn
              key={stage.id}
              stage={stage}
              count={candidatesByStage[stage.id].length}
            >
              <ol
                aria-label={`${stage.label} 지원자 목록`}
                className="space-y-3"
              >
                {candidatesByStage[stage.id].map((candidate) => (
                  <CandidateCard key={candidate.id} candidate={candidate} />
                ))}
              </ol>
            </PipelineColumn>
          ))}
        </div>
      </div>
    </section>
  )
}
