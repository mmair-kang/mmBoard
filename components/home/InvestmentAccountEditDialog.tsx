'use client'
// 수정: Auto — 2026-07-24 15:40 (종목 타입 일반/배당)
// 수정: Auto — 2026-06-11

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
  formDialogPaperSlotSx,
} from '@/config/formDialogLayout'
import { INVESTMENT_ACCOUNT_MAP } from '@/config/investmentAccounts'
import type { InvestmentAccountView } from '@/hooks/useInvestments'
import type { InvestmentAccountSyncPayload, InvestmentHoldingType } from '@/lib/investmentPayload'
import { normalizeInvestmentSymbol } from '@/lib/stock'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import DialogContent from '@mui/material/DialogContent'
import Divider from '@mui/material/Divider'
import FormControl from '@mui/material/FormControl'
import IconButton from '@mui/material/IconButton'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { alpha } from '@mui/material/styles'
import { useEffect, useState } from 'react'

type HoldingDraft = {
  key: string
  id?: number
  name: string
  symbol: string
  holdingType: InvestmentHoldingType
  purchasePriceText: string
  sharesText: string
}

type Props = {
  open: boolean
  account: InvestmentAccountView | null
  onClose: () => void
  onSubmit: (payload: InvestmentAccountSyncPayload) => Promise<void>
}

function holdingsToDrafts(holdings: InvestmentAccountView['holdings']): HoldingDraft[] {
  return holdings.map((row) => ({
    key: `id-${row.id}`,
    id: row.id,
    name: row.name,
    symbol: row.symbol,
    holdingType: row.holdingType === 'dividend' ? 'dividend' : 'general',
    purchasePriceText: String(row.purchasePrice),
    sharesText: String(row.shares),
  }))
}

