// 수정: Auto — 2026-07-27 02:51 (치과 탭)
// 수정: Auto — 2026-07-27 02:45 (초음파 탭)
// 수정: Auto — 2026-07-27 01:56

export const HEALTH_TAB_IDS = ['checkup', 'endoscopy', 'ultrasound', 'dental'] as const
export type HealthTabId = (typeof HEALTH_TAB_IDS)[number]

export const HEALTH_TAB_LABELS: Record<HealthTabId, string> = {
  checkup: '검진',
  endoscopy: '내시경',
  ultrasound: '초음파',
  dental: '치과',
}
