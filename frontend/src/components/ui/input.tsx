'use client'

import * as React from 'react'
import MuiTextField, { TextFieldProps } from '@mui/material/TextField'

interface InputProps extends Omit<TextFieldProps, 'variant'> {
  type?: string
}

function Input({ type = 'text', ...props }: InputProps) {
  return (
    <MuiTextField
      data-slot="input"
      type={type}
      variant="outlined"
      size="small"
      fullWidth
      {...props}
    />
  )
}

export { Input }
