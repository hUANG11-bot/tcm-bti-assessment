/**
 * 传统中医9种体质类型映射
 * 将四维得分（Y/A, X/S, Z/W, K/M）转换为传统体质得分
 */

export interface TraditionalBodyType {
  name: string;
  score: number;
  threshold: number; // 判定阈值
}

export const TRADITIONAL_BODY_TYPES = [
  { name: '气虚质', key: 'qi_deficiency', threshold: 1.5 },
  { name: '阳虚质', key: 'yang_deficiency', threshold: 1.5 },
  { name: '阴虚质', key: 'yin_deficiency', threshold: 1.5 },
  { name: '痰湿质', key: 'phlegm_dampness', threshold: 1.5 },
  { name: '湿热质', key: 'damp_heat', threshold: 1.5 },
  { name: '血瘀质', key: 'blood_stasis', threshold: 1.5 },
  { name: '气郁质', key: 'qi_stagnation', threshold: 1.5 },
  { name: '特禀质', key: 'special_constitution', threshold: 1.5 },
  { name: '平和质', key: 'balanced', threshold: 0 },
];

/**
 * 将四维得分转换为传统9种体质得分
 */
export function calculateTraditionalBodyTypeScores(
  dimensions: Array<{ dimension: string; scoreLeft: number; scoreRight: number; diff: number }>
): TraditionalBodyType[] {
  const y_a = dimensions.find(d => d.dimension === 'Y/A');
  const x_s = dimensions.find(d => d.dimension === 'X/S');
  const z_w = dimensions.find(d => d.dimension === 'Z/W');
  const k_m = dimensions.find(d => d.dimension === 'K/M');

  // 计算各传统体质的得分
  // 注：这是一个简化的映射逻辑，实际应用中需要更复杂的算法
  
  // 气虚质：X（虚）倾向 + 低能量
  const qiDeficiency = (x_s?.scoreLeft || 0) * 0.6 + (y_a ? Math.min(y_a.scoreLeft, y_a.scoreRight) : 0) * 0.4;
  
  // 阳虚质：Y（阴）倾向 + 低能量
  const yangDeficiency = (y_a?.scoreLeft || 0) * 0.7 + (x_s?.scoreLeft || 0) * 0.3;
  
  // 阴虚质：A（阳）倾向 + 低能量
  const yinDeficiency = (y_a?.scoreRight || 0) * 0.7 + (x_s?.scoreLeft || 0) * 0.3;
  
  // 痰湿质：W（湿）倾向 + 低能量
  const phlegmDampness = (z_w?.scoreRight || 0) * 0.6 + (x_s?.scoreLeft || 0) * 0.4;
  
  // 湿热质：A（阳）倾向 + W（湿）倾向
  const dampHeat = (y_a?.scoreRight || 0) * 0.5 + (z_w?.scoreRight || 0) * 0.5;
  
  // 血瘀质：K（滞）倾向
  const bloodStasis = (k_m?.scoreLeft || 0) * 0.8 + (x_s?.scoreLeft || 0) * 0.2;
  
  // 气郁质：S（实）倾向 + K（滞）倾向
  const qiStagnation = (x_s?.scoreRight || 0) * 0.5 + (k_m?.scoreLeft || 0) * 0.5;
  
  // 特禀质：M（敏）倾向
  const specialConstitution = (k_m?.scoreRight || 0) * 0.9;
  
  // 平和质：所有维度都接近平衡
  const balanced = dimensions.every(d => d.diff < 1.5) 
    ? 10 - Math.max(...dimensions.map(d => d.diff))
    : 0;

  return [
    { name: '气虚质', score: qiDeficiency, threshold: 1.5 },
    { name: '阳虚质', score: yangDeficiency, threshold: 1.5 },
    { name: '阴虚质', score: yinDeficiency, threshold: 1.5 },
    { name: '痰湿质', score: phlegmDampness, threshold: 1.5 },
    { name: '湿热质', score: dampHeat, threshold: 1.5 },
    { name: '血瘀质', score: bloodStasis, threshold: 1.5 },
    { name: '气郁质', score: qiStagnation, threshold: 1.5 },
    { name: '特禀质', score: specialConstitution, threshold: 1.5 },
    { name: '平和质', score: balanced, threshold: 0 },
  ];
}

/**
 * 获取主要体质类型
 */
export function getPrimaryBodyType(scores: TraditionalBodyType[]): string {
  const sorted = [...scores].sort((a, b) => b.score - a.score);
  return sorted[0]?.name || '平和质';
}

/**
 * 获取兼有体质类型
 */
export function getSecondaryBodyType(scores: TraditionalBodyType[]): string | null {
  const sorted = [...scores]
    .filter(s => s.name !== '平和质' && s.score >= s.threshold)
    .sort((a, b) => b.score - a.score);
  return sorted.length > 1 ? sorted[1]?.name : null;
}

/**
 * 计算总分（用于排名）
 */
export function calculateTotalScore(scores: TraditionalBodyType[]): number {
  return Math.round(
    scores
      .filter(s => s.name !== '平和质')
      .reduce((sum, s) => sum + s.score, 0) * 10
  );
}

/**
 * 计算排名百分比（模拟）
 */
export function calculateRankPercentage(score: number, age: number, gender: string): number {
  // 这是一个简化的模拟函数，实际应该基于真实数据
  const baseScore = score;
  const ageFactor = age >= 34 && age <= 38 ? 1 : 0.9;
  const genderFactor = gender === 'male' ? 1 : 1.1;
  
  // 模拟排名计算
  const percentile = Math.min(95, Math.max(5, 100 - (baseScore / 100) * 50 * ageFactor * genderFactor));
  return Math.round(percentile);
}
