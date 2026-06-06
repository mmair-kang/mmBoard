// 수정: Auto — 2026-06-05 (검색 모드 UI)

import type { CollectionMainKey } from '@/config/collectionCategories'
import { getCollectionMainMeta } from '@/config/collectionCategories'
import { alpha } from '@mui/material/styles'

const chipTextColor = 'rgba(15, 23, 42, 0.88)'
const chipTextMuted = 'rgba(51, 65, 85, 0.72)'

/** 1depth — 세그먼트 탭 (채움·크게) */
export function sxCollectionMainChip(main: CollectionMainKey, selected: boolean) {
  const hex = getCollectionMainMeta(main).color
  return {
    px: 0.75,
    py: 0.9,
    borderRadius: 2.5,
    border: '1px solid',
    borderColor: selected ? alpha(hex, 0.45) : alpha(hex, 0.22),
    bgcolor: selected ? hex : (theme: { palette: { mode: string } }) =>
      theme.palette.mode === 'dark' ? alpha(hex, 0.14) : alpha(hex, 0.07),
    color: selected ? '#fff' : chipTextMuted,
    fontWeight: selected ? 700 : 500,
    fontSize: '0.8rem',
    lineHeight: 1.2,
    cursor: 'pointer',
    outline: 'none',
    WebkitTapHighlightColor: 'transparent',
    boxShadow: selected ? `0 2px 8px ${alpha(hex, 0.35)}` : 'none',
    transition: 'background-color 0.15s ease, box-shadow 0.15s ease, transform 0.1s ease, color 0.15s ease',
    '&:hover': {
      borderColor: selected ? alpha(hex, 0.55) : alpha(hex, 0.32),
      bgcolor: selected ? hex : alpha(hex, 0.12),
      color: selected ? '#fff' : chipTextColor,
    },
    '&:active': {
      transform: 'scale(0.98)',
    },
  }
}

/** 2depth — 필터 pill (작고 가벼움) */
export function sxCollectionSubChip(main: CollectionMainKey, selected: boolean) {
  const hex = getCollectionMainMeta(main).color
  return {
    px: 1.1,
    py: 0.45,
    borderRadius: 999,
    border: 'none',
    bgcolor: selected ? 'background.paper' : 'transparent',
    color: selected ? hex : chipTextMuted,
    fontWeight: selected ? 700 : 500,
    fontSize: '0.78rem',
    lineHeight: 1.25,
    cursor: 'pointer',
    outline: 'none',
    WebkitTapHighlightColor: 'transparent',
    boxShadow: selected ? '0 1px 3px rgba(15, 23, 42, 0.1)' : 'none',
    transition: 'background-color 0.15s ease, box-shadow 0.15s ease, color 0.15s ease, transform 0.1s ease',
    '&:hover': {
      color: selected ? hex : chipTextColor,
      bgcolor: selected ? 'background.paper' : alpha(hex, 0.06),
    },
    '&:active': {
      transform: 'scale(0.97)',
    },
  }
}

export function sxCollectionSubChipPanel(main: CollectionMainKey) {
  const hex = getCollectionMainMeta(main).color
  return {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: 0.5,
    px: 0.85,
    py: 0.65,
    borderRadius: 2.5,
    background: (theme: { palette: { mode: string; grey: { 500: string } } }) => {
      const greyWash = alpha(theme.palette.grey[500], theme.palette.mode === 'dark' ? 0.06 : 0.035)
      const colorWash = alpha(hex, theme.palette.mode === 'dark' ? 0.06 : 0.04)
      return `linear-gradient(${colorWash}, ${colorWash}), ${greyWash}`
    },
    border: '1px solid',
    borderColor: alpha(hex, 0.1),
  }
}

export function sxCollectionSearchResultPanel() {
  return {
    display: 'flex',
    alignItems: 'center',
    minHeight: 36,
    px: 1,
    py: 0.65,
    borderRadius: 2.5,
    bgcolor: (theme: { palette: { mode: string; grey: { 500: string } } }) =>
      alpha(theme.palette.grey[500], theme.palette.mode === 'dark' ? 0.12 : 0.07),
    border: '1px solid',
    borderColor: (theme: { palette: { mode: string; grey: { 500: string } } }) =>
      alpha(theme.palette.grey[500], theme.palette.mode === 'dark' ? 0.2 : 0.14),
  }
}

export function sxCollectionSearchResultText() {
  return {
    fontSize: '0.8rem',
    lineHeight: 1.35,
    color: chipTextMuted,
    fontWeight: 500,
  } as const
}

export function sxCollectionSearchResultQuery() {
  return {
    fontWeight: 700,
    color: chipTextColor,
  } as const
}

export function sxCollectionAddButton(main: CollectionMainKey) {
  const hex = getCollectionMainMeta(main).color
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

export const sxCollectionMainChipGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
  gap: 0.5,
} as const

export function sxCollectionChipButton(compact?: boolean) {
  return {
    fontFamily: 'inherit',
    width: compact ? 'auto' : '100%',
    textAlign: 'center',
    whiteSpace: 'nowrap',
  } as const
}

export function sxCollectionBrandChip() {
  return {
    display: 'inline-flex',
    alignItems: 'center',
    px: 0.85,
    py: 0.2,
    borderRadius: 1.25,
    border: '1px solid',
    borderColor: 'rgba(15, 23, 42, 0.32)',
    bgcolor: 'background.paper',
    color: chipTextColor,
    fontWeight: 600,
    fontSize: '0.78rem',
    lineHeight: 1.3,
    flexShrink: 0,
  } as const
}

export function sxCollectionBadge(main: CollectionMainKey) {
  const hex = getCollectionMainMeta(main).color
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
