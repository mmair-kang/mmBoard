'use client'
// 수정: Auto — 2026-07-19 03:25 (국민연금·건보 상세 편집)
// 수정: Auto — 2026-07-19 03:15 (통신비 상세 편집)

import { AppDialog } from '@/components/common/AppDialog'
import { FormDialogHeader } from '@/components/common/FormDialogHeader'
import {
  formDialogActionsSx,
  formDialogCompactTextFieldProps,
  formDialogContentScrollSx,
  formDialogContentSx,
  formDialogFieldStackSpacing,
  formDialogPaperSlotSx,
  formDialogSlotProps,
} from '@/config/formDialogLayout'
import { formatWon } from '@/lib/annualPaymentCalc'
import {
  defaultExpenseDetail,
  emptyTelecomDiscount,
  emptyTelecomRow,
  emptyTelecomSection,
  getExpenseDetailDialogTitle,
  getExpenseDetailFieldLabels,
  rowSettlement,
  sectionTotal,
  telecomGrandTotal,
  type MonthlySectionDetailType,
  type TelecomDetail,
  type TelecomDetailSection,
} from '@/lib/telecomExpenseDetail'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { alpha } from '@mui/material/styles'
import { useEffect, useMemo, useState } from 'react'

type Props = {
  open: boolean
  expenseType: MonthlySectionDetailType
  initial: TelecomDetail | null
  expenseTitle?: string
  onClose: () => void
  onSave: (detail: TelecomDetail) => void
}

const wideSlotProps = {
  paper: {
    sx: {
      ...formDialogPaperSlotSx,
      maxWidth: 560,
      width: { xs: 'calc(100% - 20px)', sm: 'calc(100% - 32px)' },
      mx: { xs: 1.25, sm: 2 },
    },
  },
} as const

