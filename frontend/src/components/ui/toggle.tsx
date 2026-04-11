'use client'

import * as React from 'react'
import MuiToggleButton from '@mui/material/ToggleButton'
import MuiToggleButtonGroup from '@mui/material/ToggleButtonGroup'

const toggleVariants = {
  default: 'default',
  outline: 'outline',
} as const

interface ToggleProps extends React.ComponentProps<typeof MuiToggleButton> {
  variant?: keyof typeof toggleVariants
}

function Toggle({ variant = 'default', ...props }: ToggleProps) {
  return (
    <MuiToggleButton
      data-slot="toggle"
      {...props}
    />
  )
}

export { Toggle, toggleVariants }
