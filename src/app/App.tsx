import { BriefcaseBusiness } from 'lucide-react'

import { CandidatePipelineBoard } from '../features/board/CandidatePipelineBoard'

export function App() {
  return (
    <main className="min-h-screen bg-slate-100 text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex min-h-16 max-w-screen-2xl items-center gap-3 px-4 sm:px-6">
          <span className="flex size-9 items-center justify-center rounded-md bg-emerald-700 text-white">
            <BriefcaseBusiness aria-hidden="true" className="size-5" />
          </span>
          <h1 className="text-lg font-semibold">채용 파이프라인</h1>
        </div>
      </header>

      <section
        aria-label="채용 파이프라인 작업 영역"
        className="mx-auto max-w-screen-2xl px-4 py-6 sm:px-6"
      >
        <CandidatePipelineBoard />
      </section>
    </main>
  )
}
