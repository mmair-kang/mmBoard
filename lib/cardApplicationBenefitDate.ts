// 수정: Auto — 2026-07-13 01:14 (혜택받는 날짜 텍스트·달력)
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'

import { CARD_APPLICATION_DATE_PICKER_FORMAT, formatCardApplicationDateLabel } from '@/lib/cardApplicationFormat'
import { parseLastPurchaseDate } from '@/lib/shoppingDate'

dayjs.extend(customParseFormat)

export function isCardApplicationIsoBenefitDate(value: string | null | undefined): boolean {
  if (!value) return false
  return parseLastPurchaseDate(value) != null
}

/** 폼·목록 표시용 */
export function cardApplicationBenefitDateToInput(value: string | null | undefined): string {
  if (!value) return ''
  const formatted = formatCardApplicationDateLabel(value)
  return formatted ?? value
}

/** 저장용 — ISO 날짜 또는 자유 텍스트 */
export function serializeCardApplicationBenefitDateInput(input: string): string | null {
  const trimmed = input.trim()
  if (!trimmed) return null
  const iso = parseLastPurchaseDate(trimmed)
  if (iso) return iso
  const fromPicker = dayjs(trimmed, CARD_APPLICATION_DATE_PICKER_FORMAT, true)
  if (fromPicker.isValid()) return fromPicker.format('YYYY-MM-DD')
  return trimmed
}

export function parseCardApplicationBenefitDate(value: unknown, isoOnly: boolean): string | null {
  if (value == null || value === '') return null
  if (typeof value !== 'string') return null
  const serialized = serializeCardApplicationBenefitDateInput(value)
  if (!serialized) return null
  if (isoOnly && !isCardApplicationIsoBenefitDate(serialized)) return null
  return serialized
}

/** 목록 라벨 — ISO면 포맷, 아니면 입력 텍스트 */
export function formatCardApplicationBenefitDateLabel(value: string | null | undefined): string | null {
  if (!value) return null
  const formatted = formatCardApplicationDateLabel(value)
  return formatted ?? (value.trim() || null)
}

export function parseCardApplicationBenefitDateForPicker(input: string): dayjs.Dayjs | null {
  const trimmed = input.trim()
  if (!trimmed) return null
  const iso = parseLastPurchaseDate(trimmed)
  if (iso) {
    const parsed = dayjs(iso)
    return parsed.isValid() ? parsed : null
  }
  const fromDisplay = dayjs(trimmed, CARD_APPLICATION_DATE_PICKER_FORMAT, true)
  return fromDisplay.isValid() ? fromDisplay : null
}
