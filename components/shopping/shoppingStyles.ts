// 수정: Auto — 2026-06-05
import type { ShoppingCategoryKey } from '@/config/shoppingCategories'
import { getCategoryMeta } from '@/config/shoppingCategories'
import { alpha } from '@mui/material/styles'

const chipTextColor = 'rgba(15, 23, 42, 0.88)'
const chipTextMuted = 'rgba(51, 65, 85, 0.72)'

export function sxCategoryChip(category: ShoppingCategoryKey, selected: boolean) {
  const hex = getCategoryMeta(category).color
  return {
    px: 1.75,
    py: 0.75,
    borderRadius: 2,
    border: `1px solid ${selected ? hex : alpha(hex, 0.45)}`,
    bgcolor: selected ? alpha(hex, 0.05) : 'background.paper',
    color: selected ? chipTextColor : chipTextMuted,
    fontWeight: selected ? 700 : 500,
    fontSize: '0.92rem',
    cursor: 'pointer',
    outline: 'none',
    WebkitTapHighlightColor: 'transparent',
    transition: 'border-color 0.15s ease, background-color 0.15s ease, box-shadow 0.15s ease, transform 0.1s ease',
    boxShadow: selected ? `inset 0 1px 1px ${alpha(hex, 0.1)}` : 'none',
    '&:hover': {
      borderColor: hex,
      color: chipTextColor,
      bgcolor: selected ? alpha(hex, 0.08) : alpha(hex, 0.03),
    },
    '&:active': {
      transform: 'scale(0.98)',
      boxShadow: `inset 0 1px 2px ${alpha(hex, 0.12)}`,
    },
  }
}

export function sxCategoryAddButton(category: ShoppingCategoryKey) {
  const hex = getCategoryMeta(category).color
  return {
    flexShrink: 0,
    width: 40,
    height: 40,
    padding: 0,
    borderRadius: 2,
    border: '1px solid',
    borderColor: alpha(hex, 0.4),
    bgcolor: 'background.paper',
    color: chipTextMuted,
    boxShadow: 'none',
    '&:hover': {
      borderColor: hex,
      color: chipTextColor,
      bgcolor: 'background.paper',
      boxShadow: 'none',
    },
  }
}

export const sxShoppingCategoryChipGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
  gap: 0.75,
} as const

export function sxCategoryBadge(category: ShoppingCategoryKey) {
  const hex = getCategoryMeta(category).color
  return {
    px: 1,
    py: 0.35,
    borderRadius: 1.5,
    fontSize: '0.8rem',
    fontWeight: 700,
    lineHeight: 1.3,
    border: '1px solid',
    borderColor: hex,
    bgcolor: 'background.paper',
    color: chipTextColor,
  }
}
