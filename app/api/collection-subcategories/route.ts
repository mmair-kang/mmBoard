// 수정: Auto — 2026-06-05

import { NextResponse } from 'next/server'

import { COLLECTION_MAIN_CATEGORIES, type CollectionMainKey } from '@/config/collectionCategories'
import {
  loadSubEntries,
  saveSubEntries,
  type SubcategorySaveRow,
} from '@/lib/collectionSubcategoryStore'

const mainKeys = new Set<string>(COLLECTION_MAIN_CATEGORIES.map((c) => c.key))

function parseMain(raw: string | null): CollectionMainKey | null {
  if (!raw || !mainKeys.has(raw)) return null
  return raw as CollectionMainKey
}

export async function GET(request: Request) {
  const main = parseMain(new URL(request.url).searchParams.get('main'))
  if (!main) {
    return NextResponse.json({ message: 'invalid main' }, { status: 400 })
  }

  const subs = await loadSubEntries(main)
  return NextResponse.json({ main, subs })
}

export async function PUT(request: Request) {
  const body = (await request.json()) as { main?: string; subs?: SubcategorySaveRow[] }
  const main = parseMain(body.main ?? null)
  if (!main || !Array.isArray(body.subs)) {
    return NextResponse.json({ message: 'invalid request' }, { status: 400 })
  }

  const { entries, error } = await saveSubEntries(main, body.subs)
  if (error) {
    return NextResponse.json({ message: error }, { status: 400 })
  }

  return NextResponse.json({ main, subs: entries })
}
