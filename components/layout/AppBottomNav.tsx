'use client'
// 수정: Auto — 2026-06-15 (PC 하단 네비·반응형)

import { sxBottomNavInner } from '@/config/responsiveLayout'
import CalculateRoundedIcon from '@mui/icons-material/CalculateRounded'
import HomeRoundedIcon from '@mui/icons-material/HomeRounded'
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded'
import ShoppingCartRoundedIcon from '@mui/icons-material/ShoppingCartRounded'
import BottomNavigation from '@mui/material/BottomNavigation'
import BottomNavigationAction from '@mui/material/BottomNavigationAction'
import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function AppBottomNav() {
  const pathname = usePathname()

  const tab: number | false = (() => {
    if (pathname === '/settings') return 3
    if (pathname === '/calc') return 2
    if (pathname === '/shopping' || pathname === '/collection') return 1
    return 0
  })()

  return (
    <Paper
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: (theme) => theme.zIndex.appBar,
        borderTop: 1,
        borderColor: 'divider',
        bgcolor: { md: 'background.paper' },
      }}
      elevation={8}
    >
      <Box sx={sxBottomNavInner}>
        <BottomNavigation
          value={tab}
          showLabels
          sx={{
            height: { xs: 56, md: 64 },
            bgcolor: 'transparent',
            '& .MuiSvgIcon-root': {
              fontSize: { xs: '1.5rem', md: '1.65rem' },
            },
          }}
        >
          <BottomNavigationAction label="관리" icon={<HomeRoundedIcon />} component={Link} href="/" />
          <BottomNavigationAction
            label="쇼핑"
            icon={<ShoppingCartRoundedIcon />}
            component={Link}
            href="/shopping"
          />
          <BottomNavigationAction label="계산" icon={<CalculateRoundedIcon />} component={Link} href="/calc" />
          <BottomNavigationAction label="설정" icon={<SettingsRoundedIcon />} component={Link} href="/settings" />
        </BottomNavigation>
      </Box>
    </Paper>
  )
}
