'use client'
// 수정: Auto — 2026-07-19 15:10 (Cursor PRO 타입)
// 수정: Auto — 2026-07-19 14:50 (개별 수정·삭제)
// 수정: Auto — 2026-07-19 14:40 (연납 타입·자동차보험)
// 수정: Auto — 2026-06-08

import { AnnualCarInsuranceEditorDialog } from '@/components/home/AnnualCarInsuranceEditorDialog'
import { AnnualCursorProEditorDialog } from '@/components/home/AnnualCursorProEditorDialog'
import { AnnualDayModeSelect, AnnualMonthSelect } from '@/components/home/AnnualScheduleSelect'
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
import type { AnnualPayment } from '@/hooks/useAnnualPayments'
import { formatWon } from '@/lib/annualPaymentCalc'
import type { AnnualPaymentPayload } from '@/lib/annualPaymentPayload'
import {
  ANNUAL_PAYMENT_TYPES,
  getAnnualPaymentTypeLabel,
  type AnnualPaymentType,
} from '@/lib/annualPaymentTypes'
import {
  carInsuranceAnnualGrandTotal,
  defaultCarInsuranceAnnualDetail,
  type CarInsuranceAnnualDetail,
} from '@/lib/carInsuranceAnnualDetail'
import {
  cursorProAnnualGrandTotal,
  defaultCursorProAnnualDetail,
  formatCursorProUsd,
  type CursorProAnnualDetail,
} from '@/lib/cursorProAnnualDetail'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import DialogContent from '@mui/material/DialogContent'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useEffect, useMemo, useState } from 'react'

type Props = {
  open: boolean
  item?: AnnualPayment | null
  onClose: () => void
  onSubmit: (payload: AnnualPaymentPayload) => Promise<void>
  onDelete?: () => Promise<void>
}

function scheduleFromLastPaid(lastPaidOn: string): { month: number; dayOfMonth: number } | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(lastPaidOn)
  if (!match) return null
  const month = Number(match[2])
  const day = Number(match[3])
  if (month < 1 || month > 12 || day < 1 || day > 31) return null
  return { month, dayOfMonth: day }
}

