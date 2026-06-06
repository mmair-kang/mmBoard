'use client'
// 수정: Auto — 2026-06-05

import { AppDialog } from '@/components/common/AppDialog'
import DialogContent from '@mui/material/DialogContent'

type Props = {
  open: boolean
  src: string | null
  alt?: string
  onClose: () => void
}

export function ShoppingImagePreviewDialog({ open, src, alt = '상품 이미지', onClose }: Props) {
  if (!src) return null

  return (
    <AppDialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      disableAutoFocus
      slotProps={{
        paper: {
          sx: {
            m: 1.5,
            maxWidth: 'min(100%, 480px)',
            bgcolor: 'background.paper',
            borderRadius: 2,
            overflow: 'hidden',
          },
        },
      }}
    >
      <DialogContent
        sx={{
          p: 0,
          lineHeight: 0,
          '&:last-child': { pb: 0 },
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          style={{
            display: 'block',
            width: '100%',
            maxHeight: 'min(85dvh, 720px)',
            objectFit: 'contain',
          }}
        />
      </DialogContent>
    </AppDialog>
  )
}
