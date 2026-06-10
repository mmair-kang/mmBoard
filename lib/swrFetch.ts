// 수정: Auto — 2026-06-08

import { waitForSwrHydration } from '@/lib/swrPersist'

export async function swrJsonFetch<T>(url: string, errorMessage: string): Promise<T> {
  await waitForSwrHydration()
  const res = await fetch(url)
  if (!res.ok) throw new Error(errorMessage)
  return res.json() as Promise<T>
}
