import React, { useState, useEffect } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { trpc } from '@/lib/trpc'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import './index.scss'

// 声明 TARO_APP_API_URL 常量
declare const TARO_APP_API_URL: string

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [adminInfo, setAdminInfo] = useState<{ id: number; username: string } | null>(null)
  const [checkingAuth, setCheckingAuth] = useState(true)

  // 检查管理员登录状态
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const API_BASE_URL = typeof TARO_APP_API_URL !== 'undefined' ? TARO_APP_API_URL : 'https://er1.store'
        const response = await Taro.request({
          url: `${API_BASE_URL}/api/admin/check`,
          method: 'GET',
        })

        if (response.statusCode === 200 && response.data.isAuthenticated) {
          setIsAuthenticated(true)
          setAdminInfo(response.data.admin)
        } else {
          setIsAuthenticated(false)
          // 未登录，跳转到登录页
          Taro.redirectTo({ url: '/pages/admin/login/index' })
        }
      } catch (error) {
        console.error('Check auth failed:', error)
        setIsAuthenticated(false)
        Taro.redirectTo({ url: '/pages/admin/login/index' })
      } finally {
        setCheckingAuth(false)
      }
    }

    checkAuth()
  }, [])

  // 获取统计数据
  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = trpc.assessment.stats.useQuery(
    undefined,
    {
      enabled: isAuthenticated,
      retry: false,
    }
  )

  // 获取所有测评记录
  const { data: assessments, isLoading: assessmentsLoading, refetch: refetchAssessments } = trpc.assessment.all.useQuery(
    undefined,
    {
      enabled: isAuthenticated,
      retry: false,
    }
  )

  // 退出登录
  const handleLogout = async () => {
    try {
      const API_BASE_URL = typeof TARO_APP_API_URL !== 'undefined' ? TARO_APP_API_URL : 'https://tci-184647-5-1377481866.sh.run.tcloudbase.com'
      await Taro.request({
        url: `${API_BASE_URL}/api/admin/logout`,
        method: 'POST',
      })
      Taro.showToast({ title: '已退出登录', icon: 'success' })
      Taro.redirectTo({ url: '/pages/admin/login/index' })
    } catch (error) {
      console.error('Logout failed:', error)
      Taro.showToast({ title: '退出失败', icon: 'none' })
    }
  }

  if (checkingAuth || statsLoading || assessmentsLoading) {
    return (
      <View className="admin-page">
        <View className="loading-state">
          <Text className="loading-text">加载中...</Text>
        </View>
      </View>
    )
  }

  if (!isAuthenticated) {
    return (
      <View className="admin-page">
        <View className="empty-state">
          <Text className="empty-title">请先登录</Text>
          <Button onClick={() => Taro.redirectTo({ url: '/pages/admin/login/index' })}>
            前往登录
          </Button>
        </View>
      </View>
    )
  }

  const handleExportCSV = () => {
    if (!assessments || assessments.length === 0) {
      Taro.showToast({ title: '暂无数据', icon: 'none' })
      return
    }

    const headers = ['ID', '用户ID', '年龄', '性别', '主要体质', '次要体质', '创建时间']
    const rows = assessments.map(a => [
      a.id,
      a.userId || '-',
      a.age,
      a.gender === 'male' ? '男' : '女',
      a.primaryType,
      a.secondaryType || '-',
      new Date(a.createdAt).toLocaleString('zh-CN'),
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n')

    // 小程序中无法直接下载文件，可以复制到剪贴板或显示
    Taro.setClipboardData({
      data: csvContent,
      success: () => {
        Taro.showToast({ title: '数据已复制到剪贴板', icon: 'success' })
      }
    })
  }

  const typeChartData = stats?.typeDistribution
    ? Object.entries(stats.typeDistribution).map(([name, value]) => ({ name, value }))
    : []

  const genderChartData = stats?.genderDistribution
    ? Object.entries(stats.genderDistribution).map(([name, value]) => ({ 
        name: name === 'male' ? '男' : '女', 
        value 
      }))
    : []

  return (
    <ScrollView className="admin-page" scrollY>
      <View className="admin-container">
        <View className="page-header">
          <View className="header-top">
            <View>
              <Text className="page-title">管理后台</Text>
              <Text className="page-subtitle">数据统计与分析</Text>
            </View>
            <View className="admin-info">
              <Text className="admin-name">{adminInfo?.username || '管理员'}</Text>
              <Button 
                onClick={handleLogout}
                variant="outline"
                className="logout-btn"
              >
                退出
              </Button>
            </View>
          </View>
        </View>

        {/* 统计卡片 */}
        <View className="stats-grid">
          <Card>
            <CardHeader>
              <CardTitle>总测评数</CardTitle>
            </CardHeader>
            <CardContent>
              <Text className="stat-value">{stats?.totalAssessments || 0}</Text>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>今日新增</CardTitle>
            </CardHeader>
            <CardContent>
              <Text className="stat-value">{stats?.todayAssessments || 0}</Text>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>用户总数</CardTitle>
            </CardHeader>
            <CardContent>
              <Text className="stat-value">{stats?.totalUsers || 0}</Text>
            </CardContent>
          </Card>
        </View>

        {/* 体质分布 */}
        {typeChartData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>体质类型分布</CardTitle>
            </CardHeader>
            <CardContent>
              <View className="distribution-list">
                {typeChartData.map((item, index) => (
                  <View key={index} className="distribution-item">
                    <Text className="distribution-name">{item.name}</Text>
                    <View className="distribution-bar-wrapper">
                      <View 
                        className="distribution-bar"
                        style={{ width: `${(item.value / (stats?.totalAssessments || 1)) * 100}%` }}
                      />
                    </View>
                    <Text className="distribution-value">{item.value}</Text>
                  </View>
                ))}
              </View>
            </CardContent>
          </Card>
        )}

        {/* 性别分布 */}
        {genderChartData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>性别分布</CardTitle>
            </CardHeader>
            <CardContent>
              <View className="gender-grid">
                {genderChartData.map((item, index) => (
                  <View key={index} className="gender-item">
                    <Text className="gender-name">{item.name}</Text>
                    <Text className="gender-value">{item.value}</Text>
                  </View>
                ))}
              </View>
            </CardContent>
          </Card>
        )}

        {/* 数据导出 */}
        <Card>
          <CardHeader>
            <CardTitle>数据管理</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={handleExportCSV} variant="outline">
              导出CSV数据
            </Button>
          </CardContent>
        </Card>

        {/* 测评列表 */}
        {assessments && assessments.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>最近测评记录</CardTitle>
            </CardHeader>
            <CardContent>
              <View className="assessments-list">
                {assessments.slice(0, 10).map((assessment) => (
                  <View key={assessment.id} className="assessment-item">
                    <View className="assessment-info">
                      <Text className="assessment-type">{assessment.primaryType}</Text>
                      <Text className="assessment-meta">
                        {assessment.age}岁 · {assessment.gender === 'male' ? '男' : '女'} · {new Date(assessment.createdAt).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </CardContent>
          </Card>
        )}
      </View>
    </ScrollView>
  )
}
