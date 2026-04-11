'use client'

import * as React from 'react'
import MuiFormControl from '@mui/material/FormControl'
import MuiFormLabel from '@mui/material/FormLabel'
import MuiRadioGroup, { RadioGroupProps as MuiRadioGroupProps } from '@mui/material/RadioGroup'
import MuiFormControlLabel from '@mui/material/FormControlLabel'
import MuiRadio, { RadioProps as MuiRadioProps } from '@mui/material/Radio'

function RadioGroup(props: MuiRadioGroupProps) {
  return (
    <MuiRadioGroup
      data-slot="radio-group"
      {...props}
    />
  )
}

function RadioGroupItem(props: MuiRadioProps) {
  return (
    <MuiRadio
      data-slot="radio-group-item"
      {...props}
    />
  )
}

export { RadioGroup, RadioGroupItem }
