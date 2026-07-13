'use client'
// 수정: Auto — 2026-07-13 01:23 (텍스트·달력 공통 필드)

import { formDialogCompactTextFieldProps } from '@/config/formDialogLayout'
import { CARD_APPLICATION_DATE_PICKER_FORMAT } from '@/lib/cardApplicationFormat'
import { parseCardApplicationBenefitDateForPicker } from '@/lib/cardApplicationBenefitDate'
import CalendarTodayRoundedIcon from '@mui/icons-material/CalendarTodayRounded'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import TextField from '@mui/material/TextField'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { useState } from 'react'

type Props = {
  label: string
  placeholder?: string
  value: string
  onChange: (value: string) => void
  calendarAriaLabel?: string
}

export function CardApplicationFlexibleDateField({
  label,
  placeholder,
  value,
  onChange,
  calendarAriaLabel,
}: Props) {
  const [pickerOpen, setPickerOpen] = useState(false)
  const pickerValue = parseCardApplicationBenefitDateForPicker(value)

  return (
    <>
      <TextField
        label={label}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        fullWidth
        {...formDialogCompactTextFieldProps}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                edge="end"
                size="small"
                aria-label={calendarAriaLabel ?? `${label} 달력`}
                onClick={() => setPickerOpen(true)}
              >
                <CalendarTodayRoundedIcon fontSize="small" />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
      <DatePicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        value={pickerValue}
        onChange={(next) => {
          if (next?.isValid()) {
            onChange(next.format(CARD_APPLICATION_DATE_PICKER_FORMAT))
          }
          setPickerOpen(false)
        }}
        format={CARD_APPLICATION_DATE_PICKER_FORMAT}
        slotProps={{
          textField: {
            sx: {
              width: 0,
              height: 0,
              overflow: 'hidden',
              position: 'absolute',
              opacity: 0,
              pointerEvents: 'none',
            },
          },
          field: { clearable: true },
        }}
      />
    </>
  )
}
