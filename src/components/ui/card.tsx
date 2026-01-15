import React from 'react'
import { View } from '@tarojs/components'
import './card.scss'

export interface CardProps {
  className?: string
  children?: React.ReactNode
}

export function Card({ className = '', children }: CardProps) {
  return (
    <View className={`card ${className}`.trim()}>
      {children}
    </View>
  )
}

export function CardHeader({ className = '', children }: CardProps) {
  return (
    <View className={`card-header ${className}`.trim()}>
      {children}
    </View>
  )
}

export function CardTitle({ className = '', children }: CardProps) {
  return (
    <View className={`card-title ${className}`.trim()}>
      {children}
    </View>
  )
}

export function CardDescription({ className = '', children }: CardProps) {
  return (
    <View className={`card-description ${className}`.trim()}>
      {children}
    </View>
  )
}

export function CardContent({ className = '', children }: CardProps) {
  return (
    <View className={`card-content ${className}`.trim()}>
      {children}
    </View>
  )
}

export function CardFooter({ className = '', children }: CardProps) {
  return (
    <View className={`card-footer ${className}`.trim()}>
      {children}
    </View>
  )
}
