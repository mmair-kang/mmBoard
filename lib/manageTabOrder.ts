// 수정: Auto — 2026-06-08

export const MANAGE_TAB_IDS = ['main', 'account', 'annual', 'card', 'dividend', 'monthly'] as const
export type ManageTabId = (typeof MANAGE_TAB_IDS)[number]

export const MANAGE_TAB_LABELS: Record<ManageTabId, string> = {
  main: '메인',
  account: '계좌',
  annual: '연납',
  card: '카드',
  dividend: '배당',
  monthly: '한달',
}

const STORAGE_KEY = 'mmboard-manage-tab-order'

export function defaultManageTabOrder(): ManageTabId[] {
  return [...MANAGE_TAB_IDS]
}

function isManageTabId(value: string): value is ManageTabId {
  return (MANAGE_TAB_IDS as readonly string[]).includes(value)
}

export function normalizeManageTabOrder(order: unknown): ManageTabId[] {
  if (!Array.isArray(order)) return defaultManageTabOrder()
  const seen = new Set<ManageTabId>()
  const result: ManageTabId[] = []

  for (const item of order) {
    if (typeof item !== 'string' || !isManageTabId(item) || seen.has(item)) continue
    seen.add(item)
    result.push(item)
  }

  for (const id of MANAGE_TAB_IDS) {
    if (!seen.has(id)) result.push(id)
  }

  return result
}

export function loadManageTabOrder(): ManageTabId[] {
  if (typeof window === 'undefined') return defaultManageTabOrder()
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultManageTabOrder()
    return normalizeManageTabOrder(JSON.parse(raw) as unknown)
  } catch {
    return defaultManageTabOrder()
  }
}

export function saveManageTabOrder(order: ManageTabId[]) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizeManageTabOrder(order)))
}
