// 수정: Auto — 2026-06-05
import { eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'

import { db } from '@/lib/db'
import { parseShoppingItemPayload } from '@/lib/shoppingPayload'
import { shoppingItems } from '@/lib/schema'
import { ensureShoppingSchema } from '@/lib/shoppingSchema'

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const itemId = Number(id)
  if (!Number.isFinite(itemId)) {
    return NextResponse.json({ message: 'invalid id' }, { status: 400 })
  }

  const body = (await request.json()) as Record<string, unknown>
  const payload = parseShoppingItemPayload(body)
  if (!payload) {
    return NextResponse.json({ message: 'invalid request' }, { status: 400 })
  }

  await ensureShoppingSchema()
  const rows = await db
    .update(shoppingItems)
    .set({
      category: payload.category,
      brand: payload.brand,
      name: payload.name,
      price: payload.price,
      amount: payload.amount,
      amountUnit: payload.amountUnit,
      packType: payload.packType,
      packCount: payload.packCount,
      unitsPerPack: payload.unitsPerPack,
      storeKey: payload.storeKey,
      storeCustom: payload.storeCustom,
      lastPurchaseDate: payload.lastPurchaseDate,
      imageData: payload.imageData,
    })
    .where(eq(shoppingItems.id, itemId))
    .returning()

  if (rows.length === 0) {
    return NextResponse.json({ message: 'not found' }, { status: 404 })
  }

  return NextResponse.json(rows[0])
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const itemId = Number(id)
  if (!Number.isFinite(itemId)) {
    return NextResponse.json({ message: 'invalid id' }, { status: 400 })
  }

  await ensureShoppingSchema()
  await db.delete(shoppingItems).where(eq(shoppingItems.id, itemId))
  return NextResponse.json({ ok: true })
}
