'use client'
// 수정: Auto — 2026-06-08

import { formatAmountDigitsInput, formatAmountDisplay, parseAmountDigits } from '@/lib/formatAmount'
import InputAdornment from '@mui/material/InputAdornment'
import TextField from '@mui/material/TextField'
import { useEffect, useRef, useState } from 'react'

type Props = {
  value: number
  onCommit: (amount: number) => void | Promise<void>
  disabled?: boolean
  label?: string
  large?: boolean
}

export function FreshAmountField({ value, onCommit, disabled, label, large }: Props) {
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
        endAdornment: <InputAdornment position="end">원</InputAdornment>,
      }}
      sx={{
        '& .MuiInputBase-input': {
          fontWeight: large ? 900 : 700,
          fontSize: large ? '1.2rem' : '0.95rem',
        },
        '& .MuiInputBase-input::placeholder': {
          textAlign: 'right',
          opacity: 0.45,
        },
      }}
    />
  )
}
