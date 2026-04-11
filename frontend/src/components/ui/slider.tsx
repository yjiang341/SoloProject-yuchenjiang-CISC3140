'use client'

import * as React from 'react'
import MuiSlider, { SliderProps as MuiSliderProps } from '@mui/material/Slider'

function Slider(props: MuiSliderProps) {
  return (
    <MuiSlider
      data-slot="slider"
      {...props}
    />
  )
}

export { Slider }
