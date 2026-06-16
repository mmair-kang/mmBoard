'use client'
// 수정: Auto — 2026-06-15 (LivingMonthlyPanel subs 타입 수정)

import {
  sxCollectionAddButton,
  sxCollectionBrandChip,
  sxCollectionChipButton,
  sxCollectionFoodMetricChip,
  sxCollectionLivingSummaryPanel,
  sxCollectionMainTabs,
  sxCollectionMonthlyUnderThumb,
  sxCollectionSearchResultPanel,
  sxCollectionSearchResultQuery,
  sxCollectionSearchResultText,
  sxCollectionSectionSegmentItem,
  sxCollectionSectionSegmentTrack,
  sxCollectionLivingSubButton,
  sxCollectionLivingSubButtonAmountFoot,
  sxCollectionLivingSubButtonLabel,
  sxCollectionLivingSubRow,
  sxCollectionLivingTotalAmount,
  sxCollectionSubChip,
  sxCollectionSubChipPanel,
} from '@/components/collection/collectionStyles'
import { ListSearchField } from '@/components/common/ListSearchField'
import { CollectionItemDetailDialog } from '@/components/collection/CollectionItemDetailDialog'
import { CollectionItemFormDialog } from '@/components/collection/CollectionItemFormDialog'
import { CollectionSubcategoryEditDialog } from '@/components/collection/CollectionSubcategoryEditDialog'
import { ShoppingItemThumbnail } from '@/components/shopping/ShoppingItemThumbnail'
// 수정: Auto — 2026-06-11 (상시·수시·소장)

import {
  COLLECTION_OWN_MAIN_CATEGORIES,
  COLLECTION_SECTIONS,
  getCollectionMainMeta,
  getCollectionStoreLabel,
  getCollectionSubFilters,
  getDefaultMainForSection,
  getDefaultSubcategory,
  getFirstSubcategory,
  getSubcategoryLabel,
  isConsumableSection,
  isFoodMainCategory,
  isCollectionPackDetailCategory,
  type CollectionMainKey,
  type CollectionSectionKey,
  type CollectionSubEntry,
  type CollectionSubKey,
  type FoodScopeKey,
} from '@/config/collectionCategories'
import {
  type CollectionItem,
  collectionItemsKey,
  useAllCollectionItems,
  useCollectionItems,
  useRegularFoodItems,
} from '@/hooks/useCollectionItems'
import { useCollectionSubcategories } from '@/hooks/useCollectionSubcategories'
import { useLongPress } from '@/hooks/useLongPress'
import { formatLastPurchaseRelativeLabel } from '@/lib/shoppingDate'
import {
  formatCollectionPackListSubline,
  getCollectionFoodListLabels,
  isCollectionFoodPriceMetric,
} from '@/lib/collectionDetail'
import { upsertCollectionItemSorted } from '@/lib/collectionItem'
import type { CollectionItemPayload } from '@/lib/collectionPayload'
import {
  sxDesktopListGrid,
  sxPageScrollBody,
  sxPageStickyHeaderPad,
  sxPageTitle,
} from '@/config/responsiveLayout'
import { buildLivingMonthlyBreakdown, calcLivingMonthlyCost, formatCompactLivingAmount } from '@/lib/livingCost'
import { matchesAnySearch } from '@/lib/koreanSearch'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import IconButton from '@mui/material/IconButton'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { useMemo, useState, useEffect } from 'react'
import { useSWRConfig } from 'swr'

function formatPrice(price: number) {
  return `${price.toLocaleString('ko-KR')}원`
}

function isInCurrentList(
  item: CollectionItem,
  main: CollectionMainKey,
  sub: CollectionSubKey,
  foodScope?: FoodScopeKey,
) {
  if (item.mainCategory !== main || item.subCategory !== sub) return false
  if (main === 'food' && foodScope) return item.foodScope === foodScope
  return true
}

const COLLECTION_LIST_THUMB_SIZE = { xs: 68, md: 80 } as const

function matchesCollectionItem(item: CollectionItem, query: string) {
  const foodLabels = isFoodMainCategory(item.mainCategory)
    ? getCollectionFoodListLabels(item).join(' ')
    : ''
  return matchesAnySearch(
    [
      item.brand,
      item.name,
      item.nameSuffix,
      item.model,
      item.size,
      item.description,
      foodLabels,
      getCollectionStoreLabel(item.storeKey, item.storeCustom),
    ],
    query,
  )
}

