// 空模块，用于替换不需要的包
// 导出空函数和对象，避免运行时错误

export function cva() {
  return () => ''
}

export type VariantProps<T> = Record<string, any>

export const Slot = ({ children, ...props }: any) => {
  return children || null
}

export default {}
