'use client'

import * as React from 'react'
import MuiTextField, { TextFieldProps } from '@mui/material/TextField'

function Textarea(props: TextFieldProps) {
  return (
    <MuiTextField
      data-slot="textarea"
      multiline
      minRows={4}
      variant="outlined"
      fullWidth
      {...props}
    />
  )
}

export { Textarea }
