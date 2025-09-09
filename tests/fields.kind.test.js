import { deriveKind } from '../src/fields/kind.js';

describe('deriveKind (raw schema inference)', () => {
  test('handles primitive types', () => {
    expect(deriveKind({ type: 'date' })).toBe('date');
    expect(deriveKind({ type: 'datetime' })).toBe('datetime');
    expect(deriveKind({ type: 'number' })).toBe('number');
  });
  test('array type', () => {
    expect(deriveKind({ type: 'array', items: 'string' })).toBe('array');
  });
  test('fallback raw', () => {
    expect(deriveKind({ type: 'priority' })).toBe('raw');
    expect(deriveKind({})).toBe('raw');
    expect(deriveKind(null)).toBe('raw');
  });
});