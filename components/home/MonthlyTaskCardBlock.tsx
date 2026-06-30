'use client'
// 수정: Auto — 2026-06-30 (세로 간격 컴팩트)

import { FreshAmountField } from '@/components/common/FreshAmountField'
import type { MonthlyTask, MonthlyTaskCardExtra } from '@/hooks/useMonthlyTasks'
import { calcCardNeededAmount, calcCardProgressBreakdown, formatWon } from '@/lib/monthlyTaskCardCalc'
import { formatMonthlyDayLabel, isMonthlyAnytimeDay } from '@/lib/monthlyDayLabel'
import { currentYearMonth } from '@/lib/monthlyTaskMonth'
import { formatRelativeDayKo } from '@/lib/relativeDayLabel'
import { inactiveSwitchRowBg } from '@/lib/widgetSurfaces'
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded'
import EditRoundedIcon from '@mui/icons-material/EditRounded'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Switch from '@mui/material/Switch'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { alpha, type Theme } from '@mui/material/styles'
import { useMemo, useState } from 'react'

function cardGreenSurface(theme: Theme) {
  return {
    borderColor: alpha(theme.palette.success.main, 0.22),
    bgcolor: alpha(theme.palette.success.main, theme.palette.mode === 'dark' ? 0.09 : 0.04),
  }
}

type Props = {
  item: MonthlyTask
  onEdit: () => void
  onProgressChange: (patch: { currentAmount?: number }) => Promise<void>
  onExtraProgressChange: (
    extra: MonthlyTaskCardExtra,
    patch: { checked?: boolean; switchOn?: boolean },
  ) => Promise<void>
}

function ExtraRow({
  extra,
  saving,
  onExtraProgressChange,
}: {
  extra: MonthlyTaskCardExtra
  saving: boolean
  onExtraProgressChange: Props['onExtraProgressChange']
}) {
  const handleSwitch = async (_: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
    await onExtraProgressChange(extra, { switchOn: checked })
  }

  const active = extra.switchOn
  const label = extra.title?.trim() || '결제'

  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={0.75}
      sx={{
        px: 0.85,
        py: 0.38,
        borderRadius: 1.25,
        bgcolor: (theme) =>
          active ? alpha(theme.palette.success.main, 0.08) : inactiveSwitchRowBg(theme),
        border: 1,
        borderColor: active ? 'success.light' : 'divider',
      }}
    >
      <Chip
        size="small"
        label={formatMonthlyDayLabel(extra.dayOfMonth)}
        sx={{ height: 20, minWidth: 36, fontWeight: 800, fontSize: '0.68rem', flexShrink: 0 }}
        variant="outlined"
        color="success"
      />

      <Typography
        sx={{
          flex: 1,
          minWidth: 0,
          fontWeight: 700,
          fontSize: '0.8rem',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {label}
      </Typography>

      <Typography
        sx={{
          fontWeight: 800,
          fontSize: '0.76rem',
          color: 'text.secondary',
          flexShrink: 0,
          whiteSpace: 'nowrap',
        }}
      >
        {formatWon(extra.amount)}
      </Typography>

      <Switch
        size="small"
        checked={extra.switchOn}
        onChange={handleSwitch}
        disabled={saving}
        color={extra.switchOn ? 'success' : 'default'}
        sx={{ flexShrink: 0 }}
      />
    </Stack>
  )
}

export function MonthlyTaskCardBlock({
  item,
  onEdit,
  onProgressChange,
  onExtraProgressChange,
}: Props) {
  const target = item.targetAmount ?? 0
  const calc = useMemo(
    () => calcCardNeededAmount(target, item.currentAmount, item.cardExtras),
    [target, item.currentAmount, item.cardExtras],
  )
  const progress = useMemo(
    () => calcCardProgressBreakdown(target, item.currentAmount, calc.totalDeduction),
    [target, item.currentAmount, calc.totalDeduction],
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

  const handleExtraChange: Props['onExtraProgressChange'] = async (extra, patch) => {
    setSaving(true)
    try {
      await onExtraProgressChange(extra, patch)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Box
      sx={{
        borderRadius: 2,
        border: 1,
        borderColor: fulfilled ? 'success.main' : 'divider',
        bgcolor: fulfilled ? (theme) => alpha(theme.palette.success.main, 0.04) : 'background.paper',
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
            }}
          >
            {item.title}
          </Typography>
          {fulfilled ? (
            <Chip
              size="small"
              icon={<CheckCircleRoundedIcon />}
              label="달성"
              color="success"
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

      <Box sx={{ px: 1.1, pb: item.cardExtras.length > 0 ? 0.55 : 0.75 }}>
        <Box
          sx={(theme) => ({
            borderRadius: 1.75,
            border: 1,
            px: 0.9,
            py: 0.55,
            ...cardGreenSurface(theme),
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
            <Typography variant="caption" sx={{ fontWeight: 800, fontSize: '0.66rem' }}>
              {formatWon(item.currentAmount)}
              {calc.totalDeduction > 0 ? ` + 예정 ${formatWon(calc.totalDeduction)}` : ''}
              {' / '}
              {formatWon(target)}
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
                bgcolor: fulfilled ? 'success.main' : 'primary.main',
                transition: 'width 0.25s ease',
              }}
            />
            {progress.scheduledPct > 0 ? (
              <Box
                sx={{
                  position: 'absolute',
                  left: `${progress.currentPct}%`,
                  top: 0,
                  bottom: 0,
                  width: `${progress.scheduledPct}%`,
                  bgcolor: (theme) =>
                    fulfilled ? alpha(theme.palette.success.main, 0.45) : alpha(theme.palette.info.main, 0.55),
                  transition: 'width 0.25s ease, left 0.25s ease',
                }}
              />
            ) : null}
          </Box>
          <FreshAmountField
            value={item.currentAmount}
            onCommit={commitAmount}
            disabled={saving}
            softInput="success"
            leadingLabel={amountUpdatedLabel}
            compact
          />
        </Box>
      </Box>

      {item.cardExtras.length > 0 ? (
        <Stack spacing={0.45} sx={{ px: 1.1, pb: 0.75 }}>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ fontWeight: 800, fontSize: '0.66rem', px: 0.15, lineHeight: 1.2 }}
          >
            카드 관리
          </Typography>
          {item.cardExtras.map((extra) => (
            <ExtraRow
              key={extra.id}
              extra={extra}
              saving={saving}
              onExtraProgressChange={handleExtraChange}
            />
          ))}
        </Stack>
      ) : null}
    </Box>
  )
}
