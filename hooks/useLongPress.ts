'use client'
// 수정: Auto — 2026-06-05

import { useCallback, useRef } from 'react'

type Options = {
  delayMs?: number
  onLongPress: () => void
}

export function useLongPress({ delayMs = 500, onLongPress }: Options) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const firedRef = useRef(false)

  const clear = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const pointerHandlers = {
    onPointerDown: (e: React.PointerEvent) => {
      if (e.button !== 0) return
      firedRef.current = false
      clear()
      timerRef.current = setTimeout(() => {
        firedRef.current = true
        onLongPress()
      }, delayMs)
    },
    onPointerUp: clear,
    onPointerLeave: clear,
    onPointerCancel: clear,
  }

  const wrapClick = (normalClick: () => void) => (e: React.MouseEvent) => {
    if (firedRef.current) {
      firedRef.current = false
      e.preventDefault()
      return
    }
    normalClick()
  }

  return { pointerHandlers, wrapClick, clear }
}
