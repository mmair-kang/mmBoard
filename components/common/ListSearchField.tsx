'use client'
// 수정: Auto — 2026-06-05 (목록 검색)

import ClearRoundedIcon from '@mui/icons-material/ClearRounded'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import TextField from '@mui/material/TextField'
import { alpha } from '@mui/material/styles'

type Props = {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function ListSearchField({
  value,
  onChange,
  placeholder = '검색',
}: Props) {
  return (
    <TextField
      size="small"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      fullWidth
      sx={(theme) => ({
        '& .MuiOutlinedInput-root': {
          height: 40,
          borderRadius: 2,
          bgcolor: alpha(theme.palette.grey[500], 0.06),
          transition: 'background-color 0.15s ease',
          '&:hover': {
            bgcolor: alpha(theme.palette.grey[500], 0.09),
          },
          '&.Mui-focused': {
            bgcolor: 'background.paper',
          },
        },
      })}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchRoundedIcon fontSize="small" color="action" />
          </InputAdornment>
        ),
        endAdornment: value ? (
          <InputAdornment position="end">
            <IconButton
              size="small"
              onClick={() => onChange('')}
              aria-label="검색어 지우기"
              edge="end"
            >
              <ClearRoundedIcon fontSize="small" />
            </IconButton>
          </InputAdornment>
        ) : undefined,
      }}
    />
  )
}
