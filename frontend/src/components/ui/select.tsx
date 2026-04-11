'use client'

import * as React from 'react'
import MuiSelect from '@mui/material/Select'
import MuiMenuItem from '@mui/material/MenuItem'
import MuiFormControl from '@mui/material/FormControl'
import MuiFormHelperText from '@mui/material/FormHelperText'

function Select({ children, ...props }: any) {
  return (
    <MuiFormControl data-slot="select">
      <MuiSelect {...props}>
        {children}
      </MuiSelect>
    </MuiFormControl>
  )
}

function SelectGroup(props: any) {
  return <div data-slot="select-group" {...props} />
}

function SelectValue({ children, ...props }: any) {
  return <span data-slot="select-value" {...props}>{children}</span>
}

function SelectTrigger({ children, ...props }: any) {
  return <div data-slot="select-trigger" {...props}>{children}</div>
}

function SelectContent({ children, ...props }: any) {
  return <div data-slot="select-content" {...props}>{children}</div>
}

function SelectLabel({ children, ...props }: any) {
  return <span data-slot="select-label" {...props}>{children}</span>
}

function SelectItem({ children, value, ...props }: any) {
  return (
    <MuiMenuItem data-slot="select-item" value={value} {...props}>
      {children}
    </MuiMenuItem>
  )
}

function SelectSeparator(props: any) {
  return <div data-slot="select-separator" {...props} />
}

function SelectScrollUpButton(props: any) {
  return <div data-slot="select-scroll-up-button" {...props} />
}

function SelectScrollDownButton(props: any) {
  return <div data-slot="select-scroll-down-button" {...props} />
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
}
