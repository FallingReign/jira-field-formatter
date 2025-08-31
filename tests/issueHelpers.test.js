import { formatIssueFields, validateIssueFields, createIssue } from '../src/services/index.js';
import { FieldService } from '../src/services/index.js';

const logger = { info: () => {}, error: () => {} };

function mockFieldService() {
  const fs = new FieldService();
  fs.fieldsApi.getAllFieldSchemas = async () => ([{ name: 'Summary', required: true, schema: { type: 'string' } }]);
  return fs;
}

describe('issueHelpers', () => {
  test('formatIssueFields formats', async () => {
    const fs = mockFieldService();
    const res = await formatIssueFields({ Summary: '  T ' }, 'PROJ', '10001', { fieldService: fs, logger });
    expect(res.fields.Summary).toBe('T');
  });

  test('validateIssueFields validates', async () => {
    const fs = mockFieldService();
    const res = await validateIssueFields({ Foo: 'x' }, 'PROJ', '10001', { fieldService: fs, logger });
    expect(res.valid).toBe(false);
  });

  test('createIssue handles success', async () => {
    const issuesApi = { createIssue: async () => ({ issue_key: 'X-1', issue_id: '1', issue_link: 'link' }) };
    const res = await createIssue({ fields: { project: { key: 'P' }, summary: 'S', issuetype: { id: '10001' } } }, { issuesApi, logger });
    expect(res.success).toBe(true);
    expect(res.key).toBe('X-1');
  });
});
