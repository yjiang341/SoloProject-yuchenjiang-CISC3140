'use client'

import * as React from 'react'
import MuiSwitch, { SwitchProps as MuiSwitchProps } from '@mui/material/Switch'

function Switch(props: MuiSwitchProps) {
  return (
    <MuiSwitch
      data-slot="switch"
      {...props}
    />
  )
}

export { Switch }
