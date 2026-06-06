export const DDAY_ITEM_COLORS = ['#2563eb', '#7c3aed', '#db2777', '#ea580c', '#0d9488', '#4f46e5'] as const

export function ddayColorForIndex(index: number) {
  return DDAY_ITEM_COLORS[index % DDAY_ITEM_COLORS.length]
}
