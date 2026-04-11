'use client'

import * as React from 'react'
import MuiDialog, { DialogProps as MuiDialogProps } from '@mui/material/Dialog'
import MuiDialogTitle from '@mui/material/DialogTitle'
import MuiDialogContent from '@mui/material/DialogContent'
import MuiDialogActions from '@mui/material/DialogActions'
import MuiTypography from '@mui/material/Typography'
import MuiIconButton from '@mui/material/IconButton'
import CloseIcon from '@mui/icons-material/Close'

function Dialog(props: MuiDialogProps) {
  return <MuiDialog data-slot="dialog" {...props} />
}

function DialogTrigger({ children, ...props }: any) {
  return <div data-slot="dialog-trigger" {...props}>{children}</div>
}

function DialogPortal(props: any) {
  return <div data-slot="dialog-portal" {...props} />
}

function DialogClose(props: any) {
  return <div data-slot="dialog-close" {...props} />
}

function DialogOverlay(props: any) {
  return <div data-slot="dialog-overlay" {...props} />
}

function DialogContent({
  children,
  showCloseButton = true,
  onClose,
  ...props
}: any) {
  return (
    <MuiDialog data-slot="dialog-content" onClose={onClose} {...props}>
      {showCloseButton && (
        <MuiIconButton
          data-slot="dialog-close"
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: 'grey.500',
          }}
        >
          <CloseIcon />
        </MuiIconButton>
      )}
      {children}
    </MuiDialog>
  )
}

function DialogHeader(props: any) {
  return <div data-slot="dialog-header" {...props} />
}

function DialogFooter(props: any) {
  return (
    <MuiDialogActions data-slot="dialog-footer" {...props} />
  )
}

function DialogTitle({ children, ...props }: any) {
  return (
    <MuiDialogTitle data-slot="dialog-title" {...props}>
      {children}
    </MuiDialogTitle>
  )
}

function DialogDescription({ children, ...props }: any) {
  return (
    <MuiDialogContent data-slot="dialog-description" {...props}>
      {children}
    </MuiDialogContent>
  )
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
}
