// 수정: Auto — 2026-07-19 03:30 (국민연금 전용 고지서 분리)
// 수정: Auto — 2026-07-19 03:15 (건보는 전용 고지서 구조로 분리)
// 수정: Auto — 2026-07-19 03:25 (국민연금·건강보험 지역가입자)
// 수정: Auto — 2026-07-19 03:15 (통신비 상세 내역)

export const MONTHLY_EXPENSE_TYPES = [
  'none',
  'telecom',
  'nationalPension',
  'healthInsurance',
  'insurance',
] as const
export type MonthlyExpenseType = (typeof MONTHLY_EXPENSE_TYPES)[number]

/** 섹션형 상세(통신비) */
export const MONTHLY_SECTION_DETAIL_TYPES = ['telecom'] as const
export type MonthlySectionDetailType = (typeof MONTHLY_SECTION_DETAIL_TYPES)[number]

/** 상세 내역이 있는 타입 */
export const MONTHLY_EXPENSE_DETAIL_TYPES = [
  'telecom',
  'nationalPension',
  'healthInsurance',
  'insurance',
] as const
export type MonthlyExpenseDetailType = (typeof MONTHLY_EXPENSE_DETAIL_TYPES)[number]

export type TelecomDiscount = {
  id: string
  name: string
  /** 할인·감면액(양수) — 금액에서 차감 */
  amount: number
}

export type TelecomDetailRow = {
  id: string
  name: string
  listPrice: number
  discounts: TelecomDiscount[]
  note: string
}

export type TelecomDetailSection = {
  id: string
  title: string
  rows: TelecomDetailRow[]
}

/** 통신비 상세 구조 */
export type TelecomDetail = {
  sections: TelecomDetailSection[]
}

export type ExpenseBreakdownDetail = TelecomDetail

function newId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `t_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`
}

export function emptyTelecomDiscount(): TelecomDiscount {
  return { id: newId(), name: '', amount: 0 }
}

export function emptyTelecomRow(): TelecomDetailRow {
  return { id: newId(), name: '', listPrice: 0, discounts: [], note: '' }
}

export function emptyTelecomSection(title = ''): TelecomDetailSection {
  return { id: newId(), title, rows: [emptyTelecomRow()] }
}

export function defaultTelecomDetail(): TelecomDetail {
  return {
    sections: [
      emptyTelecomSection('모바일'),
      emptyTelecomSection('인터넷'),
      emptyTelecomSection('TV'),
    ],
  }
}

export function hasExpenseDetailType(type: MonthlyExpenseType): type is MonthlyExpenseDetailType {
  return (MONTHLY_EXPENSE_DETAIL_TYPES as readonly string[]).includes(type)
}

export function hasSectionExpenseDetailType(type: MonthlyExpenseType): type is MonthlySectionDetailType {
  return (MONTHLY_SECTION_DETAIL_TYPES as readonly string[]).includes(type)
}

export function defaultExpenseDetail(_type: MonthlySectionDetailType = 'telecom'): TelecomDetail {
  return defaultTelecomDetail()
}

export function getMonthlyExpenseTypeLabel(type: MonthlyExpenseType): string {
  switch (type) {
    case 'telecom':
      return '통신비'
    case 'nationalPension':
      return '국민연금'
    case 'healthInsurance':
      return '건강보험료'
    case 'insurance':
      return '보험'
    default:
      return '없음'
  }
}

export function getExpenseDetailDialogTitle(_type: MonthlySectionDetailType = 'telecom'): string {
  return '통신비 상세'
}

export type ExpenseDetailFieldLabels = {
  rowName: string
  listPrice: string
  discount: string
  discountAmount: string
  addDiscount: string
  settlement: string
}

export function getExpenseDetailFieldLabels(_type: MonthlySectionDetailType = 'telecom'): ExpenseDetailFieldLabels {
  return {
    rowName: '요금제·항목',
    listPrice: '정가',
    discount: '할인',
    discountAmount: '할인액',
    addDiscount: '할인 추가',
    settlement: '정산',
  }
}

export function rowSettlement(row: TelecomDetailRow): number {
  const discountSum = row.discounts.reduce((sum, d) => sum + Math.max(0, Math.round(d.amount)), 0)
  return Math.round(row.listPrice) - discountSum
}

export function sectionTotal(section: TelecomDetailSection): number {
  return section.rows.reduce((sum, row) => sum + rowSettlement(row), 0)
}

export function telecomGrandTotal(detail: TelecomDetail): number {
  return detail.sections.reduce((sum, section) => sum + sectionTotal(section), 0)
}

export const expenseDetailGrandTotal = telecomGrandTotal

function parseDiscount(raw: unknown): TelecomDiscount | null {
  if (!raw || typeof raw !== 'object') return null
  const row = raw as Record<string, unknown>
  const name = typeof row.name === 'string' ? row.name.trim() : ''
  const amount = Math.round(Number(row.amount ?? 0))
  if (!Number.isFinite(amount) || amount < 0) return null
  const id = typeof row.id === 'string' && row.id ? row.id : newId()
  return { id, name, amount }
}

function parseRow(raw: unknown): TelecomDetailRow | null {
  if (!raw || typeof raw !== 'object') return null
  const row = raw as Record<string, unknown>
  const name = typeof row.name === 'string' ? row.name.trim() : ''
  const listPrice = Math.round(Number(row.listPrice ?? 0))
  if (!Number.isFinite(listPrice) || listPrice < 0) return null
  const note = typeof row.note === 'string' ? row.note.trim() : ''
  const discountsRaw = Array.isArray(row.discounts) ? row.discounts : []
  const discounts: TelecomDiscount[] = []
  for (const d of discountsRaw) {
    const parsed = parseDiscount(d)
    if (parsed) discounts.push(parsed)
  }
  const id = typeof row.id === 'string' && row.id ? row.id : newId()
  return { id, name, listPrice, discounts, note }
}

function parseSection(raw: unknown): TelecomDetailSection | null {
  if (!raw || typeof raw !== 'object') return null
  const row = raw as Record<string, unknown>
  const title = typeof row.title === 'string' ? row.title.trim() : ''
  const rowsRaw = Array.isArray(row.rows) ? row.rows : []
  const rows: TelecomDetailRow[] = []
  for (const r of rowsRaw) {
    const parsed = parseRow(r)
    if (parsed) rows.push(parsed)
  }
  const id = typeof row.id === 'string' && row.id ? row.id : newId()
  return { id, title, rows }
}

export function parseTelecomDetail(raw: unknown): TelecomDetail | null {
  let value: unknown = raw
  if (typeof raw === 'string') {
    const trimmed = raw.trim()
    if (!trimmed) return null
    try {
      value = JSON.parse(trimmed) as unknown
    } catch {
      return null
    }
  }
  if (!value || typeof value !== 'object') return null
  const obj = value as Record<string, unknown>
  if (!Array.isArray(obj.sections)) return null
  const sections: TelecomDetailSection[] = []
  for (const s of obj.sections) {
    const parsed = parseSection(s)
    if (parsed) sections.push(parsed)
  }
  return { sections }
}

export function telecomDetailForDb(detail: TelecomDetail | null | undefined): string | null {
  if (!detail) return null
  return JSON.stringify(detail)
}

export function isValidMonthlyExpenseType(value: unknown): value is MonthlyExpenseType {
  return MONTHLY_EXPENSE_TYPES.includes(String(value) as MonthlyExpenseType)
}
