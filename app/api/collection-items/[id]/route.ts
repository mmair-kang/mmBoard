// 수정: Auto — 2026-06-05

import { eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'

import { db } from '@/lib/db'
import { collectionOptionDataForDb, parseCollectionItemPayload } from '@/lib/collectionPayload'
import { toCollectionItemDto } from '@/lib/collectionItem'
import { ensureCollectionSchema } from '@/lib/collectionSchema'
import { collectionItems } from '@/lib/schema'

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const itemId = Number(id)
    if (!Number.isFinite(itemId)) {
      return NextResponse.json({ message: 'invalid id' }, { status: 400 })
    }

    const body = (await request.json()) as Record<string, unknown>
    const payload = parseCollectionItemPayload(body)
    if (!payload) {
      return NextResponse.json({ message: 'invalid request' }, { status: 400 })
    }

    await ensureCollectionSchema()
    const rows = await db
      .update(collectionItems)
      .set({
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
      })
      .where(eq(collectionItems.id, itemId))
      .returning()

    if (rows.length === 0) {
      return NextResponse.json({ message: 'not found' }, { status: 404 })
    }

    return NextResponse.json(toCollectionItemDto(rows[0]))
  } catch (error) {
    console.error('[collection-items PATCH]', error)
    return NextResponse.json({ message: 'server error' }, { status: 500 })
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const itemId = Number(id)
  if (!Number.isFinite(itemId)) {
    return NextResponse.json({ message: 'invalid id' }, { status: 400 })
  }

  await ensureCollectionSchema()
  await db.delete(collectionItems).where(eq(collectionItems.id, itemId))
  return NextResponse.json({ ok: true })
}
