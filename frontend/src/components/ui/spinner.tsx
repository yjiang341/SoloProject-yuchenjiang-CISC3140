'use client'

import * as React from 'react'
import MuiCircularProgress from '@mui/material/CircularProgress'

function Spinner(props: React.ComponentProps<typeof MuiCircularProgress>) {
  return (
    <MuiCircularProgress
      data-slot="spinner"
      role="status"
      aria-label="Loading"
      size={20}
      {...props}
    />
  )
}

export { Spinner }
