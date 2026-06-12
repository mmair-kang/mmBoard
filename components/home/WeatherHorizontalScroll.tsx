'use client'
// 수정: Auto — 2026-06-11

import { useHorizontalDragScroll } from '@/hooks/useHorizontalDragScroll'
import Box from '@mui/material/Box'
import type { ReactNode } from 'react'

type Props = {
  children: ReactNode
}

export function WeatherHorizontalScroll({ children }: Props) {
  const { ref, dragScrollProps } = useHorizontalDragScroll<HTMLDivElement>()

  return (
    <Box
      ref={ref}
      {...dragScrollProps}
      sx={{
        display: 'flex',
        gap: 0.2,
        overflowX: 'auto',
        WebkitOverflowScrolling: 'touch',
        scrollbarWidth: 'none',
        touchAction: 'pan-x',
        cursor: { md: 'grab' },
        '&::-webkit-scrollbar': { display: 'none' },
      }}
    >
      {children}
    </Box>
  )
}
