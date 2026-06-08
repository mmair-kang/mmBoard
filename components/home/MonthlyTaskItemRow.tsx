'use client'
// 수정: Auto — 2026-06-08

import type { MonthlyTask } from '@/hooks/useMonthlyTasks'
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded'
import Box from '@mui/material/Box'
import InputAdornment from '@mui/material/InputAdornment'
import Stack from '@mui/material/Stack'
import Switch from '@mui/material/Switch'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { alpha } from '@mui/material/styles'
import { useEffect, useState } from 'react'

type Props = {
  item: MonthlyTask
  onEdit: () => void
  onProgressChange: (patch: { currentAmount?: number; switchOn?: boolean }) => Promise<void>
}

function formatWon(value: number): string {
  return `${value.toLocaleString('ko-KR')}원`
}

export function MonthlyTaskItemRow({ item, onEdit, onProgressChange }: Props) {
  const isCardTarget = item.optionType === 'card_target'
  const target = item.targetAmount ?? 0
  const achieved = isCardTarget && target > 0 && item.currentAmount >= target

  const [amountInput, setAmountInput] = useState(String(item.currentAmount))
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setAmountInput(String(item.currentAmount))
  }, [item.currentAmount])

  const commitAmount = async () => {
    const parsed = Math.round(Number(amountInput.replace(/,/g, '')))
    if (!Number.isFinite(parsed) || parsed < 0) {
      setAmountInput(String(item.currentAmount))
      return
    }
    if (parsed === item.currentAmount) return
    setSaving(true)
    try {
      await onProgressChange({ currentAmount: parsed })
    } finally {
      setSaving(false)
    }
  }

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
        transition: 'border-color 0.15s ease, background-color 0.15s ease',
      }}
    >
      <Box
        sx={{
          minWidth: 40,
          textAlign: 'center',
          flexShrink: 0,
        }}
      >
        {item.dayOfMonth != null ? (
          <Typography sx={{ fontWeight: 800, fontSize: '0.9rem', color: 'primary.main', lineHeight: 1.2 }}>
            {item.dayOfMonth}일
          </Typography>
        ) : (
          <Typography
            variant="caption"
            sx={{ fontWeight: 700, color: 'text.secondary', lineHeight: 1.2, display: 'block' }}
          >
            이번달
          </Typography>
        )}
      </Box>

      <Box
        onClick={onEdit}
        sx={{
          flex: 1,
          minWidth: 0,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
        }}
      >
        {achieved ? (
          <CheckCircleRoundedIcon sx={{ fontSize: 18, color: 'success.main', flexShrink: 0 }} />
        ) : null}
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
        {isCardTarget ? (
          <TextField
            size="small"
            value={amountInput}
            onChange={(e) => setAmountInput(e.target.value.replace(/[^\d]/g, ''))}
            onBlur={() => void commitAmount()}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                void commitAmount()
              }
            }}
            disabled={saving}
            inputProps={{ inputMode: 'numeric', style: { textAlign: 'right', width: 72, fontSize: '0.82rem' } }}
            InputProps={{
              endAdornment: <InputAdornment position="end">원</InputAdornment>,
            }}
            sx={{ width: 130 }}
            helperText={
              target > 0 ? (
                <Typography
                  component="span"
                  variant="caption"
                  sx={{
                    fontWeight: 700,
                    color: achieved ? 'success.main' : 'text.secondary',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {achieved ? '목표 달성!' : `목표 ${formatWon(target)}`}
                </Typography>
              ) : undefined
            }
            FormHelperTextProps={{ sx: { mx: 0, mt: 0.25, textAlign: 'right' } }}
          />
        ) : (
          <Switch
            checked={item.switchOn}
            onChange={handleSwitch}
            disabled={saving}
            color={item.switchOn ? 'success' : 'default'}
            inputProps={{ 'aria-label': `${item.title} 완료` }}
          />
        )}
      </Box>
    </Stack>
  )
}
