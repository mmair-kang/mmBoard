'use client'
// 수정: Auto — 2026-06-11

import { CircleProgress360 } from '@/components/charts/CircleProgress360'
import type { DdayItem } from '@/hooks/useDdayItems'
import {
  calcCycleDays,
  calcDaysRemaining,
  calcNextVisitDate,
  calcProgressFilled,
  formatNextVisitCompact,
} from '@/lib/ddaySchedule'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import { alpha } from '@mui/material/styles'

type Props = {
  item: DdayItem
  color: string
  onClick: () => void
}

const PROGRESS_SIZE = 58

export function DdayItemCard({ item, color, onClick }: Props) {
  const nextVisit = calcNextVisitDate(item.lastVisitDate, item.intervalValue, item.intervalUnit)
  const nextVisitIso = nextVisit.format('YYYY-MM-DD')
  const total = calcCycleDays(item.lastVisitDate, nextVisitIso)
  const filled = calcProgressFilled(item.lastVisitDate, nextVisitIso)
  const daysRemaining = calcDaysRemaining(nextVisitIso)
  const nextLabel = formatNextVisitCompact(nextVisitIso)

  return (
    <Paper
      variant="outlined"
      onClick={onClick}
      sx={{
        p: 0.45,
        borderRadius: 1.5,
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        borderColor: alpha(color, 0.28),
        bgcolor: 'background.paper',
        transition: 'border-color 0.15s ease, box-shadow 0.15s ease, transform 0.1s ease',
        '&:hover': {
          borderColor: alpha(color, 0.5),
          boxShadow: `0 2px 8px ${alpha(color, 0.12)}`,
        },
        '&:active': {
          transform: 'scale(0.98)',
        },
      }}
    >
      <Typography
        sx={{
          mb: 0.15,
          fontSize: '0.68rem',
          fontWeight: 800,
          lineHeight: 1.15,
          textAlign: 'center',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          width: '100%',
          px: 0.15,
        }}
      >
        {item.name}
      </Typography>
      <CircleProgress360
        total={total}
        filled={filled}
        centerValue={daysRemaining}
        sublabel={nextLabel}
        barColor={color}
        trackColor={alpha(color, 0.12)}
        numberColor="#0f172a"
        size={PROGRESS_SIZE}
      />
    </Paper>
  )
}
