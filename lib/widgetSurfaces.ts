// 수정: Auto — 2026-06-15

import { alpha, type Theme } from '@mui/material/styles'

/** 금액 입력란 — 거의 흰색 */
export function nearlyWhiteInputBg(theme: Theme): string {
  return theme.palette.mode === 'dark'
    ? alpha(theme.palette.common.white, 0.09)
    : theme.palette.common.white
}

/** 스위치 OFF 행 — 입력보다 살짝만 회색 */
export function inactiveSwitchRowBg(theme: Theme): string {
  return theme.palette.mode === 'dark'
    ? alpha(theme.palette.common.white, 0.04)
    : alpha(theme.palette.grey[500], 0.055)
}
