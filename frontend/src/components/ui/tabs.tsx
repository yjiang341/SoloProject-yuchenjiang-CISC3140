'use client'

import * as React from 'react'
import MuiTabs, { TabsProps as MuiTabsProps } from '@mui/material/Tabs'
import MuiTab, { TabProps as MuiTabProps } from '@mui/material/Tab'
import MuiBox from '@mui/material/Box'

function Tabs({ value, onChange, ...props }: MuiTabsProps) {
  const [tabValue, setTabValue] = React.useState(value || 0)

  return (
    <MuiTabs
      data-slot="tabs"
      value={value !== undefined ? value : tabValue}
      onChange={(event, newValue) => {
        if (onChange) onChange(event, newValue)
        setTabValue(newValue)
      }}
      {...props}
    />
  )
}

function TabsList(props: any) {
  return (
    <div data-slot="tabs-list" {...props} />
  )
}

function TabsTrigger(props: MuiTabProps) {
  return (
    <MuiTab data-slot="tabs-trigger" {...props} />
  )
}

function TabsContent({ children, value, ...props }: any) {
  return (
    <div data-slot="tabs-content" role="tabpanel" {...props}>
      {children}
    </div>
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
