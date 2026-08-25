// 수정: Auto — 2026-08-25 00:50 (방·수납장 CRUD·색 프리셋)

import AppsRoundedIcon from '@mui/icons-material/AppsRounded'
import GridViewRoundedIcon from '@mui/icons-material/GridViewRounded'
import ViewAgendaRoundedIcon from '@mui/icons-material/ViewAgendaRounded'
import type { SvgIconComponent } from '@mui/icons-material'

/** 방·수납장 키는 DB에서 동적 관리 */
export type OrganizeRoom = string
export type OrganizeCabinetKey = string
export type OrganizeLayoutType = 'grid' | 'shelves'
export type OrganizeColorPresetId =
  | 'violet'
  | 'blue'
  | 'teal'
  | 'green'
  | 'amber'
  | 'orange'
  | 'red'
  | 'pink'
  | 'slate'
  | 'indigo'

export type OrganizeRoomRecord = {
  key: string
  label: string
  sortOrder: number
}

export const ORGANIZE_ROOM_DEFAULT = 'bedroom'
export const ORGANIZE_ROOM_CACHE_KEY = 'organize.room'
export const ORGANIZE_ROOM_LABEL_MAX = 12
export const ORGANIZE_ROOM_KEY_RE = /^[a-z][a-z0-9_]{1,31}$/

export const DEFAULT_ORGANIZE_ROOMS: OrganizeRoomRecord[] = [
  { key: 'bedroom', label: '안방', sortOrder: 0 },
  { key: 'living', label: '거실', sortOrder: 1 },
]

/** @deprecated 시드 호환 — DEFAULT_ORGANIZE_ROOMS 사용 */
export const ORGANIZE_ROOMS = DEFAULT_ORGANIZE_ROOMS

export const ORGANIZE_LAYOUT_TYPES = [
  { key: 'grid', label: '그리드' },
  { key: 'shelves', label: '다단' },
] as const satisfies readonly { key: OrganizeLayoutType; label: string }[]

export type OrganizeColorPreset = {
  id: OrganizeColorPresetId
  label: string
  color: string
  bg: string
}

export const ORGANIZE_COLOR_PRESETS: OrganizeColorPreset[] = [
  { id: 'violet', label: '보라', color: '#7c3aed', bg: 'rgba(124, 58, 237, 0.08)' },
  { id: 'blue', label: '파랑', color: '#2563eb', bg: 'rgba(37, 99, 235, 0.08)' },
  { id: 'teal', label: '청록', color: '#0d9488', bg: 'rgba(13, 148, 136, 0.08)' },
  { id: 'green', label: '초록', color: '#16a34a', bg: 'rgba(22, 163, 74, 0.08)' },
  { id: 'amber', label: '노랑', color: '#ca8a04', bg: 'rgba(202, 138, 4, 0.08)' },
  { id: 'orange', label: '주황', color: '#ea580c', bg: 'rgba(234, 88, 12, 0.08)' },
  { id: 'red', label: '빨강', color: '#dc2626', bg: 'rgba(220, 38, 38, 0.08)' },
  { id: 'pink', label: '분홍', color: '#db2777', bg: 'rgba(219, 39, 119, 0.08)' },
  { id: 'indigo', label: '남색', color: '#4f46e5', bg: 'rgba(79, 70, 229, 0.08)' },
  { id: 'slate', label: '회색', color: '#475569', bg: 'rgba(71, 85, 105, 0.08)' },
]

export type OrganizeCabinetConfig = {
  key: OrganizeCabinetKey
  room: OrganizeRoom
  label: string
  layoutType: OrganizeLayoutType
  cols: number
  rows: number
  shelves: number
  shelfRows: number
  sortOrder: number
  color: string
  bg: string
  icon: SvgIconComponent
}

export type OrganizeCabinetRecord = {
  key: string
  room: OrganizeRoom
  label: string
  layoutType: OrganizeLayoutType
  cols: number
  rows: number
  shelves: number
  shelfRows: number
  sortOrder: number
  color: string
  bg: string
}

export const ORGANIZE_CELL_CONTENT_MAX = 40
export const ORGANIZE_CELL_HEIGHT = 28
export const ORGANIZE_CABINET_LABEL_MAX = 20
export const ORGANIZE_DIM_MIN = 1
export const ORGANIZE_DIM_MAX = {
  cols: 12,
  rows: 20,
  shelves: 10,
  shelfRows: 10,
} as const

/** @deprecated ORGANIZE_COLOR_PRESETS 사용 */
export const ORGANIZE_CABINET_THEMES = ORGANIZE_COLOR_PRESETS.map((preset) => ({
  color: preset.color,
  bg: preset.bg,
  icon: GridViewRoundedIcon,
}))

