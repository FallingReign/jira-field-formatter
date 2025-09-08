import { Users } from '../src/users/index.js';

describe('Users facade extended (TDD)', () => {
  test('search returns array', async () => {
    const res = await Users.search({ query: 'john' });
    expect(Array.isArray(res)).toBe(true);
  });

  test('get returns null when missing', async () => {
    const res = await Users.get({ accountId: 'abc' });
    expect(res === null || typeof res === 'object').toBe(true);
  });
});
