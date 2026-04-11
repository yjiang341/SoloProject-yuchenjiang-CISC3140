'use client'

import * as React from 'react'
import MuiCard, { CardProps as MuiCardProps } from '@mui/material/Card'
import MuiCardContent from '@mui/material/CardContent'
import MuiCardHeader from '@mui/material/CardHeader'
import MuiCardActions from '@mui/material/CardActions'
import MuiTypography from '@mui/material/Typography'

function Card(props: MuiCardProps) {
  return (
    <MuiCard
      data-slot="card"
      {...props}
    />
  )
}

function CardHeader(props: any) {
  return (
    <MuiCardHeader
      data-slot="card-header"
      {...props}
    />
  )
}

function CardTitle({ children, ...props }: any) {
  return (
    <MuiTypography
      data-slot="card-title"
      variant="h6"
      {...props}
    >
      {children}
    </MuiTypography>
  )
}

function CardDescription({ children, ...props }: any) {
  return (
    <MuiTypography
      data-slot="card-description"
      variant="body2"
      color="textSecondary"
      {...props}
    >
      {children}
    </MuiTypography>
  )
}

function CardAction({ ...props }: any) {
  return (
    <div
      data-slot="card-action"
      {...props}
    />
  )
}

function CardContent(props: any) {
  return (
    <MuiCardContent
      data-slot="card-content"
      {...props}
    />
  )
}

function CardFooter(props: any) {
  return (
    <MuiCardActions
      data-slot="card-footer"
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
}
