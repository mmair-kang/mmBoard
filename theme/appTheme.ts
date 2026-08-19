// 수정: Auto — 2026-08-19 15:40 (PC도 모바일과 동일한 타이포·컴포넌트)

import { APP_DIALOG_TRANSITION_MS } from '@/config/dialogMotion'
import { createTheme } from '@mui/material'

export const appTheme = createTheme({
  /** PC에서도 xs 스타일만 쓰도록 큰 브레이크포인트는 사실상 비활성 */
  breakpoints: {
    values: {
      xs: 0,
      sm: 10000,
      md: 10001,
      lg: 10002,
      xl: 10003,
    },
  },
  typography: {
    fontFamily: 'var(--font-paperlogy)',
    fontWeightLight: 500,
    fontWeightRegular: 500,
    fontWeightMedium: 600,
    fontWeightBold: 700,
    allVariants: {
      fontWeight: 500,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 800,
    },
    body1: {
      fontSize: '0.9375rem',
    },
    body2: {
      fontSize: '0.875rem',
    },
    caption: {
      fontSize: '0.75rem',
    },
  },
  components: {
    MuiDialog: {
      defaultProps: {
        transitionDuration: APP_DIALOG_TRANSITION_MS,
      },
    },
  },
})
