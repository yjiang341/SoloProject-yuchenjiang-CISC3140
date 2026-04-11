'use client'

import * as React from 'react'
import MuiTable from '@mui/material/Table'
import MuiTableBody from '@mui/material/TableBody'
import MuiTableCell from '@mui/material/TableCell'
import MuiTableContainer from '@mui/material/TableContainer'
import MuiTableHead from '@mui/material/TableHead'
import MuiTableRow from '@mui/material/TableRow'

function Table(props: any) {
  return (
    <MuiTableContainer data-slot="table-container">
      <MuiTable data-slot="table" {...props} />
    </MuiTableContainer>
  )
}

function TableHeader(props: any) {
  return (
    <MuiTableHead data-slot="table-header" {...props} />
  )
}

function TableBody(props: any) {
  return (
    <MuiTableBody data-slot="table-body" {...props} />
  )
}

function TableFooter(props: any) {
  return (
    <tfoot data-slot="table-footer" {...props} />
  )
}

function TableRow(props: any) {
  return (
    <MuiTableRow data-slot="table-row" {...props} />
  )
}

function TableHead(props: any) {
  return (
    <MuiTableCell data-slot="table-head" component="th" {...props} />
  )
}

function TableCell(props: any) {
  return (
    <MuiTableCell data-slot="table-cell" {...props} />
  )
}

function TableCaption(props: any) {
  return (
    <caption data-slot="table-caption" {...props} />
  )
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
}
