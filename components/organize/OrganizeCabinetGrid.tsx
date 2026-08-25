'use client'
// 수정: Auto — 2026-08-25 00:20 (수납장 수정 버튼)

import { OrganizeSlotCell } from '@/components/organize/OrganizeSlotCell'
import {
  cabinetRowsPerShelf,
  organizeCellFontSize,
  organizeCellTitle,
  type OrganizeCabinetConfig,
} from '@/config/organizeCabinets'
import { organizeCellDnDId, type OrganizeCellRef } from '@/lib/organizeDnD'
import EditRoundedIcon from '@mui/icons-material/EditRounded'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { alpha } from '@mui/material/styles'
import type { MutableRefObject } from 'react'

type Props = {
  room: OrganizeCellRef['room']
  cabinet: OrganizeCabinetConfig
  getContent: (rowIndex: number, colIndex: number) => string
  onCellClick: (rowIndex: number, colIndex: number) => void
  onEditClick: () => void
  dragActive: boolean
  suppressClickRef: MutableRefObject<boolean>
}

export function OrganizeCabinetGrid({
  room,
  cabinet,
  getContent,
  onCellClick,
  onEditClick,
  dragActive,
  suppressClickRef,
}: Props) {
  const Icon = cabinet.icon
  const fontSize = organizeCellFontSize(cabinet)
  const shelves = cabinet.layoutType === 'shelves' && cabinet.shelves > 1 ? cabinet.shelves : 1
  const rowsPerShelf = cabinetRowsPerShelf(cabinet)

  const renderGrid = (startRow: number, rowCount: number) => (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: `repeat(${cabinet.cols}, minmax(0, 1fr))`,
        gridTemplateRows: `repeat(${rowCount}, auto)`,
        gap: '1px',
        bgcolor: 'divider',
      }}
    >
      {Array.from({ length: rowCount * cabinet.cols }, (_, index) => {
        const localRow = Math.floor(index / cabinet.cols)
        const colIndex = index % cabinet.cols
        const rowIndex = startRow + localRow
        const content = getContent(rowIndex, colIndex)
        return (
          <OrganizeSlotCell
            key={`${rowIndex}-${colIndex}`}
            id={organizeCellDnDId({ room, cabinetKey: cabinet.key, rowIndex, colIndex })}
            label={organizeCellTitle(cabinet, rowIndex, colIndex) + (content ? `: ${content}` : '')}
            content={content}
            fontSize={fontSize}
            dragActive={dragActive}
            suppressClickRef={suppressClickRef}
            onClick={() => onCellClick(rowIndex, colIndex)}
          />
        )
      })}
    </Box>
  )

  return (
    <Paper
      elevation={0}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
        flex: '0 0 auto',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 0,
        bgcolor: 'background.paper',
        overflow: 'hidden',
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{
          px: 0.75,
          py: 0.35,
          flexShrink: 0,
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: cabinet.bg,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={0.45} minWidth={0}>
          <Icon sx={{ fontSize: 18, color: cabinet.color }} />
          <Typography fontWeight={800} fontSize="0.82rem" noWrap sx={{ color: '#0f172a' }}>
            {cabinet.label}
          </Typography>
        </Stack>
        <IconButton
          size="small"
          aria-label={`${cabinet.label} 설정`}
          onClick={onEditClick}
          sx={{
            p: 0.35,
            color: cabinet.color,
            '&:hover': { bgcolor: alpha(cabinet.color, 0.12) },
          }}
        >
          <EditRoundedIcon sx={{ fontSize: 16 }} />
        </IconButton>
      </Stack>

      {shelves === 1
        ? renderGrid(0, cabinet.rows)
        : Array.from({ length: shelves }, (_, shelf) => (
            <Box key={shelf}>
              <Typography
                fontWeight={800}
                fontSize="0.72rem"
                sx={{
                  px: 0.75,
                  py: 0.35,
                  color: cabinet.color,
                  bgcolor: cabinet.bg,
                  borderTop: shelf === 0 ? 0 : '1px solid',
                  borderColor: 'divider',
                }}
              >
                {shelf + 1}단
              </Typography>
              {renderGrid(shelf * rowsPerShelf, rowsPerShelf)}
            </Box>
          ))}
    </Paper>
  )
}
