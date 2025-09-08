import { Screens } from '../src/screens/index.js';

const originalFetch = global.fetch;
function mockFetchSequence(responses){
  let i = 0;
  global.fetch = async () => ({
    ok: true,
    json: async () => responses[i++],
    text: async () => JSON.stringify(responses[i-1])
  });
}

describe('Screens facade (new API)', () => {
  afterEach(()=>{ global.fetch = originalFetch; });

  test('getCreate returns normalized shape with fields array', async () => {
    mockFetchSequence([
      { issueTypes: [{ name: 'Bug', id: '10001' }] },
      { values: [ { id: 'summary', name: 'Summary', required: true, schema: { type: 'string' } } ] }
    ]);
    const meta = await Screens.getCreate({ projectKey: 'PROJ', issueType: 'Bug' });
    expect(meta).toMatchObject({ projectKey: 'PROJ', issueType: 'Bug' });
    expect(Array.isArray(meta.fields)).toBe(true);
    expect(meta.fields[0]).toMatchObject({ id: 'summary', name: 'Summary', required: true });
  });
});
