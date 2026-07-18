// 수정: Auto — 2026-07-19 01:40 (이름 중복 409)
import { NextResponse } from 'next/server'

import {
  isValidCollectionPair,
  isValidFoodScope,
  type CollectionSubKey,
  type FoodScopeKey,
} from '@/config/collectionCategories'
import { parseCollectionProductPayloadAsync } from '@/lib/collectionProductPayload'
import {
  createProduct,
  DuplicateProductNameError,
  listAllFoodProducts,
  listProducts,
} from '@/lib/collectionProductQuery'
import { ensureCollectionSchema } from '@/lib/collectionSchema'
import { loadSubEntries } from '@/lib/collectionSubcategoryStore'

export async function GET(request: Request) {
  await ensureCollectionSchema()
  const { searchParams } = new URL(request.url)
  const scope = searchParams.get('scope')

  if (scope === 'all') {
    return NextResponse.json(await listAllFoodProducts())
  }

  const sub = searchParams.get('sub')
  const foodScopeParam = searchParams.get('foodScope')
  if (!sub || !foodScopeParam || !isValidFoodScope(foodScopeParam)) {
    return NextResponse.json({ message: 'sub and foodScope required' }, { status: 400 })
  }

  const subs = await loadSubEntries('food')
  if (!isValidCollectionPair('food', sub, subs)) {
    return NextResponse.json({ message: 'invalid category' }, { status: 400 })
  }

  return NextResponse.json(
    await listProducts({
      sub: sub as CollectionSubKey,
      foodScope: foodScopeParam as FoodScopeKey,
    }),
  )
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>
    const payload = await parseCollectionProductPayloadAsync(body)
    if (!payload) {
      return NextResponse.json({ message: 'invalid request' }, { status: 400 })
    }

    await ensureCollectionSchema()
    const product = await createProduct(payload)
    return NextResponse.json(product)
  } catch (error) {
    if (error instanceof DuplicateProductNameError) {
      return NextResponse.json({ message: error.message }, { status: 409 })
    }
    console.error('[collection-products POST]', error)
    return NextResponse.json({ message: 'server error' }, { status: 500 })
  }
}
