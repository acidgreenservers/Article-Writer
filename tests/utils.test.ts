import { describe, it, expect } from 'vitest';
import { countWords } from '../src/utils/documentUtils';

describe('countWords', () => {
  it('should count words correctly', () => {
    expect(countWords('')).toBe(0);
    expect(countWords('hello')).toBe(1);
    expect(countWords('hello world')).toBe(2);
    expect(countWords('  hello   world  ')).toBe(2);
    expect(countWords('line1\nline2')).toBe(2);
    expect(countWords('tab\tseparated')).toBe(2);
  });

  it('should handle multiple whitespaces', () => {
    expect(countWords('a b  c   d')).toBe(4);
  });

  it('should return 0 for whitespace-only strings', () => {
    expect(countWords('   ')).toBe(0);
    expect(countWords('\n\n\t')).toBe(0);
  });
});
