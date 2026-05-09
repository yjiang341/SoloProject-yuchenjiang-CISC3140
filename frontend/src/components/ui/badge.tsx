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
  children?: React.ReactNode
}

function stringifyBadgeChildren(children: React.ReactNode): string | undefined {
  const parts = React.Children.toArray(children)
    .map(part => {
      if (typeof part === 'string' || typeof part === 'number') return String(part)
      return ''
    })
    .join('')
    .trim()

  return parts.length > 0 ? parts : undefined
}

function Badge({ variant = 'default', children, label, ...props }: BadgeProps) {
  const colorMap = {
    default: 'primary' as const,
    secondary: 'secondary' as const,
    destructive: 'error' as const,
    outline: 'default' as const,
  }

  const resolvedLabel =
    label ??
    stringifyBadgeChildren(children)

  return (
    <MuiChip
      data-slot="badge"
      color={colorMap[variant]}
      variant={variant === 'outline' ? 'outlined' : 'filled'}
      label={resolvedLabel}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
