// 수정: Auto — 2026-06-15
'use client'

import { sxPageTitle } from '@/config/responsiveLayout'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

export default function SettingsPage() {
  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: { xs: 2, md: 3 },
      }}
    >
      <Typography color="text.secondary" sx={{ ...sxPageTitle, color: 'text.secondary' }}>
        설정
      </Typography>
    </Box>
  )
}
