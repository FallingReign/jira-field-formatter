/**
 * IssueService Usage Example (Phase 3d)
 * Demonstrates single-purpose steps: format -> validate -> prepare -> create
 * Uses mocked schemas & IssuesApi to avoid real network calls.
 */

import { IssueService, FieldService } from '../index.js';

console.log('\n🚀 IssueService Orchestration Example');

// Create a FieldService and mock schema retrieval (avoids Jira network)
const fieldService = new FieldService();
fieldService.fieldsApi.getAllFieldSchemas = async () => ([
  { name: 'Summary', required: true, schema: { type: 'string' } },
  { name: 'Labels', required: false, schema: { type: 'array', items: { type: 'string' } } },
  { name: 'Story Points', required: false, schema: { type: 'number' } }
]);

// Mock IssuesApi (inject into IssueService) to avoid real HTTP
const mockIssuesApi = {
  async createIssue(payload) {
    // Simulate server assigning key/id
    return { issue_key: 'DEMO-123', issue_id: '10000', issue_link: 'http://example/browse/DEMO-123' };
  }
};

const issueService = new IssueService({ fieldService, issuesApi: mockIssuesApi });

// Raw user-provided fields (mixed casing, extra whitespace, unknown field included)
const rawFields = {
  Summary: '  Implement IssueService  ',
  Labels: 'example, usage ',
  'Story Points': '8',
  Foo: 'bar' // unknown
};

const projectKey = 'DEMO';
const issueTypeId = '10001'; // Example issue type id

// 1. Format
const formatResult = await issueService.format(rawFields, projectKey, issueTypeId);
console.log('\n🧩 Format Result:', JSON.stringify(formatResult, null, 2));

// 2. Validate (can validate raw or formatted; here we validate formatted subset)
const validateResult = await issueService.validate(formatResult.fields, projectKey, issueTypeId);
console.log('\n✅ Validate Result:', JSON.stringify(validateResult, null, 2));

// 3. Prepare full Jira payload (adds project & issue type envelope) without creating yet
const { baseIssue, format: prepareFormat } = await issueService.prepare({
  projectKey,
  issueTypeId,
  summary: 'Implement IssueService',
  description: 'Adds orchestration layer example',
  fields: rawFields
});
console.log('\n📦 Prepared Payload:', JSON.stringify(baseIssue, null, 2));
console.log('\n📝 Prepare Format Summary:', JSON.stringify(prepareFormat.meta, null, 2));

// 4. Create (mocked)
const createResult = await issueService.create(baseIssue);
console.log('\n🛠 Create Result:', JSON.stringify(createResult, null, 2));

console.log('\n✅ IssueService example completed.');
