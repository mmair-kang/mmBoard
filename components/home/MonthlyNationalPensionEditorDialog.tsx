'use client'
// 수정: Auto — 2026-07-19 03:30 (국민연금 결정내역 입력)

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
  computeNationalPension,
  defaultNationalPensionDetail,
  type NationalPensionDetail,
} from '@/lib/nationalPensionDetail'
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
  initial: NationalPensionDetail | null
  expenseTitle?: string
  onClose: () => void
  onSave: (detail: NationalPensionDetail) => void
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

type FieldKey = keyof Omit<NationalPensionDetail, 'kind'>

const INPUT_FIELDS: { key: FieldKey; label: string }[] = [
  { key: 'standardMonthlyIncome', label: '당월분 기준소득월액' },
  { key: 'currentPremium', label: '당월분 보험료' },
  { key: 'deduction', label: '공제금액' },
  { key: 'retroactivePremium', label: '소급분 보험료' },
  { key: 'currentSubsidy', label: '당월 국고보조금' },
  { key: 'retroactiveSubsidy', label: '소급분 국고보조금' },
]

export function MonthlyNationalPensionEditorDialog({
  open,
  initial,
  expenseTitle,
  onClose,
  onSave,
}: Props) {
  const [detail, setDetail] = useState<NationalPensionDetail>(() => defaultNationalPensionDetail())

  useEffect(() => {
    if (!open) return
    setDetail(initial ? structuredClone(initial) : defaultNationalPensionDetail())
  }, [open, initial])

  const computed = useMemo(() => computeNationalPension(detail), [detail])

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
          국민연금 입력 (지역가입자)
          {expenseTitle ? ` · ${expenseTitle}` : ''}
        </Typography>
      </FormDialogHeader>
      <DialogContent sx={{ ...formDialogContentSx, px: { xs: 1.5, sm: 2 } }} dividers={false}>
        <Box sx={formDialogContentScrollSx}>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block', mb: 1 }}>
            공단「보험료 결정내역」기준으로 입력하세요. 최종징수 결정액(A)은 자동 계산됩니다.
          </Typography>
          <Stack spacing={formDialogFieldStackSpacing}>
            {INPUT_FIELDS.map((field) => (
              <TextField
                key={field.key}
                label={field.label}
                value={detail[field.key] ? String(detail[field.key]) : ''}
                onChange={(e) => setField(field.key, parseWonInput(e.target.value))}
                fullWidth
                inputProps={{ inputMode: 'numeric' }}
                InputProps={{
                  endAdornment: (
                    <Typography variant="body2" color="text.secondary">
                      원
                    </Typography>
                  ),
                }}
                {...formDialogCompactTextFieldProps}
              />
            ))}

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
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography sx={{ fontWeight: 800 }}>최종징수 결정액(A)</Typography>
                <Typography sx={{ fontWeight: 900, color: 'primary.main' }}>
                  {formatWon(computed.finalAmount)}
                </Typography>
              </Stack>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.35, display: 'block' }}>
                (당월분+소급분 보험료 − 공제) − (당월+소급 국고보조금)
              </Typography>
            </Box>
          </Stack>
        </Box>
      </DialogContent>
      <DialogActions sx={{ ...formDialogActionsSx, px: { xs: 1.5, sm: 2 } }}>
        <Button onClick={onClose}>취소</Button>
        <Button variant="contained" onClick={handleSave} disabled={computed.finalAmount < 1}>
          반영
        </Button>
      </DialogActions>
    </AppDialog>
  )
}
