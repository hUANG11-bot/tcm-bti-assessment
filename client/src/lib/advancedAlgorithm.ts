/**
 * 高级体质评估算法
 * 实现多层次评分、答题一致性检测、动态阈值等核心功能
 */

import { QUESTIONS, GOLDEN_QUESTIONS } from './constants';
import { DimensionResult, AssessmentResult, UserInfo } from './types';
import { BODY_TYPES_DATA } from './bodyTypesData';
import {
  CONTRADICTION_PAIRS,
  AGE_COEFFICIENTS,
  GENDER_COEFFICIENTS,
  HABIT_COEFFICIENTS,
  INTERACTION_WEIGHTS,
  calculateDynamicThreshold
} from './algorithmConfig';

/**
 * 答题质量分析结果
 */
interface AnswerQualityAnalysis {
  contradictionScore: number;  // 矛盾程度 0-1
  extremePatternScore: number; // 极端作答 0-1
  overallQuality: number;       // 综合质量 0-1
  warnings: string[];
}

/**
 * 检测答题一致性
 */
function analyzeAnswerQuality(answers: Record<string, string>): AnswerQualityAnalysis {
  const warnings: string[] = [];
  let contradictionScore = 0;
  let extremePatternScore = 0;
  
  // 1. 检测矛盾题对
  let totalContradictions = 0;
  let contradictionSeverity = 0;
  
  CONTRADICTION_PAIRS.forEach(pair => {
    const result = pair.check(answers);
    if (result.isContradiction) {
      totalContradictions++;
      contradictionSeverity += result.severity;
      warnings.push(`检测到答题矛盾：${pair.description}`);
    }
  });
  
  // 矛盾分数：0表示完全一致，1表示严重矛盾
  if (totalContradictions > 0) {
    contradictionScore = Math.min(contradictionSeverity / CONTRADICTION_PAIRS.length, 1);
  }
  
  // 2. 检测极端作答模式
  const answerValues = Object.values(answers);
  const aCount = answerValues.filter(v => v === 'A').length;
  const eCount = answerValues.filter(v => v === 'E').length;
  const totalAnswers = answerValues.length;
  
  if (totalAnswers > 0) {
    const aRatio = aCount / totalAnswers;
    const eRatio = eCount / totalAnswers;
    
    // 如果超过70%选择同一个极端选项，判定为极端作答
    if (aRatio > 0.7 || eRatio > 0.7) {
      extremePatternScore = Math.max(aRatio, eRatio);
      warnings.push(`检测到极端作答模式：${Math.round(Math.max(aRatio, eRatio) * 100)}%的答案集中在一个选项`);
    }
  }
  
  // 综合质量评分：1表示高质量，0表示低质量
  const overallQuality = 1 - (contradictionScore * 0.6 + extremePatternScore * 0.4);
  
  return {
    contradictionScore,
    extremePatternScore,
    overallQuality,
    warnings
  };
}

/**
 * 计算基础分（占40%）
 */
function calculateBaseScore(
  answers: Record<string, string>,
  dimension: string
): { scoreLeft: number; scoreRight: number } {
  let scoreLeft = 0;
  let scoreRight = 0;
  
  const dimensionQuestions = QUESTIONS.filter(q => q.dimension === dimension);
  
  dimensionQuestions.forEach(q => {
    const answerValue = answers[q.id];
    if (answerValue) {
      const option = q.options.find(o => o.value === answerValue);
      if (option) {
        const [leftKey, rightKey] = Object.keys(option.score);
        scoreLeft += option.score[leftKey];
        scoreRight += option.score[rightKey];
      }
    }
  });
  
  return { scoreLeft, scoreRight };
}

/**
 * 计算交互分（占30%）
 * 检测题目间的逻辑关联，强化或减弱某些维度
 */
function calculateInteractionScore(
  answers: Record<string, string>,
  dimension: string,
  baseScoreLeft: number,
  baseScoreRight: number
): { scoreLeft: number; scoreRight: number } {
  let adjustedLeft = baseScoreLeft;
  let adjustedRight = baseScoreRight;
  
  INTERACTION_WEIGHTS.forEach(interaction => {
    if (interaction.effect.dimension === dimension && interaction.condition(answers)) {
      // 应用交互权重
      const multiplier = interaction.effect.multiplier;
      adjustedLeft *= multiplier;
      adjustedRight *= multiplier;
    }
  });
  
  // 交互分 = 调整后得分 - 基础分
  return {
    scoreLeft: adjustedLeft - baseScoreLeft,
    scoreRight: adjustedRight - baseScoreRight
  };
}

