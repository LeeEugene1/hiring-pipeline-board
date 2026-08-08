import { useDeferredValue, useMemo, useState } from 'react'

import { CandidateFilters } from '../filter/CandidateFilters'
import {
  ALL_ROLES,
  filterCandidates,
  getCandidateRoles,
} from '../filter/candidateFilter'
import type { Candidate } from '../../types/candidate'
import {
  BoardEmptyState,
  BoardErrorState,
  BoardLoadingState,
} from './states'
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
    return <BoardLoadingState />
  }

  if (candidatesQuery.isError) {
    return (
      <BoardErrorState
        isRetrying={candidatesQuery.isFetching}
        onRetry={() => void candidatesQuery.refetch()}
      />
    )
  }

  function resetFilters() {
    setName('')
    setRole(ALL_ROLES)
  }

  if (candidates.length === 0) {
    return <BoardEmptyState kind="all" />
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
      {filteredCandidates.length === 0 ? (
        <BoardEmptyState kind="filtered" onResetFilters={resetFilters} />
      ) : (
        <PipelineBoard candidates={filteredCandidates} />
      )}
    </>
  )
}
