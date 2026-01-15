import { getLoginUrl } from "@/const"
import { trpc } from "@/lib/trpc"
import { TRPCClientError } from "@trpc/client"
import { useCallback, useEffect, useMemo } from "react"
import Taro from '@tarojs/taro'
import { clearCookie } from '@/lib/cookie'

type UseAuthOptions = {
  redirectOnUnauthenticated?: boolean
  redirectPath?: string
}

export function useAuth(options?: UseAuthOptions) {
  const { redirectOnUnauthenticated = false, redirectPath = getLoginUrl() } =
    options ?? {}
  const utils = trpc.useUtils()

  const meQuery = trpc.auth.me.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  })

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      utils.auth.me.setData(undefined, null)
    },
  })

  const logout = useCallback(async () => {
    try {
      await logoutMutation.mutateAsync()
    } catch (error: unknown) {
      if (
        error instanceof TRPCClientError &&
        error.data?.code === "UNAUTHORIZED"
      ) {
        return
      }
      throw error
    } finally {
      // 清除本地存储的 cookie
      clearCookie()
      utils.auth.me.setData(undefined, null)
      await utils.auth.me.invalidate()
    }
  }, [logoutMutation, utils])

  const state = useMemo(() => {
    try {
      Taro.setStorageSync(
        "manus-runtime-user-info",
        JSON.stringify(meQuery.data)
      )
    } catch (e) {
      console.error('Failed to save user info:', e)
    }
    return {
      user: meQuery.data ?? null,
      loading: meQuery.isLoading || logoutMutation.isPending,
      error: meQuery.error ?? logoutMutation.error ?? null,
      isAuthenticated: Boolean(meQuery.data),
    }
  }, [
    meQuery.data,
    meQuery.error,
    meQuery.isLoading,
    logoutMutation.error,
    logoutMutation.isPending,
  ])

  useEffect(() => {
    if (!redirectOnUnauthenticated) return
    if (meQuery.isLoading || logoutMutation.isPending) return
    if (state.user) return
    
    // 小程序中的路由跳转
    Taro.redirectTo({ url: redirectPath })
  }, [
    redirectOnUnauthenticated,
    redirectPath,
    logoutMutation.isPending,
    meQuery.isLoading,
    state.user,
  ])

  return {
    ...state,
    refresh: () => meQuery.refetch(),
    logout,
  }
}
