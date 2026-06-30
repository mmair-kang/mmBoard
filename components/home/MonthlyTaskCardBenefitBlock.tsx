'use client'
// 수정: Auto — 2026-06-30 (세로 간격 컴팩트)

import { FreshAmountField } from '@/components/common/FreshAmountField'
import type { MonthlyTask } from '@/hooks/useMonthlyTasks'
import { calcCardProgressBreakdown, formatWon } from '@/lib/monthlyTaskCardCalc'
import { formatMonthlyDayLabel, isMonthlyAnytimeDay } from '@/lib/monthlyDayLabel'
import { currentYearMonth } from '@/lib/monthlyTaskMonth'
import { formatRelativeDayKo } from '@/lib/relativeDayLabel'
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded'
import EditRoundedIcon from '@mui/icons-material/EditRounded'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { alpha, type Theme } from '@mui/material/styles'
import { useMemo, useState } from 'react'

function cardBlueSurface(theme: Theme) {
  return {
    borderColor: alpha(theme.palette.primary.main, 0.22),
    bgcolor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.09 : 0.04),
  }
}

type Props = {
  item: MonthlyTask
  onEdit: () => void
  onProgressChange: (patch: { currentAmount?: number }) => Promise<void>
}

export function MonthlyTaskCardBenefitBlock({ item, onEdit, onProgressChange }: Props) {
  const benefit = item.targetAmount ?? 0
  const progress = useMemo(
    () => calcCardProgressBreakdown(benefit, item.currentAmount, 0),
    [benefit, item.currentAmount],
  )
  const fulfilled = progress.fulfilled
  const amountUpdatedLabel = useMemo(() => {
    if (item.progressMonth !== currentYearMonth()) return null
    return formatRelativeDayKo(item.currentAmountUpdatedAt)
  }, [item.progressMonth, item.currentAmountUpdatedAt])

  const [saving, setSaving] = useState(false)

  const commitAmount = async (parsed: number) => {
    if (parsed < 0) return
    setSaving(true)
    try {
      await onProgressChange({ currentAmount: parsed })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Box
      sx={{
        borderRadius: 2,
        border: 1,
        borderColor: fulfilled ? 'primary.main' : 'divider',
        bgcolor: fulfilled ? (theme) => alpha(theme.palette.primary.main, 0.04) : 'background.paper',
        overflow: 'hidden',
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        spacing={0.75}
        sx={{ px: 1.1, pt: 0.8, pb: 0.45 }}
      >
        {!isMonthlyAnytimeDay(item.dayOfMonth) ? (
          <Chip
            size="small"
            label={formatMonthlyDayLabel(item.dayOfMonth)}
            sx={{ height: 20, fontWeight: 800, fontSize: '0.68rem', flexShrink: 0 }}
            color="primary"
            variant="outlined"
          />
        ) : null}
        <Stack direction="row" alignItems="center" spacing={0.5} sx={{ minWidth: 0, flex: 1 }}>
          <Typography
            sx={{
              fontWeight: 800,
              fontSize: '0.9rem',
              lineHeight: 1.2,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              minWidth: 0,
              color: 'primary.dark',
            }}
          >
            {item.title}
          </Typography>
          {fulfilled ? (
            <Chip
              size="small"
              icon={<CheckCircleRoundedIcon />}
              label="달성"
              color="primary"
              sx={{ height: 20, fontWeight: 800, fontSize: '0.68rem', flexShrink: 0 }}
            />
          ) : null}
        </Stack>
        <Tooltip title="카드 설정 수정">
          <IconButton size="small" onClick={onEdit} aria-label="수정" sx={{ flexShrink: 0, p: 0.45 }}>
            <EditRoundedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Stack>

      <Box sx={{ px: 1.1, pb: 0.75 }}>
        <Box
          sx={(theme) => ({
            borderRadius: 1.75,
            border: 1,
            px: 0.9,
            py: 0.55,
            ...cardBlueSurface(theme),
          })}
        >
          <Stack direction="row" justifyContent="space-between" alignItems="baseline" sx={{ mb: 0.2 }}>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontWeight: 700, fontSize: '0.66rem' }}
            >
              현재 실적
            </Typography>
            <Typography
              variant="caption"
              sx={{ fontWeight: 800, fontSize: '0.66rem', color: 'primary.dark' }}
            >
              {formatWon(item.currentAmount)}
              {' / '}
              {formatWon(benefit)}
            </Typography>
          </Stack>
          <Box
            sx={{
              position: 'relative',
              height: 5,
              borderRadius: 99,
              bgcolor: (theme) => alpha(theme.palette.action.active, 0.12),
              overflow: 'hidden',
              mb: 0.45,
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: 0,
                width: `${progress.currentPct}%`,
                bgcolor: fulfilled ? 'primary.main' : 'primary.light',
                transition: 'width 0.25s ease',
              }}
            />
          </Box>
          <FreshAmountField
            value={item.currentAmount}
            onCommit={commitAmount}
            disabled={saving}
            softInput="primary"
            leadingLabel={amountUpdatedLabel}
            compact
          />
        </Box>
      </Box>
    </Box>
  )
}
