/**
 * 高级算法配置文件
 * 包含矛盾题对、权重系数、动态阈值等核心参数
 */

/**
 * 矛盾题对配置
 * 用于检测答题一致性，识别不认真作答
 */
export const CONTRADICTION_PAIRS = [
  {
    id: 'CP1',
    questions: ['Q1', 'Q6'],
    description: '手脚冰凉 vs 喜欢辣食',
    check: (answers: Record<string, string>) => {
      // Q1选A/B（手脚凉）但Q6选E（极易上火）= 矛盾
      const q1 = answers['Q1'];
      const q6 = answers['Q6'];
      if ((q1 === 'A' || q1 === 'B') && q6 === 'E') {
        return { isContradiction: true, severity: 0.8 };
      }
      return { isContradiction: false, severity: 0 };
    }
  },
  {
    id: 'CP2',
    questions: ['Q2', 'Q3'],
    description: '空调温度 vs 饮水温度',
    check: (answers: Record<string, string>) => {
      // Q2选A（怕冷）但Q3选E（喜欢冰水）= 矛盾
      const q2 = answers['Q2'];
      const q3 = answers['Q3'];
      if (q2 === 'A' && q3 === 'E') {
        return { isContradiction: true, severity: 0.9 };
      }
      if (q2 === 'E' && q3 === 'A') {
        return { isContradiction: true, severity: 0.9 };
      }
      return { isContradiction: false, severity: 0 };
    }
  },
  {
    id: 'CP3',
    questions: ['Q7', 'Q6'],
    description: '面色 vs 辣食反应',
    check: (answers: Record<string, string>) => {
      // Q7选E（面色潮红）但Q6选A（吃辣舒服）= 轻微矛盾
      const q7 = answers['Q7'];
      const q6 = answers['Q6'];
      if (q7 === 'E' && q6 === 'A') {
        return { isContradiction: true, severity: 0.5 };
      }
      return { isContradiction: false, severity: 0 };
    }
  },
  {
    id: 'CP4',
    questions: ['Q11', 'Q13'],
    description: '精力状态 vs 睡眠质量',
    check: (answers: Record<string, string>) => {
      // Q11选A/B（精力差）但Q13选E（睡眠极好）= 矛盾
      const q11 = answers['Q11'];
      const q13 = answers['Q13'];
      if ((q11 === 'A' || q11 === 'B') && q13 === 'E') {
        return { isContradiction: true, severity: 0.7 };
      }
      return { isContradiction: false, severity: 0 };
    }
  },
  {
    id: 'CP5',
    questions: ['Q17', 'Q19'],
    description: '口干 vs 饮水量',
    check: (answers: Record<string, string>) => {
      // Q17选E（极度口干）但Q19选A（很少喝水）= 矛盾
      const q17 = answers['Q17'];
      const q19 = answers['Q19'];
      if (q17 === 'E' && q19 === 'A') {
        return { isContradiction: true, severity: 0.8 };
      }
      return { isContradiction: false, severity: 0 };
    }
  }
];

/**
 * 年龄系数配置
 * 不同年龄段对体质判定阈值的影响
 */
export const AGE_COEFFICIENTS = {
  getCoefficient: (age: number) => {
    if (age < 20) return { base: 1.2, yang: 1.3, yin: 0.9 };
    if (age < 30) return { base: 1.1, yang: 1.2, yin: 0.95 };
    if (age < 40) return { base: 1.0, yang: 1.0, yin: 1.0 };
    if (age < 50) return { base: 0.95, yang: 0.9, yin: 1.1 };
    if (age < 60) return { base: 0.9, yang: 0.8, yin: 1.2 };
    return { base: 0.85, yang: 0.7, yin: 1.3 };
  }
};

/**
 * 性别系数配置
 * 男女在不同维度上的生理差异
 */
export const GENDER_COEFFICIENTS = {
  male: {
    'Y/A': { yang: 1.1, yin: 0.9 },
    'X/S': { xu: 0.95, shi: 1.05 },
    'Z/W': { zao: 1.0, shi: 1.0 },
    'K/M': { zhi: 1.05, min: 0.95 }
  },
  female: {
    'Y/A': { yang: 0.9, yin: 1.1 },
    'X/S': { xu: 1.05, shi: 0.95 },
    'Z/W': { zao: 1.0, shi: 1.0 },
    'K/M': { zhi: 0.95, min: 1.05 }
  },
  other: {
    'Y/A': { yang: 1.0, yin: 1.0 },
    'X/S': { xu: 1.0, shi: 1.0 },
    'Z/W': { zao: 1.0, shi: 1.0 },
    'K/M': { zhi: 1.0, min: 1.0 }
  }
};

