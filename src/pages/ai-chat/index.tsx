import React, { useState, useRef, useEffect } from 'react'
import { View, Text, ScrollView, Input, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { trpc } from '@/lib/trpc'
import { useAssessment } from '@/contexts/AssessmentContext'
import './index.scss'

type Message = {
  role: 'user' | 'assistant'
  content: string
}

export default function AIChatPage() {
  const { result } = useAssessment()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const scrollViewRef = useRef<any>(null)

  const chatMutation = trpc.ai.chat.useMutation()

  // 从路由参数或Context获取体质类型
  const [bodyType, setBodyType] = useState('')
  
  useEffect(() => {
    // 优先从路由参数获取
    const pages = Taro.getCurrentPages()
    const currentPage = pages[pages.length - 1]
    const options = currentPage.options || {}
    
    if (options.bodyType) {
      setBodyType(decodeURIComponent(options.bodyType))
    } else if (result?.mainType) {
      // 如果没有路由参数，从Context获取
      setBodyType(result.mainType)
    }
  }, [result])

  // 初始化欢迎消息
  useEffect(() => {
    if (messages.length === 0 && bodyType !== undefined) {
      setMessages([
        {
          role: 'assistant',
          content: bodyType 
            ? `您好！我是AI中医助手。根据您的测评结果，您的体质类型是${bodyType}。我可以为您解答关于体质、调理、健康等方面的问题，有什么想问的吗？`
            : '您好！我是AI中医助手。我可以为您解答关于中医体质、健康调理等方面的问题，有什么想问的吗？',
        },
      ])
    }
  }, [bodyType, messages.length])

  // 自动滚动到底部
  // 注意：Taro ScrollView 使用 scrollIntoView 属性，不需要手动调用方法
  // scrollIntoView 会在消息更新时自动滚动到指定元素

  // 发送消息
  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
    }

    // 添加用户消息
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInput('')
    setIsLoading(true)

    try {
      // 调用AI接口
      const response = await chatMutation.mutateAsync({
        messages: newMessages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
        bodyType: bodyType || undefined,
      })

      // 添加AI回复
      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          content: response.content,
        },
      ])
    } catch (error: any) {
      console.error('AI对话失败:', error)
      
      // 显示更详细的错误信息
      let errorMessage = '发送失败，请稍后重试'
      
      if (error?.message) {
        errorMessage = error.message
      } else if (error?.data?.message) {
        errorMessage = error.data.message
      } else if (typeof error === 'string') {
        errorMessage = error
      }
      
      // 如果是网络错误，提供更友好的提示
      if (errorMessage.includes('request:fail') || errorMessage.includes('url not in domain')) {
        errorMessage = '无法连接到服务器，请检查:\n1. 后端服务是否运行\n2. 是否关闭了域名校验 (微信开发者工具 → 详情 → 本地设置)'
      } else if (errorMessage.includes('AI服务') || errorMessage.includes('余额不足') || errorMessage.includes('Balance')) {
        errorMessage = 'AI服务暂时不可用\n\n可能原因:\n1. 账户余额不足\n2. API密钥配置错误\n\n请查看后端日志或运行 pnpm test-ai-chat 诊断'
      } else if (errorMessage.includes('无法连接') || errorMessage.includes('连接失败')) {
        errorMessage = '无法连接到服务器\n\n请检查:\n1. 后端服务是否运行 (运行 pnpm dev)\n2. 端口配置是否正确\n3. 是否关闭了域名校验'
      }
      
      Taro.showToast({
        title: errorMessage,
        icon: 'none',
        duration: 3000,
      })
      
      // 移除用户消息（因为发送失败）
      setMessages(messages)
    } finally {
      setIsLoading(false)
    }
  }

  // 快捷问题
  const quickQuestions = [
    '我的体质有什么特点？',
    '适合吃什么食物？',
    '有什么运动建议？',
    '需要注意什么？',
  ]

  const handleQuickQuestion = (question: string) => {
    setInput(question)
  }

  return (
    <View className="ai-chat-page">
      {/* 头部 */}
      <View className="chat-header">
        <Text className="chat-title">AI中医咨询</Text>
        {bodyType && (
          <Text className="chat-subtitle">您的体质：{bodyType}</Text>
        )}
      </View>

      {/* 消息列表 */}
      <ScrollView
        ref={scrollViewRef}
        className="chat-messages"
        scrollY
        scrollIntoView={`message-${messages.length - 1}`}
      >
        <View className="messages-container">
          {messages.map((message, index) => (
            <View
              key={index}
              id={`message-${index}`}
              className={`message-item ${message.role === 'user' ? 'user' : 'assistant'}`}
            >
              <View className="message-content">
                <Text className="message-text">{message.content}</Text>
              </View>
            </View>
          ))}
          
          {isLoading && (
            <View className="message-item assistant">
              <View className="message-content">
                <View className="loading-dots">
                  <Text className="dot">·</Text>
                  <Text className="dot">·</Text>
                  <Text className="dot">·</Text>
                </View>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* 快捷问题（仅在第一条消息时显示） */}
      {messages.length === 1 && (
        <View className="quick-questions">
          <Text className="quick-title">常见问题：</Text>
          <View className="quick-list">
            {quickQuestions.map((q, index) => (
              <View
                key={index}
                className="quick-item"
                onClick={() => handleQuickQuestion(q)}
              >
                <Text className="quick-text">{q}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* 输入区域 */}
      <View className="chat-input-area">
        <Input
          className="chat-input"
          type="text"
          placeholder="输入您的问题..."
          value={input}
          onInput={(e) => setInput(e.detail.value)}
          confirmType="send"
          onConfirm={handleSend}
        />
        <Button
          className="send-button"
          onClick={handleSend}
          disabled={!input.trim() || isLoading}
        >
          {isLoading ? '发送中' : '发送'}
        </Button>
      </View>
    </View>
  )
}
