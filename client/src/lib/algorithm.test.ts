import { describe, it, expect } from 'vitest';
import { calculateDimensionScore, generateAssessmentResult } from './algorithm';
import { UserInfo } from './types';

describe('TCM-BTI Algorithm', () => {
  it('should calculate dimension score correctly for Strong Left (Y)', () => {
    const answers = {
      'Q1': 'A', 'Q2': 'A', 'Q3': 'A', 'Q4': 'A', 'Q6': 'A', 'Q7': 'A', 'Q8': 'A'
    };
    const result = calculateDimensionScore(answers, 'Y/A');
    
    expect(result.scoreLeft).toBe(14);
    expect(result.scoreRight).toBe(0);
    expect(result.diff).toBe(14);
    expect(result.tendency).toBe('Strong Left');
  });

  it('should generate habit-specific advice', () => {
    const answers = {
      'Q1': 'C', 'Q2': 'C', 'Q3': 'C', 'Q4': 'C', 'Q6': 'C', 'Q7': 'C', 'Q8': 'C'
    };
    const userInfo: UserInfo = {
      age: 30,
      gender: 'male',
      habits: ['screen_time', 'sedentary']
    };

    const result = generateAssessmentResult(answers, userInfo);
    
    expect(result.recommendations.habits).toBeDefined();
    expect(result.recommendations.habits?.length).toBe(2);
    expect(result.recommendations.habits?.[0]).toContain('久视伤血');
    expect(result.warnings.some(w => w.includes('注意腹部保暖'))).toBe(true);
  });

  it('should include detailed analysis and recipes', () => {
    const answers = {}; // Empty answers will result in Balanced type
    const result = generateAssessmentResult(answers, null);

    expect(result.detailedAnalysis).toBeDefined();
    expect(result.detailedAnalysis.mechanism).toBeDefined();
    expect(result.recommendations.diet.recipes).toBeDefined();
    expect(result.recommendations.diet.recipes.length).toBeGreaterThan(0);
    expect(result.recommendations.acupoints).toBeDefined();
  });
});
