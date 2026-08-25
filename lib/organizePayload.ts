// 수정: Auto — 2026-08-25 00:50 (수납 칸 — 방·수납장 DB 검증)

import {
  isCabinetCell,
  isOrganizeRoom,
  ORGANIZE_CELL_CONTENT_MAX,
  type OrganizeCabinetKey,
  type OrganizeRoom,
} from '@/config/organizeCabinets'
import { getOrganizeCabinetRecord } from '@/lib/organizeCabinetQuery'
import { getOrganizeRoom } from '@/lib/organizeRoomQuery'

export type OrganizeCellPayload = {
  room: OrganizeRoom
  cabinetKey: OrganizeCabinetKey
  rowIndex: number
  colIndex: number
  content: string
}

export type OrganizeCellRefPayload = Omit<OrganizeCellPayload, 'content'>

function parseLineContent(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const content = value.replace(/[\r\n]+/g, ' ').trim()
  if (content.length > ORGANIZE_CELL_CONTENT_MAX) return null
  return content
}

export async function parseOrganizeCellRef(body: Record<string, unknown>): Promise<OrganizeCellRefPayload | null> {
  const room = typeof body.room === 'string' ? body.room.trim() : ''
  const cabinetKey = typeof body.cabinetKey === 'string' ? body.cabinetKey.trim() : ''
  if (!isOrganizeRoom(room) || !cabinetKey) return null

  const roomRow = await getOrganizeRoom(room)
  if (!roomRow) return null

  const cabinet = await getOrganizeCabinetRecord(cabinetKey)
  if (!cabinet || cabinet.room !== room) return null

  const rowIndex = typeof body.rowIndex === 'number' ? body.rowIndex : Number(body.rowIndex)
  const colIndex = typeof body.colIndex === 'number' ? body.colIndex : Number(body.colIndex)
  if (!isCabinetCell(cabinet, rowIndex, colIndex)) return null

  return {
    room,
    cabinetKey: cabinet.key,
    rowIndex,
    colIndex,
  }
}

export async function parseOrganizeCellPayload(body: Record<string, unknown>): Promise<OrganizeCellPayload | null> {
  const ref = await parseOrganizeCellRef(body)
  if (!ref) return null

  const content = parseLineContent(body.content)
  if (content == null) return null

  return { ...ref, content }
}

export async function parseOrganizeSwapPayload(
  body: Record<string, unknown>,
): Promise<{ a: OrganizeCellRefPayload; b: OrganizeCellRefPayload } | null> {
  const aRaw = body.a
  const bRaw = body.b
  if (!aRaw || typeof aRaw !== 'object' || !bRaw || typeof bRaw !== 'object') return null
  const a = await parseOrganizeCellRef(aRaw as Record<string, unknown>)
  const b = await parseOrganizeCellRef(bRaw as Record<string, unknown>)
  if (!a || !b) return null
  if (a.room === b.room && a.cabinetKey === b.cabinetKey && a.rowIndex === b.rowIndex && a.colIndex === b.colIndex) {
    return null
  }
  return { a, b }
}
