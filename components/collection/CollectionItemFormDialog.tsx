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

  isFashionMainCategory,

  isFoodMainCategory,

  type CollectionMainKey,

  type CollectionStoreKey,

  type CollectionSubKey,

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

  type AmountUnit,

  type PackType,

} from '@/config/shoppingCategories'

import type { CollectionItem } from '@/hooks/useCollectionItems'

import type { CollectionItemPayload } from '@/lib/collectionPayload'

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

  model: string

  size: string

  description: string

  purchasePrice: string

  amount: string

  amountUnit: AmountUnit

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

  model: '',

  size: '',

  description: '',

  purchasePrice: '',

  amount: '',

  amountUnit: 'g',

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

    model: item.model,

    size: item.size,

    description: item.description,

    purchasePrice: String(item.purchasePrice),

    amount: item.amount > 0 ? String(item.amount) : '',

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



  const activeMain = isEdit ? formMain : mainCategory

  const activeSub = isEdit ? formSub : subCategory

  const mainMeta = getCollectionMainMeta(activeMain)

  const subLabel = getSubcategoryLabel(activeMain, activeSub)

  const showFoodFields = isFoodMainCategory(activeMain)

  const isBox = form.packType === 'box'



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

  }



  const showFashionOptions = isFashionMainCategory(activeMain)

  const showCustomStore = form.storeKey === 'custom'

  const foodValid =

    Number(form.amount) > 0 &&

    Number.isInteger(Number(form.packCount)) &&

    Number(form.packCount) >= 1 &&

    (!isBox || (Number.isInteger(Number(form.unitsPerPack)) && Number(form.unitsPerPack) >= 1))

  const canSubmit =

    form.name.trim() &&

    Number(form.purchasePrice) >= 0 &&

    form.purchaseDate?.isValid() &&

    (!showFoodFields || foodValid)



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

        model: showFoodFields ? '' : form.model.trim(),

        size: showFoodFields ? '' : form.size.trim(),

        description: showFoodFields ? '' : form.description.trim(),

        purchasePrice: Math.round(Number(form.purchasePrice)),

        storeKey: form.storeKey,

        storeCustom: showCustomStore ? form.storeCustom.trim() || null : null,

        purchaseDate: form.purchaseDate.format('YYYY-MM-DD'),

        amount: showFoodFields ? Number(form.amount) : 0,

        amountUnit: form.amountUnit,

        packType: showFoodFields ? form.packType : 'piece',

        packCount: showFoodFields ? Math.round(Number(form.packCount)) : 1,

        unitsPerPack: showFoodFields && isBox ? Math.round(Number(form.unitsPerPack)) : 1,

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

                      {getCollectionSubcategories(formMain).map((c) => (

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

              <TextField

                label="이름"

                value={form.name}

                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}

                required

                fullWidth

                {...formDialogCompactTextFieldProps}

              />

              {showFoodFields ? (

                <>

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

                        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>

                          개

                        </Typography>

                      </Stack>

                    </Box>

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


