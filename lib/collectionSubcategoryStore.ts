// 수정: Auto — 2026-06-05 (2depth 카테고리 DB 저장)

import {
  COLLECTION_MAIN_CATEGORIES,
  COLLECTION_SUBCATEGORIES,
  type CollectionMainKey,
  type CollectionSubEntry,
} from '@/config/collectionCategories'
import { getDbClient } from '@/lib/db'
import { ensureCollectionSchema } from '@/lib/collectionSchema'

const META_KEY = 'collection_subcategories_v1'

const mainKeys = COLLECTION_MAIN_CATEGORIES.map((c) => c.key)

export function defaultSubEntries(main: CollectionMainKey): CollectionSubEntry[] {
  return COLLECTION_SUBCATEGORIES[main].map((c) => ({ key: c.key, label: c.label }))
}

function emptyConfig(): Record<CollectionMainKey, CollectionSubEntry[]> {
  return {
    personal: defaultSubEntries('personal'),
    home: defaultSubEntries('home'),
    car: defaultSubEntries('car'),
    food: defaultSubEntries('food'),
    fashion: defaultSubEntries('fashion'),
  }
}

async function readConfigRaw(): Promise<Record<string, CollectionSubEntry[]> | null> {
  await ensureCollectionSchema()
  const result = await getDbClient().execute({
    sql: `SELECT value FROM app_meta WHERE key = ? LIMIT 1`,
    args: [META_KEY],
  })
  const raw = result.rows[0]?.[0]
  if (typeof raw !== 'string' || !raw.trim()) return null
  try {
    return JSON.parse(raw) as Record<string, CollectionSubEntry[]>
  } catch {
    return null
  }
}

function mergeWithDefaults(parsed: Record<string, CollectionSubEntry[]> | null): Record<CollectionMainKey, CollectionSubEntry[]> {
  const base = emptyConfig()
  if (!parsed) return base
  for (const main of mainKeys) {
    const list = parsed[main]
    if (Array.isArray(list) && list.length > 0) {
      base[main as CollectionMainKey] = list
        .filter((e) => e && typeof e.key === 'string' && typeof e.label === 'string')
        .map((e) => ({ key: e.key.trim(), label: e.label.trim() }))
        .filter((e) => e.key && e.label)
    }
  }
  return base
}

export async function loadAllSubEntries(): Promise<Record<CollectionMainKey, CollectionSubEntry[]>> {
  return mergeWithDefaults(await readConfigRaw())
}

export async function loadSubEntries(main: CollectionMainKey): Promise<CollectionSubEntry[]> {
  const all = await loadAllSubEntries()
  return all[main]
}

export function findSubLabel(
  main: CollectionMainKey,
  sub: string,
  subs: CollectionSubEntry[],
): string {
  return subs.find((c) => c.key === sub)?.label ?? sub
}

export function isSubKeyValid(main: CollectionMainKey, sub: unknown, subs: CollectionSubEntry[]): sub is string {
  if (typeof sub !== 'string' || !sub.trim()) return false
  return subs.some((c) => c.key === sub)
}

export function createSubKey(label: string, used: Set<string>): string {
  const slug = label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
  let candidate = slug && /^[a-z]/.test(slug) ? slug : `sub_${Date.now().toString(36)}`
  let n = 1
  let key = candidate
  while (used.has(key)) {
    key = `${candidate}_${n}`
    n += 1
  }
  used.add(key)
  return key
}

export type SubcategorySaveRow = { key?: string | null; label: string }

export function normalizeSubEntriesForSave(
  rows: SubcategorySaveRow[],
  previous: CollectionSubEntry[],
): { entries: CollectionSubEntry[]; error?: string } {
  const trimmed = rows.map((r) => ({ key: r.key?.trim() || '', label: r.label.trim() })).filter((r) => r.label)
  if (trimmed.length === 0) return { entries: [], error: '항목이 하나 이상 필요합니다.' }

  const labels = trimmed.map((r) => r.label.toLowerCase())
  if (new Set(labels).size !== labels.length) return { entries: [], error: '같은 이름의 항목이 있습니다.' }

  const used = new Set<string>()
  const prevMap = new Map(previous.map((p) => [p.key, p]))
  const entries: CollectionSubEntry[] = []

  for (const row of trimmed) {
    const prev = row.key ? prevMap.get(row.key) : undefined
    if (prev && prev.key) {
      used.add(prev.key)
      entries.push({ key: prev.key, label: row.label })
      continue
    }
    const key = createSubKey(row.label, used)
    entries.push({ key, label: row.label })
  }

  return { entries }
}

export async function saveSubEntries(
  main: CollectionMainKey,
  rows: SubcategorySaveRow[],
): Promise<{ entries: CollectionSubEntry[]; error?: string }> {
  const previous = await loadSubEntries(main)
  const { entries, error } = normalizeSubEntriesForSave(rows, previous)
  if (error) return { entries: [], error }

  const all = await loadAllSubEntries()
  all[main] = entries

  await getDbClient().execute({
    sql: `INSERT OR REPLACE INTO app_meta (key, value) VALUES (?, ?)`,
    args: [META_KEY, JSON.stringify(all)],
  })

  return { entries }
}
