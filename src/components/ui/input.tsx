import React from 'react'
import { Input as TaroInput } from '@tarojs/components'
import { InputProps } from '@tarojs/components/types/Input'
import './input.scss'

export interface InputComponentProps extends InputProps {
  className?: string
}

export function Input({ className = '', ...props }: InputComponentProps) {
  return (
    <TaroInput className={`input ${className}`.trim()} {...props} />
  )
}
