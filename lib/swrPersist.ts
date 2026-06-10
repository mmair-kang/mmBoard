// 수정: Auto — 2026-06-08

import { createStore, del, entries, set } from 'idb-keyval'
import type { Cache } from 'swr'

const swrIdbStore = createStore('mmboard-swr', 'cache')
const SWR_CACHE_PREFIX = 'swr:'

let hydrationDone = false
let hydrationPromise: Promise<void> | null = null

export function serializeSwrKey(key: unknown): string {
  return typeof key === 'string' ? key : JSON.stringify(key)
}

function toStorageKey(key: unknown): string {
  return `${SWR_CACHE_PREFIX}${serializeSwrKey(key)}`
}

type SwrCacheEntry = {
  data?: unknown
  error?: unknown
}

function shouldPersistEntry(entry: unknown): entry is SwrCacheEntry & { data: unknown } {
  return Boolean(entry && typeof entry === 'object' && 'data' in entry && (entry as SwrCacheEntry).data !== undefined)
}

const pendingWrites = new Map<string, unknown>()
let flushTimer: ReturnType<typeof setTimeout> | null = null

async function flushPendingWrites() {
  flushTimer = null
  const batch = [...pendingWrites.entries()]
  pendingWrites.clear()
  await Promise.all(batch.map(([storageKey, data]) => set(storageKey, data, swrIdbStore)))
}

function schedulePersist(key: unknown, entry: unknown) {
  if (!shouldPersistEntry(entry)) return
  pendingWrites.set(toStorageKey(key), entry.data)
  if (flushTimer) return
  flushTimer = setTimeout(() => {
    void flushPendingWrites()
  }, 150)
}

export async function persistSwrData(key: unknown, data: unknown): Promise<void> {
  await set(toStorageKey(key), data, swrIdbStore)
}

export async function loadAllSwrFallback(): Promise<Record<string, unknown>> {
  const fallback: Record<string, unknown> = {}
  const rows = await entries<string, unknown>(swrIdbStore)
  for (const [storageKey, data] of rows) {
    if (!storageKey.startsWith(SWR_CACHE_PREFIX)) continue
    const swrKey = storageKey.slice(SWR_CACHE_PREFIX.length)
    fallback[swrKey] = data
  }
  return fallback
}

export function markSwrHydrationReady() {
  hydrationDone = true
}

export function waitForSwrHydration(): Promise<void> {
  if (hydrationDone) return Promise.resolve()
  return hydrationPromise ?? Promise.resolve()
}

export function beginSwrHydration(load: () => Promise<void>): Promise<void> {
  if (hydrationDone) return Promise.resolve()
  if (!hydrationPromise) {
    hydrationPromise = load().finally(() => {
      hydrationDone = true
    })
  }
  return hydrationPromise
}

export function createPersistedSwrProvider(): Cache {
  const map = new Map() as Cache
  const nativeSet = map.set.bind(map)

  map.set = (key, value) => {
    nativeSet(key, value)
    schedulePersist(key, value)
    return map
  }

  return map
}

export async function removeSwrPersistedKey(key: unknown): Promise<void> {
  await del(toStorageKey(key), swrIdbStore)
}
