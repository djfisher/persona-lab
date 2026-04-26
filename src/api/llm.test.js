import { extractJSON, MODELS } from './llm';
import { describe, it, expect } from 'vitest';

describe('LLM API Utilities', () => {
  describe('extractJSON', () => {
    it('should parse valid JSON', () => {
      const input = '{"key": "value"}';
      expect(extractJSON(input)).toEqual({ key: 'value' });
    });

    it('should strip markdown formatting and parse JSON', () => {
      const input = '```json\n{"key": "value"}\n```';
      expect(extractJSON(input)).toEqual({ key: 'value' });
    });

    it('should extract JSON from within a larger text block', () => {
      const input = 'Here is the result: {"key": "value"} Hope this helps!';
      expect(extractJSON(input)).toEqual({ key: 'value' });
    });

    it('should throw an error if no valid JSON can be extracted', () => {
      const input = 'This is just some text without JSON objects.';
      expect(() => extractJSON(input)).toThrow(/JSON parse failed/);
    });
  });

  describe('MODELS constant', () => {
    it('should export a list of models with the correct structure', () => {
      expect(Array.isArray(MODELS)).toBe(true);
      expect(MODELS.length).toBeGreaterThan(0);
      
      MODELS.forEach(model => {
        expect(model).toHaveProperty('id');
        expect(model).toHaveProperty('name');
        expect(model).toHaveProperty('provider');
        expect(typeof model.thinking).toBe('boolean');
      });
    });

    it('should include Gemini and Claude models', () => {
      const providers = MODELS.map(m => m.provider);
      expect(providers).toContain('anthropic');
      expect(providers).toContain('google');
    });
  });
});
