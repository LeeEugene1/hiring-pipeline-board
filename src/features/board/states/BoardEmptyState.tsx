import { Inbox, RotateCcw, SearchX } from 'lucide-react'

type AllCandidatesEmptyStateProps = {
  kind: 'all'
}

type FilteredCandidatesEmptyStateProps = {
  kind: 'filtered'
  onResetFilters: () => void
}

type BoardEmptyStateProps =
  | AllCandidatesEmptyStateProps
  | FilteredCandidatesEmptyStateProps

export function BoardEmptyState(props: BoardEmptyStateProps) {
  const isFiltered = props.kind === 'filtered'
  const EmptyIcon = isFiltered ? SearchX : Inbox
  const title = isFiltered
    ? '조건에 맞는 지원자가 없습니다'
    : '등록된 지원자가 없습니다'
  const description = isFiltered
    ? '검색어나 직무 필터를 변경해 다른 지원자를 찾아보세요.'
    : '지원자가 등록되면 채용 단계별로 이곳에 표시됩니다.'

  return (
    <section
      aria-labelledby={`board-${props.kind}-empty-title`}
      aria-live="polite"
      className="flex min-h-[32rem] flex-col items-center justify-center border-y border-slate-200 bg-white px-6 py-12 text-center"
      role="status"
    >
      <EmptyIcon
        aria-hidden="true"
        className="mb-4 size-9 text-slate-500"
        strokeWidth={1.75}
      />
      <h2
        className="text-base font-semibold text-slate-950"
        id={`board-${props.kind}-empty-title`}
      >
        {title}
      </h2>
      <p className="mt-2 max-w-sm text-sm leading-6 text-slate-600">
        {description}
      </p>
      {isFiltered ? (
        <button
          className="mt-5 inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-800 transition-colors hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
          onClick={props.onResetFilters}
          type="button"
        >
          <RotateCcw aria-hidden="true" className="size-4" />
          필터 초기화
        </button>
      ) : null}
    </section>
  )
}
