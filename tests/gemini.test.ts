import { describe, it, expect } from 'vitest';
import { getExpertRuleResponse } from '../server/src/services/geminiService';

describe('GenAI Smog Assistant Fallback & Knowledge Engine', () => {
  it('should deliver detailed Corsi-Rosenthal DIY instructions on purifier queries', () => {
    const res = getExpertRuleResponse('How can I build a cheap DIY air purifier?');
    expect(res).toContain('Corsi-Rosenthal Box');
    expect(res).toContain('MERV 13');
    expect(res).toContain('CADR');
  });

  it('should provide targeted protective guidelines for asthmatic children', () => {
    const res = getExpertRuleResponse(
      'What should I do for my asthmatic 7 year old during this smog?',
      { vulnerabilities: ['child', 'asthma_respiratory'] },
      { city: 'Delhi', aqi: 340 }
    );
    expect(res).toContain('Asthmatics, Children & Seniors');
    expect(res).toContain('N95');
    expect(res).toContain('Morning Workouts Indoors');
  });

  it('should scientifically explain winter temperature inversions', () => {
    const res = getExpertRuleResponse('Why is winter smog so much worse than summer?');
    expect(res).toContain('Atmospheric Inversion Phenomenon');
    expect(res).toContain('Thermal Inversion Cap');
    expect(res).toContain('Golden Window');
  });
});

