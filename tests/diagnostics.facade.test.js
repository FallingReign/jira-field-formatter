import { Diagnostics } from '../src/diagnostics/index.js';

describe('Diagnostics facade (new API)', () => {
  test('getCacheMeta returns structured regions (expected to fail until implemented)', async () => {
    const meta = await Diagnostics.getCacheMeta?.();
    expect(meta).toMatchObject({ fields: expect.any(Object) });
  });

  test('clearCache region parameter works (expected to fail until implemented)', async () => {
    const result = await Diagnostics.clearCache?.({ region: 'fields' });
    expect(result).toMatchObject({ cleared: ['fields'] });
  });
});
