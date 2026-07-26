'use client'
// 수정: Auto — 2026-07-27 02:51

import { ExamSectionTabContent } from '@/components/health/ExamSectionTabContent'
import { DENTAL_SCOPES } from '@/lib/endoscopyTypes'

export function DentalTabContent() {
  return <ExamSectionTabContent scopes={DENTAL_SCOPES} defaultScope="scaling" />
}
