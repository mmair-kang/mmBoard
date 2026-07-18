'use client'
// 수정: Auto — 2026-07-19 03:45 (납입내역·방법 제거, 횟수·최종월 자동)
// 수정: Auto — 2026-07-19 03:40 (보험 계약내역 입력)

import { AppDialog } from '@/components/common/AppDialog'
import { FormDialogHeader } from '@/components/common/FormDialogHeader'
import {
  formDialogActionsSx,
  formDialogCompactTextFieldProps,
  formDialogContentScrollSx,
  formDialogContentSx,
  formDialogFieldStackSpacing,
  formDialogPaperSlotSx,
  formDialogSlotProps,
} from '@/config/formDialogLayout'
import { formatWon } from '@/lib/annualPaymentCalc'
import {
  defaultInsuranceDetail,
  emptyInsuranceCoverage,
  getInsurancePaymentAutoInfo,
  type InsuranceDetail,
} from '@/lib/insuranceExpenseDetail'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { alpha } from '@mui/material/styles'
import { useEffect, useMemo, useState } from 'react'

type Props = {
  open: boolean
  initial: InsuranceDetail | null
  expenseTitle?: string
  onClose: () => void
  onSave: (detail: InsuranceDetail) => void
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

function parseWonInput(raw: string): number {
  return Math.round(Number(raw.replace(/[^\d]/g, ''))) || 0
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <Typography sx={{ fontWeight: 800, fontSize: '0.88rem', color: 'primary.main' }}>
      {children}
    </Typography>
  )
}

