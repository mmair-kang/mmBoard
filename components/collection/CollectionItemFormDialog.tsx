'use client'

// 수정: Auto — 2026-06-05 (옵션·상세옵션 라벨)

import { AppDialog } from '@/components/common/AppDialog'

import { FormDialogFooter } from '@/components/common/FormDialogFooter'

import { FormDialogHeader } from '@/components/common/FormDialogHeader'

import {

  sxCollectionBadge,

  sxCollectionMainChip,

  sxCollectionSubChip,

} from '@/components/collection/collectionStyles'

import { ShoppingImageField } from '@/components/shopping/ShoppingImageField'

import {

  COLLECTION_MAIN_CATEGORIES,

  COLLECTION_STORES,

  getCollectionMainMeta,

  getCollectionSubcategories,

  getFirstSubcategory,

  getSubcategoryLabel,

  isCollectionPackDetailCategory,

  COLLECTION_DETAIL_PACK_OPTIONS,

  toCollectionDetailOptionKey,

  packTypeFromCollectionDetailOption,

  isFashionMainCategory,

  isFoodMainCategory,

  type CollectionMainKey,

  type CollectionStoreKey,

  type CollectionSubKey,

} from '@/config/collectionCategories'

import { useCollectionSubcategories } from '@/hooks/useCollectionSubcategories'

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

  COLLECTION_OPTION_FIELDS,

  COLLECTION_OPTION_TYPES,

  emptyOptionData,

  type CollectionOptionData,

  type CollectionOptionFieldKey,

  type CollectionOptionType,

} from '@/config/collectionOptions'

import {

  AMOUNT_UNITS,

  PACK_TYPES,

  COLLECTION_AMOUNT_UNIT_OPTIONS,

  COLLECTION_AMOUNT_UNIT_NONE,

  hasCollectionAmount,

  isMultiUnitPackType,

  type CollectionAmountUnit,

  type PackType,

} from '@/config/shoppingCategories'

import type { CollectionItem } from '@/hooks/useCollectionItems'

import type { CollectionItemPayload } from '@/lib/collectionPayload'

import { todayIsoDate } from '@/lib/shoppingDate'

import { formatPerPiecePriceLabel, formatUnitsPerPackLabel } from '@/lib/shoppingUnitPrice'

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

  nameSuffix: string

  model: string

  size: string

  description: string

  purchasePrice: string

  amount: string

  amountUnit: CollectionAmountUnit

  packType: PackType

  packCount: string

  unitsPerPack: string

  storeKey: CollectionStoreKey

  storeCustom: string

  purchaseDate: Dayjs | null

}



type Props = {

  open: boolean

  mainCategory: CollectionMainKey

  subCategory: CollectionSubKey

  item?: CollectionItem | null

  onClose: () => void

  onSubmit: (payload: CollectionItemPayload) => Promise<void>

  onDelete?: () => Promise<void>

}



const emptyForm = (): FormState => ({

  brand: '',

  name: '',

  nameSuffix: '',

  model: '',

  size: '',

  description: '',

  purchasePrice: '',

  amount: '',

  amountUnit: COLLECTION_AMOUNT_UNIT_NONE,

  packType: 'piece',

  packCount: '1',

  unitsPerPack: '1',

  storeKey: 'coupang',

  storeCustom: '',

  purchaseDate: dayjs(todayIsoDate()),

})



