'use client'
// 수정: Auto — 2026-07-12 23:36

import { CardApplicationWidget } from '@/components/home/CardApplicationWidget'
import { MonthlyTaskWidget } from '@/components/home/MonthlyTaskWidget'
import {
  CARD_SUB_TABS,
  type CardSubTabId,
  sxCardSubTabItem,
  sxCardSubTabTrack,
} from '@/components/home/cardTabStyles'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import { useState } from 'react'

export function CardTabContent() {
  const [subTab, setSubTab] = useState<CardSubTabId>('performance')

  return (
    <Stack spacing={1.25}>
      <Box sx={sxCardSubTabTrack()}>
        {CARD_SUB_TABS.map((tab) => (
          <Box
            key={tab.id}
            component="button"
            type="button"
            onClick={() => setSubTab(tab.id)}
            sx={sxCardSubTabItem(subTab === tab.id)}
          >
            {tab.label}
          </Box>
        ))}
      </Box>
      {subTab === 'performance' ? <MonthlyTaskWidget /> : <CardApplicationWidget />}
    </Stack>
  )
}