export function AnnualPaymentFormDialog({ open, item, onClose, onSubmit, onDelete }: Props) {
  const isEdit = item != null
  const [title, setTitle] = useState('')
  const [month, setMonth] = useState(1)
  const [dayOfMonth, setDayOfMonth] = useState<number | null>(null)
  const [amount, setAmount] = useState('')
  const [paymentType, setPaymentType] = useState<AnnualPaymentType>('none')
  const [carDetail, setCarDetail] = useState<CarInsuranceAnnualDetail | null>(null)
  const [cursorDetail, setCursorDetail] = useState<CursorProAnnualDetail | null>(null)
  const [carOpen, setCarOpen] = useState(false)
  const [cursorOpen, setCursorOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) {
      setTitle('')
      setMonth(1)
      setDayOfMonth(null)
      setAmount('')
      setPaymentType('none')
      setCarDetail(null)
      setCursorDetail(null)
      setCarOpen(false)
      setCursorOpen(false)
      setSubmitting(false)
      setDeleting(false)
      setFormError(null)
      return
    }
    if (item) {
      setTitle(item.title)
      setMonth(item.month)
      setDayOfMonth(item.dayOfMonth)
      setAmount(String(item.amount))
      setPaymentType(item.paymentType ?? 'none')
      setCarDetail(item.carInsuranceDetail)
      setCursorDetail(item.cursorProDetail)
    } else {
      setTitle('')
      setMonth(1)
      setDayOfMonth(null)
      setAmount('')
      setPaymentType('none')
      setCarDetail(null)
      setCursorDetail(null)
    }
  }, [open, item])

  const usesCar = paymentType === 'carInsurance'
  const usesCursor = paymentType === 'cursorPro'
  const usesDetail = usesCar || usesCursor

  const carTotal = useMemo(
    () => (carDetail ? carInsuranceAnnualGrandTotal(carDetail) : 0),
    [carDetail],
  )
  const cursorTotal = useMemo(
    () => (cursorDetail ? cursorProAnnualGrandTotal(cursorDetail) : 0),
    [cursorDetail],
  )
  const detailTotal = usesCar ? carTotal : usesCursor ? cursorTotal : 0
  const parsedAmount = usesDetail
    ? detailTotal
    : Math.round(Number(amount.replace(/[^\d]/g, ''))) || 0

  const canSubmit =
    Boolean(title.trim()) &&
    parsedAmount >= 1 &&
    (!usesCar || carDetail != null) &&
    (!usesCursor || cursorDetail != null)

  const clearDetails = () => {
    setCarDetail(null)
    setCursorDetail(null)
  }

  const handleTypeChange = (next: AnnualPaymentType) => {
    setPaymentType(next)
    setCarOpen(false)
    setCursorOpen(false)
    if (next === 'carInsurance') {
      clearDetails()
      const detail = item?.carInsuranceDetail
        ? structuredClone(item.carInsuranceDetail)
        : defaultCarInsuranceAnnualDetail()
      setCarDetail(detail)
      setCarOpen(true)
    } else if (next === 'cursorPro') {
      clearDetails()
      const detail = item?.cursorProDetail
        ? structuredClone(item.cursorProDetail)
        : defaultCursorProAnnualDetail()
      setCursorDetail(detail)
      if (!title.trim()) setTitle('Cursor PRO')
      setCursorOpen(true)
    } else {
      clearDetails()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit || submitting) return
    setSubmitting(true)
    setFormError(null)
    try {
      let submitMonth = month
      let submitDay = dayOfMonth
      if (usesCursor && cursorDetail?.lastPaidOn) {
        const schedule = scheduleFromLastPaid(cursorDetail.lastPaidOn)
        if (schedule) {
          submitMonth = schedule.month
          submitDay = schedule.dayOfMonth
        }
      }
      await onSubmit({
        title: title.trim(),
        month: submitMonth,
        dayOfMonth: submitDay,
        amount: parsedAmount,
        paymentType,
        carInsuranceDetail: usesCar ? carDetail : null,
        cursorProDetail: usesCursor ? cursorDetail : null,
      })
      onClose()
    } catch (err) {
      setFormError(err instanceof Error ? err.message : '저장에 실패했습니다.')
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
    } catch (err) {
      setFormError(err instanceof Error ? err.message : '삭제에 실패했습니다.')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      <AppDialog open={open} onClose={onClose} fullWidth maxWidth="xs" disableAutoFocus slotProps={formDialogSlotProps}>
        <Box component="form" onSubmit={(e) => void handleSubmit(e)} sx={formDialogFormSx}>
          <FormDialogHeader onClose={onClose} closeDisabled={submitting || deleting}>
            <Typography sx={{ fontSize: '1.05rem', fontWeight: 700 }}>
              {isEdit ? '연납 수정' : '연납 추가'}
            </Typography>
          </FormDialogHeader>
          <DialogContent sx={formDialogContentSx} dividers={false}>
            <Box sx={formDialogContentScrollSx}>
              <Stack spacing={formDialogFieldStackSpacing} sx={formDialogFieldStackSx}>
                <TextField
                  label="항목명"
                  placeholder="자동차보험"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  fullWidth
                  size="small"
                  margin="dense"
                  sx={formDialogFirstFieldSx}
                />

                <FormControl fullWidth size="small">
                  <InputLabel id="annual-payment-type-label">타입</InputLabel>
                  <Select
                    labelId="annual-payment-type-label"
                    label="타입"
                    value={paymentType}
                    onChange={(e) => handleTypeChange(e.target.value as AnnualPaymentType)}
                  >
                    {ANNUAL_PAYMENT_TYPES.map((type) => (
                      <MenuItem key={type} value={type}>
                        {getAnnualPaymentTypeLabel(type)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <Stack direction="row" spacing={0.75}>
                  <AnnualMonthSelect labelId="annual-form-month" value={month} onChange={setMonth} fullWidth />
                  <AnnualDayModeSelect
                    labelId="annual-form-day"
                    dayOfMonth={dayOfMonth}
                    onChange={setDayOfMonth}
                    fullWidth
                  />
                </Stack>

                {usesCar ? (
                  <Box>
                    <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1}>
                      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 700 }}>
                        보험료 총액 {formatWon(carTotal)}
                      </Typography>
                      <Button size="small" variant="outlined" onClick={() => setCarOpen(true)} sx={{ fontWeight: 700 }}>
                        상세 내역
                      </Button>
                    </Stack>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.35, display: 'block' }}>
                      금액은 보장내용 보험료 합계로 자동 반영됩니다
                    </Typography>
                  </Box>
                ) : usesCursor ? (
                  <Box>
                    <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1}>
                      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 700 }}>
                        {cursorDetail
                          ? `${formatCursorProUsd(cursorDetail.annualUsd)} · ${formatWon(cursorTotal)}`
                          : formatWon(0)}
                      </Typography>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => setCursorOpen(true)}
                        sx={{ fontWeight: 700 }}
                      >
                        상세 내역
                      </Button>
                    </Stack>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.35, display: 'block' }}>
                      금액은 Cursor 연납 원화로 자동 반영됩니다
                    </Typography>
                  </Box>
                ) : (
                  <TextField
                    label="금액"
                    placeholder="500000"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value.replace(/[^\d]/g, ''))}
                    required
                    fullWidth
                    inputProps={{ inputMode: 'numeric' }}
                    InputProps={{ endAdornment: <Typography variant="body2">원</Typography> }}
                    {...formDialogCompactTextFieldProps}
                  />
                )}

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

      <AnnualCarInsuranceEditorDialog
        open={carOpen}
        initial={carDetail}
        paymentTitle={title.trim() || undefined}
        onClose={() => setCarOpen(false)}
        onSave={(next) => {
          setCarDetail(next)
          setAmount(String(carInsuranceAnnualGrandTotal(next)))
        }}
      />

      <AnnualCursorProEditorDialog
        open={cursorOpen}
        initial={cursorDetail}
        paymentTitle={title.trim() || undefined}
        onClose={() => setCursorOpen(false)}
        onSave={(next) => {
          setCursorDetail(next)
          setAmount(String(cursorProAnnualGrandTotal(next)))
          const schedule = scheduleFromLastPaid(next.lastPaidOn)
          if (schedule) {
            setMonth(schedule.month)
            setDayOfMonth(schedule.dayOfMonth)
          }
        }}
      />
    </>
  )
}
