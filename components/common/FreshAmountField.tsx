'use client'
// 수정: Auto — 2026-06-30 (compact 옵션)

import { formatAmountDigitsInput, formatAmountDisplay, parseAmountDigits } from '@/lib/formatAmount'
import { nearlyWhiteInputBg } from '@/lib/widgetSurfaces'
import InputAdornment from '@mui/material/InputAdornment'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { alpha, type Theme } from '@mui/material/styles'
import { useEffect, useRef, useState } from 'react'

type SoftInputTone = 'primary' | 'success'

type Props = {
  value: number
  onCommit: (amount: number) => void | Promise<void>
  disabled?: boolean
  label?: string
  large?: boolean
  softInput?: SoftInputTone
  /** input 왼쪽에 표시 (예: 오늘, 3일 전) */
  leadingLabel?: string | null
  /** 카드 등 좁은 영역용 */
  compact?: boolean
}

function softInputSx(tone: SoftInputTone, theme: Theme) {
  const main = theme.palette[tone].main
  return {
    '& .MuiOutlinedInput-root': {
      bgcolor: nearlyWhiteInputBg(theme),
      '& fieldset': { borderColor: alpha(main, 0.14) },
      '&:hover fieldset': { borderColor: alpha(main, 0.22) },
      '&.Mui-focused fieldset': { borderColor: alpha(main, 0.38) },
    },
  }
}

export function FreshAmountField({
  value,
  onCommit,
  disabled,
  label,
  large,
  softInput,
  leadingLabel,
  compact,
}: Props) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')
  const [committing, setCommitting] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!editing) setDraft('')
  }, [value, editing])

  const handleFocus = () => {
    if (disabled || committing) return
    setEditing(true)
    setDraft('')
  }

  const handleBlur = () => {
    void finishEdit()
  }

  const finishEdit = async () => {
    if (!editing) return
    setEditing(false)

    const parsed = parseAmountDigits(draft)
    if (parsed === null) {
      setDraft('')
      return
    }

    if (parsed === value) {
      setDraft('')
      return
    }

    setCommitting(true)
    try {
      await onCommit(parsed)
    } finally {
      setCommitting(false)
      setDraft('')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      inputRef.current?.blur()
    }
    if (e.key === 'Escape') {
      setDraft('')
      setEditing(false)
      inputRef.current?.blur()
    }
  }

  const displayValue = editing ? draft : formatAmountDisplay(value)
  const placeholder = editing ? formatAmountDisplay(value) : undefined

  return (
    <TextField
      size="small"
      fullWidth
      label={label}
      value={displayValue}
      placeholder={placeholder}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onChange={(e) => {
        if (!editing) return
        setDraft(formatAmountDigitsInput(e.target.value))
      }}
      onKeyDown={handleKeyDown}
      disabled={disabled || committing}
      inputRef={inputRef}
      inputProps={{
        inputMode: 'numeric',
        style: { textAlign: 'right' },
      }}
      InputProps={{
        startAdornment: leadingLabel ? (
          <InputAdornment position="start">
            <Typography
              component="span"
              variant="caption"
              color="text.disabled"
              sx={{ fontWeight: 600, fontSize: '0.68rem', whiteSpace: 'nowrap' }}
            >
              {leadingLabel}
            </Typography>
          </InputAdornment>
        ) : undefined,
        endAdornment: <InputAdornment position="end">원</InputAdornment>,
      }}
      sx={(theme) => ({
        ...(compact ? { '& .MuiInputBase-root': { minHeight: 34 } } : {}),
        '& .MuiInputBase-input': {
          fontWeight: large ? 900 : 700,
          fontSize: large ? '1.2rem' : compact ? '0.88rem' : '0.95rem',
          ...(compact ? { py: 0.55 } : {}),
        },
        ...(compact
          ? { '& .MuiInputAdornment-root .MuiTypography-root': { fontSize: '0.64rem' } }
          : {}),
        '& .MuiInputBase-input::placeholder': {
          textAlign: 'right',
          opacity: 0.45,
        },
        ...(softInput ? softInputSx(softInput, theme) : {}),
      })}
    />
  )
}
