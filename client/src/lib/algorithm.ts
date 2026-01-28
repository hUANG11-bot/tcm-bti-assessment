import { QUESTIONS, GOLDEN_QUESTIONS, HABITS } from './constants';
import { DimensionResult, AssessmentResult, BODY_TYPES, UserInfo } from './types';
import { BODY_TYPES_DATA } from './bodyTypesData';
export type { AssessmentResult };

export function calculateDimensionScore(
  answers: { [questionId: string]: string },
  dimension: string
): DimensionResult {
  let scoreLeft = 0;
  let scoreRight = 0;
  const dimensionQuestions = QUESTIONS.filter((q) => q.dimension === dimension);
  const goldenQuestions = GOLDEN_QUESTIONS.filter((q) => q.dimension === dimension);

  // Calculate base score
  dimensionQuestions.forEach((q) => {
    const answerValue = answers[q.id];
    if (answerValue) {
      const option = q.options.find((o) => o.value === answerValue);
      if (option) {
        const [leftKey, rightKey] = Object.keys(option.score);
        scoreLeft += option.score[leftKey];
        scoreRight += option.score[rightKey];
      }
    }
  });

  let diff = Math.abs(scoreLeft - scoreRight);
  
  // Check if Golden Questions are needed
  if (diff >= 1 && diff <= 2) {
    goldenQuestions.forEach((q) => {
      const answerValue = answers[q.id];
      if (answerValue) {
        const option = q.options.find((o) => o.value === answerValue);
        if (option) {
          const [leftKey, rightKey] = Object.keys(option.score);
          scoreLeft += option.score[leftKey];
          scoreRight += option.score[rightKey];
        }
      }
    });
    // Recalculate diff after golden questions
    diff = Math.abs(scoreLeft - scoreRight);
  }

  let tendency: DimensionResult['tendency'] = 'Balanced';
  let label = '平衡';

  if (diff === 0) {
    tendency = 'Balanced';
    label = '完全平衡';
  } else if (scoreLeft > scoreRight) {
    if (diff >= 8) { tendency = 'Strong Left'; label = '强倾向'; }
    else if (diff >= 5) { tendency = 'Moderate Left'; label = '中等倾向'; }
    else if (diff >= 3) { tendency = 'Weak Left'; label = '弱倾向'; }
    else { tendency = 'Slight Left'; label = '轻微倾向'; }
  } else {
    if (diff >= 8) { tendency = 'Strong Right'; label = '强倾向'; }
    else if (diff >= 5) { tendency = 'Moderate Right'; label = '中等倾向'; }
    else if (diff >= 3) { tendency = 'Weak Right'; label = '弱倾向'; }
    else { tendency = 'Slight Right'; label = '轻微倾向'; }
  }

  return {
    dimension,
    scoreLeft,
    scoreRight,
    diff,
    tendency,
    label,
  };
}

export function generateAssessmentResult(answers: { [questionId: string]: string }, userInfo: UserInfo | null): AssessmentResult {
  const dimensions = ['Y/A', 'X/S', 'Z/W', 'K/M'].map((dim) =>
    calculateDimensionScore(answers, dim)
  );

  const result: AssessmentResult = {
    dimensions,
    mainType: '',
    compositeType: [],
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
    warnings: [],
  };

  // Add habit-specific advice
  if (userInfo && userInfo.habits && userInfo.habits.length > 0) {
    const habitAdviceList: string[] = [];
    
    userInfo.habits.forEach(habitValue => {
      const habitData = HABITS.find(h => h.value === habitValue);
      if (habitData) {
        habitAdviceList.push(`${habitData.label}：${habitData.advice}`);
        result.warnings.push(`生活习惯提醒：${habitData.warning}`);
      }
    });
    
    result.recommendations.habits = habitAdviceList;
  }

  // Determine Main Type and Composite Types
  const significantDimensions = dimensions.filter(d => d.diff >= 3);
  
  if (significantDimensions.length === 0) {
    const data = BODY_TYPES_DATA['Balanced'];
    result.mainType = data.name;
    result.description = data.description;
    result.detailedAnalysis = data.detailedAnalysis;
    result.recommendations = { ...data.recommendations, habits: result.recommendations.habits };
    return result;
  }

  // Logic to map dimensions to body types (Simplified for MVP)
  // In a real app, this would be more complex based on the business plan's matrix
  let typeKey = '';
  
  const y_a = dimensions.find(d => d.dimension === 'Y/A');
  const x_s = dimensions.find(d => d.dimension === 'X/S');
  const z_w = dimensions.find(d => d.dimension === 'Z/W');
  const k_m = dimensions.find(d => d.dimension === 'K/M');

  // Example mapping logic based on Business Plan 2.3.3
  if (y_a?.scoreLeft! > y_a?.scoreRight! && z_w?.scoreRight! > z_w?.scoreLeft!) typeKey = 'Y+W'; // 寒湿
  else if (y_a?.scoreLeft! > y_a?.scoreRight! && z_w?.scoreLeft! > z_w?.scoreRight!) typeKey = 'Y+Z'; // 阳虚燥
  else if (y_a?.scoreRight! > y_a?.scoreLeft! && z_w?.scoreLeft! > z_w?.scoreRight!) typeKey = 'A+Z'; // 阴虚燥热
  else if (y_a?.scoreRight! > y_a?.scoreLeft! && z_w?.scoreRight! > z_w?.scoreLeft!) typeKey = 'A+W'; // 湿热
  
  // Fallback or additional logic
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
    // Default fallback if no specific combination matches
    const data = BODY_TYPES_DATA['Mixed'];
    result.mainType = data.name;
    result.description = data.description;
    result.detailedAnalysis = data.detailedAnalysis;
    result.recommendations = { ...data.recommendations, habits: result.recommendations.habits };
  }

  // Warnings
  if (y_a?.scoreRight! > y_a?.scoreLeft! && z_w?.scoreLeft! > z_w?.scoreRight! && k_m?.scoreRight! > k_m?.scoreLeft!) {
      result.warnings.push('红旗警报：A+Z+M (阴虚燥热+敏感) - 易引发皮肤炎症、失眠、代谢紊乱。避免辛辣、温补食物及剧烈运动。');
  }

  return result;
}
