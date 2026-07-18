'use client'
// 수정: Auto — 2026-07-19 03:15 (지역가입자 고지서 입력)

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
  computeHealthInsurance,
  defaultHealthInsuranceDetail,
  type HealthInsuranceDetail,
} from '@/lib/healthInsuranceDetail'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { alpha } from '@mui/material/styles'
import { useEffect, useMemo, useState } from 'react'

type Props = {
  open: boolean
  initial: HealthInsuranceDetail | null
  expenseTitle?: string
  onClose: () => void
  onSave: (detail: HealthInsuranceDetail) => void
}

const wideSlotProps = {
  paper: {
    sx: {
      ...formDialogPaperSlotSx,
      maxWidth: 480,
      width: { xs: 'calc(100% - 20px)', sm: 'calc(100% - 32px)' },
      mx: { xs: 1.25, sm: 2 },
    },
  },
} as const

function parseWonInput(raw: string): number {
  return Math.round(Number(raw.replace(/[^\d]/g, ''))) || 0
}

function parseDecimalInput(raw: string): number {
  const cleaned = raw.replace(/[^\d.]/g, '')
  const n = Number(cleaned)
  return Number.isFinite(n) && n >= 0 ? n : 0
}

type FieldKey = keyof Omit<HealthInsuranceDetail, 'kind'>

const INPUT_FIELDS: { key: FieldKey; no: string; label: string; unit: '원' | '점' | '단가' }[] = [
  { key: 'incomePremium', no: '①', label: '소득월액보험료', unit: '원' },
  { key: 'propertyPoints', no: '②', label: '재산 점수', unit: '점' },
  { key: 'propertyPointUnit', no: '③', label: '재산보험료 점수당 단가', unit: '단가' },
  { key: 'reduction', no: '④', label: '경감·정지·제외', unit: '원' },
  { key: 'temporaryReduction', no: '⑤', label: '한시적 감액', unit: '원' },
  { key: 'healthExemption', no: '⑦', label: '건강 면제·지원금', unit: '원' },
  { key: 'longTermCarePremium', no: '⑧', label: '장기요양보험료', unit: '원' },
  { key: 'longTermCareExemption', no: '⑨', label: '장기 면제·지원금', unit: '원' },
]

export function MonthlyHealthInsuranceEditorDialog({
  open,
  initial,
  expenseTitle,
  onClose,
  onSave,
}: Props) {
  const [detail, setDetail] = useState<HealthInsuranceDetail>(() => defaultHealthInsuranceDetail())

  useEffect(() => {
    if (!open) return
    setDetail(initial ? structuredClone(initial) : defaultHealthInsuranceDetail())
  }, [open, initial])

  const computed = useMemo(() => computeHealthInsurance(detail), [detail])

  const setField = (key: FieldKey, value: number) => {
    setDetail((prev) => ({ ...prev, [key]: value }))
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
          건강보험료 입력 (지역가입자)
          {expenseTitle ? ` · ${expenseTitle}` : ''}
        </Typography>
      </FormDialogHeader>
      <DialogContent sx={{ ...formDialogContentSx, px: { xs: 1.5, sm: 2 } }} dividers={false}>
        <Box sx={formDialogContentScrollSx}>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block', mb: 1 }}>
            고지서「지역보험료 부과 상세내역」기준으로 입력하세요. ③·⑥·납부액은 자동 계산됩니다.
          </Typography>
          <Stack spacing={formDialogFieldStackSpacing}>
            {INPUT_FIELDS.map((field) => {
              const value = detail[field.key]
              const display =
                field.unit === '단가'
                  ? value
                    ? String(value)
                    : ''
                  : value
                    ? String(value)
                    : ''
              return (
                <TextField
                  key={field.key}
                  label={`${field.no} ${field.label}`}
                  value={display}
                  onChange={(e) => {
                    if (field.unit === '단가' || field.unit === '점') {
                      setField(field.key, parseDecimalInput(e.target.value))
                    } else {
                      setField(field.key, parseWonInput(e.target.value))
                    }
                  }}
                  fullWidth
                  inputProps={{ inputMode: field.unit === '단가' ? 'decimal' : 'numeric' }}
                  InputProps={{
                    endAdornment: (
                      <Typography variant="body2" color="text.secondary">
                        {field.unit === '단가' ? '원/점' : field.unit}
                      </Typography>
                    ),
                  }}
                  helperText={
                    field.key === 'propertyPointUnit'
                      ? `재산보험료 ③ = ② × 단가 → ${formatWon(computed.propertyPremium)}`
                      : undefined
                  }
                  {...formDialogCompactTextFieldProps}
                />
              )
            })}

            <Box
              sx={{
                border: 1,
                borderColor: 'divider',
                borderRadius: 1.75,
                px: 1.25,
                py: 1,
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.05),
              }}
            >
              <Stack spacing={0.45}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                  자동 계산
                </Typography>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    ③ 재산보험료
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 800 }}>
                    {formatWon(computed.propertyPremium)}
                  </Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    ⑥ 건강보험료
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 800 }}>
                    {formatWon(computed.healthPremium)}
                  </Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between" sx={{ pt: 0.35 }}>
                  <Typography sx={{ fontWeight: 800 }}>계 납부보험료</Typography>
                  <Typography sx={{ fontWeight: 900, color: 'primary.main' }}>
                    {formatWon(computed.totalPayable)}
                  </Typography>
                </Stack>
              </Stack>
            </Box>
          </Stack>
        </Box>
      </DialogContent>
      <DialogActions sx={{ ...formDialogActionsSx, px: { xs: 1.5, sm: 2 } }}>
        <Button onClick={onClose}>취소</Button>
        <Button variant="contained" onClick={handleSave} disabled={computed.totalPayable < 1}>
          반영
        </Button>
      </DialogActions>
    </AppDialog>
  )
}
