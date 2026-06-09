'use client'
// 수정: Auto — 2026-06-08

import {
  MONTHLY_DAY_SELECT_ANYTIME,
  monthlyDayFromSelectValue,
  monthlyDayToSelectValue,
} from '@/lib/monthlyDayLabel'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'

type Props = {
  labelId: string
  label: string
  value: number | null
  onChange: (day: number | null) => void
  includeAnytime?: boolean
  size?: 'small' | 'medium'
  minWidth?: number
  fullWidth?: boolean
}

const REGULAR_DAYS = Array.from({ length: 30 }, (_, i) => i + 1)

export function MonthlyDaySelect({
  labelId,
  label,
  value,
  onChange,
  includeAnytime = false,
  size = 'small',
  minWidth = 88,
  fullWidth = false,
}: Props) {
  const selectValue = monthlyDayToSelectValue(value)

  return (
    <FormControl size={size} margin="dense" sx={{ minWidth, ...(fullWidth ? { width: '100%' } : {}) }}>
      <InputLabel id={labelId}>{label}</InputLabel>
      <Select
        labelId={labelId}
        label={label}
        value={selectValue}
        onChange={(e) => onChange(monthlyDayFromSelectValue(e.target.value))}
      >
        {includeAnytime ? (
          <MenuItem value={MONTHLY_DAY_SELECT_ANYTIME} dense>
            수시
          </MenuItem>
        ) : null}
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
