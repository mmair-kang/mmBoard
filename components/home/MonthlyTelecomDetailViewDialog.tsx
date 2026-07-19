'use client'
// 수정: Auto — 2026-07-19 12:15 (할인 약정 남은 일수)
// 수정: Auto — 2026-07-19 03:25 (국민연금·건보 상세 조회)
// 수정: Auto — 2026-07-19 03:15 (통신비 상세 조회)

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
  formatTelecomDiscountEndsOn,
  formatTelecomDiscountRemaining,
  getExpenseDetailFieldLabels,
  getMonthlyExpenseTypeLabel,
  rowSettlement,
  sectionTotal,
  telecomGrandTotal,
  type MonthlySectionDetailType,
  type TelecomDetail,
} from '@/lib/telecomExpenseDetail'
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
  expenseType: MonthlySectionDetailType
  detail: TelecomDetail | null
  onClose: () => void
  onEdit: () => void
}

const wideSlotProps = {
  paper: {
    sx: {
      ...formDialogPaperSlotSx,
      maxWidth: 520,
      width: { xs: 'calc(100% - 20px)', sm: 'calc(100% - 32px)' },
      mx: { xs: 1.25, sm: 2 },
    },
  },
} as const

export function MonthlyTelecomDetailViewDialog({
  open,
  title,
  expenseType,
  detail,
  onClose,
  onEdit,
}: Props) {
  const total = detail ? telecomGrandTotal(detail) : 0
  const labels = getExpenseDetailFieldLabels(expenseType)
  const typeLabel = getMonthlyExpenseTypeLabel(expenseType)

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
          {title} · {typeLabel} 내역
        </Typography>
      </FormDialogHeader>
      <DialogContent sx={{ ...formDialogContentSx, px: { xs: 1.5, sm: 2 } }} dividers={false}>
        <Box sx={formDialogContentScrollSx}>
          {!detail || detail.sections.length === 0 ? (
            <Typography color="text.secondary" sx={{ py: 3, textAlign: 'center', fontWeight: 600 }}>
              등록된 상세 내역이 없습니다
            </Typography>
          ) : (
            <Stack spacing={1.25}>
              {detail.sections.map((section) => (
                <Box
                  key={section.id}
                  sx={{
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 2,
                    overflow: 'hidden',
                  }}
                >
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    sx={{
                      px: 1.1,
                      py: 0.7,
                      bgcolor: (theme) => alpha(theme.palette.primary.main, 0.06),
                      borderBottom: 1,
                      borderColor: 'divider',
                    }}
                  >
                    <Typography sx={{ fontWeight: 800, fontSize: '0.88rem' }}>
                      {section.title || '구분'}
                    </Typography>
                    <Typography sx={{ fontWeight: 800, fontSize: '0.84rem' }}>
                      {formatWon(sectionTotal(section))}
                    </Typography>
                  </Stack>

                  <Stack spacing={0}>
                    {section.rows.map((row, idx) => (
                      <Box
                        key={row.id}
                        sx={{
                          px: 1.1,
                          py: 0.85,
                          borderTop: idx === 0 ? 0 : 1,
                          borderColor: 'divider',
                        }}
                      >
                        <Stack direction="row" justifyContent="space-between" gap={1} alignItems="flex-start">
                          <Box sx={{ minWidth: 0, flex: 1 }}>
                            <Typography sx={{ fontWeight: 700, fontSize: '0.82rem', minWidth: 0 }}>
                              {row.name || '항목'}
                            </Typography>
                            {(() => {
                              const remaining = formatTelecomDiscountRemaining(row.endsOn)
                              const endsLabel = formatTelecomDiscountEndsOn(row.endsOn)
                              if (!remaining) return null
                              return (
                                <Typography
                                  variant="caption"
                                  sx={{
                                    fontWeight: 800,
                                    display: 'block',
                                    color:
                                      remaining === '종료됨'
                                        ? 'error.main'
                                        : remaining === '오늘 종료'
                                          ? 'warning.main'
                                          : 'primary.main',
                                  }}
                                >
                                  약정 {remaining}
                                  {endsLabel ? ` · ${endsLabel}` : ''}
                                </Typography>
                              )
                            })()}
                          </Box>
                          <Typography
                            sx={{
                              fontWeight: 800,
                              fontSize: '0.82rem',
                              flexShrink: 0,
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {formatWon(rowSettlement(row))}
                          </Typography>
                        </Stack>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                          {labels.listPrice} {formatWon(row.listPrice)}
                        </Typography>
                        {row.discounts.length > 0 ? (
                          <Stack spacing={0.2} sx={{ mt: 0.25 }}>
                            {row.discounts.map((d) => {
                              const remaining = formatTelecomDiscountRemaining(d.endsOn)
                              const endsLabel = formatTelecomDiscountEndsOn(d.endsOn)
                              return (
                                <Typography
                                  key={d.id}
                                  variant="caption"
                                  color="text.secondary"
                                  sx={{ fontWeight: 600, display: 'block' }}
                                >
                                  · {d.name || labels.discount} −
                                  {d.amount.toLocaleString('ko-KR')}원
                                  {remaining ? (
                                    <Box
                                      component="span"
                                      sx={{
                                        ml: 0.5,
                                        fontWeight: 800,
                                        color:
                                          remaining === '종료됨'
                                            ? 'error.main'
                                            : remaining === '오늘 종료'
                                              ? 'warning.main'
                                              : 'primary.main',
                                      }}
                                    >
                                      {remaining}
                                      {endsLabel ? ` (${endsLabel})` : ''}
                                    </Box>
                                  ) : null}
                                </Typography>
                              )
                            })}
                          </Stack>
                        ) : null}
                        {row.note.trim() ? (
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ display: 'block', mt: 0.25, fontWeight: 500 }}
                          >
                            {row.note}
                          </Typography>
                        ) : null}
                      </Box>
                    ))}
                  </Stack>
                </Box>
              ))}
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
