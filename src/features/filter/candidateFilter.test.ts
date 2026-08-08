import { describe, expect, it } from 'vitest'

import { createCandidateSeed } from '../../data/candidateSeed'
import type { Candidate } from '../../types/candidate'
import {
  ALL_ROLES,
  filterCandidates,
  getCandidateRoles,
} from './candidateFilter'

const candidates: Candidate[] = [
  {
    id: 'candidate-1',
    name: 'Kim Eugene',
    role: '프론트엔드 개발자',
    appliedAt: '2026-08-01',
    stage: 'document-review',
    email: 'kim@example.com',
    phone: '010-0000-0000',
    experienceYears: 3,
    summary: '지원자',
  },
  {
    id: 'candidate-2',
    name: 'Lee Eugene',
    role: '백엔드 개발자',
    appliedAt: '2026-08-02',
    stage: 'interview',
    email: 'lee@example.com',
    phone: '010-1111-1111',
    experienceYears: 5,
    summary: '지원자',
  },
]

describe('지원자 필터', () => {
  it('검색어의 앞뒤 공백과 대소문자를 정규화해 이름을 부분 검색한다', () => {
    expect(
      filterCandidates(candidates, { name: '  KIM  ', role: ALL_ROLES }),
    ).toEqual([candidates[0]])
  })

  it('이름 검색과 직무 필터의 교집합을 반환한다', () => {
    expect(
      filterCandidates(candidates, {
        name: 'eugene',
        role: '백엔드 개발자',
      }),
    ).toEqual([candidates[1]])
  })

  it('중복을 제거한 직무 목록을 정렬한다', () => {
    expect(getCandidateRoles([...candidates, candidates[0]])).toEqual([
      '백엔드 개발자',
      '프론트엔드 개발자',
    ])
  })

  it('200건 데이터의 검색과 직무 필터를 처리한다', () => {
    const seed = createCandidateSeed(200)
    const result = filterCandidates(seed, {
      name: '김',
      role: '프론트엔드 개발자',
    })

    expect(result.length).toBeGreaterThan(0)
    expect(
      result.every(
        (candidate) =>
          candidate.name.includes('김') &&
          candidate.role === '프론트엔드 개발자',
      ),
    ).toBe(true)
  })
})
