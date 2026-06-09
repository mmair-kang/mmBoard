'use client'
// 수정: Auto — 2026-06-08

import {
  defaultManageTabOrder,
  loadManageTabOrder,
  type ManageTabId,
  MANAGE_TAB_LABELS,
  saveManageTabOrder,
} from '@/lib/manageTabOrder'
import { useCallback, useEffect, useState } from 'react'

export function useManageTabOrder() {
  const [order, setOrder] = useState<ManageTabId[]>(defaultManageTabOrder)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setOrder(loadManageTabOrder())
    setReady(true)
  }, [])

  const updateOrder = useCallback((next: ManageTabId[]) => {
    saveManageTabOrder(next)
    setOrder(loadManageTabOrder())
  }, [])

  const tabs = order.map((id) => ({ id, label: MANAGE_TAB_LABELS[id] }))

  return { order, tabs, ready, updateOrder }
}
