'use client'
// 수정: Auto — 2026-06-11 (size 옵션)

import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

const SEGMENT_EASE = 'cubic-bezier(0.22, 1, 0.36, 1)'
const SEGMENT_FILL_MS = 480
const SEGMENT_STAGGER_MS = 18
const DEFAULT_SIZE = 88
const GAP_RAD = 0.035

function polar(cx: number, cy: number, r: number, angle: number) {
  return {
    x: cx + r * Math.cos(angle),
    y: cy + r * Math.sin(angle),
  }
}

function annularSectorPath(
  cx: number,
  cy: number,
  rOuter: number,
  rInner: number,
  startAngle: number,
  endAngle: number,
): string {
  const oStart = polar(cx, cy, rOuter, startAngle)
  const oEnd = polar(cx, cy, rOuter, endAngle)
  const iEnd = polar(cx, cy, rInner, endAngle)
  const iStart = polar(cx, cy, rInner, startAngle)
  const span = endAngle - startAngle
  const largeArc = span > Math.PI ? 1 : 0

  return [
    `M ${oStart.x.toFixed(3)} ${oStart.y.toFixed(3)}`,
    `A ${rOuter} ${rOuter} 0 ${largeArc} 1 ${oEnd.x.toFixed(3)} ${oEnd.y.toFixed(3)}`,
    `L ${iEnd.x.toFixed(3)} ${iEnd.y.toFixed(3)}`,
    `A ${rInner} ${rInner} 0 ${largeArc} 0 ${iStart.x.toFixed(3)} ${iStart.y.toFixed(3)}`,
    'Z',
  ].join(' ')
}

function segmentAngles(index: number, total: number) {
  const slice = (2 * Math.PI) / total
  const halfGap = GAP_RAD / 2
  const startAngle = -Math.PI / 2 + index * slice + halfGap
  const endAngle = -Math.PI / 2 + (index + 1) * slice - halfGap
  return { startAngle, endAngle }
}

type Props = {
  total: number
  filled: number
  centerValue: number
  sublabel?: string
  barColor: string
  trackColor?: string
  numberColor?: string
  size?: number
}

export function CircleProgress360({
  total,
  filled,
  centerValue,
  sublabel,
  barColor,
  trackColor = '#e8edf3',
  numberColor = '#0f172a',
  size = DEFAULT_SIZE,
}: Props) {
  const safeTotal = Math.max(1, Math.round(total))
  const safeFilled = Math.max(0, Math.min(safeTotal, Math.round(filled)))
  const scale = size / DEFAULT_SIZE
  const cx = size / 2
  const cy = size / 2
  const rOuter = 38 * scale
  const rInner = 30 * scale

  return (
    <Box
      role="img"
      aria-label={`남은 ${centerValue}일`}
      sx={{
        position: 'relative',
        width: size,
        height: size,
        flexShrink: 0,
      }}
    >
      <Box
        component="svg"
        viewBox={`0 0 ${size} ${size}`}
        sx={{ display: 'block', width: '100%', height: '100%', overflow: 'visible' }}
      >
        {Array.from({ length: safeTotal }, (_, i) => {
          const { startAngle, endAngle } = segmentAngles(i, safeTotal)
          const isFilled = i < safeFilled
          return (
            <path
              key={i}
              d={annularSectorPath(cx, cy, rOuter, rInner, startAngle, endAngle)}
              fill={isFilled ? barColor : trackColor}
              style={{
                transition: `fill ${SEGMENT_FILL_MS}ms ${SEGMENT_EASE}`,
                transitionDelay: isFilled ? `${Math.min(i * SEGMENT_STAGGER_MS, 240)}ms` : '0ms',
              }}
            />
          )
        })}
      </Box>
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          pointerEvents: 'none',
          px: 0.5,
        }}
      >
        <Typography
          component="span"
          sx={{
            color: numberColor,
            fontWeight: 800,
            fontSize: `${1.55 * scale}rem`,
            lineHeight: 1,
            letterSpacing: '-0.03em',
          }}
        >
          {centerValue}
        </Typography>
        {sublabel ? (
          <Typography
            variant="caption"
            sx={{
              mt: 0.15 * scale,
              color: 'text.secondary',
              fontSize: `${0.58 * scale}rem`,
              lineHeight: 1.15,
              fontWeight: 600,
              whiteSpace: 'nowrap',
            }}
          >
            {sublabel}
          </Typography>
        ) : null}
      </Box>
    </Box>
  )
}
