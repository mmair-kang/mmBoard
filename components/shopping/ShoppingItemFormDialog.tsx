'use client'
// 수정: Auto — 2026-06-05 (브랜드·소장 UI)

import { AppDialog } from '@/components/common/AppDialog'
import { FormDialogFooter } from '@/components/common/FormDialogFooter'
import { FormDialogHeader } from '@/components/common/FormDialogHeader'
import {
  AMOUNT_UNITS,
  PACK_TYPES,
  SHOPPING_CATEGORIES,
  SHOPPING_STORES,
  getCategoryMeta,
  type AmountUnit,
  type PackType,
  type ShoppingCategoryKey,
  type ShoppingStoreKey,
} from '@/config/shoppingCategories'
import { sxCategoryBadge, sxCategoryChip } from '@/components/shopping/shoppingStyles'
import {
  formDialogCompactFieldSx,
  formDialogCompactTextFieldProps,
  formDialogContentScrollSx,
  formDialogContentSx,
  formDialogFieldStackSpacing,
  formDialogFieldStackSx,
  formDialogFirstFieldSx,
  formDialogFormSx,
  formDialogSlotProps,
} from '@/config/formDialogLayout'
import { ShoppingImageField } from '@/components/shopping/ShoppingImageField'
import type { ShoppingItem } from '@/hooks/useShoppingItems'
import type { ShoppingItemPayload } from '@/lib/shoppingPayload'
import { todayIsoDate } from '@/lib/shoppingDate'
import Box from '@mui/material/Box'
import DialogContent from '@mui/material/DialogContent'
import FormControl from '@mui/material/FormControl'
import InputAdornment from '@mui/material/InputAdornment'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import dayjs, { type Dayjs } from 'dayjs'
import { useEffect, useState } from 'react'

type FormState = {
  brand: string
  name: string
  price: string
  amount: string
  amountUnit: AmountUnit
  packType: PackType
  packCount: string
  unitsPerPack: string
  storeKey: ShoppingStoreKey
  storeCustom: string
  lastPurchaseDate: Dayjs | null
}

type Props = {
  open: boolean
  category: ShoppingCategoryKey
  item?: ShoppingItem | null
  onClose: () => void
  onSubmit: (payload: ShoppingItemPayload) => Promise<void>
  onDelete?: () => Promise<void>
}

const emptyForm = (): FormState => ({
  brand: '',
  name: '',
  price: '',
  amount: '',
  amountUnit: 'g',
  packType: 'piece',
  packCount: '1',
  unitsPerPack: '1',
  storeKey: 'coupang',
  storeCustom: '',
  lastPurchaseDate: dayjs(todayIsoDate()),
})

function formFromItem(item: ShoppingItem): FormState {
  const packType = item.packType === 'box' ? 'box' : 'piece'
  return {
    brand: item.brand,
    name: item.name,
    price: String(item.price),
    amount: String(item.amount),
    amountUnit: item.amountUnit,
    packType,
    packCount: String(item.packCount ?? 1),
    unitsPerPack: String(item.unitsPerPack ?? 1),
    storeKey: item.storeKey,
    storeCustom: item.storeCustom ?? '',
    lastPurchaseDate: item.lastPurchaseDate ? dayjs(item.lastPurchaseDate) : dayjs(todayIsoDate()),
  }
}

const compactFormControlSx = formDialogCompactFieldSx

const compactDateFieldSlotProps = {
  textField: {
    ...formDialogCompactTextFieldProps,
    required: true,
    fullWidth: true,
  },
}

