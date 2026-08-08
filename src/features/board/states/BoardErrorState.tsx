import { AlertTriangle, RefreshCw } from 'lucide-react'

type BoardErrorStateProps = {
  isRetrying?: boolean
  onRetry: () => void
}

export function BoardErrorState({
  isRetrying = false,
  onRetry,
}: BoardErrorStateProps) {
  return (
    <section
      aria-labelledby="board-error-title"
      className="flex min-h-[32rem] flex-col items-center justify-center border-y border-slate-200 bg-white px-6 py-12 text-center"
      role="alert"
    >
      <AlertTriangle
        aria-hidden="true"
        className="mb-4 size-9 text-rose-600"
        strokeWidth={1.75}
      />
      <h2
        className="text-base font-semibold text-slate-950"
        id="board-error-title"
      >
        지원자를 불러오지 못했습니다
      </h2>
      <p className="mt-2 max-w-sm text-sm leading-6 text-slate-600">
        네트워크 상태를 확인한 뒤 다시 시도해 주세요.
      </p>
      <button
        className="mt-5 inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-slate-900 px-4 text-sm font-semibold text-white transition-colors hover:bg-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 disabled:cursor-not-allowed disabled:bg-slate-400"
        disabled={isRetrying}
        onClick={onRetry}
        type="button"
      >
        <RefreshCw
          aria-hidden="true"
          className={`size-4 ${isRetrying ? 'animate-spin' : ''}`}
        />
        {isRetrying ? '다시 시도 중...' : '다시 시도'}
      </button>
    </section>
  )
}