/**
 * 计算个性化修正分（占10%）
 * 根据年龄、性别、习惯调整
 */
function calculatePersonalizedScore(
  userInfo: UserInfo | null,
  dimension: string,
  baseScoreLeft: number,
  baseScoreRight: number
): { scoreLeft: number; scoreRight: number } {
  if (!userInfo) {
    return { scoreLeft: 0, scoreRight: 0 };
  }
  
  let adjustLeft = 1.0;
  let adjustRight = 1.0;
  
  // 年龄调整
  const ageCoef = AGE_COEFFICIENTS.getCoefficient(userInfo.age);
  if (dimension === 'Y/A') {
    adjustLeft *= ageCoef.yin;
    adjustRight *= ageCoef.yang;
  }
  
  // 性别调整
  let genderKey: 'male' | 'female' | 'other' = 'other';
  if (userInfo.gender === '男') genderKey = 'male';
  else if (userInfo.gender === '女') genderKey = 'female';
  const genderCoef = GENDER_COEFFICIENTS[genderKey];
  if (genderCoef && genderCoef[dimension as keyof typeof genderCoef]) {
    const dimCoef = genderCoef[dimension as keyof typeof genderCoef] as any;
    const keys = Object.keys(dimCoef);
    adjustLeft *= dimCoef[keys[0]];
    adjustRight *= dimCoef[keys[1]];
  }
  
  // 习惯调整
  if (userInfo.habits) {
    userInfo.habits.forEach(habit => {
      const habitCoef = HABIT_COEFFICIENTS[habit];
      if (habitCoef && habitCoef.dimension === dimension) {
        adjustLeft *= habitCoef.leftAdjust;
        adjustRight *= habitCoef.rightAdjust;
      }
    });
  }
  
  // 个性化修正分 = 基础分 × (调整系数 - 1)
  return {
    scoreLeft: baseScoreLeft * (adjustLeft - 1),
    scoreRight: baseScoreRight * (adjustRight - 1)
  };
}

/**
 * 高级维度得分计算
 * 整合多层次评分体系
 */
export function calculateAdvancedDimensionScore(
  answers: Record<string, string>,
  dimension: string,
  userInfo: UserInfo | null,
  qualityAnalysis: AnswerQualityAnalysis
): DimensionResult {
  // 1. 基础分（40%）
  const baseScore = calculateBaseScore(answers, dimension);
  
  // 2. 交互分（30%）
  const interactionScore = calculateInteractionScore(
    answers,
    dimension,
    baseScore.scoreLeft,
    baseScore.scoreRight
  );
  
  // 3. 个性化修正分（10%）
  const personalizedScore = calculatePersonalizedScore(
    userInfo,
    dimension,
    baseScore.scoreLeft,
    baseScore.scoreRight
  );
  
  // 4. 时序分（20%）- 暂时简化，未来可根据答题时间戳计算
  // 这里用答题质量来替代
  const timeScore = {
    scoreLeft: baseScore.scoreLeft * 0.2 * qualityAnalysis.overallQuality,
    scoreRight: baseScore.scoreRight * 0.2 * qualityAnalysis.overallQuality
  };
  
  // 5. 综合得分
  let scoreLeft = 
    baseScore.scoreLeft * 0.4 +
    (baseScore.scoreLeft + interactionScore.scoreLeft) * 0.3 +
    timeScore.scoreLeft +
    personalizedScore.scoreLeft * 0.1;
    
  let scoreRight = 
    baseScore.scoreRight * 0.4 +
    (baseScore.scoreRight + interactionScore.scoreRight) * 0.3 +
    timeScore.scoreRight +
    personalizedScore.scoreRight * 0.1;
  
  // 6. 决胜题逻辑
  let diff = Math.abs(scoreLeft - scoreRight);
  
  // 动态阈值判定是否需要决胜题
  const dynamicThreshold = userInfo 
    ? calculateDynamicThreshold(1.5, userInfo.age, userInfo.gender, userInfo.habits || [], dimension)
    : 1.5;
  
  if (diff >= dynamicThreshold && diff <= dynamicThreshold * 2) {
    const goldenQuestions = GOLDEN_QUESTIONS.filter(q => q.dimension === dimension);
    goldenQuestions.forEach(q => {
      const answerValue = answers[q.id];
      if (answerValue) {
        const option = q.options.find(o => o.value === answerValue);
        if (option) {
          const [leftKey, rightKey] = Object.keys(option.score);
          scoreLeft += option.score[leftKey];
          scoreRight += option.score[rightKey];
        }
      }
    });
    diff = Math.abs(scoreLeft - scoreRight);
  }
  
  // 7. 倾向判定
  let tendency: DimensionResult['tendency'] = 'Balanced';
  let label = '平衡';
  
  // 使用动态阈值
  const threshold3 = calculateDynamicThreshold(3, userInfo?.age || 30, userInfo?.gender || '其他', userInfo?.habits || [], dimension);
  const threshold5 = calculateDynamicThreshold(5, userInfo?.age || 30, userInfo?.gender || '其他', userInfo?.habits || [], dimension);
  const threshold8 = calculateDynamicThreshold(8, userInfo?.age || 30, userInfo?.gender || '其他', userInfo?.habits || [], dimension);
  
  if (diff === 0) {
    tendency = 'Balanced';
    label = '完全平衡';
  } else if (scoreLeft > scoreRight) {
    if (diff >= threshold8) { tendency = 'Strong Left'; label = '强倾向'; }
    else if (diff >= threshold5) { tendency = 'Moderate Left'; label = '中等倾向'; }
    else if (diff >= threshold3) { tendency = 'Weak Left'; label = '弱倾向'; }
    else { tendency = 'Slight Left'; label = '轻微倾向'; }
  } else {
    if (diff >= threshold8) { tendency = 'Strong Right'; label = '强倾向'; }
    else if (diff >= threshold5) { tendency = 'Moderate Right'; label = '中等倾向'; }
    else if (diff >= threshold3) { tendency = 'Weak Right'; label = '弱倾向'; }
    else { tendency = 'Slight Right'; label = '轻微倾向'; }
  }
  
  return {
    dimension,
    scoreLeft: Math.round(scoreLeft * 10) / 10,
    scoreRight: Math.round(scoreRight * 10) / 10,
    diff: Math.round(diff * 10) / 10,
    tendency,
    label
  };
}

