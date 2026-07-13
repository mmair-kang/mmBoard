'use client'
// 수정: Auto — 2026-07-13 01:23 (탈회 금지기간)
// 수정: Auto — 2026-07-13 01:19 (연회비)
// 수정: Auto — 2026-07-13 01:14 (혜택받는 날짜 텍스트·달력)
// 수정: Auto — 2026-07-13 00:12 (확인필요 확인한 날짜)
// 수정: Auto — 2026-07-12 23:57 (확인필요·필드 그룹)
// 수정: Auto — 2026-07-12 23:47 (신청불가: 혜택받음·사용중)
// 수정: Auto — 2026-07-12 23:42 (카드명 선택 입력)
// 수정: Auto — 2026-07-12 23:36

import {
  CardApplicationBenefitDateField,
  cardApplicationBenefitDateToInput,
} from '@/components/home/CardApplicationBenefitDateField'
import { CardApplicationFlexibleDateField } from '@/components/home/CardApplicationFlexibleDateField'
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
import { sxCardSubTabItem, sxCardSubTabItemTriple, sxCardSubTabTrack } from '@/components/home/cardTabStyles'
import type { CardApplication } from '@/hooks/useCardApplications'
import { CARD_APPLICATION_DATE_PICKER_FORMAT } from '@/lib/cardApplicationFormat'
import { serializeCardApplicationBenefitDateInput } from '@/lib/cardApplicationBenefitDate'
import {
  CARD_APPLICATION_BLOCKED_REASONS,
  CARD_APPLICATION_BLOCKED_REASON_LABELS,
  CARD_APPLICATION_PLATFORMS,
  CARD_APPLICATION_PLATFORM_LABELS,
  resolveCardApplicationBenefitReceivedDate,
  resolveCardApplicationBlockedReason,
  resolveCardApplicationNeedsCheckDate,
  type CardApplicationBlockedReason,
  type CardApplicationPayload,
  type CardApplicationPlatform,
} from '@/lib/cardApplicationPayload'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import DialogContent from '@mui/material/DialogContent'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { alpha } from '@mui/material/styles'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import dayjs, { type Dayjs } from 'dayjs'
import { useEffect, useState, type ReactNode } from 'react'

type Props = {
  open: boolean
  item?: CardApplication | null
  onClose: () => void
  onSubmit: (payload: CardApplicationPayload) => Promise<void>
  onDelete?: () => Promise<void>
}

const compactDateFieldSlotProps = {
  textField: {
    ...formDialogCompactTextFieldProps,
    fullWidth: true,
  },
}

function FormFieldGroup({ children }: { children: ReactNode }) {
  return (
    <Stack
      spacing={formDialogFieldStackSpacing}
      sx={{
        p: 1.1,
        borderRadius: 2,
        border: 1,
        borderColor: 'divider',
        bgcolor: (theme) => alpha(theme.palette.grey[500], theme.palette.mode === 'dark' ? 0.08 : 0.04),
      }}
    >
      {children}
    </Stack>
  )
}

function parseDayjs(value: string | null | undefined): Dayjs | null {
  if (!value) return null
  const parsed = dayjs(value)
  return parsed.isValid() ? parsed : null
}

function parseAmountInput(value: string): number {
  const trimmed = value.trim()
  if (!trimmed) return 0
  const num = Number(trimmed.replace(/,/g, ''))
  return Number.isFinite(num) && num >= 0 ? Math.round(num) : -1
}

