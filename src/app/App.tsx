import { BriefcaseBusiness } from 'lucide-react'

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
        aria-label="보드 준비 상태"
        className="mx-auto max-w-screen-2xl px-4 py-8 sm:px-6"
      >
        <p className="text-sm text-slate-600">지원자 보드를 준비하고 있습니다.</p>
      </section>
    </main>
  )
}
