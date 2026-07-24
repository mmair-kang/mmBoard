'use client'
// 수정: Auto — 2026-07-24 23:42 (주당 배당금·환율 역산)
// 수정: Auto — 2026-07-24 22:30 (미등록 보유주 선택 추가)
// 수정: Auto — 2026-07-24 18:25 (세전 배당금 원화 입력)
// 수정: Auto — 2026-07-24 18:15 (월별 배당 입력 단순화)
// 수정: Auto — 2026-07-14 23:37

import { AppDialog } from '@/components/common/AppDialog'
import { FormDialogHeader } from '@/components/common/FormDialogHeader'
import { MonthlyDaySelect } from '@/components/home/MonthlyDaySelect'
import { DividendAmountLines } from '@/components/home/DividendAmountLines'
import { formDialogContentSx, formDialogPaperSlotSx } from '@/config/formDialogLayout'
import type { DividendHolding } from '@/hooks/useDividends'
import type { DividendEntryPayload } from '@/lib/dividendPayload'
import {
  decimalToText,
  parseDecimalText,
  sanitizeDecimalInput,
} from '@/lib/dividendPayload'
import {
  US_WITHHOLDING_RATE,
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
import DialogContent from '@mui/material/DialogContent'
import IconButton from '@mui/material/IconButton'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
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
  /** 주당 배당금 — 해외=$ (국내는 세전÷주수로 자동) */
  perShareText: string
  /** 세전 배당금 (원화 총액) */
  grossKrwText: string
  /** 국내 — 주당 과세표준액(원) */
  taxBaseKrwText: string
}

function isDomesticDraft(
  ticker: string,
  marketByTicker?: Map<string, DividendHolding['market']>,
): boolean {
  return (
    marketByTicker?.get(ticker.trim().toUpperCase()) === 'domestic' ||
    isDomesticDividendTicker(ticker)
  )
}

function roundUsd(value: number): number {
  return Math.round(value * 10000) / 10000
}

function roundRate(value: number): number {
  return Math.round(value * 100) / 100
}

function resolveGrossKrwFromEntry(row: DividendEntryPayload, domestic: boolean): number {
  if (domestic) {
    return Math.round(row.foreignSettlement + row.foreignTax)
  }
  if (row.exchangeRate > 0) {
    return Math.round((row.foreignSettlement + row.foreignTax) * row.exchangeRate)
  }
  return 0
}

function resolvePerShareFromEntry(row: DividendEntryPayload, domestic: boolean): number {
  if (row.shares <= 0) return 0
  if (domestic) {
    const gross = row.foreignSettlement + row.foreignTax
    return gross > 0 ? gross / row.shares : 0
  }
  const grossUsd = row.foreignSettlement + row.foreignTax
  return grossUsd > 0 ? grossUsd / row.shares : 0
}

/** 해외: 세전 원화 ÷ (주수 × 주당$) = 적용 환율 */
export function calcImpliedExchangeRate(shares: number, perShareUsd: number, grossKrw: number): number {
  const grossUsd = shares * perShareUsd
  if (grossUsd <= 0 || grossKrw <= 0) return 0
  return roundRate(grossKrw / grossUsd)
}

export function entriesToDrafts(
  entries: Array<DividendEntryPayload & { id?: number }>,
  holdings: DividendHolding[] = [],
): DividendEntryDraft[] {
  const marketByTicker = new Map(holdings.map((row) => [row.ticker.toUpperCase(), row.market]))
  const holdingByTicker = new Map(holdings.map((row) => [row.ticker.toUpperCase(), row]))

  return entries.map((row, index) => {
    const key = row.ticker.trim().toUpperCase()
    const domestic =
      isDomesticDraft(row.ticker, marketByTicker) || row.exchangeRate === 1
    const holding = holdingByTicker.get(key)

    let grossKrw = resolveGrossKrwFromEntry(row, domestic)
    let perShare = domestic ? 0 : resolvePerShareFromEntry(row, false)

    if (!domestic && perShare <= 0 && holding) {
      perShare = holding.perShareDividendUsd
    }
    if (grossKrw <= 0 && holding && row.shares > 0) {
      if (domestic && holding.perShareDividendKrw > 0) {
        grossKrw = Math.round(holding.perShareDividendKrw * row.shares)
      } else if (!domestic && holding.perShareDividendUsd > 0 && row.exchangeRate > 0) {
        grossKrw = Math.round(holding.perShareDividendUsd * row.shares * row.exchangeRate)
      }
    }

    return {
      key: row.id != null ? `id-${row.id}` : `new-${index}`,
      id: row.id,
      dayOfMonth: row.dayOfMonth,
      ticker: row.ticker,
      shares: row.shares,
      perShareText: !domestic && perShare > 0 ? decimalToText(perShare) : '',
      grossKrwText: grossKrw > 0 ? decimalToText(grossKrw) : '',
      taxBaseKrwText: domestic
        ? decimalToText(row.perShareTaxBaseKrw ?? holding?.perShareTaxBaseKrw ?? 0)
        : '',
    }
  })
}

