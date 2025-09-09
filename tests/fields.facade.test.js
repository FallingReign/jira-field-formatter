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

describe('Fields facade (new API) – expanded intent', () => {
  afterEach(()=>{ global.fetch = originalFetch; });

  test('getAllForIssueType returns raw descriptor with schema passthrough', async () => {
    mockFetchSequence([
      { issueTypes: [{ name: 'Bug', id: '10001' }] },
      { values: [ { id: 'customfield_1', name: 'Story Points', required: true, schema: { type: 'number' } } ] }
    ]);
    const list = await Fields.getAllForIssueType({ projectKey: 'PROJ', issueType: 'Bug' });
    expect(list).toHaveLength(1);
    expect(list[0]).toMatchObject({ id: 'customfield_1', name: 'Story Points', required: true });
    expect(list[0].schema).toEqual({ type: 'number' });
  });

  test('findField respects caseInsensitive option (expected fail until implemented)', async () => {
    mockFetchSequence([
      { issueTypes: [{ name: 'Bug', id: '10001' }] },
      { values: [ { id: 'summary', name: 'Summary', required: true, schema: { type: 'string' } } ] }
    ]);
    const d = await Fields.findField({ fieldNameOrId: 'summary', projectKey: 'PROJ', issueType: 'Bug', caseInsensitive: true });
    expect(d?.id).toBe('summary');
  });

  test('findFields returns found + missing arrays (expected fail until implemented for caseInsensitive)', async () => {
    mockFetchSequence([
      { issueTypes: [{ name: 'Task', id: '10002' }] },
      { values: [ { id: 'customfield_2', name: 'Epic Link', required: false, schema: { type: 'string' } } ] }
    ]);
    const res = await Fields.findFields({ fieldNamesOrIds: ['EPIC LINK','Unknown'], projectKey: 'PROJ', issueType: 'Task', caseInsensitive: true });
    expect(res.found.map(f=>f.id)).toContain('customfield_2');
    expect(res.missing).toContain('Unknown');
  });

  test('formatValue returns structured error for unknown field', async () => {
    mockFetchSequence([
      { issueTypes: [{ name: 'Task', id: '10002' }] },
      { values: [] }
    ]);
    const out = await Fields.formatValue({ fieldNameOrId: 'Nonexistent', value: 5, projectKey: 'PROJ', issueType: 'Task' });
    expect(out).toMatchObject({ error: 'UNKNOWN_FIELD', field: 'Nonexistent' });
  });

  test('formatValues handles omitEmpty + suggestOnUnknown (expected fail until implemented)', async () => {
    mockFetchSequence([
      { issueTypes: [{ name: 'Bug', id: '10001' }] },
      { values: [
        { id: 'summary', name: 'Summary', required: true, schema: { type: 'string' } },
        { id: 'customfield_1', name: 'Story Points', required: false, schema: { type: 'number' } }
      ] }
    ]);
    const { fields, unknown, suggestions } = await Fields.formatValues({
      values: { Summary: 'Implement feature', 'Story Points': '', Smmary: 'typo' },
      projectKey: 'PROJ', issueType: 'Bug',
      options: { omitEmpty: true, suggestOnUnknown: true, caseInsensitive: true }
    });
    expect(fields.summary).toBe('Implement feature');
    expect(fields).not.toHaveProperty('customfield_1'); // empty omitted
    expect(unknown).toContain('Smmary');
    // suggestions structure: [{ input, suggestions: [...] }]
    expect(suggestions[0]).toHaveProperty('input', 'Smmary');
  });

  test('isRequired returns true/false appropriately', async () => {
    mockFetchSequence([
      { issueTypes: [{ name: 'Story', id: '10003' }] },
      { values: [ { id: 'summary', name: 'Summary', required: true, schema: { type: 'string' } }, { id: 'customfield_9', name: 'Team', required: false, schema: { type: 'string' } } ] }
    ]);
    const required = await Fields.isRequired({ fieldNameOrId: 'Summary', projectKey: 'PROJ', issueType: 'Story' });
    const optional = await Fields.isRequired({ fieldNameOrId: 'Team', projectKey: 'PROJ', issueType: 'Story' });
    expect(required).toBe(true);
    expect(optional).toBe(false);
  });
});
