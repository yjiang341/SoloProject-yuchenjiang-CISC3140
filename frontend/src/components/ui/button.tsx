'use client'

import * as React from 'react'
import MuiButton, { ButtonProps as MuiButtonProps } from '@mui/material/Button'
import { styled } from '@mui/material/styles'

const buttonVariants = {
  default: 'contained',
  destructive: 'contained',
  outline: 'outlined',
  secondary: 'contained',
  ghost: 'text',
  link: 'text',
} as const

const sizeMap = {
  default: 'medium',
  sm: 'small',
  lg: 'large',
  icon: 'medium',
  'icon-sm': 'small',
  'icon-lg': 'large',
} as const

interface ButtonProps extends Omit<MuiButtonProps, 'variant' | 'size'> {
  variant?: keyof typeof buttonVariants
  size?: keyof typeof sizeMap
  asChild?: boolean
}

const StyledButton = styled(MuiButton)(({ theme }) => ({
  textTransform: 'none',
  fontSize: '0.875rem',
}))

function Button({
  variant = 'default',
  size = 'default',
  asChild = false,
  ...props
}: ButtonProps) {
  const muiVariant = buttonVariants[variant] as MuiButtonProps['variant']
  const muiSize = sizeMap[size] as MuiButtonProps['size']
  
  const variantColorMap = {
    default: 'primary' as const,
    destructive: 'error' as const,
    outline: 'primary' as const,
    secondary: 'secondary' as const,
    ghost: 'inherit' as const,
    link: 'primary' as const,
  }

  return (
    <StyledButton
      data-slot="button"
      variant={muiVariant}
      size={muiSize}
      color={variantColorMap[variant]}
      {...props}
    />
  )
}

export { Button, buttonVariants }
