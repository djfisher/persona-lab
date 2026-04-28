import { describe, it, expect } from 'vitest';
import { buildSystemPrompt } from './index';

describe('Prompts', () => {
  describe('buildSystemPrompt', () => {
    const mockPersona = {
      name: 'Test Persona',
      role: 'QA Tester',
      backstory: 'Loves testing things.',
      averageRating: 5,
      traits: {
        skepticism: 8,
        technicalDepth: 7,
        priceConscious: 6,
        easeOfUseWeight: 9,
        brandLoyalty: 4
      },
      petPeeves: ['Bugs', 'Slow performance']
    };

    it('should generate a system prompt incorporating persona details', () => {
      const prompt = buildSystemPrompt(mockPersona, ['Competitor A'], 3);
      
      expect(prompt).toContain(mockPersona.name);
      expect(prompt).toContain(mockPersona.role);
      expect(prompt).toContain(mockPersona.backstory);
      expect(prompt).toContain('Competitor A');
      expect(prompt).toContain('You\'re at your default critical baseline.'); // Cynicism = 3
    });

    it('should adjust for high cynicism (cynicism >= 4)', () => {
      const prompt = buildSystemPrompt(mockPersona, [], 5);
      expect(prompt).toContain('You\'re especially unforgiving');
      expect(prompt).toContain('Always name a competitor or alternative'); // Since competitors array is empty
    });

    it('should adjust for low cynicism (cynicism <= 2)', () => {
      const prompt = buildSystemPrompt(mockPersona, [], 1);
      expect(prompt).toContain('You\'re in a generous mood');
    });
  });
});
