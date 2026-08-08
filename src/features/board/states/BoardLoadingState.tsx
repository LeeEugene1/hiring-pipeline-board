const SKELETON_COLUMNS = 5
const SKELETON_CARDS_PER_COLUMN = [3, 2, 2, 1, 2]

export function BoardLoadingState() {
  return (
    <section
      aria-busy="true"
      aria-label="채용 단계 보드 로딩"
      aria-live="polite"
      className="min-w-0"
      role="status"
    >
      <span className="sr-only">지원자를 불러오는 중입니다.</span>
      <div aria-hidden="true" className="overflow-x-auto pb-4">
        <div className="grid min-w-[87rem] grid-cols-5 gap-4">
          {Array.from({ length: SKELETON_COLUMNS }, (_, columnIndex) => (
            <div
              className="min-h-[32rem] overflow-hidden rounded-md border border-slate-200 bg-slate-50"
              key={columnIndex}
            >
              <div className="h-1 bg-slate-300" />
              <div className="flex min-h-14 items-center justify-between border-b border-slate-200 bg-white px-4">
                <div className="h-4 w-20 animate-pulse rounded bg-slate-200" />
                <div className="h-7 w-7 animate-pulse rounded-full bg-slate-200" />
              </div>
              <div className="space-y-3 p-3">
                {Array.from(
                  { length: SKELETON_CARDS_PER_COLUMN[columnIndex] },
                  (_, cardIndex) => (
                    <div
                      className="animate-pulse rounded-md border border-slate-200 bg-white p-4"
                      key={cardIndex}
                    >
                      <div className="h-4 w-2/3 rounded bg-slate-200" />
                      <div className="mt-3 h-3 w-1/2 rounded bg-slate-200" />
                      <div className="mt-5 h-8 rounded bg-slate-100" />
                    </div>
                  ),
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
