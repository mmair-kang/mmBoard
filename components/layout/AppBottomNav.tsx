'use client'
// 수정: Auto — 2026-08-19 15:40 (PC도 모바일과 동일한 타이포)
// 수정: Auto — 2026-07-27 01:56 (계산 제거·건강 추가)
// 수정: Auto — 2026-06-15 (PC 하단 네비·반응형)

import { sxBottomNavBar, sxBottomNavInner } from '@/config/responsiveLayout'
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded'
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
    if (pathname === '/shopping' || pathname === '/collection') return 2
    if (pathname === '/health' || pathname.startsWith('/health/')) return 1
    return 0
  })()

  return (
    <Paper sx={sxBottomNavBar} elevation={8}>
      <Box sx={sxBottomNavInner}>
        <BottomNavigation
          value={tab}
          showLabels
          sx={{
            height: 56,
            bgcolor: 'transparent',
            '& .MuiSvgIcon-root': {
              fontSize: '1.5rem',
            },
          }}
        >
          <BottomNavigationAction label="관리" icon={<HomeRoundedIcon />} component={Link} href="/" />
          <BottomNavigationAction
            label="건강"
            icon={<FavoriteRoundedIcon />}
            component={Link}
            href="/health"
          />
          <BottomNavigationAction
            label="쇼핑"
            icon={<ShoppingCartRoundedIcon />}
            component={Link}
            href="/shopping"
          />
          <BottomNavigationAction label="설정" icon={<SettingsRoundedIcon />} component={Link} href="/settings" />
        </BottomNavigation>
      </Box>
    </Paper>
  )
}
