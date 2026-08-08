import { RotateCcw, Search } from 'lucide-react'

import { ALL_ROLES } from './candidateFilter'

type CandidateFiltersProps = {
  name: string
  role: string
  roles: string[]
  resultCount: number
  totalCount: number
  onNameChange: (name: string) => void
  onRoleChange: (role: string) => void
  onReset: () => void
}

export function CandidateFilters({
  name,
  role,
  roles,
  resultCount,
  totalCount,
  onNameChange,
  onRoleChange,
  onReset,
}: CandidateFiltersProps) {
  const hasActiveFilters = name.trim() !== '' || role !== ALL_ROLES

  return (
    <section
      aria-label="지원자 검색 및 필터"
      className="mb-4 flex flex-col gap-3 border-b border-slate-200 bg-white p-4 sm:flex-row sm:items-end"
    >
      <label className="min-w-0 flex-1">
        <span className="mb-1.5 block text-xs font-medium text-slate-700">
          이름 검색
        </span>
        <span className="relative block">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-500"
          />
          <input
            type="search"
            value={name}
            onChange={(event) => onNameChange(event.target.value)}
            placeholder="지원자 이름 입력"
            className="h-10 w-full rounded-md border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm text-slate-950 outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
          />
        </span>
      </label>

      <label className="sm:w-56">
        <span className="mb-1.5 block text-xs font-medium text-slate-700">
          지원 직무
        </span>
        <select
          value={role}
          onChange={(event) => onRoleChange(event.target.value)}
          className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
        >
          <option value={ALL_ROLES}>전체 직무</option>
          {roles.map((candidateRole) => (
            <option key={candidateRole} value={candidateRole}>
              {candidateRole}
            </option>
          ))}
        </select>
      </label>

      <div className="flex h-10 items-center justify-between gap-3 sm:justify-start">
        <p
          aria-label={`검색 결과 ${resultCount} / ${totalCount}명`}
          aria-live="polite"
          className="text-sm text-slate-600"
        >
          <strong className="font-semibold text-slate-950">{resultCount}</strong>
          <span> / {totalCount}명</span>
        </p>
        <button
          type="button"
          onClick={onReset}
          disabled={!hasActiveFilters}
          className="inline-flex size-10 shrink-0 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="검색 및 필터 초기화"
          title="검색 및 필터 초기화"
        >
          <RotateCcw aria-hidden="true" className="size-4" />
        </button>
      </div>
    </section>
  )
}
