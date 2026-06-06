'use client'
// 수정: Auto — 2026-06-05 (소장으로 통합)

import CollectionsBookmarkRoundedIcon from '@mui/icons-material/CollectionsBookmarkRounded'
import HomeRoundedIcon from '@mui/icons-material/HomeRounded'
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded'
import BottomNavigation from '@mui/material/BottomNavigation'
import BottomNavigationAction from '@mui/material/BottomNavigationAction'
import Paper from '@mui/material/Paper'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function AppBottomNav() {
  const pathname = usePathname()

  const tab: number | false = (() => {
    if (pathname === '/settings') return 2
    if (pathname === '/collection') return 1
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
      }}
      elevation={8}
    >
      <BottomNavigation value={tab} showLabels>
        <BottomNavigationAction label="홈" icon={<HomeRoundedIcon />} component={Link} href="/" />
        <BottomNavigationAction
          label="소장"
          icon={<CollectionsBookmarkRoundedIcon />}
          component={Link}
          href="/collection"
        />
        <BottomNavigationAction label="설정" icon={<SettingsRoundedIcon />} component={Link} href="/settings" />
      </BottomNavigation>
    </Paper>
  )
}
