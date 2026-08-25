'use client'
// 수정: Auto — 2026-08-25 00:50 (추가·삭제·색 프리셋)

import { AppDialog } from '@/components/common/AppDialog'
import { FormDialogFooter } from '@/components/common/FormDialogFooter'
import { FormDialogHeader } from '@/components/common/FormDialogHeader'
import {
  formDialogCompactTextFieldProps,
  formDialogContentScrollSx,
  formDialogContentSx,
  formDialogFieldStackSpacing,
  formDialogFieldStackSx,
  formDialogFirstFieldSx,
  formDialogFormSx,
  formDialogSlotProps,
} from '@/config/formDialogLayout'
import {
  ORGANIZE_CABINET_LABEL_MAX,
  ORGANIZE_COLOR_PRESETS,
  ORGANIZE_DIM_MAX,
  ORGANIZE_DIM_MIN,
  ORGANIZE_LAYOUT_TYPES,
  matchColorPreset,
  suggestGridLabel,
  suggestShelvesLabel,
  type OrganizeCabinetConfig,
  type OrganizeColorPresetId,
  type OrganizeLayoutType,
} from '@/config/organizeCabinets'
import type { OrganizeCabinetUpdatePayload, OrganizeCabinetWritePayload } from '@/hooks/useOrganizeCabinets'
import Box from '@mui/material/Box'
import DialogContent from '@mui/material/DialogContent'
import MenuItem from '@mui/material/MenuItem'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { alpha } from '@mui/material/styles'
import { useEffect, useState } from 'react'

type Props = {
  open: boolean
  mode: 'create' | 'edit'
  cabinet: OrganizeCabinetConfig | null
  onClose: () => void
  onSubmit: (payload: OrganizeCabinetWritePayload | OrganizeCabinetUpdatePayload) => Promise<void>
  onDelete?: () => Promise<void>
}

function parseDim(value: string, min: number, max: number): number | null {
  const n = Number(value)
  if (!Number.isInteger(n) || n < min || n > max) return null
  return n
}

