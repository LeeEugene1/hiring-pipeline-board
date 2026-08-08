import { PipelineBoard } from './PipelineBoard'
import { useCandidates } from './candidateQueries'

export function CandidatePipelineBoard() {
  const candidatesQuery = useCandidates()

  if (candidatesQuery.isPending) {
    return (
      <p role="status" className="py-8 text-sm text-slate-600">
        지원자를 불러오는 중입니다.
      </p>
    )
  }

  if (candidatesQuery.isError) {
    return (
      <p role="alert" className="py-8 text-sm font-medium text-rose-700">
        지원자를 불러오지 못했습니다.
      </p>
    )
  }

  return <PipelineBoard candidates={candidatesQuery.data} />
}
