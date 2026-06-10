'use client'
// 수정: Auto — 2026-06-08 (SWR IndexedDB 영속)

import { SWRPersistProvider } from '@/components/providers/SWRPersistProvider'
import { AppShell } from '@/components/layout/AppShell'
import { appTheme } from '@/theme/appTheme'
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter'
import { CssBaseline, ThemeProvider } from '@mui/material'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs from 'dayjs'
import 'dayjs/locale/ko'
import { ReactNode } from 'react'

dayjs.locale('ko')

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <AppRouterCacheProvider options={{ key: 'mmboard' }}>
      <ThemeProvider theme={appTheme}>
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ko">
          <CssBaseline />
          <SWRPersistProvider>
            <AppShell>{children}</AppShell>
          </SWRPersistProvider>
        </LocalizationProvider>
      </ThemeProvider>
    </AppRouterCacheProvider>
  )
}
