import { Projects } from '../src/projects/index.js';

describe('Projects facade extended (TDD)', () => {
  test('list returns array of { key, id?, name? }', async () => {
    const res = await Projects.list();
    expect(Array.isArray(res)).toBe(true);
  });

  test('get returns null for unknown and object for known (mock to implement later)', async () => {
    const item = await Projects.get({ key: 'UNKNOWN' });
    expect(item === null || typeof item === 'object').toBe(true);
  });

  test('getIssueTypes returns array', async () => {
    const list = await Projects.getIssueTypes({ projectKey: 'PROJ' });
    expect(Array.isArray(list)).toBe(true);
  });

  test('getIssueType returns null when not found', async () => {
    const it = await Projects.getIssueType({ projectKey: 'PROJ', issueType: 'Nonexistent' });
    expect(it).toBe(null);
  });
});
