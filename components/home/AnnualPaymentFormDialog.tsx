'use client'
// 수정: Auto — 2026-07-19 16:05 (결제방식·카드 선택)
// 수정: Auto — 2026-07-19 16:00 (네이버플러스 멤버십)
// 수정: Auto — 2026-07-19 15:10 (Cursor PRO 타입)
// 수정: Auto — 2026-07-19 14:50 (개별 수정·삭제)
// 수정: Auto — 2026-07-19 14:40 (연납 타입·자동차보험)
// 수정: Auto — 2026-06-08

import { AnnualCarInsuranceEditorDialog } from '@/components/home/AnnualCarInsuranceEditorDialog'
import { AnnualCursorProEditorDialog } from '@/components/home/AnnualCursorProEditorDialog'
import { AnnualNaverPlusEditorDialog } from '@/components/home/AnnualNaverPlusEditorDialog'
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
import { useMonthlyTasks } from '@/hooks/useMonthlyTasks'
import { formatWon } from '@/lib/annualPaymentCalc'
import type { AnnualPaymentPayload } from '@/lib/annualPaymentPayload'
import {
  ANNUAL_PAYMENT_TYPES,
  getAnnualPaymentTypeLabel,
  type AnnualPaymentPayType,
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
import {
  defaultNaverPlusAnnualDetail,
  naverPlusAnnualGrandTotal,
  type NaverPlusAnnualDetail,
} from '@/lib/naverPlusAnnualDetail'
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
  const { items: monthlyTasks } = useMonthlyTasks()
  const [title, setTitle] = useState('')
  const [month, setMonth] = useState(1)
  const [dayOfMonth, setDayOfMonth] = useState<number | null>(null)
  const [amount, setAmount] = useState('')
  const [paymentType, setPaymentType] = useState<AnnualPaymentType>('none')
  const [payType, setPayType] = useState<AnnualPaymentPayType>('card')
  const [monthlyTaskId, setMonthlyTaskId] = useState<number | null>(null)
  const [carDetail, setCarDetail] = useState<CarInsuranceAnnualDetail | null>(null)
  const [cursorDetail, setCursorDetail] = useState<CursorProAnnualDetail | null>(null)
  const [naverDetail, setNaverDetail] = useState<NaverPlusAnnualDetail | null>(null)
  const [carOpen, setCarOpen] = useState(false)
  const [cursorOpen, setCursorOpen] = useState(false)
  const [naverOpen, setNaverOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const cardOptions = useMemo(
    () =>
      monthlyTasks.filter(
        (task) => task.optionType === 'card_target' || task.optionType === 'card_benefit',
      ),
    [monthlyTasks],
  )

  useEffect(() => {
    if (!open) {
      setTitle('')
      setMonth(1)
      setDayOfMonth(null)
      setAmount('')
      setPaymentType('none')
      setPayType('card')
      setMonthlyTaskId(null)
      setCarDetail(null)
      setCursorDetail(null)
      setNaverDetail(null)
      setCarOpen(false)
      setCursorOpen(false)
      setNaverOpen(false)
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
      setPayType(item.payType ?? 'card')
      setMonthlyTaskId(item.monthlyTaskId)
      setCarDetail(item.carInsuranceDetail)
      setCursorDetail(item.cursorProDetail)
      setNaverDetail(item.naverPlusDetail)
    } else {
      setTitle('')
      setMonth(1)
      setDayOfMonth(null)
      setAmount('')
      setPaymentType('none')
      setPayType('card')
      setMonthlyTaskId(null)
      setCarDetail(null)
      setCursorDetail(null)
      setNaverDetail(null)
    }
  }, [open, item])

  // 카드 목록이 로드되면 미선택 시 첫 카드 자동 선택
  useEffect(() => {
    if (!open || payType !== 'card') return
    if (monthlyTaskId != null) return
    if (cardOptions.length === 0) return
    setMonthlyTaskId(cardOptions[0].id)
  }, [open, payType, monthlyTaskId, cardOptions])

  const usesCar = paymentType === 'carInsurance'
  const usesCursor = paymentType === 'cursorPro'
  const usesNaver = paymentType === 'naverPlus'
  const usesDetail = usesCar || usesCursor || usesNaver

  const carTotal = useMemo(
    () => (carDetail ? carInsuranceAnnualGrandTotal(carDetail) : 0),
    [carDetail],
  )
  const cursorTotal = useMemo(
    () => (cursorDetail ? cursorProAnnualGrandTotal(cursorDetail) : 0),
    [cursorDetail],
  )
  const naverTotal = useMemo(
    () => (naverDetail ? naverPlusAnnualGrandTotal(naverDetail) : 0),
    [naverDetail],
  )
  const detailTotal = usesCar ? carTotal : usesCursor ? cursorTotal : usesNaver ? naverTotal : 0
  const parsedAmount = usesDetail
    ? detailTotal
    : Math.round(Number(amount.replace(/[^\d]/g, ''))) || 0

  const canSubmit =
    Boolean(title.trim()) &&
    parsedAmount >= 1 &&
    (!usesCar || carDetail != null) &&
    (!usesCursor || cursorDetail != null) &&
    (!usesNaver || naverDetail != null) &&
    (payType !== 'card' || monthlyTaskId != null)

  const clearDetails = () => {
    setCarDetail(null)
    setCursorDetail(null)
    setNaverDetail(null)
  }

  const handlePayTypeChange = (next: AnnualPaymentPayType) => {
    setPayType(next)
    if (next === 'cash') {
      setMonthlyTaskId(null)
    } else if (monthlyTaskId == null && cardOptions[0]) {
      setMonthlyTaskId(cardOptions[0].id)
    }
  }

  const handleTypeChange = (next: AnnualPaymentType) => {
    setPaymentType(next)
    setCarOpen(false)
    setCursorOpen(false)
    setNaverOpen(false)
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
    } else if (next === 'naverPlus') {
      clearDetails()
      const detail = item?.naverPlusDetail
        ? structuredClone(item.naverPlusDetail)
        : defaultNaverPlusAnnualDetail()
      setNaverDetail(detail)
      if (!title.trim()) setTitle('네이버플러스 멤버십')
      setNaverOpen(true)
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
      const lastPaidOn = usesCursor
        ? cursorDetail?.lastPaidOn
        : usesNaver
          ? naverDetail?.lastPaidOn
          : null
      if (lastPaidOn) {
        const schedule = scheduleFromLastPaid(lastPaidOn)
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
        payType,
        monthlyTaskId: payType === 'card' ? monthlyTaskId : null,
        carInsuranceDetail: usesCar ? carDetail : null,
        cursorProDetail: usesCursor ? cursorDetail : null,
        naverPlusDetail: usesNaver ? naverDetail : null,
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
                ) : usesNaver ? (
                  <Box>
                    <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1}>
                      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 700 }}>
                        연간 {formatWon(naverTotal)}
                      </Typography>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => setNaverOpen(true)}
                        sx={{ fontWeight: 700 }}
                      >
                        상세 내역
                      </Button>
                    </Stack>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.35, display: 'block' }}>
                      금액은 연간 결제금액으로 자동 반영됩니다
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
                    onChange={(e) => handlePayTypeChange(e.target.value as AnnualPaymentPayType)}
                  >
                    <FormControlLabel value="card" control={<Radio size="small" />} label="카드" />
                    <FormControlLabel value="cash" control={<Radio size="small" />} label="현금" />
                  </RadioGroup>
                </Box>

                {payType === 'card' ? (
                  <FormControl fullWidth size="small">
                    <InputLabel id="annual-pay-card-label">결제 카드</InputLabel>
                    <Select
                      labelId="annual-pay-card-label"
                      label="결제 카드"
                      value={monthlyTaskId != null ? String(monthlyTaskId) : ''}
                      onChange={(e) => {
                        const v = String(e.target.value)
                        setMonthlyTaskId(v ? Number(v) : null)
                      }}
                      disabled={cardOptions.length === 0}
                    >
                      {cardOptions.length === 0 ? (
                        <MenuItem value="" disabled>
                          카드 실적에 등록된 카드가 없습니다
                        </MenuItem>
                      ) : (
                        cardOptions.map((card) => (
                          <MenuItem key={card.id} value={String(card.id)}>
                            {card.title}
                          </MenuItem>
                        ))
                      )}
                    </Select>
                    {cardOptions.length === 0 ? (
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.4, display: 'block' }}>
                        카드 탭에서 카드를 먼저 등록해 주세요
                      </Typography>
                    ) : null}
                  </FormControl>
                ) : null}

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

      <AnnualNaverPlusEditorDialog
        open={naverOpen}
        initial={naverDetail}
        paymentTitle={title.trim() || undefined}
        onClose={() => setNaverOpen(false)}
        onSave={(next) => {
          setNaverDetail(next)
          setAmount(String(naverPlusAnnualGrandTotal(next)))
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