export function draftToEntryPayload(
  draft: DividendEntryDraft,
  marketByTicker?: Map<string, DividendHolding['market']>,
  _usdKrwRate?: number | null,
): DividendEntryPayload {
  const domestic = isDomesticDraft(draft.ticker, marketByTicker)
  const perShare = parseDecimalText(draft.perShareText)
  const grossKrwInput = Math.round(parseDecimalText(draft.grossKrwText))

  if (domestic) {
    const taxBase = parseDecimalText(draft.taxBaseKrwText)
    const cashGross = grossKrwInput > 0 ? grossKrwInput : 0
    const perShareForTax = draft.shares > 0 && cashGross > 0 ? cashGross / draft.shares : 0
    const { taxKrw } = calcDomesticNetFromCashAndTaxBase(draft.shares, perShareForTax, taxBase)
    return {
      id: draft.id,
      dayOfMonth: draft.dayOfMonth,
      ticker: draft.ticker.trim(),
      shares: draft.shares,
      exchangeRate: 1,
      foreignSettlement: cashGross > 0 ? cashGross - taxKrw : 0,
      foreignTax: cashGross > 0 ? taxKrw : 0,
      perShareTaxBaseKrw: taxBase,
    }
  }

  const grossUsd = draft.shares > 0 && perShare > 0 ? draft.shares * perShare : 0
  const rate = calcImpliedExchangeRate(draft.shares, perShare, grossKrwInput)
  const taxUsd = roundUsd(grossUsd * US_WITHHOLDING_RATE)
  const settlementUsd = roundUsd(Math.max(0, grossUsd - taxUsd))

  return {
    id: draft.id,
    dayOfMonth: draft.dayOfMonth,
    ticker: draft.ticker.trim(),
    shares: draft.shares,
    exchangeRate: rate,
    foreignSettlement: settlementUsd,
    foreignTax: taxUsd,
    perShareTaxBaseKrw: 0,
  }
}

export function draftsToEntries(
  drafts: DividendEntryDraft[],
  holdings: DividendHolding[] = [],
  usdKrwRate?: number | null,
): DividendEntryPayload[] {
  const marketByTicker = new Map(holdings.map((row) => [row.ticker.toUpperCase(), row.market]))
  return drafts
    .map((draft) => draftToEntryPayload(draft, marketByTicker, usdKrwRate))
    .filter((row) => {
      const domestic =
        isDomesticDraft(row.ticker, marketByTicker) || row.exchangeRate === 1
      if (domestic) {
        return row.foreignSettlement > 0 || row.foreignTax > 0
      }
      return row.exchangeRate > 0 && row.foreignSettlement > 0
    })
}

type Props = {
  drafts: DividendEntryDraft[]
  holdings: DividendHolding[]
  usdKrwRate?: number | null
  onChange: (drafts: DividendEntryDraft[]) => void
}

