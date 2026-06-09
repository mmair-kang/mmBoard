'use client'
// 수정: Auto — 2026-06-08

import { MonthlyDaySelect } from '@/components/home/MonthlyDaySelect'
import type { DividendEntryPayload } from '@/lib/dividendPayload'
import {
  decimalToText,
  parseDecimalText,
  sanitizeDecimalInput,
} from '@/lib/dividendPayload'
import { DividendAmountLines } from '@/components/home/DividendAmountLines'
import { calcDividendEntry, formatRate, formatUsd } from '@/lib/dividendCalc'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded'
import DragIndicatorRoundedIcon from '@mui/icons-material/DragIndicatorRounded'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import MenuItem from '@mui/material/MenuItem'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { alpha } from '@mui/material/styles'
import { useState } from 'react'

export type DividendEntryDraft = {
  key: string
  id?: number
  dayOfMonth: number
  ticker: string
  shares: number
  exchangeRateText: string
  foreignSettlementText: string
  foreignTaxText: string
}

export function entriesToDrafts(
  entries: Array<DividendEntryPayload & { id?: number }>,
): DividendEntryDraft[] {
  return entries.map((row, index) => ({
    key: row.id != null ? `id-${row.id}` : `new-${index}`,
    id: row.id,
    dayOfMonth: row.dayOfMonth,
    ticker: row.ticker,
    shares: row.shares,
    exchangeRateText: decimalToText(row.exchangeRate),
    foreignSettlementText: decimalToText(row.foreignSettlement),
    foreignTaxText: decimalToText(row.foreignTax),
  }))
}

export function draftToEntryPayload(draft: DividendEntryDraft): DividendEntryPayload {
  return {
    id: draft.id,
    dayOfMonth: draft.dayOfMonth,
    ticker: draft.ticker.trim().toUpperCase(),
    shares: draft.shares,
    exchangeRate: parseDecimalText(draft.exchangeRateText),
    foreignSettlement: parseDecimalText(draft.foreignSettlementText),
    foreignTax: parseDecimalText(draft.foreignTaxText),
  }
}

export function draftsToEntries(drafts: DividendEntryDraft[]): DividendEntryPayload[] {
  return drafts
    .map(draftToEntryPayload)
    .filter((row) => row.exchangeRate > 0 && row.foreignSettlement > 0)
}

type Props = {
  drafts: DividendEntryDraft[]
  tickerOptions: string[]
  onChange: (drafts: DividendEntryDraft[]) => void
}

