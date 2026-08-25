'use client'
// 수정: Auto — 2026-08-25 22:16 (onRename 반환 타입)

import { OrganizeCabinetDialog } from '@/components/organize/OrganizeCabinetDialog'
import { OrganizeCabinetGrid } from '@/components/organize/OrganizeCabinetGrid'
import { OrganizeCellDialog, type OrganizeCellTarget } from '@/components/organize/OrganizeCellDialog'
import { OrganizeRoomToggle } from '@/components/organize/OrganizeRoomToggle'
import { OrganizeRoomsDialog } from '@/components/organize/OrganizeRoomsDialog'
import { OrganizeSlotPreview } from '@/components/organize/OrganizeSlotCell'
import {
  ORGANIZE_ROOM_CACHE_KEY,
  ORGANIZE_ROOM_DEFAULT,
  organizeCellFontSize,
  type OrganizeCabinetConfig,
  type OrganizeRoom,
} from '@/config/organizeCabinets'
import { sxPageStickyHeaderPad } from '@/config/responsiveLayout'
import { useDragScrollLock } from '@/hooks/useDragScrollLock'
import { useOrganizeCabinets } from '@/hooks/useOrganizeCabinets'
import { useOrganizeCells } from '@/hooks/useOrganizeCells'
import { useOrganizeRooms } from '@/hooks/useOrganizeRooms'
import { parseOrganizeCellDnDId, sameOrganizeCell } from '@/lib/organizeDnD'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import {
  DndContext,
  DragOverlay,
  MouseSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useCallback, useEffect, useRef, useState } from 'react'

function readSavedRoom(fallback: OrganizeRoom, validKeys: string[]): OrganizeRoom {
  try {
    const saved = window.localStorage.getItem(ORGANIZE_ROOM_CACHE_KEY)
    if (saved && validKeys.includes(saved)) return saved
  } catch {
    /* ignore */
  }
  return fallback
}

