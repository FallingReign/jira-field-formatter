import { Users } from '../src/users/index.js';

describe('Users facade (new API)', () => {
  test('search returns array (expected fail)', async () => {
    const results = await Users.search({ query: 'john' });
    expect(Array.isArray(results)).toBe(true);
  });
});
