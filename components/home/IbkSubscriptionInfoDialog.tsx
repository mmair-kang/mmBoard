'use client'
// 수정: Auto — 2026-07-23 13:40 (해지예상 실측 보정 안내)
// 수정: Auto — 2026-07-21 21:46 (IBK청약 해지예상 정보 모달)

import { AppDialog } from '@/components/common/AppDialog'
import { FormDialogHeader } from '@/components/common/FormDialogHeader'
import {
  formDialogActionsSx,
  formDialogContentSx,
  formDialogPaperSlotSx,
} from '@/config/formDialogLayout'
import {
  calcIbkSubscriptionEstimate,
  formatIbkWon,
  type IbkSubscriptionEstimate,
} from '@/lib/ibkSubscriptionCalc'
import Button from '@mui/material/Button'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useMemo } from 'react'

type Props = {
  open: boolean
  onClose: () => void
}

function InfoRow({ label, value, emphasize = false }: { label: string; value: string; emphasize?: boolean }) {
  return (
    <Stack
      direction="row"
      alignItems="flex-start"
      sx={{
        py: 0.9,
        borderBottom: 1,
        borderColor: 'divider',
        gap: 1.25,
        '&:last-of-type': { borderBottom: 0 },
      }}
    >
      <Typography
        sx={{
          width: 108,
          flexShrink: 0,
          fontWeight: 700,
          fontSize: '0.82rem',
          color: 'text.secondary',
          lineHeight: 1.45,
        }}
      >
        · {label}
      </Typography>
      <Typography
        sx={{
          flex: 1,
          fontWeight: emphasize ? 900 : 800,
          fontSize: emphasize ? '0.92rem' : '0.86rem',
          textAlign: 'right',
          fontVariantNumeric: 'tabular-nums',
          color: emphasize ? 'info.dark' : 'text.primary',
          lineHeight: 1.45,
        }}
      >
        {value}
      </Typography>
    </Stack>
  )
}

function buildRows(estimate: IbkSubscriptionEstimate) {
  return [
    { label: '가입일', value: estimate.joinDate },
    { label: '해지 기준일', value: estimate.asOfDate },
    { label: '해지 예상금액', value: formatIbkWon(estimate.estimatedAmount), emphasize: true },
    { label: '적용이율', value: `연 ${estimate.annualRatePercent}%` },
    { label: '소득세', value: formatIbkWon(estimate.incomeTax) },
    { label: '주민세', value: formatIbkWon(estimate.residenceTax) },
    {
      label: '총 세금',
      value: `${formatIbkWon(estimate.totalTax)}(${estimate.taxRatePercent}%)`,
    },
  ] as const
}

export function IbkSubscriptionInfoDialog({ open, onClose }: Props) {
  const estimate = useMemo(() => calcIbkSubscriptionEstimate(), [open])
  const rows = useMemo(() => buildRows(estimate), [estimate])

  return (
    <AppDialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xs"
      slotProps={{
        paper: {
          sx: {
            ...formDialogPaperSlotSx,
            maxWidth: 400,
          },
        },
      }}
    >
      <FormDialogHeader onClose={onClose}>IBK청약통장 안내</FormDialogHeader>
      <DialogContent sx={{ ...formDialogContentSx, pt: 0.5 }}>
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block', mb: 0.75 }}>
          해지 기준일은 오늘 날짜입니다. 해지 예상금액은 은행 앱 실측(2026-07-23)을 기준으로
          일자에 따라 자동 갱신됩니다.
        </Typography>
        <Stack>
          {rows.map((row) => (
            <InfoRow key={row.label} label={row.label} value={row.value} emphasize={'emphasize' in row && row.emphasize} />
          ))}
        </Stack>
      </DialogContent>
      <DialogActions sx={formDialogActionsSx}>
        <Button onClick={onClose} variant="contained" color="info">
          확인
        </Button>
      </DialogActions>
    </AppDialog>
  )
}
