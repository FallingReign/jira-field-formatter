import { Diagnostics } from '../../index.js';
describe('LIVE: Diagnostics facade', () => {
  test('getCacheMeta returns object', () => {
    const meta = Diagnostics.getCacheMeta();
    expect(typeof meta).toBe('object');
  });
});
