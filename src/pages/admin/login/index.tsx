import React, { useState } from 'react'
import { View, Text, Input } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { Button } from '@/components/ui/button'
import { Input as UIInput } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import './index.scss'

// 声明 TARO_APP_API_URL 常量
declare const TARO_APP_API_URL: string

export default function AdminLoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    if (!username || !password) {
      Taro.showToast({ title: '请输入用户名和密码', icon: 'none' })
      return
    }

    setLoading(true)
    try {
      const response = await Taro.request({
        url: '/api/admin/login',
        method: 'POST',
        data: { username, password },
      })

      if (response.statusCode === 200) {
        Taro.showToast({ title: '登录成功', icon: 'success' })
        setTimeout(() => {
          Taro.redirectTo({ url: '/pages/admin/index' })
        }, 1500)
      } else {
        Taro.showToast({ title: '登录失败，请检查用户名和密码', icon: 'none' })
      }
    } catch (error) {
      console.error('Login failed:', error)
      Taro.showToast({ title: '登录失败，请稍后重试', icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <View className="admin-login-page">
      <View className="login-container">
        <Card>
          <CardHeader>
            <CardTitle>管理员登录</CardTitle>
          </CardHeader>
          <CardContent>
            <View className="login-form">
              <View className="form-item">
                <Text className="form-label">用户名</Text>
                <UIInput
                  type="text"
                  placeholder="请输入用户名"
                  value={username}
                  onInput={(e) => setUsername(e.detail.value)}
                />
              </View>

              <View className="form-item">
                <Text className="form-label">密码</Text>
                <UIInput
                  type="password"
                  placeholder="请输入密码"
                  value={password}
                  onInput={(e) => setPassword(e.detail.value)}
                  password
                />
              </View>

              <Button
                className="login-button"
                onClick={handleLogin}
                disabled={loading}
              >
                {loading ? '登录中...' : '登录'}
              </Button>
            </View>
          </CardContent>
        </Card>
      </View>
    </View>
  )
}
