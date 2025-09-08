import { Users } from '../../index.js';
describe('LIVE: Users facade', () => {
  const query = process.env.JIRA_LIVE_USER_QUERY || 'test';
  test('search executes', async () => {
    const res = await Users.search({ query });
    expect(Array.isArray(res)).toBe(true);
  }, 30000);
});
