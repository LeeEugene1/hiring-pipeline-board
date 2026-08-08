import {
  PIPELINE_STAGES,
  type Candidate,
  type CandidateStage,
} from '../types/candidate'

const FAMILY_NAMES = [
  '김',
  '이',
  '박',
  '최',
  '정',
  '강',
  '조',
  '윤',
  '장',
  '임',
]

const GIVEN_NAMES = [
  '서준',
  '서연',
  '도윤',
  '지우',
  '하준',
  '하윤',
  '지호',
  '수아',
  '준서',
  '지민',
  '현우',
  '채원',
  '민준',
  '예은',
  '시우',
  '유진',
  '건우',
  '다은',
  '우진',
  '소윤',
]

const ROLES = [
  '프론트엔드 개발자',
  '백엔드 개발자',
  '프로덕트 디자이너',
  '데이터 분석가',
  'QA 엔지니어',
  '프로덕트 매니저',
  'DevOps 엔지니어',
  '모바일 개발자',
]

const SEED_BASE_DATE = Date.UTC(2026, 6, 31)
const ONE_DAY_MS = 24 * 60 * 60 * 1000

function getAppliedDate(index: number) {
  const daysAgo = (index * 7) % 180

  return new Date(SEED_BASE_DATE - daysAgo * ONE_DAY_MS)
    .toISOString()
    .slice(0, 10)
}

function getCandidateStage(index: number): CandidateStage {
  return PIPELINE_STAGES[index % PIPELINE_STAGES.length]
}

export function createCandidateSeed(count = 200): Candidate[] {
  return Array.from({ length: count }, (_, index) => {
    const familyName = FAMILY_NAMES[index % FAMILY_NAMES.length]
    const givenNameIndex =
      Math.floor(index / FAMILY_NAMES.length) % GIVEN_NAMES.length
    const givenName = GIVEN_NAMES[givenNameIndex]
    const sequence = String(index + 1).padStart(3, '0')

    return {
      id: `candidate-${sequence}`,
      name: `${familyName}${givenName}`,
      role: ROLES[index % ROLES.length],
      appliedAt: getAppliedDate(index),
      stage: getCandidateStage(index),
      email: `candidate${sequence}@example.com`,
      phone: [
        '010',
        String(1000 + (index % 9000)).padStart(4, '0'),
        String(2000 + (index % 8000)).padStart(4, '0'),
      ].join('-'),
      experienceYears: index % 13,
      summary: `${ROLES[index % ROLES.length]} 포지션에 지원한 후보자입니다.`,
    }
  })
}

export const CANDIDATE_SEED = createCandidateSeed()