function LivingMonthlyPanel({
  total,
  subs,
  activeSub,
  monthlyBySub,
  onSelectSub,
  subChipLongPress,
  wrapSubChipClick,
  subChipButtonSx,
}: {
  total: number
  subs: readonly CollectionSubEntry[]
  activeSub: CollectionSubKey
  monthlyBySub: Map<string, number>
  onSelectSub: (key: CollectionSubKey) => void
  subChipLongPress: ReturnType<typeof useLongPress>['pointerHandlers']
  wrapSubChipClick: ReturnType<typeof useLongPress>['wrapClick']
  subChipButtonSx: Record<string, unknown>
}) {
  return (
    <Box sx={sxCollectionLivingSummaryPanel()}>
      <Stack direction="row" alignItems="baseline" justifyContent="space-between" gap={0.5}>
        <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: 'text.secondary', flexShrink: 0 }}>
          한달 상시비
        </Typography>
        <Typography sx={sxCollectionLivingTotalAmount()}>
          {formatPrice(total)}
          <Box component="span" sx={{ fontSize: '0.68rem', fontWeight: 700, ml: 0.15, opacity: 0.85 }}>
            /월
          </Box>
        </Typography>
      </Stack>

      <Stack direction="row" sx={sxCollectionLivingSubRow()} {...subChipLongPress}>
        {subs.map((c) => {
          const selected = activeSub === c.key
          const monthly = monthlyBySub.get(c.key) ?? 0
          const hasAmount = monthly > 0
          return (
            <Box
              key={c.key}
              component="button"
              type="button"
              onClick={wrapSubChipClick(() => onSelectSub(c.key as CollectionSubKey))}
              sx={{
                ...sxCollectionLivingSubButton(selected),
                ...subChipButtonSx,
                touchAction: 'manipulation',
              }}
            >
              <Box component="span" sx={sxCollectionLivingSubButtonLabel(selected)}>
                {c.label}
              </Box>
              <Box component="span" sx={sxCollectionLivingSubButtonAmountFoot(hasAmount, selected)}>
                {hasAmount ? formatCompactLivingAmount(monthly) : '—'}
              </Box>
            </Box>
          )
        })}
      </Stack>

      {total === 0 ? (
        <Typography sx={{ fontSize: '0.6rem', color: 'text.secondary', lineHeight: 1.3, mt: 0.45 }}>
          재구매중 ON인 항목만 합계에 포함됩니다
        </Typography>
      ) : null}
    </Box>
  )
}

