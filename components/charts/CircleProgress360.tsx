'use client'
// 수정: Auto — 2026-06-05

import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

const SEGMENT_EASE = 'cubic-bezier(0.22, 1, 0.36, 1)'
const SEGMENT_FILL_MS = 480
const SEGMENT_STAGGER_MS = 18

const SIZE = 88
const CX = SIZE / 2
const CY = SIZE / 2
const R_OUTER = 38
const R_INNER = 30
const GAP_RAD = 0.035

function polar(r: number, angle: number) {
  return {
    x: CX + r * Math.cos(angle),
    y: CY + r * Math.sin(angle),
  }
}

function annularSectorPath(startAngle: number, endAngle: number): string {
  const oStart = polar(R_OUTER, startAngle)
  const oEnd = polar(R_OUTER, endAngle)
  const iEnd = polar(R_INNER, endAngle)
  const iStart = polar(R_INNER, startAngle)
  const span = endAngle - startAngle
  const largeArc = span > Math.PI ? 1 : 0

  return [
    `M ${oStart.x.toFixed(3)} ${oStart.y.toFixed(3)}`,
    `A ${R_OUTER} ${R_OUTER} 0 ${largeArc} 1 ${oEnd.x.toFixed(3)} ${oEnd.y.toFixed(3)}`,
    `L ${iEnd.x.toFixed(3)} ${iEnd.y.toFixed(3)}`,
    `A ${R_INNER} ${R_INNER} 0 ${largeArc} 0 ${iStart.x.toFixed(3)} ${iStart.y.toFixed(3)}`,
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
}

export function CircleProgress360({
  total,
  filled,
  centerValue,
  sublabel,
  barColor,
  trackColor = '#e8edf3',
  numberColor = '#0f172a',
}: Props) {
  const safeTotal = Math.max(1, Math.round(total))
  const safeFilled = Math.max(0, Math.min(safeTotal, Math.round(filled)))

  return (
    <Box
      role="img"
      aria-label={`남은 ${centerValue}일`}
      sx={{
        position: 'relative',
        width: SIZE,
        height: SIZE,
        flexShrink: 0,
      }}
    >
      <Box
        component="svg"
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        sx={{ display: 'block', width: '100%', height: '100%', overflow: 'visible' }}
      >
        {Array.from({ length: safeTotal }, (_, i) => {
          const { startAngle, endAngle } = segmentAngles(i, safeTotal)
          const isFilled = i < safeFilled
          return (
            <path
              key={i}
              d={annularSectorPath(startAngle, endAngle)}
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
            fontSize: '1.55rem',
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
              mt: 0.35,
              color: 'text.secondary',
              fontSize: '0.62rem',
              lineHeight: 1.25,
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