/**
 * 生活习惯系数配置
 * 现代生活方式对体质的影响
 */
export const HABIT_COEFFICIENTS: Record<string, {
  dimension: string;
  leftAdjust: number;
  rightAdjust: number;
  thresholdMultiplier: number;
}> = {
  sedentary: {
    dimension: 'K/M',
    leftAdjust: 1.3,  // 久坐增强"滞"的倾向
    rightAdjust: 0.8,
    thresholdMultiplier: 0.8  // 降低阈值，更容易判定为气滞
  },
  eyeStrain: {
    dimension: 'Y/A',
    leftAdjust: 1.2,  // 久视伤阴
    rightAdjust: 0.9,
    thresholdMultiplier: 0.9
  },
  stayUpLate: {
    dimension: 'Y/A',
    leftAdjust: 1.3,  // 熬夜伤阴
    rightAdjust: 0.8,
    thresholdMultiplier: 0.85
  },
  irregular: {
    dimension: 'X/S',
    leftAdjust: 1.2,  // 作息不规律伤气血
    rightAdjust: 0.9,
    thresholdMultiplier: 0.9
  },
  highPressure: {
    dimension: 'K/M',
    leftAdjust: 1.25,  // 压力大易气滞
    rightAdjust: 0.85,
    thresholdMultiplier: 0.85
  },
  lackExercise: {
    dimension: 'X/S',
    leftAdjust: 1.2,  // 缺乏运动导致虚弱
    rightAdjust: 0.9,
    thresholdMultiplier: 0.9
  }
};

/**
 * 题目交互权重矩阵（部分示例）
 * 当特定题目组合出现时，增强或减弱某些维度的得分
 */
export const INTERACTION_WEIGHTS = [
  {
    id: 'IW1',
    questions: ['Q1', 'Q2', 'Q3'],
    condition: (answers: Record<string, string>) => {
      // 三题都选A（极度怕冷）
      return answers['Q1'] === 'A' && answers['Q2'] === 'A' && answers['Q3'] === 'A';
    },
    effect: {
      dimension: 'Y/A',
      multiplier: 1.3,  // 强化阳虚判定
      description: '多题一致性强化：极度怕冷特征'
    }
  },
  {
    id: 'IW2',
    questions: ['Q6', 'Q7'],
    condition: (answers: Record<string, string>) => {
      // Q6极易上火 + Q7面色潮红
      return answers['Q6'] === 'E' && answers['Q7'] === 'E';
    },
    effect: {
      dimension: 'Y/A',
      multiplier: 1.25,  // 强化阴虚判定
      description: '上火+潮红：阴虚火旺特征'
    }
  },
  {
    id: 'IW3',
    questions: ['Q11', 'Q12', 'Q13'],
    condition: (answers: Record<string, string>) => {
      // 精力差 + 易疲劳 + 睡眠差
      return (answers['Q11'] === 'A' || answers['Q11'] === 'B') &&
             (answers['Q12'] === 'A' || answers['Q12'] === 'B') &&
             (answers['Q13'] === 'A' || answers['Q13'] === 'B');
    },
    effect: {
      dimension: 'X/S',
      multiplier: 1.3,  // 强化气虚判定
      description: '多维度虚弱特征'
    }
  }
];

/**
 * 动态阈值计算
 */
export function calculateDynamicThreshold(
  baseDiff: number,
  age: number,
  gender: string,
  habits: string[],
  dimension: string
): number {
  let threshold = baseDiff;
  
  // 年龄调整
  const ageCoef = AGE_COEFFICIENTS.getCoefficient(age);
  threshold *= ageCoef.base;
  
  // 性别调整（简化处理）
  const genderKey = gender === '男' ? 'male' : gender === '女' ? 'female' : 'other';
  const genderCoef = GENDER_COEFFICIENTS[genderKey];
  if (genderCoef && genderCoef[dimension as keyof typeof genderCoef]) {
    // 取左右系数的平均值作为整体调整
    const dimCoef = genderCoef[dimension as keyof typeof genderCoef] as any;
    const avgCoef = (Object.values(dimCoef).reduce((a: any, b: any) => a + b, 0) as number) / 2;
    threshold *= avgCoef;
  }
  
  // 习惯调整
  habits.forEach(habit => {
    const habitCoef = HABIT_COEFFICIENTS[habit];
    if (habitCoef && habitCoef.dimension === dimension) {
      threshold *= habitCoef.thresholdMultiplier;
    }
  });
  
  return threshold;
}
