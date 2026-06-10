'use client'
// 수정: Auto — 2026-06-05 (통합 정보 모달)

import {
  sxCollectionAddButton,
  sxCollectionBrandChip,
  sxCollectionChipButton,
  sxCollectionMainChip,
  sxCollectionMainChipGrid,
  sxCollectionSearchResultPanel,
  sxCollectionSearchResultQuery,
  sxCollectionSearchResultText,
  sxCollectionSubChip,
  sxCollectionSubChipPanel,
} from '@/components/collection/collectionStyles'
import { ListSearchField } from '@/components/common/ListSearchField'
import { CollectionItemDetailDialog } from '@/components/collection/CollectionItemDetailDialog'
import { CollectionItemFormDialog } from '@/components/collection/CollectionItemFormDialog'
import { CollectionSubcategoryEditDialog } from '@/components/collection/CollectionSubcategoryEditDialog'
import { ShoppingItemThumbnail } from '@/components/shopping/ShoppingItemThumbnail'
import {
  COLLECTION_MAIN_CATEGORIES,
  getCollectionMainMeta,
  getCollectionStoreLabel,
  getCollectionSubFilters,
  getDefaultSubcategory,
  getFirstSubcategory,
  getSubcategoryLabel,
  isFoodMainCategory,
  isCollectionPackDetailCategory,
  type CollectionMainKey,
  type CollectionSubKey,
} from '@/config/collectionCategories'
import {
  type CollectionItem,
  collectionItemsKey,
  useAllCollectionItems,
  useCollectionItems,
} from '@/hooks/useCollectionItems'
import { useCollectionSubcategories } from '@/hooks/useCollectionSubcategories'
import { useLongPress } from '@/hooks/useLongPress'
import { formatLastPurchaseDateDisplay } from '@/lib/shoppingDate'
import { formatCollectionFoodListSubline, formatCollectionPackListSubline } from '@/lib/collectionDetail'
import { upsertCollectionItemSorted } from '@/lib/collectionItem'
import type { CollectionItemPayload } from '@/lib/collectionPayload'
import { matchesAnySearch } from '@/lib/koreanSearch'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import IconButton from '@mui/material/IconButton'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { useMemo, useState, useEffect } from 'react'
import { useSWRConfig } from 'swr'

function formatPrice(price: number) {
  return `${price.toLocaleString('ko-KR')}원`
}

function isInCurrentList(item: CollectionItem, main: CollectionMainKey, sub: CollectionSubKey) {
  return item.mainCategory === main && item.subCategory === sub
}

const COLLECTION_LIST_THUMB_SIZE = 68

function matchesCollectionItem(item: CollectionItem, query: string) {
  const amountLabel = isFoodMainCategory(item.mainCategory)
    ? formatCollectionFoodListSubline(item)
    : ''
  return matchesAnySearch(
    [
      item.brand,
      item.name,
      item.nameSuffix,
      item.model,
      item.size,
      item.description,
      amountLabel,
      getCollectionStoreLabel(item.storeKey, item.storeCustom),
    ],
    query,
  )
}

