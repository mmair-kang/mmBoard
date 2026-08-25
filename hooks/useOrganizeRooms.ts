'use client'
// 수정: Auto — 2026-08-25 00:50 (방 목록 SWR)

import {
  ORGANIZE_ROOM_DEFAULT,
  type OrganizeRoom,
  type OrganizeRoomRecord,
} from '@/config/organizeCabinets'
import { requestJson } from '@/lib/api/http'
import { swrJsonFetch } from '@/lib/swrFetch'
import useSWR from 'swr'

export const organizeRoomsSwrKey = '/api/organize-rooms' as const

async function organizeRoomsFetcher(): Promise<OrganizeRoomRecord[]> {
  return swrJsonFetch<OrganizeRoomRecord[]>(organizeRoomsSwrKey, '방 목록을 불러오지 못했습니다.')
}

export function useOrganizeRooms() {
  const swr = useSWR<OrganizeRoomRecord[]>(organizeRoomsSwrKey, organizeRoomsFetcher)
  const rooms = swr.data ?? []

  const addRoom = async (label: string) => {
    const saved = await requestJson<OrganizeRoomRecord>(organizeRoomsSwrKey, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ label }),
    })
    await swr.mutate((current) => [...(current ?? []), saved], { revalidate: false })
    return saved
  }

  const renameRoom = async (key: string, label: string) => {
    const saved = await requestJson<OrganizeRoomRecord>(organizeRoomsSwrKey, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, label }),
    })
    await swr.mutate(
      (current) => (current ?? []).map((row) => (row.key === saved.key ? saved : row)),
      { revalidate: false },
    )
    return saved
  }

  const reorderRooms = async (keys: string[]) => {
    const saved = await requestJson<OrganizeRoomRecord[]>(organizeRoomsSwrKey, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ keys }),
    })
    await swr.mutate(saved, { revalidate: false })
    return saved
  }

  const deleteRoom = async (key: string) => {
    await requestJson<{ ok: boolean }>(organizeRoomsSwrKey, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key }),
    })
    await swr.mutate((current) => (current ?? []).filter((row) => row.key !== key), { revalidate: false })
  }

  const defaultRoom: OrganizeRoom = rooms[0]?.key ?? ORGANIZE_ROOM_DEFAULT

  return {
    rooms,
    defaultRoom,
    isLoading: swr.isLoading && !swr.data,
    error: swr.error,
    addRoom,
    renameRoom,
    reorderRooms,
    deleteRoom,
    mutate: swr.mutate,
  }
}
