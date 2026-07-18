'use client'
// 수정: Auto — 2026-07-19 03:40 (보험 타입)
// 수정: Auto — 2026-07-19 03:30 (국민연금 고지서·타입 Select)
// 수정: Auto — 2026-07-19 03:15 (건보 고지서 전용 입력)
// 수정: Auto — 2026-07-19 03:25 (국민연금·건보 상세)
// 수정: Auto — 2026-07-19 03:15 (타입·통신비 상세)

import { MonthlyDaySelect } from '@/components/home/MonthlyDaySelect'
import { MonthlyHealthInsuranceEditorDialog } from '@/components/home/MonthlyHealthInsuranceEditorDialog'
import { MonthlyInsuranceEditorDialog } from '@/components/home/MonthlyInsuranceEditorDialog'
import { MonthlyNationalPensionEditorDialog } from '@/components/home/MonthlyNationalPensionEditorDialog'
import { MonthlyTelecomDetailEditorDialog } from '@/components/home/MonthlyTelecomDetailEditorDialog'
import { AppDialog } from '@/components/common/AppDialog'
import { FormDialogFooter } from '@/components/common/FormDialogFooter'
import { FormDialogHeader } from '@/components/common/FormDialogHeader'
import {
  formDialogCompactTextFieldProps,
  formDialogContentScrollSx,
  formDialogContentSx,
  formDialogFieldStackSpacing,
  formDialogFieldStackSx,
  formDialogFormSx,
  formDialogSlotProps,
} from '@/config/formDialogLayout'
import type { MonthlyExpense } from '@/hooks/useMonthlyExpenses'
import { formatWon } from '@/lib/annualPaymentCalc'
import {
  defaultHealthInsuranceDetail,
  healthInsuranceGrandTotal,
  type HealthInsuranceDetail,
} from '@/lib/healthInsuranceDetail'
import {
  defaultInsuranceDetail,
  insuranceGrandTotal,
  type InsuranceDetail,
} from '@/lib/insuranceExpenseDetail'
import type { MonthlyExpensePayType, MonthlyExpensePayload } from '@/lib/monthlyExpensePayload'
import {
  defaultNationalPensionDetail,
  nationalPensionGrandTotal,
  type NationalPensionDetail,
} from '@/lib/nationalPensionDetail'
import {
  MONTHLY_EXPENSE_TYPES,
  defaultExpenseDetail,
  getMonthlyExpenseTypeLabel,
  hasSectionExpenseDetailType,
  telecomGrandTotal,
  type MonthlyExpenseType,
  type TelecomDetail,
} from '@/lib/telecomExpenseDetail'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import DialogContent from '@mui/material/DialogContent'
import FormControl from '@mui/material/FormControl'
import FormControlLabel from '@mui/material/FormControlLabel'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Radio from '@mui/material/Radio'
import RadioGroup from '@mui/material/RadioGroup'
import Select from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useEffect, useMemo, useState } from 'react'

type Props = {
  open: boolean
  item?: MonthlyExpense | null
  onClose: () => void
  onSubmit: (payload: MonthlyExpensePayload) => Promise<void>
  onDelete?: () => Promise<void>
}