export function OrganizePageContent() {
  const {
    rooms,
    defaultRoom,
    isLoading: roomsLoading,
    error: roomsError,
    addRoom,
    renameRoom,
    reorderRooms,
    deleteRoom,
  } = useOrganizeRooms()
  const [room, setRoom] = useState<OrganizeRoom>(ORGANIZE_ROOM_DEFAULT)
  const {
    cabinets,
    allCabinets,
    isLoading: cabinetsLoading,
    error: cabinetsError,
    saveCabinet,
    addCabinet,
    deleteCabinet,
    mutate: mutateCabinets,
  } = useOrganizeCabinets(room)
  const {
    isLoading: cellsLoading,
    error: cellsError,
    getContent,
    saveCell,
    swapCells,
    mutate: mutateCells,
  } = useOrganizeCells()

  const [editing, setEditing] = useState<OrganizeCellTarget | null>(null)
  const [cabinetDialog, setCabinetDialog] = useState<{
    mode: 'create' | 'edit'
    cabinet: OrganizeCabinetConfig | null
  } | null>(null)
  const [roomsDialogOpen, setRoomsDialogOpen] = useState(false)
  const [dragging, setDragging] = useState<{ content: string; fontSize: string } | null>(null)
  const suppressClickRef = useRef(false)
  const roomReadyRef = useRef(false)

  const sensors = useSensors(
    useSensor(TouchSensor, {
      activationConstraint: { delay: 280, tolerance: 8 },
    }),
    useSensor(MouseSensor, {
      activationConstraint: { distance: 6 },
    }),
  )

  useDragScrollLock(dragging !== null)

  useEffect(() => {
    if (roomsLoading || rooms.length === 0) return
    const keys = rooms.map((row) => row.key)
    if (!roomReadyRef.current) {
      roomReadyRef.current = true
      setRoom(readSavedRoom(defaultRoom, keys))
      return
    }
    if (!keys.includes(room)) {
      setRoom(defaultRoom)
    }
  }, [rooms, roomsLoading, defaultRoom, room])

  const changeRoom = useCallback((next: OrganizeRoom) => {
    setRoom(next)
    try {
      window.localStorage.setItem(ORGANIZE_ROOM_CACHE_KEY, next)
    } catch {
      /* ignore */
    }
  }, [])

  const isLoading = roomsLoading || cabinetsLoading || cellsLoading
  const error = roomsError || cabinetsError || cellsError

  const openCell = (cabinet: OrganizeCabinetConfig, rowIndex: number, colIndex: number) => {
    setEditing({
      cabinet,
      rowIndex,
      colIndex,
      content: getContent(room, cabinet.key, rowIndex, colIndex),
    })
  }

  const handleDragStart = (event: DragStartEvent) => {
    suppressClickRef.current = true
    const ref = parseOrganizeCellDnDId(event.active.id, allCabinets)
    if (!ref) return
    const cabinet = allCabinets.find((row) => row.key === ref.cabinetKey)
    if (!cabinet) return
    setDragging({
      content: getContent(ref.room, ref.cabinetKey, ref.rowIndex, ref.colIndex),
      fontSize: organizeCellFontSize(cabinet),
    })
  }

  const resetDrag = () => {
    setDragging(null)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    resetDrag()
    window.setTimeout(() => {
      suppressClickRef.current = false
    }, 0)

    if (!over) return
    const from = parseOrganizeCellDnDId(active.id, allCabinets)
    const to = parseOrganizeCellDnDId(over.id, allCabinets)
    if (!from || !to || sameOrganizeCell(from, to)) return

    try {
      await swapCells(from, to)
    } catch (swapError) {
      console.error('[organize swap]', swapError)
    }
  }

  const body = !isLoading && error ? (
    <Stack alignItems="center" justifyContent="center" sx={{ flex: 1, px: 2 }}>
      <Typography color="error" fontSize="0.85rem" fontWeight={700}>
        수납 목록을 불러오지 못했습니다.
      </Typography>
    </Stack>
  ) : isLoading ? (
    <Stack alignItems="center" justifyContent="center" sx={{ flex: 1, py: 8 }}>
      <CircularProgress size={28} />
    </Stack>
  ) : (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragCancel={() => {
        resetDrag()
        window.setTimeout(() => {
          suppressClickRef.current = false
        }, 0)
      }}
      onDragEnd={(event) => void handleDragEnd(event)}
    >
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          minWidth: 0,
          overflowY: dragging ? 'hidden' : 'auto',
          overflowX: 'hidden',
          WebkitOverflowScrolling: 'touch',
          display: 'flex',
          flexDirection: 'column',
          alignContent: 'start',
          gap: '1px',
          bgcolor: 'divider',
          touchAction: dragging ? 'none' : undefined,
        }}
      >
        {cabinets.length === 0 ? (
          <Stack alignItems="center" justifyContent="center" sx={{ flex: 1, px: 2, py: 6, bgcolor: 'background.paper' }}>
            <Typography color="text.secondary" fontSize="0.85rem" fontWeight={700}>
              수납장이 없습니다. 아래에서 추가해 보세요.
            </Typography>
          </Stack>
        ) : (
          cabinets.map((cabinet) => (
            <OrganizeCabinetGrid
              key={cabinet.key}
              room={room}
              cabinet={cabinet}
              getContent={(rowIndex, colIndex) => getContent(room, cabinet.key, rowIndex, colIndex)}
              onCellClick={(rowIndex, colIndex) => openCell(cabinet, rowIndex, colIndex)}
              onEditClick={() => setCabinetDialog({ mode: 'edit', cabinet })}
              dragActive={dragging !== null}
              suppressClickRef={suppressClickRef}
            />
          ))
        )}

        <Box sx={{ bgcolor: 'background.paper', px: 1, py: 1 }}>
          <Button
            fullWidth
            size="small"
            variant="outlined"
            startIcon={<AddRoundedIcon />}
            onClick={() => setCabinetDialog({ mode: 'create', cabinet: null })}
            sx={{ fontWeight: 800 }}
          >
            수납장 추가
          </Button>
        </Box>
      </Box>
      <DragOverlay dropAnimation={null} zIndex={1500}>
        {dragging ? <OrganizeSlotPreview content={dragging.content} fontSize={dragging.fontSize} /> : null}
      </DragOverlay>
    </DndContext>
  )

  return (
    <Box
      sx={{
        flex: 1,
        minHeight: 0,
        minWidth: 0,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <Box sx={sxPageStickyHeaderPad}>
        <Stack direction="row" alignItems="center" spacing={0.75} minWidth={0}>
          <OrganizeRoomToggle
            rooms={rooms}
            value={room}
            onChange={changeRoom}
            onEditClick={() => setRoomsDialogOpen(true)}
          />
        </Stack>
      </Box>

      {body}

      <OrganizeCellDialog
        open={editing !== null}
        target={editing}
        onClose={() => setEditing(null)}
        onSubmit={async (content) => {
          if (!editing) return
          await saveCell({
            room,
            cabinetKey: editing.cabinet.key,
            rowIndex: editing.rowIndex,
            colIndex: editing.colIndex,
            content,
          })
          setEditing(null)
        }}
      />

      <OrganizeCabinetDialog
        open={cabinetDialog !== null}
        mode={cabinetDialog?.mode ?? 'create'}
        cabinet={cabinetDialog?.cabinet ?? null}
        onClose={() => setCabinetDialog(null)}
        onSubmit={async (payload) => {
          if (cabinetDialog?.mode === 'edit' && 'key' in payload) {
            await saveCabinet(payload)
          } else if (!('key' in payload)) {
            await addCabinet(payload)
          }
          setCabinetDialog(null)
        }}
        onDelete={
          cabinetDialog?.mode === 'edit' && cabinetDialog.cabinet
            ? async () => {
                await deleteCabinet(cabinetDialog.cabinet!.key)
                await mutateCells()
                setCabinetDialog(null)
              }
            : undefined
        }
      />

      <OrganizeRoomsDialog
        open={roomsDialogOpen}
        rooms={rooms}
        onClose={() => setRoomsDialogOpen(false)}
        onSaveOrder={async (keys) => {
          await reorderRooms(keys)
        }}
        onAdd={async (label) => {
          const created = await addRoom(label)
          changeRoom(created.key)
        }}
        onRename={async (key, label) => {
          await renameRoom(key, label)
        }}
        onDelete={async (key) => {
          await deleteRoom(key)
          await mutateCabinets()
          await mutateCells()
          if (room === key) {
            const next = rooms.find((row) => row.key !== key)?.key ?? defaultRoom
            changeRoom(next)
          }
        }}
      />
    </Box>
  )
}
