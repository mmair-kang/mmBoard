'use client'
// 수정: Auto — 2026-07-27 02:51 (치과 탭)
// 수정: Auto — 2026-07-27 02:45 (초음파 탭)
// 수정: Auto — 2026-07-27 01:56

import { CheckupWidget } from '@/components/health/CheckupWidget'
import { DentalTabContent } from '@/components/health/DentalTabContent'
import { EndoscopyTabContent } from '@/components/health/EndoscopyTabContent'
import { UltrasoundTabContent } from '@/components/health/UltrasoundTabContent'
import { sxPageScrollBody } from '@/config/responsiveLayout'
import { HEALTH_TAB_IDS, HEALTH_TAB_LABELS, type HealthTabId } from '@/lib/healthTabOrder'
import Box from '@mui/material/Box'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import { useState } from 'react'

function renderTabPanel(tab: HealthTabId) {
  switch (tab) {
    case 'checkup':
      return <CheckupWidget />
    case 'endoscopy':
      return <EndoscopyTabContent />
    case 'ultrasound':
      return <UltrasoundTabContent />
    case 'dental':
      return <DentalTabContent />
    default:
      return null
  }
}

export function HealthPageContent() {
  const [tab, setTab] = useState<HealthTabId>('checkup')

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      <Box
        sx={{
          flexShrink: 0,
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <Tabs
          value={tab}
          onChange={(_, value: HealthTabId) => setTab(value)}
          variant="fullWidth"
          sx={{
            width: '100%',
            minWidth: 0,
            minHeight: { xs: 34, sm: 36, md: 40 },
            '& .MuiTabs-scroller': { overflow: 'hidden !important' },
            '& .MuiTabs-flexContainer': { width: '100%', minHeight: { xs: 34, sm: 36, md: 40 } },
            '& .MuiTab-root': {
              flex: '1 1 0',
              minWidth: 0,
              maxWidth: 'none',
              fontWeight: 800,
              fontSize: { xs: '0.72rem', sm: '0.82rem', md: '0.95rem', lg: '1rem' },
              minHeight: { xs: 34, sm: 36, md: 40 },
              px: { xs: 0.1, sm: 0.4, md: 0.85 },
              py: { xs: 0.45, md: 0.5 },
              lineHeight: 1.2,
              whiteSpace: 'nowrap',
            },
          }}
        >
          {HEALTH_TAB_IDS.map((id) => (
            <Tab key={id} value={id} label={HEALTH_TAB_LABELS[id]} />
          ))}
        </Tabs>
      </Box>

      <Box sx={sxPageScrollBody}>{renderTabPanel(tab)}</Box>
    </Box>
  )
}
