'use client'

import * as React from 'react'
import MuiTooltip, { TooltipProps as MuiTooltipProps } from '@mui/material/Tooltip'

function TooltipProvider(props: any) {
  return <div data-slot="tooltip-provider" {...props} />
}

function Tooltip({ children, title, ...props }: any) {
  return (
    <TooltipProvider>
      <MuiTooltip
        data-slot="tooltip"
        title={title}
        {...props}
      >
        {children}
      </MuiTooltip>
    </TooltipProvider>
  )
}

function TooltipTrigger({ children, ...props }: any) {
  return (
    <div data-slot="tooltip-trigger" {...props}>
      {children}
    </div>
  )
}

function TooltipContent(props: any) {
  return <div data-slot="tooltip-content" {...props} />
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
