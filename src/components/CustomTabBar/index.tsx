import React, { useState, useEffect } from 'react'
import { View, Text } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import './index.scss'

const tabList = [
  {
    pagePath: '/pages/index/index',
    text: '首页',
  },
  {
    pagePath: '/pages/profile/index',
    text: '我的',
  },
]

export default function CustomTabBar() {
  const router = useRouter()
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const pages = Taro.getCurrentPages()
    const currentPage = pages[pages.length - 1]
    const currentPath = '/' + currentPage.route

    const index = tabList.findIndex(tab => tab.pagePath === currentPath)
    if (index !== -1) {
      setCurrent(index)
    }
  }, [])

  const switchTab = (index: number) => {
    const tab = tabList[index]
    setCurrent(index)
    Taro.switchTab({
      url: tab.pagePath,
    })
  }

  return (
    <View className="custom-tab-bar">
      {tabList.map((tab, index) => (
        <View
          key={index}
          className={`tab-item ${current === index ? 'active' : ''}`}
          onClick={() => switchTab(index)}
        >
          <Text className="tab-text">{tab.text}</Text>
        </View>
      ))}
    </View>
  )
}
