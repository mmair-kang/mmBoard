'use client'
// 수정: Auto — 2026-06-11 (서버 동기화·로컬 우선)

import { readApiErrorMessage } from '@/lib/apiResponse'
import {
  defaultManageTabOrder,
  loadManageTabOrder,
  type ManageTabId,
  MANAGE_TAB_LABELS,
  normalizeManageTabOrder,
  ordersEqual,
  saveManageTabOrder,
} from '@/lib/manageTabOrder'
import type { ManageTabOrderData } from '@/lib/manageTabOrderQuery'
import { useCallback, useEffect, useRef, useState } from 'react'
import useSWR from 'swr'

export const manageTabOrderSwrKey = '/api/manage-tab-order' as const

async function manageTabOrderFetcher(): Promise<ManageTabOrderData> {
  const res = await fetch(manageTabOrderSwrKey)
  if (!res.ok) throw new Error(await readApiErrorMessage(res, '탭 순서를 불러오지 못했습니다'))
  return res.json() as Promise<ManageTabOrderData>
}

export function useManageTabOrder() {
  const [order, setOrder] = useState<ManageTabId[]>(() => loadManageTabOrder())
  const migratedRef = useRef(false)

  const { data, mutate } = useSWR<ManageTabOrderData>(manageTabOrderSwrKey, manageTabOrderFetcher, {
    fallbackData: { order: loadManageTabOrder(), exists: true },
    revalidateOnMount: true,
    dedupingInterval: 30_000,
  })

  useEffect(() => {
    if (!data) return

    const serverOrder = normalizeManageTabOrder(data.order)
    const localOrder = loadManageTabOrder()

    if (!data.exists && !ordersEqual(localOrder, defaultManageTabOrder()) && !migratedRef.current) {
      migratedRef.current = true
      void fetch(manageTabOrderSwrKey, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: localOrder }),
      })
        .then(async (res) => {
          if (!res.ok) return
          const saved = (await res.json()) as ManageTabOrderData
          await mutate(saved, { revalidate: false })
        })
        .catch(() => {})
      return
    }

    if (!ordersEqual(serverOrder, localOrder)) {
      saveManageTabOrder(serverOrder)
      setOrder(serverOrder)
    }
  }, [data, mutate])

  const updateOrder = useCallback(
    (next: ManageTabId[]) => {
      const normalized = normalizeManageTabOrder(next)
      saveManageTabOrder(normalized)
      setOrder(normalized)
      void mutate(
        async () => {
          const res = await fetch(manageTabOrderSwrKey, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ order: normalized }),
          })
          if (!res.ok) throw new Error(await readApiErrorMessage(res, '탭 순서 저장에 실패했습니다'))
          return res.json() as Promise<ManageTabOrderData>
        },
        {
          optimisticData: { order: normalized, exists: true },
          rollbackOnError: true,
          revalidate: false,
        },
      )
    },
    [mutate],
  )

  const tabs = order.map((id) => ({ id, label: MANAGE_TAB_LABELS[id] }))

  return { order, tabs, ready: true, updateOrder }
}
