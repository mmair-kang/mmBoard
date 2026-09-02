'use client'
// 수정: Auto — 2026-09-02 16:45 (납입정보 전화 연결)
// 수정: Auto — 2026-09-02 16:00 (납입정보 탭)
// 수정: Auto — 2026-07-19 16:15 (결제 카드 표시)
// 수정: Auto — 2026-07-19 03:45 (납입내역·방법 제거, 횟수·최종월 자동)
// 수정: Auto — 2026-07-19 03:40 (보험 계약내역 조회)

import { AppDialog } from '@/components/common/AppDialog'
import { FormDialogHeader } from '@/components/common/FormDialogHeader'
import { MonthlyExpensePayInfoRows } from '@/components/home/MonthlyExpensePayInfoRows'
import {
  formDialogActionsSx,
  formDialogContentScrollSx,
  formDialogContentSx,
  formDialogPaperSlotSx,
  formDialogSlotProps,
} from '@/config/formDialogLayout'
import type { MonthlyExpensePayType } from '@/hooks/useMonthlyExpenses'
import { formatWon } from '@/lib/annualPaymentCalc'
import {
  DEFAULT_INSURANCE_PAYMENT_INFO,
  formatInsurancePeriod,
  getInsurancePaymentAutoInfo,
  type InsuranceDetail,
} from '@/lib/insuranceExpenseDetail'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import Typography from '@mui/material/Typography'
import { alpha } from '@mui/material/styles'
import { useEffect, useMemo, useState } from 'react'

type Props = {
  open: boolean
  title: string
  detail: InsuranceDetail | null
  payType?: MonthlyExpensePayType
  cardTitle?: string | null
  onClose: () => void
  onEdit: () => void
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

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <Stack
      direction="row"
      sx={{
        px: 1.1,
        py: 0.75,
        borderTop: 1,
        borderColor: 'divider',
        gap: 1,
      }}
    >
      <Typography
        sx={{
          width: 108,
          flexShrink: 0,
          fontWeight: 700,
          fontSize: '0.78rem',
          color: 'text.secondary',
        }}
      >
        {label}
      </Typography>
      <Typography sx={{ flex: 1, fontWeight: 600, fontSize: '0.8rem', minWidth: 0 }}>
        {value || '-'}
      </Typography>
    </Stack>
  )
}

function TableCard({ children }: { children: React.ReactNode }) {
  return (
    <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 1.5, overflow: 'hidden' }}>
      {children}
    </Box>
  )
}

type PaymentInfoPart =
  | { type: 'text'; value: string }
  | { type: 'phone'; display: string; tel: string }

/** 대표번호·휴대폰·지역번호. 카드번호(4-4-4-4)는 제외 */
const PAYMENT_PHONE_RE =
  /(1[568]\d{2}[-\s.]?\d{4}|01[016789][-\s]?\d{3,4}[-\s]?\d{4}|02[-\s]?\d{3,4}[-\s]?\d{4}|0[3-6]\d[-\s]?\d{3,4}[-\s]?\d{4})(\s*전화)?/g

function splitPaymentInfoParts(text: string): PaymentInfoPart[] {
  const parts: PaymentInfoPart[] = []
  let lastIndex = 0
  for (const match of text.matchAll(PAYMENT_PHONE_RE)) {
    const index = match.index ?? 0
    if (index > lastIndex) parts.push({ type: 'text', value: text.slice(lastIndex, index) })
    const number = match[1]
    const suffix = match[2] ?? ''
    parts.push({
      type: 'phone',
      display: `${number}${suffix}`,
      tel: number.replace(/[^\d]/g, ''),
    })
    lastIndex = index + match[0].length
  }
  if (lastIndex < text.length) parts.push({ type: 'text', value: text.slice(lastIndex) })
  return parts.length > 0 ? parts : [{ type: 'text', value: text }]
}