function CollectionItemCard({
  item,
  onEdit,
  onDetail,
  showLivingCost,
}: {
  item: CollectionItem
  onEdit: (item: CollectionItem) => void
  onDetail: (item: CollectionItem) => void
  showLivingCost?: boolean
}) {
  const mainMeta = getCollectionMainMeta(item.mainCategory)
  const storeLabel = getCollectionStoreLabel(item.storeKey, item.storeCustom)
  const purchaseLabel = formatLastPurchaseRelativeLabel(item.purchaseDate)
  const brand = item.brand.trim()
  const name = item.name.trim()
  const nameSuffix = item.nameSuffix.trim()
  const isFood = isFoodMainCategory(item.mainCategory)
  const isPackDetail = isCollectionPackDetailCategory(item.mainCategory)
  const modelLine = [item.model.trim(), item.size.trim()].filter(Boolean).join(' · ')
  const packDetailLine = isPackDetail ? formatCollectionPackListSubline(item) : ''
  const foodLabels = isFood ? getCollectionFoodListLabels(item) : []
  const detailLine = isPackDetail ? [modelLine, packDetailLine].filter(Boolean).join(' · ') : modelLine
  const monthlyCost = showLivingCost ? calcLivingMonthlyCost(item.purchasePrice, item.repurchaseDays) : null
  const monthlyActive = item.repurchaseActive === true
  const hasThumb = Boolean(item.imageData)
  const showMonthly = showLivingCost && monthlyCost != null
  const showLeftColumn = hasThumb || showMonthly

  return (
    <Paper
      variant="outlined"
      onClick={() => onEdit(item)}
      sx={{
        px: { xs: 1, md: 1.25 },
        py: { xs: 0.75, md: 1 },
        borderRadius: 1.5,
        borderLeftWidth: 3,
        borderLeftStyle: 'solid',
        borderLeftColor: mainMeta.color,
        cursor: 'pointer',
      }}
    >
      <Stack direction="row" alignItems="flex-start" gap={1.25}>
        {showLeftColumn ? (
          <Stack
            alignItems="center"
            sx={{ width: { xs: 68, md: 80 }, flexShrink: 0, gap: 0.35 }}
          >
            {hasThumb ? (
              <ShoppingItemThumbnail
                src={item.imageData!}
                responsiveSize={COLLECTION_LIST_THUMB_SIZE}
                onClick={(e) => {
                  e.stopPropagation()
                  onDetail(item)
                }}
              />
            ) : null}
            {showMonthly ? (
              <Box sx={sxCollectionMonthlyUnderThumb(monthlyActive)}>
                월 {formatCompactLivingAmount(monthlyCost)}
              </Box>
            ) : null}
          </Stack>
        ) : null}
        <Box sx={{ minWidth: 0, flex: 1 }}>
          {(brand || name || nameSuffix) ? (
            <Stack direction="row" alignItems="center" gap={0.6} sx={{ minWidth: 0 }}>
              {brand ? (
                <Box component="span" sx={{ ...sxCollectionBrandChip(), flexShrink: 0 }}>
                  {brand}
                </Box>
              ) : null}
              {(name || nameSuffix) ? (
                <Typography
                  sx={{
                    flex: 1,
                    minWidth: 0,
                    fontSize: { xs: 15, md: 16 },
                    fontWeight: 700,
                    lineHeight: 1.3,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {name ? <Box component="span">{name}</Box> : null}
                  {nameSuffix ? (
                    <Box
                      component="span"
                      sx={{
                        color: 'text.secondary',
                        fontWeight: 500,
                        ml: name ? 0.75 : 0,
                      }}
                    >
                      {nameSuffix}
                    </Box>
                  ) : null}
                </Typography>
              ) : null}
            </Stack>
          ) : null}
          {foodLabels.length > 0 ? (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.35, mt: 0.45 }}>
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
          {!isFood && detailLine ? (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 0.35, lineHeight: 1.35, wordBreak: 'break-word' }}
            >
              {detailLine}
            </Typography>
          ) : null}
          <Stack direction="row" flexWrap="wrap" gap={0.5} sx={{ mt: 0.5 }}>
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 700 }}>
              {formatPrice(item.purchasePrice)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              ·
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {storeLabel}
            </Typography>
            {purchaseLabel ? (
              <>
                <Typography variant="body2" color="text.secondary">
                  ·
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {purchaseLabel}
                </Typography>
              </>
            ) : null}
          </Stack>
        </Box>
      </Stack>
    </Paper>
  )
}

