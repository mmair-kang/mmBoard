'use client'
// 수정: Auto — 2026-06-15 (PC 반응형 콘텐츠 컬럼)

import {
  sxAppContentColumn,
  sxAppMainOuter,
  sxAppShellRoot,
} from '@/config/responsiveLayout'
import Box from '@mui/material/Box'
import { ReactNode } from 'react'
import { AppBottomNav } from './AppBottomNav'

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <Box sx={sxAppShellRoot}>
      <Box component="main" sx={sxAppMainOuter}>
        <Box sx={sxAppContentColumn}>{children}</Box>
      </Box>
      <AppBottomNav />
    </Box>
  )
}
