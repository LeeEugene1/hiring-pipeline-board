import { BriefcaseBusiness, CalendarDays } from 'lucide-react'

import {
  PIPELINE_STAGE_LABELS,
  type Candidate,
} from '../../types/candidate'
import { CandidateStageMenu } from '../candidate/stage/CandidateStageMenu'

type CandidateCardProps = {
  candidate: Candidate
  onOpenDetail?: (
    candidate: Candidate,
    trigger: HTMLButtonElement,
  ) => void
}

function formatAppliedDate(appliedAt: string) {
  return appliedAt.replaceAll('-', '.')
}

export function CandidateCard({
  candidate,
  onOpenDetail,
}: CandidateCardProps) {
  const stageLabel = PIPELINE_STAGE_LABELS[candidate.stage]
  const nameId = `candidate-${candidate.id}-name`

  return (
    <li>
      <article
        aria-labelledby={nameId}
        className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm"
      >
        <button
          type="button"
          aria-label={`${candidate.name} 상세 보기`}
          onClick={(event) => onOpenDetail?.(candidate, event.currentTarget)}
          className="block w-full p-4 text-left outline-none transition hover:bg-slate-50 focus-visible:bg-slate-50 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-700"
        >
          <div className="flex items-start justify-between gap-3">
            <h4
              id={nameId}
              className="min-w-0 text-sm font-semibold text-slate-950"
            >
              {candidate.name}
            </h4>
            <span className="shrink-0 rounded-sm bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
              {stageLabel}
            </span>
          </div>
          <dl className="mt-3 space-y-2 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <dt className="sr-only">지원 직무</dt>
              <BriefcaseBusiness aria-hidden="true" className="size-3.5" />
              <dd className="truncate">{candidate.role}</dd>
            </div>
            <div className="flex items-center gap-2">
              <dt className="sr-only">지원일</dt>
              <CalendarDays aria-hidden="true" className="size-3.5" />
              <dd>
                <time dateTime={candidate.appliedAt}>
                  {formatAppliedDate(candidate.appliedAt)}
                </time>
              </dd>
            </div>
          </dl>
        </button>
        <div className="border-t border-slate-100 p-4 pt-3">
          <CandidateStageMenu candidate={candidate} />
        </div>
      </article>
    </li>
  )
}