export function DividendEntriesEditor({ drafts, tickerOptions, onChange }: Props) {
  const [dragKey, setDragKey] = useState<string | null>(null)

  const updateDraft = (key: string, patch: Partial<DividendEntryDraft>) => {
    onChange(drafts.map((row) => (row.key === key ? { ...row, ...patch } : row)))
  }

  const removeDraft = (key: string) => {
    onChange(drafts.filter((row) => row.key !== key))
  }

  const reorder = (fromKey: string, toKey: string) => {
    if (fromKey === toKey) return
    const fromIndex = drafts.findIndex((row) => row.key === fromKey)
    const toIndex = drafts.findIndex((row) => row.key === toKey)
    if (fromIndex < 0 || toIndex < 0) return
    const next = [...drafts]
    const [moved] = next.splice(fromIndex, 1)
    next.splice(toIndex, 0, moved)
    onChange(next)
  }

  const addDraft = () => {
    const ticker = tickerOptions[0] ?? 'JEPQ'
    onChange([
      ...drafts,
      {
        key: `new-${Date.now()}`,
        dayOfMonth: 1,
        ticker,
        shares: 0,
        exchangeRateText: '',
        foreignSettlementText: '',
        foreignTaxText: '',
      },
    ])
  }

  return (
    <Stack spacing={1}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        alignItems={{ xs: 'stretch', sm: 'center' }}
        justifyContent="space-between"
        spacing={0.5}
      >
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, lineHeight: 1.45 }}>
          배당일별 항목 · 드래그로 순서 변경
        </Typography>
        <Button size="small" startIcon={<AddRoundedIcon />} onClick={addDraft} sx={{ alignSelf: { xs: 'flex-start', sm: 'auto' } }}>
          항목 추가
        </Button>
      </Stack>

      {drafts.length === 0 ? (
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
          배당 항목이 없습니다.
        </Typography>
      ) : null}

      {drafts.map((draft) => {
        const exchangeRate = parseDecimalText(draft.exchangeRateText)
        const foreignSettlement = parseDecimalText(draft.foreignSettlementText)
        const preview =
          exchangeRate > 0 && foreignSettlement > 0
            ? calcDividendEntry({
                exchangeRate,
                foreignSettlement,
                foreignTax: parseDecimalText(draft.foreignTaxText),
                shares: draft.shares,
              })
            : null

        return (
          <Box
            key={draft.key}
            draggable
            onDragStart={() => setDragKey(draft.key)}
            onDragEnd={() => setDragKey(null)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => {
              if (dragKey) reorder(dragKey, draft.key)
              setDragKey(null)
            }}
            sx={{
              p: 1,
              borderRadius: 1.5,
              border: 1,
              borderColor: dragKey === draft.key ? 'primary.main' : 'divider',
              bgcolor: (theme) => alpha(theme.palette.background.default, 0.5),
              opacity: dragKey === draft.key ? 0.65 : 1,
              minWidth: 0,
              overflow: 'hidden',
            }}
          >
            <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 0.75 }}>
              <DragIndicatorRoundedIcon sx={{ fontSize: 20, color: 'text.disabled', cursor: 'grab' }} />
              <Typography sx={{ fontWeight: 800, fontSize: '0.82rem', flex: 1 }}>
                {draft.ticker || '종목'}
              </Typography>
              <IconButton size="small" onClick={() => removeDraft(draft.key)} aria-label="삭제">
                <DeleteOutlineRoundedIcon fontSize="small" />
              </IconButton>
            </Stack>

            <Stack spacing={0.75}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={0.75}>
                <MonthlyDaySelect
                  labelId={`dividend-day-${draft.key}`}
                  label="배당일"
                  value={draft.dayOfMonth}
                  fullWidth
                  onChange={(dayOfMonth) => updateDraft(draft.key, { dayOfMonth: dayOfMonth ?? 1 })}
                />
                <TextField
                  select
                  label="종목"
                  size="small"
                  margin="dense"
                  fullWidth
                  value={draft.ticker}
                  onChange={(e) => updateDraft(draft.key, { ticker: e.target.value })}
                >
                  {tickerOptions.map((ticker) => (
                    <MenuItem key={ticker} value={ticker}>
                      {ticker}
                    </MenuItem>
                  ))}
                </TextField>
              </Stack>

              <TextField
                label="보유 주수 (이 달)"
                size="small"
                margin="dense"
                fullWidth
                value={draft.shares > 0 ? String(draft.shares) : ''}
                onChange={(e) =>
                  updateDraft(draft.key, {
                    shares: Math.round(Number(e.target.value.replace(/[^\d]/g, ''))) || 0,
                  })
                }
                inputProps={{ inputMode: 'numeric' }}
                InputProps={{ endAdornment: <Typography variant="caption">주</Typography> }}
              />

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={0.75}>
                <TextField
                  label="환율"
                  size="small"
                  margin="dense"
                  fullWidth
                  value={draft.exchangeRateText}
                  onChange={(e) =>
                    updateDraft(draft.key, { exchangeRateText: sanitizeDecimalInput(e.target.value) })
                  }
                  inputProps={{ inputMode: 'decimal' }}
                  placeholder="1515.6"
                />
                <TextField
                  label="외화정산금액"
                  size="small"
                  margin="dense"
                  fullWidth
                  value={draft.foreignSettlementText}
                  onChange={(e) =>
                    updateDraft(draft.key, {
                      foreignSettlementText: sanitizeDecimalInput(e.target.value),
                    })
                  }
                  inputProps={{ inputMode: 'decimal' }}
                  placeholder="12.34"
                />
              </Stack>

              <TextField
                label="세금합 (외화)"
                size="small"
                margin="dense"
                fullWidth
                value={draft.foreignTaxText}
                onChange={(e) =>
                  updateDraft(draft.key, { foreignTaxText: sanitizeDecimalInput(e.target.value) })
                }
                inputProps={{ inputMode: 'decimal' }}
                placeholder="1.85"
              />

              {preview ? (
                <Stack spacing={0.25} sx={{ minWidth: 0 }}>
                  <DividendAmountLines grossKrw={preview.grossKrw} dividendKrw={preview.dividendKrw} emphasize />
                  {preview.perShareGrossForeign != null ? (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ fontWeight: 600, lineHeight: 1.45, wordBreak: 'break-word', overflowWrap: 'anywhere' }}
                    >
                      주당 {formatUsd(preview.perShareGrossForeign)} (세전) · 환율 {formatRate(exchangeRate)}
                    </Typography>
                  ) : null}
                </Stack>
              ) : null}
            </Stack>
          </Box>
        )
      })}
    </Stack>
  )
}
