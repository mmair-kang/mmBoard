'use client'
// 수정: Auto — 2026-07-27 02:45 (내시경·초음파 공통 세그먼트)

import { EndoscopyWidget } from '@/components/health/EndoscopyWidget'
import { sxCardSubTabItem, sxCardSubTabItemTriple, sxCardSubTabTrack } from '@/components/home/cardTabStyles'
import type { HealthExamScopeId } from '@/lib/endoscopyTypes'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import { useState } from 'react'

type ScopeOption = { id: HealthExamScopeId; label: string }

type Props = {
  scopes: readonly ScopeOption[]
  defaultScope: HealthExamScopeId
}

export function ExamSectionTabContent({ scopes, defaultScope }: Props) {
  const [scope, setScope] = useState<HealthExamScopeId>(defaultScope)
  const compact = scopes.length >= 3

  return (
    <Stack spacing={1.25} sx={{ maxWidth: { md: 720 }, mx: { md: 'auto' }, width: '100%' }}>
      <Box sx={sxCardSubTabTrack()}>
        {scopes.map((item) => (
          <Box
            key={item.id}
            component="button"
            type="button"
            onClick={() => setScope(item.id)}
            sx={compact ? sxCardSubTabItemTriple(scope === item.id) : sxCardSubTabItem(scope === item.id)}
          >
            {item.label}
          </Box>
        ))}
      </Box>
      <EndoscopyWidget scope={scope} />
    </Stack>
  )
}
