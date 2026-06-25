// 수정: Auto — 2026-06-11 (상시·수시·소장)

import { and, desc, eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'

import {
  isValidCollectionPair,
  isValidFoodScope,
  type CollectionMainKey,
  type FoodScopeKey,
} from '@/config/collectionCategories'
import { db } from '@/lib/db'
import { loadSubEntries } from '@/lib/collectionSubcategoryStore'
import { collectionOptionDataForDb, parseCollectionItemPayloadAsync } from '@/lib/collectionPayload'
import { toCollectionItemDto } from '@/lib/collectionItem'
import { ensureCollectionSchema } from '@/lib/collectionSchema'
import { collectionItems } from '@/lib/schema'

export async function GET(request: Request) {
  await ensureCollectionSchema()
  const { searchParams } = new URL(request.url)
  const scope = searchParams.get('scope')

  if (scope === 'all') {
    const rows = await db
      .select()
      .from(collectionItems)
      .orderBy(desc(collectionItems.purchaseDate), desc(collectionItems.createdAt))
    return NextResponse.json(rows.map(toCollectionItemDto))
  }

  if (scope === 'food-regular') {
    const rows = await db
      .select()
      .from(collectionItems)
      .where(and(eq(collectionItems.mainCategory, 'food'), eq(collectionItems.foodScope, 'regular')))
      .orderBy(desc(collectionItems.purchaseDate), desc(collectionItems.createdAt))
    return NextResponse.json(rows.map(toCollectionItemDto))
  }

  const main = searchParams.get('main')
  const sub = searchParams.get('sub')
  const foodScopeParam = searchParams.get('foodScope')

  if (!main || !sub) {
    return NextResponse.json({ message: 'main and sub required' }, { status: 400 })
  }
  const subs = await loadSubEntries(main as CollectionMainKey)
  if (!isValidCollectionPair(main, sub, subs)) {
    return NextResponse.json({ message: 'invalid category' }, { status: 400 })
  }

  const filters = [eq(collectionItems.mainCategory, main), eq(collectionItems.subCategory, sub)]
  if (main === 'food') {
    if (!foodScopeParam || !isValidFoodScope(foodScopeParam)) {
      return NextResponse.json({ message: 'foodScope required for food' }, { status: 400 })
    }
    filters.push(eq(collectionItems.foodScope, foodScopeParam as FoodScopeKey))
  }

  const rows = await db
    .select()
    .from(collectionItems)
    .where(and(...filters))
    .orderBy(desc(collectionItems.purchaseDate), desc(collectionItems.createdAt))

  return NextResponse.json(rows.map(toCollectionItemDto))
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>
    const payload = await parseCollectionItemPayloadAsync(body)
    if (!payload) {
      return NextResponse.json({ message: 'invalid request' }, { status: 400 })
    }

    await ensureCollectionSchema()
    const rows = await db
      .insert(collectionItems)
      .values({
        mainCategory: payload.mainCategory,
        subCategory: payload.subCategory,
        brand: payload.brand,
        name: payload.name,
        nameSuffix: payload.nameSuffix,
        model: payload.model,
        size: payload.size,
        description: payload.description,
        purchasePrice: payload.purchasePrice,
        storeKey: payload.storeKey,
        storeCustom: payload.storeCustom,
        purchaseDate: payload.purchaseDate,
        amount: payload.amount,
        amountUnit: payload.amountUnit,
        packType: payload.packType,
        packCount: payload.packCount,
        unitsPerPack: payload.unitsPerPack,
        optionType: payload.optionType,
        optionData: collectionOptionDataForDb(payload.optionData),
        imageData: payload.imageData,
        repurchaseDays: payload.repurchaseDays,
        repurchaseActive: payload.repurchaseActive ? 1 : 0,
        foodScope: payload.foodScope,
        hidden: payload.hidden ? 1 : 0,
        createdAt: new Date().toISOString(),
      })
      .returning()

    if (!rows[0]) {
      return NextResponse.json({ message: 'insert failed' }, { status: 500 })
    }

    return NextResponse.json(toCollectionItemDto(rows[0]))
  } catch (error) {
    console.error('[collection-items POST]', error)
    return NextResponse.json({ message: 'server error' }, { status: 500 })
  }
}
