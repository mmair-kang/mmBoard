// 수정: Auto — 2026-07-12 23:57 (확인필요·3탭 세그먼트)
// 수정: Auto — 2026-07-12 23:40 (세그먼트 버튼 Paperlogy 폰트 상속)
// 수정: Auto — 2026-07-12 23:36
import { alpha, type Theme } from '@mui/material/styles'

export type CardSubTabId = 'performance' | 'application'

export const CARD_SUB_TABS: { id: CardSubTabId; label: string }[] = [
  { id: 'performance', label: '카드실적' },
  { id: 'application', label: '카드신청' },
]

export function sxCardSubTabTrack() {
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

export function sxCardSubTabItem(selected: boolean) {
  return {
    flex: 1,
    minWidth: 0,
    py: { xs: 0.65, md: 0.75 },
    px: { xs: 0.5, md: 0.75 },
    borderRadius: 2,
    border: 'none',
    bgcolor: selected ? 'background.paper' : 'transparent',
    color: selected ? 'primary.main' : 'text.secondary',
    fontFamily: 'inherit',
    fontWeight: selected ? 800 : 600,
    fontSize: { xs: '0.82rem', md: '0.88rem' },
    lineHeight: 1.2,
    cursor: 'pointer',
    outline: 'none',
    WebkitTapHighlightColor: 'transparent',
    boxShadow: selected ? '0 1px 4px rgba(15, 23, 42, 0.1)' : 'none',
    transition: 'background-color 0.15s ease, box-shadow 0.15s ease, color 0.15s ease, transform 0.1s ease',
    '&:hover': {
      color: selected ? 'primary.main' : 'text.primary',
    },
    '&:active': {
      transform: 'scale(0.99)',
    },
  }
}

/** 신청불가 사유 3탭 — 좁은 폰트 */
export function sxCardSubTabItemTriple(selected: boolean) {
  return {
    ...sxCardSubTabItem(selected),
    fontSize: { xs: '0.72rem', md: '0.78rem' },
    px: { xs: 0.3, md: 0.45 },
    py: { xs: 0.6, md: 0.68 },
  }
}
