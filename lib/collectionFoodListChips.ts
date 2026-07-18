// 수정: Auto — 2026-07-19 02:45 (목록 칩 표시 설정)

export const COLLECTION_FOOD_LIST_CHIP_KEYS = [
  'amount',
  'unitsPerPack',
  'unitPrice',
  'perPiece',
] as const

export type CollectionFoodListChipKey = (typeof COLLECTION_FOOD_LIST_CHIP_KEYS)[number]

export type CollectionFoodListChipFlags = Record<CollectionFoodListChipKey, boolean>

export const COLLECTION_FOOD_LIST_CHIP_OPTIONS: {
  key: CollectionFoodListChipKey
  label: string
}[] = [
  { key: 'amount', label: '용량' },
  { key: 'unitsPerPack', label: '1박스당 개수' },
  { key: 'unitPrice', label: '용량 단가' },
  { key: 'perPiece', label: '1개당 가격' },
]

export function defaultFoodListChipFlags(): CollectionFoodListChipFlags {
  return {
    amount: true,
    unitsPerPack: true,
    unitPrice: true,
    perPiece: true,
  }
}

export function parseFoodListChipFlags(raw: unknown): CollectionFoodListChipFlags {
  const defaults = defaultFoodListChipFlags()
  let parsed: Record<string, unknown> | null = null
  if (typeof raw === 'string') {
    try {
      const value = JSON.parse(raw) as unknown
      if (value && typeof value === 'object') parsed = value as Record<string, unknown>
    } catch {
      return defaults
    }
  } else if (raw && typeof raw === 'object') {
    parsed = raw as Record<string, unknown>
  }
  if (!parsed) return defaults

  const next = { ...defaults }
  for (const key of COLLECTION_FOOD_LIST_CHIP_KEYS) {
    if (typeof parsed[key] === 'boolean') next[key] = parsed[key]
  }
  return next
}

export function foodListChipFlagsEqual(
  a: CollectionFoodListChipFlags,
  b: CollectionFoodListChipFlags,
): boolean {
  return COLLECTION_FOOD_LIST_CHIP_KEYS.every((key) => a[key] === b[key])
}

export function foodListChipFlagsForDb(flags: CollectionFoodListChipFlags): string {
  return JSON.stringify(flags)
}