function PaymentInfoText({ text }: { text: string }) {
  const parts = useMemo(() => splitPaymentInfoParts(text), [text])
  return (
    <Typography
      component="div"
      sx={{
        px: 1.25,
        py: 1.1,
        fontWeight: 600,
        fontSize: '0.82rem',
        lineHeight: 1.7,
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
      }}
    >
      {parts.map((part, index) =>
        part.type === 'phone' ? (
          <Link
            key={`${part.tel}-${index}`}
            href={`tel:${part.tel}`}
            underline="always"
            onClick={(e) => e.stopPropagation()}
            sx={{
              fontWeight: 800,
              color: 'primary.main',
              textUnderlineOffset: '2px',
            }}
          >
            {part.display}
          </Link>
        ) : (
          <Box key={`t-${index}`} component="span">
            {part.value}
          </Box>
        ),
      )}
    </Typography>
  )
}

export function MonthlyInsuranceViewDialog({
  open,
  title,
  detail,
  payType = 'card',
  cardTitle,
  onClose,
  onEdit,
}: Props) {
  const [tab, setTab] = useState(0)

  useEffect(() => {
    if (open) setTab(0)
  }, [open])

  const autoPay = useMemo(
    () => (detail ? getInsurancePaymentAutoInfo(detail) : null),
    [detail],
  )

  const productLabel = detail?.productName?.trim() || title
  const premium = detail?.premium ?? 0
  const paymentInfo = detail?.paymentInfo ?? DEFAULT_INSURANCE_PAYMENT_INFO

  return (
    <AppDialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      slotProps={{ ...formDialogSlotProps, ...wideSlotProps }}
    >
      <FormDialogHeader onClose={onClose}>
        <Box sx={{ minWidth: 0, pr: 1 }}>
          <Typography sx={{ fontSize: '1.02rem', fontWeight: 800, lineHeight: 1.3 }}>
            {productLabel}
          </Typography>
          {detail?.policyNumber ? (
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
              증권번호 {detail.policyNumber}
            </Typography>
          ) : null}
        </Box>
      </FormDialogHeader>
      <DialogContent sx={{ ...formDialogContentSx, px: { xs: 1.25, sm: 1.75 }, pt: 0 }} dividers={false}>
        <Tabs
          value={tab}
          onChange={(_, v: number) => setTab(v)}
          variant="fullWidth"
          sx={{
            minHeight: 40,
            mb: 1.25,
            borderBottom: 1,
            borderColor: 'divider',
            '& .MuiTab-root': { minHeight: 40, fontWeight: 700, fontSize: '0.82rem' },
          }}
        >
          <Tab label="납입정보" />
          <Tab label="계약정보" />
          <Tab label="보장내용" />
        </Tabs>

        <Box sx={formDialogContentScrollSx}>
          {!detail ? (
            <Typography color="text.secondary" sx={{ py: 3, textAlign: 'center', fontWeight: 600 }}>
              등록된 상세 내역이 없습니다
            </Typography>
          ) : tab === 0 ? (
            <Box>
              <Typography sx={{ fontWeight: 800, fontSize: '0.84rem', color: 'primary.main', mb: 0.5 }}>
                납입정보
              </Typography>
              <TableCard>
                {paymentInfo.trim() ? (
                  <PaymentInfoText text={paymentInfo} />
                ) : (
                  <Typography
                    color="text.secondary"
                    sx={{ px: 1.25, py: 2, textAlign: 'center', fontWeight: 600, fontSize: '0.8rem' }}
                  >
                    등록된 납입정보가 없습니다
                  </Typography>
                )}
              </TableCard>
            </Box>
          ) : tab === 1 ? (
            <Stack spacing={1.25}>
              <Box>
                <Typography sx={{ fontWeight: 800, fontSize: '0.84rem', color: 'primary.main', mb: 0.5 }}>
                  계약정보
                </Typography>
                <TableCard>
                  <Box sx={{ px: 1.1 }}>
                    <MonthlyExpensePayInfoRows payType={payType} cardTitle={cardTitle} labelWidth={108} />
                  </Box>
                  <InfoRow label="보험기간" value={formatInsurancePeriod(detail)} />
                  <InfoRow label="보험료" value={`${detail.premium.toLocaleString('ko-KR')}원`} />
                  <InfoRow label="납입기간" value={detail.paymentTerm} />
                  <InfoRow label="납입주기" value={autoPay?.paymentCycle ?? '월납'} />
                  <InfoRow label="최종납입월" value={autoPay?.lastPaidMonthLabel ?? ''} />
                  <InfoRow
                    label="납입횟수"
                    value={
                      autoPay && autoPay.paymentCount > 0 ? `${autoPay.paymentCount}회` : ''
                    }
                  />
                </TableCard>
              </Box>
              <Box>
                <Typography sx={{ fontWeight: 800, fontSize: '0.84rem', color: 'primary.main', mb: 0.5 }}>
                  계약자(피보험자)
                </Typography>
                <TableCard>
                  <Stack
                    direction="row"
                    sx={{
                      px: 1.1,
                      py: 0.55,
                      bgcolor: (theme) => alpha(theme.palette.text.primary, 0.04),
                    }}
                  >
                    <Typography sx={{ width: 72, fontWeight: 800, fontSize: '0.72rem' }}>구분</Typography>
                    <Typography sx={{ flex: 1, fontWeight: 800, fontSize: '0.72rem' }}>성명</Typography>
                  </Stack>
                  <Stack direction="row" sx={{ px: 1.1, py: 0.75, borderTop: 1, borderColor: 'divider' }}>
                    <Typography sx={{ width: 72, fontWeight: 700, fontSize: '0.78rem', color: 'text.secondary' }}>
                      계약자
                    </Typography>
                    <Typography sx={{ flex: 1, fontWeight: 600, fontSize: '0.8rem' }}>
                      {detail.contractorName || '-'}
                    </Typography>
                  </Stack>
                  <Stack direction="row" sx={{ px: 1.1, py: 0.75, borderTop: 1, borderColor: 'divider' }}>
                    <Typography sx={{ width: 72, fontWeight: 700, fontSize: '0.78rem', color: 'text.secondary' }}>
                      피보험자
                    </Typography>
                    <Typography sx={{ flex: 1, fontWeight: 600, fontSize: '0.8rem' }}>
                      {detail.insuredName || '-'}
                    </Typography>
                  </Stack>
                </TableCard>
              </Box>
            </Stack>
          ) : (
            <Box>
              <Typography sx={{ fontWeight: 800, fontSize: '0.84rem', color: 'primary.main', mb: 0.5 }}>
                보장내용
              </Typography>
              <TableCard>
                <Stack
                  direction="row"
                  sx={{
                    px: 1,
                    py: 0.55,
                    bgcolor: (theme) => alpha(theme.palette.text.primary, 0.04),
                    gap: 0.5,
                  }}
                >
                  <Typography sx={{ width: 64, flexShrink: 0, fontWeight: 800, fontSize: '0.7rem' }}>
                    대상자
                  </Typography>
                  <Typography sx={{ flex: 1, fontWeight: 800, fontSize: '0.7rem' }}>가입담보</Typography>
                  <Typography
                    sx={{ width: 88, flexShrink: 0, fontWeight: 800, fontSize: '0.7rem', textAlign: 'right' }}
                  >
                    보장금액
                  </Typography>
                </Stack>
                {detail.coverages.map((row) => (
                  <Stack
                    key={row.id}
                    direction="row"
                    alignItems="flex-start"
                    sx={{ px: 1, py: 0.75, borderTop: 1, borderColor: 'divider', gap: 0.5 }}
                  >
                    <Typography sx={{ width: 64, flexShrink: 0, fontWeight: 600, fontSize: '0.76rem' }}>
                      {row.insuredName || detail.insuredName || '-'}
                    </Typography>
                    <Typography sx={{ flex: 1, minWidth: 0, fontWeight: 600, fontSize: '0.76rem' }}>
                      {row.coverageName || '-'}
                    </Typography>
                    <Typography
                      sx={{
                        width: 88,
                        flexShrink: 0,
                        fontWeight: 800,
                        fontSize: '0.76rem',
                        textAlign: 'right',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {row.amount ? `${row.amount.toLocaleString('ko-KR')}원` : '-'}
                    </Typography>
                  </Stack>
                ))}
              </TableCard>
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions
        sx={{
          ...formDialogActionsSx,
          px: { xs: 1.5, sm: 2 },
          justifyContent: 'space-between',
        }}
      >
        <Typography sx={{ fontWeight: 900, color: 'primary.main' }}>보험료 {formatWon(premium)}</Typography>
        <Stack direction="row" spacing={1}>
          <Button onClick={onClose} size="small">
            닫기
          </Button>
          <Button variant="contained" onClick={onEdit} size="small">
            수정
          </Button>
        </Stack>
      </DialogActions>
    </AppDialog>
  )
}