function CollectionItemCard({
  item,
  onEdit,
  onDetail,
}: {
  item: CollectionItem
  onEdit: (item: CollectionItem) => void
  onDetail: (item: CollectionItem) => void
}) {
  const mainMeta = getCollectionMainMeta(item.mainCategory)
  const storeLabel = getCollectionStoreLabel(item.storeKey, item.storeCustom)
  const purchaseLabel = formatLastPurchaseDateDisplay(item.purchaseDate)
  const brand = item.brand.trim()
  const name = item.name.trim()
  const nameSuffix = item.nameSuffix.trim()
  const isFood = isFoodMainCategory(item.mainCategory)
  const isPackDetail = isCollectionPackDetailCategory(item.mainCategory)
  const modelLine = [item.model.trim(), item.size.trim()].filter(Boolean).join(' · ')
  const packDetailLine = isPackDetail ? formatCollectionPackListSubline(item) : ''
  const secondLineText = isFood
    ? formatCollectionFoodListSubline(item)
    : isPackDetail
      ? [modelLine, packDetailLine].filter(Boolean).join(' · ')
      : modelLine
  const showSecondLine = Boolean(brand || secondLineText)
  return (
    <Paper
      variant="outlined"
      onClick={() => onEdit(item)}
      sx={{
        px: 1,
        py: 0.75,
        borderRadius: 1.5,
        borderLeftWidth: 3,
        borderLeftStyle: 'solid',
        borderLeftColor: mainMeta.color,
        cursor: 'pointer',
      }}
    >
      <Stack direction="row" alignItems="center" gap={1.5}>
        {item.imageData ? (
          <ShoppingItemThumbnail
            src={item.imageData}
            size={COLLECTION_LIST_THUMB_SIZE}
            onClick={(e) => {
              e.stopPropagation()
              onDetail(item)
            }}
          />
        ) : null}
        <Box sx={{ minWidth: 0, flex: 1 }}>
          {(name || nameSuffix) ? (
            <Typography
              sx={{
                fontSize: 15,
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
          {showSecondLine ? (
            <Stack
              direction="row"
              alignItems="center"
              gap={0.75}
              flexWrap="wrap"
              sx={{ mt: 0.25, minWidth: 0 }}
            >
              {brand ? (
                <Box component="span" sx={sxCollectionBrandChip()}>
                  {brand}
                </Box>
              ) : null}
              {secondLineText ? (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    lineHeight: 1.3,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    minWidth: 0,
                    flex: brand ? 1 : undefined,
                  }}
                >
                  {secondLineText}
                </Typography>
              ) : null}
            </Stack>
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
  const [mainCategory, setMainCategory] = useState<CollectionMainKey>('personal')
  const [subCategory, setSubCategory] = useState<CollectionSubKey>(() => getDefaultSubcategory('personal'))
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
  const { items, isLoading, mutate } = useCollectionItems(mainCategory, subCategory)
  const { items: allItems, isLoading: allLoading, mutate: mutateAll } = useAllCollectionItems(isSearching)
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
    if (isInCurrentList(newItem, mainCategory, subCategory)) {
      await mutate((prev) => upsertCollectionItemSorted(prev, newItem), { revalidate: false })
    }
    await mutateAll(
      (prev) => upsertCollectionItemSorted(prev, newItem),
      { revalidate: false },
    )
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

    if (isInCurrentList(updated, mainCategory, subCategory)) {
      await mutate((prev) => upsertCollectionItemSorted(prev, updated), { revalidate: false })
    } else {
      await mutate((prev) => (prev ?? []).filter((item) => item.id !== updated.id), { revalidate: false })
    }

    await mutateAll(
      (prev) => upsertCollectionItemSorted(prev, updated),
      { revalidate: false },
    )

    if (updated.mainCategory === mainCategory && updated.subCategory !== editingItem.subCategory) {
      await globalMutate(
        collectionItemsKey(mainCategory, updated.subCategory),
        (prev: CollectionItem[] | undefined) => upsertCollectionItemSorted(prev, updated),
        { revalidate: false },
      )
      await globalMutate(
        collectionItemsKey(mainCategory, editingItem.subCategory),
        (prev: CollectionItem[] | undefined) =>
          (prev ?? []).filter((item) => item.id !== updated.id),
        { revalidate: false },
      )
    } else if (updated.mainCategory !== mainCategory || updated.subCategory !== subCategory) {
      await globalMutate(
        collectionItemsKey(updated.mainCategory, updated.subCategory),
        (prev: CollectionItem[] | undefined) => upsertCollectionItemSorted(prev, updated),
        { revalidate: false },
      )
    }
  }

  const handleDelete = async (id: number) => {
    await mutate((prev) => (prev ?? []).filter((item) => item.id !== id), { revalidate: false })
    await mutateAll((prev) => (prev ?? []).filter((item) => item.id !== id), { revalidate: false })
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
        <Stack spacing={1} sx={{ px: 1.5, pt: 1.25, pb: 1.125 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1}>
            <Typography variant="h5" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
              소장
            </Typography>
            <Tooltip title={isSearching ? '검색 중 · 소장 추가' : `${mainMeta.label} · ${subLabel} 추가`}>
              <IconButton
                onClick={openAddDialog}
                aria-label="소장 추가"
                sx={sxCollectionAddButton(mainCategory)}
              >
                <AddRoundedIcon />
              </IconButton>
            </Tooltip>
          </Stack>

          <ListSearchField value={searchQuery} onChange={setSearchQuery} />

          <Box sx={sxCollectionMainChipGrid}>
            {COLLECTION_MAIN_CATEGORIES.map((c) => (
              <Box
                key={c.key}
                component="button"
                type="button"
                onClick={() => {
                  if (isSearching) setSearchQuery('')
                  setMainCategory(c.key)
                  setSubCategory(getFirstSubcategory(c.key))
                }}
                sx={{
                  ...sxCollectionMainChip(c.key, !isSearching && mainCategory === c.key),
                  ...chipButtonSx,
                  ...(isSearching ? { opacity: 0.72 } : null),
                }}
              >
                {c.label}
              </Box>
            ))}
          </Box>

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

      <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', px: 1.5, py: 1.25 }}>
        {listLoading ? (
          <Stack alignItems="center" justifyContent="center" sx={{ py: 6 }}>
            <CircularProgress />
          </Stack>
        ) : !isSearching && items.length === 0 ? (
          <Stack alignItems="center" justifyContent="center" sx={{ py: 6, color: 'text.secondary' }}>
            <Typography sx={{ fontWeight: 600 }}>
              {mainMeta.label} · {subLabel} 목록이 비어 있습니다
            </Typography>
            <Typography variant="body2" sx={{ mt: 0.5 }}>
              + 버튼으로 소장품을 추가해 보세요
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
          <Stack spacing={0.75}>
            {displayItems.map((item) => (
              <CollectionItemCard
                key={item.id}
                item={item}
                onEdit={openEditDialog}
                onDetail={setDetailItem}
              />
            ))}
          </Stack>
        )}
      </Box>

      <CollectionItemFormDialog
        open={formOpen}
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
