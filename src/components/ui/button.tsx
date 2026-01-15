import React from 'react'
import { Button as TaroButton } from '@tarojs/components'
import { View } from '@tarojs/components'
import { ButtonProps } from '@tarojs/components/types/Button'
import './button.scss'

export interface ButtonComponentProps extends Omit<ButtonProps, 'size'> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  className?: string
  children?: React.ReactNode
}

export function Button({
  variant = 'default',
  size = 'default',
  className = '',
  children,
  ...props
}: ButtonComponentProps) {
  const classes = `btn btn-${variant} btn-${size} ${className}`.trim()

  return (
    <TaroButton className={classes} {...props}>
      {children}
    </TaroButton>
  )
}
