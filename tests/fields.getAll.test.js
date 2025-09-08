import { Fields } from '../src/fields/index.js';

const originalFetch = global.fetch;

function mockFetchSequence(responses){
  let i = 0;
  global.fetch = async () => ({
    ok: true,
    json: async () => responses[i++],
    text: async () => JSON.stringify(responses[i-1])
  });
}

describe('Fields.getAll (global fields list)', () => {
  afterEach(()=>{ global.fetch = originalFetch; });

  test('returns cached list on second call without additional fetch', async () => {
    let calls = 0;
    global.fetch = async () => ({
      ok: true,
      json: async () => { calls++; return [{ id: 'summary', name: 'Summary' }]; },
      text: async () => '[]'
    });
    const first = await Fields.getAll();
    const second = await Fields.getAll();
    expect(first[0]).toMatchObject({ id: 'summary' });
    expect(second).toHaveLength(1);
    expect(calls).toBe(1); // cache hit
  });
});
