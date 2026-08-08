export const PIPELINE_STAGES = [
  'document-review',
  'interview',
  'offer',
  'hired',
  'rejected',
] as const

export type CandidateStage = (typeof PIPELINE_STAGES)[number]

export const PIPELINE_STAGE_LABELS: Record<CandidateStage, string> = {
  'document-review': '서류검토',
  interview: '면접',
  offer: '처우협의',
  hired: '최종합격',
  rejected: '불합격',
}

export type Candidate = {
  id: string
  name: string
  role: string
  appliedAt: string
  stage: CandidateStage
  email: string
  phone: string
  experienceYears: number
  summary: string
}

export function isCandidateStage(value: unknown): value is CandidateStage {
  return PIPELINE_STAGES.includes(value as CandidateStage)
}
