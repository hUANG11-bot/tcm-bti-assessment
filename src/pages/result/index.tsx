import React, { useState, useEffect, useMemo } from 'react'
import { View, Text, ScrollView, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useAssessment } from '@/contexts/AssessmentContext'
import { trpc } from '@/lib/trpc'
import { setReportShare } from '@/lib/wechat'
import { Button as UIButton } from '@/components/ui/button'
import {
  calculateTraditionalBodyTypeScores,
  getPrimaryBodyType,
  getSecondaryBodyType,
} from '@/lib/traditionalBodyTypes'
import './index.scss'

// 详细说明数据（根据主要体质类型）
const DETAILED_EXPLANATIONS: Record<string, {
  meaning: string;
  causes: string[];
  troubles: string[];
  warnings: string[];
  dailyAdvice: string;
}> = {
  '阳虚质': {
    meaning: '火力不够,阳气不足。怕冷!怕冷!怕冷!要吃热,穿暖。',
    causes: [
      '熬夜,总是超过23点也不睡觉。',
      '冷饮和凉茶是日常饮品。',
      '离空调近一点,才够凉快。',
      '冬季,还习惯光脚穿鞋。',
      '曾经纵欲过度。',
      '穿衣戴帽,要风度不要温度。',
      '过度控制饮食,营养不良。',
      '先天禀赋不足,父母为阳虚质。或父母婚育年龄太大,孕期吃了太多寒凉食物等。',
      '吃了太多的生冷寒凉或者工作环境湿冷。',
      '长期、大量用抗生素、激素类、利尿剂、清热解毒中药。',
      '久病损伤阳气。',
      '长期大量运动,或喜欢桑拿,出汗过度。',
      '汗出当风,大汗淋漓之后,总是要吹风,甚至冲凉。',
    ],
    troubles: [
      '手脚冰凉，怕冷',
      '容易疲劳，精神不振',
      '腰膝酸软',
      '性功能减退',
      '容易感冒',
    ],
    warnings: [
      '阳虚体质随着年龄的增长会变成阳虚兼血瘀、阳虚兼痰湿。',
      '注意保暖，避免受寒',
      '避免过度劳累',
    ],
    dailyAdvice: '温阳散寒，多吃温热食物，注意保暖，适度运动。',
  },
  '气虚质': {
    meaning: '元气不足，容易疲劳，气短懒言。',
    causes: [
      '先天禀赋不足',
      '久病体虚',
      '过度劳累',
      '饮食不节',
    ],
    troubles: [
      '容易疲劳',
      '气短懒言',
      '容易出汗',
      '免疫力低下',
    ],
    warnings: [
      '注意休息，避免过度劳累',
      '预防感冒',
    ],
    dailyAdvice: '补气健脾，多吃补气食物，适度运动。',
  },
  '阴虚质': {
    meaning: '阴液不足，虚火内生。',
    causes: [
      '熬夜伤阴',
      '过度劳累',
      '饮食辛辣',
    ],
    troubles: [
      '口干舌燥',
      '手足心热',
      '失眠多梦',
      '大便干结',
    ],
    warnings: [
      '避免熬夜',
      '少吃辛辣食物',
    ],
    dailyAdvice: '滋阴润燥，多吃滋阴食物，保证充足睡眠。',
  },
  // 可以继续添加其他体质的详细说明
};

