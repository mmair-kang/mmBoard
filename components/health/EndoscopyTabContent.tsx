'use client'
// 수정: Auto — 2026-07-27 02:45 (공통 세그먼트 사용)
// 수정: Auto — 2026-07-27 02:09

import { ExamSectionTabContent } from '@/components/health/ExamSectionTabContent'
import { ENDOSCOPY_SCOPES } from '@/lib/endoscopyTypes'

export function EndoscopyTabContent() {
  return <ExamSectionTabContent scopes={ENDOSCOPY_SCOPES} defaultScope="gastro" />
}
