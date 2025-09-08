import { Projects } from '../../index.js';
describe('LIVE: Projects facade', () => {
  test('list returns some projects', async () => {
    const list = await Projects.list();
    expect(Array.isArray(list)).toBe(true);
  }, 30000);
});
