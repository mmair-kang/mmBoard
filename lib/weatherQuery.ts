// 수정: Auto — 2026-06-11

import { WEATHER_LOCATION } from '@/config/weatherLocation'
import { parseOpenMeteoResponse, type WeatherData } from '@/lib/weatherCalc'

const OPEN_METEO_URL = 'https://api.open-meteo.com/v1/forecast'
const CACHE_MS = 20 * 60 * 1000

let cache: { data: WeatherData; expiresAt: number } | null = null

async function fetchOpenMeteo(): Promise<WeatherData> {
  const url = new URL(OPEN_METEO_URL)
  url.searchParams.set('latitude', String(WEATHER_LOCATION.latitude))
  url.searchParams.set('longitude', String(WEATHER_LOCATION.longitude))
  url.searchParams.set('timezone', WEATHER_LOCATION.timezone)
  url.searchParams.set('current', 'temperature_2m,weather_code,precipitation')
  url.searchParams.set('hourly', 'temperature_2m,weather_code,precipitation')
  url.searchParams.set('daily', 'temperature_2m_max,temperature_2m_min,precipitation_sum')
  url.searchParams.set('forecast_days', '7')

  const res = await fetch(url, { next: { revalidate: 1200 } })
  if (!res.ok) {
    throw new Error(`Open-Meteo ${res.status}`)
  }

  const raw = (await res.json()) as Parameters<typeof parseOpenMeteoResponse>[0]
  return parseOpenMeteoResponse(raw, WEATHER_LOCATION.label, WEATHER_LOCATION.sublabel)
}

export async function loadWeatherData(): Promise<WeatherData> {
  const now = Date.now()
  if (cache && cache.expiresAt > now) {
    return cache.data
  }

  const data = await fetchOpenMeteo()
  cache = { data, expiresAt: now + CACHE_MS }
  return data
}
