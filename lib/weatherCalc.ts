// 수정: Auto — 2026-06-11

export type WeatherSlot = {
  time: string
  temperature: number
  weatherCode: number
  precipitation: number
}

export type WeatherCurrentView = WeatherSlot

export type WeatherHourlyView = WeatherSlot & {
  hourLabel: string
  isNow?: boolean
}

export type WeatherDayPartView = {
  temperature: number
  weatherCode: number
  precipitation: number
}

export type WeatherDailyView = {
  date: string
  dayLabel: string
  tempMax: number
  tempMin: number
  precipitationSum: number
  morning: WeatherDayPartView | null
  afternoon: WeatherDayPartView | null
}

export type WeatherData = {
  locationLabel: string
  locationSublabel: string
  fetchedAt: string
  current: WeatherCurrentView
  hourly: WeatherHourlyView[]
  daily: WeatherDailyView[]
}

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'] as const

export function temperatureTextColor(celsius: number): string {
  if (celsius >= 30) return '#c62828'
  if (celsius >= 24) return '#e53935'
  if (celsius >= 18) return '#ef6c00'
  if (celsius >= 10) return 'text.primary'
  if (celsius >= 5) return '#42a5f5'
  if (celsius >= 0) return '#1e88e5'
  if (celsius >= -5) return '#1565c0'
  return '#0d47a1'
}

export function formatPrecipitationMm(value: number): string {
  if (!Number.isFinite(value) || value <= 0) return '0'
  if (value < 0.1) return '<0.1'
  if (value < 10) return value.toFixed(1).replace(/\.0$/, '')
  return Math.round(value).toLocaleString('ko-KR')
}

export function weatherCodeLabel(code: number): string {
  if (code === 0) return '맑음'
  if (code <= 3) return '구름'
  if (code <= 48) return '안개'
  if (code <= 57) return '이슬비'
  if (code <= 67) return '비'
  if (code <= 77) return '눈'
  if (code <= 82) return '소나기'
  if (code <= 86) return '눈'
  if (code >= 95) return '뇌우'
  return '흐림'
}

function weekdayFromDateKey(dateKey: string): string {
  const [year, month, day] = dateKey.split('-').map(Number)
  const weekday = new Date(Date.UTC(year, month - 1, day)).getUTCDay()
  return WEEKDAYS[weekday] ?? dateKey
}

function addDaysToDateKey(dateKey: string, days: number): string {
  const [year, month, day] = dateKey.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day + days))
  const y = date.getUTCFullYear()
  const m = String(date.getUTCMonth() + 1).padStart(2, '0')
  const d = String(date.getUTCDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function dayLabelForDate(dateKey: string, todayKey: string, tomorrowKey: string): string {
  if (dateKey === todayKey) return '오늘'
  if (dateKey === tomorrowKey) return '내일'
  return weekdayFromDateKey(dateKey)
}

function hourLabelFromTime(iso: string, isNow: boolean): string {
  if (isNow) return '지금'
  const hour = Number(iso.slice(11, 13))
  return `${hour}시`
}

function dateKeyFromIso(iso: string): string {
  return iso.slice(0, 10)
}

function pickDayPart(
  hourlyByDate: Map<string, WeatherSlot[]>,
  dateKey: string,
  hour: number,
): WeatherDayPartView | null {
  const slot = hourlyByDate.get(dateKey)?.find((row) => Number(row.time.slice(11, 13)) === hour)
  if (!slot) return null
  return {
    temperature: slot.temperature,
    weatherCode: slot.weatherCode,
    precipitation: slot.precipitation,
  }
}

type OpenMeteoResponse = {
  current?: {
    time?: string
    temperature_2m?: number
    weather_code?: number
    precipitation?: number
  }
  hourly?: {
    time?: string[]
    temperature_2m?: number[]
    weather_code?: number[]
    precipitation?: number[]
  }
  daily?: {
    time?: string[]
    temperature_2m_max?: number[]
    temperature_2m_min?: number[]
    precipitation_sum?: number[]
  }
}

export function parseOpenMeteoResponse(
  raw: OpenMeteoResponse,
  locationLabel: string,
  locationSublabel: string,
): WeatherData {
  const currentTime = raw.current?.time ?? new Date().toISOString()
  const current: WeatherCurrentView = {
    time: currentTime,
    temperature: Math.round(raw.current?.temperature_2m ?? 0),
    weatherCode: raw.current?.weather_code ?? 0,
    precipitation: raw.current?.precipitation ?? 0,
  }

  const hourlyTimes = raw.hourly?.time ?? []
  const hourlyTemps = raw.hourly?.temperature_2m ?? []
  const hourlyCodes = raw.hourly?.weather_code ?? []
  const hourlyPrecip = raw.hourly?.precipitation ?? []

  const allHourly: WeatherSlot[] = hourlyTimes.map((time, index) => ({
    time,
    temperature: Math.round(hourlyTemps[index] ?? 0),
    weatherCode: hourlyCodes[index] ?? 0,
    precipitation: hourlyPrecip[index] ?? 0,
  }))

  const currentIndex = allHourly.findIndex((row) => row.time === currentTime)
  const startIndex = currentIndex >= 0 ? currentIndex : 0
  const hourly: WeatherHourlyView[] = allHourly.slice(startIndex, startIndex + 48).map((row, index) => ({
    ...row,
    hourLabel: hourLabelFromTime(row.time, index === 0),
    isNow: index === 0,
  }))

  const hourlyByDate = new Map<string, WeatherSlot[]>()
  for (const row of allHourly) {
    const key = dateKeyFromIso(row.time)
    const bucket = hourlyByDate.get(key) ?? []
    bucket.push(row)
    hourlyByDate.set(key, bucket)
  }

  const todayKey = dateKeyFromIso(currentTime)
  const tomorrowKey = addDaysToDateKey(todayKey, 1)

  const dailyTimes = raw.daily?.time ?? []
  const dailyMax = raw.daily?.temperature_2m_max ?? []
  const dailyMin = raw.daily?.temperature_2m_min ?? []
  const dailyPrecip = raw.daily?.precipitation_sum ?? []

  const daily: WeatherDailyView[] = dailyTimes.map((date, index) => ({
    date,
    dayLabel: dayLabelForDate(date, todayKey, tomorrowKey),
    tempMax: Math.round(dailyMax[index] ?? 0),
    tempMin: Math.round(dailyMin[index] ?? 0),
    precipitationSum: dailyPrecip[index] ?? 0,
    morning: pickDayPart(hourlyByDate, date, 9),
    afternoon: pickDayPart(hourlyByDate, date, 15),
  }))

  return {
    locationLabel,
    locationSublabel,
    fetchedAt: new Date().toISOString(),
    current,
    hourly,
    daily,
  }
}
