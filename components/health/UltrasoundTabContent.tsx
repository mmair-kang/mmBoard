'use client'
// 수정: Auto — 2026-07-27 02:45

import { ExamSectionTabContent } from '@/components/health/ExamSectionTabContent'
import { ULTRASOUND_SCOPES } from '@/lib/endoscopyTypes'

export function UltrasoundTabContent() {
  return <ExamSectionTabContent scopes={ULTRASOUND_SCOPES} defaultScope="thyroidUs" />
}
