// 수정: Auto — 2026-06-08

import { DiscountCalculatorWidget } from '@/components/calc/DiscountCalculatorWidget'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

export default function CalcPage() {
  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
        overflow: 'hidden',
      }}
    >
      <Box sx={{ flexShrink: 0, px: { xs: 1, sm: 1.5 }, pt: 1.25, pb: 0.75 }}>
        <Typography sx={{ fontWeight: 900, fontSize: '1.05rem' }}>계산</Typography>
      </Box>
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          minWidth: 0,
          overflowY: 'auto',
          overflowX: 'hidden',
          WebkitOverflowScrolling: 'touch',
          px: { xs: 1, sm: 1.5 },
          pb: 2.5,
        }}
      >
        <DiscountCalculatorWidget />
      </Box>
    </Box>
  )
}
