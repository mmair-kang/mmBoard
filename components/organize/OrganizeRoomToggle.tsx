'use client'
// 수정: Auto — 2026-08-25 00:50 (동적 방 토글)

import type { OrganizeRoom, OrganizeRoomRecord } from '@/config/organizeCabinets'
import EditRoundedIcon from '@mui/icons-material/EditRounded'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import Typography from '@mui/material/Typography'
import { alpha } from '@mui/material/styles'

type Props = {
  rooms: OrganizeRoomRecord[]
  value: OrganizeRoom
  onChange: (next: OrganizeRoom) => void
  onEditClick: () => void
}

const labelSx = {
  fontWeight: 800,
  fontSize: '0.82rem',
  lineHeight: 1.2,
  letterSpacing: '-0.02em',
  whiteSpace: 'nowrap',
} as const

export function OrganizeRoomToggle({ rooms, value, onChange, onEditClick }: Props) {
  const handleChange = (_: React.MouseEvent<HTMLElement>, next: OrganizeRoom | null) => {
    if (!next) return
    onChange(next)
  }

  return (
    <Stack direction="row" alignItems="center" spacing={0.5} minWidth={0} sx={{ flex: 1 }}>
      <ToggleButtonGroup
        value={value}
        exclusive
        size="small"
        onChange={handleChange}
        sx={{
          flex: 1,
          minWidth: 0,
          bgcolor: (theme) => alpha(theme.palette.primary.main, 0.06),
          borderRadius: 1.25,
          p: 0.25,
          '& .MuiToggleButtonGroup-grouped': {
            border: 0,
            mx: 0.1,
            '&:not(:first-of-type)': {
              borderRadius: 1,
              marginLeft: 0.1,
            },
            '&:first-of-type': {
              borderRadius: 1,
            },
          },
          '& .MuiToggleButton-root': {
            px: { xs: 0.35, sm: 0.7 },
            py: 0.35,
            minHeight: 30,
            minWidth: 0,
            flex: 1,
            borderRadius: 1,
            border: '1px solid transparent',
            color: 'text.secondary',
            transition: 'background-color 0.15s, color 0.15s, box-shadow 0.15s',
            '&.Mui-selected': {
              bgcolor: 'background.paper',
              color: 'primary.main',
              boxShadow: '0 1px 4px rgba(15, 23, 42, 0.12)',
              '&:hover': {
                bgcolor: 'background.paper',
              },
            },
            '&:hover': {
              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
            },
          },
        }}
      >
        {rooms.map((room) => (
          <ToggleButton key={room.key} value={room.key} aria-label={room.label}>
            <Typography component="span" sx={labelSx}>
              {room.label}
            </Typography>
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
      <IconButton size="small" aria-label="방 관리" onClick={onEditClick} sx={{ color: 'text.secondary' }}>
        <EditRoundedIcon sx={{ fontSize: 18 }} />
      </IconButton>
    </Stack>
  )
}
