import type { Candidate } from '../../types/candidate'

export const ALL_ROLES = 'all'

export type CandidateFilter = {
  name: string
  role: string
}

function normalizeSearchText(value: string) {
  return value.trim().toLocaleLowerCase('ko-KR')
}

export function getCandidateRoles(candidates: Candidate[]) {
  return [...new Set(candidates.map((candidate) => candidate.role))].sort(
    (left, right) => left.localeCompare(right, 'ko-KR'),
  )
}

export function filterCandidates(
  candidates: Candidate[],
  { name, role }: CandidateFilter,
) {
  const normalizedName = normalizeSearchText(name)

  return candidates.filter((candidate) => {
    const matchesName = normalizeSearchText(candidate.name).includes(
      normalizedName,
    )
    const matchesRole = role === ALL_ROLES || candidate.role === role

    return matchesName && matchesRole
  })
}
