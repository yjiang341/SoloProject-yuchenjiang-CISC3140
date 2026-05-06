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

const StyledButton = styled(MuiButton)<MuiButtonProps>(({ variant = 'contained', color = 'primary' }) => {
  const buttonVariant = variant as MuiButtonProps['variant']
  const buttonColor = color as MuiButtonProps['color']

  const baseStyle = {
    textTransform: 'none' as const,
    fontSize: '0.9rem',
    fontWeight: 600,
    letterSpacing: '0.04em',
    borderRadius: '0.55rem',
    minHeight: '2.5rem',
    borderWidth: '1px',
    borderStyle: 'solid' as const,
    fontFamily: 'Cinzel, Palatino Linotype, Book Antiqua, Palatino, serif',
    transition: 'transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease, background-color 180ms ease',
    '&:hover': {
      transform: 'translateY(-1px)',
      boxShadow: '0 10px 24px color-mix(in oklch, black 55%, transparent 45%)',
    },
    '&:active': {
      transform: 'translateY(0)',
    },
  }

  if (buttonVariant === 'contained' && buttonColor === 'error') {
    return {
      ...baseStyle,
      color: 'var(--destructive-foreground)',
      borderColor: 'color-mix(in oklch, var(--destructive) 68%, black 32%)',
      background: 'linear-gradient(180deg, color-mix(in oklch, var(--destructive) 82%, white 18%), color-mix(in oklch, var(--destructive) 70%, black 30%))',
      boxShadow: '0 8px 18px color-mix(in oklch, var(--destructive) 30%, transparent 70%)',
      '&:hover': {
        ...baseStyle['&:hover'],
        borderColor: 'color-mix(in oklch, var(--destructive) 75%, black 25%)',
        background: 'linear-gradient(180deg, color-mix(in oklch, var(--destructive) 88%, white 12%), color-mix(in oklch, var(--destructive) 76%, black 24%))',
      },
    }
  }

  if (buttonVariant === 'contained') {
    return {
      ...baseStyle,
      color: 'var(--primary-foreground)',
      borderColor: 'color-mix(in oklch, var(--primary) 68%, black 32%)',
      background: 'linear-gradient(180deg, color-mix(in oklch, var(--primary) 82%, white 18%), color-mix(in oklch, var(--primary) 66%, black 34%))',
      boxShadow: '0 8px 18px color-mix(in oklch, var(--primary) 35%, transparent 65%)',
      '&:hover': {
        ...baseStyle['&:hover'],
        borderColor: 'color-mix(in oklch, var(--primary) 76%, black 24%)',
        background: 'linear-gradient(180deg, color-mix(in oklch, var(--primary) 88%, white 12%), color-mix(in oklch, var(--primary) 72%, black 28%))',
      },
    }
  }

  if (buttonVariant === 'outlined') {
    return {
      ...baseStyle,
      color: 'var(--accent)',
      borderColor: 'color-mix(in oklch, var(--accent) 45%, var(--border) 55%)',
      backgroundColor: 'color-mix(in oklch, var(--card) 92%, black 8%)',
      '&:hover': {
        ...baseStyle['&:hover'],
        borderColor: 'color-mix(in oklch, var(--accent) 60%, var(--border) 40%)',
        backgroundColor: 'color-mix(in oklch, var(--card) 80%, var(--secondary) 20%)',
      },
    }
  }

  return {
    ...baseStyle,
    color: 'var(--accent)',
    borderColor: 'transparent',
    backgroundColor: 'transparent',
    '&:hover': {
      ...baseStyle['&:hover'],
      borderColor: 'color-mix(in oklch, var(--accent) 40%, transparent 60%)',
      backgroundColor: 'color-mix(in oklch, var(--secondary) 75%, transparent 25%)',
    },
  }
})

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