/**
 * 复合体质识别
 * 返回主次体质及占比
 */
function identifyCompositeConstitution(dimensions: DimensionResult[]): {
  primary: string;
  secondary: string[];
  proportions: Record<string, number>;
} {
  const typeScores: Record<string, number> = {};
  
  // 根据各维度倾向计算体质得分
  dimensions.forEach(dim => {
    const dimKey = dim.dimension;
    const isLeft = dim.scoreLeft > dim.scoreRight;
    const strength = dim.diff;
    
    // 映射到体质类型
    if (dimKey === 'Y/A') {
      if (isLeft) {
        typeScores['阳虚'] = (typeScores['阳虚'] || 0) + strength;
      } else {
        typeScores['阴虚'] = (typeScores['阴虚'] || 0) + strength;
      }
    } else if (dimKey === 'X/S') {
      if (isLeft) {
        typeScores['气虚'] = (typeScores['气虚'] || 0) + strength;
      } else {
        typeScores['气实'] = (typeScores['气实'] || 0) + strength;
      }
    } else if (dimKey === 'Z/W') {
      if (isLeft) {
        typeScores['燥'] = (typeScores['燥'] || 0) + strength;
      } else {
        typeScores['湿'] = (typeScores['湿'] || 0) + strength;
      }
    } else if (dimKey === 'K/M') {
      if (isLeft) {
        typeScores['气滞'] = (typeScores['气滞'] || 0) + strength;
      } else {
        typeScores['敏感'] = (typeScores['敏感'] || 0) + strength;
      }
    }
  });
  
  // 计算总分
  const totalScore = Object.values(typeScores).reduce((sum, score) => sum + score, 0);
  
  // 计算占比
  const proportions: Record<string, number> = {};
  Object.entries(typeScores).forEach(([type, score]) => {
    proportions[type] = totalScore > 0 ? Math.round((score / totalScore) * 100) : 0;
  });
  
  // 排序找出主次体质
  const sorted = Object.entries(proportions)
    .filter(([_, prop]) => prop >= 10)  // 只保留占比>=10%的
    .sort((a, b) => b[1] - a[1]);
  
  const primary = sorted.length > 0 ? sorted[0][0] : '平和';
  const secondary = sorted.slice(1).map(([type, _]) => type);
  
  return { primary, secondary, proportions };
}

/**
 * 生成高级评估结果
 */
