import { Projects } from '../src/projects/index.js';

describe('Projects facade (new API)', () => {
  test('list returns array of minimal project objects (expected fail)', async () => {
    const projects = await Projects.list();
    expect(Array.isArray(projects)).toBe(true);
  });

  test('getIssueTypes returns array (expected fail)', async () => {
    const issueTypes = await Projects.getIssueTypes({ projectKey: 'PROJ' });
    expect(Array.isArray(issueTypes)).toBe(true);
  });
});
