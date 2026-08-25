'use client'
// 수정: Auto — 2026-08-24 23:25 (칸 드래그·드롭)

import { ORGANIZE_CELL_HEIGHT } from '@/config/organizeCabinets'
import { useDraggable, useDroppable } from '@dnd-kit/core'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { alpha } from '@mui/material/styles'
import type { MutableRefObject } from 'react'

type Props = {
  id: string
  label: string
  content: string
  fontSize: string
  dragActive: boolean
  suppressClickRef: MutableRefObject<boolean>
  onClick: () => void
}

export function OrganizeSlotCell({
  id,
  label,
  content,
  fontSize,
  dragActive,
  suppressClickRef,
  onClick,
}: Props) {
  const filled = Boolean(content)
  const { attributes, listeners, setNodeRef: setDragRef, isDragging } = useDraggable({ id })
  const { setNodeRef: setDropRef, isOver } = useDroppable({ id })

  const setNodeRef = (node: HTMLElement | null) => {
    setDragRef(node)
    setDropRef(node)
  }

  const handleClick = () => {
    if (suppressClickRef.current) {
      suppressClickRef.current = false
      return
    }
    onClick()
  }

  return (
    <Box
      ref={setNodeRef}
      component="button"
      type="button"
      aria-label={label}
      onClick={handleClick}
      {...attributes}
      {...listeners}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 0,
        height: ORGANIZE_CELL_HEIGHT,
        px: 0.35,
        py: 0,
        m: 0,
        border: 0,
        bgcolor: isOver && !isDragging ? (theme) => alpha(theme.palette.primary.main, 0.12) : 'background.paper',
        cursor: dragActive || isDragging ? 'grabbing' : 'grab',
        appearance: 'none',
        WebkitAppearance: 'none',
        font: 'inherit',
        color: 'inherit',
        opacity: isDragging ? 0.35 : 1,
        touchAction: dragActive || isDragging ? 'none' : 'pan-y',
        userSelect: 'none',
        boxShadow: isOver && !isDragging ? (theme) => `inset 0 0 0 1px ${alpha(theme.palette.primary.main, 0.45)}` : 'none',
        '&:hover': {
          bgcolor: isOver && !isDragging ? (theme) => alpha(theme.palette.primary.main, 0.12) : 'action.hover',
        },
      }}
    >
      <Typography
        noWrap
        sx={{
          width: '100%',
          textAlign: 'center',
          fontWeight: filled ? 700 : 500,
          fontSize,
          lineHeight: 1.2,
          letterSpacing: '-0.03em',
          color: filled ? 'text.primary' : 'text.disabled',
          pointerEvents: 'none',
        }}
      >
        {filled ? content : '·'}
      </Typography>
    </Box>
  )
}

export function OrganizeSlotPreview({ content, fontSize }: { content: string; fontSize: string }) {
  const filled = Boolean(content)
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 72,
        maxWidth: 160,
        height: ORGANIZE_CELL_HEIGHT,
        px: 0.75,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 0.75,
        bgcolor: 'background.paper',
        boxShadow: '0 8px 20px rgba(15, 23, 42, 0.18)',
      }}
    >
      <Typography
        noWrap
        sx={{
          fontWeight: filled ? 700 : 500,
          fontSize,
          lineHeight: 1.2,
          color: filled ? 'text.primary' : 'text.disabled',
        }}
      >
        {filled ? content : '·'}
      </Typography>
    </Box>
  )
}
