'use client'
// 수정: Auto — 2026-07-19 01:40 (제품 추가·제품명)
// 수정: Auto — 2026-07-19 01:25 (브랜드 변형 UI 제거)

import { AppDialog } from '@/components/common/AppDialog'
import { FormDialogFooter } from '@/components/common/FormDialogFooter'
import { FormDialogHeader } from '@/components/common/FormDialogHeader'
import {
  sxCollectionBadge,
  sxCollectionSectionSegmentItem,
  sxCollectionSubChip,
} from '@/components/collection/collectionStyles'
import { ShoppingImageField } from '@/components/shopping/ShoppingImageField'
import {
  COLLECTION_STORES,
  FOOD_SCOPES,
  getCollectionSubcategories,
  getDefaultFoodScopeForSection,
  getFirstSubcategory,
  getFoodScopeLabel,
  getSubcategoryLabel,
  isConsumableSection,
  type CollectionSectionKey,
  type CollectionStoreKey,
  type CollectionSubKey,
  type FoodScopeKey,
} from '@/config/collectionCategories'
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
import {
  COLLECTION_AMOUNT_UNIT_NONE,
  COLLECTION_AMOUNT_UNIT_OPTIONS,
  PACK_TYPES,
  hasCollectionAmount,
  type CollectionAmountUnit,
  type PackType,
} from '@/config/shoppingCategories'
import { useCollectionSubcategories } from '@/hooks/useCollectionSubcategories'
import type { CollectionItem, CollectionProduct } from '@/hooks/useCollectionItems'
import type { CollectionProductPayload } from '@/lib/collectionProductPayload'
import { defaultFoodListChipFlags } from '@/lib/collectionFoodListChips'
import { calcLivingMonthlyCost, formatLivingMonthlyCost } from '@/lib/livingCost'
import { todayIsoDate } from '@/lib/shoppingDate'
import Box from '@mui/material/Box'
import DialogContent from '@mui/material/DialogContent'
import FormControl from '@mui/material/FormControl'
import FormControlLabel from '@mui/material/FormControlLabel'
import InputAdornment from '@mui/material/InputAdornment'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import Switch from '@mui/material/Switch'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import dayjs, { type Dayjs } from 'dayjs'
import { useEffect, useState } from 'react'

type VariantFormState = {
  id?: number
  brand: string
  nameSuffix: string
  purchasePrice: string
  amount: string
  amountUnit: CollectionAmountUnit
  packType: PackType
  packCount: string
  unitsPerPack: string
  storeKey: CollectionStoreKey
  storeCustom: string
  purchaseDate: Dayjs | null
  repurchaseDays: string
  hidden: boolean
  imageData: string | null
}

type Props = {
  open: boolean
  section: CollectionSectionKey
  subCategory: CollectionSubKey
  product?: CollectionProduct | null
  /** 열릴 때 포커스할 변형 id (수정 진입용) */
  initialActiveVariantId?: number | null
  /** 기존 항목에 새 제품을 추가하며 열기 */
  startWithNewVariant?: boolean
  /** 단일 브랜드만 수정/추가 */
  variantOnly?: boolean
  onClose: () => void
  onSubmit: (payload: CollectionProductPayload) => Promise<void>
  onDelete?: () => Promise<void>
}

const emptyVariant = (): VariantFormState => ({
  brand: '',
  nameSuffix: '',
  purchasePrice: '',
  amount: '',
  amountUnit: COLLECTION_AMOUNT_UNIT_NONE,
  packType: 'piece',
  packCount: '1',
  unitsPerPack: '1',
  storeKey: 'coupang',
  storeCustom: '',
  purchaseDate: dayjs(todayIsoDate()),
  repurchaseDays: '30',
  hidden: false,
  imageData: null,
})

