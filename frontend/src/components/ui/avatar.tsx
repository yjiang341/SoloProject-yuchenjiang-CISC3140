'use client'

import * as React from 'react'
import MuiAvatar from '@mui/material/Avatar'
import MuiAvatarGroup from '@mui/material/AvatarGroup'

function Avatar(props: React.ComponentProps<typeof MuiAvatar>) {
  return (
    <MuiAvatar
      data-slot="avatar"
      {...props}
    />
  )
}

function AvatarImage({ src, ...props }: any) {
  return (
    <img
      data-slot="avatar-image"
      src={src}
      {...props}
    />
  )
}

function AvatarFallback({ children, ...props }: any) {
  return (
    <MuiAvatar data-slot="avatar-fallback" {...props}>
      {children}
    </MuiAvatar>
  )
}

export { Avatar, AvatarImage, AvatarFallback }
