// 수정: Auto — 2026-07-19 03:08 (주황/초록 조화 회색 테두리)
// 수정: Auto — 2026-07-19 03:05 (항목명 테두리 회색)
// 수정: Auto — 2026-07-19 03:02 (항목명 테두리만 진하게)
// 수정: Auto — 2026-07-19 03:00 (항목명 배경 더 연하게)
// 수정: Auto — 2026-07-19 02:55 (수시 초록·항목명 톤)
// 수정: Auto — 2026-07-19 02:20 (심플 목록·썸네일 프레임)
// 수정: Auto — 2026-07-19 01:55 (월비용 인라인·항목명 썸네일 아래)
// 수정: Auto — 2026-07-19 01:05 (항목명 칩 상시/수시 색)
// 수정: Auto — 2026-06-15 (상시비 합계·비활성 텍스트 톤)

import type { CollectionMainKey, CollectionSectionKey, FoodScopeKey } from '@/config/collectionCategories'
import { getCollectionMainMeta, getCollectionSectionMeta } from '@/config/collectionCategories'
import { alpha, type Theme } from '@mui/material/styles'

const chipTextColor = 'rgba(15, 23, 42, 0.88)'
const chipTextMuted = 'rgba(51, 65, 85, 0.72)'

const FOOD_LIVING_HEX = getCollectionMainMeta('food').color
const FOOD_LIVING_TOTAL = '#b45309'
const FOOD_LIVING_AMOUNT_ACTIVE = '#9a3412'
const FOOD_LIVING_AMOUNT_IDLE = '#d97706'
const FOOD_LIVING_LABEL_IDLE = '#ca8a04'

/** 항목명(사진 아래) — 연한 배경 + 진한 글자 + 회색에 가까운 조화 테두리 */
const SCOPE_NAME_UNDER_THUMB: Record<
  FoodScopeKey,
  { bg: string; text: string; border: string }
> = {
  regular: {
    bg: alpha('#f59e0b', 0.04),
    text: '#7c2d12',
    // 따뜻한 회색 — 주황과 어울림
    border: 'rgba(180, 140, 90, 0.38)',
  },
  occasional: {
    bg: alpha('#22c55e', 0.04),
    text: '#14532d',
    // 차가운 회색 — 초록과 어울림
    border: 'rgba(110, 145, 120, 0.4)',
  },
}

/** 0depth — iOS 스타일 세그먼트 (상시 / 수시 / 소장) */
export function sxCollectionSectionSegmentTrack() {
  return {
    display: 'flex',
    gap: 0.35,
    p: 0.35,
    borderRadius: 2.5,
    bgcolor: (theme: Theme) =>
      alpha(theme.palette.grey[500], theme.palette.mode === 'dark' ? 0.14 : 0.08),
    border: '1px solid',
    borderColor: (theme: Theme) =>
      alpha(theme.palette.grey[500], theme.palette.mode === 'dark' ? 0.22 : 0.12),
  } as const
}

export function sxCollectionSectionSegmentItem(section: CollectionSectionKey, selected: boolean) {
  const hex = getCollectionSectionMeta(section).color
  return {
    flex: 1,
    minWidth: 0,
    py: { xs: 0.75, md: 0.85 },
    px: { xs: 0.5, md: 0.75 },
    borderRadius: 2,
    border: 'none',
    bgcolor: selected ? 'background.paper' : 'transparent',
    color: selected ? hex : chipTextMuted,
    fontWeight: selected ? 800 : 600,
    fontSize: { xs: '0.86rem', md: '0.92rem' },
    lineHeight: 1.2,
    cursor: 'pointer',
    outline: 'none',
    WebkitTapHighlightColor: 'transparent',
    boxShadow: selected ? '0 1px 4px rgba(15, 23, 42, 0.1)' : 'none',
    transition: 'background-color 0.15s ease, box-shadow 0.15s ease, color 0.15s ease, transform 0.1s ease',
    '&:hover': {
      color: selected ? hex : chipTextColor,
    },
    '&:active': {
      transform: 'scale(0.99)',
    },
  }
}

/** 1depth — 언더라인 탭 (개인 · 아파트 · 자동차 · 패션) */
export function sxCollectionMainTabs(main: CollectionMainKey) {
  const hex = getCollectionMainMeta(main).color
  return {
    minHeight: 32,
    mx: -0.5,
    my: -0.15,
    '& .MuiTabs-flexContainer': {
      minHeight: 32,
    },
    '& .MuiTabs-indicator': {
      height: 2,
      borderRadius: '2px 2px 0 0',
      backgroundColor: hex,
    },
    '& .MuiTab-root': {
      minHeight: 32,
      minWidth: 0,
      py: 0.25,
      px: 0.25,
      padding: '5px 2px',
      fontWeight: 600,
      fontSize: '0.76rem',
      lineHeight: 1.15,
      color: chipTextMuted,
      textTransform: 'none',
      '&.Mui-selected': {
        color: hex,
        fontWeight: 800,
      },
    },
  } as const
}

