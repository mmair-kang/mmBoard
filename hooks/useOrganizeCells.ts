'use client'
// 수정: Auto — 2026-08-24 23:25 (수납 칸 SWR — 스왑)

import type { OrganizeCabinetKey, OrganizeRoom } from '@/config/organizeCabinets'
import { requestJson } from '@/lib/api/http'
import type { OrganizeCellPayload, OrganizeCellRefPayload } from '@/lib/organizePayload'
import { swrJsonFetch } from '@/lib/swrFetch'
import useSWR from 'swr'

export const organizeCellsSwrKey = '/api/organize-cells' as const
export const organizeCellsSwapUrl = '/api/organize-cells/swap' as const

export interface OrganizeCell {
  id: number
  room: OrganizeRoom
  cabinetKey: OrganizeCabinetKey
  rowIndex: number
  colIndex: number
  content: string
  updatedAt: string
}

function cellMatch(
  cell: OrganizeCell,
  room: OrganizeRoom,
  cabinetKey: OrganizeCabinetKey,
  rowIndex: number,
  colIndex: number,
) {
  return (
    cell.room === room &&
    cell.cabinetKey === cabinetKey &&
    cell.rowIndex === rowIndex &&
    cell.colIndex === colIndex
  )
}

function upsertLocal(list: OrganizeCell[], saved: OrganizeCell): OrganizeCell[] {
  const index = list.findIndex((cell) =>
    cellMatch(cell, saved.room, saved.cabinetKey, saved.rowIndex, saved.colIndex),
  )
  if (index >= 0) {
    const next = [...list]
    next[index] = saved
    return next
  }
  return [...list, saved]
}

async function organizeCellsFetcher(): Promise<OrganizeCell[]> {
  return swrJsonFetch<OrganizeCell[]>(organizeCellsSwrKey, '수납 목록을 불러오지 못했습니다.')
}

export function useOrganizeCells() {
  const swr = useSWR<OrganizeCell[]>(organizeCellsSwrKey, organizeCellsFetcher)

  const getContent = (
    room: OrganizeRoom,
    cabinetKey: OrganizeCabinetKey,
    rowIndex: number,
    colIndex: number,
  ) => {
    const cells = swr.data ?? []
    return cells.find((cell) => cellMatch(cell, room, cabinetKey, rowIndex, colIndex))?.content ?? ''
  }

  const saveCell = async (payload: OrganizeCellPayload) => {
    const saved = await requestJson<OrganizeCell>(organizeCellsSwrKey, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    await swr.mutate((current) => upsertLocal(current ?? [], saved), { revalidate: false })
    return saved
  }

  const swapCells = async (a: OrganizeCellRefPayload, b: OrganizeCellRefPayload) => {
    const contentA = getContent(a.room, a.cabinetKey, a.rowIndex, a.colIndex)
    const contentB = getContent(b.room, b.cabinetKey, b.rowIndex, b.colIndex)
    if (contentA === contentB) return

    const optimisticA: OrganizeCell = {
      id: -1,
      ...a,
      content: contentB,
      updatedAt: new Date().toISOString(),
    }
    const optimisticB: OrganizeCell = {
      id: -2,
      ...b,
      content: contentA,
      updatedAt: new Date().toISOString(),
    }

    await swr.mutate(
      (current) => upsertLocal(upsertLocal(current ?? [], optimisticA), optimisticB),
      { revalidate: false },
    )

    try {
      const saved = await requestJson<OrganizeCell[]>(organizeCellsSwapUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ a, b }),
      })
      await swr.mutate(
        (current) => saved.reduce((list, row) => upsertLocal(list, row), current ?? []),
        { revalidate: false },
      )
    } catch (error) {
      await swr.mutate()
      throw error
    }
  }

  return {
    cells: swr.data ?? [],
    isLoading: swr.isLoading && !swr.data,
    error: swr.error,
    getContent,
    saveCell,
    swapCells,
    mutate: swr.mutate,
  }
}
