'use client'
// 수정: Auto — 2026-07-19 02:45 (목록 칩 토글)
// 수정: Auto — 2026-07-19 02:15 (항목 수정 시 삭제)
// 수정: Auto — 2026-07-19 01:40 (항목명만 추가·수정)

import { AppDialog } from '@/components/common/AppDialog'
import { FormDialogFooter } from '@/components/common/FormDialogFooter'
import { FormDialogHeader } from '@/components/common/FormDialogHeader'
import { sxCollectionFoodMetricChip } from '@/components/collection/collectionStyles'
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
import { getFoodScopeLabel, type FoodScopeKey } from '@/config/collectionCategories'
import {
  COLLECTION_FOOD_LIST_CHIP_OPTIONS,
  defaultFoodListChipFlags,
  foodListChipFlagsEqual,
  type CollectionFoodListChipFlags,
  type CollectionFoodListChipKey,
} from '@/lib/collectionFoodListChips'
import Box from '@mui/material/Box'
import DialogContent from '@mui/material/DialogContent'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { alpha } from '@mui/material/styles'
import { useEffect, useState } from 'react'

type Props = {
  open: boolean
  mode: 'create' | 'rename'
  foodScope: FoodScopeKey
  subLabel: string
  initialName?: string
  initialListChipFlags?: CollectionFoodListChipFlags
  onClose: () => void
  onSubmit: (name: string, listChipFlags: CollectionFoodListChipFlags) => Promise<void>
  onDelete?: () => Promise<void>
}

export function CollectionProductNameDialog({
  open,
  mode,
  foodScope,
  subLabel,
  initialName = '',
  initialListChipFlags,
  onClose,
  onSubmit,
  onDelete,
}: Props) {
  const [name, setName] = useState('')
  const [listChipFlags, setListChipFlags] = useState<CollectionFoodListChipFlags>(() =>
    defaultFoodListChipFlags(),
  )
  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) {
      setName('')
      setListChipFlags(defaultFoodListChipFlags())
      setSubmitting(false)
      setDeleting(false)
      setFormError(null)
      return
    }
    setName(initialName)
    setListChipFlags(initialListChipFlags ?? defaultFoodListChipFlags())
    setSubmitting(false)
    setDeleting(false)
    setFormError(null)
    // open 시점에만 초기값 반영 (부모 리렌더로 토글이 리셋되지 않게)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialName])

  const trimmed = name.trim()
  const initialFlags = initialListChipFlags ?? defaultFoodListChipFlags()
  const nameUnchanged = mode === 'rename' && trimmed === initialName.trim()
  const chipsUnchanged = foodListChipFlagsEqual(listChipFlags, initialFlags)
  const busy = submitting || deleting
  const canSubmit =
    trimmed.length > 0 &&
    !busy &&
    (mode === 'create' || !nameUnchanged || !chipsUnchanged)

  const toggleChip = (key: CollectionFoodListChipKey) => {
    setListChipFlags((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return
    setSubmitting(true)
    setFormError(null)
    try {
      await onSubmit(trimmed, listChipFlags)
      onClose()
    } catch (err) {
      setFormError(err instanceof Error ? err.message : '저장에 실패했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!onDelete || deleting) return
    setDeleting(true)
    setFormError(null)
    try {
      await onDelete()
      onClose()
    } catch (err) {
      setFormError(err instanceof Error ? err.message : '삭제에 실패했습니다.')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <AppDialog open={open} onClose={onClose} fullWidth maxWidth="xs" disableAutoFocus slotProps={formDialogSlotProps}>
      <Box component="form" onSubmit={handleSubmit} sx={formDialogFormSx}>
        <FormDialogHeader onClose={onClose} closeDisabled={busy}>
          <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap" useFlexGap>
            <Typography component="span" variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
              {getFoodScopeLabel(foodScope)} · {subLabel}
            </Typography>
            <Typography component="span" sx={{ fontSize: '1.05rem', fontWeight: 700 }}>
              {mode === 'create' ? '항목 추가' : '항목 수정'}
            </Typography>
          </Stack>
        </FormDialogHeader>
        <DialogContent sx={formDialogContentSx} dividers={false}>
          <Box sx={formDialogContentScrollSx}>
            <Stack spacing={formDialogFieldStackSpacing} sx={formDialogFieldStackSx}>
              <TextField
                label="항목 이름"
                placeholder="예: 체다치즈"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                fullWidth
                autoFocus
                {...formDialogCompactTextFieldProps}
                sx={formDialogFirstFieldSx}
              />

              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontWeight: 700, mb: 0.75, display: 'block' }}
                >
                  목록 칩 · 눌러서 끄기
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {COLLECTION_FOOD_LIST_CHIP_OPTIONS.map((option) => {
                    const active = listChipFlags[option.key]
                    const isPrice = option.key === 'unitPrice' || option.key === 'perPiece'
                    return (
                      <Box
                        key={option.key}
                        component="button"
                        type="button"
                        onClick={() => toggleChip(option.key)}
                        sx={{
                          ...sxCollectionFoodMetricChip(isPrice),
                          fontFamily: 'inherit',
                          cursor: 'pointer',
                          border: '1px solid',
                          borderColor: active ? 'transparent' : 'divider',
                          opacity: active ? 1 : 0.4,
                          textDecoration: active ? 'none' : 'line-through',
                          bgcolor: active
                            ? undefined
                            : (theme) =>
                                alpha(theme.palette.grey[500], theme.palette.mode === 'dark' ? 0.12 : 0.06),
                          color: active ? undefined : 'text.disabled',
                        }}
                      >
                        {option.label}
                      </Box>
                    )
                  })}
                </Box>
              </Box>

              {formError ? (
                <Typography variant="body2" color="error" sx={{ fontWeight: 600 }}>
                  {formError}
                </Typography>
              ) : null}
            </Stack>
          </Box>
        </DialogContent>
        <FormDialogFooter
          onDelete={mode === 'rename' && onDelete ? () => void handleDelete() : undefined}
          deleteLoading={deleting}
          submitLabel={mode === 'create' ? '추가' : '저장'}
          submitLoading={submitting}
          submitDisabled={!canSubmit}
        />
      </Box>
    </AppDialog>
  )
}