function formFromItem(item: CollectionItem): FormState {

  const packType = item.packType === 'box' ? 'box' : 'piece'

  return {

    brand: item.brand,

    name: item.name,

    nameSuffix: item.nameSuffix,

    model: item.model,

    size: item.size,

    description: item.description,

    purchasePrice: String(item.purchasePrice),

    amount: hasCollectionAmount(item.amount, item.amountUnit) ? String(item.amount) : '',

    amountUnit: item.amountUnit,

    packType,

    packCount: String(item.packCount ?? 1),

    unitsPerPack: String(item.unitsPerPack ?? 1),

    storeKey: item.storeKey,

    storeCustom: item.storeCustom ?? '',

    purchaseDate: dayjs(item.purchaseDate),

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



export function CollectionItemFormDialog({

  open,

  mainCategory,

  subCategory,

  item,

  onClose,

  onSubmit,

  onDelete,

}: Props) {

  const isEdit = item != null

  const [form, setForm] = useState<FormState>(emptyForm)

  const [formMain, setFormMain] = useState<CollectionMainKey>(mainCategory)

  const [formSub, setFormSub] = useState<CollectionSubKey>(subCategory)

  const [imageData, setImageData] = useState<string | null>(null)

  const [optionType, setOptionType] = useState<CollectionOptionType>('none')

  const [optionData, setOptionData] = useState<CollectionOptionData>({})

  const [submitting, setSubmitting] = useState(false)

  const [deleting, setDeleting] = useState(false)

  const { subs: formSubs } = useCollectionSubcategories(formMain)

  const activeMain = isEdit ? formMain : mainCategory

  const activeSub = isEdit ? formSub : subCategory

  const mainMeta = getCollectionMainMeta(activeMain)

  const subLabel = getSubcategoryLabel(activeMain, activeSub, formSubs)

  const showFoodFields = isFoodMainCategory(activeMain)

  const showPackDetailOptions = isCollectionPackDetailCategory(activeMain)

  const isBox = form.packType === 'box'

  const isMultiUnitPack = form.packType === 'box' || form.packType === 'bundle'

  const unitsPerPackPrefix = form.packType === 'bundle' ? '1묶음당' : '1박스당'



  useEffect(() => {

    if (!open) {

      setForm(emptyForm())

      setImageData(null)

      setOptionType('none')

      setOptionData({})

      setSubmitting(false)

      setDeleting(false)

      return

    }

    setForm(item ? formFromItem(item) : emptyForm())

    setFormMain(item?.mainCategory ?? mainCategory)

    setFormSub(item?.subCategory ?? subCategory)

    setImageData(item?.imageData ?? null)

    setOptionType(item?.optionType ?? 'none')

    setOptionData(item?.optionData ?? emptyOptionData(item?.optionType ?? 'none'))

  }, [open, item, mainCategory, subCategory])

  useEffect(() => {
    if (!open) return
    if (formSubs.some((s) => s.key === formSub)) return
    setFormSub(getFirstSubcategory(formMain, formSubs))
  }, [open, formMain, formSubs, formSub])

  const handleOptionTypeChange = (next: CollectionOptionType) => {

    setOptionType(next)

    setOptionData(emptyOptionData(next))

  }



  const setOptionField = (key: CollectionOptionFieldKey, value: string) => {

    setOptionData((prev) => ({ ...prev, [key]: value }))

  }



  const handleMainChange = (nextMain: CollectionMainKey) => {

    setFormMain(nextMain)

    setFormSub(getFirstSubcategory(nextMain))

    if (!isFashionMainCategory(nextMain)) {

      setOptionType('none')

      setOptionData(emptyOptionData('none'))

    }

    if (!isFoodMainCategory(nextMain) && !isCollectionPackDetailCategory(nextMain)) {

      setForm((prev) => ({

        ...prev,

        packType: 'piece',

        packCount: '1',

        unitsPerPack: '1',

      }))

    }

  }



  const showFashionOptions = isFashionMainCategory(activeMain)

  const showCustomStore = form.storeKey === 'custom'

  const isNoAmount = form.amountUnit === COLLECTION_AMOUNT_UNIT_NONE

  const foodValid =

    (isNoAmount || Number(form.amount) > 0) &&

    Number.isInteger(Number(form.packCount)) &&

    Number(form.packCount) >= 1 &&

    (!isBox || (Number.isInteger(Number(form.unitsPerPack)) && Number(form.unitsPerPack) >= 1))

  const packDetailValid =

    !showPackDetailOptions ||

    !isMultiUnitPack ||

    (Number.isInteger(Number(form.unitsPerPack)) && Number(form.unitsPerPack) >= 1)

  const canSubmit =

    form.name.trim() &&

    Number(form.purchasePrice) >= 0 &&

    form.purchaseDate?.isValid() &&

    (!showFoodFields || foodValid) &&

    (!showPackDetailOptions || packDetailValid)



  const handleSubmit = async (e: React.FormEvent) => {

    e.preventDefault()

    if (!canSubmit || submitting || !form.purchaseDate) return

    setSubmitting(true)

    try {

      await onSubmit({

        mainCategory: activeMain,

        subCategory: activeSub,

        brand: form.brand.trim(),

        name: form.name.trim(),

        nameSuffix: form.nameSuffix.trim(),

        model: showFoodFields ? '' : form.model.trim(),

        size: showFoodFields || showPackDetailOptions ? '' : form.size.trim(),

        description: showFoodFields ? '' : form.description.trim(),

        purchasePrice: Math.round(Number(form.purchasePrice)),

        storeKey: form.storeKey,

        storeCustom: showCustomStore ? form.storeCustom.trim() || null : null,

        purchaseDate: form.purchaseDate.format('YYYY-MM-DD'),

        amount: showFoodFields && !isNoAmount ? Number(form.amount) : 0,

        amountUnit: form.amountUnit,

        packType: showFoodFields || showPackDetailOptions ? form.packType : 'piece',

        packCount: showFoodFields ? Math.round(Number(form.packCount)) : 1,

        unitsPerPack:

          (showFoodFields && isBox) || (showPackDetailOptions && isMultiUnitPack)

            ? Math.round(Number(form.unitsPerPack))

            : 1,

        optionType: showFashionOptions ? optionType : 'none',

        optionData: showFashionOptions ? optionData : emptyOptionData('none'),

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

    <AppDialog

      open={open}

      onClose={onClose}

      fullWidth

      maxWidth="xs"

      disableAutoFocus

      slotProps={formDialogSlotProps}

    >

      <Box component="form" onSubmit={handleSubmit} sx={formDialogFormSx}>

        <FormDialogHeader onClose={onClose} closeDisabled={submitting || deleting}>

          <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap" useFlexGap>

            <Typography component="span" sx={sxCollectionBadge(activeMain)}>

              {mainMeta.label}

            </Typography>

            <Typography component="span" variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>

              {subLabel}

            </Typography>

            <Typography component="span" sx={{ fontSize: '1.05rem', fontWeight: 700 }}>

              {isEdit ? '소장 수정' : '소장 추가'}

            </Typography>

          </Stack>

        </FormDialogHeader>

        <DialogContent sx={formDialogContentSx} dividers={false}>

          <Box sx={formDialogContentScrollSx}>

            <Stack spacing={formDialogFieldStackSpacing} sx={formDialogFieldStackSx}>

              {isEdit ? (

                <>

                  <Box>

                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, mb: 0.75, display: 'block' }}>

                      큰 카테고리

                    </Typography>

                    <Stack direction="row" spacing={0.75} sx={{ flexWrap: 'wrap' }}>

                      {COLLECTION_MAIN_CATEGORIES.map((c) => (

                        <Box

                          key={c.key}

                          component="button"

                          type="button"

                          onClick={() => handleMainChange(c.key)}

                          sx={{ ...sxCollectionMainChip(c.key, formMain === c.key), fontFamily: 'inherit' }}

                        >

                          {c.label}

                        </Box>

                      ))}

                    </Stack>

                  </Box>

                  <Box>

                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, mb: 0.75, display: 'block' }}>

                      작은 카테고리

                    </Typography>

                    <Stack direction="row" spacing={0.75} sx={{ flexWrap: 'wrap' }}>

                      {getCollectionSubcategories(formMain, formSubs).map((c) => (

                        <Box

                          key={c.key}

                          component="button"

                          type="button"

                          onClick={() => setFormSub(c.key as CollectionSubKey)}

                          sx={{ ...sxCollectionSubChip(formMain, formSub === c.key), fontFamily: 'inherit' }}

                        >

                          {c.label}

                        </Box>

                      ))}

                    </Stack>

                  </Box>

                </>

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

              <Stack direction="row" spacing={1}>
                <TextField
                  label="이름"
                  value={form.name}
                  onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                  required
                  fullWidth
                  {...formDialogCompactTextFieldProps}
                />
                <TextField
                  label="덧붙일말"
                  value={form.nameSuffix}
                  onChange={(e) => setForm((prev) => ({ ...prev, nameSuffix: e.target.value }))}
                  fullWidth
                  placeholder="선택"
                  {...formDialogCompactTextFieldProps}
                />
              </Stack>

              {showFoodFields ? (

                <>

                  <Stack direction="row" spacing={1}>

                    <TextField

                      label="용량"

                      type="number"

                      value={form.amount}

                      onChange={(e) => setForm((prev) => ({ ...prev, amount: e.target.value }))}

                      required={!isNoAmount}

                      disabled={isNoAmount}

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

                        onChange={(e) => {

                          const amountUnit = e.target.value as CollectionAmountUnit

                          setForm((prev) => ({

                            ...prev,

                            amountUnit,

                            amount: amountUnit === COLLECTION_AMOUNT_UNIT_NONE ? '' : prev.amount,

                          }))

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

                        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>

                          개

                        </Typography>

                      </Stack>

                    </Box>

                  ) : null}

                </>

              ) : showPackDetailOptions ? (

                <>

                  <FormControl fullWidth size="small" margin="dense" sx={compactFormControlSx}>

                    <InputLabel id="collection-detail-pack-label">상세옵션</InputLabel>

                    <Select

                      labelId="collection-detail-pack-label"

                      label="상세옵션"

                      value={toCollectionDetailOptionKey(form.packType)}

                      onChange={(e) => {

                        const next = e.target.value

                        const packType = packTypeFromCollectionDetailOption(next)

                        setForm((prev) => ({

                          ...prev,

                          packType,

                          packCount: '1',

                          unitsPerPack: isMultiUnitPackType(packType) ? prev.unitsPerPack : '1',

                        }))

                      }}

                    >

                      {COLLECTION_DETAIL_PACK_OPTIONS.map((opt) => (

                        <MenuItem key={opt.key} value={opt.key} dense>

                          {opt.label}

                        </MenuItem>

                      ))}

                    </Select>

                  </FormControl>

                  {isMultiUnitPack ? (

                    <Stack direction="row" alignItems="center" spacing={1}>

                      <Typography

                        variant="body2"

                        color="text.secondary"

                        sx={{ flexShrink: 0, fontWeight: 600, minWidth: 64 }}

                      >

                        {unitsPerPackPrefix}

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

                      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>

                        개

                      </Typography>

                    </Stack>

                  ) : null}

                  <TextField

                    label="모델명"

                    value={form.model}

                    onChange={(e) => setForm((prev) => ({ ...prev, model: e.target.value }))}

                    fullWidth

                    {...formDialogCompactTextFieldProps}

                  />

                  <TextField

                    label="설명"

                    value={form.description}

                    onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}

                    fullWidth

                    multiline

                    minRows={2}

                    maxRows={4}

                    {...formDialogCompactTextFieldProps}

                  />

                  {isMultiUnitPack && Number(form.purchasePrice) >= 0 && Number(form.unitsPerPack) >= 1 ? (

                    <Typography variant="caption" color="primary.main" sx={{ fontWeight: 700, display: 'block' }}>

                      {[

                        formatUnitsPerPackLabel(form.packType, Number(form.unitsPerPack)),

                        formatPerPiecePriceLabel(

                          Math.round(Number(form.purchasePrice)),

                          form.packType,

                          1,

                          Number(form.unitsPerPack),

                        ),

                      ]

                        .filter(Boolean)

                        .join(' · ')}

                    </Typography>

                  ) : null}

                </>

              ) : (

                <>

                  <TextField

                    label="모델명"

                    value={form.model}

                    onChange={(e) => setForm((prev) => ({ ...prev, model: e.target.value }))}

                    fullWidth

                    {...formDialogCompactTextFieldProps}

                  />

                  <TextField

                    label="옵션"

                    value={form.size}

                    onChange={(e) => setForm((prev) => ({ ...prev, size: e.target.value }))}

                    fullWidth

                    placeholder="M, 95, 270"

                    {...formDialogCompactTextFieldProps}

                  />

                  <TextField

                    label="설명"

                    value={form.description}

                    onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}

                    fullWidth

                    multiline

                    minRows={2}

                    maxRows={4}

                    {...formDialogCompactTextFieldProps}

                  />

                </>

              )}

              {showFashionOptions ? (

                <>

                  <FormControl fullWidth size="small" margin="dense" sx={compactFormControlSx}>

                    <InputLabel id="collection-detail-option-label">상세옵션</InputLabel>

                    <Select

                      labelId="collection-detail-option-label"

                      label="상세옵션"

                      value={optionType}

                      onChange={(e) => handleOptionTypeChange(e.target.value as CollectionOptionType)}

                    >

                      {COLLECTION_OPTION_TYPES.map((option) => (

                        <MenuItem key={option.key} value={option.key} dense>

                          {option.label}

                        </MenuItem>

                      ))}

                    </Select>

                  </FormControl>

                  {optionType !== 'none' ? (

                    <Stack spacing={formDialogFieldStackSpacing}>

                      {COLLECTION_OPTION_FIELDS[optionType].map((field) => (

                        <TextField

                          key={field.key}

                          label={field.label}

                          value={optionData[field.key] ?? ''}

                          onChange={(e) => setOptionField(field.key, e.target.value)}

                          fullWidth

                          {...formDialogCompactTextFieldProps}

                        />

                      ))}

                    </Stack>

                  ) : null}

                </>

              ) : null}

              <ShoppingImageField value={imageData} onChange={setImageData} active={open} />

              <TextField

                label="구매가"

                type="number"

                value={form.purchasePrice}

                onChange={(e) => setForm((prev) => ({ ...prev, purchasePrice: e.target.value }))}

                required

                fullWidth

                inputProps={{ min: 0, step: 1 }}

                InputProps={{

                  endAdornment: <InputAdornment position="end">원</InputAdornment>,

                }}

                {...formDialogCompactTextFieldProps}

              />

              <DatePicker

                label="구매일"

                value={form.purchaseDate}

                onChange={(value) => setForm((prev) => ({ ...prev, purchaseDate: value }))}

                format="YY-MM-DD"

                slotProps={compactDateFieldSlotProps}

              />

              <FormControl fullWidth size="small" margin="dense" sx={compactFormControlSx}>

                <InputLabel id="collection-store-label">구매처</InputLabel>

                <Select

                  labelId="collection-store-label"

                  label="구매처"

                  value={form.storeKey}

                  onChange={(e) =>

                    setForm((prev) => ({ ...prev, storeKey: e.target.value as CollectionStoreKey }))

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


