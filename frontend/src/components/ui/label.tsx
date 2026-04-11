'use client'

import * as React from 'react'
import MuiFormLabel, { FormLabelProps } from '@mui/material/FormLabel'

function Label(props: FormLabelProps) {
  return (
    <MuiFormLabel
      data-slot="label"
      {...props}
    />
  )
}

export { Label }