export function MonthlyTelecomDetailEditorDialog({
  open,
  expenseType,
  initial,
  expenseTitle,
  onClose,
  onSave,
}: Props) {
  const labels = getExpenseDetailFieldLabels(expenseType)
  const [detail, setDetail] = useState<TelecomDetail>(() => defaultExpenseDetail(expenseType))

  useEffect(() => {
    if (!open) return
    setDetail(
      initial?.sections.length ? structuredClone(initial) : defaultExpenseDetail(expenseType),
    )
  }, [open, initial, expenseType])

  const total = useMemo(() => telecomGrandTotal(detail), [detail])

  const updateSection = (sectionId: string, patch: Partial<TelecomDetailSection>) => {
    setDetail((prev) => ({
      sections: prev.sections.map((s) => (s.id === sectionId ? { ...s, ...patch } : s)),
    }))
  }

  const handleSave = () => {
    onSave(detail)
    onClose()
  }

  return (
    <AppDialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      slotProps={{ ...formDialogSlotProps, ...wideSlotProps }}
    >
      <FormDialogHeader onClose={onClose}>
        <Typography sx={{ fontSize: '1.05rem', fontWeight: 700 }}>
          {getExpenseDetailDialogTitle(expenseType)}
          {expenseTitle ? ` · ${expenseTitle}` : ''}
        </Typography>
      </FormDialogHeader>
      <DialogContent sx={{ ...formDialogContentSx, px: { xs: 1.5, sm: 2 } }} dividers={false}>
        <Box sx={formDialogContentScrollSx}>
          <Stack spacing={1.5}>
            {detail.sections.map((section) => (
              <Box
                key={section.id}
                sx={{
                  border: 1,
                  borderColor: 'divider',
                  borderRadius: 2,
                  p: 1.1,
                  bgcolor: (theme) => alpha(theme.palette.action.hover, 0.25),
                }}
              >
                <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mb: 1 }}>
                  <TextField
                    label="구분"
                    value={section.title}
                    onChange={(e) => updateSection(section.id, { title: e.target.value })}
                    fullWidth
                    placeholder="모바일"
                    {...formDialogCompactTextFieldProps}
                  />
                  <IconButton
                    size="small"
                    aria-label="구분 삭제"
                    color="error"
                    disabled={detail.sections.length <= 1}
                    onClick={() =>
                      setDetail((prev) => ({
                        sections: prev.sections.filter((s) => s.id !== section.id),
                      }))
                    }
                  >
                    <DeleteOutlineRoundedIcon fontSize="small" />
                  </IconButton>
                </Stack>

                <Stack spacing={1}>
                  {section.rows.map((row) => {
                    const settled = rowSettlement(row)
                    return (
                      <Box
                        key={row.id}
                        sx={{
                          border: 1,
                          borderColor: 'divider',
                          borderRadius: 1.5,
                          p: 1,
                          bgcolor: 'background.paper',
                        }}
                      >
                        <Stack spacing={formDialogFieldStackSpacing}>
                          <Stack direction="row" spacing={0.75} alignItems="flex-start">
                            <TextField
                              label={labels.rowName}
                              value={row.name}
                              onChange={(e) =>
                                updateSection(section.id, {
                                  rows: section.rows.map((r) =>
                                    r.id === row.id ? { ...r, name: e.target.value } : r,
                                  ),
                                })
                              }
                              fullWidth
                              placeholder={labels.rowName}
                              {...formDialogCompactTextFieldProps}
                            />
                            <IconButton
                              size="small"
                              aria-label="행 삭제"
                              color="error"
                              disabled={section.rows.length <= 1}
                              onClick={() =>
                                updateSection(section.id, {
                                  rows: section.rows.filter((r) => r.id !== row.id),
                                })
                              }
                              sx={{ mt: 0.5 }}
                            >
                              <DeleteOutlineRoundedIcon fontSize="small" />
                            </IconButton>
                          </Stack>

                          <TextField
                            label={labels.listPrice}
                            value={row.listPrice ? String(row.listPrice) : ''}
                            onChange={(e) => {
                              const n = Math.round(Number(e.target.value.replace(/[^\d]/g, ''))) || 0
                              updateSection(section.id, {
                                rows: section.rows.map((r) =>
                                  r.id === row.id ? { ...r, listPrice: n } : r,
                                ),
                              })
                            }}
                            fullWidth
                            inputProps={{ inputMode: 'numeric' }}
                            InputProps={{ endAdornment: <Typography variant="body2">원</Typography> }}
                            {...formDialogCompactTextFieldProps}
                          />

                          <Box>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ fontWeight: 700, mb: 0.5, display: 'block' }}
                            >
                              {labels.discount}
                            </Typography>
                            <Stack spacing={0.65}>
                              {row.discounts.map((d) => (
                                <Stack key={d.id} direction="row" spacing={0.5} alignItems="center">
                                  <TextField
                                    label={`${labels.discount}명`}
                                    value={d.name}
                                    onChange={(e) =>
                                      updateSection(section.id, {
                                        rows: section.rows.map((r) =>
                                          r.id === row.id
                                            ? {
                                                ...r,
                                                discounts: r.discounts.map((x) =>
                                                  x.id === d.id ? { ...x, name: e.target.value } : x,
                                                ),
                                              }
                                            : r,
                                        ),
                                      })
                                    }
                                    fullWidth
                                    {...formDialogCompactTextFieldProps}
                                  />
                                  <TextField
                                    label={labels.discountAmount}
                                    value={d.amount ? String(d.amount) : ''}
                                    onChange={(e) => {
                                      const n =
                                        Math.round(Number(e.target.value.replace(/[^\d]/g, ''))) || 0
                                      updateSection(section.id, {
                                        rows: section.rows.map((r) =>
                                          r.id === row.id
                                            ? {
                                                ...r,
                                                discounts: r.discounts.map((x) =>
                                                  x.id === d.id ? { ...x, amount: n } : x,
                                                ),
                                              }
                                            : r,
                                        ),
                                      })
                                    }}
                                    inputProps={{ inputMode: 'numeric' }}
                                    {...formDialogCompactTextFieldProps}
                                    sx={{
                                      ...(typeof formDialogCompactTextFieldProps.sx === 'object'
                                        ? formDialogCompactTextFieldProps.sx
                                        : {}),
                                      width: 110,
                                      flexShrink: 0,
                                    }}
                                  />
                                  <IconButton
                                    size="small"
                                    aria-label={`${labels.discount} 삭제`}
                                    onClick={() =>
                                      updateSection(section.id, {
                                        rows: section.rows.map((r) =>
                                          r.id === row.id
                                            ? {
                                                ...r,
                                                discounts: r.discounts.filter((x) => x.id !== d.id),
                                              }
                                            : r,
                                        ),
                                      })
                                    }
                                  >
                                    <DeleteOutlineRoundedIcon fontSize="small" />
                                  </IconButton>
                                </Stack>
                              ))}
                              <Button
                                size="small"
                                startIcon={<AddRoundedIcon />}
                                onClick={() =>
                                  updateSection(section.id, {
                                    rows: section.rows.map((r) =>
                                      r.id === row.id
                                        ? { ...r, discounts: [...r.discounts, emptyTelecomDiscount()] }
                                        : r,
                                    ),
                                  })
                                }
                                sx={{ alignSelf: 'flex-start', fontWeight: 700 }}
                              >
                                {labels.addDiscount}
                              </Button>
                            </Stack>
                          </Box>

                          <TextField
                            label="비고"
                            value={row.note}
                            onChange={(e) =>
                              updateSection(section.id, {
                                rows: section.rows.map((r) =>
                                  r.id === row.id ? { ...r, note: e.target.value } : r,
                                ),
                              })
                            }
                            fullWidth
                            placeholder={
                              expenseType === 'telecom' ? '약정기간 등' : '산정 근거·고지서 메모'
                            }
                            {...formDialogCompactTextFieldProps}
                          />

                          <Typography
                            variant="body2"
                            sx={{ fontWeight: 800, color: 'text.secondary', textAlign: 'right' }}
                          >
                            {labels.settlement} {formatWon(settled)}
                          </Typography>
                        </Stack>
                      </Box>
                    )
                  })}
                </Stack>

                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 1 }}>
                  <Button
                    size="small"
                    startIcon={<AddRoundedIcon />}
                    onClick={() =>
                      updateSection(section.id, { rows: [...section.rows, emptyTelecomRow()] })
                    }
                    sx={{ fontWeight: 700 }}
                  >
                    항목 추가
                  </Button>
                  <Typography sx={{ fontWeight: 900, fontSize: '0.9rem' }}>
                    소계 {formatWon(sectionTotal(section))}
                  </Typography>
                </Stack>
              </Box>
            ))}

            <Button
              variant="outlined"
              startIcon={<AddRoundedIcon />}
              onClick={() =>
                setDetail((prev) => ({
                  sections: [...prev.sections, emptyTelecomSection('')],
                }))
              }
              sx={{ fontWeight: 700 }}
            >
              구분 추가
            </Button>
          </Stack>
        </Box>
      </DialogContent>
      <DialogActions
        sx={{
          ...formDialogActionsSx,
          px: { xs: 1.5, sm: 2 },
          justifyContent: 'space-between',
        }}
      >
        <Typography sx={{ fontWeight: 900, color: 'primary.main' }}>합계 {formatWon(total)}</Typography>
        <Stack direction="row" spacing={1}>
          <Button onClick={onClose} size="small">
            취소
          </Button>
          <Button variant="contained" onClick={handleSave} size="small" disabled={total < 1}>
            적용
          </Button>
        </Stack>
      </DialogActions>
    </AppDialog>
  )
}
