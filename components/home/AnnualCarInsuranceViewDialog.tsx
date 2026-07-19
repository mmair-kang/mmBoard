'use client'
// 수정: Auto — 2026-07-19 15:05 (보장내용 1행·보험료 우측)
// 수정: Auto — 2026-07-19 14:40 (연납 자동차보험 조회)

import { AppDialog } from '@/components/common/AppDialog'
import { FormDialogHeader } from '@/components/common/FormDialogHeader'
import {
  formDialogActionsSx,
  formDialogContentScrollSx,
  formDialogContentSx,
  formDialogPaperSlotSx,
  formDialogSlotProps,
} from '@/config/formDialogLayout'
import { formatWon } from '@/lib/annualPaymentCalc'
import {
  carInsuranceAnnualGrandTotal,
  formatCarInsuranceExpiry,
  type CarInsuranceAnnualDetail,
} from '@/lib/carInsuranceAnnualDetail'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { alpha } from '@mui/material/styles'

type Props = {
  open: boolean
  title: string
  detail: CarInsuranceAnnualDetail | null
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

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <Stack direction="row" spacing={1} sx={{ py: 0.55, borderBottom: 1, borderColor: 'divider' }}>
      <Typography
        sx={{ width: 88, flexShrink: 0, fontWeight: 700, fontSize: '0.78rem', color: 'text.secondary' }}
      >
        {label}
      </Typography>
      <Typography sx={{ flex: 1, fontWeight: 700, fontSize: '0.84rem', textAlign: 'right' }}>
        {value || '-'}
      </Typography>
    </Stack>
  )
}

export function AnnualCarInsuranceViewDialog({ open, title, detail, onClose, onEdit }: Props) {
  const total = detail ? carInsuranceAnnualGrandTotal(detail) : 0
  const productLabel = detail?.productName?.trim() || title

  return (
    <AppDialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      slotProps={{ ...formDialogSlotProps, ...wideSlotProps }}
    >
      <FormDialogHeader onClose={onClose}>
        <Stack direction="row" alignItems="baseline" spacing={0.75} sx={{ minWidth: 0, pr: 1 }}>
          <Typography sx={{ fontSize: '1.02rem', fontWeight: 800 }}>자동차보험</Typography>
          <Typography sx={{ fontSize: '0.86rem', fontWeight: 700, color: 'primary.light' }}>
            {productLabel}
          </Typography>
        </Stack>
      </FormDialogHeader>
      <DialogContent sx={{ ...formDialogContentSx, px: { xs: 1.5, sm: 2 } }} dividers={false}>
        <Box sx={formDialogContentScrollSx}>
          {!detail ? (
            <Typography color="text.secondary" sx={{ py: 3, textAlign: 'center', fontWeight: 600 }}>
              등록된 상세 내역이 없습니다
            </Typography>
          ) : (
            <Stack spacing={1.15}>
              <Box>
                <Box sx={{ borderBottom: 2, borderColor: 'text.primary', mb: 0.25 }} />
                <MetaRow label="보험상품명" value={detail.productName || '-'} />
                <MetaRow label="만료일" value={formatCarInsuranceExpiry(detail.expiresOn)} />
                <MetaRow
                  label="할인할증"
                  value={detail.discountGrade ? `(${detail.discountGrade})` : '-'}
                />
                <MetaRow
                  label="물적사고기준"
                  value={detail.propertyDamageBase ? `(${detail.propertyDamageBase})` : '-'}
                />
              </Box>

              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Typography sx={{ fontWeight: 800, fontSize: '0.92rem' }}>보장내용 및 보험료</Typography>
              </Stack>

              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                  gap: 0.55,
                  border: 1,
                  borderColor: 'divider',
                  borderRadius: 1.75,
                  p: 0.65,
                  bgcolor: (theme) => alpha(theme.palette.grey[500], theme.palette.mode === 'dark' ? 0.08 : 0.04),
                }}
              >
                {detail.coverages.map((row) => (
                  <Box
                    key={row.id}
                    sx={{
                      border: 1,
                      borderColor: 'divider',
                      borderRadius: 1.25,
                      px: 1,
                      py: 0.65,
                      bgcolor: 'background.paper',
                    }}
                  >
                    <Stack direction="row" alignItems="flex-start" spacing={0.75}>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography sx={{ fontWeight: 800, fontSize: '0.78rem', lineHeight: 1.3 }}>
                          {row.name || '담보'}
                        </Typography>
                        {row.limitLabel ? (
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ fontWeight: 600, display: 'block', mt: 0.1, lineHeight: 1.3 }}
                          >
                            {row.limitLabel}
                          </Typography>
                        ) : null}
                        {row.note ? (
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ fontWeight: 600, display: 'block', mt: 0.1, lineHeight: 1.3 }}
                          >
                            * {row.note}
                          </Typography>
                        ) : null}
                      </Box>
                      <Typography
                        sx={{
                          flexShrink: 0,
                          fontWeight: 900,
                          fontSize: '0.8rem',
                          lineHeight: 1.3,
                          pt: 0.05,
                          color: (theme) =>
                            theme.palette.mode === 'dark' ? 'primary.light' : '#0f766e',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {row.premium.toLocaleString('ko-KR')} 원
                      </Typography>
                    </Stack>
                  </Box>
                ))}
              </Box>

              <Box
                sx={{
                  borderRadius: 1.75,
                  px: 1.25,
                  py: 1.05,
                  bgcolor: (theme) =>
                    theme.palette.mode === 'dark' ? alpha(theme.palette.primary.main, 0.28) : '#0f766e',
                  color: '#fff',
                }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography sx={{ fontWeight: 800, fontSize: '0.9rem' }}>보험료 총액</Typography>
                  <Typography sx={{ fontWeight: 900, fontSize: '1.05rem' }}>
                    {total.toLocaleString('ko-KR')} 원
                  </Typography>
                </Stack>
              </Box>
            </Stack>
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
        <Typography sx={{ fontWeight: 900, color: 'primary.main' }}>{formatWon(total)}</Typography>
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
