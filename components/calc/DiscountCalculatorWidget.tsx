'use client'
// 수정: Auto — 2026-06-08

import { WonInput, parseWonInput } from '@/components/calc/WonInput'
import {
  AMOUNT_UNITS,
  type AmountUnit,
  calcDiscountRatePercent,
  calcPricePer100,
  calcProductDiscount,
  formatDiscountRate,
  unitPer100Label,
} from '@/lib/discountCalc'
import { formatWon } from '@/lib/annualPaymentCalc'
import { sanitizeDecimalInput } from '@/lib/dividendPayload'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import MenuItem from '@mui/material/MenuItem'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { alpha } from '@mui/material/styles'
import { useMemo, useState } from 'react'

function ResultRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <Stack direction="row" justifyContent="space-between" alignItems="baseline" spacing={1}>
      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, flexShrink: 0 }}>
        {label}
      </Typography>
      <Typography
        sx={{
          fontWeight: highlight ? 900 : 800,
          fontSize: highlight ? '1rem' : '0.88rem',
          color: highlight ? 'primary.main' : 'text.primary',
          textAlign: 'right',
          wordBreak: 'break-all',
        }}
      >
        {value}
      </Typography>
    </Stack>
  )
}

export function DiscountCalculatorWidget() {
  const [originalText, setOriginalText] = useState('')
  const [discountText, setDiscountText] = useState('')
  const [productText, setProductText] = useState('')
  const [amountText, setAmountText] = useState('')
  const [amountUnit, setAmountUnit] = useState<AmountUnit>('g')

  const originalPrice = parseWonInput(originalText) ?? 0
  const discountAmount = parseWonInput(discountText) ?? 0
  const productPrice = parseWonInput(productText) ?? 0
  const amountValue = useMemo(() => {
    const cleaned = amountText.trim()
    if (!cleaned || cleaned === '.') return 0
    const n = Number(cleaned)
    return Number.isFinite(n) && n > 0 ? n : 0
  }, [amountText])

  const discountRate = useMemo(
    () => calcDiscountRatePercent(originalPrice, discountAmount),
    [originalPrice, discountAmount],
  )

  const productResult = useMemo(() => {
    if (discountRate == null || productPrice <= 0) return null
    return calcProductDiscount(productPrice, discountRate)
  }, [discountRate, productPrice])

  const per100Normal = useMemo(() => {
    if (amountValue <= 0 || productPrice <= 0) return null
    return calcPricePer100(productPrice, amountValue)
  }, [amountValue, productPrice])

  const per100Sale = useMemo(() => {
    if (amountValue <= 0 || !productResult) return null
    return calcPricePer100(productResult.salePrice, amountValue)
  }, [amountValue, productResult])

  const per100Label = unitPer100Label(amountUnit)

  return (
    <Stack spacing={1.25} sx={{ width: '100%', minWidth: 0, pb: 1 }}>
      <Paper
        variant="outlined"
        sx={{
          p: 1.25,
          borderRadius: 2,
          bgcolor: (theme) => alpha(theme.palette.primary.main, 0.04),
        }}
      >
        <Typography sx={{ fontWeight: 900, fontSize: '0.92rem', mb: 1 }}>
          할인율 계산
        </Typography>
        <Stack spacing={0.5}>
          <WonInput label="정상가" value={originalText} onChange={setOriginalText} placeholder="40,000" />
          <WonInput label="할인" value={discountText} onChange={setDiscountText} placeholder="7,000" />
        </Stack>
        <Box
          sx={{
            mt: 1.1,
            px: 1,
            py: 0.85,
            borderRadius: 1.5,
            bgcolor: 'background.paper',
            border: 1,
            borderColor: 'divider',
          }}
        >
          {discountRate != null ? (
            <ResultRow label="할인율" value={formatDiscountRate(discountRate)} highlight />
          ) : (
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
              정상가와 할인 금액을 입력하세요
            </Typography>
          )}
        </Box>
      </Paper>

      <Paper variant="outlined" sx={{ p: 1.25, borderRadius: 2 }}>
        <Typography sx={{ fontWeight: 900, fontSize: '0.92rem', mb: 1 }}>
          상품 할인가
        </Typography>
        <WonInput label="상품 정상가" value={productText} onChange={setProductText} placeholder="3,640" />
        <Box
          sx={{
            mt: 1.1,
            px: 1,
            py: 0.85,
            borderRadius: 1.5,
            bgcolor: (theme) => alpha(theme.palette.action.hover, 0.04),
            border: 1,
            borderColor: 'divider',
          }}
        >
          {productResult && discountRate != null ? (
            <Stack spacing={0.55}>
              <ResultRow label="할인액" value={formatWon(productResult.discountWon)} />
              <ResultRow label="할인가" value={formatWon(productResult.salePrice)} highlight />
            </Stack>
          ) : (
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
              {discountRate == null ? '위에서 할인율을 먼저 계산하세요' : '상품 정상가를 입력하세요'}
            </Typography>
          )}
        </Box>

        <Divider sx={{ my: 1.25 }} />

        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, display: 'block', mb: 0.75 }}>
          용량 옵션 (선택)
        </Typography>
        <Stack direction="row" spacing={0.75}>
          <TextField
            label="용량"
            size="small"
            margin="dense"
            fullWidth
            value={amountText}
            onChange={(e) => setAmountText(sanitizeDecimalInput(e.target.value))}
            placeholder="150"
            inputProps={{ inputMode: 'decimal' }}
          />
          <TextField
            select
            label="단위"
            size="small"
            margin="dense"
            sx={{ minWidth: 72, flexShrink: 0 }}
            value={amountUnit}
            onChange={(e) => setAmountUnit(e.target.value as AmountUnit)}
          >
            {AMOUNT_UNITS.map((unit) => (
              <MenuItem key={unit} value={unit} dense>
                {unit}
              </MenuItem>
            ))}
          </TextField>
        </Stack>

        {amountValue > 0 && productPrice > 0 && productResult ? (
          <Box
            sx={{
              mt: 1,
              px: 1,
              py: 0.85,
              borderRadius: 1.5,
              border: 1,
              borderColor: 'divider',
            }}
          >
            <Stack spacing={0.55}>
              <ResultRow
                label={`정상 ${per100Label}`}
                value={per100Normal != null ? formatWon(Math.round(per100Normal)) : '—'}
              />
              <ResultRow
                label={`할인 ${per100Label}`}
                value={per100Sale != null ? formatWon(Math.round(per100Sale)) : '—'}
                highlight
              />
            </Stack>
          </Box>
        ) : amountText ? (
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, mt: 0.75, display: 'block' }}>
            상품 정상가와 할인율이 있어야 단가를 계산할 수 있어요
          </Typography>
        ) : null}
      </Paper>
    </Stack>
  )
}
