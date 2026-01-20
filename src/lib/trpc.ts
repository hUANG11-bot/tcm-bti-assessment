import { createTRPCReact } from "@trpc/react-query"
import type { AppRouter } from "../../server/routers"
import { QueryClient } from "@tanstack/react-query"
import { httpBatchLink, TRPCClientError } from "@trpc/client"
import superjson from "superjson"
import Taro from '@tarojs/taro'
import { buildCookieHeader } from './cookie'

export const trpc = createTRPCReact<AppRouter>()

// 创建QueryClient
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
})

// 创建tRPC客户端
// 注意：小程序中需要配置完整的API服务器地址
// 使用 Taro 的 defineConstants 定义的常量
// 在编译时会被替换为实际值
// 声明 TARO_APP_API_URL 常量（由 Taro 的 defineConstants 在编译时注入）
declare const TARO_APP_API_URL: string

// 获取 API 地址
// 优先使用 TARO_APP_API_URL（由 defineConstants 注入），否则使用默认值
const API_BASE_URL = typeof TARO_APP_API_URL !== 'undefined' ? TARO_APP_API_URL : (process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://er1.store')

console.log('[tRPC] API Base URL:', API_BASE_URL)

export const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: `${API_BASE_URL}/api/trpc`,
      transformer: superjson,
      fetch(input, init) {
        // 使用Taro.request替代fetch
        const url = typeof input === 'string' ? input : input.toString()
        
        // 处理 AbortSignal（如果存在）
        let requestTask: Taro.RequestTask | null = null
        
        return new Promise((resolve, reject) => {
          // 构建请求头，包含 cookie
          const cookieHeader = buildCookieHeader()
          const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            ...(init?.headers as any),
          }
          
          // 如果有 cookie，添加到请求头
          if (cookieHeader) {
            headers['Cookie'] = cookieHeader
          }
          
          const task = Taro.request({
            url,
            method: (init?.method as any) || 'GET',
            data: init?.body ? JSON.parse(init.body as string) : undefined,
            header: headers,
            success: (res) => {
              resolve({
                ok: res.statusCode >= 200 && res.statusCode < 300,
                status: res.statusCode,
                json: () => Promise.resolve(res.data),
                text: () => Promise.resolve(JSON.stringify(res.data)),
              } as Response)
            },
            fail: (err) => {
              // 提供更详细的错误信息
              const errorMsg = err.errMsg || 'Request failed'
              console.error('[tRPC Request Failed]', {
                url,
                error: err,
                errMsg: errorMsg,
                apiBaseUrl: API_BASE_URL,
                fullUrl: url,
              })
              
              // 如果是域名相关错误，提供更友好的提示
              let friendlyError = errorMsg
              if (errorMsg.includes('url not in domain') || errorMsg.includes('不在以下 request 合法域名列表中')) {
                friendlyError = '域名未配置：请在微信开发者工具中关闭域名校验，或配置合法域名'
              } else if (errorMsg.includes('request:fail') || errorMsg.includes('connect fail')) {
                friendlyError = `无法连接到服务器 ${API_BASE_URL}，请检查：1. 后端服务是否运行 2. 是否关闭了域名校验`
              }
              
              reject(new Error(friendlyError))
            },
          })
          
          requestTask = task
          
          // 如果提供了 signal，监听 abort 事件
          if (init?.signal) {
            if (init.signal.aborted) {
              task.abort()
              reject(new Error('Aborted'))
              return
            }
            
            // 使用 addEventListener 或 onabort
            const abortHandler = () => {
              if (requestTask) {
                requestTask.abort()
                reject(new Error('Aborted'))
              }
            }
            
            if (typeof init.signal.addEventListener === 'function') {
              init.signal.addEventListener('abort', abortHandler)
            } else if (init.signal.onabort !== undefined) {
              const originalOnAbort = init.signal.onabort
              init.signal.onabort = (ev: any) => {
                if (originalOnAbort) {
                  originalOnAbort.call(init.signal, ev)
                }
                abortHandler()
              }
            }
          }
        })
      },
    }),
  ],
})

// 重定向到登录页的处理
const redirectToLoginIfUnauthorized = (error: unknown) => {
  if (!(error instanceof TRPCClientError)) return

  const isUnauthorized = error.message === 'UNAUTHORIZED'

  if (!isUnauthorized) return

  // 小程序中的跳转
  Taro.redirectTo({ url: '/pages/admin/login/index' })
}

queryClient.getQueryCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.query.state.error
    redirectToLoginIfUnauthorized(error)
    console.error("[API Query Error]", error)
  }
})

queryClient.getMutationCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.mutation.state.error
    redirectToLoginIfUnauthorized(error)
    console.error("[API Mutation Error]", error)
  }
})