export function OrganizeCabinetDialog({ open, mode, cabinet, onClose, onSubmit, onDelete }: Props) {
  const [label, setLabel] = useState('')
  const [layoutType, setLayoutType] = useState<OrganizeLayoutType>('grid')
  const [cols, setCols] = useState('5')
  const [rows, setRows] = useState('4')
  const [shelves, setShelves] = useState('4')
  const [shelfRows, setShelfRows] = useState('2')
  const [colorPresetId, setColorPresetId] = useState<OrganizeColorPresetId>('violet')
  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [autoLabel, setAutoLabel] = useState(true)

  useEffect(() => {
    if (!open) {
      setSubmitting(false)
      setDeleting(false)
      setFormError(null)
      return
    }
    if (mode === 'edit' && cabinet) {
      setLabel(cabinet.label)
      setLayoutType(cabinet.layoutType)
      setCols(String(cabinet.cols))
      setRows(String(cabinet.layoutType === 'grid' ? cabinet.rows : cabinet.shelfRows))
      setShelves(String(cabinet.shelves))
      setShelfRows(String(cabinet.shelfRows))
      setColorPresetId(matchColorPreset(cabinet.color, cabinet.bg).id)
      setAutoLabel(false)
    } else {
      setLabel(suggestGridLabel(5, 4))
      setLayoutType('grid')
      setCols('5')
      setRows('4')
      setShelves('4')
      setShelfRows('2')
      setColorPresetId('violet')
      setAutoLabel(true)
    }
    setFormError(null)
  }, [open, mode, cabinet])

  const applySuggestedLabel = (nextType: OrganizeLayoutType, nextCols: string, nextRows: string, nextShelves: string) => {
    if (!autoLabel) return
    const c = Number(nextCols)
    const r = Number(nextRows)
    const s = Number(nextShelves)
    if (nextType === 'grid' && Number.isInteger(c) && Number.isInteger(r)) {
      setLabel(suggestGridLabel(c, r))
    } else if (nextType === 'shelves' && Number.isInteger(s)) {
      setLabel(suggestShelvesLabel(s))
    }
  }

  const buildPayload = (): OrganizeCabinetWritePayload | null => {
    const nextLabel = label.replace(/[\r\n]+/g, ' ').trim()
    if (!nextLabel) {
      setFormError('이름을 입력해 주세요.')
      return null
    }
    if (nextLabel.length > ORGANIZE_CABINET_LABEL_MAX) {
      setFormError(`${ORGANIZE_CABINET_LABEL_MAX}자 이내로 입력해 주세요.`)
      return null
    }

    const nextCols = parseDim(cols, ORGANIZE_DIM_MIN, ORGANIZE_DIM_MAX.cols)
    if (nextCols == null) {
      setFormError(`열은 ${ORGANIZE_DIM_MIN}~${ORGANIZE_DIM_MAX.cols} 사이여야 합니다.`)
      return null
    }

    if (layoutType === 'grid') {
      const nextRows = parseDim(rows, ORGANIZE_DIM_MIN, ORGANIZE_DIM_MAX.rows)
      if (nextRows == null) {
        setFormError(`행은 ${ORGANIZE_DIM_MIN}~${ORGANIZE_DIM_MAX.rows} 사이여야 합니다.`)
        return null
      }
      return {
        label: nextLabel,
        layoutType: 'grid',
        cols: nextCols,
        rows: nextRows,
        shelves: 1,
        shelfRows: nextRows,
        colorPresetId,
      }
    }

    const nextShelves = parseDim(shelves, ORGANIZE_DIM_MIN, ORGANIZE_DIM_MAX.shelves)
    const nextShelfRows = parseDim(shelfRows, ORGANIZE_DIM_MIN, ORGANIZE_DIM_MAX.shelfRows)
    if (nextShelves == null) {
      setFormError(`단 수는 ${ORGANIZE_DIM_MIN}~${ORGANIZE_DIM_MAX.shelves} 사이여야 합니다.`)
      return null
    }
    if (nextShelfRows == null) {
      setFormError(`단당 행은 ${ORGANIZE_DIM_MIN}~${ORGANIZE_DIM_MAX.shelfRows} 사이여야 합니다.`)
      return null
    }
    return {
      label: nextLabel,
      layoutType: 'shelves',
      cols: nextCols,
      rows: nextShelves * nextShelfRows,
      shelves: nextShelves,
      shelfRows: nextShelfRows,
      colorPresetId,
    }
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (mode === 'edit' && !cabinet) return
    const payload = buildPayload()
    if (!payload) return

    setSubmitting(true)
    setFormError(null)
    try {
      if (mode === 'edit' && cabinet) {
        await onSubmit({ ...payload, key: cabinet.key })
      } else {
        await onSubmit(payload)
      }
    } catch {
      setFormError('저장하지 못했습니다.')
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!onDelete) return
    setDeleting(true)
    setFormError(null)
    try {
      await onDelete()
    } catch {
      setFormError('삭제하지 못했습니다.')
      setDeleting(false)
    }
  }

  return (
    <AppDialog open={open} onClose={onClose} fullWidth maxWidth="xs" slotProps={formDialogSlotProps}>
      <Box component="form" onSubmit={handleSubmit} sx={formDialogFormSx}>
        <FormDialogHeader onClose={onClose}>{mode === 'create' ? '수납장 추가' : '수납장 설정'}</FormDialogHeader>
        <DialogContent sx={formDialogContentSx}>
          <Box sx={formDialogContentScrollSx}>
            <Stack spacing={formDialogFieldStackSpacing} sx={formDialogFieldStackSx}>
              <TextField
                {...formDialogCompactTextFieldProps}
                select
                fullWidth
                label="타입"
                value={layoutType}
                onChange={(event) => {
                  const next = event.target.value as OrganizeLayoutType
                  setLayoutType(next)
                  applySuggestedLabel(next, cols, rows, shelves)
                }}
                sx={formDialogFirstFieldSx}
              >
                {ORGANIZE_LAYOUT_TYPES.map((type) => (
                  <MenuItem key={type.key} value={type.key}>
                    {type.label}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                {...formDialogCompactTextFieldProps}
                fullWidth
                label="이름"
                value={label}
                onChange={(event) => {
                  setAutoLabel(false)
                  setLabel(event.target.value)
                }}
                slotProps={{ htmlInput: { maxLength: ORGANIZE_CABINET_LABEL_MAX } }}
              />

              <TextField
                {...formDialogCompactTextFieldProps}
                fullWidth
                label="열"
                type="number"
                value={cols}
                onChange={(event) => {
                  const next = event.target.value
                  setCols(next)
                  applySuggestedLabel(layoutType, next, rows, shelves)
                }}
                slotProps={{ htmlInput: { min: ORGANIZE_DIM_MIN, max: ORGANIZE_DIM_MAX.cols } }}
              />

              {layoutType === 'grid' ? (
                <TextField
                  {...formDialogCompactTextFieldProps}
                  fullWidth
                  label="행"
                  type="number"
                  value={rows}
                  onChange={(event) => {
                    const next = event.target.value
                    setRows(next)
                    applySuggestedLabel(layoutType, cols, next, shelves)
                  }}
                  slotProps={{ htmlInput: { min: ORGANIZE_DIM_MIN, max: ORGANIZE_DIM_MAX.rows } }}
                />
              ) : (
                <>
                  <TextField
                    {...formDialogCompactTextFieldProps}
                    fullWidth
                    label="단 수"
                    type="number"
                    value={shelves}
                    onChange={(event) => {
                      const next = event.target.value
                      setShelves(next)
                      applySuggestedLabel(layoutType, cols, rows, next)
                    }}
                    slotProps={{ htmlInput: { min: ORGANIZE_DIM_MIN, max: ORGANIZE_DIM_MAX.shelves } }}
                  />
                  <TextField
                    {...formDialogCompactTextFieldProps}
                    fullWidth
                    label="단당 행"
                    type="number"
                    value={shelfRows}
                    onChange={(event) => setShelfRows(event.target.value)}
                    slotProps={{ htmlInput: { min: ORGANIZE_DIM_MIN, max: ORGANIZE_DIM_MAX.shelfRows } }}
                  />
                </>
              )}

              <Box>
                <Typography fontSize="0.8rem" fontWeight={700} color="text.secondary" sx={{ mb: 0.75 }}>
                  색상
                </Typography>
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
                    gap: 0.75,
                  }}
                >
                  {ORGANIZE_COLOR_PRESETS.map((preset) => {
                    const selected = colorPresetId === preset.id
                    return (
                      <Box
                        key={preset.id}
                        component="button"
                        type="button"
                        aria-label={preset.label}
                        title={preset.label}
                        onClick={() => setColorPresetId(preset.id)}
                        sx={{
                          height: 30,
                          m: 0,
                          p: 0,
                          border: '2px solid',
                          borderColor: selected ? preset.color : 'transparent',
                          borderRadius: 1,
                          bgcolor: preset.color,
                          cursor: 'pointer',
                          boxShadow: selected ? `0 0 0 2px ${alpha(preset.color, 0.25)}` : 'none',
                        }}
                      />
                    )
                  })}
                </Box>
              </Box>

              <Typography variant="caption" color="text.secondary" sx={{ px: 0.25 }}>
                {layoutType === 'grid'
                  ? '예: 5×4 → 열 5, 행 4'
                  : '예: 메인 4단 → 단 4, 열 5, 단당 행 2 (= 단마다 5×2)'}
              </Typography>

              {formError ? (
                <Typography color="error" fontSize="0.8rem" fontWeight={700}>
                  {formError}
                </Typography>
              ) : null}
            </Stack>
          </Box>
        </DialogContent>
        <FormDialogFooter
          onDelete={mode === 'edit' && onDelete ? handleDelete : undefined}
          deleteLoading={deleting}
          submitLoading={submitting}
          submitLabel={mode === 'create' ? '추가' : '저장'}
        />
      </Box>
    </AppDialog>
  )
}
