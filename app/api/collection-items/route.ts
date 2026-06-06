// 수정: Auto — 2026-06-05 (전체 검색)

import { and, desc, eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'

import { isValidCollectionPair } from '@/config/collectionCategories'
import { db } from '@/lib/db'
import { collectionOptionDataForDb, parseCollectionItemPayload } from '@/lib/collectionPayload'
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

  const main = searchParams.get('main')
  const sub = searchParams.get('sub')

  if (!main || !sub) {
    return NextResponse.json({ message: 'main and sub required' }, { status: 400 })
  }
  if (!isValidCollectionPair(main, sub)) {
    return NextResponse.json({ message: 'invalid category' }, { status: 400 })
  }

  const rows = await db
    .select()
    .from(collectionItems)
    .where(and(eq(collectionItems.mainCategory, main), eq(collectionItems.subCategory, sub)))
    .orderBy(desc(collectionItems.purchaseDate), desc(collectionItems.createdAt))

  return NextResponse.json(rows.map(toCollectionItemDto))
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>
    const payload = parseCollectionItemPayload(body)
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
