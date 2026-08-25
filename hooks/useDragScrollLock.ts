'use client'
// 수정: Auto — 2026-08-24 23:25 (드래그 중 스크롤 잠금)

import { useLayoutEffect } from 'react'

export function useDragScrollLock(active: boolean) {
  useLayoutEffect(() => {
    if (!active) return

    const { body, documentElement: root } = document
    const prevBodyOverflow = body.style.overflow
    const prevBodyTouchAction = body.style.touchAction
    const prevRootTouchAction = root.style.touchAction

    body.style.overflow = 'hidden'
    body.style.touchAction = 'none'
    root.style.touchAction = 'none'

    return () => {
      body.style.overflow = prevBodyOverflow
      body.style.touchAction = prevBodyTouchAction
      root.style.touchAction = prevRootTouchAction
    }
  }, [active])
}
