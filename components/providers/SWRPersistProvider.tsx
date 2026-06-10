'use client'
// 수정: Auto — 2026-06-08

import {
  beginSwrHydration,
  createPersistedSwrProvider,
  loadAllSwrFallback,
  markSwrHydrationReady,
} from '@/lib/swrPersist'
import { ReactNode, useLayoutEffect, useMemo, useState } from 'react'
import { SWRConfig, useSWRConfig } from 'swr'

type Props = {
  children: ReactNode
}

function SwrHydrator({ onReady }: { onReady: () => void }) {
  const { mutate } = useSWRConfig()

  useLayoutEffect(() => {
    let cancelled = false

    void beginSwrHydration(async () => {
      const fallback = await loadAllSwrFallback()
      await Promise.all(
        Object.entries(fallback).map(([key, data]) => mutate(key, data, { revalidate: false })),
      )
      markSwrHydrationReady()
    }).then(() => {
      if (!cancelled) onReady()
    })

    return () => {
      cancelled = true
    }
  }, [mutate, onReady])

  return null
}

export function SWRPersistProvider({ children }: Props) {
  const [hydrated, setHydrated] = useState(false)
  const provider = useMemo(() => createPersistedSwrProvider(), [])

  const swrConfig = useMemo(
    () => ({
      provider: () => provider,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 60_000,
      keepPreviousData: true,
    }),
    [provider],
  )

  return (
    <SWRConfig value={swrConfig}>
      <SwrHydrator onReady={() => setHydrated(true)} />
      {hydrated ? children : null}
    </SWRConfig>
  )
}
