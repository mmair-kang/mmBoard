// 수정: Auto — 2026-06-15 (메인탭 PC 레이아웃)

import type { SxProps, Theme } from '@mui/material/styles'

/** md(900px) 이상 — PC·태블릿 가로 */
export const APP_CONTENT_MAX_WIDTH = 1080

export const sxAppShellRoot: SxProps<Theme> = {
  height: '100dvh',
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
  bgcolor: { md: '#eef2f7' },
}

export const sxAppMainOuter: SxProps<Theme> = {
  flex: 1,
  minHeight: 0,
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  pb: { xs: 7, md: 8 },
}

export const sxAppContentColumn: SxProps<Theme> = {
  width: '100%',
  height: '100%',
  minHeight: 0,
  minWidth: 0,
  display: 'flex',
  flexDirection: 'column',
  mx: { md: 'auto' },
  maxWidth: { md: APP_CONTENT_MAX_WIDTH },
  bgcolor: { md: 'background.paper' },
  boxShadow: { md: '0 0 0 1px rgba(15, 23, 42, 0.06)' },
}

export const sxPageScrollBody: SxProps<Theme> = {
  flex: 1,
  minHeight: 0,
  minWidth: 0,
  overflowY: 'auto',
  overflowX: 'hidden',
  WebkitOverflowScrolling: 'touch',
  px: { xs: 1, sm: 1.5, md: 2.5, lg: 3 },
  py: { xs: 1.25, md: 1.75 },
  pb: { xs: 2.5, md: 3 },
}

export const sxPageStickyHeaderPad: SxProps<Theme> = {
  px: { xs: 1.5, sm: 1.5, md: 2.5, lg: 3 },
  pt: { xs: 1.25, md: 1.5 },
  pb: { xs: 1.125, md: 1.25 },
}

export const sxPageTitle: SxProps<Theme> = {
  fontWeight: 900,
  lineHeight: 1.2,
  fontSize: { xs: '1.05rem', md: '1.35rem', lg: '1.45rem' },
}

export const sxDesktopTwoColumnGrid: SxProps<Theme> = {
  display: 'grid',
  gap: { xs: 1.25, md: 2 },
  gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
  width: '100%',
  minWidth: 0,
}

export const sxDesktopGridFullSpan: SxProps<Theme> = {
  gridColumn: { md: '1 / -1' },
}

export const sxMainTabLayout: SxProps<Theme> = {
  display: 'flex',
  flexDirection: 'column',
  gap: { xs: 1.25, md: 1.5 },
  width: '100%',
  minWidth: 0,
}

/** PC — 할일·D-day 1행 (달력은 그 위 전체 너비) */
export const sxMainTabTopRow: SxProps<Theme> = {
  display: 'grid',
  gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
  gap: { xs: 1.25, md: 1.5 },
  width: '100%',
  minWidth: 0,
}

export const sxDesktopListGrid: SxProps<Theme> = {
  display: 'grid',
  gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' },
  gap: { xs: 0.75, md: 1, lg: 1.25 },
}

export const sxBottomNavInner: SxProps<Theme> = {
  width: '100%',
  maxWidth: { md: APP_CONTENT_MAX_WIDTH },
  mx: 'auto',
}
