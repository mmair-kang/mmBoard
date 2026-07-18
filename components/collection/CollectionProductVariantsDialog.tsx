'use client'
// 수정: Auto — 2026-07-19 02:40 (상대 날짜 인라인)
// 수정: Auto — 2026-07-19 02:35 (제품 목록 상대 날짜)
// 수정: Auto — 2026-07-19 02:25 (변경 버튼 비활성 UI)
// 수정: Auto — 2026-07-19 01:40 (제품 추가·항목명 수정)

import { AppDialog } from '@/components/common/AppDialog'
import { FormDialogHeader } from '@/components/common/FormDialogHeader'
import {
  sxCollectionBrandChip,
  sxCollectionFoodMetricChip,
  sxCollectionProductNameChip,
} from '@/components/collection/collectionStyles'
import { ShoppingItemThumbnail } from '@/components/shopping/ShoppingItemThumbnail'
import {
  getCollectionStoreLabel,
  getFoodScopeLabel,
  type FoodScopeKey,
} from '@/config/collectionCategories'
import {
  formDialogActionsSx,
  formDialogContentScrollSx,
  formDialogContentSx,
  formDialogPaperSlotSx,
  formDialogPrimarySubmitButtonSx,
  formDialogSlotProps,
} from '@/config/formDialogLayout'
import type { CollectionItem, CollectionProduct } from '@/hooks/useCollectionItems'
import { getCollectionFoodListLabels, isCollectionFoodPriceMetric } from '@/lib/collectionDetail'
import { formatLastPurchaseRelativeLabel } from '@/lib/shoppingDate'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import EditRoundedIcon from '@mui/icons-material/EditRounded'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { alpha } from '@mui/material/styles'
import { useEffect, useState } from 'react'

type Props = {
  open: boolean
  product: CollectionProduct | null
  selecting?: boolean
  onClose: () => void
  onChange: (variantId: number) => Promise<void>
  onEditName: () => void
  onEditVariant: (variant: CollectionItem) => void
  onAddVariant: () => void
}

function formatPrice(price: number) {
  return `${price.toLocaleString('ko-KR')}원`
}

const widePaperSlotProps = {
  paper: {
    sx: {
      ...formDialogPaperSlotSx,
      mx: { xs: 1.25, sm: 2 },
      width: { xs: 'calc(100% - 20px)', sm: 'calc(100% - 32px)' },
      maxWidth: 520,
    },
  },
} as const