function formFromItem(item: CollectionItem): VariantFormState {
  const packType = item.packType === 'box' ? 'box' : 'piece'
  return {
    id: item.id,
    brand: item.brand,
    nameSuffix: item.nameSuffix,
    purchasePrice: String(item.purchasePrice),
    amount: hasCollectionAmount(item.amount, item.amountUnit) ? String(item.amount) : '',
    amountUnit: item.amountUnit,
    packType,
    packCount: String(item.packCount ?? 1),
    unitsPerPack: String(item.unitsPerPack ?? 1),
    storeKey: item.storeKey,
    storeCustom: item.storeCustom ?? '',
    purchaseDate: dayjs(item.purchaseDate),
    repurchaseDays: item.repurchaseDays != null ? String(item.repurchaseDays) : '30',
    hidden: item.hidden ?? false,
    imageData: item.imageData ?? null,
  }
}

function isVariantValid(v: VariantFormState): boolean {
  const isNoAmount = v.amountUnit === COLLECTION_AMOUNT_UNIT_NONE
  const isBox = v.packType === 'box'
  return (
    Number(v.purchasePrice) >= 0 &&
    !!v.purchaseDate?.isValid() &&
    (isNoAmount || Number(v.amount) > 0) &&
    Number.isInteger(Number(v.packCount)) &&
    Number(v.packCount) >= 1 &&
    (!isBox || (Number.isInteger(Number(v.unitsPerPack)) && Number(v.unitsPerPack) >= 1)) &&
    v.repurchaseDays.trim() !== '' &&
    Number.isFinite(Number(v.repurchaseDays)) &&
    Number(v.repurchaseDays) >= 1
  )
}

const compactFormControlSx = formDialogCompactFieldSx

const compactDateFieldSlotProps = {
  textField: {
    ...formDialogCompactTextFieldProps,
    required: true,
    fullWidth: true,
  },
}

