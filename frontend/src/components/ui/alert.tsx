'use client'

import * as React from 'react'
import MuiAlert from '@mui/material/Alert'
import MuiAlertTitle from '@mui/material/AlertTitle'
import MuiTypography from '@mui/material/Typography'

type CustomAlertVariant = 'default' | 'destructive'

interface AlertProps {
  variant?: CustomAlertVariant
  children?: React.ReactNode
  [key: string]: any
}

function Alert({ variant = 'default', ...props }: AlertProps) {
  const severityMap: Record<CustomAlertVariant, 'info' | 'error'> = {
    default: 'info',
    destructive: 'error',
  }

  return (
    <MuiAlert
      data-slot="alert"
      severity={severityMap[variant]}
      {...props}
    />
  )
}

function AlertTitle({ children, ...props }: any) {
  return (
    <MuiAlertTitle data-slot="alert-title" {...props}>
      {children}
    </MuiAlertTitle>
  )
}

function AlertDescription({ children, ...props }: any) {
  return (
    <MuiTypography
      data-slot="alert-description"
      variant="body2"
      {...props}
    >
      {children}
    </MuiTypography>
  )
}

export { Alert, AlertTitle, AlertDescription }