export function MonthlyInsuranceEditorDialog({
  open,
  initial,
  expenseTitle,
  onClose,
  onSave,
}: Props) {
  const [detail, setDetail] = useState<InsuranceDetail>(() => defaultInsuranceDetail())

  useEffect(() => {
    if (!open) return
    setDetail(initial ? structuredClone(initial) : defaultInsuranceDetail())
  }, [open, initial])

  const autoPay = useMemo(
    () => getInsurancePaymentAutoInfo(detail),
    [detail.periodStart, detail.paymentTerm],
  )

  const patch = (partial: Partial<InsuranceDetail>) => {
    setDetail((prev) => ({ ...prev, ...partial }))
  }

  const handleSave = () => {
    onSave(detail)
    onClose()
  }

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
          보험 계약내역 입력
          {expenseTitle ? ` · ${expenseTitle}` : ''}
        </Typography>
      </FormDialogHeader>
      <DialogContent sx={{ ...formDialogContentSx, px: { xs: 1.5, sm: 2 } }} dividers={false}>
        <Box sx={formDialogContentScrollSx}>
          <Stack spacing={formDialogFieldStackSpacing}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
              보험사 앱「계약내역상세」기준으로 입력하세요. 보험료가 고정비 금액으로 반영됩니다.
            </Typography>

            <SectionTitle>계약 기본</SectionTitle>
            <TextField
              label="상품명"
              value={detail.productName}
              onChange={(e) => patch({ productName: e.target.value })}
              fullWidth
              placeholder="무배당 ○○보험"
              {...formDialogCompactTextFieldProps}
            />
            <TextField
              label="증권번호"
              value={detail.policyNumber}
              onChange={(e) => patch({ policyNumber: e.target.value })}
              fullWidth
              {...formDialogCompactTextFieldProps}
            />
            <Stack direction="row" spacing={0.75}>
              <TextField
                label="보험기간 시작"
                value={detail.periodStart}
                onChange={(e) => patch({ periodStart: e.target.value })}
                fullWidth
                placeholder="2017.09.28"
                helperText="납입횟수 계산 기준"
                {...formDialogCompactTextFieldProps}
              />
              <TextField
                label="보험기간 종료"
                value={detail.periodEnd}
                onChange={(e) => patch({ periodEnd: e.target.value })}
                fullWidth
                placeholder="2069.09.28"
                {...formDialogCompactTextFieldProps}
              />
            </Stack>
            <TextField
              label="보험료"
              value={detail.premium ? String(detail.premium) : ''}
              onChange={(e) => patch({ premium: parseWonInput(e.target.value) })}
              fullWidth
              inputProps={{ inputMode: 'numeric' }}
              InputProps={{ endAdornment: <Typography variant="body2">원</Typography> }}
              {...formDialogCompactTextFieldProps}
            />
            <TextField
              label="납입기간"
              value={detail.paymentTerm}
              onChange={(e) => patch({ paymentTerm: e.target.value })}
              fullWidth
              placeholder="20년납"
              helperText="있으면 납입횟수 상한으로 사용 (예: 20년납 → 240회)"
              {...formDialogCompactTextFieldProps}
            />

            <Box
              sx={{
                border: 1,
                borderColor: 'divider',
                borderRadius: 1.75,
                px: 1.25,
                py: 1,
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.05),
              }}
            >
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, display: 'block', mb: 0.5 }}>
                자동 반영 (매달 납입 가정)
              </Typography>
              <Stack spacing={0.4}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    납입주기
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 800 }}>
                    {autoPay.paymentCycle}
                  </Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    최종납입월
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 800 }}>
                    {autoPay.lastPaidMonthLabel}
                  </Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    납입횟수
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 800 }}>
                    {autoPay.paymentCount > 0 ? `${autoPay.paymentCount}회` : '-'}
                  </Typography>
                </Stack>
              </Stack>
            </Box>

            <Divider />
            <SectionTitle>계약자 · 피보험자</SectionTitle>
            <TextField
              label="계약자"
              value={detail.contractorName}
              onChange={(e) => patch({ contractorName: e.target.value })}
              fullWidth
              {...formDialogCompactTextFieldProps}
            />
            <TextField
              label="피보험자"
              value={detail.insuredName}
              onChange={(e) => patch({ insuredName: e.target.value })}
              fullWidth
              {...formDialogCompactTextFieldProps}
            />

            <Divider />
            <SectionTitle>보장내용</SectionTitle>
            <Stack spacing={0.85}>
              {detail.coverages.map((row, idx) => (
                <Box
                  key={row.id}
                  sx={{
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 1.5,
                    p: 1,
                  }}
                >
                  <Stack spacing={0.75}>
                    <Stack direction="row" spacing={0.5} alignItems="flex-start">
                      <TextField
                        label="대상자"
                        value={row.insuredName}
                        onChange={(e) =>
                          patch({
                            coverages: detail.coverages.map((c) =>
                              c.id === row.id ? { ...c, insuredName: e.target.value } : c,
                            ),
                          })
                        }
                        fullWidth
                        placeholder={detail.insuredName || '피보험자'}
                        {...formDialogCompactTextFieldProps}
                      />
                      <IconButton
                        size="small"
                        color="error"
                        aria-label="보장 삭제"
                        disabled={detail.coverages.length <= 1}
                        onClick={() =>
                          patch({ coverages: detail.coverages.filter((c) => c.id !== row.id) })
                        }
                        sx={{ mt: 0.5 }}
                      >
                        <DeleteOutlineRoundedIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                    <TextField
                      label={`가입담보 ${idx + 1}`}
                      value={row.coverageName}
                      onChange={(e) =>
                        patch({
                          coverages: detail.coverages.map((c) =>
                            c.id === row.id ? { ...c, coverageName: e.target.value } : c,
                          ),
                        })
                      }
                      fullWidth
                      placeholder="암진단비(소액암제외)"
                      {...formDialogCompactTextFieldProps}
                    />
                    <TextField
                      label="보장금액"
                      value={row.amount ? String(row.amount) : ''}
                      onChange={(e) =>
                        patch({
                          coverages: detail.coverages.map((c) =>
                            c.id === row.id ? { ...c, amount: parseWonInput(e.target.value) } : c,
                          ),
                        })
                      }
                      fullWidth
                      inputProps={{ inputMode: 'numeric' }}
                      InputProps={{ endAdornment: <Typography variant="body2">원</Typography> }}
                      {...formDialogCompactTextFieldProps}
                    />
                  </Stack>
                </Box>
              ))}
              <Button
                size="small"
                startIcon={<AddRoundedIcon />}
                onClick={() =>
                  patch({
                    coverages: [
                      ...detail.coverages,
                      emptyInsuranceCoverage(detail.insuredName || detail.coverages[0]?.insuredName || ''),
                    ],
                  })
                }
                sx={{ alignSelf: 'flex-start', fontWeight: 700 }}
              >
                보장 추가
              </Button>
            </Stack>

            <Typography sx={{ fontWeight: 800, textAlign: 'right', color: 'primary.main' }}>
              고정비 반영 보험료 {formatWon(detail.premium)}
            </Typography>
          </Stack>
        </Box>
      </DialogContent>
      <DialogActions sx={{ ...formDialogActionsSx, px: { xs: 1.5, sm: 2 } }}>
        <Button onClick={onClose}>취소</Button>
        <Button variant="contained" onClick={handleSave} disabled={detail.premium < 1}>
          반영
        </Button>
      </DialogActions>
    </AppDialog>
  )
}
