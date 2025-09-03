import { resolveIssueTypeId } from '../index.js';

describe('resolveIssueTypeId standalone export', () => {
  test('should be exported from main index', () => {
    expect(resolveIssueTypeId).toBeDefined();
    expect(typeof resolveIssueTypeId).toBe('function');
  });

  // Note: We don't test the actual functionality here since it requires
  // real Jira credentials and network calls. The unit tests in 
  // fieldsApi.issueTypeResolution.test.js cover the implementation logic.
  // This test just ensures the export is properly exposed.
});
