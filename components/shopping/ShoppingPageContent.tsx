'use client'
// 수정: Auto — 2026-06-05 (소장 UI 통일·브랜드)

import { sxCollectionBrandChip } from '@/components/collection/collectionStyles'
import { ListSearchField } from '@/components/common/ListSearchField'
import { ShoppingImagePreviewDialog } from '@/components/shopping/ShoppingImagePreviewDialog'
import { ShoppingItemFormDialog } from '@/components/shopping/ShoppingItemFormDialog'
import { ShoppingItemThumbnail } from '@/components/shopping/ShoppingItemThumbnail'
import {
  sxCategoryAddButton,
  sxCategoryChip,
  sxShoppingCategoryChipGrid,
} from '@/components/shopping/shoppingStyles'
import {
  SHOPPING_CATEGORIES,
  getCategoryMeta,
  getStoreLabel,
  type ShoppingCategoryKey,
} from '@/config/shoppingCategories'
import { type ShoppingItem, shoppingItemsKey, useShoppingItems } from '@/hooks/useShoppingItems'
import { formatLastPurchaseDateDisplay } from '@/lib/shoppingDate'
import type { ShoppingItemPayload } from '@/lib/shoppingPayload'
import { matchesAnySearch } from '@/lib/koreanSearch'
import { formatAmountWithPackCount } from '@/lib/shoppingUnitPrice'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import IconButton from '@mui/material/IconButton'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { useMemo, useState } from 'react'
import { useSWRConfig } from 'swr'

const SHOPPING_LIST_THUMB_SIZE = 68

function formatPrice(price: number) {
  return `${price.toLocaleString('ko-KR')}원`
}

function matchesShoppingItem(item: ShoppingItem, query: string) {
  const storeLabel = getStoreLabel(item.storeKey, item.storeCustom)
  return matchesAnySearch([item.brand, item.name, storeLabel, item.amountUnit], query)
}

function ShoppingItemCard({
  item,
  onEdit,
  onImageClick,
}: {
  item: ShoppingItem
  onEdit: (item: ShoppingItem) => void
  onImageClick: (src: string, name: string) => void
}) {
  const categoryMeta = getCategoryMeta(item.category)
  const storeLabel = getStoreLabel(item.storeKey, item.storeCustom)
  const lastPurchaseLabel = formatLastPurchaseDateDisplay(item.lastPurchaseDate)
  const brand = item.brand.trim()
  const name = item.name.trim()
  const packType = item.packType === 'box' ? 'box' : 'piece'
  const packCount = item.packCount ?? 1
  const amountLabel = formatAmountWithPackCount(item.amount, item.amountUnit, packType, packCount)
  const showSecondLine = Boolean(brand || amountLabel)

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
        borderLeftColor: categoryMeta.color,
        cursor: 'pointer',
      }}
    >
      <Stack direction="row" alignItems="center" gap={1.5}>
        {item.imageData ? (
          <ShoppingItemThumbnail
            src={item.imageData}
            size={SHOPPING_LIST_THUMB_SIZE}
            onClick={(e) => {
              e.stopPropagation()
              onImageClick(item.imageData!, item.name)
            }}
          />
        ) : null}
        <Box sx={{ minWidth: 0, flex: 1 }}>
          {name ? (
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
              {name}
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
              {amountLabel ? (
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
                  {amountLabel}
                </Typography>
              ) : null}
            </Stack>
          ) : null}
          <Stack direction="row" flexWrap="wrap" gap={0.5} sx={{ mt: 0.5 }}>
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 700 }}>
              {formatPrice(item.price)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              ·
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {storeLabel}
            </Typography>
            {lastPurchaseLabel ? (
              <>
                <Typography variant="body2" color="text.secondary">
                  ·
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {lastPurchaseLabel}
                </Typography>
              </>
            ) : null}
          </Stack>
        </Box>
      </Stack>
    </Paper>
  )
}

