'use client'
// 수정: Auto — 2026-07-13 01:23 (공통 필드 위임)
// 수정: Auto — 2026-07-13 01:14 (혜택받는 날짜 텍스트·달력)

import { CardApplicationFlexibleDateField } from '@/components/home/CardApplicationFlexibleDateField'
import { cardApplicationBenefitDateToInput } from '@/lib/cardApplicationBenefitDate'

type Props = {
  value: string
  onChange: (value: string) => void
}

export function CardApplicationBenefitDateField({ value, onChange }: Props) {
  return (
    <CardApplicationFlexibleDateField
      label="혜택받는 날짜"
      placeholder="9월 중순경"
      value={value}
      onChange={onChange}
      calendarAriaLabel="혜택받는 날짜 달력"
    />
  )
}

export { cardApplicationBenefitDateToInput }
