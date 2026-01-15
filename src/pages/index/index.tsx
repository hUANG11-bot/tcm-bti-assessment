import React, { useEffect } from 'react'
import { View, Text, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import './index.scss'

export default function Index() {
  useEffect(() => {
    console.log('[Index] 页面已加载')
  }, [])

  const handleStartAssessment = () => {
    console.log('开始体质测评按钮被点击')
    Taro.navigateTo({ 
      url: '/pages/user-info/index',
      success: () => {
        console.log('页面跳转成功')
      },
      fail: (err) => {
        console.error('页面跳转失败:', err)
        Taro.showToast({ title: '跳转失败: ' + err.errMsg, icon: 'none' })
      }
    })
  }

  const handleLearnMore = () => {
    Taro.showToast({ title: '功能开发中', icon: 'none' })
  }

  return (
    <View className="index-page">
      <View className="hero-section">
        <View className="hero-content">
          <Text className="hero-title">
            探寻身体的{'\n'}
            <Text className="accent-text">山水画卷</Text>
          </Text>
          <Text className="hero-description">
            TCM-BTI 是一套重构中医体质理论的数字化健康解决方案。{'\n'}
            通过四维二元辨识体系，解码您的身体语言，定制专属养生方案。
          </Text>
        </View>

        <View className="action-buttons">
          <Button 
            className="primary-button" 
            onClick={handleStartAssessment}
            type="primary"
          >
            开始体质测评
          </Button>
          <Button 
            className="secondary-button"
            onClick={handleLearnMore}
          >
            了解更多
          </Button>
        </View>

        <View className="features-grid">
          <FeatureItem title="16种" desc="基础体质" />
          <FeatureItem title="五级" desc="梯度判定" />
          <FeatureItem title="四维" desc="核心维度" />
          <FeatureItem title="定制" desc="调理方案" />
        </View>
      </View>
    </View>
  )
}

function FeatureItem({ title, desc }: { title: string; desc: string }) {
  return (
    <View className="feature-item">
      <Text className="feature-title">{title}</Text>
      <Text className="feature-desc">{desc}</Text>
    </View>
  )
}
