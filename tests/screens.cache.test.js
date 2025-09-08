import { Screens } from '../src/screens/index.js';

const originalFetch = global.fetch;

// Helper queue-based fetch mock
function queueFetch(responses){
  let i = 0;
  global.fetch = async () => ({
    ok: true,
    json: async () => responses[i++],
    text: async () => JSON.stringify(responses[i-1])
  });
  return () => i; // expose index as call counter (each json() increments)
}

describe('Screens.getCreate cache behavior', () => {
  afterEach(()=>{ global.fetch = originalFetch; });

  test('reuses cached create meta unless forceRefresh (simulated prod env)', async () => {
    const originalNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production'; // disable test-mode cache bypass
    // First call requires 2 fetch JSON responses (issueTypes + values)
    // Second cached call needs none
    // Force refresh third call needs 2 more (issueTypes + values)
    const responses = [
      { issueTypes: [{ name: 'Bug', id: '10001' }] },
      { values: [{ id: 'summary', name: 'Summary', required: true, schema: { type: 'string' } }] },
      { issueTypes: [{ name: 'Bug', id: '10001' }] },
      { values: [{ id: 'summary', name: 'Summary', required: true, schema: { type: 'string' } }] }
    ];
    const getCalls = queueFetch(responses);
    await Screens.getCreate({ projectKey: 'PROJ', issueType: 'Bug' });
    const afterFirst = getCalls();
    await Screens.getCreate({ projectKey: 'PROJ', issueType: 'Bug' });
    const afterSecond = getCalls();
    expect(afterSecond).toBe(afterFirst); // cache hit
    await Screens.getCreate({ projectKey: 'PROJ', issueType: 'Bug', forceRefresh: true });
    const afterRefresh = getCalls();
    expect(afterRefresh).toBeGreaterThan(afterSecond); // new fetches consumed
    process.env.NODE_ENV = originalNodeEnv;
  });
});
