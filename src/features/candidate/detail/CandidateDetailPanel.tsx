import * as Dialog from '@radix-ui/react-dialog'
import {
  BriefcaseBusiness,
  CalendarDays,
  Clock3,
  Mail,
  Phone,
  X,
} from 'lucide-react'
import { type RefObject, useEffect, useId, useRef } from 'react'

import {
  PIPELINE_STAGE_LABELS,
  type Candidate,
} from '../../../types/candidate'

export type CandidateDetailPanelProps = {
  candidate: Candidate | null
  onClose: () => void
  triggerRef: RefObject<HTMLElement | null>
}

function formatAppliedDate(appliedAt: string) {
  return appliedAt.replaceAll('-', '.')
}

export function CandidateDetailPanel({
  candidate,
  onClose,
  triggerRef,
}: CandidateDetailPanelProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const titleId = useId()
  const descriptionId = useId()

  useEffect(() => {
    if (!candidate) return

    const trigger = triggerRef.current

    return () => {
      window.setTimeout(() => trigger?.focus(), 0)
    }
  }, [candidate, triggerRef])

  return (
    <Dialog.Root
      open={candidate !== null}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose()
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay
          className="fixed inset-0 z-50 bg-slate-950/35"
          data-testid="candidate-detail-overlay"
        />
        {candidate ? (
          <Dialog.Content
            aria-describedby={descriptionId}
            aria-labelledby={titleId}
            className="fixed inset-y-0 right-0 z-50 h-full w-full max-w-md overflow-y-auto border-l border-slate-200 bg-white shadow-xl focus:outline-none"
            onCloseAutoFocus={(event) => {
              event.preventDefault()
            }}
            onEscapeKeyDown={(event) => event.preventDefault()}
            onOpenAutoFocus={(event) => {
              event.preventDefault()
              closeButtonRef.current?.focus()
            }}
          >
            <header className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-500">
                  {PIPELINE_STAGE_LABELS[candidate.stage]}
                </p>
                <Dialog.Title
                  className="mt-1 text-xl font-semibold text-slate-950"
                  id={titleId}
                >
                  {candidate.name} 지원자 상세
                </Dialog.Title>
                <Dialog.Description
                  className="mt-1 text-sm text-slate-600"
                  id={descriptionId}
                >
                  {candidate.role} 지원 정보
                </Dialog.Description>
              </div>
              <Dialog.Close asChild>
                <button
                  aria-label="상세 패널 닫기"
                  className="grid size-9 shrink-0 place-items-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-950"
                  ref={closeButtonRef}
                  type="button"
                >
                  <X aria-hidden="true" className="size-5" />
                </button>
              </Dialog.Close>
            </header>

            <div className="space-y-7 px-6 py-6">
              <section aria-labelledby={`${titleId}-contact`}>
                <h3
                  className="text-sm font-semibold text-slate-950"
                  id={`${titleId}-contact`}
                >
                  연락처
                </h3>
                <dl className="mt-3 space-y-3 text-sm text-slate-700">
                  <div className="flex items-center gap-3">
                    <Mail aria-hidden="true" className="size-4 text-slate-400" />
                    <dt className="sr-only">이메일</dt>
                    <dd className="min-w-0 break-all">{candidate.email}</dd>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone aria-hidden="true" className="size-4 text-slate-400" />
                    <dt className="sr-only">전화번호</dt>
                    <dd>{candidate.phone}</dd>
                  </div>
                </dl>
              </section>

              <section aria-labelledby={`${titleId}-application`}>
                <h3
                  className="text-sm font-semibold text-slate-950"
                  id={`${titleId}-application`}
                >
                  지원 정보
                </h3>
                <dl className="mt-3 grid gap-3 text-sm text-slate-700">
                  <div className="flex items-center gap-3">
                    <BriefcaseBusiness
                      aria-hidden="true"
                      className="size-4 text-slate-400"
                    />
                    <dt className="w-16 shrink-0 text-slate-500">지원 직무</dt>
                    <dd className="font-medium text-slate-900">
                      {candidate.role}
                    </dd>
                  </div>
                  <div className="flex items-center gap-3">
                    <CalendarDays
                      aria-hidden="true"
                      className="size-4 text-slate-400"
                    />
                    <dt className="w-16 shrink-0 text-slate-500">지원일</dt>
                    <dd>
                      <time dateTime={candidate.appliedAt}>
                        {formatAppliedDate(candidate.appliedAt)}
                      </time>
                    </dd>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock3 aria-hidden="true" className="size-4 text-slate-400" />
                    <dt className="w-16 shrink-0 text-slate-500">경력</dt>
                    <dd>{candidate.experienceYears}년</dd>
                  </div>
                </dl>
              </section>

              <section aria-labelledby={`${titleId}-summary`}>
                <h3
                  className="text-sm font-semibold text-slate-950"
                  id={`${titleId}-summary`}
                >
                  지원자 요약
                </h3>
                <p className="mt-3 rounded-md border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700">
                  {candidate.summary}
                </p>
              </section>
            </div>
          </Dialog.Content>
        ) : null}
      </Dialog.Portal>
    </Dialog.Root>
  )
}