const DEFAULT_BEDROOM: OrganizeCabinetRecord[] = [
  {
    key: 'grid5x4',
    room: 'bedroom',
    label: '5×4',
    layoutType: 'grid',
    cols: 5,
    rows: 4,
    shelves: 1,
    shelfRows: 4,
    sortOrder: 0,
    color: ORGANIZE_COLOR_PRESETS[0].color,
    bg: ORGANIZE_COLOR_PRESETS[0].bg,
  },
  {
    key: 'grid3x3',
    room: 'bedroom',
    label: '3×3',
    layoutType: 'grid',
    cols: 3,
    rows: 3,
    shelves: 1,
    shelfRows: 3,
    sortOrder: 1,
    color: ORGANIZE_COLOR_PRESETS[1].color,
    bg: ORGANIZE_COLOR_PRESETS[1].bg,
  },
  {
    key: 'main4',
    room: 'bedroom',
    label: '메인 4단',
    layoutType: 'shelves',
    cols: 5,
    rows: 8,
    shelves: 4,
    shelfRows: 2,
    sortOrder: 2,
    color: ORGANIZE_COLOR_PRESETS[2].color,
    bg: ORGANIZE_COLOR_PRESETS[2].bg,
  },
]

export const DEFAULT_ORGANIZE_CABINETS: OrganizeCabinetRecord[] = [...DEFAULT_BEDROOM]

export function isOrganizeRoomKey(value: string): boolean {
  return ORGANIZE_ROOM_KEY_RE.test(value)
}

/** 레거시 호환 — 키 형식만 검사 (실제 존재는 DB/목록에서) */
export function isOrganizeRoom(value: string): value is OrganizeRoom {
  return value.length > 0 && value.length <= 32 && !value.includes(':')
}

export function isOrganizeLayoutType(value: string): value is OrganizeLayoutType {
  return value === 'grid' || value === 'shelves'
}

export function getColorPresetById(id: string): OrganizeColorPreset | null {
  return ORGANIZE_COLOR_PRESETS.find((preset) => preset.id === id) ?? null
}

export function matchColorPreset(color: string, bg: string): OrganizeColorPreset {
  const found = ORGANIZE_COLOR_PRESETS.find((preset) => preset.color === color && preset.bg === bg)
  if (found) return found
  const byColor = ORGANIZE_COLOR_PRESETS.find((preset) => preset.color === color)
  return byColor ?? ORGANIZE_COLOR_PRESETS[0]
}

export function themeIconForCabinet(record: Pick<OrganizeCabinetRecord, 'layoutType' | 'sortOrder'>): SvgIconComponent {
  if (record.layoutType === 'shelves') return ViewAgendaRoundedIcon
  return record.sortOrder % 2 === 0 ? GridViewRoundedIcon : AppsRoundedIcon
}

export function toOrganizeCabinetConfig(record: OrganizeCabinetRecord): OrganizeCabinetConfig {
  return {
    ...record,
    icon: themeIconForCabinet(record),
  }
}

export function computeCabinetRows(layoutType: OrganizeLayoutType, rows: number, shelves: number, shelfRows: number): number {
  if (layoutType === 'shelves') return shelves * shelfRows
  return rows
}

export function isCabinetCell(cabinet: Pick<OrganizeCabinetConfig, 'rows' | 'cols'>, rowIndex: number, colIndex: number): boolean {
  return (
    Number.isInteger(rowIndex) &&
    Number.isInteger(colIndex) &&
    rowIndex >= 0 &&
    colIndex >= 0 &&
    rowIndex < cabinet.rows &&
    colIndex < cabinet.cols
  )
}

export function cabinetRowsPerShelf(cabinet: Pick<OrganizeCabinetConfig, 'layoutType' | 'shelves' | 'shelfRows' | 'rows'>): number {
  if (cabinet.layoutType === 'shelves' && cabinet.shelves > 1) return cabinet.shelfRows
  return cabinet.rows
}

export function organizeCellTitle(
  cabinet: Pick<OrganizeCabinetConfig, 'label' | 'layoutType' | 'shelves' | 'shelfRows' | 'rows'>,
  rowIndex: number,
  colIndex: number,
): string {
  if (cabinet.layoutType === 'shelves' && cabinet.shelves > 1) {
    const perShelf = cabinetRowsPerShelf(cabinet)
    const shelf = Math.floor(rowIndex / perShelf)
    const localRow = rowIndex % perShelf
    return `${cabinet.label} · ${shelf + 1}단 ${localRow + 1}행 ${colIndex + 1}열`
  }
  return `${cabinet.label} · ${rowIndex + 1}행 ${colIndex + 1}열`
}

export function organizeCellFontSize(cabinet: Pick<OrganizeCabinetConfig, 'cols'>): string {
  return cabinet.cols >= 5 ? '0.62rem' : '0.72rem'
}

export function suggestGridLabel(cols: number, rows: number): string {
  return `${cols}×${rows}`
}

export function suggestShelvesLabel(shelves: number): string {
  return `메인 ${shelves}단`
}

export function createOrganizeKey(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 8)
  return `${prefix}_${Date.now().toString(36)}_${rand}`
}