export function DividendEntriesEditor({ drafts, holdings, usdKrwRate = null, onChange }: Props) {
  const [dragKey, setDragKey] = useState<string | null>(null)
  const [pickerOpen, setPickerOpen] = useState(false)

  const holdingByTicker = useMemo(
    () => new Map(holdings.map((row) => [row.ticker.toUpperCase(), row])),
    [holdings],
  )
  const marketByTicker = useMemo(
    () => new Map(holdings.map((row) => [row.ticker.toUpperCase(), row.market])),
    [holdings],
  )
  const usedTickers = useMemo(
    () => new Set(drafts.map((row) => row.ticker.trim().toUpperCase()).filter(Boolean)),
    [drafts],
  )
  const availableHoldings = useMemo(
    () => holdings.filter((row) => !usedTickers.has(row.ticker.trim().toUpperCase())),
    [holdings, usedTickers],
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

  const buildDraftFromHolding = (holding: DividendHolding): DividendEntryDraft => {
    const domestic = holding.market === 'domestic' || isDomesticDividendTicker(holding.ticker)
    const shares = holding.defaultShares ?? 0
    const perShareUsd = holding.perShareDividendUsd
    let grossKrw = 0
    if (domestic && holding.perShareDividendKrw > 0 && shares > 0) {
      grossKrw = Math.round(holding.perShareDividendKrw * shares)
    } else if (!domestic && perShareUsd > 0 && shares > 0 && usdKrwRate != null && usdKrwRate > 0) {
      grossKrw = Math.round(perShareUsd * shares * usdKrwRate)
    }
    return {
      key: `new-${Date.now()}`,
      dayOfMonth: 1,
      ticker: holding.ticker,
      shares,
      perShareText: !domestic && perShareUsd > 0 ? decimalToText(perShareUsd) : '',
      grossKrwText: grossKrw > 0 ? decimalToText(grossKrw) : '',
      taxBaseKrwText: domestic ? decimalToText(holding.perShareTaxBaseKrw ?? 0) : '',
    }
  }

  const addHolding = (holding: DividendHolding) => {
    onChange([...drafts, buildDraftFromHolding(holding)])
    setPickerOpen(false)
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
          해외는 주당($)·세전(원)으로 환율이 자동 계산됩니다
        </Typography>
        <Button
          size="small"
          startIcon={<AddRoundedIcon />}
          onClick={() => setPickerOpen(true)}
          disabled={availableHoldings.length === 0}
          sx={{ alignSelf: { xs: 'flex-start', sm: 'auto' } }}
        >
          항목 추가
        </Button>
      </Stack>

      <AppDialog
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
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
        <FormDialogHeader onClose={() => setPickerOpen(false)}>
          <Typography sx={{ fontSize: '1.05rem', fontWeight: 700 }}>종목 추가</Typography>
        </FormDialogHeader>
        <DialogContent sx={{ ...formDialogContentSx, pt: 0.5 }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block', mb: 0.75 }}>
            보유 배당주 중 이번 달에 아직 없는 종목입니다. 클릭하면 추가됩니다.
          </Typography>
          {availableHoldings.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, py: 2, textAlign: 'center' }}>
              추가할 종목이 없습니다
            </Typography>
          ) : (
            <List disablePadding sx={{ mx: -0.5 }}>
              {availableHoldings.map((holding) => {
                const domestic = holding.market === 'domestic'
                return (
                  <ListItemButton
                    key={holding.id}
                    onClick={() => addHolding(holding)}
                    sx={{
                      borderRadius: 1.5,
                      mb: 0.35,
                      border: 1,
                      borderColor: 'divider',
                      py: 1,
                    }}
                  >
                    <ListItemText
                      primary={
                        <Stack direction="row" alignItems="center" spacing={0.5}>
                          <Typography sx={{ fontWeight: 800, fontSize: '0.9rem' }}>{holding.ticker}</Typography>
                          <Chip
                            size="small"
                            label={domestic ? '국내' : '해외'}
                            color={domestic ? 'success' : 'default'}
                            variant="outlined"
                            sx={{ height: 18, fontSize: '0.58rem', fontWeight: 700 }}
                          />
                        </Stack>
                      }
                      secondary={`${holding.defaultShares.toLocaleString('ko-KR')}주`}
                      secondaryTypographyProps={{ sx: { fontWeight: 600, fontSize: '0.75rem' } }}
                    />
                  </ListItemButton>
                )
              })}
            </List>
          )}
        </DialogContent>
      </AppDialog>

      {drafts.length === 0 ? (
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
          배당 항목이 없습니다.
        </Typography>
      ) : null}

      {drafts.map((draft) => {
        const domestic = isDomesticDraft(draft.ticker, marketByTicker)
        const payload = draftToEntryPayload(draft, marketByTicker, usdKrwRate)
        const perShare = parseDecimalText(draft.perShareText)
        const grossKrw = Math.round(parseDecimalText(draft.grossKrwText))
        const impliedRate = !domestic
          ? calcImpliedExchangeRate(draft.shares, perShare, grossKrw)
          : 0
        const hasAmount = draft.shares > 0 && (grossKrw > 0 || perShare > 0)
        const preview =
          hasAmount && (payload.foreignSettlement > 0 || payload.foreignTax > 0) && payload.exchangeRate > 0
            ? calcDividendEntry(payload)
            : null
        const taxBase = parseDecimalText(draft.taxBaseKrwText)
        const domesticCashGross = grossKrw > 0 ? grossKrw : 0
        const domesticPerShare =
          domestic && draft.shares > 0 && domesticCashGross > 0
            ? domesticCashGross / draft.shares
            : 0
        const domesticPreview =
          domestic && domesticCashGross > 0
            ? (() => {
                const calc = calcDomesticNetFromCashAndTaxBase(
                  draft.shares,
                  domesticPerShare,
                  taxBase,
                )
                return {
                  ...calc,
                  cashGross: domesticCashGross,
                  netKrw: domesticCashGross - calc.taxKrw,
                }
              })()
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
                  label="배당 지급일"
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
                    if (!holding) {
                      updateDraft(draft.key, { ticker })
                      return
                    }
                    const next = buildDraftFromHolding(holding)
                    updateDraft(draft.key, {
                      ticker: next.ticker,
                      shares: next.shares,
                      perShareText: next.perShareText,
                      grossKrwText: next.grossKrwText,
                      taxBaseKrwText: next.taxBaseKrwText,
                    })
                  }}
                >
                  {holdings
                    .filter((row) => {
                      const key = row.ticker.trim().toUpperCase()
                      return key === draft.ticker.trim().toUpperCase() || !usedTickers.has(key)
                    })
                    .map((row) => (
                      <MenuItem key={row.id} value={row.ticker}>
                        {row.ticker}
                      </MenuItem>
                    ))}
                </TextField>
              </Stack>

              <TextField
                label="보유 주수"
                size="small"
                margin="dense"
                fullWidth
                value={draft.shares > 0 ? String(draft.shares) : ''}
                onChange={(e) => {
                  const shares = Math.round(Number(e.target.value.replace(/[^\d]/g, ''))) || 0
                  const patch: Partial<DividendEntryDraft> = { shares }
                  if (
                    !domestic &&
                    shares > 0 &&
                    perShare > 0 &&
                    usdKrwRate != null &&
                    usdKrwRate > 0 &&
                    !draft.grossKrwText
                  ) {
                    patch.grossKrwText = decimalToText(Math.round(shares * perShare * usdKrwRate))
                  }
                  updateDraft(draft.key, patch)
                }}
                inputProps={{ inputMode: 'numeric' }}
                InputProps={{ endAdornment: <Typography variant="caption">주</Typography> }}
              />

              {!domestic ? (
                <TextField
                  label="주당 배당금 ($)"
                  size="small"
                  margin="dense"
                  fullWidth
                  value={draft.perShareText}
                  onChange={(e) => {
                    const text = sanitizeDecimalInput(e.target.value)
                    const nextPerShare = parseDecimalText(text)
                    const patch: Partial<DividendEntryDraft> = { perShareText: text }
                    if (
                      draft.shares > 0 &&
                      nextPerShare > 0 &&
                      usdKrwRate != null &&
                      usdKrwRate > 0 &&
                      !draft.grossKrwText
                    ) {
                      patch.grossKrwText = decimalToText(
                        Math.round(draft.shares * nextPerShare * usdKrwRate),
                      )
                    }
                    updateDraft(draft.key, patch)
                  }}
                  inputProps={{ inputMode: 'decimal' }}
                  placeholder="0.45"
                />
              ) : null}

              <TextField
                label="세전 배당금 (원)"
                size="small"
                margin="dense"
                fullWidth
                value={draft.grossKrwText}
                onChange={(e) =>
                  updateDraft(draft.key, {
                    grossKrwText: e.target.value.replace(/[^\d]/g, ''),
                  })
                }
                inputProps={{ inputMode: 'numeric' }}
                placeholder="320000"
                InputProps={{ endAdornment: <Typography variant="caption">원</Typography> }}
                helperText={
                  domestic && domesticPerShare > 0
                    ? `주당 ${Math.round(domesticPerShare).toLocaleString('ko-KR')}원 (세전 ÷ 주수)`
                    : !domestic && impliedRate > 0
                      ? `적용 환율 ${formatRate(impliedRate)}원/$ (세전 원 ÷ 세전 $)`
                      : undefined
                }
              />

              {domestic ? (
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
                  helperText="세금혜택 ETF · 과세표준 × 15.4%"
                />
              ) : null}

              {domestic && domesticPreview ? (
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, lineHeight: 1.45 }}>
                  세후 입금 {formatKrw(domesticPreview.netKrw)}
                  {domesticPreview.taxKrw > 0
                    ? ` · 세금 ${formatKrw(domesticPreview.taxKrw)}`
                    : ' · 세금 0원'}
                </Typography>
              ) : null}

              {!domestic && preview && impliedRate > 0 ? (
                <Stack spacing={0.25} sx={{ minWidth: 0 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, lineHeight: 1.45 }}>
                    세전 {formatUsd(draft.shares * perShare)} · 환율 {formatRate(impliedRate)}원/$ · 원천세
                    15%
                  </Typography>
                  <DividendAmountLines
                    grossKrw={grossKrw}
                    dividendKrw={preview.dividendKrw}
                    emphasize
                  />
                </Stack>
              ) : null}

              {domestic && domesticPreview ? (
                <DividendAmountLines
                  grossKrw={domesticPreview.cashGross}
                  dividendKrw={domesticPreview.netKrw}
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
