'use client'
// 수정: Auto — 2026-07-19 10:20 (③ 단가 단위 원)
// 수정: Auto — 2026-07-19 10:15 (⑥ 원단위 내림 안내)
// 수정: Auto — 2026-07-19 10:10 (⑧ 원단위 내림 안내)
// 수정: Auto — 2026-07-19 10:05 (⑧ 요율 소수 입력·공식 명확화)
// 수정: Auto — 2026-07-19 10:00 (⑧ 장기보험료율 자동계산)
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

/** 입력 중 "13." / "13.14" 유지용 — 숫자 변환은 별도 */
function sanitizeDecimalText(raw: string): string {
  let cleaned = raw.replace(/[^\d.]/g, '')
  const firstDot = cleaned.indexOf('.')
  if (firstDot !== -1) {
    cleaned =
      cleaned.slice(0, firstDot + 1) + cleaned.slice(firstDot + 1).replace(/\./g, '')
  }
  return cleaned
}

function parseDecimalNumber(text: string): number {
  if (!text || text === '.') return 0
  const n = Number(text)
  return Number.isFinite(n) && n >= 0 ? n : 0
}

function formatDecimalField(value: number): string {
  if (!value) return ''
  return String(value)
}

type FieldKey = keyof Omit<HealthInsuranceDetail, 'kind'>

const INPUT_FIELDS: {
  key: FieldKey
  no: string
  label: string
  unit: '원' | '점' | '단가' | '%'
}[] = [
  { key: 'incomePremium', no: '①', label: '소득월액보험료', unit: '원' },
  { key: 'propertyPoints', no: '②', label: '재산 점수', unit: '점' },
  { key: 'propertyPointUnit', no: '③', label: '재산보험료 점수당 단가', unit: '단가' },
  { key: 'reduction', no: '④', label: '경감·정지·제외', unit: '원' },
  { key: 'temporaryReduction', no: '⑤', label: '한시적 감액', unit: '원' },
  { key: 'healthExemption', no: '⑦', label: '건강 면제·지원금', unit: '원' },
  { key: 'longTermCareRate', no: '⑧', label: '장기요양보험료율', unit: '%' },
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
  /** 소수 입력 필드 텍스트 (입력 중 끝자리 "." 유지) */
  const [decimalTexts, setDecimalTexts] = useState<Partial<Record<FieldKey, string>>>({})

  useEffect(() => {
    if (!open) return
    const next = initial ? structuredClone(initial) : defaultHealthInsuranceDetail()
    setDetail(next)
    setDecimalTexts({
      propertyPoints: formatDecimalField(next.propertyPoints),
      propertyPointUnit: formatDecimalField(next.propertyPointUnit),
      longTermCareRate: formatDecimalField(next.longTermCareRate),
    })
  }, [open, initial])

  const computed = useMemo(() => computeHealthInsurance(detail), [detail])

  const setField = (key: FieldKey, value: number) => {
    setDetail((prev) => ({ ...prev, [key]: value }))
  }

  const handleDecimalChange = (key: FieldKey, raw: string) => {
    const text = sanitizeDecimalText(raw)
    setDecimalTexts((prev) => ({ ...prev, [key]: text }))
    setField(key, parseDecimalNumber(text))
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
            고지서「지역보험료 부과 상세내역」기준으로 입력하세요. ③·⑥·⑧·납부액은 자동 계산됩니다.
          </Typography>
          <Stack spacing={formDialogFieldStackSpacing}>
            {INPUT_FIELDS.map((field) => {
              const isDecimal = field.unit === '단가' || field.unit === '점' || field.unit === '%'
              const value = detail[field.key]
              const display = isDecimal
                ? (decimalTexts[field.key] ?? formatDecimalField(value))
                : value
                  ? String(value)
                  : ''

              return (
                <TextField
                  key={field.key}
                  label={`${field.no} ${field.label}`}
                  value={display}
                  onChange={(e) => {
                    if (isDecimal) {
                      handleDecimalChange(field.key, e.target.value)
                    } else {
                      setField(field.key, parseWonInput(e.target.value))
                    }
                  }}
                  fullWidth
                  inputProps={{ inputMode: isDecimal ? 'decimal' : 'numeric' }}
                  InputProps={{
                    endAdornment: (
                      <Typography variant="body2" color="text.secondary">
                        {field.unit === '단가' || field.unit === '원' ? '원' : field.unit}
                      </Typography>
                    ),
                  }}
                  helperText={
                    field.key === 'propertyPointUnit'
                      ? `재산보험료 ③ = ② × 단가 → ${formatWon(computed.propertyPremium)}`
                      : field.key === 'longTermCareRate'
                        ? `⑧ = (①+(②×③)) × ${detail.longTermCareRate || 0}% → ${formatWon(computed.longTermCarePremium)} (원단위 내림)`
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
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                  ※ (①+③)−(④+⑤) 계산 후 원단위 내림 (예: 51,039 → 51,030)
                </Typography>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    ⑧ 장기요양보험료
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 800 }}>
                    {formatWon(computed.longTermCarePremium)}
                  </Typography>
                </Stack>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                  ※ (①+(②×③)) × 요율% 계산 후 원단위 내림 (예: 6,706 → 6,700)
                </Typography>
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
