import { Issues } from '../src/issues/index.js';

const originalFetch = global.fetch;

describe('Issues.create (mocked HTTP)', () => {
  afterEach(()=>{ global.fetch = originalFetch; });

  test('creates issue and returns normalized keys', async () => {
    global.fetch = async () => ({
      ok: true,
      json: async () => ({ key: 'PROJ-1', id: '101' }),
      text: async () => ''
    });
    const result = await Issues.create({ fields: { project: { key: 'PROJ' }, issuetype: { id: '10000' }, summary: 'Test' } });
    expect(result.issue_key).toBe('PROJ-1');
    expect(result.issue_link).toContain('browse/PROJ-1');
  });
});
