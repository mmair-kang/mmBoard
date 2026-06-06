'use client'
// 수정: Auto — 2026-06-05

import { CircleProgress360 } from '@/components/charts/CircleProgress360'
import type { DdayItem } from '@/hooks/useDdayItems'
import {
  calcCycleDays,
  calcDaysRemaining,
  calcNextVisitDate,
  calcProgressFilled,
  formatNextVisitLabel,
} from '@/lib/ddaySchedule'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import { alpha } from '@mui/material/styles'

type Props = {
  item: DdayItem
  color: string
  onClick: () => void
}

export function DdayItemCard({ item, color, onClick }: Props) {
  const nextVisit = calcNextVisitDate(item.lastVisitDate, item.intervalValue, item.intervalUnit)
  const nextVisitIso = nextVisit.format('YYYY-MM-DD')
  const total = calcCycleDays(item.lastVisitDate, nextVisitIso)
  const filled = calcProgressFilled(item.lastVisitDate, nextVisitIso)
  const daysRemaining = calcDaysRemaining(nextVisitIso)
  const nextLabel = formatNextVisitLabel(nextVisitIso)

  return (
    <Paper
      variant="outlined"
      onClick={onClick}
      sx={{
        aspectRatio: '1',
        p: 1,
        borderRadius: 2,
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
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
      <CircleProgress360
        total={total}
        filled={filled}
        centerValue={daysRemaining}
        barColor={color}
        trackColor={alpha(color, 0.12)}
        numberColor="#0f172a"
      />
      <Typography
        sx={{
          mt: 0.5,
          fontSize: '0.82rem',
          fontWeight: 700,
          lineHeight: 1.2,
          textAlign: 'center',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          width: '100%',
          px: 0.25,
        }}
      >
        {item.name}
      </Typography>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ mt: 0.2, fontSize: '0.68rem', fontWeight: 600, lineHeight: 1.2 }}
      >
        {nextLabel}
      </Typography>
    </Paper>
  )
}
