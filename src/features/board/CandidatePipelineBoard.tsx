import { useDeferredValue, useMemo, useState } from 'react'

import { CandidateFilters } from '../filter/CandidateFilters'
import {
  ALL_ROLES,
  filterCandidates,
  getCandidateRoles,
} from '../filter/candidateFilter'
import type { Candidate } from '../../types/candidate'
import { useCandidates } from './candidateQueries'
import { PipelineBoard } from './PipelineBoard'

const EMPTY_CANDIDATES: Candidate[] = []

export function CandidatePipelineBoard() {
  const candidatesQuery = useCandidates()
  const [name, setName] = useState('')
  const [role, setRole] = useState(ALL_ROLES)
  const deferredName = useDeferredValue(name)

  const candidates = candidatesQuery.data ?? EMPTY_CANDIDATES
  const roles = useMemo(() => getCandidateRoles(candidates), [candidates])
  const filteredCandidates = useMemo(
    () => filterCandidates(candidates, { name: deferredName, role }),
    [candidates, deferredName, role],
  )

  if (candidatesQuery.isPending) {
    return (
      <p role="status" className="py-8 text-sm text-slate-600">
        지원자를 불러오는 중입니다.
      </p>
    )
  }

  if (candidatesQuery.isError) {
    return (
      <p role="alert" className="py-8 text-sm font-medium text-rose-700">
        지원자를 불러오지 못했습니다.
      </p>
    )
  }

  function resetFilters() {
    setName('')
    setRole(ALL_ROLES)
  }

  return (
    <>
      <CandidateFilters
        name={name}
        role={role}
        roles={roles}
        resultCount={filteredCandidates.length}
        totalCount={candidates.length}
        onNameChange={setName}
        onRoleChange={setRole}
        onReset={resetFilters}
      />
      <PipelineBoard candidates={filteredCandidates} />
    </>
  )
}
