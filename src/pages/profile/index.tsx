import React, { useState, useEffect } from 'react'
import { View, Text, Button, Image, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useAuth } from '@/hooks/useAuth'
import { trpc } from '@/lib/trpc'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button as UIButton } from '@/components/ui/button'
import { saveCookie } from '@/lib/cookie'
import './index.scss'

// 声明 TARO_APP_API_URL 常量（由 Taro 的 defineConstants 在编译时注入）
declare const TARO_APP_API_URL: string

export default function ProfilePage() {
  const { user, loading, isAuthenticated, logout, refresh } = useAuth()
  const [loginLoading, setLoginLoading] = useState(false)

  // 微信一键登录
  const handleWechatLogin = async () => {
    setLoginLoading(true)
    try {
      // 1. 获取微信登录凭证
      const loginRes = await Taro.login()
      if (!loginRes.code) {
        throw new Error('获取微信登录凭证失败')
      }

      // 2. 获取用户信息（需要用户授权）
      try {
        const userProfile = await Taro.getUserProfile({
          desc: '用于完善用户资料',
        })

        // 3. 发送到后端进行登录
        // 使用 TARO_APP_API_URL 或默认值
        const API_BASE_URL = typeof TARO_APP_API_URL !== 'undefined' ? TARO_APP_API_URL : 'https://er1.store'
        const response = await Taro.request({
          url: `${API_BASE_URL}/api/wechat/login`,
          method: 'POST',
          header: {
            'Content-Type': 'application/json',
          },
          data: {
            code: loginRes.code,
            userInfo: userProfile.userInfo,
          },
        })

        if (response.statusCode === 200 && response.data.success) {
          // 保存 session token 到本地存储（用于后续请求）
          if (response.data.sessionToken) {
            saveCookie(response.data.sessionToken)
          }
          Taro.showToast({ title: '登录成功', icon: 'success' })
          // 刷新用户信息
          await refresh()
        } else {
          throw new Error(response.data.message || '登录失败')
        }
      } catch (err: any) {
        // 如果用户拒绝授权，只使用 code 登录（匿名登录）
        if (err.errMsg && err.errMsg.includes('getUserProfile:fail')) {
          // 仅使用 code 进行登录（后端需要支持）
          // 使用 TARO_APP_API_URL 或默认值
          const API_BASE_URL = typeof TARO_APP_API_URL !== 'undefined' ? TARO_APP_API_URL : 'https://er1.store'
          const response = await Taro.request({
            url: `${API_BASE_URL}/api/wechat/login`,
            method: 'POST',
            header: {
              'Content-Type': 'application/json',
            },
            data: {
              code: loginRes.code,
            },
          })

          if (response.statusCode === 200 && response.data.success) {
            // 保存 session token 到本地存储（用于后续请求）
            if (response.data.sessionToken) {
              saveCookie(response.data.sessionToken)
            }
            Taro.showToast({ title: '登录成功', icon: 'success' })
            await refresh()
          } else {
            throw new Error(response.data.message || '登录失败')
          }
        } else {
          throw err
        }
      }
    } catch (error: any) {
      console.error('微信登录失败:', error)
      Taro.showToast({
        title: error.message || '登录失败，请稍后重试',
        icon: 'none',
        duration: 2000,
      })
    } finally {
      setLoginLoading(false)
    }
  }

  // 退出登录
  const handleLogout = async () => {
    try {
      await logout()
      Taro.showToast({ title: '已退出登录', icon: 'success' })
    } catch (error) {
      console.error('退出登录失败:', error)
      Taro.showToast({ title: '退出登录失败', icon: 'none' })
    }
  }

  // 获取用户头像
  const getUserAvatar = () => {
    if (user?.avatar) return user.avatar
    return 'https://via.placeholder.com/100?text=User'
  }

  // 获取用户名称
  const getUserName = () => {
    if (user?.name) return user.name
    if (user?.openId) return `用户${user.openId.slice(-4)}`
    return '未登录'
  }

  return (
    <ScrollView className="profile-page" scrollY>
      <View className="profile-container">
        {/* 用户信息卡片 */}
        <Card className="user-info-card">
          <CardContent>
            {loading ? (
              <View className="loading-container">
                <Text>加载中...</Text>
              </View>
            ) : isAuthenticated && user ? (
              <View className="user-info">
                <Image
                  src={getUserAvatar()}
                  className="user-avatar"
                  mode="aspectFill"
                />
                <View className="user-details">
                  <Text className="user-name">{getUserName()}</Text>
                  {user.email && (
                    <Text className="user-email">{user.email}</Text>
                  )}
                  {user.openId && (
                    <Text className="user-id">ID: {user.openId.slice(-8)}</Text>
                  )}
                </View>
              </View>
            ) : (
              <View className="not-logged-in">
                <Text className="not-logged-in-text">您还未登录</Text>
                <Text className="not-logged-in-desc">
                  登录后可以保存测评记录，查看历史数据
                </Text>
              </View>
            )}
          </CardContent>
        </Card>

        {/* 登录/退出按钮 */}
        <View className="action-section">
          {isAuthenticated ? (
            <UIButton
              variant="outline"
              onClick={handleLogout}
              className="logout-button"
            >
              退出登录
            </UIButton>
          ) : (
            <UIButton
              onClick={handleWechatLogin}
              disabled={loginLoading}
              className="login-button"
            >
              {loginLoading ? '登录中...' : '微信一键登录'}
            </UIButton>
          )}
        </View>

        {/* 功能菜单 */}
        {isAuthenticated && (
          <View className="menu-section">
            <Card>
              <CardHeader>
                <CardTitle>我的功能</CardTitle>
              </CardHeader>
              <CardContent>
                <View
                  className="menu-item"
                  onClick={() => Taro.navigateTo({ url: '/pages/invite/index' })}
                >
                  <Text className="menu-item-text">邀请好友</Text>
                  <Text className="menu-item-arrow">›</Text>
                </View>
                <View
                  className="menu-item"
                  onClick={() => {
                    Taro.showToast({ title: '功能开发中', icon: 'none' })
                  }}
                >
                  <Text className="menu-item-text">我的收藏</Text>
                  <Text className="menu-item-arrow">›</Text>
                </View>
                <View
                  className="menu-item"
                  onClick={() => {
                    Taro.showToast({ title: '功能开发中', icon: 'none' })
                  }}
                >
                  <Text className="menu-item-text">设置</Text>
                  <Text className="menu-item-arrow">›</Text>
                </View>
              </CardContent>
            </Card>
          </View>
        )}

        {/* 关于信息 */}
        <View className="about-section">
          <Card>
            <CardHeader>
              <CardTitle>关于</CardTitle>
            </CardHeader>
            <CardContent>
              <Text className="about-text">
                TCM-BTI 中医体质评估系统{'\n'}
                版本 1.0.0{'\n'}
                探寻身体的山水画卷，解码您的体质语言
              </Text>
            </CardContent>
          </Card>
        </View>
      </View>
    </ScrollView>
  )
}

// 不再使用 TARO_APP_API_URL 常量，直接硬编码生产域名
