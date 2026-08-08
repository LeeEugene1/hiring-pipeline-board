import { PipelineColumn } from './PipelineColumn'
import { PIPELINE_STAGE_DEFINITIONS } from './pipeline'

export function PipelineBoard() {
  return (
    <section aria-labelledby="pipeline-board-title" className="min-w-0">
      <h2 id="pipeline-board-title" className="sr-only">
        채용 단계 보드
      </h2>
      <div className="overflow-x-auto pb-4">
        <div className="grid min-w-[87rem] grid-cols-5 gap-4">
          {PIPELINE_STAGE_DEFINITIONS.map((stage) => (
            <PipelineColumn key={stage.id} stage={stage} count={0} />
          ))}
        </div>
      </div>
    </section>
  )
}
