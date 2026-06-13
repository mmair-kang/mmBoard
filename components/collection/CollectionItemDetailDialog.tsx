'use client'
// 수정: Auto — 2026-06-11 (상세 헤더·생활 UI)

import { AppDialog } from '@/components/common/AppDialog'
import { FormDialogHeader } from '@/components/common/FormDialogHeader'
import {
  sxCollectionBrandChip,
  sxCollectionFoodMetricChip,
} from '@/components/collection/collectionStyles'
import {
  getCollectionMainMeta,
  getCollectionStoreLabel,
  getFoodScopeLabel,
  getSubcategoryLabel,
  isFashionMainCategory,
  isFoodMainCategory,
  isCollectionPackDetailCategory,
} from '@/config/collectionCategories'
import {
  COLLECTION_OPTION_FIELDS,
  getCollectionOptionLabel,
} from '@/config/collectionOptions'
import type { CollectionItem } from '@/hooks/useCollectionItems'
import { useCollectionSubcategories } from '@/hooks/useCollectionSubcategories'
import {
  getCollectionPackDetailLabels,
  getCollectionFoodDetailLabels,
  isCollectionFoodPriceMetric,
} from '@/lib/collectionDetail'
import { calcLivingMonthlyCost, formatLivingMonthlyCost } from '@/lib/livingCost'
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
  const { subs } = useCollectionSubcategories(item?.mainCategory ?? 'personal')
  if (!item) return null

  const mainMeta = getCollectionMainMeta(item.mainCategory)
  const subLabel = getSubcategoryLabel(item.mainCategory, item.subCategory, subs)
  const brand = item.brand.trim()
  const displayName = item.name.trim()
  const displayNameSuffix = item.nameSuffix.trim()
  const categoryLine = isFoodMainCategory(item.mainCategory)
    ? `${getFoodScopeLabel(item.foodScope)} · ${subLabel}`
    : `${mainMeta.label} · ${subLabel}`
  const storeLabel = getCollectionStoreLabel(item.storeKey, item.storeCustom)
  const purchaseLabel = formatLastPurchaseDateDisplay(item.purchaseDate)
  const isFood = isFoodMainCategory(item.mainCategory)
  const isPackDetail = isCollectionPackDetailCategory(item.mainCategory)
  const isFashion = isFashionMainCategory(item.mainCategory)
  const foodDetails = isFood ? getCollectionFoodDetailLabels(item) : []
  const packDetails = isPackDetail ? getCollectionPackDetailLabels(item) : []
  const livingMonthly = isFood ? calcLivingMonthlyCost(item.purchasePrice, item.repurchaseDays) : null
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
        <Stack spacing={0.35} sx={{ minWidth: 0 }}>
          {brand || displayName || displayNameSuffix ? (
            <Stack direction="row" alignItems="center" gap={0.65} sx={{ minWidth: 0 }}>
              {brand ? (
                <Box component="span" sx={{ ...sxCollectionBrandChip(), flexShrink: 0 }}>
                  {brand}
                </Box>
              ) : null}
              {displayName || displayNameSuffix ? (
                <Typography
                  component="span"
                  sx={{
                    flex: 1,
                    minWidth: 0,
                    fontSize: '1.05rem',
                    fontWeight: 800,
                    lineHeight: 1.35,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {displayName ? <Box component="span">{displayName}</Box> : null}
                  {displayNameSuffix ? (
                    <Box
                      component="span"
                      sx={{
                        color: 'text.secondary',
                        fontWeight: 500,
                        ml: displayName ? 0.75 : 0,
                      }}
                    >
                      {displayNameSuffix}
                    </Box>
                  ) : null}
                </Typography>
              ) : null}
            </Stack>
          ) : (
            <Typography sx={{ fontSize: '1.05rem', fontWeight: 800, lineHeight: 1.35 }}>
              상품 정보
            </Typography>
          )}
          <Typography
            variant="caption"
            sx={{
              fontSize: '0.72rem',
              fontWeight: 600,
              color: 'text.secondary',
              lineHeight: 1.3,
            }}
          >
            {categoryLine}
          </Typography>
        </Stack>
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
          <Box>
            <DetailRow label="구매가" value={formatPrice(item.purchasePrice)} />
            {isFood && item.repurchaseDays ? (
              <DetailRow label="재구매" value={`${item.repurchaseDays}일마다`} />
            ) : null}
            {isFood ? (
              <DetailRow
                label="재구매중"
                value={item.repurchaseActive ? 'ON · 합계 포함' : 'OFF · 합계 제외'}
              />
            ) : null}
            {livingMonthly != null ? (
              <DetailRow
                label="한달 예상"
                value={`${formatLivingMonthlyCost(livingMonthly) ?? ''}${item.repurchaseActive ? '' : ' (합계 제외)'}`}
              />
            ) : null}
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
                sx={{ fontWeight: 700, display: 'block', mb: 0.65 }}
              >
                용량 · 단가
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.4 }}>
                {foodDetails.map((part) => (
                  <Box
                    key={part}
                    component="span"
                    sx={sxCollectionFoodMetricChip(isCollectionFoodPriceMetric(part))}
                  >
                    {part}
                  </Box>
                ))}
              </Box>
            </Box>
          ) : null}

          {isPackDetail && packDetails.length > 0 ? (
            <Box>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontWeight: 700, display: 'block', mb: 0.65 }}
              >
                상세 · 단가
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.4 }}>
                {packDetails.map((part) => (
                  <Box
                    key={part}
                    component="span"
                    sx={sxCollectionFoodMetricChip(isCollectionFoodPriceMetric(part))}
                  >
                    {part}
                  </Box>
                ))}
              </Box>
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