/** 1depth — 세그먼트 탭 (폼·기타 레거시) */
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
  return sxCollectionSubChipByColor(getCollectionMainMeta(main).color, selected)
}

export function sxCollectionSubChipByColor(hex: string, selected: boolean) {
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
  return sxCollectionSubChipPanelByColor(getCollectionMainMeta(main).color)
}

export function sxCollectionSubChipPanelByColor(hex: string) {
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
  return sxCollectionAddButtonByColor(getCollectionMainMeta(main).color)
}

export function sxCollectionAddButtonByColor(hex: string) {
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

/** food 항목명 칩 — 상시/수시 섹션 색 (글자는 진한 톤) */
export function sxCollectionProductNameChip(foodScope: 'regular' | 'occasional') {
  const tone = SCOPE_NAME_UNDER_THUMB[foodScope]
  return {
    display: 'inline-flex',
    alignItems: 'center',
    px: 0.85,
    py: 0.2,
    borderRadius: 1.25,
    border: '1px solid',
    borderColor: tone.border,
    bgcolor: tone.bg,
    color: tone.text,
    fontWeight: 800,
    fontSize: '0.78rem',
    lineHeight: 1.3,
    flexShrink: 0,
    maxWidth: '100%',
  } as const
}

export function sxCollectionLivingSummaryPanel() {
  return {
    px: 0.85,
    py: 0.65,
    borderRadius: 2.5,
    background: (theme: Theme) => {
      const greyWash = alpha(theme.palette.grey[500], theme.palette.mode === 'dark' ? 0.06 : 0.035)
      const colorWash = alpha(FOOD_LIVING_HEX, theme.palette.mode === 'dark' ? 0.06 : 0.04)
      return `linear-gradient(${colorWash}, ${colorWash}), ${greyWash}`
    },
    border: '1px solid',
    borderColor: alpha(FOOD_LIVING_HEX, 0.1),
  } as const
}

export function sxCollectionLivingTotalAmount() {
  return {
    fontSize: '0.86rem',
    fontWeight: 900,
    color: FOOD_LIVING_TOTAL,
    lineHeight: 1.2,
  } as const
}

/** 상시 — 카테고리+금액 통합 버튼 */
export function sxCollectionLivingSubButton(selected: boolean) {
  return {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    p: 0,
    borderRadius: 2,
    border: '1px solid',
    borderColor: selected ? alpha(FOOD_LIVING_HEX, 0.52) : alpha(FOOD_LIVING_HEX, 0.3),
    bgcolor: 'background.paper',
    cursor: 'pointer',
    outline: 'none',
    overflow: 'hidden',
    WebkitTapHighlightColor: 'transparent',
    boxShadow: selected ? `0 2px 6px ${alpha(FOOD_LIVING_HEX, 0.22)}` : `0 1px 2px ${alpha(FOOD_LIVING_HEX, 0.08)}`,
    transition: 'background-color 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease, transform 0.1s ease',
    '&:hover': {
      borderColor: alpha(FOOD_LIVING_HEX, selected ? 0.58 : 0.38),
      boxShadow: selected ? `0 2px 8px ${alpha(FOOD_LIVING_HEX, 0.28)}` : `0 1px 4px ${alpha(FOOD_LIVING_HEX, 0.14)}`,
    },
    '&:active': {
      transform: 'scale(0.98)',
    },
  } as const
}

export function sxCollectionLivingSubButtonLabel(selected: boolean) {
  return {
    py: 0.42,
    px: 0.45,
    textAlign: 'center',
    fontSize: '0.78rem',
    fontWeight: selected ? 800 : 600,
    color: selected ? FOOD_LIVING_HEX : FOOD_LIVING_LABEL_IDLE,
    lineHeight: 1.25,
  } as const
}

export function sxCollectionLivingSubButtonAmountFoot(hasAmount: boolean, selected: boolean) {
  return {
    py: 0.3,
    px: 0.35,
    textAlign: 'center',
    fontSize: '0.62rem',
    fontWeight: selected ? 900 : 800,
    lineHeight: 1.2,
    letterSpacing: '-0.02em',
    color: hasAmount
      ? selected
        ? FOOD_LIVING_AMOUNT_ACTIVE
        : FOOD_LIVING_AMOUNT_IDLE
      : 'text.disabled',
    bgcolor: (theme: Theme) =>
      alpha(FOOD_LIVING_HEX, theme.palette.mode === 'dark' ? (selected ? 0.22 : 0.14) : selected ? 0.16 : 0.1),
    borderTop: '1px solid',
    borderColor: alpha(FOOD_LIVING_HEX, selected ? 0.24 : 0.16),
  } as const
}

export function sxCollectionLivingSubRow() {
  return {
    display: 'flex',
    gap: 0.4,
    width: '100%',
    mt: 0.55,
    pt: 0.5,
    borderTop: 1,
    borderColor: alpha(FOOD_LIVING_HEX, 0.14),
  } as const
}

export function sxCollectionMonthlyUnderThumb(active: boolean) {
  return {
    width: '100%',
    py: 0.28,
    px: 0.2,
    borderRadius: 1,
    textAlign: 'center' as const,
    fontSize: '0.58rem',
    fontWeight: 800,
    lineHeight: 1.2,
    letterSpacing: '-0.02em',
    color: active ? 'warning.dark' : 'text.disabled',
    bgcolor: active
      ? (theme: { palette: { mode: string; warning: { main: string } } }) =>
          alpha(theme.palette.warning.main, theme.palette.mode === 'dark' ? 0.16 : 0.09)
      : (theme: { palette: { mode: string; grey: { 500: string } } }) =>
          alpha(theme.palette.grey[500], theme.palette.mode === 'dark' ? 0.12 : 0.06),
    border: '1px solid',
    borderColor: active ? 'warning.light' : 'divider',
  } as const
}

/** 목록 오른쪽 2행용 월 비용 칩 */
export function sxCollectionMonthlyInline(active: boolean) {
  return {
    ...sxCollectionMonthlyUnderThumb(active),
    width: 'auto',
    flexShrink: 0,
    px: 0.55,
    py: 0.12,
    fontSize: '0.68rem',
    borderRadius: 0.75,
  } as const
}

/** 썸네일 아래 항목명 */
export function sxCollectionNameUnderThumb(foodScope: FoodScopeKey = 'regular') {
  const tone = SCOPE_NAME_UNDER_THUMB[foodScope]
  return {
    width: '100%',
    px: 0.35,
    py: 0.4,
    textAlign: 'center' as const,
    fontSize: { xs: '0.72rem', md: '0.76rem' },
    fontWeight: 800,
    lineHeight: 1.2,
    letterSpacing: '-0.02em',
    color: tone.text,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
    borderTop: 1,
    borderColor: tone.border,
    bgcolor: tone.bg,
  } as const
}

/** 상시/수시: 사진+항목명 한 덩어리 테두리 */
export function sxCollectionThumbNameFrame(foodScope: FoodScopeKey = 'regular') {
  const tone = SCOPE_NAME_UNDER_THUMB[foodScope]
  return {
    width: { xs: 72, md: 84 },
    flexShrink: 0,
    border: 1,
    borderColor: tone.border,
    borderRadius: 1,
    overflow: 'hidden',
    bgcolor: 'action.hover',
  } as const
}

/** 쇼핑 목록 행 — 카드 없이 구분선만 */
export function sxCollectionListRow(dimmed = false) {
  return {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 1.25,
    px: { xs: 1, sm: 1.25, md: 1.5 },
    py: 1,
    cursor: 'pointer',
    borderBottom: 1,
    borderColor: 'divider',
    bgcolor: 'transparent',
    opacity: dimmed ? 0.4 : 1,
    transition: 'opacity 0.15s ease, background-color 0.12s ease',
    '&:hover': {
      bgcolor: 'action.hover',
    },
  } as const
}

/** 쇼핑 목록 컨테이너 — 행 간격 없음 */
export function sxCollectionListStack() {
  return {
    display: 'grid',
    gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' },
    gap: 0,
    width: '100%',
    borderTop: 1,
    borderColor: 'divider',
  } as const
}

export function sxCollectionFoodMetricChip(priceMetric: boolean) {
  return {
    display: 'inline-flex',
    alignItems: 'center',
    px: 0.55,
    py: 0.12,
    borderRadius: 0.75,
    fontSize: '0.68rem',
    fontWeight: priceMetric ? 700 : 600,
    lineHeight: 1.25,
    color: priceMetric ? 'primary.main' : 'text.secondary',
    bgcolor: priceMetric
      ? (theme: { palette: { mode: string; primary: { main: string } } }) =>
          alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.14 : 0.07)
      : (theme: { palette: { mode: string; grey: { 500: string } } }) =>
          alpha(theme.palette.grey[500], theme.palette.mode === 'dark' ? 0.1 : 0.06),
    border: '1px solid',
    borderColor: priceMetric
      ? (theme: { palette: { primary: { main: string } } }) => alpha(theme.palette.primary.main, 0.2)
      : 'divider',
  } as const
}

const FASHION_ACCENT = '#8b5cf6'

export function sxCollectionFashionSizeBadge() {
  return {
    display: 'inline-flex',
    alignItems: 'center',
    px: 0.55,
    py: 0.12,
    borderRadius: 0.75,
    fontSize: '0.7rem',
    fontWeight: 800,
    lineHeight: 1.2,
    color: '#6d28d9',
    bgcolor: (theme: Theme) => alpha(FASHION_ACCENT, theme.palette.mode === 'dark' ? 0.16 : 0.1),
    border: '1px solid',
    borderColor: (theme: Theme) => alpha(FASHION_ACCENT, theme.palette.mode === 'dark' ? 0.28 : 0.18),
    flexShrink: 0,
  } as const
}

export function sxCollectionFashionMetricItem() {
  return {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 0.2,
    px: 0.4,
    py: 0.1,
    borderRadius: 0.75,
    bgcolor: (theme: Theme) => alpha(theme.palette.grey[500], theme.palette.mode === 'dark' ? 0.1 : 0.06),
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
