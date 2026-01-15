export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const"

// Generate login URL at runtime so redirect URI reflects the current origin.
// 注意：小程序环境使用微信登录，此函数主要用于兼容性
// 在小程序中，直接返回个人页面路径，因为登录功能在个人页面中
export const getLoginUrl = () => {
  // 小程序环境直接返回个人页面路径
  // 因为小程序使用微信登录，不需要 OAuth 流程
  return '/pages/profile/index'
}
