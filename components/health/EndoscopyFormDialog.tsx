'use client'
// 수정: Auto — 2026-07-27 02:39 (금액 여러 건)
// 수정: Auto — 2026-07-27 02:17 (검사항목·결과·권고사항 분리)
// 수정: Auto — 2026-07-27 02:09

import { AppDialog } from '@/components/common/AppDialog'
import { FormDialogFooter } from '@/components/common/FormDialogFooter'
import { FormDialogHeader } from '@/components/common/FormDialogHeader'
import {
  formDialogCompactTextFieldProps,
  formDialogContentScrollSx,
  formDialogContentSx,
  formDialogFieldStackSpacing,
  formDialogFieldStackSx,
  formDialogFormSx,
  formDialogSlotProps,
} from '@/config/formDialogLayout'
import type { EndoscopyRecord } from '@/hooks/useEndoscopyRecords'
import { endoscopyRecordCosts } from '@/hooks/useEndoscopyRecords'
import type { EndoscopyRecordPayload } from '@/lib/endoscopyPayload'
import { ENDOSCOPY_SCOPE_LABELS, type HealthExamScopeId } from '@/lib/endoscopyTypes'
import { formatWon } from '@/lib/annualPaymentCalc'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded'
import Box from '@mui/material/Box'
import DialogContent from '@mui/material/DialogContent'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { alpha } from '@mui/material/styles'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import dayjs, { type Dayjs } from 'dayjs'
import { useEffect, useMemo, useState } from 'react'

type Props = {
  open: boolean
  scope: HealthExamScopeId
  item?: EndoscopyRecord | null
  onClose: () => void
  onSubmit: (payload: EndoscopyRecordPayload) => Promise<void>
  onDelete?: () => Promise<void>
}

type CostDraft = {
  key: string
  label: string
  amountText: string
}

const compactDateFieldSlotProps = {
  textField: {
    ...formDialogCompactTextFieldProps,
    fullWidth: true,
  },
  field: { clearable: false },
}

const contentFieldSx = {
  mt: 0.5,
  '& .MuiInputBase-root': {
    alignItems: 'flex-start',
    fontSize: '0.9rem',
  },
  '& .MuiInputLabel-root': {
    fontSize: '0.85rem',
  },
  '& textarea': {
    lineHeight: 1.55,
  },
} as const

