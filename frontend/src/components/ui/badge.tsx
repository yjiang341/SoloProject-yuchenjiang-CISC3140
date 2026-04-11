'use client'

import * as React from 'react'
import MuiChip, { ChipProps as MuiChipProps } from '@mui/material/Chip'

const badgeVariants = {
  default: 'primary',
  secondary: 'secondary',
  destructive: 'error',
  outline: 'default',
} as const

interface BadgeProps extends Omit<MuiChipProps, 'variant' | 'color'> {
  variant?: keyof typeof badgeVariants
}

function Badge({ variant = 'default', ...props }: BadgeProps) {
  const colorMap = {
    default: 'primary' as const,
    secondary: 'secondary' as const,
    destructive: 'error' as const,
    outline: 'default' as const,
  }

  return (
    <MuiChip
      data-slot="badge"
      color={colorMap[variant]}
      variant={variant === 'outline' ? 'outlined' : 'filled'}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
