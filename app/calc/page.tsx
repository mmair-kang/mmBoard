// 수정: Auto — 2026-06-15

import { DiscountCalculatorWidget } from '@/components/calc/DiscountCalculatorWidget'
import { sxPageScrollBody, sxPageStickyHeaderPad, sxPageTitle } from '@/config/responsiveLayout'
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
      <Box sx={{ ...sxPageStickyHeaderPad, pb: 0.75 }}>
        <Typography sx={sxPageTitle}>계산</Typography>
      </Box>
      <Box sx={sxPageScrollBody}>
        <Box sx={{ maxWidth: { md: 720 }, mx: { md: 'auto' }, width: '100%' }}>
          <DiscountCalculatorWidget />
        </Box>
      </Box>
    </Box>
  )
}