function newCostDraft(): CostDraft {
  return {
    key: `cost-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    label: '',
    amountText: '',
  }
}

function parseWonInput(raw: string): number {
  const digits = raw.replace(/[^\d]/g, '')
  if (!digits) return 0
  return Number(digits)
}

function formatAmountInput(raw: string): string {
  const n = parseWonInput(raw)
  if (!raw.trim() || n === 0) return raw.replace(/[^\d]/g, '') ? '0' : ''
  return n.toLocaleString('ko-KR')
}

export function EndoscopyFormDialog({ open, scope, item, onClose, onSubmit, onDelete }: Props) {
  const isEdit = item != null
  const [examDate, setExamDate] = useState<Dayjs | null>(dayjs())
  const [examItem, setExamItem] = useState('')
  const [result, setResult] = useState('')
  const [recommendation, setRecommendation] = useState('')
  const [costDrafts, setCostDrafts] = useState<CostDraft[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) {
      setExamDate(dayjs())
      setExamItem('')
      setResult('')
      setRecommendation('')
      setCostDrafts([])
      setSubmitting(false)
      setDeleting(false)
      setFormError(null)
      return
    }
    if (item) {
      setExamDate(item.examDate ? dayjs(item.examDate) : dayjs())
      setExamItem(item.examItem)
      setResult(item.result || item.content)
      setRecommendation(item.recommendation)
      const costs = endoscopyRecordCosts(item)
      setCostDrafts(
        costs.length > 0
          ? costs.map((row, index) => ({
              key: `id-${item.id}-${index}`,
              label: row.label,
              amountText: row.amount.toLocaleString('ko-KR'),
            }))
          : [],
      )
    } else {
      setExamDate(dayjs())
      setExamItem('')
      setResult('')
      setRecommendation('')
      setCostDrafts([])
    }
  }, [open, item])

  const costTotal = useMemo(
    () => costDrafts.reduce((sum, row) => sum + parseWonInput(row.amountText), 0),
    [costDrafts],
  )

  const canSubmit =
    examDate != null &&
    examDate.isValid() &&
    examItem.trim().length > 0 &&
    result.trim().length > 0

  const updateCostDraft = (key: string, patch: Partial<CostDraft>) => {
    setCostDrafts((prev) => prev.map((row) => (row.key === key ? { ...row, ...patch } : row)))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit || submitting || !examDate) return

    const costItems = costDrafts
      .map((row) => ({
        label: row.label.trim(),
        amount: parseWonInput(row.amountText),
      }))
      .filter((row) => row.label || row.amount > 0)

    for (const row of costItems) {
      if (!row.label || row.amount <= 0) {
        setFormError('금액은 내역과 금액을 함께 입력해 주세요.')
        return
      }
    }

    setSubmitting(true)
    setFormError(null)
    try {
      await onSubmit({
        scopeType: scope,
        examDate: examDate.format('YYYY-MM-DD'),
        examItem: examItem.trim(),
        result: result.trim(),
        recommendation: recommendation.trim(),
        costItems,
      })
      onClose()
    } catch (error) {
      setFormError(error instanceof Error ? error.message : '저장에 실패했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!onDelete || deleting) return
    setDeleting(true)
    setFormError(null)
    try {
      await onDelete()
      onClose()
    } catch (error) {
      setFormError(error instanceof Error ? error.message : '삭제에 실패했습니다.')
    } finally {
      setDeleting(false)
    }
  }

  const scopeLabel = ENDOSCOPY_SCOPE_LABELS[scope]

  return (
    <AppDialog open={open} onClose={onClose} fullWidth maxWidth="sm" slotProps={formDialogSlotProps}>
      <Box component="form" onSubmit={handleSubmit} sx={formDialogFormSx}>
        <FormDialogHeader onClose={onClose}>
          {isEdit ? `${scopeLabel} 수정` : `${scopeLabel} 추가`}
        </FormDialogHeader>
        <DialogContent sx={formDialogContentSx}>
          <Box sx={formDialogContentScrollSx}>
            <Stack spacing={formDialogFieldStackSpacing} sx={formDialogFieldStackSx}>
              <DatePicker
                label="검사일"
                value={examDate}
                onChange={(v) => setExamDate(v)}
                format="YYYY. M. D"
                slotProps={compactDateFieldSlotProps}
              />
              <TextField
                label="검사항목"
                value={examItem}
                onChange={(e) => setExamItem(e.target.value)}
                fullWidth
                placeholder="예: 위내시경, 헬리코박터(CLO)"
                {...formDialogCompactTextFieldProps}
              />
              <TextField
                label="결과"
                value={result}
                onChange={(e) => setResult(e.target.value)}
                fullWidth
                multiline
                minRows={3}
                maxRows={8}
                placeholder="검사 결과와 소견"
                size="small"
                sx={contentFieldSx}
              />
              <TextField
                label="권고사항"
                value={recommendation}
                onChange={(e) => setRecommendation(e.target.value)}
                fullWidth
                multiline
                minRows={2}
                maxRows={6}
                placeholder="추적검사 등 (선택)"
                size="small"
                sx={contentFieldSx}
              />

              <Box>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 0.75 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800 }}>
                    금액
                  </Typography>
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={() => setCostDrafts((prev) => [...prev, newCostDraft()])}
                    aria-label="금액 추가"
                  >
                    <AddRoundedIcon fontSize="small" />
                  </IconButton>
                </Stack>

                {costDrafts.length === 0 ? (
                  <Box
                    sx={{
                      py: 1.25,
                      px: 1.1,
                      borderRadius: 1.5,
                      border: 1,
                      borderStyle: 'dashed',
                      borderColor: 'divider',
                      bgcolor: (theme) => alpha(theme.palette.action.hover, 0.03),
                    }}
                  >
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                      + 로 금액·내역을 추가할 수 있습니다
                    </Typography>
                  </Box>
                ) : (
                  <Stack spacing={0.75}>
                    {costDrafts.map((row) => (
                      <Stack key={row.key} direction="row" spacing={0.75} alignItems="center">
                        <TextField
                          label="내역"
                          value={row.label}
                          onChange={(e) => updateCostDraft(row.key, { label: e.target.value })}
                          fullWidth
                          {...formDialogCompactTextFieldProps}
                        />
                        <TextField
                          label="금액"
                          value={row.amountText}
                          onChange={(e) =>
                            updateCostDraft(row.key, { amountText: formatAmountInput(e.target.value) })
                          }
                          inputMode="numeric"
                          sx={{ width: 120, flexShrink: 0, ...formDialogCompactTextFieldProps.sx }}
                          size="small"
                          margin="dense"
                        />
                        <IconButton
                          size="small"
                          onClick={() => setCostDrafts((prev) => prev.filter((r) => r.key !== row.key))}
                          aria-label="금액 삭제"
                          sx={{ color: 'text.secondary' }}
                        >
                          <DeleteOutlineRoundedIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                    ))}
                    <Stack
                      direction="row"
                      alignItems="center"
                      justifyContent="space-between"
                      sx={{
                        mt: 0.25,
                        px: 1,
                        py: 0.7,
                        borderRadius: 1.5,
                        bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
                        border: 1,
                        borderColor: (theme) => alpha(theme.palette.primary.main, 0.2),
                      }}
                    >
                      <Typography variant="caption" sx={{ fontWeight: 800 }}>
                        합계
                      </Typography>
                      <Typography sx={{ fontWeight: 900, fontSize: '0.95rem' }}>
                        {formatWon(costTotal)}
                      </Typography>
                    </Stack>
                  </Stack>
                )}
              </Box>

              {formError ? (
                <Typography color="error" variant="body2" sx={{ fontWeight: 600 }}>
                  {formError}
                </Typography>
              ) : null}
            </Stack>
          </Box>
        </DialogContent>
        <FormDialogFooter
          onDelete={isEdit && onDelete ? handleDelete : undefined}
          deleteLoading={deleting}
          submitLoading={submitting}
          submitDisabled={!canSubmit}
          submitLabel={isEdit ? '저장' : '추가'}
        />
      </Box>
    </AppDialog>
  )
}
