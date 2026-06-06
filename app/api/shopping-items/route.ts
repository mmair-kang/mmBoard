// 수정: Auto — 2026-06-05
import { desc, eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'

import { SHOPPING_CATEGORIES } from '@/config/shoppingCategories'
import { db } from '@/lib/db'
import { parseShoppingItemPayload } from '@/lib/shoppingPayload'
import { shoppingItems } from '@/lib/schema'
import { ensureShoppingSchema } from '@/lib/shoppingSchema'

const categoryKeys = new Set<string>(SHOPPING_CATEGORIES.map((c) => c.key))

export async function GET(request: Request) {
  await ensureShoppingSchema()
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')

  if (category && !categoryKeys.has(category)) {
    return NextResponse.json({ message: 'invalid category' }, { status: 400 })
  }

  const rows = category
    ? await db
        .select()
        .from(shoppingItems)
        .where(eq(shoppingItems.category, category))
        .orderBy(desc(shoppingItems.createdAt))
    : await db.select().from(shoppingItems).orderBy(desc(shoppingItems.createdAt))

  return NextResponse.json(rows)
}

export async function POST(request: Request) {
  const body = (await request.json()) as Record<string, unknown>
  const payload = parseShoppingItemPayload(body)
  if (!payload) {
    return NextResponse.json({ message: 'invalid request' }, { status: 400 })
  }

  await ensureShoppingSchema()
  const rows = await db
    .insert(shoppingItems)
    .values({
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
      createdAt: new Date().toISOString(),
    })
    .returning()

  return NextResponse.json(rows[0])
}
