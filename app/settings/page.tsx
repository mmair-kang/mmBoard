// 수정: Auto — 2026-06-05
'use client'

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
        px: 2,
      }}
    >
      <Typography color="text.secondary" sx={{ fontWeight: 600 }}>
        설정
      </Typography>
    </Box>
  )
}
