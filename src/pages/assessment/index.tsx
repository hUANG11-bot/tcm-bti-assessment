import React, { useState, useEffect } from 'react'
import { View, Text, Button, Progress } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useAssessment } from '@/contexts/AssessmentContext'
import { QUESTIONS, GOLDEN_QUESTIONS, DIMENSIONS } from '@/lib/constants'
import { calculateDimensionScore } from '@/lib/algorithm'
import './index.scss'

export default function AssessmentPage() {
  const { answers, setAnswer, calculateResult } = useAssessment()
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [activeQuestions, setActiveQuestions] = useState(QUESTIONS)

  const handleOptionSelect = (value: string) => {
    const currentQ = activeQuestions[currentQuestionIndex]
    setAnswer(currentQ.id, value)

    // 检查是否需要插入Golden Questions
    const currentDimension = currentQ.dimension
    const nextQ = activeQuestions[currentQuestionIndex + 1]
    
    if (!nextQ || nextQ.dimension !== currentDimension) {
      const tempAnswers = { ...answers, [currentQ.id]: value }
      const result = calculateDimensionScore(tempAnswers, currentDimension)
      
      if (result.diff >= 1 && result.diff <= 2) {
        const gqs = GOLDEN_QUESTIONS.filter(gq => gq.dimension === currentDimension)
        const alreadyInserted = activeQuestions.some(q => q.id === gqs[0]?.id)
        
        if (!alreadyInserted && gqs.length > 0) {
          const newQuestions = [...activeQuestions]
          newQuestions.splice(currentQuestionIndex + 1, 0, ...gqs)
          setActiveQuestions(newQuestions)
        }
      }
    }

    if (currentQuestionIndex < activeQuestions.length - 1) {
      setTimeout(() => setCurrentQuestionIndex(prev => prev + 1), 300)
    } else {
      calculateResult()
      Taro.redirectTo({ url: '/pages/result/index' })
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1)
    }
  }

  const currentQuestion = activeQuestions[currentQuestionIndex]
  
  if (!currentQuestion) {
    return null
  }

  const progress = ((currentQuestionIndex + 1) / activeQuestions.length) * 100
  const dimensionInfo = DIMENSIONS[currentQuestion.dimension]

  return (
    <View className="assessment-page">
      <View className="progress-section">
        <View className="progress-info">
          <Text className="progress-text">进度 {currentQuestionIndex + 1} / {activeQuestions.length}</Text>
          <Text className="dimension-text" style={{ color: dimensionInfo.color }}>
            当前维度: {dimensionInfo.name}
          </Text>
        </View>
        <Progress percent={progress} strokeWidth={4} activeColor={dimensionInfo.color} />
      </View>

      <View className="question-card">
        <View className="question-content">
          <Text className="question-text">{currentQuestion.text}</Text>
          {currentQuestion.isGolden && (
            <View className="golden-badge">
              <Text>决胜题触发</Text>
            </View>
          )}
        </View>

        <View className="options-list">
          {currentQuestion.options.map((option, index) => (
            <Button
              key={index}
              className={`option-button ${answers[currentQuestion.id] === option.value ? 'selected' : ''}`}
              onClick={() => handleOptionSelect(option.value)}
            >
              <Text className="option-text">{option.label}</Text>
              {answers[currentQuestion.id] === option.value && (
                <View className="selected-indicator" />
              )}
            </Button>
          ))}
        </View>
      </View>

      <View className="navigation-buttons">
        <Button 
          className="nav-button"
          onClick={handlePrevious} 
          disabled={currentQuestionIndex === 0}
        >
          上一题
        </Button>
      </View>
    </View>
  )
}
