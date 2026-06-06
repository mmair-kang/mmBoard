import type { SxProps, Theme } from '@mui/material/styles'
import { alpha } from '@mui/material/styles'
// 수정: Auto — 2026-06-05 (본문 스크롤·하단 버튼 고정)

export const formDialogPaperSlotSx: SxProps<Theme> = {
  position: 'relative',
  overflow: 'hidden',
  maxHeight: 'min(92dvh, 600px)',
  display: 'flex',
  flexDirection: 'column',
}

export const formDialogFormSx: SxProps<Theme> = {
  display: 'flex',
  flexDirection: 'column',
  flex: '1 1 auto',
  minHeight: 0,
  overflow: 'hidden',
}
export const formDialogSlotProps = {
  paper: {
    sx: formDialogPaperSlotSx,
  },
}

export const formDialogTitleSx: SxProps<Theme> = {
  pt: 2.75,
  pb: 1.5,
  px: 2.5,
  flexShrink: 0,
  overflow: 'visible',
}

/** 본문 영역 — 내부 박스만 스크롤 */
export const formDialogContentSx: SxProps<Theme> = {
  pt: 0.5,
  pb: 0.5,
  px: 2.5,
  overflow: 'hidden',
  flex: '1 1 auto',
  minHeight: 0,
  display: 'flex',
  flexDirection: 'column',
}
/** 실제 스크롤은 내부 박스에서 (상단 패딩으로 라벨 여유 확보) */
export const formDialogContentScrollSx: SxProps<Theme> = {
  overflowY: 'auto',
  overflowX: 'visible',
  flex: '1 1 auto',
  minHeight: 0,
  pt: 2,
  pb: 0.75,
  mx: -0.25,
  px: 0.25,
}

export const formDialogFieldStackSx: SxProps<Theme> = {}

export const formDialogFieldStackSpacing = 1

/** 추가/수정 폼 — size small보다 한 단계 더 낮은 입력 높이 */
export const formDialogCompactFieldSx: SxProps<Theme> = {
  '& .MuiInputBase-root': {
    minHeight: 34,
    fontSize: '0.9rem',
  },
  '& .MuiOutlinedInput-root': {
    height: 34,
  },
  '& .MuiInputBase-input': {
    py: 0.45,
    height: 'auto',
    boxSizing: 'border-box',
  },
  '& .MuiSelect-select': {
    py: 0.45,
    minHeight: 'unset !important',
    display: 'flex',
    alignItems: 'center',
  },
  '& .MuiInputLabel-root': {
    fontSize: '0.85rem',
  },
  '& .MuiInputAdornment-root': {
    fontSize: '0.85rem',
  },
}

export const formDialogCompactTextFieldProps = {
  size: 'small' as const,
  margin: 'dense' as const,
  sx: formDialogCompactFieldSx,
}

/** 맨 위 outlined 라벨이 DialogTitle 쪽으로 넘어가 잘리지 않도록 */
export const formDialogFirstFieldSx: SxProps<Theme> = {
  ...formDialogCompactFieldSx,
  mt: 0.5,
}

export const formDialogActionsSx: SxProps<Theme> = {
  px: 2.5,
  pt: 1.5,
  pb: 2.25,
  gap: 1.5,
  flexShrink: 0,
  justifyContent: 'space-between',
  alignItems: 'center',
  flexWrap: 'nowrap',
  borderTop: 1,
  borderColor: 'divider',
  bgcolor: 'background.paper',
}

export const formDialogDeleteButtonSx: SxProps<Theme> = {
  minWidth: 104,
  height: 36,
  bgcolor: 'background.paper',
  boxShadow: 'none',
  '&:hover': {
    bgcolor: (theme) => alpha(theme.palette.error.main, 0.04),
    boxShadow: 'none',
  },
}
export const formDialogPrimarySubmitButtonSx: SxProps<Theme> = {
  minWidth: 104,
  height: 36,
  '&.Mui-disabled': {
    backgroundColor: 'primary.main',
    color: 'primary.contrastText',
    opacity: 1,
  },
}
