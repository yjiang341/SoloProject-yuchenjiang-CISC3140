'use client'

import * as React from 'react'
import MuiDrawer, { DrawerProps as MuiDrawerProps } from '@mui/material/Drawer'
import MuiTypography from '@mui/material/Typography'

function Drawer(props: MuiDrawerProps) {
  return <MuiDrawer data-slot="drawer" {...props} />
}

function DrawerTrigger({ children, ...props }: any) {
  return <div data-slot="drawer-trigger" {...props}>{children}</div>
}

function DrawerPortal(props: any) {
  return <div data-slot="drawer-portal" {...props} />
}

function DrawerClose(props: any) {
  return <div data-slot="drawer-close" {...props} />
}

function DrawerOverlay(props: any) {
  return <div data-slot="drawer-overlay" {...props} />
}

function DrawerContent({
  children,
  ...props
}: any) {
  return (
    <div data-slot="drawer-content" {...props}>
      {children}
    </div>
  )
}

function DrawerHeader(props: any) {
  return <div data-slot="drawer-header" {...props} />
}

function DrawerFooter(props: any) {
  return <div data-slot="drawer-footer" {...props} />
}

function DrawerTitle({ children, ...props }: any) {
  return (
    <MuiTypography
      data-slot="drawer-title"
      variant="h6"
      {...props}
    >
      {children}
    </MuiTypography>
  )
}

function DrawerDescription({ children, ...props }: any) {
  return (
    <MuiTypography
      data-slot="drawer-description"
      variant="body2"
      {...props}
    >
      {children}
    </MuiTypography>
  )
}

export {
  Drawer,
  DrawerPortal,
  DrawerOverlay,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
}
