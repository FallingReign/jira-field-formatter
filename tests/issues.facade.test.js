import { Issues } from '../src/issues/index.js';
import { Fields } from '../src/fields/index.js';

const originalFetch = global.fetch;
function mockFetchOnce(responses){
  let call = 0;
  global.fetch = async (url, opts) => {
    const body = responses[call++];
    return {
      ok: true,
      json: async () => body,
      text: async () => JSON.stringify(body)
    };
  };
}

describe('Issues facade (new API)', () => {
  afterEach(() => { global.fetch = originalFetch; });

  test('buildPayload assembles minimal payload with formatted fields', async () => {
    mockFetchOnce([
      { issueTypes: [{ name: 'Bug', id: '10001' }] },
      { values: [ { id: 'customfield_1', name: 'Story Points', required: false, schema: { type: 'number' } } ] }
    ]);
    const { payload } = await Issues.buildPayload({ projectKey: 'PROJ', issueType: 'Bug', values: { 'Story Points': '13' } });
    expect(payload.fields.project.key).toBe('PROJ'); // basic assertion (will refine)
  });
});
