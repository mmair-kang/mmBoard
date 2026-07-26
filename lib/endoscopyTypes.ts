// 수정: Auto — 2026-07-27 02:51 (치과 스코프 추가)
// 수정: Auto — 2026-07-27 02:45 (초음파 스코프 추가)
// 수정: Auto — 2026-07-27 02:09

export const ENDOSCOPY_SCOPE_IDS = ['gastro', 'colono'] as const
export type EndoscopyScopeId = (typeof ENDOSCOPY_SCOPE_IDS)[number]

export const ULTRASOUND_SCOPE_IDS = ['thyroidUs', 'carotidUs', 'abdomenUs'] as const
export type UltrasoundScopeId = (typeof ULTRASOUND_SCOPE_IDS)[number]

export const DENTAL_SCOPE_IDS = ['scaling', 'dentalCare'] as const
export type DentalScopeId = (typeof DENTAL_SCOPE_IDS)[number]

export const HEALTH_EXAM_SCOPE_IDS = [
  ...ENDOSCOPY_SCOPE_IDS,
  ...ULTRASOUND_SCOPE_IDS,
  ...DENTAL_SCOPE_IDS,
] as const
export type HealthExamScopeId = (typeof HEALTH_EXAM_SCOPE_IDS)[number]

export const HEALTH_EXAM_SCOPE_LABELS: Record<HealthExamScopeId, string> = {
  gastro: '위내시경',
  colono: '대장내시경',
  thyroidUs: '갑상선초음파',
  carotidUs: '경동맥초음파',
  abdomenUs: '상복부초음파',
  scaling: '스케일링',
  dentalCare: '진료',
}

export const ENDOSCOPY_SCOPE_LABELS = HEALTH_EXAM_SCOPE_LABELS

export const ENDOSCOPY_SCOPES: { id: EndoscopyScopeId; label: string }[] = ENDOSCOPY_SCOPE_IDS.map(
  (id) => ({ id, label: HEALTH_EXAM_SCOPE_LABELS[id] }),
)

export const ULTRASOUND_SCOPES: { id: UltrasoundScopeId; label: string }[] = ULTRASOUND_SCOPE_IDS.map(
  (id) => ({ id, label: HEALTH_EXAM_SCOPE_LABELS[id] }),
)

export const DENTAL_SCOPES: { id: DentalScopeId; label: string }[] = DENTAL_SCOPE_IDS.map((id) => ({
  id,
  label: HEALTH_EXAM_SCOPE_LABELS[id],
}))

export function parseHealthExamScope(value: unknown): HealthExamScopeId | null {
  if (typeof value !== 'string') return null
  return (HEALTH_EXAM_SCOPE_IDS as readonly string[]).includes(value)
    ? (value as HealthExamScopeId)
    : null
}

/** @deprecated parseHealthExamScope 사용 */
export function parseEndoscopyScope(value: unknown): HealthExamScopeId | null {
  return parseHealthExamScope(value)
}
