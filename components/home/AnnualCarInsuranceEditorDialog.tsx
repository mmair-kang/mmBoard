'use client'
// 수정: Auto — 2026-07-19 15:05 (보장내용 입력 1행 압축)
// 수정: Auto — 2026-07-19 14:40 (연납 자동차보험 입력)

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
  carInsuranceAnnualGrandTotal,
  defaultCarInsuranceAnnualDetail,
  emptyCarInsuranceCoverage,
  type CarInsuranceAnnualDetail,
  type CarInsuranceCoverageRow,
} from '@/lib/carInsuranceAnnualDetail'
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
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import dayjs, { type Dayjs } from 'dayjs'
import { useEffect, useMemo, useState } from 'react'

type Props = {
  open: boolean
  initial: CarInsuranceAnnualDetail | null
  paymentTitle?: string
  onClose: () => void
  onSave: (detail: CarInsuranceAnnualDetail) => void
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

const dateSlotProps = {
  textField: {
    ...formDialogCompactTextFieldProps,
    fullWidth: true,
  },
  field: { clearable: true },
} as const

function parseWonInput(raw: string): number {
  return Math.round(Number(raw.replace(/[^\d]/g, ''))) || 0
}

function toIso(value: Dayjs | null): string {
  return value && value.isValid() ? value.format('YYYY-MM-DD') : ''
}

export function AnnualCarInsuranceEditorDialog({
  open,
  initial,
  paymentTitle,
  onClose,
  onSave,
}: Props) {
  const [detail, setDetail] = useState<CarInsuranceAnnualDetail>(() => defaultCarInsuranceAnnualDetail())

  useEffect(() => {
    if (!open) return
    setDetail(initial ? structuredClone(initial) : defaultCarInsuranceAnnualDetail())
  }, [open, initial])

  const total = useMemo(() => carInsuranceAnnualGrandTotal(detail), [detail])

  const patch = (partial: Partial<CarInsuranceAnnualDetail>) => {
    setDetail((prev) => ({ ...prev, ...partial }))
  }

  const updateCoverage = (id: string, partial: Partial<CarInsuranceCoverageRow>) => {
    setDetail((prev) => ({
      ...prev,
      coverages: prev.coverages.map((row) => (row.id === id ? { ...row, ...partial } : row)),
    }))
  }

  const removeCoverage = (id: string) => {
    setDetail((prev) => ({
      ...prev,
      coverages: prev.coverages.filter((row) => row.id !== id),
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
          자동차보험 상세 입력
          {paymentTitle ? ` · ${paymentTitle}` : ''}
        </Typography>
      </FormDialogHeader>
      <DialogContent sx={{ ...formDialogContentSx, px: { xs: 1.5, sm: 2 } }} dividers={false}>
        <Box sx={formDialogContentScrollSx}>
          <Stack spacing={formDialogFieldStackSpacing}>
            <TextField
              label="보험상품명"
              value={detail.productName}
              onChange={(e) => patch({ productName: e.target.value })}
              fullWidth
              placeholder="다이렉트 자동차보험"
              {...formDialogCompactTextFieldProps}
            />

            <DatePicker
              label="보험기간 만료일"
              value={detail.expiresOn ? dayjs(detail.expiresOn) : null}
              onChange={(v) => patch({ expiresOn: toIso(v) })}
              format="YYYY.MM.DD"
              slotProps={dateSlotProps}
            />
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, mt: -0.75 }}>
              1년 단위 · 만료일만 입력합니다
            </Typography>

            <Typography sx={{ fontWeight: 800, fontSize: '0.88rem', color: 'primary.main' }}>
              특약정보
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={0.75}>
              <TextField
                label="할인할증"
                value={detail.discountGrade}
                onChange={(e) => patch({ discountGrade: e.target.value })}
                fullWidth
                placeholder="26Z"
                {...formDialogCompactTextFieldProps}
              />
              <TextField
                label="물적사고기준"
                value={detail.propertyDamageBase}
                onChange={(e) => patch({ propertyDamageBase: e.target.value })}
                fullWidth
                placeholder="200만원"
                {...formDialogCompactTextFieldProps}
              />
            </Stack>

            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Typography sx={{ fontWeight: 800, fontSize: '0.88rem', color: 'primary.main' }}>
                보장내용 및 보험료
              </Typography>
              <Button
                size="small"
                startIcon={<AddRoundedIcon />}
                onClick={() =>
                  patch({ coverages: [...detail.coverages, emptyCarInsuranceCoverage()] })
                }
                sx={{ fontWeight: 700 }}
              >
                담보 추가
              </Button>
            </Stack>

            <Stack spacing={0.65}>
              {detail.coverages.map((row) => (
                <Box
                  key={row.id}
                  sx={{
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 1.5,
                    px: 1,
                    py: 0.75,
                    bgcolor: (theme) => alpha(theme.palette.action.hover, 0.03),
                  }}
                >
                  <Stack spacing={0.55}>
                    <Stack direction="row" spacing={0.5} alignItems="flex-start">
                      <TextField
                        label="담보명"
                        value={row.name}
                        onChange={(e) => updateCoverage(row.id, { name: e.target.value })}
                        fullWidth
                        {...formDialogCompactTextFieldProps}
                      />
                      <TextField
                        label="보험료"
                        value={row.premium ? String(row.premium) : ''}
                        onChange={(e) => updateCoverage(row.id, { premium: parseWonInput(e.target.value) })}
                        inputProps={{ inputMode: 'numeric' }}
                        InputProps={{ endAdornment: <Typography variant="body2">원</Typography> }}
                        {...formDialogCompactTextFieldProps}
                        sx={{ ...formDialogCompactTextFieldProps.sx, width: 118, flexShrink: 0 }}
                      />
                      <IconButton
                        size="small"
                        aria-label="담보 삭제"
                        onClick={() => removeCoverage(row.id)}
                        disabled={detail.coverages.length <= 1}
                        sx={{ mt: 0.35 }}
                      >
                        <DeleteOutlineRoundedIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={0.5}>
                      <TextField
                        label="가입금액·한도"
                        value={row.limitLabel}
                        onChange={(e) => updateCoverage(row.id, { limitLabel: e.target.value })}
                        fullWidth
                        placeholder="1억5천만원"
                        {...formDialogCompactTextFieldProps}
                      />
                      <TextField
                        label="부가설명"
                        value={row.note}
                        onChange={(e) => updateCoverage(row.id, { note: e.target.value })}
                        fullWidth
                        placeholder="차량단독 사고 보장"
                        {...formDialogCompactTextFieldProps}
                      />
                    </Stack>
                  </Stack>
                </Box>
              ))}
            </Stack>

            <Box
              sx={{
                borderRadius: 1.75,
                px: 1.25,
                py: 1,
                bgcolor: (theme) =>
                  theme.palette.mode === 'dark' ? alpha(theme.palette.primary.main, 0.28) : '#0f766e',
                color: '#fff',
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography sx={{ fontWeight: 800, fontSize: '0.88rem' }}>보험료 총액</Typography>
                <Typography sx={{ fontWeight: 900, fontSize: '1rem' }}>{formatWon(total)}</Typography>
              </Stack>
            </Box>
          </Stack>
        </Box>
      </DialogContent>
      <DialogActions sx={{ ...formDialogActionsSx, px: { xs: 1.5, sm: 2 } }}>
        <Button onClick={onClose}>취소</Button>
        <Button variant="contained" onClick={handleSave} disabled={total < 1}>
          반영
        </Button>
      </DialogActions>
    </AppDialog>
  )
}