export function ShoppingItemFormDialog({ open, category, item, onClose, onSubmit, onDelete }: Props) {
  const isEdit = item != null
  const [form, setForm] = useState<FormState>(emptyForm)
  const [formCategory, setFormCategory] = useState<ShoppingCategoryKey>(category)
  const [imageData, setImageData] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const activeCategory = isEdit ? formCategory : category
  const categoryMeta = getCategoryMeta(activeCategory)
  const isBox = form.packType === 'box'
  useEffect(() => {
    if (!open) {
      setForm(emptyForm())
      setImageData(null)
      setSubmitting(false)
      setDeleting(false)
      return
    }
    setForm(item ? formFromItem(item) : emptyForm())
    setFormCategory(item?.category ?? category)
    setImageData(item?.imageData ?? null)
  }, [open, item, category])

  const showCustomStore = form.storeKey === 'custom'
  const canSubmit =
    form.name.trim() &&
    Number(form.price) >= 0 &&
    Number(form.amount) > 0 &&
    Number.isInteger(Number(form.packCount)) &&
    Number(form.packCount) >= 1 &&
    (!isBox ||
      (Number.isInteger(Number(form.unitsPerPack)) && Number(form.unitsPerPack) >= 1)) &&
    form.lastPurchaseDate?.isValid()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit || submitting || !form.lastPurchaseDate) return
    setSubmitting(true)
    try {
      await onSubmit({
        category: activeCategory,
        brand: form.brand.trim(),
        name: form.name.trim(),
        price: Math.round(Number(form.price)),
        amount: Number(form.amount),
        amountUnit: form.amountUnit,
        packType: form.packType,
        packCount: Math.round(Number(form.packCount)),
        unitsPerPack: isBox ? Math.round(Number(form.unitsPerPack)) : 1,
        storeKey: form.storeKey,
        storeCustom: showCustomStore ? form.storeCustom.trim() || null : null,
        lastPurchaseDate: form.lastPurchaseDate.format('YYYY-MM-DD'),
        imageData,
      })
      onClose()
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!onDelete || deleting) return
    setDeleting(true)
    try {
      await onDelete()
      onClose()
    } finally {
      setDeleting(false)
    }
  }

  return (
    <AppDialog open={open} onClose={onClose} fullWidth maxWidth="xs" slotProps={formDialogSlotProps}>
      <Box component="form" onSubmit={handleSubmit} sx={formDialogFormSx}>
        <FormDialogHeader onClose={onClose} closeDisabled={submitting || deleting}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography component="span" sx={sxCategoryBadge(activeCategory)}>
              {categoryMeta.label}
            </Typography>
            <Typography component="span" sx={{ fontSize: '1.05rem', fontWeight: 700 }}>
              {isEdit ? '상품 수정' : '상품 추가'}
            </Typography>
          </Stack>
        </FormDialogHeader>
        <DialogContent sx={formDialogContentSx} dividers={false}>
          <Box sx={formDialogContentScrollSx}>
            <Stack spacing={formDialogFieldStackSpacing} sx={formDialogFieldStackSx}>
              {isEdit ? (
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, mb: 0.75, display: 'block' }}>
                    카테고리
                  </Typography>
                  <Stack direction="row" spacing={0.75} sx={{ flexWrap: 'wrap' }}>
                    {SHOPPING_CATEGORIES.map((c) => (
                      <Box
                        key={c.key}
                        component="button"
                        type="button"
                        onClick={() => setFormCategory(c.key)}
                        sx={{
                          ...sxCategoryChip(c.key, formCategory === c.key),
                          fontFamily: 'inherit',
                        }}
                      >
                        {c.label}
                      </Box>
                    ))}
                  </Stack>
                </Box>
              ) : null}
              <TextField
                label="브랜드"
                value={form.brand}
                onChange={(e) => setForm((prev) => ({ ...prev, brand: e.target.value }))}
                fullWidth
                size="small"
                margin="dense"
                sx={formDialogFirstFieldSx}
              />
              <TextField
                label="이름"
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                required
                fullWidth
                {...formDialogCompactTextFieldProps}
              />
              <ShoppingImageField value={imageData} onChange={setImageData} active={open} />
              <TextField
                label="가격"
                type="number"
                value={form.price}
                onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))}
                required
                fullWidth
                inputProps={{ min: 0, step: 1 }}
                InputProps={{
                  endAdornment: <InputAdornment position="end">원</InputAdornment>,
                }}
                {...formDialogCompactTextFieldProps}
              />
              <Stack direction="row" spacing={1}>
                <TextField
                  label="용량"
                  type="number"
                  value={form.amount}
                  onChange={(e) => setForm((prev) => ({ ...prev, amount: e.target.value }))}
                  required
                  fullWidth
                  inputProps={{ min: 0, step: 'any' }}
                  {...formDialogCompactTextFieldProps}
                />
                <FormControl size="small" margin="dense" sx={{ minWidth: 88, ...compactFormControlSx }}>
                  <InputLabel id="amount-unit-label">단위</InputLabel>
                  <Select
                    labelId="amount-unit-label"
                    label="단위"
                    value={form.amountUnit}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, amountUnit: e.target.value as AmountUnit }))
                    }
                  >
                    {AMOUNT_UNITS.map((unit) => (
                      <MenuItem key={unit} value={unit} dense>
                        {unit}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Stack>
              <Stack direction="row" spacing={1}>
                <TextField
                  label="수량"
                  type="number"
                  value={form.packCount}
                  onChange={(e) => setForm((prev) => ({ ...prev, packCount: e.target.value }))}
                  required
                  fullWidth
                  inputProps={{ min: 1, step: 1 }}
                  {...formDialogCompactTextFieldProps}
                />
                <FormControl size="small" margin="dense" sx={{ minWidth: 88, ...compactFormControlSx }}>
                  <InputLabel id="pack-type-label">구매</InputLabel>
                  <Select
                    labelId="pack-type-label"
                    label="구매"
                    value={form.packType}
                    onChange={(e) => {
                      const packType = e.target.value as PackType
                      setForm((prev) => ({
                        ...prev,
                        packType,
                        unitsPerPack: packType === 'box' ? prev.unitsPerPack : '1',
                      }))
                    }}
                  >
                    {PACK_TYPES.map((type) => (
                      <MenuItem key={type.key} value={type.key} dense>
                        {type.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Stack>
              {isBox ? (
                <Box>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ flexShrink: 0, fontWeight: 600, minWidth: 64 }}
                    >
                      1박스당
                    </Typography>
                    <TextField
                      type="number"
                      value={form.unitsPerPack}
                      onChange={(e) => setForm((prev) => ({ ...prev, unitsPerPack: e.target.value }))}
                      required
                      size="small"
                      margin="dense"
                      sx={{ width: 72, ...formDialogCompactFieldSx }}
                      inputProps={{ min: 1, step: 1 }}
                    />
                    <Typography variant="body2" color="text.secondary" sx={{ flexShrink: 0, fontWeight: 600 }}>
                      개
                    </Typography>
                  </Stack>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5, lineHeight: 1.45 }}>
                    박스 1개 안에 들어 있는 낱개 수예요. 17개입 박스면 17
                  </Typography>
                </Box>
              ) : null}
              <DatePicker
                label="마지막 구매일"
                value={form.lastPurchaseDate}
                onChange={(value) => setForm((prev) => ({ ...prev, lastPurchaseDate: value }))}
                format="YY-MM-DD"
                slotProps={compactDateFieldSlotProps}
              />
              <FormControl fullWidth size="small" margin="dense" sx={compactFormControlSx}>
                <InputLabel id="store-label">구매처</InputLabel>
                <Select
                  labelId="store-label"
                  label="구매처"
                  value={form.storeKey}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, storeKey: e.target.value as ShoppingStoreKey }))
                  }
                >
                  {SHOPPING_STORES.map((store) => (
                    <MenuItem key={store.key} value={store.key} dense>
                      {store.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              {showCustomStore ? (
                <TextField
                  label="구매처 직접 입력"
                  value={form.storeCustom}
                  onChange={(e) => setForm((prev) => ({ ...prev, storeCustom: e.target.value }))}
                  placeholder="모를 경우 비워두세요"
                  fullWidth
                  {...formDialogCompactTextFieldProps}
                />
              ) : null}
            </Stack>
          </Box>
        </DialogContent>
        <FormDialogFooter
          onDelete={isEdit && onDelete ? () => void handleDelete() : undefined}
          deleteLoading={deleting}
          submitLoading={submitting}
          submitDisabled={!canSubmit}
          submitLabel={isEdit ? '저장' : '추가'}
        />
      </Box>
    </AppDialog>
  )
}
