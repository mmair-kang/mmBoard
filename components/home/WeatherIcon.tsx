'use client'
// 수정: Auto — 2026-06-11

import AcUnitRoundedIcon from '@mui/icons-material/AcUnitRounded'
import CloudOutlinedIcon from '@mui/icons-material/CloudOutlined'
import GrainRoundedIcon from '@mui/icons-material/GrainRounded'
import ThunderstormRoundedIcon from '@mui/icons-material/ThunderstormRounded'
import WaterDropRoundedIcon from '@mui/icons-material/WaterDropRounded'
import WbCloudyOutlinedIcon from '@mui/icons-material/WbCloudyOutlined'
import WbSunnyOutlinedIcon from '@mui/icons-material/WbSunnyOutlined'
import type { SvgIconProps } from '@mui/material/SvgIcon'

type Props = {
  code: number
  size?: 'sm' | 'md'
} & Pick<SvgIconProps, 'sx'>

function iconForCode(code: number) {
  if (code === 0) return WbSunnyOutlinedIcon
  if (code <= 3) return WbCloudyOutlinedIcon
  if (code <= 48) return CloudOutlinedIcon
  if (code <= 57) return GrainRoundedIcon
  if (code <= 67) return WaterDropRoundedIcon
  if (code <= 77) return AcUnitRoundedIcon
  if (code <= 82) return WaterDropRoundedIcon
  if (code <= 86) return AcUnitRoundedIcon
  if (code >= 95) return ThunderstormRoundedIcon
  return WbCloudyOutlinedIcon
}

export function WeatherIcon({ code, size = 'md', sx }: Props) {
  const Icon = iconForCode(code)
  const fontSize = size === 'sm' ? '1rem' : '1.35rem'

  return (
    <Icon
      sx={{
        fontSize,
        color: code === 0 ? 'warning.main' : code <= 67 ? 'info.main' : 'text.secondary',
        ...sx,
      }}
    />
  )
}