export default function ResultPage() {
  const { result, resetAssessment, userInfo, answers } = useAssessment()
  const [isSaving, setIsSaving] = useState(false)
  const [savedAssessmentId, setSavedAssessmentId] = useState<number | null>(null)
  const [expandedSection, setExpandedSection] = useState<string | null>(null)
  const createAssessmentMutation = trpc.assessment.create.useMutation()

  // 计算传统体质得分
  const traditionalScores = useMemo(() => {
    if (!result) return []
    return calculateTraditionalBodyTypeScores(result.dimensions)
  }, [result])

  const primaryType = useMemo(() => {
    if (!traditionalScores.length) return '平和质'
    return getPrimaryBodyType(traditionalScores)
  }, [traditionalScores])

  const secondaryType = useMemo(() => {
    if (!traditionalScores.length) return null
    return getSecondaryBodyType(traditionalScores)
  }, [traditionalScores])


  // 自动保存测评结果到数据库
  useEffect(() => {
    if (!result || !userInfo || !answers || savedAssessmentId || isSaving) return

    const saveAssessment = async () => {
      try {
        setIsSaving(true)
        const numericAnswers: Record<string, number> = {}
        Object.entries(answers).forEach(([key, value]) => {
          numericAnswers[key] = parseInt(value, 10) || 0
        })

        const scores: Record<string, number> = {}
        result.dimensions.forEach(dim => {
          scores[`${dim.dimension}_left`] = dim.scoreLeft
          scores[`${dim.dimension}_right`] = dim.scoreRight
          scores[`${dim.dimension}_diff`] = dim.diff
        })

        const assessment = await createAssessmentMutation.mutateAsync({
          age: userInfo.age,
          gender: userInfo.gender,
          habits: userInfo.habits,
          answers: numericAnswers,
          primaryType: primaryType,
          secondaryType: secondaryType || undefined,
          scores,
          fullReport: result,
        })
        setSavedAssessmentId(assessment.id)
      } catch (error) {
        console.error('Failed to save assessment:', error)
      } finally {
        setIsSaving(false)
      }
    }

    saveAssessment()
  }, [result, userInfo, answers, savedAssessmentId, isSaving, createAssessmentMutation, primaryType, secondaryType])

  // 配置微信分享
  useEffect(() => {
    if (result) {
      setReportShare(primaryType)
    }
  }, [result, primaryType])

  // 小程序分享配置
  const onShareAppMessage = () => {
    if (!result) return {}
    return {
      title: `我的体质是【${primaryType}】`,
      desc: '我刚完成了TCM-BTI体质评估，快来测测你的体质吧！',
      path: '/pages/index/index',
    }
  }

  // 切换展开/收起
  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section)
  }

  // 保存结果
  const handleSaveResult = () => {
    if (savedAssessmentId) {
      Taro.showToast({ title: '结果已保存', icon: 'success' })
    } else {
      Taro.showToast({ title: '正在保存...', icon: 'loading' })
    }
  }

  // 获取详细说明
  const getDetailedExplanation = () => {
    return DETAILED_EXPLANATIONS[primaryType] || DETAILED_EXPLANATIONS['阳虚质']
  }

  if (!result) {
    return (
      <View className="result-page">
          <View className="empty-state">
          <Text className="empty-text">暂无评估结果</Text>
          <UIButton onClick={() => Taro.navigateTo({ url: '/pages/assessment/index' })}>
            开始测评
          </UIButton>
        </View>
      </View>
    )
  }

  const detailedExplanation = getDetailedExplanation()
  const maxScore = Math.max(...traditionalScores.map(s => s.score), 5) || 5

  return (
    <View className="result-page">
      <ScrollView className="result-scroll" scrollY>
        <View className="result-container">
          {/* 标题 */}
          <View className="result-header">
            <Text className="result-title">体质测试结果</Text>
          </View>

          {/* 主要体质类型 */}
          <View className="primary-type-section">
            <Text className="primary-type-label">你的体质</Text>
            <View className="primary-type-boxes">
              {primaryType.split('').map((char, idx) => (
                <View key={idx} className="primary-type-box">
                  <Text className="primary-type-char">{char}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* 兼有体质 */}
          {secondaryType && (
            <View className="secondary-type-section">
              <Text className="secondary-type-label">兼有体质</Text>
              <Text className="secondary-type-name">{secondaryType}</Text>
            </View>
          )}

          {/* 柱状图 */}
          <View className="chart-section">
            <View className="chart-container">
              {traditionalScores.slice(0, 8).map((type, idx) => {
                const height = (type.score / maxScore) * 200
                const isPrimary = type.name === primaryType
                return (
                  <View key={idx} className="chart-item">
                    <View className="chart-bar-wrapper">
                      <View
                        className={`chart-bar ${isPrimary ? 'primary' : ''}`}
                        style={{ height: `${height}rpx` }}
                      />
                    </View>
                    <Text className="chart-label">{type.name.replace('质', '')}</Text>
                  </View>
                )
              })}
            </View>
            <View className="chart-threshold-line" />
            <Text className="chart-threshold-label">判定</Text>
          </View>

          {/* 体质变化趋势 */}
          <View className="trend-section">
            <Text className="trend-text">
              {primaryType}随着年龄的增长会变成{primaryType}兼血瘀、{primaryType}兼痰湿。
            </Text>
          </View>

          {/* 标准说明 */}
          <View className="standard-note">
            <Text className="standard-text">本测试来自中华中医药学会颁布的国家标准</Text>
          </View>

          {/* 详细说明列表 */}
          <View className="details-section">
            <View
              className={`detail-item ${expandedSection === 'meaning' ? 'expanded' : ''}`}
              onClick={() => toggleSection('meaning')}
            >
              <View className="detail-header">
                <View className="detail-number">1</View>
                <Text className="detail-title">{primaryType}是什么意思?</Text>
                <Text className="detail-arrow">{expandedSection === 'meaning' ? '▼' : '▶'}</Text>
              </View>
              {expandedSection === 'meaning' && (
                <View className="detail-content">
                  <Text className="detail-text">{detailedExplanation.meaning}</Text>
                </View>
              )}
            </View>

            <View
              className={`detail-item ${expandedSection === 'causes' ? 'expanded' : ''}`}
              onClick={() => toggleSection('causes')}
            >
              <View className="detail-header">
                <View className="detail-number">2</View>
                <Text className="detail-title">为什么会{primaryType.replace('质', '')}?</Text>
                <Text className="detail-arrow">{expandedSection === 'causes' ? '▼' : '▶'}</Text>
              </View>
              {expandedSection === 'causes' && (
                <View className="detail-content">
                  {detailedExplanation.causes.map((cause, idx) => (
                    <View key={idx} className="cause-item">
                      <Text className="cause-text">{cause}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>

            <View
              className={`detail-item ${expandedSection === 'troubles' ? 'expanded' : ''}`}
              onClick={() => toggleSection('troubles')}
            >
              <View className="detail-header">
                <View className="detail-number">3</View>
                <Text className="detail-title">{primaryType}的困扰</Text>
                <Text className="detail-arrow">{expandedSection === 'troubles' ? '▼' : '▶'}</Text>
              </View>
              {expandedSection === 'troubles' && (
                <View className="detail-content">
                  {detailedExplanation.troubles.map((trouble, idx) => (
                    <Text key={idx} className="trouble-item">• {trouble}</Text>
                  ))}
                </View>
              )}
            </View>

            <View
              className={`detail-item ${expandedSection === 'warnings' ? 'expanded' : ''}`}
              onClick={() => toggleSection('warnings')}
            >
              <View className="detail-header">
                <View className="detail-number">4</View>
                <Text className="detail-title">{primaryType}需要警惕的</Text>
                <Text className="detail-arrow">{expandedSection === 'warnings' ? '▼' : '▶'}</Text>
              </View>
              {expandedSection === 'warnings' && (
                <View className="detail-content">
                  {detailedExplanation.warnings.map((warning, idx) => (
                    <Text key={idx} className="warning-item">• {warning}</Text>
                  ))}
                </View>
              )}
            </View>

            <View
              className={`detail-item ${expandedSection === 'advice' ? 'expanded' : ''}`}
              onClick={() => toggleSection('advice')}
            >
              <View className="detail-header">
                <View className="detail-number">5</View>
                <Text className="detail-title">{primaryType}日常建议</Text>
                <Text className="detail-arrow">{expandedSection === 'advice' ? '▼' : '▶'}</Text>
              </View>
              {expandedSection === 'advice' && (
                <View className="detail-content">
                  <Text className="advice-text">{detailedExplanation.dailyAdvice}</Text>
                </View>
              )}
            </View>
          </View>

          {/* 行动按钮 */}
          <View className="action-section">
            <Text className="action-question">我是{primaryType.replace('质', '')},该怎么办?</Text>
            <UIButton 
              className="ai-chat-button" 
              onClick={() => {
                Taro.navigateTo({ 
                  url: `/pages/ai-chat/index?bodyType=${encodeURIComponent(primaryType)}` 
                })
              }}
            >
              💬 AI中医咨询
            </UIButton>
            <UIButton className="guide-button" onClick={() => {
              Taro.showToast({ title: '功能开发中', icon: 'none' })
            }}>
              领取节气调理指南
            </UIButton>
            <Text
              className="retest-link"
              onClick={() => {
                resetAssessment()
                Taro.redirectTo({ url: '/pages/index/index' })
              }}
            >
              重新测试
            </Text>
          </View>

          {/* 底部信息 */}
          <View className="footer-section">
            <View className="footer-logo">
              <Text className="footer-brand">TCM-BTI 出品</Text>
            </View>
            <Text className="footer-slogan">陪你每天健康生活</Text>
            <Text className="footer-desc">
              TCM-BTI,为超过4000万用户提供了个性化健康定制服务,成立14年,是国内领先的健康服务平台。
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* 浮动保存按钮 */}
      <View className="floating-save-button" onClick={handleSaveResult}>
        <Text className="save-button-text">保存结果</Text>
      </View>
    </View>
  )
}
