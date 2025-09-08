import { Diagnostics } from '../src/diagnostics/index.js';

describe('Diagnostics extended', () => {
  test('getWarnings returns array (currently empty)', () => {
    const w = Diagnostics.getWarnings();
    expect(Array.isArray(w)).toBe(true);
  });
});
