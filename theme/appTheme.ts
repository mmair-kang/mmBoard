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
    h5: {
      fontSize: '1.25rem',
      fontWeight: 800,
      '@media (min-width:900px)': {
        fontSize: '1.45rem',
      },
    },
    body1: {
      fontSize: '0.9375rem',
      '@media (min-width:900px)': {
        fontSize: '1rem',
      },
    },
    body2: {
      fontSize: '0.875rem',
      '@media (min-width:900px)': {
        fontSize: '0.9375rem',
      },
    },
    caption: {
      fontSize: '0.75rem',
      '@media (min-width:900px)': {
        fontSize: '0.8125rem',
      },
    },
  },
  components: {
    MuiDialog: {
      defaultProps: {
        transitionDuration: APP_DIALOG_TRANSITION_MS,
      },
    },
    MuiBottomNavigationAction: {
      styleOverrides: {
        root: {
          '@media (min-width:900px)': {
            minWidth: 96,
            paddingTop: 8,
          },
        },
        label: {
          '@media (min-width:900px)': {
            fontSize: '0.8rem',
            fontWeight: 600,
          },
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          '@media (min-width:900px)': {
            fontSize: '0.9rem',
            minHeight: 48,
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          '@media (min-width:900px)': {
            '& .MuiSvgIcon-root': {
              fontSize: '1.35rem',
            },
          },
        },
      },
    },
  },
})
