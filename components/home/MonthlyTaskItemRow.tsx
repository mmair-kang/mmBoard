'use client'
// 수정: Auto — 2026-06-08

import { MonthlyTaskCardBlock } from '@/components/home/MonthlyTaskCardBlock'
import type { MonthlyTask, MonthlyTaskCardExtra } from '@/hooks/useMonthlyTasks'
import { formatMonthlyDayLabel, isMonthlyAnytimeDay } from '@/lib/monthlyDayLabel'
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import Switch from '@mui/material/Switch'
import Typography from '@mui/material/Typography'
import { alpha } from '@mui/material/styles'
import { useState } from 'react'

type Props = {
  item: MonthlyTask
  onEdit: () => void
  onProgressChange: (patch: { currentAmount?: number; switchOn?: boolean }) => Promise<void>
  onExtraProgressChange: (
    extra: MonthlyTaskCardExtra,
    patch: { checked?: boolean; switchOn?: boolean },
  ) => Promise<void>
}

export function MonthlyTaskItemRow({
  item,
  onEdit,
  onProgressChange,
  onExtraProgressChange,
}: Props) {
  if (item.optionType === 'card_target') {
    return (
      <MonthlyTaskCardBlock
        item={item}
        onEdit={onEdit}
        onProgressChange={onProgressChange}
        onExtraProgressChange={onExtraProgressChange}
      />
    )
  }

  return <SwitchTaskRow item={item} onEdit={onEdit} onProgressChange={onProgressChange} />
}

function SwitchTaskRow({
  item,
  onEdit,
  onProgressChange,
}: {
  item: MonthlyTask
  onEdit: () => void
  onProgressChange: Props['onProgressChange']
}) {
  const achieved = item.switchOn
  const [saving, setSaving] = useState(false)

  const handleSwitch = async (_: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
    setSaving(true)
    try {
      await onProgressChange({ switchOn: checked })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={1}
      sx={{
        px: 1.25,
        py: 1,
        borderRadius: 2,
        border: 1,
        borderColor: achieved ? 'success.main' : 'divider',
        bgcolor: achieved ? (theme) => alpha(theme.palette.success.main, 0.06) : 'background.paper',
      }}
    >
      {!isMonthlyAnytimeDay(item.dayOfMonth) ? (
        <Chip
          size="small"
          label={formatMonthlyDayLabel(item.dayOfMonth)}
          sx={{ height: 22, fontWeight: 800, fontSize: '0.72rem', flexShrink: 0 }}
          variant="outlined"
          color="primary"
        />
      ) : null}

      <Box onClick={onEdit} sx={{ flex: 1, minWidth: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 0.5 }}>
        {achieved ? <CheckCircleRoundedIcon sx={{ fontSize: 18, color: 'success.main' }} /> : null}
        <Typography
          sx={{
            fontWeight: 700,
            fontSize: '0.92rem',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            color: achieved ? 'success.dark' : 'text.primary',
          }}
        >
          {item.title}
        </Typography>
      </Box>

      <Box sx={{ flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
        <Switch
          checked={item.switchOn}
          onChange={handleSwitch}
          disabled={saving}
          color={item.switchOn ? 'success' : 'default'}
          inputProps={{ 'aria-label': `${item.title} 완료` }}
        />
      </Box>
    </Stack>
  )
}
