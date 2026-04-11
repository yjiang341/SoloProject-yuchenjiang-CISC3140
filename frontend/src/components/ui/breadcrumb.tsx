'use client'

import * as React from 'react'
import MuiBreadcrumbs from '@mui/material/Breadcrumbs'
import MuiLink from '@mui/material/Link'
import MuiTypography from '@mui/material/Typography'

function Breadcrumb(props: any) {
  return <nav aria-label="breadcrumb" data-slot="breadcrumb" {...props} />
}

function BreadcrumbList(props: any) {
  return <MuiBreadcrumbs data-slot="breadcrumb-list" {...props} />
}

function BreadcrumbItem(props: any) {
  return <div data-slot="breadcrumb-item" {...props} />
}

function BreadcrumbLink({ children, ...props }: any) {
  return (
    <MuiLink
      data-slot="breadcrumb-link"
      underline="hover"
      {...props}
    >
      {children}
    </MuiLink>
  )
}

function BreadcrumbPage({ children, ...props }: any) {
  return (
    <MuiTypography
      data-slot="breadcrumb-page"
      color="textPrimary"
      {...props}
    >
      {children}
    </MuiTypography>
  )
}

function BreadcrumbSeparator(props: any) {
  return <span data-slot="breadcrumb-separator" {...props}>/</span>
}

function BreadcrumbEllipsis(props: any) {
  return <span data-slot="breadcrumb-ellipsis" {...props}>...</span>
}

export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
}

export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
}
