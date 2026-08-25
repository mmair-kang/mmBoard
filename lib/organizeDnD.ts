// 수정: Auto — 2026-08-25 00:50 (칸 드래그 ID)

import { isCabinetCell, type OrganizeCabinetConfig, type OrganizeCabinetKey, type OrganizeRoom } from '@/config/organizeCabinets'

export type OrganizeCellRef = {
  room: OrganizeRoom
  cabinetKey: OrganizeCabinetKey
  rowIndex: number
  colIndex: number
}

const PREFIX = 'org:' as const

export function organizeCellDnDId(ref: OrganizeCellRef): string {
  return `${PREFIX}${ref.room}:${ref.cabinetKey}:${ref.rowIndex}:${ref.colIndex}`
}

export function parseOrganizeCellDnDId(
  id: string | number,
  cabinets: OrganizeCabinetConfig[],
): OrganizeCellRef | null {
  const value = String(id)
  if (!value.startsWith(PREFIX)) return null
  const [room, cabinetKey, rowRaw, colRaw] = value.slice(PREFIX.length).split(':')
  if (!room || !cabinetKey || rowRaw == null || colRaw == null) return null
  const cabinet = cabinets.find((row) => row.key === cabinetKey && row.room === room)
  if (!cabinet) return null
  const rowIndex = Number(rowRaw)
  const colIndex = Number(colRaw)
  if (!isCabinetCell(cabinet, rowIndex, colIndex)) return null
  return { room, cabinetKey: cabinet.key, rowIndex, colIndex }
}

export function sameOrganizeCell(a: OrganizeCellRef, b: OrganizeCellRef): boolean {
  return (
    a.room === b.room &&
    a.cabinetKey === b.cabinetKey &&
    a.rowIndex === b.rowIndex &&
    a.colIndex === b.colIndex
  )
}
