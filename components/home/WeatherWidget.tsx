'use client'
// 수정: Auto — 2026-06-15 (PC 일별 너비·굵기 조정)

import { WeatherHorizontalScroll } from '@/components/home/WeatherHorizontalScroll'
import { WeatherIcon } from '@/components/home/WeatherIcon'
import { useWeather } from '@/hooks/useWeather'
import { formatPrecipitationMm, temperatureTextColor, type WeatherDailyView } from '@/lib/weatherCalc'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { alpha, type Theme } from '@mui/material/styles'

function weatherCardSx(active: boolean) {
  return {
    borderRadius: 1,
    border: 1,
    textAlign: 'center' as const,
    bgcolor: 'background.paper',
    borderColor: (theme: Theme) =>
      active ? alpha(theme.palette.info.main, 0.28) : theme.palette.divider,
    ...(active
      ? {
          bgcolor: (theme: Theme) => alpha(theme.palette.info.main, 0.045),
          boxShadow: (theme: Theme) => `inset 0 0 0 1px ${alpha(theme.palette.info.main, 0.08)}`,
        }
      : {}),
  }
}

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
        fontWeight: { xs: 800, md: 700 },
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
        fontWeight: { xs: 700, md: 600 },
        color: value > 0 ? 'info.main' : 'text.secondary',
        ...sx,
      }}
    >
      {formatPrecipitationMm(value)}mm
    </Typography>
  )
}

function DailyDayCell({ row }: { row: WeatherDailyView }) {
  const isToday = row.dayLabel === '오늘'

  return (
    <Box
      sx={{
        flex: { xs: '0 0 auto', md: '1 1 0' },
        width: { xs: 44, md: 'auto' },
        minWidth: { md: 0 },
        px: { xs: 0.15, md: 0.35 },
        py: { xs: 0.3, md: 0.45 },
        ...weatherCardSx(isToday),
      }}
    >
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{
          fontWeight: 600,
          fontSize: { xs: '0.52rem', md: '0.62rem' },
          display: 'block',
          lineHeight: 1.15,
        }}
      >
        {row.dayLabel}
      </Typography>
      <Stack
        direction="row"
        justifyContent="center"
        alignItems="center"
        spacing={0.1}
        sx={{ minHeight: { xs: 16, md: 20 }, my: 0.05 }}
      >
        <WeatherIcon code={row.morning?.weatherCode ?? 0} size="sm" sx={{ fontSize: { xs: '0.78rem', md: '0.9rem' } }} />
        <WeatherIcon code={row.afternoon?.weatherCode ?? 0} size="sm" sx={{ fontSize: { xs: '0.78rem', md: '0.9rem' } }} />
      </Stack>
      <Typography sx={{ fontSize: { xs: '0.54rem', md: '0.64rem' }, fontWeight: 600, lineHeight: 1.2 }}>
        <Typography component="span" sx={{ color: temperatureTextColor(row.tempMin), fontWeight: 700, fontSize: 'inherit' }}>
          {row.tempMin}°
        </Typography>
        <Typography component="span" color="text.disabled" sx={{ mx: 0.05, fontSize: 'inherit' }}>
          /
        </Typography>
        <Typography component="span" sx={{ color: temperatureTextColor(row.tempMax), fontWeight: 700, fontSize: 'inherit' }}>
          {row.tempMax}°
        </Typography>
      </Typography>
      <Typography
        sx={{
          fontSize: { xs: '0.5rem', md: '0.58rem' },
          fontWeight: 600,
          lineHeight: 1.2,
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
          <Typography sx={{ fontWeight: { xs: 800, md: 700 }, fontSize: { xs: '0.82rem', md: '0.88rem' }, lineHeight: 1.2 }}>
            {data.locationLabel}
            <Typography
              component="span"
              color="text.secondary"
              sx={{ fontWeight: 500, fontSize: { xs: '0.72rem', md: '0.78rem' }, ml: 0.5 }}
            >
              {data.locationSublabel}
            </Typography>
          </Typography>
        </Box>
        <Stack direction="row" alignItems="center" spacing={0.75} sx={{ flexShrink: 0 }}>
          <WeatherIcon code={data.current.weatherCode} />
          <TempText value={data.current.temperature} sx={{ fontSize: { xs: '1.1rem', md: '1.15rem' } }} />
          <PrecipText value={data.current.precipitation} sx={{ fontSize: { xs: '0.72rem', md: '0.78rem' } }} />
        </Stack>
      </Stack>

      <Box sx={{ px: 0.5, py: 0.5, borderBottom: 1, borderColor: 'divider' }}>
        <WeatherHorizontalScroll>
          {data.hourly.map((row) => (
            <Box
              key={row.time}
              sx={{
                flex: '0 0 auto',
                width: { xs: 36, md: 42 },
                px: 0.15,
                py: 0.3,
                ...weatherCardSx(Boolean(row.isNow)),
              }}
            >
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  fontWeight: 600,
                  fontSize: { xs: '0.52rem', md: '0.58rem' },
                  display: 'block',
                  lineHeight: 1.15,
                }}
              >
                {row.isNow ? '지금' : row.hourLabel.replace('시', '')}
              </Typography>
              <WeatherIcon
                code={row.weatherCode}
                size="sm"
                sx={{ fontSize: { xs: '0.82rem', md: '0.9rem' }, display: 'block', mx: 'auto', my: 0.05 }}
              />
              <Typography
                sx={{
                  fontSize: { xs: '0.62rem', md: '0.68rem' },
                  fontWeight: 700,
                  color: temperatureTextColor(row.temperature),
                  lineHeight: 1.15,
                }}
              >
                {row.temperature}°
              </Typography>
              <Typography
                sx={{
                  fontSize: { xs: '0.5rem', md: '0.56rem' },
                  fontWeight: 600,
                  color: row.precipitation > 0 ? 'info.main' : 'text.disabled',
                  lineHeight: 1.15,
                }}
              >
                {formatPrecipitationMm(row.precipitation)}
              </Typography>
            </Box>
          ))}
        </WeatherHorizontalScroll>
      </Box>

      <Box
        sx={{
          px: { xs: 0.5, md: 0.75 },
          py: { xs: 0.5, md: 0.65 },
          display: 'flex',
          gap: { xs: 0.35, md: 0.5 },
          overflowX: { xs: 'auto', md: 'hidden' },
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {data.daily.map((row) => (
          <DailyDayCell key={row.date} row={row} />
        ))}
      </Box>
    </Paper>
  )
}
