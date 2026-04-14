'use client'

import * as React from 'react'
import MuiDialog from '@mui/material/Dialog'
import MuiDialogTitle from '@mui/material/DialogTitle'
import MuiDialogContent from '@mui/material/DialogContent'
import MuiDialogActions from '@mui/material/DialogActions'
import MuiButton from '@mui/material/Button'

const AlertDialogContext = React.createContext<{
  open: boolean
  onOpenChange?: (open: boolean) => void
}>({ open: false })

function AlertDialog({ open, onOpenChange, children, ...props }: any) {
  return (
    <AlertDialogContext.Provider value={{ open: open || false, onOpenChange }}>
      <div data-slot="alert-dialog" {...props}>
        {children}
      </div>
    </AlertDialogContext.Provider>
  )
}

function AlertDialogTrigger(props: any) {
  return <div data-slot="alert-dialog-trigger" {...props} />
}

function AlertDialogPortal(props: any) {
  return <div data-slot="alert-dialog-portal" {...props} />
}

function AlertDialogOverlay(props: any) {
  return <div data-slot="alert-dialog-overlay" {...props} />
}

function AlertDialogContent({ children, open: openProp, onClose: onCloseProp, ...props }: any) {
  const { open: ctxOpen, onOpenChange } = React.useContext(AlertDialogContext)
  const open = openProp !== undefined ? openProp : ctxOpen
  const onClose = onCloseProp ?? (onOpenChange ? () => onOpenChange(false) : undefined)
  return (
    <MuiDialog
      data-slot="alert-dialog-content"
      open={open}
      onClose={onClose}
      {...props}
    >
      {children}
    </MuiDialog>
  )
}

function AlertDialogHeader(props: any) {
  return <div data-slot="alert-dialog-header" {...props} />
}

function AlertDialogFooter(props: any) {
  return (
    <MuiDialogActions data-slot="alert-dialog-footer" {...props} />
  )
}

function AlertDialogTitle({ children, ...props }: any) {
  return (
    <MuiDialogTitle data-slot="alert-dialog-title" {...props}>
      {children}
    </MuiDialogTitle>
  )
}

function AlertDialogDescription({ children, ...props }: any) {
  return (
    <MuiDialogContent data-slot="alert-dialog-description" {...props}>
      {children}
    </MuiDialogContent>
  )
}

function AlertDialogAction(props: any) {
  return <MuiButton data-slot="alert-dialog-action" variant="contained" {...props} />
}

function AlertDialogCancel({ onClick, ...props }: any) {
  const { onOpenChange } = React.useContext(AlertDialogContext)
  return (
    <MuiButton
      data-slot="alert-dialog-cancel"
      variant="outlined"
      onClick={(e: any) => { onOpenChange?.(false); onClick?.(e) }}
      {...props}
    />
  )
}

export {
  AlertDialog,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
}
