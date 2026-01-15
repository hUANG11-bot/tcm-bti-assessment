import { Progress as TaroProgress } from '@tarojs/components'
import { ProgressProps } from '@tarojs/components/types/Progress'
import './progress.scss'

export interface ProgressComponentProps extends ProgressProps {
  className?: string
}

export function Progress({ className = '', ...props }: ProgressComponentProps) {
  return (
    <TaroProgress className={`progress ${className}`.trim()} {...props} />
  )
}