export function CollectionProductFormDialog({
  open,
  section,
  subCategory,
  product,
  initialActiveVariantId = null,
  startWithNewVariant = false,
  variantOnly = false,
  onClose,
  onSubmit,
  onDelete,
}: Props) {
  const isEdit = product != null
  const isVariantEdit = variantOnly && !startWithNewVariant
  const isVariantAdd = variantOnly && startWithNewVariant
  const [productName, setProductName] = useState('')
  const [variants, setVariants] = useState<VariantFormState[]>([emptyVariant()])
  const [activeIndex, setActiveIndex] = useState(0)
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0)
  const [formSub, setFormSub] = useState<CollectionSubKey>(subCategory)
  const [formFoodScope, setFormFoodScope] = useState<FoodScopeKey>(() =>
    getDefaultFoodScopeForSection(section),
  )
  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const { subs: formSubs } = useCollectionSubcategories('food')

  const subLabel = getSubcategoryLabel('food', formSub, formSubs)
  const form = variants[activeIndex] ?? variants[0] ?? emptyVariant()
  const isBox = form.packType === 'box'
  const isNoAmount = form.amountUnit === COLLECTION_AMOUNT_UNIT_NONE
  const showCustomStore = form.storeKey === 'custom'

  const repurchaseDaysValue = Number(form.repurchaseDays)
  const livingMonthlyPreview =
    repurchaseDaysValue >= 1 && Number(form.purchasePrice) >= 0
      ? calcLivingMonthlyCost(Math.round(Number(form.purchasePrice)), repurchaseDaysValue)
      : null
  const livingMonthlyHelper =
    livingMonthlyPreview != null
      ? form.hidden
        ? `한달 예상 ${formatLivingMonthlyCost(livingMonthlyPreview)} · 합계 제외 (숨김 ON)`
        : `한달 예상 ${formatLivingMonthlyCost(livingMonthlyPreview)} · 상시 합계에 포함`
      : '며칠마다 다시 구매하는지 입력하세요'

  const canSubmit =
    productName.trim() !== '' &&
    variants.length >= 1 &&
    selectedVariantIndex >= 0 &&
    selectedVariantIndex < variants.length &&
    (variantOnly ? isVariantValid(form) : variants.every(isVariantValid))

  useEffect(() => {
    if (!open) {
      setProductName('')
      setVariants([emptyVariant()])
      setActiveIndex(0)
      setSelectedVariantIndex(0)
      setSubmitting(false)
      setDeleting(false)
      return
    }
    if (product) {
      const loaded = product.variants.map(formFromItem)
      const selIdx = Math.max(
        0,
        product.variants.findIndex((v) => v.id === product.selectedVariantId),
      )
      if (startWithNewVariant) {
        const next = [...(loaded.length > 0 ? loaded : []), emptyVariant()]
        setProductName(product.name)
        setVariants(next)
        setActiveIndex(next.length - 1)
        setSelectedVariantIndex(selIdx >= 0 && selIdx < loaded.length ? selIdx : 0)
      } else {
        const focusIdx =
          initialActiveVariantId != null
            ? Math.max(
                0,
                product.variants.findIndex((v) => v.id === initialActiveVariantId),
              )
            : selIdx
        setProductName(product.name)
        setVariants(loaded.length > 0 ? loaded : [emptyVariant()])
        setActiveIndex(focusIdx >= 0 ? focusIdx : 0)
        setSelectedVariantIndex(selIdx >= 0 ? selIdx : 0)
      }
      setFormSub(product.subCategory)
      setFormFoodScope(product.foodScope ?? getDefaultFoodScopeForSection(section))
    } else {
      setProductName('')
      setVariants([emptyVariant()])
      setActiveIndex(0)
      setSelectedVariantIndex(0)
      setFormSub(subCategory)
      setFormFoodScope(getDefaultFoodScopeForSection(section))
    }
  }, [open, product, subCategory, section, initialActiveVariantId, startWithNewVariant])

  useEffect(() => {
    if (!open) return
    if (formSubs.some((s) => s.key === formSub)) return
    setFormSub(getFirstSubcategory('food', formSubs))
  }, [open, formSubs, formSub])

  const patchActive = (patch: Partial<VariantFormState>) => {
    setVariants((prev) =>
      prev.map((v, i) => (i === activeIndex ? { ...v, ...patch } : v)),
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit || submitting) return
    setSubmitting(true)
    try {
      await onSubmit({
        name: productName.trim(),
        mainCategory: 'food',
        subCategory: formSub,
        foodScope: formFoodScope,
        listChipFlags: product?.listChipFlags ?? defaultFoodListChipFlags(),
        selectedVariantIndex,
        variants: variants.map((v) => {
          const isNoAmt = v.amountUnit === COLLECTION_AMOUNT_UNIT_NONE
          const box = v.packType === 'box'
          return {
            ...(v.id != null ? { id: v.id } : {}),
            brand: v.brand.trim(),
            nameSuffix: v.nameSuffix.trim(),
            model: '',
            size: '',
            description: '',
            purchasePrice: Math.round(Number(v.purchasePrice)),
            storeKey: v.storeKey,
            storeCustom: v.storeKey === 'custom' ? v.storeCustom.trim() || null : null,
            purchaseDate: v.purchaseDate!.format('YYYY-MM-DD'),
            amount: !isNoAmt ? Number(v.amount) : 0,
            amountUnit: v.amountUnit,
            packType: v.packType,
            packCount: Math.round(Number(v.packCount)),
            unitsPerPack: box ? Math.round(Number(v.unitsPerPack)) : 1,
            optionType: 'none' as const,
            optionData: {},
            imageData: v.imageData,
            repurchaseDays: Math.round(Number(v.repurchaseDays)),
            repurchaseActive: !v.hidden,
            hidden: v.hidden,
          }
        }),
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

  const foodScopeCategoryChips = (
    <Stack direction="row" spacing={0.75} sx={{ flexWrap: 'wrap' }}>
      {FOOD_SCOPES.map((scope) => (
        <Box
          key={scope.key}
          component="button"
          type="button"
          onClick={() => setFormFoodScope(scope.key)}
          sx={{
            ...sxCollectionSectionSegmentItem(scope.key, formFoodScope === scope.key),
            flex: '0 1 auto',
            fontFamily: 'inherit',
          }}
        >
          {scope.label}
        </Box>
      ))}
    </Stack>
  )

  return (
    <AppDialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth={variantOnly || isConsumableSection(section) ? 'sm' : 'xs'}
      disableAutoFocus
      slotProps={{
        ...formDialogSlotProps,
        paper: {
          sx: {
            ...(typeof formDialogSlotProps.paper?.sx === 'object' ? formDialogSlotProps.paper.sx : {}),
            ...(variantOnly || isConsumableSection(section)
              ? {
                  mx: { xs: 1.25, sm: 2 },
                  width: { xs: 'calc(100% - 20px)', sm: 'calc(100% - 32px)' },
                  maxWidth: 520,
                }
              : {}),
          },
        },
      }}
    >
      <Box component="form" onSubmit={handleSubmit} sx={formDialogFormSx}>
        <FormDialogHeader onClose={onClose} closeDisabled={submitting || deleting}>
          <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap" useFlexGap>
            <Typography component="span" sx={sxCollectionBadge('food')}>
              {getFoodScopeLabel(formFoodScope)}
            </Typography>
            <Typography component="span" variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
              {subLabel}
            </Typography>
            <Typography component="span" sx={{ fontSize: '1.05rem', fontWeight: 700 }}>
              {isVariantAdd
                ? '제품 추가'
                : isVariantEdit
                  ? '제품 수정'
                  : isConsumableSection(section)
                    ? `${section === 'regular' ? '상시' : '수시'} 추가`
                    : '항목 추가'}
            </Typography>
          </Stack>
        </FormDialogHeader>

        <DialogContent
          sx={{
            ...formDialogContentSx,
            ...(variantOnly || isConsumableSection(section) ? { px: { xs: 1.5, sm: 2 } } : {}),
          }}
          dividers={false}
        >
          <Box sx={formDialogContentScrollSx}>
            <Stack spacing={formDialogFieldStackSpacing} sx={formDialogFieldStackSx}>
              {!variantOnly ? (
                <>
                  <Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ fontWeight: 600, mb: 0.75, display: 'block' }}
                    >
                      큰 카테고리
                    </Typography>
                    {foodScopeCategoryChips}
                  </Box>

                  <Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ fontWeight: 600, mb: 0.75, display: 'block' }}
                    >
                      작은 카테고리
                    </Typography>
                    <Stack direction="row" spacing={0.75} sx={{ flexWrap: 'wrap' }}>
                      {getCollectionSubcategories('food', formSubs).map((c) => (
                        <Box
                          key={c.key}
                          component="button"
                          type="button"
                          onClick={() => setFormSub(c.key as CollectionSubKey)}
                          sx={{ ...sxCollectionSubChip('food', formSub === c.key), fontFamily: 'inherit' }}
                        >
                          {c.label}
                        </Box>
                      ))}
                    </Stack>
                  </Box>

                  <TextField
                    label="항목 이름"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    required
                    fullWidth
                    placeholder="예: 체다치즈"
                    {...formDialogCompactTextFieldProps}
                    sx={formDialogFirstFieldSx}
                  />
                </>
              ) : (
                <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mb: 0.25 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                    항목
                  </Typography>
                  <Typography sx={{ fontWeight: 800, fontSize: '0.95rem' }}>{productName}</Typography>
                </Stack>
              )}

              <TextField
                label="브랜드"
                value={form.brand}
                onChange={(e) => patchActive({ brand: e.target.value })}
                fullWidth
                {...formDialogCompactTextFieldProps}
                sx={variantOnly ? formDialogFirstFieldSx : undefined}
              />

              <TextField
                label="제품명"
                value={form.nameSuffix}
                onChange={(e) => patchActive({ nameSuffix: e.target.value })}
                fullWidth
                placeholder="선택"
                {...formDialogCompactTextFieldProps}
              />

              <Stack direction="row" spacing={1}>
                <TextField
                  label="용량"
                  type="number"
                  value={form.amount}
                  onChange={(e) => patchActive({ amount: e.target.value })}
                  required={!isNoAmount}
                  disabled={isNoAmount}
                  fullWidth
                  inputProps={{ min: 0, step: 'any' }}
                  {...formDialogCompactTextFieldProps}
                />
                <FormControl size="small" margin="dense" sx={{ minWidth: 88, ...compactFormControlSx }}>
                  <InputLabel id="product-amount-unit-label">단위</InputLabel>
                  <Select
                    labelId="product-amount-unit-label"
                    label="단위"
                    value={form.amountUnit}
                    onChange={(e) => {
                      const amountUnit = e.target.value as CollectionAmountUnit
                      patchActive({
                        amountUnit,
                        amount: amountUnit === COLLECTION_AMOUNT_UNIT_NONE ? '' : form.amount,
                      })
                    }}
                  >
                    {COLLECTION_AMOUNT_UNIT_OPTIONS.map((unit) => (
                      <MenuItem key={unit.key} value={unit.key} dense>
                        {unit.label}
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
                  onChange={(e) => patchActive({ packCount: e.target.value })}
                  required
                  fullWidth
                  inputProps={{ min: 1, step: 1 }}
                  {...formDialogCompactTextFieldProps}
                />
                <FormControl size="small" margin="dense" sx={{ minWidth: 88, ...compactFormControlSx }}>
                  <InputLabel id="product-pack-type-label">구매</InputLabel>
                  <Select
                    labelId="product-pack-type-label"
                    label="구매"
                    value={form.packType}
                    onChange={(e) => {
                      const packType = e.target.value as PackType
                      patchActive({
                        packType,
                        unitsPerPack: packType === 'box' ? form.unitsPerPack : '1',
                      })
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
                    onChange={(e) => patchActive({ unitsPerPack: e.target.value })}
                    required
                    size="small"
                    margin="dense"
                    sx={{ width: 72, ...formDialogCompactFieldSx }}
                    inputProps={{ min: 1, step: 1 }}
                  />
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                    개
                  </Typography>
                </Stack>
              ) : null}

              <ShoppingImageField
                value={form.imageData}
                onChange={(imageData) => patchActive({ imageData })}
                active={open}
              />

              <TextField
                label="구매가"
                type="number"
                value={form.purchasePrice}
                onChange={(e) => patchActive({ purchasePrice: e.target.value })}
                required
                fullWidth
                inputProps={{ min: 0, step: 1 }}
                InputProps={{
                  endAdornment: <InputAdornment position="end">원</InputAdornment>,
                }}
                {...formDialogCompactTextFieldProps}
              />

              <TextField
                label="재구매 주기"
                type="number"
                value={form.repurchaseDays}
                onChange={(e) => patchActive({ repurchaseDays: e.target.value })}
                required
                fullWidth
                inputProps={{ min: 1, step: 1 }}
                InputProps={{
                  endAdornment: <InputAdornment position="end">일</InputAdornment>,
                }}
                helperText={livingMonthlyHelper}
                {...formDialogCompactTextFieldProps}
              />

              <FormControlLabel
                sx={{ mx: 0, alignItems: 'center' }}
                control={
                  <Switch
                    size="small"
                    checked={form.hidden}
                    onChange={(_, checked) => patchActive({ hidden: checked })}
                  />
                }
                label={
                  <Typography sx={{ fontSize: '0.82rem', fontWeight: 700 }}>숨김</Typography>
                }
              />
              <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary', mt: -0.75, mb: 0.25 }}>
                OFF면 상시 합계에 포함됩니다
              </Typography>

              <DatePicker
                label="구매일"
                value={form.purchaseDate}
                onChange={(value) => patchActive({ purchaseDate: value })}
                format="YY-MM-DD"
                slotProps={compactDateFieldSlotProps}
              />

              <FormControl fullWidth size="small" margin="dense" sx={compactFormControlSx}>
                <InputLabel id="product-store-label">구매처</InputLabel>
                <Select
                  labelId="product-store-label"
                  label="구매처"
                  value={form.storeKey}
                  onChange={(e) =>
                    patchActive({ storeKey: e.target.value as CollectionStoreKey })
                  }
                >
                  {COLLECTION_STORES.map((store) => (
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
                  onChange={(e) => patchActive({ storeCustom: e.target.value })}
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
