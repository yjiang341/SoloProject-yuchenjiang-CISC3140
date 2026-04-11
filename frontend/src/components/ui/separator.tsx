'use client'

import * as React from 'react'
import MuiDivider, { DividerProps as MuiDividerProps } from '@mui/material/Divider'

function Separator(props: MuiDividerProps) {
  return (
    <MuiDivider
      data-slot="separator"
      {...props}
    />
  )
}

export { Separator }
