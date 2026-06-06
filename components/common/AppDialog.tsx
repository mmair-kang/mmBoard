'use client'

import { APP_DIALOG_TRANSITION_MS } from '@/config/dialogMotion'
import Dialog, { type DialogProps } from '@mui/material/Dialog'
import Grow from '@mui/material/Grow'

export function AppDialog({ transitionDuration = APP_DIALOG_TRANSITION_MS, slots, slotProps, ...rest }: DialogProps) {
  return (
    <Dialog
      slots={{
        ...slots,
        transition: slots?.transition ?? Grow,
      }}
      slotProps={{
        ...slotProps,
        transition: {
          timeout: transitionDuration,
          ...(typeof slotProps?.transition === 'object' && slotProps.transition !== null
            ? slotProps.transition
            : {}),
        },
      }}
      transitionDuration={transitionDuration}
      {...rest}
    />
  )
}
