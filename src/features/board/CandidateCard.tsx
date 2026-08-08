import { BriefcaseBusiness, CalendarDays } from 'lucide-react'

import {
  PIPELINE_STAGE_LABELS,
  type Candidate,
} from '../../types/candidate'
import { CandidateStageMenu } from '../candidate/stage/CandidateStageMenu'

type CandidateCardProps = {
  candidate: Candidate
}

function formatAppliedDate(appliedAt: string) {
  return appliedAt.replaceAll('-', '.')
}

export function CandidateCard({ candidate }: CandidateCardProps) {
  const stageLabel = PIPELINE_STAGE_LABELS[candidate.stage]
  const nameId = `candidate-${candidate.id}-name`

  return (
    <li>
      <article
        aria-labelledby={nameId}
        className="rounded-md border border-slate-200 bg-white p-4 shadow-sm"
      >
        <div className="flex items-start justify-between gap-3">
          <h4
            id={nameId}
            className="min-w-0 text-sm font-semibold text-slate-950"
          >
            {candidate.name}
          </h4>
          <dl>
            <div>
              <dt className="sr-only">현재 단계</dt>
              <dd className="shrink-0 rounded-sm bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
                {stageLabel}
              </dd>
            </div>
          </dl>
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
        <div className="mt-3 border-t border-slate-100 pt-3">
          <CandidateStageMenu candidate={candidate} />
        </div>
      </article>
    </li>
  )
}