export function CollectionProductVariantsDialog({
  open,
  product,
  selecting = false,
  onClose,
  onChange,
  onEditName,
  onEditVariant,
  onAddVariant,
}: Props) {
  const [pendingId, setPendingId] = useState<number | null>(null)

  useEffect(() => {
    if (!open || !product) {
      setPendingId(null)
      return
    }
    setPendingId(product.selectedVariantId)
  }, [open, product])

  if (!product) return null

  const foodScope = product.foodScope as FoodScopeKey
  const activeId = product.selectedVariantId
  const canChange = pendingId != null && pendingId !== activeId && !selecting

  return (
    <AppDialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      slotProps={{ ...formDialogSlotProps, ...widePaperSlotProps }}
    >
      <FormDialogHeader onClose={onClose}>
        <Stack direction="row" alignItems="center" spacing={0.5} sx={{ minWidth: 0, flex: 1, pr: 0.5 }}>
          <Box component="span" sx={sxCollectionProductNameChip(foodScope)}>
            {product.name}
          </Box>
          <IconButton size="small" aria-label="항목 이름 수정" onClick={onEditName} sx={{ flexShrink: 0 }}>
            <EditRoundedIcon fontSize="small" />
          </IconButton>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, flexShrink: 0 }}>
            {getFoodScopeLabel(foodScope)}
          </Typography>
        </Stack>
      </FormDialogHeader>

      <DialogContent sx={{ ...formDialogContentSx, px: { xs: 1.5, sm: 2 } }} dividers={false}>
        <Box sx={formDialogContentScrollSx}>
          <Stack spacing={1}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                제품 목록 · 선택 후 변경
              </Typography>
              <Button
                startIcon={<AddRoundedIcon />}
                onClick={onAddVariant}
                variant="outlined"
                size="small"
                sx={{ fontWeight: 700, flexShrink: 0 }}
              >
                제품 추가
              </Button>
            </Stack>

            {product.variants.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center', fontWeight: 600 }}>
                등록된 제품이 없습니다. 제품 추가로 브랜드·제품명을 넣어 보세요.
              </Typography>
            ) : null}

            {product.variants.map((variant) => {
              const isActive = variant.id === activeId
              const isPending = variant.id === pendingId
              const brand = variant.brand.trim() || '브랜드 없음'
              const storeLabel = getCollectionStoreLabel(variant.storeKey, variant.storeCustom)
              const foodLabels = getCollectionFoodListLabels(variant, product.listChipFlags)
              const productName = variant.nameSuffix.trim()
              const purchaseLabel = formatLastPurchaseRelativeLabel(variant.purchaseDate)
              return (
                <Box
                  key={variant.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => setPendingId(variant.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      setPendingId(variant.id)
                    }
                  }}
                  sx={(theme) => ({
                    borderRadius: 2,
                    border: 1,
                    borderColor: isPending
                      ? alpha(theme.palette.primary.main, 0.5)
                      : theme.palette.divider,
                    bgcolor: isPending
                      ? alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.12 : 0.05)
                      : 'background.paper',
                    px: 1,
                    py: 0.85,
                    cursor: 'pointer',
                    outline: 'none',
                  })}
                >
                  <Stack direction="row" alignItems="flex-start" spacing={1}>
                    {variant.imageData ? (
                      <ShoppingItemThumbnail src={variant.imageData} size={56} />
                    ) : (
                      <Box
                        sx={{
                          width: 56,
                          height: 56,
                          flexShrink: 0,
                          borderRadius: 1.5,
                          border: 1,
                          borderColor: 'divider',
                          bgcolor: 'action.hover',
                        }}
                      />
                    )}

                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Stack direction="row" alignItems="center" spacing={0.6} sx={{ minWidth: 0 }}>
                        <Box component="span" sx={sxCollectionBrandChip()}>
                          {brand}
                        </Box>
                        {isActive ? (
                          <Typography
                            variant="caption"
                            sx={{ fontWeight: 800, color: 'primary.main', flexShrink: 0 }}
                          >
                            사용중
                          </Typography>
                        ) : null}
                        {productName ? (
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{
                              fontWeight: 600,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {productName}
                          </Typography>
                        ) : null}
                      </Stack>
                      {foodLabels.length > 0 ? (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.35, mt: 0.5 }}>
                          {foodLabels.map((label) => (
                            <Box
                              key={label}
                              component="span"
                              sx={sxCollectionFoodMetricChip(isCollectionFoodPriceMetric(label))}
                            >
                              {label}
                            </Box>
                          ))}
                        </Box>
                      ) : null}
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mt: 0.45, fontWeight: 600, fontSize: '0.8rem' }}
                      >
                        {formatPrice(variant.purchasePrice)} · {storeLabel}
                        {purchaseLabel ? ` · ${purchaseLabel}` : ''}
                        {variant.hidden ? ' · 숨김' : ''}
                      </Typography>
                    </Box>

                    <IconButton
                      size="small"
                      aria-label="제품 수정"
                      onClick={(e) => {
                        e.stopPropagation()
                        onEditVariant(variant)
                      }}
                      sx={{ mt: -0.25 }}
                    >
                      <EditRoundedIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                </Box>
              )
            })}
          </Stack>
        </Box>
      </DialogContent>

      <DialogActions sx={{ ...formDialogActionsSx, px: { xs: 1.5, sm: 2 }, justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          disabled={!canChange}
          onClick={() => {
            if (pendingId == null || !canChange) return
            void onChange(pendingId)
          }}
          sx={{
            ...formDialogPrimarySubmitButtonSx,
            // 바꿀 게 없을 때는 버튼은 보이되 비활성처럼 보이게
            '&.Mui-disabled': {
              bgcolor: (theme) =>
                theme.palette.mode === 'dark' ? 'action.disabledBackground' : 'action.selected',
              color: 'text.disabled',
              opacity: 1,
              boxShadow: 'none',
            },
          }}
        >
          {selecting ? <CircularProgress size={18} color="inherit" /> : '변경'}
        </Button>
      </DialogActions>
    </AppDialog>
  )
}
