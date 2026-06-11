'use client'
// 수정: Auto — 2026-06-11 (일별 카드형)

import { WeatherIcon } from '@/components/home/WeatherIcon'
import { useWeather } from '@/hooks/useWeather'
import { formatPrecipitationMm, temperatureTextColor, type WeatherDailyView } from '@/lib/weatherCalc'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { alpha } from '@mui/material/styles'

function TempText({
  value,
  sx,
}: {
  value: number
  sx?: Record<string, unknown>
}) {
  return (
    <Typography
      component="span"
      sx={{
        fontWeight: 900,
        color: temperatureTextColor(value),
        ...sx,
      }}
    >
      {value}°
    </Typography>
  )
}

function PrecipText({ value, sx }: { value: number; sx?: Record<string, unknown> }) {
  return (
    <Typography
      component="span"
      sx={{
        fontWeight: 700,
        color: value > 0 ? 'info.main' : 'text.secondary',
        ...sx,
      }}
    >
      {formatPrecipitationMm(value)}mm
    </Typography>
  )
}

const DAILY_COL_WIDTH = 44

function DailyDayCell({ row }: { row: WeatherDailyView }) {
  const isToday = row.dayLabel === '오늘'

  return (
    <Box
      sx={{
        flex: '0 0 auto',
        width: DAILY_COL_WIDTH,
        px: 0.15,
        py: 0.3,
        borderRadius: 1,
        textAlign: 'center',
        bgcolor: isToday ? (theme) => alpha(theme.palette.info.main, 0.12) : 'transparent',
        border: 1,
        borderColor: isToday ? 'info.light' : 'divider',
      }}
    >
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ fontWeight: 800, fontSize: '0.52rem', display: 'block', lineHeight: 1.15 }}
      >
        {row.dayLabel}
      </Typography>
      <Stack direction="row" justifyContent="center" alignItems="center" spacing={0.1} sx={{ minHeight: 16, my: 0.05 }}>
        <WeatherIcon code={row.morning?.weatherCode ?? 0} size="sm" sx={{ fontSize: '0.78rem' }} />
        <WeatherIcon code={row.afternoon?.weatherCode ?? 0} size="sm" sx={{ fontSize: '0.78rem' }} />
      </Stack>
      <Typography sx={{ fontSize: '0.54rem', fontWeight: 800, lineHeight: 1.15 }}>
        <Typography component="span" sx={{ color: temperatureTextColor(row.tempMin), fontWeight: 900, fontSize: 'inherit' }}>
          {row.tempMin}°
        </Typography>
        <Typography component="span" color="text.disabled" sx={{ mx: 0.05, fontSize: 'inherit' }}>
          /
        </Typography>
        <Typography component="span" sx={{ color: temperatureTextColor(row.tempMax), fontWeight: 900, fontSize: 'inherit' }}>
          {row.tempMax}°
        </Typography>
      </Typography>
      <Typography
        sx={{
          fontSize: '0.5rem',
          fontWeight: 700,
          lineHeight: 1.15,
          color: row.precipitationSum > 0 ? 'info.main' : 'text.disabled',
        }}
      >
        {formatPrecipitationMm(row.precipitationSum)}mm
      </Typography>
    </Box>
  )
}

export function WeatherWidget() {
  const { data, isLoading, error } = useWeather()

  if (isLoading && !data) {
    return (
      <Paper variant="outlined" sx={{ borderRadius: 2, py: 2.5, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress size={24} />
      </Paper>
    )
  }

  if (!data) {
    return (
      <Paper variant="outlined" sx={{ borderRadius: 2, px: 1.25, py: 1.5 }}>
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
          {error instanceof Error ? error.message : '날씨를 불러오지 못했습니다'}
        </Typography>
      </Paper>
    )
  }

  return (
    <Paper
      variant="outlined"
      sx={{
        borderRadius: 2,
        overflow: 'hidden',
        borderColor: 'divider',
        bgcolor: (theme) => alpha(theme.palette.info.main, 0.03),
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        spacing={1}
        sx={{
          px: 1,
          py: 0.75,
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: (theme) => alpha(theme.palette.info.main, 0.06),
        }}
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontWeight: 900, fontSize: '0.82rem', lineHeight: 1.2 }}>
            {data.locationLabel}
            <Typography component="span" color="text.secondary" sx={{ fontWeight: 700, fontSize: '0.72rem', ml: 0.5 }}>
              {data.locationSublabel}
            </Typography>
          </Typography>
        </Box>
        <Stack direction="row" alignItems="center" spacing={0.75} sx={{ flexShrink: 0 }}>
          <WeatherIcon code={data.current.weatherCode} />
          <TempText value={data.current.temperature} sx={{ fontSize: '1.1rem' }} />
          <PrecipText value={data.current.precipitation} sx={{ fontSize: '0.72rem' }} />
        </Stack>
      </Stack>

      <Box sx={{ px: 0.5, py: 0.5, borderBottom: 1, borderColor: 'divider' }}>
        <Box
          sx={{
            display: 'flex',
            gap: 0.2,
            overflowX: 'auto',
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'none',
            '&::-webkit-scrollbar': { display: 'none' },
          }}
        >
          {data.hourly.map((row) => (
            <Box
              key={row.time}
              sx={{
                flex: '0 0 auto',
                width: 36,
                px: 0.15,
                py: 0.3,
                borderRadius: 1,
                textAlign: 'center',
                bgcolor: row.isNow ? (theme) => alpha(theme.palette.info.main, 0.12) : 'transparent',
                border: 1,
                borderColor: row.isNow ? 'info.light' : 'divider',
              }}
            >
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontWeight: 800, fontSize: '0.52rem', display: 'block', lineHeight: 1.15 }}
              >
                {row.isNow ? '지금' : row.hourLabel.replace('시', '')}
              </Typography>
              <WeatherIcon code={row.weatherCode} size="sm" sx={{ fontSize: '0.82rem', display: 'block', mx: 'auto', my: 0.05 }} />
              <Typography
                sx={{ fontSize: '0.62rem', fontWeight: 900, color: temperatureTextColor(row.temperature), lineHeight: 1.15 }}
              >
                {row.temperature}°
              </Typography>
              <Typography
                sx={{
                  fontSize: '0.5rem',
                  fontWeight: 700,
                  color: row.precipitation > 0 ? 'info.main' : 'text.disabled',
                  lineHeight: 1.15,
                }}
              >
                {formatPrecipitationMm(row.precipitation)}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      <Box sx={{ px: 0.5, py: 0.5 }}>
        <Box
          sx={{
            display: 'flex',
            gap: 0.2,
            overflowX: 'auto',
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'none',
            '&::-webkit-scrollbar': { display: 'none' },
          }}
        >
          {data.daily.map((row) => (
            <DailyDayCell key={row.date} row={row} />
          ))}
        </Box>
      </Box>
    </Paper>
  )
}
