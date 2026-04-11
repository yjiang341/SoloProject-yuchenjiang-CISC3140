'use client'

import * as React from 'react'
import MuiSkeleton, { SkeletonProps as MuiSkeletonProps } from '@mui/material/Skeleton'

function Skeleton(props: MuiSkeletonProps) {
  return (
    <MuiSkeleton
      data-slot="skeleton"
      {...props}
    />
  )
}

export { Skeleton }
