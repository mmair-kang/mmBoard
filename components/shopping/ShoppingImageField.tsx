'use client'
// 수정: Auto — 2026-06-05

import {
  clipboardEventToOptimizedDataUrl,
  fileToOptimizedDataUrl,
  shouldHandleImagePaste,
} from '@/lib/shoppingImage'
import AddPhotoAlternateOutlinedIcon from '@mui/icons-material/AddPhotoAlternateOutlined'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { alpha } from '@mui/material/styles'
import { useEffect, useRef, useState } from 'react'

type Props = {
  value: string | null
  onChange: (dataUrl: string | null) => void
  active?: boolean
}

export function ShoppingImageField({ value, onChange, active = true }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!active) return

    const handleDocumentPaste = async (event: ClipboardEvent) => {
      if (!shouldHandleImagePaste(event)) return
      event.preventDefault()
      setLoading(true)
      setError(null)
      try {
        const dataUrl = await clipboardEventToOptimizedDataUrl(event)
        if (dataUrl) onChange(dataUrl)
      } catch (e) {
        setError(e instanceof Error ? e.message : '붙여넣기에 실패했습니다.')
      } finally {
        setLoading(false)
      }
    }

    document.addEventListener('paste', handleDocumentPaste)
    return () => document.removeEventListener('paste', handleDocumentPaste)
  }, [active, onChange])

  const applyFile = async (file: File | null | undefined) => {
    if (!file) return
    setLoading(true)
    setError(null)
    try {
      onChange(await fileToOptimizedDataUrl(file))
    } catch (e) {
      setError(e instanceof Error ? e.message : '이미지 등록에 실패했습니다.')
    } finally {
      setLoading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const handleZonePaste = async (event: React.ClipboardEvent) => {
    if (!shouldHandleImagePaste(event)) return
    event.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const dataUrl = await clipboardEventToOptimizedDataUrl(event)
      if (dataUrl) onChange(dataUrl)
    } catch (e) {
      setError(e instanceof Error ? e.message : '붙여넣기에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box>
      <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.75 }}>
        상품 이미지
      </Typography>
      <Stack direction="row" spacing={1.25} alignItems="flex-start">
        <Box
          onPaste={handleZonePaste}
          onClick={() => !value && !loading && inputRef.current?.click()}
          sx={{
            width: 96,
            height: 96,
            flexShrink: 0,
            borderRadius: 2,
            border: '1px dashed',
            borderColor: value ? 'divider' : 'primary.main',
            bgcolor: value ? 'background.paper' : alpha('#2563eb', 0.04),
            overflow: 'hidden',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: !value && !loading ? 'pointer' : 'default',
          }}
        >
          {value ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={value}
                alt="상품 미리보기"
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
              <IconButton
                size="small"
                aria-label="이미지 삭제"
                onClick={(e) => {
                  e.stopPropagation()
                  onChange(null)
                }}
                sx={{
                  position: 'absolute',
                  top: 4,
                  right: 4,
                  bgcolor: 'rgba(15, 23, 42, 0.55)',
                  color: 'white',
                  '&:hover': { bgcolor: 'rgba(15, 23, 42, 0.72)' },
                }}
              >
                <CloseRoundedIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </>
          ) : (
            <Stack alignItems="center" spacing={0.35} sx={{ color: 'primary.main', px: 1 }}>
              <AddPhotoAlternateOutlinedIcon sx={{ fontSize: 28 }} />
              <Typography variant="caption" sx={{ fontWeight: 600, textAlign: 'center', lineHeight: 1.3 }}>
                {loading ? '처리 중…' : 'Ctrl+V'}
              </Typography>
            </Stack>
          )}
        </Box>
        <Stack spacing={0.75} sx={{ minWidth: 0, flex: 1, pt: 0.25 }}>
          <Button
            size="small"
            variant="outlined"
            disabled={loading}
            onClick={() => inputRef.current?.click()}
            sx={{ alignSelf: 'flex-start' }}
          >
            이미지 불러오기
          </Button>
          <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.45 }}>
            파일 선택 또는 윈도우 캡처 후 <strong>Ctrl+V</strong>로 붙여넣기
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.45 }}>
            윈도우 캡처(Win+Shift+S) 후 모달 안에서 <strong>Ctrl+V</strong>하면 바로 등록됩니다.
          </Typography>
          {error ? (
            <Typography variant="caption" color="error" sx={{ lineHeight: 1.45 }}>
              {error}
            </Typography>
          ) : null}
        </Stack>
      </Stack>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => void applyFile(e.target.files?.[0])}
      />
    </Box>
  )
}
