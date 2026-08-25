// 수정: Auto — 2026-08-25 00:50 (수납장 설정·색상 파싱)

import {
  ORGANIZE_CABINET_LABEL_MAX,
  ORGANIZE_DIM_MAX,
  ORGANIZE_DIM_MIN,
  computeCabinetRows,
  getColorPresetById,
  isOrganizeLayoutType,
  matchColorPreset,
  type OrganizeLayoutType,
} from '@/config/organizeCabinets'
import type { OrganizeCabinetWriteInput } from '@/lib/organizeCabinetQuery'

function parsePositiveInt(value: unknown, min: number, max: number): number | null {
  const n = typeof value === 'number' ? value : Number(value)
  if (!Number.isInteger(n) || n < min || n > max) return null
  return n
}

function parseTheme(body: Record<string, unknown>): { color: string; bg: string; colorPresetId?: string } | null {
  const presetId = typeof body.colorPresetId === 'string' ? body.colorPresetId : ''
  if (presetId) {
    const preset = getColorPresetById(presetId)
    if (!preset) return null
    return { color: preset.color, bg: preset.bg, colorPresetId: preset.id }
  }
  const color = typeof body.color === 'string' ? body.color.trim() : ''
  const bg = typeof body.bg === 'string' ? body.bg.trim() : ''
  if (color && bg) {
    const matched = matchColorPreset(color, bg)
    return { color: matched.color, bg: matched.bg, colorPresetId: matched.id }
  }
  if (color) {
    const matched = matchColorPreset(color, '')
    return { color: matched.color, bg: matched.bg, colorPresetId: matched.id }
  }
  return null
}

export function parseOrganizeCabinetWritePayload(
  body: Record<string, unknown>,
): (OrganizeCabinetWriteInput & { colorPresetId?: string }) | null {
  const label = typeof body.label === 'string' ? body.label.replace(/[\r\n]+/g, ' ').trim() : ''
  if (!label || label.length > ORGANIZE_CABINET_LABEL_MAX) return null

  const layoutTypeRaw = typeof body.layoutType === 'string' ? body.layoutType : ''
  if (!isOrganizeLayoutType(layoutTypeRaw)) return null
  const layoutType: OrganizeLayoutType = layoutTypeRaw

  const cols = parsePositiveInt(body.cols, ORGANIZE_DIM_MIN, ORGANIZE_DIM_MAX.cols)
  if (cols == null) return null

  const theme = parseTheme(body)
  if (!theme) return null

  if (layoutType === 'grid') {
    const rows = parsePositiveInt(body.rows, ORGANIZE_DIM_MIN, ORGANIZE_DIM_MAX.rows)
    if (rows == null) return null
    return {
      label,
      layoutType,
      cols,
      rows,
      shelves: 1,
      shelfRows: rows,
      color: theme.color,
      bg: theme.bg,
      colorPresetId: theme.colorPresetId,
    }
  }

  const shelves = parsePositiveInt(body.shelves, ORGANIZE_DIM_MIN, ORGANIZE_DIM_MAX.shelves)
  const shelfRows = parsePositiveInt(body.shelfRows, ORGANIZE_DIM_MIN, ORGANIZE_DIM_MAX.shelfRows)
  if (shelves == null || shelfRows == null) return null
  const rows = computeCabinetRows('shelves', 0, shelves, shelfRows)
  if (rows > ORGANIZE_DIM_MAX.rows * ORGANIZE_DIM_MAX.shelves) return null

  return {
    label,
    layoutType,
    cols,
    rows,
    shelves,
    shelfRows,
    color: theme.color,
    bg: theme.bg,
    colorPresetId: theme.colorPresetId,
  }
}

export function parseOrganizeCabinetUpdatePayload(body: Record<string, unknown>) {
  return parseOrganizeCabinetWritePayload(body)
}
