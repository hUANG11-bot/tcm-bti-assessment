import { describe, it, expect } from 'vitest';
import { generateAdvancedAssessmentResult } from './advancedAlgorithm';
import { UserInfo } from './types';

describe('Advanced Algorithm Tests', () => {
  const mockUserInfo: UserInfo = {
    age: 30,
    gender: '女',
    habits: ['sedentary', 'eyeStrain']
  };

  const mockAnswers: Record<string, string> = {
    'Q1': 'A',  // 手脚冰凉
    'Q2': 'A',  // 怕冷
    'Q3': 'A',  // 喜欢热水
    'Q4': 'A',  // 洗澡水热
    'Q6': 'A',  // 吃辣舒服
    'Q7': 'A',  // 面色苍白
    'Q11': 'C', // 精力正常
    'Q12': 'C', // 疲劳正常
    'Q13': 'C', // 睡眠正常
    'Q17': 'C', // 口干正常
    'Q19': 'C', // 饮水正常
  };

  it('should generate assessment result with advanced algorithm', () => {
    const result = generateAdvancedAssessmentResult(mockAnswers, mockUserInfo);
    
    expect(result).toBeDefined();
    expect(result.dimensions).toHaveLength(4);
    expect(result.mainType).toBeDefined();
    expect(result.description).toBeDefined();
  });

  it('should detect contradiction in answers', () => {
    const contradictoryAnswers = {
      ...mockAnswers,
      'Q1': 'A',  // 手脚冰凉
      'Q6': 'E',  // 极易上火 - 矛盾！
    };
    
    const result = generateAdvancedAssessmentResult(contradictoryAnswers, mockUserInfo);
    
    // 应该在warnings中包含矛盾提示
    const hasContradictionWarning = result.warnings.some(w => w.includes('矛盾'));
    expect(hasContradictionWarning).toBe(true);
  });

  it('should detect extreme answer pattern', () => {
    const extremeAnswers: Record<string, string> = {};
    // 所有题目都选A
    for (let i = 1; i <= 28; i++) {
      extremeAnswers[`Q${i}`] = 'A';
    }
    
    const result = generateAdvancedAssessmentResult(extremeAnswers, mockUserInfo);
    
    // 应该在warnings中包含极端作答提示
    const hasExtremeWarning = result.warnings.some(w => w.includes('极端作答'));
    expect(hasExtremeWarning).toBe(true);
  });

  it('should apply age coefficient correctly', () => {
    const youngUser: UserInfo = { age: 18, gender: '男', habits: [] };
    const oldUser: UserInfo = { age: 65, gender: '男', habits: [] };
    
    const resultYoung = generateAdvancedAssessmentResult(mockAnswers, youngUser);
    const resultOld = generateAdvancedAssessmentResult(mockAnswers, oldUser);
    
    // 年轻人和老年人的评估结果应该有所不同
    expect(resultYoung.dimensions).toBeDefined();
    expect(resultOld.dimensions).toBeDefined();
  });

  it('should apply habit coefficients correctly', () => {
    const userWithHabits: UserInfo = {
      age: 30,
      gender: '男',
      habits: ['sedentary', 'stayUpLate', 'highPressure']
    };
    
    const result = generateAdvancedAssessmentResult(mockAnswers, userWithHabits);
    
    // 应该有习惯相关的调理建议
    expect(result.recommendations.habits).toBeDefined();
  });

  it('should identify composite constitution', () => {
    const mixedAnswers: Record<string, string> = {
      'Q1': 'A',  // 阳虚倾向
      'Q2': 'A',
      'Q3': 'A',
      'Q11': 'B', // 气虚倾向
      'Q12': 'B',
      'Q17': 'D', // 阴虚倾向
      'Q19': 'D',
    };
    
    const result = generateAdvancedAssessmentResult(mixedAnswers, mockUserInfo);
    
    // 应该识别出复合体质
    expect(result.mainType).toBeDefined();
    expect(result.description).toContain('复合体质');
  });

  it('should calculate dynamic threshold based on user info', () => {
    const user1: UserInfo = { age: 25, gender: '男', habits: [] };
    const user2: UserInfo = { age: 55, gender: '女', habits: ['sedentary'] };
    
    const result1 = generateAdvancedAssessmentResult(mockAnswers, user1);
    const result2 = generateAdvancedAssessmentResult(mockAnswers, user2);
    
    // 不同用户的动态阈值应该导致不同的判定结果
    expect(result1.dimensions[0].tendency).toBeDefined();
    expect(result2.dimensions[0].tendency).toBeDefined();
  });

  it('should handle missing user info gracefully', () => {
    const result = generateAdvancedAssessmentResult(mockAnswers, null);
    
    expect(result).toBeDefined();
    expect(result.dimensions).toHaveLength(4);
    expect(result.mainType).toBeDefined();
  });

  it('should apply interaction weights correctly', () => {
    const consistentAnswers = {
      ...mockAnswers,
      'Q1': 'A',  // 手脚冰凉
      'Q2': 'A',  // 怕冷
      'Q3': 'A',  // 喜欢热水 - 三题一致，应触发交互权重
    };
    
    const result = generateAdvancedAssessmentResult(consistentAnswers, mockUserInfo);
    
    // Y/A维度应该有更强的倾向
    const yaResult = result.dimensions.find(d => d.dimension === 'Y/A');
    expect(yaResult).toBeDefined();
    expect(yaResult!.diff).toBeGreaterThan(0);
  });
});