export function MonthlyExpenseFormDialog({ open, item, onClose, onSubmit, onDelete }: Props) {
  const isEdit = item != null
  const [title, setTitle] = useState('')
  const [dayOfMonth, setDayOfMonth] = useState<number | null>(null)
  const [amount, setAmount] = useState('')
  const [payType, setPayType] = useState<MonthlyExpensePayType>('card')
  const [expenseType, setExpenseType] = useState<MonthlyExpenseType>('none')
  const [telecomDetail, setTelecomDetail] = useState<TelecomDetail | null>(null)
  const [healthDetail, setHealthDetail] = useState<HealthInsuranceDetail | null>(null)
  const [pensionDetail, setPensionDetail] = useState<NationalPensionDetail | null>(null)
  const [insuranceDetail, setInsuranceDetail] = useState<InsuranceDetail | null>(null)
  const [telecomOpen, setTelecomOpen] = useState(false)
  const [healthOpen, setHealthOpen] = useState(false)
  const [pensionOpen, setPensionOpen] = useState(false)
  const [insuranceOpen, setInsuranceOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) {
      setTitle('')
      setDayOfMonth(null)
      setAmount('')
      setPayType('card')
      setExpenseType('none')
      setTelecomDetail(null)
      setHealthDetail(null)
      setPensionDetail(null)
      setInsuranceDetail(null)
      setTelecomOpen(false)
      setHealthOpen(false)
      setPensionOpen(false)
      setInsuranceOpen(false)
      setSubmitting(false)
      setDeleting(false)
      setFormError(null)
      return
    }
    if (item) {
      setTitle(item.title)
      setDayOfMonth(item.dayOfMonth)
      setAmount(String(item.amount))
      setPayType(item.payType)
      setExpenseType(item.expenseType ?? 'none')
      setTelecomDetail(item.telecomDetail)
      setHealthDetail(item.healthInsuranceDetail)
      setPensionDetail(item.nationalPensionDetail)
      setInsuranceDetail(item.insuranceDetail)
    } else {
      setTitle('')
      setDayOfMonth(null)
      setAmount('')
      setPayType('card')
      setExpenseType('none')
      setTelecomDetail(null)
      setHealthDetail(null)
      setPensionDetail(null)
      setInsuranceDetail(null)
    }
  }, [open, item])

  const telecomTotal = useMemo(
    () => (telecomDetail ? telecomGrandTotal(telecomDetail) : 0),
    [telecomDetail],
  )
  const healthTotal = useMemo(
    () => (healthDetail ? healthInsuranceGrandTotal(healthDetail) : 0),
    [healthDetail],
  )
  const pensionTotal = useMemo(
    () => (pensionDetail ? nationalPensionGrandTotal(pensionDetail) : 0),
    [pensionDetail],
  )
  const insuranceTotal = useMemo(
    () => (insuranceDetail ? insuranceGrandTotal(insuranceDetail) : 0),
    [insuranceDetail],
  )

  const usesTelecom = hasSectionExpenseDetailType(expenseType)
  const usesHealth = expenseType === 'healthInsurance'
  const usesPension = expenseType === 'nationalPension'
  const usesInsurance = expenseType === 'insurance'
  const usesDetail = usesTelecom || usesHealth || usesPension || usesInsurance

  const detailTotal = usesHealth
    ? healthTotal
    : usesPension
      ? pensionTotal
      : usesInsurance
        ? insuranceTotal
        : telecomTotal
  const parsedAmount = usesDetail
    ? detailTotal
    : Math.round(Number(amount.replace(/[^\d]/g, ''))) || 0

  const canSubmit =
    Boolean(title.trim()) &&
    parsedAmount >= 1 &&
    (!usesTelecom || telecomDetail != null) &&
    (!usesHealth || healthDetail != null) &&
    (!usesPension || pensionDetail != null) &&
    (!usesInsurance || insuranceDetail != null)

  const clearDetails = () => {
    setTelecomDetail(null)
    setHealthDetail(null)
    setPensionDetail(null)
    setInsuranceDetail(null)
  }

  const handleExpenseTypeChange = (next: MonthlyExpenseType) => {
    setExpenseType(next)
    setTelecomOpen(false)
    setHealthOpen(false)
    setPensionOpen(false)
    setInsuranceOpen(false)
    if (hasSectionExpenseDetailType(next)) {
      clearDetails()
      setTelecomDetail(defaultExpenseDetail())
      setTelecomOpen(true)
    } else if (next === 'healthInsurance') {
      clearDetails()
      setHealthDetail(defaultHealthInsuranceDetail())
      setHealthOpen(true)
    } else if (next === 'nationalPension') {
      clearDetails()
      setPensionDetail(defaultNationalPensionDetail())
      setPensionOpen(true)
    } else if (next === 'insurance') {
      clearDetails()
      setInsuranceDetail(defaultInsuranceDetail())
      setInsuranceOpen(true)
    } else {
      clearDetails()
    }
  }

  const openDetailEditor = () => {
    if (usesHealth) setHealthOpen(true)
    else if (usesPension) setPensionOpen(true)
    else if (usesInsurance) setInsuranceOpen(true)
    else if (usesTelecom) setTelecomOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit || submitting) return
    setSubmitting(true)
    setFormError(null)
    try {
      await onSubmit({
        title: title.trim(),
        dayOfMonth,
        amount: parsedAmount,
        payType,
        expenseType,
        telecomDetail: usesTelecom ? telecomDetail : null,
        healthInsuranceDetail: usesHealth ? healthDetail : null,
        nationalPensionDetail: usesPension ? pensionDetail : null,
        insuranceDetail: usesInsurance ? insuranceDetail : null,
      })
      onClose()
    } catch (error) {
      setFormError(error instanceof Error ? error.message : '저장에 실패했습니다')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!onDelete) return
    setDeleting(true)
    try {
      await onDelete()
      onClose()
    } catch (error) {
      setFormError(error instanceof Error ? error.message : '삭제에 실패했습니다')
    } finally {
      setDeleting(false)
    }
  }

  const detailHint = usesHealth
    ? '금액은 지역가입자 고지서 납부보험료로 자동 반영됩니다'
    : usesPension
      ? '금액은 최종징수 결정액(A)으로 자동 반영됩니다'
      : usesInsurance
        ? '금액은 계약 보험료로 자동 반영됩니다'
        : `금액은 ${getMonthlyExpenseTypeLabel(expenseType)} 상세 합계로 자동 반영됩니다`

  return (
    <>
      <AppDialog open={open} onClose={onClose} fullWidth maxWidth="xs" slotProps={formDialogSlotProps}>
        <Box component="form" onSubmit={(e) => void handleSubmit(e)} sx={formDialogFormSx}>
          <FormDialogHeader onClose={onClose} closeDisabled={submitting || deleting}>
            <Typography sx={{ fontSize: '1.05rem', fontWeight: 700 }}>
              {isEdit ? '고정비 수정' : '고정비 추가'}
            </Typography>
          </FormDialogHeader>
          <DialogContent sx={formDialogContentSx}>
            <Box sx={formDialogContentScrollSx}>
              <Stack spacing={formDialogFieldStackSpacing} sx={formDialogFieldStackSx}>
                <MonthlyDaySelect
                  labelId="monthly-expense-day"
                  label="일정"
                  value={dayOfMonth}
                  includeAnytime
                  fullWidth
                  onChange={setDayOfMonth}
                />
                <TextField
                  label="이름"
                  placeholder="넷플릭스"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  fullWidth
                  {...formDialogCompactTextFieldProps}
                />

                <FormControl fullWidth size="small">
                  <InputLabel id="monthly-expense-type-label">타입</InputLabel>
                  <Select
                    labelId="monthly-expense-type-label"
                    label="타입"
                    value={expenseType}
                    onChange={(e) => handleExpenseTypeChange(e.target.value as MonthlyExpenseType)}
                  >
                    {MONTHLY_EXPENSE_TYPES.map((type) => (
                      <MenuItem key={type} value={type}>
                        {getMonthlyExpenseTypeLabel(type)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {usesDetail ? (
                  <Box>
                    <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1}>
                      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 700 }}>
                        상세 합계 {formatWon(detailTotal)}
                      </Typography>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={openDetailEditor}
                        sx={{ fontWeight: 700 }}
                      >
                        상세 내역
                      </Button>
                    </Stack>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.35, display: 'block' }}>
                      {detailHint}
                    </Typography>
                  </Box>
                ) : (
                  <TextField
                    label="금액"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value.replace(/[^\d]/g, ''))}
                    required
                    fullWidth
                    inputProps={{ inputMode: 'numeric' }}
                    InputProps={{ endAdornment: <Typography variant="body2">원</Typography> }}
                    {...formDialogCompactTextFieldProps}
                  />
                )}

                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ fontWeight: 700, mb: 0.5, display: 'block' }}
                  >
                    결제
                  </Typography>
                  <RadioGroup
                    row
                    value={payType}
                    onChange={(e) => setPayType(e.target.value as MonthlyExpensePayType)}
                  >
                    <FormControlLabel value="card" control={<Radio size="small" />} label="카드" />
                    <FormControlLabel value="cash" control={<Radio size="small" />} label="현금" />
                  </RadioGroup>
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
            onDelete={isEdit && onDelete ? () => void handleDelete() : undefined}
            deleteLoading={deleting}
            submitLoading={submitting}
            submitDisabled={!canSubmit}
            submitLabel={isEdit ? '저장' : '추가'}
          />
        </Box>
      </AppDialog>

      <MonthlyTelecomDetailEditorDialog
        open={telecomOpen}
        expenseType="telecom"
        initial={telecomDetail}
        expenseTitle={title.trim() || undefined}
        onClose={() => setTelecomOpen(false)}
        onSave={(next) => {
          setTelecomDetail(next)
          setAmount(String(telecomGrandTotal(next)))
        }}
      />

      <MonthlyHealthInsuranceEditorDialog
        open={healthOpen}
        initial={healthDetail}
        expenseTitle={title.trim() || undefined}
        onClose={() => setHealthOpen(false)}
        onSave={(next) => {
          setHealthDetail(next)
          setAmount(String(healthInsuranceGrandTotal(next)))
        }}
      />

      <MonthlyNationalPensionEditorDialog
        open={pensionOpen}
        initial={pensionDetail}
        expenseTitle={title.trim() || undefined}
        onClose={() => setPensionOpen(false)}
        onSave={(next) => {
          setPensionDetail(next)
          setAmount(String(nationalPensionGrandTotal(next)))
        }}
      />

      <MonthlyInsuranceEditorDialog
        open={insuranceOpen}
        initial={insuranceDetail}
        expenseTitle={title.trim() || undefined}
        onClose={() => setInsuranceOpen(false)}
        onSave={(next) => {
          setInsuranceDetail(next)
          setAmount(String(insuranceGrandTotal(next)))
        }}
      />
    </>
  )
}
