import React, { Component } from 'react'
// 必须在最前面导入 polyfill
import './lib/abort-controller-polyfill'
import Taro from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import { AssessmentProvider } from './contexts/AssessmentContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { trpc, queryClient, trpcClient } from './lib/trpc'
import { QueryClientProvider } from '@tanstack/react-query'
import './app.scss'

class App extends Component {
  componentDidMount() {
    // 小程序启动时的初始化逻辑
    console.log('[App] componentDidMount')
  }

  componentDidShow() {
    // 小程序显示时的逻辑
    console.log('[App] componentDidShow')
  }

  componentDidHide() {
    // 小程序隐藏时的逻辑
    console.log('[App] componentDidHide')
  }

  componentDidCatch(error, errorInfo) {
    // 捕获子组件树中的错误
    console.error('[App] componentDidCatch:', error, errorInfo)
    Taro.showToast({
      title: '应用错误，请刷新重试',
      icon: 'none',
      duration: 3000
    })
  }

  // 在 App 类中的 render 方法
  render() {
    // this.props.children 是将要会渲染的页面
    try {
      console.log('[App] render')
      return (
        <trpc.Provider client={trpcClient} queryClient={queryClient}>
          <QueryClientProvider client={queryClient}>
            <ThemeProvider defaultTheme="light">
              <AssessmentProvider>
                {this.props.children}
              </AssessmentProvider>
            </ThemeProvider>
          </QueryClientProvider>
        </trpc.Provider>
      )
    } catch (error) {
      console.error('[App] render error:', error)
      return (
        <View style={{ padding: '40rpx', textAlign: 'center' }}>
          <Text>应用初始化失败，请刷新重试</Text>
        </View>
      )
    }
  }
}

export default App