export function ShoppingPageContent() {
  const [category, setCategory] = useState<ShoppingCategoryKey>('snack')
  const [formOpen, setFormOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<ShoppingItem | null>(null)
  const [previewImage, setPreviewImage] = useState<{ src: string; name: string } | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const { mutate: globalMutate } = useSWRConfig()
  const { items, isLoading, mutate } = useShoppingItems(category)
  const filteredItems = useMemo(() => {
    const q = searchQuery.trim()
    if (!q) return items
    return items.filter((item) => matchesShoppingItem(item, q))
  }, [items, searchQuery])

  const openAddDialog = () => {
    setEditingItem(null)
    setFormOpen(true)
  }

  const openEditDialog = (item: ShoppingItem) => {
    setEditingItem(item)
    setFormOpen(true)
  }

  const closeFormDialog = () => {
    setFormOpen(false)
    setEditingItem(null)
  }

  const handleAdd = async (payload: ShoppingItemPayload) => {
    const res = await fetch('/api/shopping-items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.ok) throw new Error('추가 실패')
    const newItem = (await res.json()) as ShoppingItem
    await mutate((prev) => [newItem, ...(prev ?? [])], { revalidate: false })
  }

  const handleUpdate = async (payload: ShoppingItemPayload) => {
    if (!editingItem) return
    const res = await fetch(`/api/shopping-items/${editingItem.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.ok) throw new Error('수정 실패')
    const updated = (await res.json()) as ShoppingItem
    if (updated.category === category) {
      await mutate(
        (prev) => (prev ?? []).map((item) => (item.id === updated.id ? updated : item)),
        { revalidate: false },
      )
    } else {
      await mutate((prev) => (prev ?? []).filter((item) => item.id !== updated.id), { revalidate: false })
      await globalMutate(
        shoppingItemsKey(updated.category),
        (prev) => [updated, ...(prev ?? [])],
        { revalidate: false },
      )
    }
  }

  const handleDelete = async (id: number) => {
    await mutate((prev) => (prev ?? []).filter((item) => item.id !== id), { revalidate: false })
    await fetch(`/api/shopping-items/${id}`, { method: 'DELETE' })
  }

  const handleFormSubmit = async (payload: ShoppingItemPayload) => {
    if (editingItem) {
      await handleUpdate(payload)
    } else {
      await handleAdd(payload)
    }
  }

  const categoryMeta = getCategoryMeta(category)

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
              쇼핑
            </Typography>
            <Tooltip title={`${categoryMeta.label} 추가`}>
              <IconButton
                onClick={openAddDialog}
                aria-label="상품 추가"
                sx={sxCategoryAddButton(category)}
              >
                <AddRoundedIcon />
              </IconButton>
            </Tooltip>
          </Stack>

          <ListSearchField value={searchQuery} onChange={setSearchQuery} />

          <Box sx={sxShoppingCategoryChipGrid}>
            {SHOPPING_CATEGORIES.map((c) => (
              <Box
                key={c.key}
                component="button"
                type="button"
                onClick={() => setCategory(c.key)}
                sx={{
                  ...sxCategoryChip(c.key, category === c.key),
                  fontFamily: 'inherit',
                  width: '100%',
                  textAlign: 'center',
                }}
              >
                {c.label}
              </Box>
            ))}
          </Box>
        </Stack>
      </Box>

      <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', px: 1.5, py: 1.25 }}>
        {isLoading ? (
          <Stack alignItems="center" justifyContent="center" sx={{ py: 6 }}>
            <CircularProgress />
          </Stack>
        ) : items.length === 0 ? (
          <Stack alignItems="center" justifyContent="center" sx={{ py: 6, color: 'text.secondary' }}>
            <Typography sx={{ fontWeight: 600 }}>{categoryMeta.label} 목록이 비어 있습니다</Typography>
            <Typography variant="body2" sx={{ mt: 0.5 }}>
              + 버튼으로 상품을 추가해 보세요
            </Typography>
          </Stack>
        ) : filteredItems.length === 0 ? (
          <Stack alignItems="center" justifyContent="center" sx={{ py: 6, color: 'text.secondary' }}>
            <Typography sx={{ fontWeight: 600 }}>검색 결과가 없습니다</Typography>
            <Typography variant="body2" sx={{ mt: 0.5 }}>
              다른 검색어를 입력해 보세요
            </Typography>
          </Stack>
        ) : (
          <Stack spacing={0.75}>
            {filteredItems.map((item) => (
              <ShoppingItemCard
                key={item.id}
                item={item}
                onEdit={openEditDialog}
                onImageClick={(src, name) => setPreviewImage({ src, name })}
              />
            ))}
          </Stack>
        )}
      </Box>

      <ShoppingItemFormDialog
        open={formOpen}
        category={editingItem?.category ?? category}
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

      <ShoppingImagePreviewDialog
        open={previewImage != null}
        src={previewImage?.src ?? null}
        alt={previewImage?.name}
        onClose={() => setPreviewImage(null)}
      />
    </Box>
  )
}