export function InvestmentAccountEditDialog({ open, account, onClose, onSubmit }: Props) {
  const [cashText, setCashText] = useState('')
  const [drafts, setDrafts] = useState<HoldingDraft[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const meta = account ? INVESTMENT_ACCOUNT_MAP[account.id] : null
  const supportsDividendType = meta?.market === 'domestic' || meta?.market === 'overseas'

  useEffect(() => {
    if (!open || !account) {
      setCashText('')
      setDrafts([])
      setSubmitting(false)
      setFormError(null)
      return
    }
    setCashText(String(account.cashBalanceKrw))
    setDrafts(holdingsToDrafts(account.holdings))
  }, [open, account])

  const updateDraft = (key: string, patch: Partial<HoldingDraft>) => {
    setDrafts((prev) => prev.map((row) => (row.key === key ? { ...row, ...patch } : row)))
  }

  const removeDraft = (key: string) => {
    setDrafts((prev) => prev.filter((row) => row.key !== key))
  }

  const addDraft = () => {
    setDrafts((prev) => [
      ...prev,
      {
        key: `new-${Date.now()}`,
        name: '',
        symbol: '',
        holdingType: 'general',
        purchasePriceText: '',
        sharesText: '',
      },
    ])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!account) return
    setFormError(null)

    const cashBalance = Math.round(Number(cashText.replace(/[^\d]/g, ''))) || 0
    const holdings: InvestmentAccountSyncPayload['holdings'] = []

    for (const draft of drafts) {
      const name = draft.name.trim()
      const symbol = normalizeInvestmentSymbol(draft.symbol)
      const purchasePrice = Math.round(Number(draft.purchasePriceText.replace(/[^\d]/g, ''))) || 0
      const shares = Math.round(Number(draft.sharesText.replace(/[^\d]/g, ''))) || 0

      if (!name || !symbol || purchasePrice < 0 || shares < 1) {
        setFormError('모든 종목의 이름·코드·매수가·주식수를 확인해 주세요.')
        return
      }

      holdings.push({
        id: draft.id,
        name,
        symbol,
        holdingType: supportsDividendType ? draft.holdingType : 'general',
        purchasePrice,
        shares,
      })
    }

    setSubmitting(true)
    try {
      await onSubmit({ category: account.id, cashBalance, holdings })
      onClose()
    } catch (error) {
      setFormError(error instanceof Error ? error.message : '저장에 실패했습니다')
    } finally {
      setSubmitting(false)
    }
  }

  if (!account || !meta) return null

  const symbolHint =
    meta.market === 'overseas'
      ? '해외 티커 (예: JEPQ)'
      : 'KRX 코드 6자리 (예: 035720, 0080X0 · KRX:0080X0 가능)'

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
            mx: { xs: 1, sm: 2 },
            width: { xs: 'calc(100% - 16px)', sm: '100%' },
          },
        },
      }}
    >
      <Box component="form" onSubmit={(e) => void handleSubmit(e)} sx={formDialogFormSx}>
        <FormDialogHeader onClose={onClose} closeDisabled={submitting}>
          <Typography sx={{ fontSize: '1.05rem', fontWeight: 700 }}>
            {meta.label} {account.title} 수정
          </Typography>
        </FormDialogHeader>
        <DialogContent sx={formDialogContentSx}>
          <Box sx={formDialogContentScrollSx}>
            <Stack spacing={formDialogFieldStackSpacing} sx={formDialogFieldStackSx}>
              <TextField
                label="예수금 (원)"
                fullWidth
                value={cashText}
                onChange={(e) => setCashText(e.target.value.replace(/[^\d]/g, ''))}
                inputProps={{ inputMode: 'numeric' }}
                {...formDialogCompactTextFieldProps}
              />

              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Typography sx={{ fontWeight: 800, fontSize: '0.88rem' }}>보유 종목</Typography>
                <Button
                  type="button"
                  size="small"
                  startIcon={<AddRoundedIcon />}
                  onClick={addDraft}
                  sx={{ fontWeight: 700, minWidth: 0 }}
                >
                  추가
                </Button>
              </Stack>

              {drafts.length === 0 ? (
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textAlign: 'center', py: 1 }}>
                  등록된 종목이 없습니다. 추가 버튼으로 종목을 등록하세요.
                </Typography>
              ) : (
                drafts.map((draft, index) => (
                  <Box
                    key={draft.key}
                    sx={{
                      p: 1,
                      borderRadius: 1.5,
                      border: 1,
                      borderColor: 'divider',
                      bgcolor: (theme) => alpha(theme.palette.action.hover, 0.03),
                    }}
                  >
                    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 0.75 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800 }}>
                        종목 {index + 1}
                      </Typography>
                      <IconButton
                        type="button"
                        size="small"
                        aria-label="종목 삭제"
                        onClick={() => removeDraft(draft.key)}
                        sx={{ color: 'error.main' }}
                      >
                        <DeleteOutlineRoundedIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                    <Stack spacing={0.75}>
                      <TextField
                        label="종목명"
                        fullWidth
                        value={draft.name}
                        onChange={(e) => updateDraft(draft.key, { name: e.target.value })}
                        {...formDialogCompactTextFieldProps}
                      />
                      <TextField
                        label="종목코드"
                        fullWidth
                        value={draft.symbol}
                        onChange={(e) => updateDraft(draft.key, { symbol: e.target.value.toUpperCase() })}
                        helperText={index === 0 ? symbolHint : undefined}
                        {...formDialogCompactTextFieldProps}
                      />
                      {supportsDividendType ? (
                        <FormControl fullWidth size="small" margin="dense">
                          <InputLabel id={`acct-holding-type-${draft.key}`}>타입</InputLabel>
                          <Select
                            labelId={`acct-holding-type-${draft.key}`}
                            label="타입"
                            value={draft.holdingType}
                            onChange={(e) =>
                              updateDraft(draft.key, {
                                holdingType: e.target.value as InvestmentHoldingType,
                              })
                            }
                          >
                            <MenuItem value="general">일반</MenuItem>
                            <MenuItem value="dividend">배당</MenuItem>
                          </Select>
                        </FormControl>
                      ) : null}
                      <Stack direction="row" spacing={0.75}>
                        <TextField
                          label="매수가 (원)"
                          fullWidth
                          value={draft.purchasePriceText}
                          onChange={(e) =>
                            updateDraft(draft.key, { purchasePriceText: e.target.value.replace(/[^\d]/g, '') })
                          }
                          inputProps={{ inputMode: 'numeric' }}
                          {...formDialogCompactTextFieldProps}
                        />
                        <TextField
                          label="주식수"
                          fullWidth
                          value={draft.sharesText}
                          onChange={(e) =>
                            updateDraft(draft.key, { sharesText: e.target.value.replace(/[^\d]/g, '') })
                          }
                          inputProps={{ inputMode: 'numeric' }}
                          {...formDialogCompactTextFieldProps}
                        />
                      </Stack>
                    </Stack>
                    {index < drafts.length - 1 ? <Divider sx={{ mt: 1, display: 'none' }} /> : null}
                  </Box>
                ))
              )}

              {formError ? (
                <Typography variant="caption" color="error" sx={{ fontWeight: 700 }}>
                  {formError}
                </Typography>
              ) : null}
            </Stack>
          </Box>
        </DialogContent>
        <FormDialogFooter submitLoading={submitting} submitLabel="저장" />
      </Box>
    </AppDialog>
  )
}
