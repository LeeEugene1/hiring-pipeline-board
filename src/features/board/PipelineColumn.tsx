import type { ReactNode } from 'react'

import type { PipelineStageDefinition } from './pipeline'

const STAGE_ACCENT_CLASSES: Record<PipelineStageDefinition['id'], string> = {
  'document-review': 'bg-slate-500',
  interview: 'bg-blue-600',
  offer: 'bg-amber-500',
  hired: 'bg-emerald-600',
  rejected: 'bg-rose-600',
}

type PipelineColumnProps = {
  stage: PipelineStageDefinition
  count: number
  children?: ReactNode
}

export function PipelineColumn({
  stage,
  count,
  children,
}: PipelineColumnProps) {
  const headingId = `pipeline-stage-${stage.id}`

  return (
    <section
      aria-labelledby={headingId}
      className="flex min-h-[32rem] min-w-0 flex-col overflow-hidden rounded-md border border-slate-200 bg-slate-50"
    >
      <div className={`h-1 ${STAGE_ACCENT_CLASSES[stage.id]}`} />
      <header className="flex min-h-14 items-center justify-between gap-3 border-b border-slate-200 bg-white px-4">
        <h3 id={headingId} className="text-sm font-semibold text-slate-900">
          {stage.label}
        </h3>
        <span
          aria-label={`${stage.label} 지원자 ${count}명`}
          className="inline-flex min-w-7 items-center justify-center rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold tabular-nums text-slate-700"
        >
          {count}
        </span>
      </header>
      <div className="flex-1 p-3">{children}</div>
    </section>
  )
}
