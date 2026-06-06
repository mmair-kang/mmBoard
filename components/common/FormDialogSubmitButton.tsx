import { Button, CircularProgress } from '@mui/material'
import type { ButtonProps } from '@mui/material/Button'
import { formDialogPrimarySubmitButtonSx } from '@/config/formDialogLayout'
import type { ReactNode } from 'react'

type Props = Omit<ButtonProps, 'type' | 'variant' | 'children'> & {
  loading: boolean
  children: ReactNode
}

export function FormDialogSubmitButton({ loading, children, disabled, ...rest }: Props) {
  return (
    <Button
      type="submit"
      variant="contained"
      disabled={disabled ?? loading}
      aria-busy={loading}
      sx={formDialogPrimarySubmitButtonSx}
      {...rest}
    >
      {loading ? <CircularProgress size={22} thickness={4} color="inherit" aria-hidden /> : children}
    </Button>
  )
}
