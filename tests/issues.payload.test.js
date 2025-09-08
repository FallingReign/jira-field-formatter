import { Issues } from '../src/issues/index.js';
import { Fields } from '../src/fields/index.js';

const originalFetch = global.fetch;
function mockFetchSequence(responses){
  let i = 0;
  global.fetch = async () => ({
    ok: true,
    json: async () => responses[i++],
    text: async () => JSON.stringify(responses[i-1])
  });
}

describe('Issues.buildPayload full lifecycle (TDD)', () => {
  afterEach(()=>{ global.fetch = originalFetch; });

  test('formats, validates required, assembles payload & diagnostics (expected partial fail)', async () => {
    mockFetchSequence([
      { issueTypes: [{ name: 'Bug', id: '10001' }] },
      { values: [
        { id: 'summary', name: 'Summary', required: true, schema: { type: 'string' } },
        { id: 'customfield_1', name: 'Story Points', required: false, schema: { type: 'number' } }
      ] }
    ]);
    const { payload, diagnostics } = await Issues.buildPayload({
      projectKey: 'PROJ',
      issueType: 'Bug',
      values: { Summary: 'My Bug', 'Story Points': '8' },
      options: { omitEmpty: true }
    });
    expect(payload.fields.project.key).toBe('PROJ');
    expect(payload.fields.summary).toBe('My Bug');
    expect(diagnostics).toMatchObject({ errors: [], warnings: [] });
  });

  test('reports missing required field (expected fail until validation integrated)', async () => {
    mockFetchSequence([
      { issueTypes: [{ name: 'Bug', id: '10001' }] },
      { values: [ { id: 'summary', name: 'Summary', required: true, schema: { type: 'string' } } ] }
    ]);
    const { diagnostics } = await Issues.buildPayload({
      projectKey: 'PROJ', issueType: 'Bug', values: { }, options: {}
    });
    expect(diagnostics.errors).toContainEqual(expect.objectContaining({ code: 'MISSING_REQUIRED_FIELD', field: 'summary' }));
  });
});
