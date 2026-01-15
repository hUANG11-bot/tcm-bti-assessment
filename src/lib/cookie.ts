import Taro from '@tarojs/taro'
import { COOKIE_NAME } from '@/const'

const COOKIE_STORAGE_KEY = 'app_session_cookie'

/**
 * 保存 cookie 到本地存储
 */
export function saveCookie(cookieValue: string) {
  try {
    Taro.setStorageSync(COOKIE_STORAGE_KEY, cookieValue)
    console.log('[Cookie] Saved cookie to storage')
  } catch (error) {
    console.error('[Cookie] Failed to save cookie:', error)
  }
}

/**
 * 从本地存储读取 cookie
 */
export function getCookie(): string | null {
  try {
    const cookie = Taro.getStorageSync(COOKIE_STORAGE_KEY)
    return cookie || null
  } catch (error) {
    console.error('[Cookie] Failed to get cookie:', error)
    return null
  }
}

/**
 * 清除 cookie
 */
export function clearCookie() {
  try {
    Taro.removeStorageSync(COOKIE_STORAGE_KEY)
    console.log('[Cookie] Cleared cookie from storage')
  } catch (error) {
    console.error('[Cookie] Failed to clear cookie:', error)
  }
}

/**
 * 从响应头中提取 cookie
 */
export function extractCookieFromHeaders(headers: Record<string, any>): string | null {
  // 检查 Set-Cookie 头
  const setCookie = headers['Set-Cookie'] || headers['set-cookie']
  if (setCookie) {
    // Set-Cookie 可能是数组或字符串
    const cookieString = Array.isArray(setCookie) ? setCookie[0] : setCookie
    // 提取 app_session_id 的值
    const match = cookieString.match(new RegExp(`${COOKIE_NAME}=([^;]+)`))
    if (match && match[1]) {
      return match[1]
    }
  }
  return null
}

/**
 * 构建 Cookie 请求头
 */
export function buildCookieHeader(): string | null {
  const cookieValue = getCookie()
  if (!cookieValue) {
    return null
  }
  return `${COOKIE_NAME}=${cookieValue}`
}
