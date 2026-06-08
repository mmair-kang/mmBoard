'use client'
// 수정: Auto — 2026-06-08

import { DdayWidget } from '@/components/home/DdayWidget'
import { MonthlyTaskWidget } from '@/components/home/MonthlyTaskWidget'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'

export function HomePageContent() {
  return (
    <Box sx={{ height: '100%', overflowY: 'auto', px: 1.5, py: 1.25 }}>
      <Stack spacing={1.5}>
        <MonthlyTaskWidget />
        <DdayWidget />
      </Stack>
    </Box>
  )
}
