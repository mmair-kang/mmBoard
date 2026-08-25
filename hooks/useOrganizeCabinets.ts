'use client'
// 수정: Auto — 2026-08-25 00:50 (수납장 CRUD·색상)

import {
  toOrganizeCabinetConfig,
  type OrganizeCabinetConfig,
  type OrganizeCabinetRecord,
  type OrganizeColorPresetId,
  type OrganizeLayoutType,
  type OrganizeRoom,
} from '@/config/organizeCabinets'
import { requestJson } from '@/lib/api/http'
import { swrJsonFetch } from '@/lib/swrFetch'
import useSWR from 'swr'

export const organizeCabinetsSwrKey = '/api/organize-cabinets' as const

export type OrganizeCabinetWritePayload = {
  label: string
  layoutType: OrganizeLayoutType
  cols: number
  rows: number
  shelves: number
  shelfRows: number
  colorPresetId: OrganizeColorPresetId
}

export type OrganizeCabinetUpdatePayload = OrganizeCabinetWritePayload & {
  key: string
}

async function organizeCabinetsFetcher(): Promise<OrganizeCabinetRecord[]> {
  return swrJsonFetch<OrganizeCabinetRecord[]>(organizeCabinetsSwrKey, '수납장 설정을 불러오지 못했습니다.')
}

export function useOrganizeCabinets(room: OrganizeRoom) {
  const swr = useSWR<OrganizeCabinetRecord[]>(organizeCabinetsSwrKey, organizeCabinetsFetcher)

  const cabinets: OrganizeCabinetConfig[] = (swr.data ?? [])
    .filter((row) => row.room === room)
    .map(toOrganizeCabinetConfig)

  const allCabinets: OrganizeCabinetConfig[] = (swr.data ?? []).map(toOrganizeCabinetConfig)

  const upsertLocal = (list: OrganizeCabinetRecord[], saved: OrganizeCabinetRecord) => {
    const index = list.findIndex((row) => row.key === saved.key)
    if (index >= 0) {
      const next = [...list]
      next[index] = saved
      return next
    }
    return [...list, saved]
  }

  const saveCabinet = async (payload: OrganizeCabinetUpdatePayload) => {
    const saved = await requestJson<OrganizeCabinetRecord>(organizeCabinetsSwrKey, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    await swr.mutate((current) => upsertLocal(current ?? [], saved), { revalidate: false })
    return saved
  }

  const addCabinet = async (payload: OrganizeCabinetWritePayload) => {
    const saved = await requestJson<OrganizeCabinetRecord>(organizeCabinetsSwrKey, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...payload, room }),
    })
    await swr.mutate((current) => upsertLocal(current ?? [], saved), { revalidate: false })
    return saved
  }

  const deleteCabinet = async (key: string) => {
    await requestJson<{ ok: boolean }>(organizeCabinetsSwrKey, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key }),
    })
    await swr.mutate((current) => (current ?? []).filter((row) => row.key !== key), { revalidate: false })
  }

  return {
    cabinets,
    allCabinets,
    records: swr.data ?? [],
    isLoading: swr.isLoading && !swr.data,
    error: swr.error,
    saveCabinet,
    addCabinet,
    deleteCabinet,
    mutate: swr.mutate,
  }
}
