'use client'
// 수정: Auto — 2026-06-08 (헤더·필요금액 1줄 레이아웃)

import { FreshAmountField } from '@/components/common/FreshAmountField'
import type { MonthlyTask, MonthlyTaskCardExtra } from '@/hooks/useMonthlyTasks'
import { calcCardNeededAmount, calcCardProgressBreakdown, formatWon } from '@/lib/monthlyTaskCardCalc'
import { formatMonthlyDayLabel, isMonthlyAnytimeDay } from '@/lib/monthlyDayLabel'
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded'
import EditRoundedIcon from '@mui/icons-material/EditRounded'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Switch from '@mui/material/Switch'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { alpha } from '@mui/material/styles'
import { useMemo, useState } from 'react'

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
        px: 1,
        py: 0.55,
        borderRadius: 1.5,
        bgcolor: (theme) =>
          active ? alpha(theme.palette.success.main, 0.08) : alpha(theme.palette.action.hover, 0.04),
        border: 1,
        borderColor: active ? 'success.light' : 'divider',
      }}
    >
      <Chip
        size="small"
        label={formatMonthlyDayLabel(extra.dayOfMonth)}
        sx={{ height: 22, minWidth: 40, fontWeight: 800, fontSize: '0.72rem', flexShrink: 0 }}
        variant="outlined"
        color="primary"
      />

      <Typography
        sx={{
          flex: 1,
          minWidth: 0,
          fontWeight: 700,
          fontSize: '0.84rem',
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
          fontSize: '0.8rem',
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
        sx={{ px: 1.25, pt: 1.1, pb: 0.75 }}
      >
        {!isMonthlyAnytimeDay(item.dayOfMonth) ? (
          <Chip
            size="small"
            label={formatMonthlyDayLabel(item.dayOfMonth)}
            sx={{ height: 22, fontWeight: 800, fontSize: '0.72rem', flexShrink: 0 }}
            color="primary"
            variant="outlined"
          />
        ) : null}
        <Stack direction="row" alignItems="center" spacing={0.5} sx={{ minWidth: 0, flex: 1 }}>
          <Typography
            sx={{
              fontWeight: 800,
              fontSize: '0.95rem',
              lineHeight: 1.25,
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
              sx={{ height: 22, fontWeight: 800, fontSize: '0.72rem', flexShrink: 0 }}
            />
          ) : null}
        </Stack>
        <Tooltip title="카드 설정 수정">
          <IconButton size="small" onClick={onEdit} aria-label="수정" sx={{ flexShrink: 0 }}>
            <EditRoundedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Stack>

      <Box sx={{ px: 1.25, pb: 0.75 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="baseline" sx={{ mb: 0.4 }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
            현재 실적
          </Typography>
          <Typography variant="caption" sx={{ fontWeight: 800 }}>
            {formatWon(item.currentAmount)}
            {calc.totalDeduction > 0 ? ` + 예정 ${formatWon(calc.totalDeduction)}` : ''}
            {' / '}
            {formatWon(target)}
          </Typography>
        </Stack>
        <Box
          sx={{
            position: 'relative',
            height: 7,
            borderRadius: 99,
            bgcolor: (theme) => alpha(theme.palette.action.active, 0.12),
            overflow: 'hidden',
            mb: 1,
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
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{
            px: 1.1,
            py: 0.65,
            borderRadius: 1.75,
            bgcolor: (theme) =>
              calc.needed === 0 && target > 0
                ? alpha(theme.palette.success.main, 0.1)
                : alpha(theme.palette.primary.main, 0.06),
            border: 1,
            borderColor: calc.needed === 0 && target > 0 ? 'success.light' : 'primary.light',
          }}
        >
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
            필요 금액
          </Typography>
          <Typography
            sx={{
              fontWeight: 900,
              fontSize: '0.95rem',
              lineHeight: 1.2,
              color: calc.needed === 0 && target > 0 ? 'success.dark' : 'primary.dark',
            }}
          >
            {calc.needed === 0 && target > 0 ? '충족' : formatWon(calc.needed)}
          </Typography>
        </Stack>
      </Box>

      {item.cardExtras.length > 0 ? (
        <Stack spacing={0.75} sx={{ px: 1.25, pb: 1 }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800, px: 0.25 }}>
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

      <Box
        sx={{
          px: 1.25,
          py: 1,
          borderTop: 1,
          borderColor: 'divider',
          bgcolor: (theme) => alpha(theme.palette.action.hover, 0.03),
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <FreshAmountField
          label="현재 실적 입력"
          value={item.currentAmount}
          onCommit={commitAmount}
          disabled={saving}
        />
      </Box>
    </Box>
  )
}
