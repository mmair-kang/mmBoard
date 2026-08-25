// 수정: Auto — 2026-08-25 00:50 (방 API)

import { NextResponse } from 'next/server'

import { parseOrganizeRoomLabel, parseOrganizeRoomOrder } from '@/lib/organizeRoomPayload'
import {
  createOrganizeRoom,
  deleteOrganizeRoom,
  listOrganizeRooms,
  reorderOrganizeRooms,
  updateOrganizeRoom,
} from '@/lib/organizeRoomQuery'
import { ensureOrganizeSchema } from '@/lib/organizeSchema'

export async function GET() {
  try {
    await ensureOrganizeSchema()
    const rows = await listOrganizeRooms()
    return NextResponse.json(rows)
  } catch (error) {
    console.error('[organize-rooms GET]', error)
    return NextResponse.json({ message: 'server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>
    const label = parseOrganizeRoomLabel(body.label)
    if (!label) {
      return NextResponse.json({ message: 'invalid request' }, { status: 400 })
    }
    await ensureOrganizeSchema()
    const row = await createOrganizeRoom(label)
    return NextResponse.json(row)
  } catch (error) {
    console.error('[organize-rooms POST]', error)
    return NextResponse.json({ message: 'server error' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>
    await ensureOrganizeSchema()

    if (Array.isArray(body.keys)) {
      const keys = parseOrganizeRoomOrder(body)
      if (!keys) {
        return NextResponse.json({ message: 'invalid request' }, { status: 400 })
      }
      try {
        const rows = await reorderOrganizeRooms(keys)
        return NextResponse.json(rows)
      } catch {
        return NextResponse.json({ message: 'invalid request' }, { status: 400 })
      }
    }

    const key = typeof body.key === 'string' ? body.key.trim() : ''
    const label = parseOrganizeRoomLabel(body.label)
    if (!key || !label) {
      return NextResponse.json({ message: 'invalid request' }, { status: 400 })
    }
    const row = await updateOrganizeRoom(key, label)
    if (!row) {
      return NextResponse.json({ message: 'not found' }, { status: 404 })
    }
    return NextResponse.json(row)
  } catch (error) {
    console.error('[organize-rooms PATCH]', error)
    return NextResponse.json({ message: 'server error' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>
    const key = typeof body.key === 'string' ? body.key.trim() : ''
    if (!key) {
      return NextResponse.json({ message: 'invalid request' }, { status: 400 })
    }
    await ensureOrganizeSchema()
    const ok = await deleteOrganizeRoom(key)
    if (!ok) {
      return NextResponse.json({ message: 'cannot delete' }, { status: 400 })
    }
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[organize-rooms DELETE]', error)
    return NextResponse.json({ message: 'server error' }, { status: 500 })
  }
}
