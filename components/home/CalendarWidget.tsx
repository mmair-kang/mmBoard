'use client'
// 수정: Auto — 2026-07-19 14:35 (달력 세로 간격 축소)
// 수정: Auto — 2026-07-19 14:30 (할일 연동 달력)

import { useTodos } from '@/hooks/useTodos'
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded'
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { alpha } from '@mui/material/styles'
import dayjs, { type Dayjs } from 'dayjs'
import { useMemo, useState } from 'react'

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'] as const

type CalendarCell = {
  date: Dayjs
  inMonth: boolean
  iso: string
}

function buildMonthCells(month: Dayjs): CalendarCell[] {
  const start = month.startOf('month')
  const end = month.endOf('month')
  const gridStart = start.startOf('week') // Sunday
  const gridEnd = end.endOf('week')
  const cells: CalendarCell[] = []
  let cursor = gridStart
  while (cursor.isBefore(gridEnd) || cursor.isSame(gridEnd, 'day')) {
    cells.push({
      date: cursor,
      inMonth: cursor.month() === month.month(),
      iso: cursor.format('YYYY-MM-DD'),
    })
    cursor = cursor.add(1, 'day')
  }
  return cells
}

export function CalendarWidget() {
  const { items } = useTodos()
  const today = dayjs().startOf('day')
  const [month, setMonth] = useState(() => today.startOf('month'))

  const todoDates = useMemo(() => {
    const counts = new Map<string, number>()
    for (const item of items) {
      if (!item.dueDate) continue
      counts.set(item.dueDate, (counts.get(item.dueDate) ?? 0) + 1)
    }
    return counts
  }, [items])

  const cells = useMemo(() => buildMonthCells(month), [month])
  const isCurrentMonth = month.isSame(today, 'month')

  return (
    <Paper
      variant="outlined"
      sx={{
        borderRadius: 2.5,
        overflow: 'hidden',
        borderColor: 'divider',
        boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
        width: '100%',
        minWidth: 0,
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ px: 0.5, py: 0.2, borderBottom: 1, borderColor: 'divider', minHeight: 34 }}
      >
        <IconButton
          size="small"
          aria-label="이전 달"
          onClick={() => setMonth((prev) => prev.subtract(1, 'month').startOf('month'))}
          sx={{ color: 'text.secondary', p: 0.35 }}
        >
          <ChevronLeftRoundedIcon fontSize="small" />
        </IconButton>

        <Stack direction="row" alignItems="baseline" spacing={0.75}>
          <Typography sx={{ fontWeight: 800, fontSize: '0.9rem', letterSpacing: '-0.02em' }}>
            {month.format('YYYY년 M월')}
          </Typography>
          {!isCurrentMonth ? (
            <Typography
              component="button"
              type="button"
              onClick={() => setMonth(today.startOf('month'))}
              sx={{
                border: 0,
                p: 0,
                m: 0,
                bgcolor: 'transparent',
                cursor: 'pointer',
                font: 'inherit',
                fontSize: '0.64rem',
                fontWeight: 800,
                color: 'primary.main',
                textDecoration: 'underline',
                textUnderlineOffset: 2,
              }}
            >
              오늘
            </Typography>
          ) : null}
        </Stack>

        <IconButton
          size="small"
          aria-label="다음 달"
          onClick={() => setMonth((prev) => prev.add(1, 'month').startOf('month'))}
          sx={{ color: 'text.secondary', p: 0.35 }}
        >
          <ChevronRightRoundedIcon fontSize="small" />
        </IconButton>
      </Stack>

      <Box sx={{ px: 0.75, pt: 0.35, pb: 0.5 }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            mb: 0.1,
          }}
        >
          {WEEKDAYS.map((label, index) => (
            <Typography
              key={label}
              sx={{
                textAlign: 'center',
                fontSize: '0.62rem',
                fontWeight: 800,
                py: 0.1,
                lineHeight: 1.2,
                color:
                  index === 0 ? 'error.main' : index === 6 ? 'info.main' : 'text.secondary',
                opacity: 0.85,
              }}
            >
              {label}
            </Typography>
          ))}
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            rowGap: 0,
          }}
        >
          {cells.map((cell) => {
            const weekday = cell.date.day()
            const isToday = cell.iso === today.format('YYYY-MM-DD')
            const todoCount = todoDates.get(cell.iso) ?? 0
            const hasTodo = todoCount > 0

            let dayColor: string = 'text.primary'
            if (!cell.inMonth) dayColor = 'text.disabled'
            else if (weekday === 0) dayColor = 'error.main'
            else if (weekday === 6) dayColor = 'info.main'

            return (
              <Box
                key={cell.iso}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: 28,
                  py: 0,
                  opacity: cell.inMonth ? 1 : 0.42,
                }}
              >
                <Box
                  sx={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: isToday
                      ? (theme) => theme.palette.primary.main
                      : 'transparent',
                    boxShadow: isToday
                      ? (theme) => `0 0 0 2px ${alpha(theme.palette.primary.main, 0.16)}`
                      : 'none',
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: '0.72rem',
                      fontWeight: isToday ? 900 : cell.inMonth ? 700 : 500,
                      lineHeight: 1,
                      color: isToday ? 'primary.contrastText' : dayColor,
                    }}
                  >
                    {cell.date.date()}
                  </Typography>
                </Box>

                <Box
                  sx={{
                    mt: 0,
                    height: 5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 0.15,
                  }}
                >
                  {hasTodo ? (
                    todoCount >= 3 ? (
                      <Typography
                        sx={{
                          fontSize: '0.48rem',
                          fontWeight: 900,
                          color: 'primary.main',
                          lineHeight: 1,
                          letterSpacing: '-0.02em',
                        }}
                      >
                        {todoCount}
                      </Typography>
                    ) : (
                      Array.from({ length: Math.min(todoCount, 2) }).map((_, i) => (
                        <Box
                          key={i}
                          sx={{
                            width: 3.5,
                            height: 3.5,
                            borderRadius: '50%',
                            bgcolor: 'primary.main',
                          }}
                        />
                      ))
                    )
                  ) : null}
                </Box>
              </Box>
            )
          })}
        </Box>
      </Box>
    </Paper>
  )
}
