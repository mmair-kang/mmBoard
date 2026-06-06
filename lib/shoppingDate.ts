// 수정: Auto — 2026-06-05

const ISO_DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/

/** DB 저장용 YYYY-MM-DD */
export function parseLastPurchaseDate(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  if (!ISO_DATE_RE.test(trimmed)) return null
  return trimmed
}

/** 화면 표시용 YY-MM-DD */
export function formatLastPurchaseDateDisplay(isoDate: string | null | undefined): string | null {
  if (!isoDate) return null
  const match = ISO_DATE_RE.exec(isoDate)
  if (!match) return isoDate
  return `${match[1].slice(-2)}-${match[2]}-${match[3]}`
}

export function todayIsoDate(): string {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}
