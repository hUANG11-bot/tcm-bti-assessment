import React, { useState, useEffect } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useAuth } from '@/hooks/useAuth'
import { trpc } from '@/lib/trpc'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button as UIButton } from '@/components/ui/button'
import './index.scss'

export default function InvitePage() {
  const { user } = useAuth()
  const [inviteUrl, setInviteUrl] = useState('')
  const [inviteCode, setInviteCode] = useState('')

  const createInviteMutation = trpc.invitation.create.useMutation()
  const { data: stats, refetch: refetchStats } = trpc.invitation.myStats.useQuery(undefined, {
    enabled: !!user,
  })

  useEffect(() => {
    if (user && !inviteCode) {
      handleGenerateInvite()
    }
  }, [user])

  const handleGenerateInvite = async () => {
    try {
      const result = await createInviteMutation.mutateAsync()
      setInviteCode(result.inviteCode)
      setInviteUrl(result.inviteUrl)
      refetchStats()
    } catch (error) {
      console.error('Failed to generate invite:', error)
      Taro.showToast({ title: '生成邀请链接失败', icon: 'none' })
    }
  }

  const handleCopyLink = () => {
    if (!inviteUrl) return
    Taro.setClipboardData({
      data: inviteUrl,
      success: () => {
        Taro.showToast({ title: '邀请链接已复制', icon: 'success' })
      }
    })
  }

  const handleShare = () => {
    if (!inviteUrl) return
    // 小程序分享功能在onShareAppMessage中处理
    Taro.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    })
  }

  // 分享配置在页面config中设置

  if (!user) {
    return (
      <View className="invite-page">
        <View className="empty-state">
          <Text className="empty-text">请先登录以查看邀请功能</Text>
        </View>
      </View>
    )
  }

  return (
    <ScrollView className="invite-page" scrollY>
      <View className="invite-container">
        <View className="page-header">
          <Text className="page-title">邀请好友</Text>
          <Text className="page-subtitle">分享健康，共同成长</Text>
        </View>

        {/* 邀请统计 */}
        <View className="stats-grid">
          <Card>
            <CardHeader>
              <CardTitle>总邀请数</CardTitle>
            </CardHeader>
            <CardContent>
              <Text className="stat-value">{stats?.totalInvites || 0}</Text>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>已完成</CardTitle>
            </CardHeader>
            <CardContent>
              <Text className="stat-value completed">{stats?.completedInvites || 0}</Text>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>待完成</CardTitle>
            </CardHeader>
            <CardContent>
              <Text className="stat-value pending">{stats?.pendingInvites || 0}</Text>
            </CardContent>
          </Card>
        </View>

        {/* 邀请链接卡片 */}
        <Card>
          <CardHeader>
            <CardTitle>您的专属邀请链接</CardTitle>
            <CardDescription>
              邀请好友完成测评，解锁更多养生内容
            </CardDescription>
          </CardHeader>
          <CardContent>
            <View className="invite-link-section">
              <View className="link-input-wrapper">
                <Text className="link-text">{inviteUrl || '生成中...'}</Text>
              </View>
              <View className="link-actions">
                <UIButton variant="outline" onClick={handleCopyLink}>
                  复制
                </UIButton>
                <UIButton onClick={handleShare}>
                  分享
                </UIButton>
              </View>
            </View>

            <View className="reward-section">
              <Text className="reward-title">🎁 邀请奖励</Text>
              <View className="reward-list">
                <Text className="reward-item">• 邀请 <Text className="reward-highlight">3位</Text> 好友完成测评，解锁专属养生方案</Text>
                <Text className="reward-item">• 邀请 <Text className="reward-highlight">10位</Text> 好友完成测评，获得中医专家在线咨询机会</Text>
                <Text className="reward-item">• 邀请 <Text className="reward-highlight">30位</Text> 好友完成测评，免费获得定制化调理产品</Text>
              </View>
            </View>
          </CardContent>
        </Card>

        {/* 邀请记录 */}
        {stats && stats.invitations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>邀请记录</CardTitle>
            </CardHeader>
            <CardContent>
              <View className="invitations-list">
                {stats.invitations.slice(0, 10).map((inv) => (
                  <View key={inv.id} className="invitation-item">
                    <View className="invitation-info">
                      <View className={`status-dot ${inv.status === 'completed' ? 'completed' : 'pending'}`} />
                      <View className="invitation-details">
                        <Text className="invitation-code">邀请码: {inv.inviteCode}</Text>
                        <Text className="invitation-date">
                          {new Date(inv.createdAt).toLocaleDateString()}
                        </Text>
                      </View>
                    </View>
                    <Text className={`invitation-status ${inv.status === 'completed' ? 'completed' : 'pending'}`}>
                      {inv.status === 'completed' ? '已完成' : '待完成'}
                    </Text>
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
