'use client'
// 수정: Auto — 2026-06-08

import { formatAmountDigitsInput, parseAmountDigits } from '@/lib/formatAmount'
import InputAdornment from '@mui/material/InputAdornment'
import TextField from '@mui/material/TextField'

type Props = {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function WonInput({ label, value, onChange, placeholder }: Props) {
  return (
    <TextField
      label={label}
      size="small"
      margin="dense"
      fullWidth
      value={value}
      onChange={(e) => onChange(formatAmountDigitsInput(e.target.value))}
      placeholder={placeholder}
      inputProps={{ inputMode: 'numeric' }}
      InputProps={{
        endAdornment: <InputAdornment position="end">원</InputAdornment>,
      }}
    />
  )
}

export function parseWonInput(text: string): number | null {
  return parseAmountDigits(text)
}
