'use client'

import Box from '@mui/material/Box'
import { ReactNode } from 'react'
import { AppBottomNav } from './AppBottomNav'

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <Box sx={{ height: '100dvh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <Box
        component="main"
        sx={{
          flex: 1,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          pb: 7,
        }}
      >
        {children}
      </Box>
      <AppBottomNav />
    </Box>
  )
}
