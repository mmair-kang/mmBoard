'use client'
// 수정: Auto — 2026-06-11

import { useCallback, useRef } from 'react'

type DragState = {
  active: boolean
  startX: number
  scrollLeft: number
}

export function useHorizontalDragScroll<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const dragRef = useRef<DragState>({ active: false, startX: 0, scrollLeft: 0 })

  const endDrag = useCallback((pointerId: number) => {
    const el = ref.current
    dragRef.current.active = false
    if (!el) return
    if (el.hasPointerCapture(pointerId)) {
      el.releasePointerCapture(pointerId)
    }
    el.style.cursor = ''
    el.style.userSelect = ''
  }, [])

  const onPointerDown = useCallback((event: React.PointerEvent<T>) => {
    if (event.pointerType !== 'mouse' || event.button !== 0) return
    const el = ref.current
    if (!el) return

    dragRef.current = {
      active: true,
      startX: event.clientX,
      scrollLeft: el.scrollLeft,
    }
    el.setPointerCapture(event.pointerId)
    el.style.cursor = 'grabbing'
    el.style.userSelect = 'none'
  }, [])

  const onPointerMove = useCallback((event: React.PointerEvent<T>) => {
    if (!dragRef.current.active || event.pointerType !== 'mouse') return
    const el = ref.current
    if (!el) return

    const delta = event.clientX - dragRef.current.startX
    el.scrollLeft = dragRef.current.scrollLeft - delta
  }, [])

  const onPointerUp = useCallback(
    (event: React.PointerEvent<T>) => {
      if (event.pointerType !== 'mouse') return
      endDrag(event.pointerId)
    },
    [endDrag],
  )

  const onWheel = useCallback((event: React.WheelEvent<T>) => {
    const el = ref.current
    if (!el || event.deltaY === 0) return
    if (el.scrollWidth <= el.clientWidth) return
    event.preventDefault()
    el.scrollLeft += event.deltaY
  }, [])

  return {
    ref,
    dragScrollProps: {
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onWheel,
    },
  }
}
