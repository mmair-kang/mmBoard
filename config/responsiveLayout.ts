// 수정: Auto — 2026-08-19 15:40 (PC 프레임만 분리, 내부는 모바일과 동일)

import type { SxProps, Theme } from '@mui/material/styles'

/** 일반 스마트폰 콘텐츠 폭 — PC 가로에서도 이 폭으로 가운데 고정 */
export const APP_CONTENT_MAX_WIDTH = 430

const APP_FRAME_MEDIA = `@media (min-width: ${APP_CONTENT_MAX_WIDTH + 1}px)`

export const sxAppShellRoot: SxProps<Theme> = {
  height: '100dvh',
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  bgcolor: 'background.paper',
  [APP_FRAME_MEDIA]: {
    bgcolor: '#eef2f7',
  },
}

export const sxAppMainOuter: SxProps<Theme> = {
  flex: 1,
  minHeight: 0,
  width: '100%',
  maxWidth: APP_CONTENT_MAX_WIDTH,
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  pb: 7,
  bgcolor: 'background.paper',
  [APP_FRAME_MEDIA]: {
    boxShadow: '0 0 24px rgba(15, 23, 42, 0.08)',
  },
}

export const sxAppContentColumn: SxProps<Theme> = {
  width: '100%',
  height: '100%',
  minHeight: 0,
  minWidth: 0,
  display: 'flex',
  flexDirection: 'column',
}

export const sxPageScrollBody: SxProps<Theme> = {
  flex: 1,
  minHeight: 0,
  minWidth: 0,
  overflowY: 'auto',
  overflowX: 'hidden',
  WebkitOverflowScrolling: 'touch',
  px: { xs: 1, sm: 1.5 },
  py: 1.25,
  pb: 2.5,
}

export const sxPageStickyHeaderPad: SxProps<Theme> = {
  px: 1.5,
  pt: 1.25,
  pb: 1.125,
}

export const sxPageTitle: SxProps<Theme> = {
  fontWeight: 900,
  lineHeight: 1.2,
  fontSize: '1.05rem',
}

export const sxDesktopTwoColumnGrid: SxProps<Theme> = {
  display: 'grid',
  gap: 1.25,
  gridTemplateColumns: '1fr',
  width: '100%',
  minWidth: 0,
}

export const sxDesktopGridFullSpan: SxProps<Theme> = {
  gridColumn: '1 / -1',
}

export const sxMainTabLayout: SxProps<Theme> = {
  display: 'flex',
  flexDirection: 'column',
  gap: 1.25,
  width: '100%',
  minWidth: 0,
}

/** 할일·D-day (달력은 그 위 전체 너비) */
export const sxMainTabTopRow: SxProps<Theme> = {
  display: 'grid',
  gridTemplateColumns: '1fr',
  gap: 1.25,
  width: '100%',
  minWidth: 0,
}

export const sxDesktopListGrid: SxProps<Theme> = {
  display: 'grid',
  gridTemplateColumns: '1fr',
  gap: { xs: 0.75, md: 1 },
}

export const sxBottomNavBar: SxProps<Theme> = {
  position: 'fixed',
  bottom: 0,
  left: '50%',
  transform: 'translateX(-50%)',
  width: '100%',
  maxWidth: APP_CONTENT_MAX_WIDTH,
  zIndex: (theme) => theme.zIndex.appBar,
  borderTop: 1,
  borderColor: 'divider',
  bgcolor: 'background.paper',
}

export const sxBottomNavInner: SxProps<Theme> = {
  width: '100%',
  maxWidth: APP_CONTENT_MAX_WIDTH,
  mx: 'auto',
}
