'use client'
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
  formatInsurancePeriod,
  getInsurancePaymentAutoInfo,
  type InsuranceDetail,
} from '@/lib/insuranceExpenseDetail'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
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
          <Tab label="계약정보" />
          <Tab label="보장내용" />
        </Tabs>

        <Box sx={formDialogContentScrollSx}>
          {!detail ? (
            <Typography color="text.secondary" sx={{ py: 3, textAlign: 'center', fontWeight: 600 }}>
              등록된 상세 내역이 없습니다
            </Typography>
          ) : tab === 0 ? (
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
