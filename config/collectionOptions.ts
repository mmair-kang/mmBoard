// 수정: Auto — 2026-06-05 (사이즈 공통 필드 분리)

export const COLLECTION_OPTION_TYPES = [
  { key: 'none', label: '없음' },
  { key: 'top', label: '상의' },
  { key: 'bottom', label: '하의' },
] as const

export type CollectionOptionType = (typeof COLLECTION_OPTION_TYPES)[number]['key']

export type CollectionOptionFieldKey =
  | 'totalLength'
  | 'shoulderWidth'
  | 'chestWidth'
  | 'sleeveLength'

export type CollectionOptionData = Partial<Record<CollectionOptionFieldKey, string>>

export const COLLECTION_OPTION_FIELDS = {
  top: [
    { key: 'totalLength', label: '총장' },
    { key: 'shoulderWidth', label: '어깨너비' },
    { key: 'chestWidth', label: '가슴단면' },
    { key: 'sleeveLength', label: '소매길이' },
  ],
  bottom: [{ key: 'totalLength', label: '총장' }],
} as const satisfies Record<
  Exclude<CollectionOptionType, 'none'>,
  readonly { key: CollectionOptionFieldKey; label: string }[]
>

const optionTypeSet = new Set<string>(COLLECTION_OPTION_TYPES.map((o) => o.key))

const optionFieldKeys = new Set<string>([
  ...COLLECTION_OPTION_FIELDS.top.map((f) => f.key),
  ...COLLECTION_OPTION_FIELDS.bottom.map((f) => f.key),
])

export function getCollectionOptionLabel(type: CollectionOptionType): string {
  return COLLECTION_OPTION_TYPES.find((o) => o.key === type)?.label ?? type
}

export function isValidCollectionOptionType(value: unknown): value is CollectionOptionType {
  return optionTypeSet.has(String(value))
}

export function emptyOptionData(type: CollectionOptionType): CollectionOptionData {
  if (type === 'none') return {}
  const fields = COLLECTION_OPTION_FIELDS[type]
  return Object.fromEntries(fields.map((f) => [f.key, ''])) as CollectionOptionData
}

export function parseCollectionOptionData(
  optionType: CollectionOptionType,
  raw: unknown,
): CollectionOptionData | null {
  if (optionType === 'none') return {}
  if (typeof raw !== 'object' || raw === null) return null

  const source = raw as Record<string, unknown>
  const fields = COLLECTION_OPTION_FIELDS[optionType]
  const result: CollectionOptionData = {}

  for (const field of fields) {
    const value = source[field.key]
    if (value !== undefined && value !== null && typeof value !== 'string') return null
    result[field.key] = typeof value === 'string' ? value.trim() : ''
  }

  return result
}

export function serializeCollectionOptionData(data: CollectionOptionData): string {
  return JSON.stringify(data)
}

export function deserializeCollectionOptionData(raw: string | null | undefined): CollectionOptionData {
  if (!raw) return {}
  try {
    const parsed = JSON.parse(raw) as unknown
    if (typeof parsed !== 'object' || parsed === null) return {}
    const result: CollectionOptionData = {}
    for (const [key, value] of Object.entries(parsed)) {
      if (key === 'size') continue
      if (!optionFieldKeys.has(key)) continue
      if (typeof value === 'string') result[key as CollectionOptionFieldKey] = value
    }
    return result
  } catch {
    return {}
  }
}

/** 예전 option_data JSON에 있던 사이즈 */
export function readLegacyOptionSize(raw: string | null | undefined): string {
  if (!raw) return ''
  try {
    const parsed = JSON.parse(raw) as unknown
    if (typeof parsed !== 'object' || parsed === null) return ''
    const value = (parsed as Record<string, unknown>).size
    return typeof value === 'string' ? value.trim() : ''
  } catch {
    return ''
  }
}
