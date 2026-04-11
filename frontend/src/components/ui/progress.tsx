'use client'

import * as React from 'react'
import MuiLinearProgress, { LinearProgressProps as MuiLinearProgressProps } from '@mui/material/LinearProgress'

function Progress({ value = 0, ...props }: MuiLinearProgressProps & { value?: number }) {
  return (
    <MuiLinearProgress
      data-slot="progress"
      variant="determinate"
      value={value}
      {...props}
    />
  )
}

export { Progress }
