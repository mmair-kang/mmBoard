'use client'
// 수정: Auto — 2026-07-14 23:37

import { MonthlyDaySelect } from '@/components/home/MonthlyDaySelect'
import type { DividendHolding } from '@/hooks/useDividends'
import type { DividendEntryPayload } from '@/lib/dividendPayload'
import {
  decimalToText,
  parseDecimalText,
  sanitizeDecimalInput,
} from '@/lib/dividendPayload'
import { DividendAmountLines } from '@/components/home/DividendAmountLines'
import {
  calcDividendEntry,
  calcDomesticNetFromCashAndTaxBase,
  formatKrw,
  formatRate,
  formatUsd,
} from '@/lib/dividendCalc'
import { isDomesticDividendTicker } from '@/lib/dividendHoldingsConfig'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded'
import DragIndicatorRoundedIcon from '@mui/icons-material/DragIndicatorRounded'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import MenuItem from '@mui/material/MenuItem'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { alpha } from '@mui/material/styles'
import { useMemo, useState } from 'react'

export type DividendEntryDraft = {
  key: string
  id?: number
  dayOfMonth: number
  ticker: string
  shares: number
  exchangeRateText: string
  foreignSettlementText: string
  foreignTaxText: string
  /** 국내 — 주당 배당(원) */
  perShareKrwText: string
  /** 국내 — 주당 과세표준액(원) */
  taxBaseKrwText: string
}

function resolvePerShareKrwText(row: DividendEntryPayload & { id?: number }): string {
  if (!isDomesticDividendTicker(row.ticker)) return ''
  if (row.shares > 0) {
    const cashGross = row.foreignSettlement + row.foreignTax
    if (cashGross > 0) return decimalToText(cashGross / row.shares)
  }
  return ''
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
    exchangeRateText: isDomesticDividendTicker(row.ticker)
      ? '1'
      : decimalToText(row.exchangeRate),
    foreignSettlementText: decimalToText(row.foreignSettlement),
    foreignTaxText: decimalToText(row.foreignTax),
    perShareKrwText: resolvePerShareKrwText(row),
    taxBaseKrwText: isDomesticDividendTicker(row.ticker)
      ? decimalToText(row.perShareTaxBaseKrw ?? 0)
      : '',
  }))
}

export function draftToEntryPayload(draft: DividendEntryDraft): DividendEntryPayload {
  const domestic = isDomesticDividendTicker(draft.ticker)

  if (domestic) {
    const perShare = parseDecimalText(draft.perShareKrwText)
    const taxBase = parseDecimalText(draft.taxBaseKrwText)
    const { taxKrw, netKrw } = calcDomesticNetFromCashAndTaxBase(draft.shares, perShare, taxBase)
    return {
      id: draft.id,
      dayOfMonth: draft.dayOfMonth,
      ticker: draft.ticker.trim().toUpperCase(),
      shares: draft.shares,
      exchangeRate: 1,
      foreignSettlement: perShare > 0 ? netKrw : 0,
      foreignTax: perShare > 0 ? taxKrw : 0,
      perShareTaxBaseKrw: taxBase,
    }
  }

  return {
    id: draft.id,
    dayOfMonth: draft.dayOfMonth,
    ticker: draft.ticker.trim().toUpperCase(),
    shares: draft.shares,
    exchangeRate: parseDecimalText(draft.exchangeRateText),
    foreignSettlement: parseDecimalText(draft.foreignSettlementText),
    foreignTax: parseDecimalText(draft.foreignTaxText),
    perShareTaxBaseKrw: 0,
  }
}

export function draftsToEntries(drafts: DividendEntryDraft[]): DividendEntryPayload[] {
  return drafts
    .map(draftToEntryPayload)
    .filter((row) => {
      if (isDomesticDividendTicker(row.ticker)) {
        return row.foreignSettlement > 0 || row.foreignTax > 0
      }
      return row.exchangeRate > 0 && row.foreignSettlement > 0
    })
}

type Props = {
  drafts: DividendEntryDraft[]
  holdings: DividendHolding[]
  onChange: (drafts: DividendEntryDraft[]) => void
}

