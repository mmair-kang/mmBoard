import { APP_DIALOG_TRANSITION_MS } from '@/config/dialogMotion'
import { createTheme } from '@mui/material'

export const appTheme = createTheme({
  typography: {
    fontFamily: 'var(--font-paperlogy)',
    fontWeightLight: 500,
    fontWeightRegular: 500,
    fontWeightMedium: 600,
    fontWeightBold: 700,
    allVariants: {
      fontWeight: 500,
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