export function CollectionPageContent() {
  const [section, setSection] = useState<CollectionSectionKey>('regular')
  const [mainCategory, setMainCategory] = useState<CollectionMainKey>(() => getDefaultMainForSection('regular'))
  const [subCategory, setSubCategory] = useState<CollectionSubKey>(() => getDefaultSubcategory('food'))
  const activeFoodScope: FoodScopeKey | undefined = isConsumableSection(section) ? section : undefined
  const [formOpen, setFormOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<CollectionItem | null>(null)
  const [detailItem, setDetailItem] = useState<CollectionItem | null>(null)
  const [subEditOpen, setSubEditOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const trimmedQuery = searchQuery.trim()
  const isSearching = Boolean(trimmedQuery)
  const { mutate: globalMutate } = useSWRConfig()
  const { subs, saveSubs } = useCollectionSubcategories(mainCategory)
  const { pointerHandlers: subChipLongPress, wrapClick: wrapSubChipClick } = useLongPress({
    onLongPress: () => setSubEditOpen(true),
  })
  const { items, isLoading, mutate } = useCollectionItems(mainCategory, subCategory, activeFoodScope)
  const { items: allItems, isLoading: allLoading, mutate: mutateAll } = useAllCollectionItems(isSearching)
  const { items: regularFoodItems, mutate: mutateRegularFood } = useRegularFoodItems(
    section === 'regular' && !isSearching,
  )
  const livingMonthlyBreakdown = useMemo(
    () => buildLivingMonthlyBreakdown(regularFoodItems, subs),
    [regularFoodItems, subs],
  )
  const livingMonthlyBySub = useMemo(() => {
    const map = new Map<string, number>()
    for (const row of livingMonthlyBreakdown.rows) {
      map.set(row.subKey, row.monthly)
    }
    return map
  }, [livingMonthlyBreakdown.rows])
  const displayItems = useMemo(() => {
    if (!trimmedQuery) return items
    return allItems.filter((item) => matchesCollectionItem(item, trimmedQuery))
  }, [items, allItems, trimmedQuery])

  const listLoading = isSearching ? allLoading && allItems.length === 0 : isLoading

  useEffect(() => {
    if (subs.some((s) => s.key === subCategory)) return
    setSubCategory(getFirstSubcategory(mainCategory, subs))
  }, [subs, mainCategory, subCategory])

  const formSubCategory = editingItem?.subCategory ?? subCategory

  const openAddDialog = () => {
    setEditingItem(null)
    setFormOpen(true)
  }

  const openEditDialog = (item: CollectionItem) => {
    setEditingItem(item)
    setFormOpen(true)
  }

  const closeFormDialog = () => {
    setFormOpen(false)
    setEditingItem(null)
  }

  const handleAdd = async (payload: CollectionItemPayload) => {
    const res = await fetch('/api/collection-items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { message?: string }
      throw new Error(body.message ?? '추가 실패')
    }
    const newItem = (await res.json()) as CollectionItem
    if (isInCurrentList(newItem, mainCategory, subCategory, activeFoodScope)) {
      await mutate((prev) => upsertCollectionItemSorted(prev, newItem), { revalidate: false })
    }
    await mutateAll(
      (prev) => upsertCollectionItemSorted(prev, newItem),
      { revalidate: false },
    )
    if (newItem.mainCategory === 'food' && newItem.foodScope === 'regular') {
      await mutateRegularFood(
        (prev) => upsertCollectionItemSorted(prev, newItem),
        { revalidate: false },
      )
    }
  }

  const handleUpdate = async (payload: CollectionItemPayload) => {
    if (!editingItem) return
    const res = await fetch(`/api/collection-items/${editingItem.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { message?: string }
      throw new Error(body.message ?? '수정 실패')
    }
    const updated = (await res.json()) as CollectionItem

    if (isInCurrentList(updated, mainCategory, subCategory, activeFoodScope)) {
      await mutate((prev) => upsertCollectionItemSorted(prev, updated), { revalidate: false })
    } else {
      await mutate((prev) => (prev ?? []).filter((item) => item.id !== updated.id), { revalidate: false })
    }

    await mutateAll(
      (prev) => upsertCollectionItemSorted(prev, updated),
      { revalidate: false },
    )

    if (updated.mainCategory === 'food' || editingItem.mainCategory === 'food') {
      await mutateRegularFood((prev) => {
        const list = (prev ?? []).filter((row) => row.id !== updated.id)
        if (updated.mainCategory === 'food' && updated.foodScope === 'regular') {
          return upsertCollectionItemSorted(list, updated)
        }
        return list
      }, { revalidate: false })
    }

    if (updated.mainCategory === mainCategory && updated.subCategory !== editingItem.subCategory) {
      const listKey = (sub: CollectionSubKey) =>
        mainCategory === 'food' && activeFoodScope
          ? collectionItemsKey(mainCategory, sub, activeFoodScope)
          : collectionItemsKey(mainCategory, sub)
      await globalMutate(
        listKey(updated.subCategory),
        (prev: CollectionItem[] | undefined) => upsertCollectionItemSorted(prev, updated),
        { revalidate: false },
      )
      await globalMutate(
        listKey(editingItem.subCategory),
        (prev: CollectionItem[] | undefined) => (prev ?? []).filter((item) => item.id !== updated.id),
        { revalidate: false },
      )
    } else if (updated.mainCategory === 'food' && editingItem.foodScope !== updated.foodScope) {
      await globalMutate(
        collectionItemsKey('food', updated.subCategory, editingItem.foodScope),
        (prev: CollectionItem[] | undefined) => (prev ?? []).filter((item) => item.id !== updated.id),
        { revalidate: false },
      )
      await globalMutate(
        collectionItemsKey('food', updated.subCategory, updated.foodScope),
        (prev: CollectionItem[] | undefined) => upsertCollectionItemSorted(prev, updated),
        { revalidate: false },
      )
    } else if (updated.mainCategory !== mainCategory || updated.subCategory !== subCategory) {
      await globalMutate(
        updated.mainCategory === 'food'
          ? collectionItemsKey(updated.mainCategory, updated.subCategory, updated.foodScope)
          : collectionItemsKey(updated.mainCategory, updated.subCategory),
        (prev: CollectionItem[] | undefined) => upsertCollectionItemSorted(prev, updated),
        { revalidate: false },
      )
    }
  }

  const handleDelete = async (id: number) => {
    const target = editingItem ?? items.find((row) => row.id === id)
    await mutate((prev) => (prev ?? []).filter((item) => item.id !== id), { revalidate: false })
    await mutateAll((prev) => (prev ?? []).filter((item) => item.id !== id), { revalidate: false })
    if (target?.mainCategory === 'food' && target.foodScope === 'regular') {
      await mutateRegularFood((prev) => (prev ?? []).filter((item) => item.id !== id), { revalidate: false })
    }
    await fetch(`/api/collection-items/${id}`, { method: 'DELETE' })
  }

  const handleFormSubmit = async (payload: CollectionItemPayload) => {
    if (editingItem) {
      await handleUpdate(payload)
    } else {
      await handleAdd(payload)
    }
  }

  const mainMeta = getCollectionMainMeta(mainCategory)
  const subLabel = getSubcategoryLabel(mainCategory, subCategory, subs)
  const chipButtonSx = sxCollectionChipButton()
  const subChipButtonSx = sxCollectionChipButton(true)
  const addTooltip = isSearching
    ? '검색 중 · 항목 추가'
    : isConsumableSection(section)
      ? `${section === 'regular' ? '상시' : '수시'} · ${subLabel} 추가`
      : `${mainMeta.label} · ${subLabel} 추가`

  const handleSectionChange = (next: CollectionSectionKey) => {
    setSection(next)
    const nextMain = getDefaultMainForSection(next)
    setMainCategory(nextMain)
    setSubCategory(getFirstSubcategory(nextMain))
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <Box
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: (theme) => theme.zIndex.appBar - 1,
          bgcolor: 'background.paper',
          borderBottom: 1,
          borderColor: 'divider',
          flexShrink: 0,
          boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)',
        }}
      >
        <Stack spacing={1} sx={sxPageStickyHeaderPad}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1}>
            <Typography variant="h5" sx={sxPageTitle}>
              쇼핑
            </Typography>
            <Tooltip title={addTooltip}>
              <IconButton
                onClick={openAddDialog}
                aria-label="항목 추가"
                sx={sxCollectionAddButton(isConsumableSection(section) ? 'food' : mainCategory)}
              >
                <AddRoundedIcon />
              </IconButton>
            </Tooltip>
          </Stack>

          <ListSearchField value={searchQuery} onChange={setSearchQuery} />

          {!isSearching ? (
            <Box sx={sxCollectionSectionSegmentTrack()}>
              {COLLECTION_SECTIONS.map((c) => (
                <Box
                  key={c.key}
                  component="button"
                  type="button"
                  onClick={() => handleSectionChange(c.key)}
                  sx={{
                    ...sxCollectionSectionSegmentItem(c.key, section === c.key),
                    ...chipButtonSx,
                  }}
                >
                  {c.label}
                </Box>
              ))}
            </Box>
          ) : null}

          {section === 'own' && !isSearching ? (
            <Tabs
              value={mainCategory}
              onChange={(_, value: CollectionMainKey) => {
                setMainCategory(value)
                setSubCategory(getFirstSubcategory(value))
              }}
              variant="fullWidth"
              sx={sxCollectionMainTabs(mainCategory)}
            >
              {COLLECTION_OWN_MAIN_CATEGORIES.map((c) => (
                <Tab key={c.key} value={c.key} label={c.label} />
              ))}
            </Tabs>
          ) : null}

          {isSearching ? (
            <Box sx={sxCollectionSearchResultPanel()}>
              <Typography sx={sxCollectionSearchResultText()}>
                <Box component="span" sx={sxCollectionSearchResultQuery()}>
                  {trimmedQuery}
                </Box>
                {' '}검색 결과
                {!listLoading ? ` · ${displayItems.length}건` : null}
              </Typography>
            </Box>
          ) : section === 'regular' ? (
            <LivingMonthlyPanel
              total={livingMonthlyBreakdown.total}
              subs={getCollectionSubFilters(mainCategory, subs)}
              activeSub={subCategory}
              monthlyBySub={livingMonthlyBySub}
              onSelectSub={setSubCategory}
              subChipLongPress={subChipLongPress}
              wrapSubChipClick={wrapSubChipClick}
              subChipButtonSx={subChipButtonSx}
            />
          ) : (
            <Box sx={sxCollectionSubChipPanel(mainCategory)}>
              {getCollectionSubFilters(mainCategory, subs).map((c) => (
                <Box
                  key={c.key}
                  component="button"
                  type="button"
                  {...subChipLongPress}
                  onClick={wrapSubChipClick(() => setSubCategory(c.key as CollectionSubKey))}
                  sx={{
                    ...sxCollectionSubChip(mainCategory, subCategory === c.key),
                    ...subChipButtonSx,
                    touchAction: 'manipulation',
                  }}
                >
                  {c.label}
                </Box>
              ))}
            </Box>
          )}
        </Stack>
      </Box>

      <Box sx={{ ...sxPageScrollBody, flex: 1, py: { xs: 1.25, md: 1.5 } }}>
        {listLoading ? (
          <Stack alignItems="center" justifyContent="center" sx={{ py: 6 }}>
            <CircularProgress />
          </Stack>
        ) : !isSearching && items.length === 0 ? (
          <Stack alignItems="center" justifyContent="center" sx={{ py: 6, color: 'text.secondary' }}>
            <Typography sx={{ fontWeight: 600 }}>
              {isConsumableSection(section)
                ? `${section === 'regular' ? '상시' : '수시'} · ${subLabel} 목록이 비어 있습니다`
                : `${mainMeta.label} · ${subLabel} 목록이 비어 있습니다`}
            </Typography>
            <Typography variant="body2" sx={{ mt: 0.5 }}>
              + 버튼으로 {isConsumableSection(section) ? '소모품' : '소장품'}을 추가해 보세요
            </Typography>
          </Stack>
        ) : displayItems.length === 0 ? (
          <Stack alignItems="center" justifyContent="center" sx={{ py: 6, color: 'text.secondary' }}>
            <Typography sx={{ fontWeight: 600 }}>검색 결과가 없습니다</Typography>
            <Typography variant="body2" sx={{ mt: 0.5 }}>
              다른 검색어를 입력해 보세요
            </Typography>
          </Stack>
        ) : (
          <Box sx={sxDesktopListGrid}>
            {displayItems.map((item) => (
              <CollectionItemCard
                key={item.id}
                item={item}
                onEdit={openEditDialog}
                onDetail={setDetailItem}
                showLivingCost={
                  isFoodMainCategory(item.mainCategory) &&
                  item.foodScope === 'regular' &&
                  (isSearching || section === 'regular')
                }
              />
            ))}
          </Box>
        )}
      </Box>

      <CollectionItemFormDialog
        open={formOpen}
        section={section}
        mainCategory={editingItem?.mainCategory ?? mainCategory}
        subCategory={formSubCategory}
        item={editingItem}
        onClose={closeFormDialog}
        onSubmit={handleFormSubmit}
        onDelete={
          editingItem
            ? async () => {
                await handleDelete(editingItem.id)
              }
            : undefined
        }
      />

      <CollectionItemDetailDialog
        open={detailItem != null}
        item={detailItem}
        onClose={() => setDetailItem(null)}
      />

      <CollectionSubcategoryEditDialog
        open={subEditOpen}
        mainCategory={mainCategory}
        subs={subs}
        onClose={() => setSubEditOpen(false)}
        onSave={async (rows) => {
          const saved = await saveSubs(rows)
          setSubCategory((prev) => {
            if (saved.some((s) => s.key === prev)) return prev
            return saved[0]?.key ?? prev
          })
          return saved
        }}
      />
    </Box>
  )
}
