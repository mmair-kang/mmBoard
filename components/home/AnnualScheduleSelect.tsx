'use client'
// 수정: Auto — 2026-06-08

import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'

const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1)
const REGULAR_DAYS = Array.from({ length: 30 }, (_, i) => i + 1)

export const ANNUAL_DAY_MONTH_ONLY = 'month-only' as const

type MonthProps = {
  labelId: string
  value: number
  onChange: (month: number) => void
  fullWidth?: boolean
}

export function AnnualMonthSelect({ labelId, value, onChange, fullWidth }: MonthProps) {
  return (
    <FormControl size="small" margin="dense" fullWidth={fullWidth} sx={{ minWidth: 88 }}>
      <InputLabel id={labelId}>월</InputLabel>
      <Select labelId={labelId} label="월" value={String(value)} onChange={(e) => onChange(Number(e.target.value))}>
        {MONTHS.map((month) => (
          <MenuItem key={month} value={String(month)} dense>
            {month}월
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  )
}

type DayModeProps = {
  labelId: string
  dayOfMonth: number | null
  onChange: (dayOfMonth: number | null) => void
  fullWidth?: boolean
}

export function AnnualDayModeSelect({ labelId, dayOfMonth, onChange, fullWidth }: DayModeProps) {
  const value = dayOfMonth == null ? ANNUAL_DAY_MONTH_ONLY : String(dayOfMonth)

  return (
    <FormControl size="small" margin="dense" fullWidth={fullWidth} sx={{ minWidth: 100 }}>
      <InputLabel id={labelId}>일정</InputLabel>
      <Select
        labelId={labelId}
        label="일정"
        value={value}
        onChange={(e) => {
          const v = e.target.value
          if (v === ANNUAL_DAY_MONTH_ONLY) {
            onChange(null)
            return
          }
          onChange(Math.round(Number(v)))
        }}
      >
        <MenuItem value={ANNUAL_DAY_MONTH_ONLY} dense>
          해당 월
        </MenuItem>
        {REGULAR_DAYS.map((day) => (
          <MenuItem key={day} value={String(day)} dense>
            {day}일
          </MenuItem>
        ))}
        <MenuItem value="31" dense>
          말일
        </MenuItem>
      </Select>
    </FormControl>
  )
}
