// 수정: Auto — 2026-07-19 01:40 (이름 중복 409)
import { NextResponse } from 'next/server'

import { parseCollectionProductPayloadAsync } from '@/lib/collectionProductPayload'
import {
  deleteProduct,
  DuplicateProductNameError,
  loadProductDto,
  updateProduct,
} from '@/lib/collectionProductQuery'
import { ensureCollectionSchema } from '@/lib/collectionSchema'

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const productId = Number(id)
  if (!Number.isFinite(productId)) {
    return NextResponse.json({ message: 'invalid id' }, { status: 400 })
  }

  await ensureCollectionSchema()
  const product = await loadProductDto(productId)
  if (!product) {
    return NextResponse.json({ message: 'not found' }, { status: 404 })
  }
  return NextResponse.json(product)
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const productId = Number(id)
    if (!Number.isFinite(productId)) {
      return NextResponse.json({ message: 'invalid id' }, { status: 400 })
    }

    const body = (await request.json()) as Record<string, unknown>
    const payload = await parseCollectionProductPayloadAsync(body)
    if (!payload) {
      return NextResponse.json({ message: 'invalid request' }, { status: 400 })
    }

    await ensureCollectionSchema()
    const product = await updateProduct(productId, payload)
    if (!product) {
      return NextResponse.json({ message: 'not found' }, { status: 404 })
    }
    return NextResponse.json(product)
  } catch (error) {
    if (error instanceof DuplicateProductNameError) {
      return NextResponse.json({ message: error.message }, { status: 409 })
    }
    console.error('[collection-products PATCH]', error)
    return NextResponse.json({ message: 'server error' }, { status: 500 })
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const productId = Number(id)
  if (!Number.isFinite(productId)) {
    return NextResponse.json({ message: 'invalid id' }, { status: 400 })
  }

  await ensureCollectionSchema()
  const ok = await deleteProduct(productId)
  if (!ok) {
    return NextResponse.json({ message: 'not found' }, { status: 404 })
  }
  return NextResponse.json({ ok: true })
}