export function generateAdvancedAssessmentResult(
  answers: Record<string, string>,
  userInfo: UserInfo | null
): AssessmentResult {
  // 1. 答题质量分析
  const qualityAnalysis = analyzeAnswerQuality(answers);
  
  // 2. 计算各维度得分
  const dimensions = ['Y/A', 'X/S', 'Z/W', 'K/M'].map(dim =>
    calculateAdvancedDimensionScore(answers, dim, userInfo, qualityAnalysis)
  );
  
  // 3. 复合体质识别
  const constitution = identifyCompositeConstitution(dimensions);
  
  // 4. 构建结果对象
  const result: AssessmentResult = {
    dimensions,
    mainType: constitution.primary,
    compositeType: constitution.secondary,
    description: '',
    detailedAnalysis: { mechanism: '', manifestations: [], susceptibility: [] },
    recommendations: {
      diet: { principle: '', goodFoods: [], badFoods: [], recipes: [] },
      exercise: '',
      lifestyle: '',
      emotion: '',
      acupoints: [],
      habits: []
    },
    warnings: [...qualityAnalysis.warnings]
  };
  
  // 5. 匹配体质数据
  const significantDimensions = dimensions.filter(d => d.diff >= 3);
  
  if (significantDimensions.length === 0) {
    const data = BODY_TYPES_DATA['Balanced'];
    result.mainType = data.name;
    result.description = data.description;
    result.detailedAnalysis = data.detailedAnalysis;
    result.recommendations = { ...data.recommendations, habits: result.recommendations.habits };
  } else {
    // 使用原有的体质映射逻辑
    const y_a = dimensions.find(d => d.dimension === 'Y/A');
    const x_s = dimensions.find(d => d.dimension === 'X/S');
    const z_w = dimensions.find(d => d.dimension === 'Z/W');
    const k_m = dimensions.find(d => d.dimension === 'K/M');
    
    let typeKey = '';
    if (y_a?.scoreLeft! > y_a?.scoreRight! && z_w?.scoreRight! > z_w?.scoreLeft!) typeKey = 'Y+W';
    else if (y_a?.scoreLeft! > y_a?.scoreRight! && z_w?.scoreLeft! > z_w?.scoreRight!) typeKey = 'Y+Z';
    else if (y_a?.scoreRight! > y_a?.scoreLeft! && z_w?.scoreLeft! > z_w?.scoreRight!) typeKey = 'A+Z';
    else if (y_a?.scoreRight! > y_a?.scoreLeft! && z_w?.scoreRight! > z_w?.scoreLeft!) typeKey = 'A+W';
    
    if (!typeKey) {
      if (x_s?.scoreLeft! > x_s?.scoreRight! && k_m?.scoreLeft! > k_m?.scoreRight!) typeKey = 'X+K';
      else if (x_s?.scoreLeft! > x_s?.scoreRight! && k_m?.scoreRight! > k_m?.scoreLeft!) typeKey = 'X+M';
      else if (x_s?.scoreRight! > x_s?.scoreLeft! && k_m?.scoreLeft! > k_m?.scoreRight!) typeKey = 'S+K';
      else if (x_s?.scoreRight! > x_s?.scoreLeft! && k_m?.scoreRight! > k_m?.scoreLeft!) typeKey = 'S+M';
    }
    
    if (typeKey && BODY_TYPES_DATA[typeKey]) {
      const data = BODY_TYPES_DATA[typeKey];
      result.mainType = data.name;
      result.description = data.description;
      result.detailedAnalysis = data.detailedAnalysis;
      result.recommendations = { ...data.recommendations, habits: result.recommendations.habits };
    } else {
      const data = BODY_TYPES_DATA['Mixed'];
      result.mainType = data.name;
      result.description = data.description;
      result.detailedAnalysis = data.detailedAnalysis;
      result.recommendations = { ...data.recommendations, habits: result.recommendations.habits };
    }
  }
  
  // 6. 添加复合体质信息到描述中
  if (constitution.secondary.length > 0) {
    result.description += `\n\n【复合体质分析】主要体质：${constitution.primary}（${constitution.proportions[constitution.primary]}%）`;
    constitution.secondary.forEach(type => {
      result.description += `，次要体质：${type}（${constitution.proportions[type]}%）`;
    });
  }
  
  // 7. 答题质量警告
  if (qualityAnalysis.overallQuality < 0.7) {
    result.warnings.unshift(`⚠️ 答题质量较低（${Math.round(qualityAnalysis.overallQuality * 100)}%），建议重新认真作答以获得更准确的结果`);
  }
  
  return result;
}
