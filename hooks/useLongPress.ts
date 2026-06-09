'use client'
// 수정: Auto — 2026-06-08

import { useCallback, useRef } from 'react'

const DEFAULT_DELAY_MS = 500
const MOVE_TOLERANCE_PX = 10

type Options = {
  onLongPress: () => void
  delayMs?: number
}

function resolveOptions(input: Options | (() => void)): Options {
  if (typeof input === 'function') return { onLongPress: input }
  return input
}

export function useLongPress(input: Options | (() => void)) {
  const { onLongPress, delayMs = DEFAULT_DELAY_MS } = resolveOptions(input)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const startPointRef = useRef<{ x: number; y: number } | null>(null)
  const triggeredRef = useRef(false)

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const wasTriggered = useCallback(() => triggeredRef.current, [])

  const reset = useCallback(() => {
    clearTimer()
    startPointRef.current = null
    window.setTimeout(() => {
      triggeredRef.current = false
    }, 0)
  }, [clearTimer])

  const pointerHandlers = {
    onPointerDown: (event: React.PointerEvent) => {
      if (event.pointerType === 'mouse' && event.button !== 0) return
      triggeredRef.current = false
      startPointRef.current = { x: event.clientX, y: event.clientY }
      clearTimer()
      timerRef.current = setTimeout(() => {
        triggeredRef.current = true
        onLongPress()
      }, delayMs)
    },
    onPointerMove: (event: React.PointerEvent) => {
      const start = startPointRef.current
      if (!start || !timerRef.current) return
      const dx = Math.abs(event.clientX - start.x)
      const dy = Math.abs(event.clientY - start.y)
      if (dx > MOVE_TOLERANCE_PX || dy > MOVE_TOLERANCE_PX) {
        clearTimer()
      }
    },
    onPointerUp: () => {
      clearTimer()
      startPointRef.current = null
    },
    onPointerLeave: () => {
      clearTimer()
      startPointRef.current = null
    },
    onPointerCancel: () => {
      clearTimer()
      startPointRef.current = null
    },
    onContextMenu: (event: React.MouseEvent) => {
      event.preventDefault()
      triggeredRef.current = true
      onLongPress()
    },
  }

  const wrapClick = useCallback(
    (onClick: () => void) => () => {
      if (wasTriggered()) {
        reset()
        return
      }
      onClick()
    },
    [reset, wasTriggered],
  )

  return {
    pointerHandlers,
    bind: pointerHandlers,
    wasTriggered,
    reset,
    wrapClick,
  }
}
