'use client'
// 수정: Auto — 2026-07-19 10:25 (② 점수 파란 글씨·⑧ 파란 배경)
// 수정: Auto — 2026-07-19 03:15 (지역가입자 고지서 조회)

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
  buildHealthInsuranceBillRows,
  computeHealthInsurance,
  type HealthInsuranceDetail,
} from '@/lib/healthInsuranceDetail'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { alpha } from '@mui/material/styles'
import { useMemo } from 'react'

type Props = {
  open: boolean
  title: string
  detail: HealthInsuranceDetail | null
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

export function MonthlyHealthInsuranceViewDialog({ open, title, detail, onClose, onEdit }: Props) {
  const rows = useMemo(() => (detail ? buildHealthInsuranceBillRows(detail) : []), [detail])
  const total = detail ? computeHealthInsurance(detail).totalPayable : 0

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
          {title} · 지역보험료 부과 상세내역
        </Typography>
      </FormDialogHeader>
      <DialogContent sx={{ ...formDialogContentSx, px: { xs: 1.25, sm: 1.75 } }} dividers={false}>
        <Box sx={formDialogContentScrollSx}>
          {!detail ? (
            <Typography color="text.secondary" sx={{ py: 3, textAlign: 'center', fontWeight: 600 }}>
              등록된 상세 내역이 없습니다
            </Typography>
          ) : (
            <Box
              sx={{
                border: 1,
                borderColor: 'divider',
                borderRadius: 1.5,
                overflow: 'hidden',
              }}
            >
              <Stack
                direction="row"
                sx={{
                  px: 1,
                  py: 0.65,
                  bgcolor: (theme) => alpha(theme.palette.text.primary, 0.04),
                  borderBottom: 1,
                  borderColor: 'divider',
                }}
              >
                <Typography sx={{ width: 36, flexShrink: 0, fontWeight: 800, fontSize: '0.72rem' }}>
                  연번
                </Typography>
                <Typography sx={{ flex: 1, fontWeight: 800, fontSize: '0.72rem' }}>구분</Typography>
                <Typography
                  sx={{ width: 96, flexShrink: 0, fontWeight: 800, fontSize: '0.72rem', textAlign: 'right' }}
                >
                  점수 / 원
                </Typography>
              </Stack>

              {rows.map((row) => {
                const isTotal = row.emphasize === 'total'
                const isSub = row.emphasize === 'subtotal'
                const isHighlight = row.emphasize === 'highlight'
                const blueBg = isTotal || isSub || isHighlight
                return (
                  <Stack
                    key={row.no}
                    direction="row"
                    alignItems="flex-start"
                    gap={0.75}
                    sx={{
                      px: 1,
                      py: 0.75,
                      borderTop: 1,
                      borderColor: 'divider',
                      bgcolor: (theme) =>
                        isTotal
                          ? alpha(theme.palette.primary.main, 0.1)
                          : isSub || isHighlight
                            ? alpha(theme.palette.primary.main, 0.06)
                            : 'transparent',
                    }}
                  >
                    <Typography
                      sx={{
                        width: 36,
                        flexShrink: 0,
                        fontWeight: 800,
                        fontSize: '0.78rem',
                        pt: 0.1,
                      }}
                    >
                      {row.no}
                    </Typography>
                    <Typography
                      sx={{
                        flex: 1,
                        minWidth: 0,
                        fontWeight: blueBg ? 700 : 500,
                        fontSize: '0.78rem',
                        lineHeight: 1.35,
                        whiteSpace: 'pre-line',
                      }}
                    >
                      {row.label}
                    </Typography>
                    <Typography
                      sx={{
                        width: 96,
                        flexShrink: 0,
                        fontWeight: 800,
                        fontSize: '0.78rem',
                        textAlign: 'right',
                        whiteSpace: 'nowrap',
                        color: row.valueAccent ? 'primary.main' : 'text.primary',
                      }}
                    >
                      {row.valueLabel}
                    </Typography>
                  </Stack>
                )
              })}
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
        <Typography sx={{ fontWeight: 900, color: 'primary.main' }}>합계 {formatWon(total)}</Typography>
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
