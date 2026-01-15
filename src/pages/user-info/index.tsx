import React, { useState } from 'react'
import { View, Text, Input, Button, Label, Radio, RadioGroup, Checkbox, CheckboxGroup } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useAssessment } from '@/contexts/AssessmentContext'
import { HABITS } from '@/lib/constants'
import './index.scss'

export default function UserInfoPage() {
  const { setUserInfo } = useAssessment()
  
  const [age, setAge] = useState('')
  const [gender, setGender] = useState<'male' | 'female'>('male')
  const [selectedHabits, setSelectedHabits] = useState<string[]>([])

  const handleSubmit = () => {
    if (!age || parseInt(age) < 1 || parseInt(age) > 120) {
      Taro.showToast({ title: '请输入有效年龄', icon: 'none' })
      return
    }

    setUserInfo({
      age: parseInt(age),
      gender,
      habits: selectedHabits,
    })

    Taro.navigateTo({ url: '/pages/assessment/index' })
  }

  return (
    <View className="user-info-page">
      <View className="form-container">
        <View className="form-header">
          <Text className="form-title">基本信息</Text>
          <Text className="form-desc">为了提供更精准的体质分析，请填写以下信息</Text>
        </View>

        <View className="form-content">
          <View className="form-item">
            <Label className="form-label">年龄</Label>
            <Input
              className="form-input"
              type="number"
              placeholder="请输入您的年龄"
              value={age}
              onInput={(e) => setAge(e.detail.value)}
            />
          </View>

          <View className="form-item">
            <Label className="form-label">性别</Label>
            <RadioGroup onChange={(e) => setGender(e.detail.value as 'male' | 'female')}>
              <Label className="radio-label">
                <Radio value="male" checked={gender === 'male'} />
                <Text>男</Text>
              </Label>
              <Label className="radio-label">
                <Radio value="female" checked={gender === 'female'} />
                <Text>女</Text>
              </Label>
            </RadioGroup>
          </View>

          <View className="form-item">
            <Label className="form-label">生活习惯（可多选）</Label>
            <CheckboxGroup onChange={(e) => setSelectedHabits(e.detail.value)}>
              {HABITS.map((habit) => (
                <Label key={habit.value} className="checkbox-label">
                  <Checkbox value={habit.value} checked={selectedHabits.includes(habit.value)} />
                  <Text>{habit.label}</Text>
                </Label>
              ))}
            </CheckboxGroup>
          </View>

          <Button className="submit-button" onClick={handleSubmit}>
            开始测评
          </Button>
        </View>
      </View>
    </View>
  )
}