export function DividendEntriesEditor({ drafts, holdings, onChange }: Props) {
  const [dragKey, setDragKey] = useState<string | null>(null)

  const tickerOptions = useMemo(() => holdings.map((row) => row.ticker), [holdings])
  const holdingByTicker = useMemo(
    () => new Map(holdings.map((row) => [row.ticker.toUpperCase(), row])),
    [holdings],
  )

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
    const holding = holdingByTicker.get(ticker.toUpperCase())
    const domestic = isDomesticDividendTicker(ticker)
    onChange([
      ...drafts,
      {
        key: `new-${Date.now()}`,
        dayOfMonth: 1,
        ticker,
        shares: holding?.defaultShares ?? 0,
        exchangeRateText: domestic ? '1' : '',
        foreignSettlementText: '',
        foreignTaxText: '',
        perShareKrwText: domestic ? decimalToText(holding?.perShareDividendKrw ?? 0) : '',
        taxBaseKrwText: domestic ? decimalToText(holding?.perShareTaxBaseKrw ?? 0) : '',
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
        const domestic =
          holdingByTicker.get(draft.ticker.toUpperCase())?.market === 'domestic' ||
          isDomesticDividendTicker(draft.ticker)
        const payload = draftToEntryPayload(draft)
        const preview =
          payload.foreignSettlement > 0 || payload.foreignTax > 0
            ? calcDividendEntry(payload)
            : null
        const domesticPreview =
          domestic && draft.shares > 0 && parseDecimalText(draft.perShareKrwText) > 0
            ? calcDomesticNetFromCashAndTaxBase(
                draft.shares,
                parseDecimalText(draft.perShareKrwText),
                parseDecimalText(draft.taxBaseKrwText),
              )
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
              bgcolor: (theme) =>
                domestic
                  ? alpha(theme.palette.success.main, 0.04)
                  : alpha(theme.palette.background.default, 0.5),
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
              <Chip
                size="small"
                label={domestic ? '국내' : '해외'}
                color={domestic ? 'success' : 'default'}
                variant="outlined"
                sx={{ height: 18, fontSize: '0.58rem', fontWeight: 700 }}
              />
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
                  onChange={(e) => {
                    const ticker = e.target.value
                    const holding = holdingByTicker.get(ticker.toUpperCase())
                    const isDomestic = isDomesticDividendTicker(ticker)
                    updateDraft(draft.key, {
                      ticker,
                      exchangeRateText: isDomestic ? '1' : draft.exchangeRateText,
                      shares: holding?.defaultShares ?? draft.shares,
                      perShareKrwText: isDomestic
                        ? decimalToText(holding?.perShareDividendKrw ?? 0)
                        : '',
                      taxBaseKrwText: isDomestic
                        ? decimalToText(holding?.perShareTaxBaseKrw ?? 0)
                        : '',
                    })
                  }}
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

              {domestic ? (
                <>
                  <TextField
                    label="주당 배당 (원)"
                    size="small"
                    margin="dense"
                    fullWidth
                    value={draft.perShareKrwText}
                    onChange={(e) =>
                      updateDraft(draft.key, {
                        perShareKrwText: sanitizeDecimalInput(e.target.value),
                      })
                    }
                    inputProps={{ inputMode: 'decimal' }}
                    placeholder="120"
                  />
                  <TextField
                    label="과세표준액 (주당 원)"
                    size="small"
                    margin="dense"
                    fullWidth
                    value={draft.taxBaseKrwText}
                    onChange={(e) =>
                      updateDraft(draft.key, {
                        taxBaseKrwText: sanitizeDecimalInput(e.target.value),
                      })
                    }
                    inputProps={{ inputMode: 'decimal' }}
                    placeholder="1"
                    helperText="세금은 과세표준 × 15.4%로 자동 계산됩니다"
                  />
                  {domesticPreview ? (
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, lineHeight: 1.45 }}>
                      세후 입금 {formatKrw(domesticPreview.netKrw)}
                      {domesticPreview.taxKrw > 0
                        ? ` · 세금 ${formatKrw(domesticPreview.taxKrw)}`
                        : ' · 세금 0원'}
                    </Typography>
                  ) : null}
                </>
              ) : (
                <>
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
                </>
              )}

              {preview && !domestic ? (
                <Stack spacing={0.25} sx={{ minWidth: 0 }}>
                  <DividendAmountLines grossKrw={preview.grossKrw} dividendKrw={preview.dividendKrw} emphasize />
                  {preview.perShareGrossForeign != null ? (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ fontWeight: 600, lineHeight: 1.45, wordBreak: 'break-word', overflowWrap: 'anywhere' }}
                    >
                      주당 {formatUsd(preview.perShareGrossForeign)} (세전) · 환율{' '}
                      {formatRate(parseDecimalText(draft.exchangeRateText))}
                    </Typography>
                  ) : null}
                </Stack>
              ) : null}

              {preview && domestic ? (
                <DividendAmountLines
                  grossKrw={preview.grossKrw}
                  dividendKrw={preview.dividendKrw}
                  emphasize
                />
              ) : null}
            </Stack>
          </Box>
        )
      })}
    </Stack>
  )
}
