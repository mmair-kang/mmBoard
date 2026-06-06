'use client'
// 수정: Auto — 2026-06-05 (클릭 시 확대)

import Box from '@mui/material/Box'
import type { MouseEvent } from 'react'

type Props = {
  src: string
  size?: number
  onClick?: (event: MouseEvent<HTMLDivElement>) => void
}

export function ShoppingItemThumbnail({ src, size = 56, onClick }: Props) {
  return (
    <Box
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                e.stopPropagation()
                onClick(e as unknown as MouseEvent<HTMLDivElement>)
              }
            }
          : undefined
      }
      sx={{
        width: size,
        height: size,
        flexShrink: 0,
        borderRadius: 1.5,
        overflow: 'hidden',
        bgcolor: 'action.hover',
        border: 1,
        borderColor: 'divider',
        cursor: onClick ? 'zoom-in' : undefined,
      }}
    >      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
      />
    </Box>
  )
}
