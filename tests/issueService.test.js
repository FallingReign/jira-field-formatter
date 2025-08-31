import { FieldService, IssueService } from '../src/services/index.js';

const logger = { info: () => {}, error: () => {} };

function createIssueServiceWithMocks() {
  const fieldService = new FieldService();
  fieldService.fieldsApi.getAllFieldSchemas = async () => ([
    { name: 'Summary', required: true, schema: { type: 'string' } },
    { name: 'Labels', required: false, schema: { type: 'array', items: { type: 'string' } } },
    { name: 'Story Points', required: false, schema: { type: 'number' } }
  ]);
  const issuesApi = { createIssue: async (payload) => ({ issue_key: 'TEST-1', issue_id: '10000', issue_link: 'http://example/browse/TEST-1' }) };
  return new IssueService({ fieldService, issuesApi, logger });
}

describe('IssueService', () => {
  test('format returns formatted fields and meta', async () => {
    const svc = createIssueServiceWithMocks();
    const res = await svc.format({ Summary: '  Title  ', Labels: 'a,b', Foo: 'x' }, 'PROJ', '10001');
    expect(res.fields.Summary).toBe('Title');
    expect(res.errors.find(e => e.field === 'Foo')).toBeDefined();
    expect(res.meta.formattedCount).toBe(2);
  });

  test('validate identifies missing required field', async () => {
    const svc = createIssueServiceWithMocks();
    const res = await svc.validate({ Labels: 'a,b' }, 'PROJ', '10001');
    expect(res.valid).toBe(false);
    expect(res.fieldErrors.some(e => /Missing required field/i.test(e.error))).toBe(true);
  });

  test('create wraps success response', async () => {
    const svc = createIssueServiceWithMocks();
    const result = await svc.create({ fields: { project: { key: 'PROJ' }, summary: 'X', issuetype: { id: '10001' } } });
    expect(result.success).toBe(true);
    expect(result.key).toBe('TEST-1');
  });

  test('prepare builds baseIssue without creating', async () => {
    const fieldService = new FieldService();
    fieldService.fieldsApi.getAllFieldSchemas = async () => ([{ name: 'Summary', required: true, schema: { type: 'string' } }]);
    let called = 0;
    const issuesApi = { createIssue: async () => { called++; return {}; } };
    const svc = new IssueService({ fieldService, issuesApi, logger });
    const { baseIssue, format } = await svc.prepare({ projectKey: 'PROJ', issueTypeId: '10001', summary: 'Title', description: 'Desc', fields: { Summary: 'Title' } });
    expect(baseIssue.fields.summary).toBe('Title');
    expect(format.meta.formattedCount).toBe(1);
    expect(called).toBe(0);
  });
});