export function CardApplicationFormDialog({ open, item, onClose, onSubmit, onDelete }: Props) {
  const isEdit = item != null
  const [platform, setPlatform] = useState<CardApplicationPlatform>('naverpay')
  const [cardCompany, setCardCompany] = useState('')
  const [cardName, setCardName] = useState('')
  const [applicationBlocked, setApplicationBlocked] = useState(false)
  const [blockedReason, setBlockedReason] = useState<CardApplicationBlockedReason | null>(null)
  const [blockedBenefitDate, setBlockedBenefitDate] = useState<Dayjs | null>(null)
  const [blockedCheckDate, setBlockedCheckDate] = useState<Dayjs | null>(null)
  const [annualFee, setAnnualFee] = useState('')
  const [spendAmount, setSpendAmount] = useState('')
  const [benefitAmount, setBenefitAmount] = useState('')
  const [usageStartDate, setUsageStartDate] = useState<Dayjs | null>(null)
  const [usageEndDate, setUsageEndDate] = useState<Dayjs | null>(null)
  const [benefitDateInput, setBenefitDateInput] = useState('')
  const [withdrawalRestrictPeriodInput, setWithdrawalRestrictPeriodInput] = useState('')
  const [cancelDate, setCancelDate] = useState<Dayjs | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) {
      setPlatform('naverpay')
      setCardCompany('')
      setCardName('')
      setApplicationBlocked(false)
      setBlockedReason(null)
      setBlockedBenefitDate(null)
      setBlockedCheckDate(null)
      setAnnualFee('')
      setSpendAmount('')
      setBenefitAmount('')
      setUsageStartDate(null)
      setUsageEndDate(null)
      setBenefitDateInput('')
      setWithdrawalRestrictPeriodInput('')
      setCancelDate(null)
      setSubmitting(false)
      setDeleting(false)
      setFormError(null)
      return
    }
    if (item) {
      const resolvedReason = resolveCardApplicationBlockedReason(item)
      setPlatform(item.platform)
      setCardCompany(item.cardCompany)
      setCardName(item.cardName)
      setApplicationBlocked(item.applicationBlocked)
      setBlockedReason(resolvedReason)
      setBlockedBenefitDate(
        item.applicationBlocked && resolvedReason === 'benefit_received'
          ? parseDayjs(resolveCardApplicationBenefitReceivedDate(item))
          : null,
      )
      setBlockedCheckDate(
        item.applicationBlocked && resolvedReason === 'needs_check'
          ? parseDayjs(resolveCardApplicationNeedsCheckDate(item))
          : null,
      )
      setAnnualFee(item.annualFee > 0 ? String(item.annualFee) : '')
      setSpendAmount(item.spendAmount > 0 ? String(item.spendAmount) : '')
      setBenefitAmount(item.benefitAmount > 0 ? String(item.benefitAmount) : '')
      setUsageStartDate(parseDayjs(item.usageStartDate))
      setUsageEndDate(parseDayjs(item.usageEndDate))
      setBenefitDateInput(item.applicationBlocked ? '' : cardApplicationBenefitDateToInput(item.benefitDate))
      setWithdrawalRestrictPeriodInput(cardApplicationBenefitDateToInput(item.withdrawalRestrictPeriod))
      setCancelDate(parseDayjs(item.cancelDate))
    } else {
      setPlatform('naverpay')
      setCardCompany('')
      setCardName('')
      setApplicationBlocked(false)
      setBlockedReason(null)
      setBlockedBenefitDate(null)
      setBlockedCheckDate(null)
      setAnnualFee('')
      setSpendAmount('')
      setBenefitAmount('')
      setUsageStartDate(null)
      setUsageEndDate(null)
      setBenefitDateInput('')
      setWithdrawalRestrictPeriodInput('')
      setCancelDate(null)
    }
  }, [open, item])

  const annualFeeNum = parseAmountInput(annualFee)
  const spendAmountNum = parseAmountInput(spendAmount)
  const benefitAmountNum = parseAmountInput(benefitAmount)
  const blockedValid =
    !applicationBlocked ||
    blockedReason === 'in_use' ||
    (blockedReason === 'benefit_received' && blockedBenefitDate?.isValid()) ||
    (blockedReason === 'needs_check' && blockedCheckDate?.isValid())
  const canSubmit =
    cardCompany.trim() &&
    annualFeeNum >= 0 &&
    spendAmountNum >= 0 &&
    benefitAmountNum >= 0 &&
    blockedValid

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit || submitting) return
    setSubmitting(true)
    setFormError(null)
    try {
      await onSubmit({
        platform,
        cardCompany: cardCompany.trim(),
        cardName: cardName.trim(),
        applicationBlocked,
        blockedReason: applicationBlocked ? blockedReason : null,
        blockedConfirmedDate:
          applicationBlocked && blockedReason === 'needs_check' && blockedCheckDate?.isValid()
            ? blockedCheckDate.format('YYYY-MM-DD')
            : null,
        annualFee: annualFeeNum,
        spendAmount: spendAmountNum,
        benefitAmount: benefitAmountNum,
        usageStartDate: usageStartDate?.isValid() ? usageStartDate.format('YYYY-MM-DD') : null,
        usageEndDate: usageEndDate?.isValid() ? usageEndDate.format('YYYY-MM-DD') : null,
        benefitDate: applicationBlocked
          ? blockedReason === 'benefit_received' && blockedBenefitDate?.isValid()
            ? blockedBenefitDate.format('YYYY-MM-DD')
            : null
          : serializeCardApplicationBenefitDateInput(benefitDateInput),
        withdrawalRestrictPeriod: serializeCardApplicationBenefitDateInput(withdrawalRestrictPeriodInput),
        cancelDate: cancelDate?.isValid() ? cancelDate.format('YYYY-MM-DD') : null,
      })
      onClose()
    } catch (e) {
      setFormError(e instanceof Error ? e.message : '저장에 실패했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!onDelete || deleting) return
    setDeleting(true)
    try {
      await onDelete()
      onClose()
    } finally {
      setDeleting(false)
    }
  }

  const toggleApplicationBlocked = () => {
    setApplicationBlocked((prev) => {
      const next = !prev
      if (!next) {
        setBlockedReason(null)
        setBlockedBenefitDate(null)
        setBlockedCheckDate(null)
      } else {
        setBlockedReason('needs_check')
        setBlockedBenefitDate(null)
        setBlockedCheckDate(null)
        setBenefitDateInput('')
      }
      return next
    })
  }

  const handleBlockedReasonChange = (reason: CardApplicationBlockedReason) => {
    setBlockedReason(reason)
    if (reason !== 'benefit_received') {
      setBlockedBenefitDate(null)
    }
    if (reason !== 'needs_check') {
      setBlockedCheckDate(null)
    }
  }

  return (
    <AppDialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xs"
      disableAutoFocus
      slotProps={formDialogSlotProps}
    >
      <Box component="form" onSubmit={handleSubmit} sx={formDialogFormSx}>
        <FormDialogHeader onClose={onClose} closeDisabled={submitting || deleting}>
          <Typography sx={{ fontSize: '1.05rem', fontWeight: 700 }}>
            {isEdit ? '카드 신청 수정' : '카드 신청 추가'}
          </Typography>
        </FormDialogHeader>
        <DialogContent sx={formDialogContentSx} dividers={false}>
          <Box sx={formDialogContentScrollSx}>
            <Stack spacing={formDialogFieldStackSpacing} sx={formDialogFieldStackSx}>
              <Box sx={sxCardSubTabTrack()}>
                {CARD_APPLICATION_PLATFORMS.map((key) => (
                  <Box
                    key={key}
                    component="button"
                    type="button"
                    onClick={() => setPlatform(key)}
                    sx={sxCardSubTabItem(platform === key)}
                  >
                    {CARD_APPLICATION_PLATFORM_LABELS[key]}
                  </Box>
                ))}
              </Box>

              <TextField
                label="카드사"
                placeholder="삼성"
                value={cardCompany}
                onChange={(e) => setCardCompany(e.target.value)}
                required
                fullWidth
                size="small"
                margin="dense"
                sx={formDialogFirstFieldSx}
              />
              <TextField
                label="카드명"
                placeholder="taptap O (선택)"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                fullWidth
                {...formDialogCompactTextFieldProps}
              />

              <Stack spacing={0.85}>
                <Button
                  type="button"
                  variant={applicationBlocked ? 'contained' : 'outlined'}
                  color={applicationBlocked ? 'warning' : 'inherit'}
                  size="small"
                  onClick={toggleApplicationBlocked}
                  sx={{
                    alignSelf: 'flex-start',
                    fontWeight: 800,
                    minWidth: 88,
                    borderColor: applicationBlocked ? undefined : 'divider',
                    color: applicationBlocked ? undefined : 'text.secondary',
                  }}
                >
                  신청불가
                </Button>
                {applicationBlocked ? (
                  <Stack spacing={0.85}>
                    <Box sx={sxCardSubTabTrack()}>
                      {CARD_APPLICATION_BLOCKED_REASONS.map((reason) => (
                        <Box
                          key={reason}
                          component="button"
                          type="button"
                          onClick={() => handleBlockedReasonChange(reason)}
                          sx={sxCardSubTabItemTriple(blockedReason === reason)}
                        >
                          {CARD_APPLICATION_BLOCKED_REASON_LABELS[reason]}
                        </Box>
                      ))}
                    </Box>
                    {blockedReason === 'benefit_received' ? (
                      <DatePicker
                        label="혜택받은 날짜"
                        value={blockedBenefitDate}
                        onChange={setBlockedBenefitDate}
                        format={CARD_APPLICATION_DATE_PICKER_FORMAT}
                        slotProps={{
                          ...compactDateFieldSlotProps,
                          textField: {
                            ...compactDateFieldSlotProps.textField,
                            required: true,
                          },
                        }}
                      />
                    ) : null}
                    {blockedReason === 'needs_check' ? (
                      <DatePicker
                        label="확인한 날짜"
                        value={blockedCheckDate}
                        onChange={setBlockedCheckDate}
                        format={CARD_APPLICATION_DATE_PICKER_FORMAT}
                        slotProps={{
                          ...compactDateFieldSlotProps,
                          textField: {
                            ...compactDateFieldSlotProps.textField,
                            required: true,
                          },
                        }}
                      />
                    ) : null}
                  </Stack>
                ) : null}
              </Stack>

              <FormFieldGroup>
                <TextField
                  label="연회비"
                  placeholder="15000"
                  value={annualFee}
                  onChange={(e) => setAnnualFee(e.target.value)}
                  inputMode="numeric"
                  fullWidth
                  {...formDialogCompactTextFieldProps}
                />
                <TextField
                  label="사용금액"
                  placeholder="200000"
                  value={spendAmount}
                  onChange={(e) => setSpendAmount(e.target.value)}
                  inputMode="numeric"
                  fullWidth
                  {...formDialogCompactTextFieldProps}
                />
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                  <DatePicker
                    label="사용기간 시작"
                    value={usageStartDate}
                    onChange={setUsageStartDate}
                    format={CARD_APPLICATION_DATE_PICKER_FORMAT}
                    slotProps={compactDateFieldSlotProps}
                  />
                  <DatePicker
                    label="사용기간 종료"
                    value={usageEndDate}
                    onChange={setUsageEndDate}
                    format={CARD_APPLICATION_DATE_PICKER_FORMAT}
                    slotProps={compactDateFieldSlotProps}
                  />
                </Stack>
              </FormFieldGroup>

              <FormFieldGroup>
                <TextField
                  label="혜택금액"
                  placeholder="100000"
                  value={benefitAmount}
                  onChange={(e) => setBenefitAmount(e.target.value)}
                  inputMode="numeric"
                  fullWidth
                  {...formDialogCompactTextFieldProps}
                />
                {!applicationBlocked ? (
                  <CardApplicationBenefitDateField
                    value={benefitDateInput}
                    onChange={setBenefitDateInput}
                  />
                ) : null}
                <CardApplicationFlexibleDateField
                  label="탈회 금지기간"
                  placeholder="혜택 받은 후 1년"
                  value={withdrawalRestrictPeriodInput}
                  onChange={setWithdrawalRestrictPeriodInput}
                  calendarAriaLabel="탈회 금지기간 달력"
                />
                <DatePicker
                  label="해지일"
                  value={cancelDate}
                  onChange={setCancelDate}
                  format={CARD_APPLICATION_DATE_PICKER_FORMAT}
                  slotProps={compactDateFieldSlotProps}
                />
              </FormFieldGroup>

              {formError ? (
                <Typography variant="caption" color="error" sx={{ fontWeight: 600 }}>
                  {formError}
                </Typography>
              ) : null}
            </Stack>
          </Box>
        </DialogContent>
        <FormDialogFooter
          onDelete={onDelete ? handleDelete : undefined}
          deleteLoading={deleting}
          submitLoading={submitting}
          submitDisabled={!canSubmit}
          submitLabel={isEdit ? '저장' : '추가'}
        />
      </Box>
    </AppDialog>
  )
}
