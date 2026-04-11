'use client'

import * as React from 'react'
import MuiAccordion, { AccordionProps as MuiAccordionProps } from '@mui/material/Accordion'
import MuiAccordionSummary from '@mui/material/AccordionSummary'
import MuiAccordionDetails from '@mui/material/AccordionDetails'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'

function Accordion(props: MuiAccordionProps) {
  return (
    <div data-slot="accordion" {...props} />
  )
}

function AccordionItem(props: any) {
  return (
    <MuiAccordion data-slot="accordion-item" {...props} />
  )
}

function AccordionTrigger({ children, ...props }: any) {
  return (
    <MuiAccordionSummary
      data-slot="accordion-trigger"
      expandIcon={<ExpandMoreIcon />}
      {...props}
    >
      {children}
    </MuiAccordionSummary>
  )
}

function AccordionContent({ children, ...props }: any) {
  return (
    <MuiAccordionDetails
      data-slot="accordion-content"
      {...props}
    >
      {children}
    </MuiAccordionDetails>
  )
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
