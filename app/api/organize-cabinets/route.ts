// 수정: Auto — 2026-08-25 00:50 (수납장 설정 API)

import { NextResponse } from 'next/server'

import { isOrganizeRoom } from '@/config/organizeCabinets'
import { parseOrganizeCabinetWritePayload } from '@/lib/organizeCabinetPayload'
import {
  createOrganizeCabinet,
  deleteOrganizeCabinet,
  listOrganizeCabinets,
  updateOrganizeCabinet,
} from '@/lib/organizeCabinetQuery'
import { ensureOrganizeSchema } from '@/lib/organizeSchema'

export async function GET() {
  try {
    await ensureOrganizeSchema()
    const rows = await listOrganizeCabinets()
    return NextResponse.json(rows)
  } catch (error) {
    console.error('[organize-cabinets GET]', error)
    return NextResponse.json({ message: 'server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>
    const room = typeof body.room === 'string' ? body.room.trim() : ''
    if (!isOrganizeRoom(room)) {
      return NextResponse.json({ message: 'invalid request' }, { status: 400 })
    }
    const payload = parseOrganizeCabinetWritePayload(body)
    if (!payload) {
      return NextResponse.json({ message: 'invalid request' }, { status: 400 })
    }
    await ensureOrganizeSchema()
    const row = await createOrganizeCabinet(room, payload)
    if (!row) {
      return NextResponse.json({ message: 'not found' }, { status: 404 })
    }
    return NextResponse.json(row)
  } catch (error) {
    console.error('[organize-cabinets POST]', error)
    return NextResponse.json({ message: 'server error' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>
    const key = typeof body.key === 'string' ? body.key.trim() : ''
    if (!key) {
      return NextResponse.json({ message: 'invalid request' }, { status: 400 })
    }

    const payload = parseOrganizeCabinetWritePayload(body)
    if (!payload) {
      return NextResponse.json({ message: 'invalid request' }, { status: 400 })
    }

    await ensureOrganizeSchema()
    const row = await updateOrganizeCabinet(key, payload)
    if (!row) {
      return NextResponse.json({ message: 'not found' }, { status: 404 })
    }

    return NextResponse.json(row)
  } catch (error) {
    console.error('[organize-cabinets PATCH]', error)
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
    const ok = await deleteOrganizeCabinet(key)
    if (!ok) {
      return NextResponse.json({ message: 'not found' }, { status: 404 })
    }
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[organize-cabinets DELETE]', error)
    return NextResponse.json({ message: 'server error' }, { status: 500 })
  }
}
