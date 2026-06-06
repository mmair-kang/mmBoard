'use client'
// 수정: Auto — 2026-06-05 (옵션·상세옵션 라벨)

import { AppDialog } from '@/components/common/AppDialog'
import { FormDialogHeader } from '@/components/common/FormDialogHeader'
import { sxCollectionBadge, sxCollectionBrandChip } from '@/components/collection/collectionStyles'
import {
  getCollectionMainMeta,
  getCollectionStoreLabel,
  getSubcategoryLabel,
  isFashionMainCategory,
  isFoodMainCategory,
} from '@/config/collectionCategories'
import {
  COLLECTION_OPTION_FIELDS,
  getCollectionOptionLabel,
} from '@/config/collectionOptions'
import type { CollectionItem } from '@/hooks/useCollectionItems'
import { getCollectionFoodDetailLabels } from '@/lib/collectionDetail'
import { formatLastPurchaseDateDisplay } from '@/lib/shoppingDate'
import Box from '@mui/material/Box'
import DialogContent from '@mui/material/DialogContent'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

type Props = {
  open: boolean
  item: CollectionItem | null
  onClose: () => void
}

function formatPrice(price: number) {
  return `${price.toLocaleString('ko-KR')}원`
}

function DetailRow({ label, value }: { label: string; value: string }) {
  if (!value.trim()) return null
  return (
    <Stack direction="row" spacing={1.25} sx={{ py: 0.35 }}>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ width: 72, flexShrink: 0, fontWeight: 600, lineHeight: 1.45 }}
      >
        {label}
      </Typography>
      <Typography variant="body2" sx={{ flex: 1, lineHeight: 1.45, wordBreak: 'break-word' }}>
        {value}
      </Typography>
    </Stack>
  )
}

export function CollectionItemDetailDialog({ open, item, onClose }: Props) {
  if (!item) return null

  const mainMeta = getCollectionMainMeta(item.mainCategory)
  const subLabel = getSubcategoryLabel(item.mainCategory, item.subCategory)
  const storeLabel = getCollectionStoreLabel(item.storeKey, item.storeCustom)
  const purchaseLabel = formatLastPurchaseDateDisplay(item.purchaseDate)
  const isFood = isFoodMainCategory(item.mainCategory)
  const isFashion = isFashionMainCategory(item.mainCategory)
  const foodDetails = isFood ? getCollectionFoodDetailLabels(item) : []
  const optionFields =
    isFashion && item.optionType !== 'none' ? COLLECTION_OPTION_FIELDS[item.optionType] : []

  return (
    <AppDialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xs"
      disableAutoFocus
      slotProps={{
        paper: {
          sx: {
            borderRadius: 2.5,
            overflow: 'hidden',
          },
        },
      }}
    >
      <FormDialogHeader onClose={onClose}>
        <Typography component="span" sx={{ fontSize: '1.05rem', fontWeight: 800, lineHeight: 1.35 }}>
          {item.name.trim() || '소장품'}
        </Typography>
      </FormDialogHeader>

      <DialogContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
        {item.imageData ? (
          <Box
            sx={{
              lineHeight: 0,
              bgcolor: 'action.hover',
              borderBottom: 1,
              borderColor: 'divider',
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.imageData}
              alt={item.name}
              style={{
                display: 'block',
                width: '100%',
                maxHeight: 'min(52dvh, 420px)',
                objectFit: 'contain',
              }}
            />
          </Box>
        ) : null}

        <Stack spacing={1.25} sx={{ px: 2, py: 1.75 }}>
          <Stack direction="row" alignItems="center" gap={0.75} flexWrap="wrap">
            <Box component="span" sx={sxCollectionBadge(item.mainCategory)}>
              {mainMeta.label}
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
              {subLabel}
            </Typography>
            {item.brand.trim() ? (
              <Box component="span" sx={sxCollectionBrandChip()}>
                {item.brand.trim()}
              </Box>
            ) : null}
          </Stack>

          <Box>
            <DetailRow label="구매가" value={formatPrice(item.purchasePrice)} />
            <DetailRow label="구매처" value={storeLabel} />
            {purchaseLabel ? <DetailRow label="구매일" value={purchaseLabel} /> : null}
            {!isFood && item.model.trim() ? <DetailRow label="모델명" value={item.model.trim()} /> : null}
            {!isFood && item.size.trim() ? <DetailRow label="옵션" value={item.size.trim()} /> : null}
            {isFashion && item.optionType !== 'none' ? (
              <DetailRow label="상세옵션" value={getCollectionOptionLabel(item.optionType)} />
            ) : null}
            {optionFields.map((field) => {
              const value = item.optionData[field.key]?.trim() ?? ''
              if (!value) return null
              return <DetailRow key={field.key} label={field.label} value={value} />
            })}
          </Box>

          {isFood && foodDetails.length > 0 ? (
            <Box>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontWeight: 700, display: 'block', mb: 0.75 }}
              >
                용량 · 단가
              </Typography>
              <Stack spacing={0.5}>
                {foodDetails.map((part) => (
                  <Typography
                    key={part}
                    variant="body2"
                    sx={{
                      fontWeight: part.includes('당') ? 700 : 500,
                      color: part.includes('당') ? 'primary.main' : 'text.primary',
                      lineHeight: 1.45,
                    }}
                  >
                    {part}
                  </Typography>
                ))}
              </Stack>
            </Box>
          ) : null}

          {item.description.trim() ? (
            <Box>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontWeight: 700, display: 'block', mb: 0.5 }}
              >
                설명
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ lineHeight: 1.55, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
              >
                {item.description.trim()}
              </Typography>
            </Box>
          ) : null}
        </Stack>
      </DialogContent>
    </AppDialog>
  )
}
