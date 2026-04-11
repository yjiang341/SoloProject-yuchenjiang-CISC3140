'use client'

import * as React from 'react'
import MuiCheckbox, { CheckboxProps as MuiCheckboxProps } from '@mui/material/Checkbox'

function Checkbox(props: MuiCheckboxProps) {
  return (
    <MuiCheckbox
      data-slot="checkbox"
      {...props}
    />
  )
}

export { Checkbox }
