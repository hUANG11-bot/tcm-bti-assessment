import React, { createContext, useContext, useState, ReactNode } from 'react'
import { AssessmentResult } from '@/lib/algorithm'
import { generateAdvancedAssessmentResult } from '@/lib/advancedAlgorithm'
import { UserInfo } from '@/lib/types'

interface AssessmentContextType {
  userInfo: UserInfo | null
  setUserInfo: (info: UserInfo) => void
  answers: { [key: string]: string }
  setAnswer: (questionId: string, value: string) => void
  result: AssessmentResult | null
  calculateResult: () => void
  resetAssessment: () => void
}

const AssessmentContext = createContext<AssessmentContextType | undefined>(undefined)

export function AssessmentProvider({ children }: { children: ReactNode }) {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [answers, setAnswers] = useState<{ [key: string]: string }>({})
  const [result, setResult] = useState<AssessmentResult | null>(null)

  const setAnswer = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }))
  }

  const calculateResult = () => {
    // 使用高级算法生成结果
    const res = generateAdvancedAssessmentResult(answers, userInfo)
    setResult(res)
  }

  const resetAssessment = () => {
    setUserInfo(null)
    setAnswers({})
    setResult(null)
  }

  return (
    <AssessmentContext.Provider value={{ userInfo, setUserInfo, answers, setAnswer, result, calculateResult, resetAssessment }}>
      {children}
    </AssessmentContext.Provider>
  )
}

export function useAssessment() {
  const context = useContext(AssessmentContext)
  if (context === undefined) {
    throw new Error('useAssessment must be used within an AssessmentProvider')
  }
  return context
}
