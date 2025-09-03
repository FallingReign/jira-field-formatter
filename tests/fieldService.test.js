import { FieldService } from '../src/services/index.js';

// Lightweight mock logger
const logger = { info: () => {}, error: () => {} };

function createServiceWithMockSchemas() {
  const service = new FieldService();
  service.fieldsApi.getAllFieldSchemas = async () => ([
    { name: 'Summary', required: true, schema: { type: 'string' } },
    { name: 'Labels', required: false, schema: { type: 'array', items: { type: 'string' } } },
    { name: 'Components', required: false, schema: { type: 'array', items: { type: 'option' } } }
  ]);
  
  // Mock issue type resolution
  service.fieldsApi.resolveIssueTypeId = async (issueType) => {
    if (/^\d+$/.test(issueType)) return issueType;
    const mapping = { 'Task': '10200', 'Bug': '10203', 'Epic': '10000' };
    return mapping[issueType] || issueType;
  };
  
  return service;
}

describe('FieldService', () => {
  test('buildFields constructs Field objects', async () => {
    const service = createServiceWithMockSchemas();
    const { fieldsMap } = await service.buildFields('PROJ', '10001', logger);
    expect(fieldsMap.get('summary')).toBeDefined();
    expect(fieldsMap.get('labels')).toBeDefined();
  });

  test('formatInputPayload formats known fields and flags unknown', async () => {
    const service = createServiceWithMockSchemas();
    const { fields, diagnostics } = await service.formatInputPayload({ Summary: '  Title ', Labels: 'one,two', Foo: 'bar' }, 'PROJ', '10001', logger);
    expect(fields.Summary).toBe('Title');
    expect(Array.isArray(fields.Labels)).toBe(true);
    expect(diagnostics.unknownFields).toContain('Foo');
  });

  test('validateInputPayload detects missing required field', async () => {
    const service = createServiceWithMockSchemas();
    const result = await service.validateInputPayload({ Labels: 'a,b' }, 'PROJ', '10001', logger);
    expect(result.valid).toBe(false);
    expect(result.errors.join(' ')).toMatch(/Missing required field/i);
  });

  test('supports issue type names in formatInputPayload', async () => {
    const service = createServiceWithMockSchemas();
    const { fields, diagnostics } = await service.formatInputPayload(
      { Summary: '  Test Task ', Labels: 'bug,feature' }, 
      'PROJ', 
      'Task', // Using issue type name instead of ID
      logger
    );
    expect(fields.Summary).toBe('Test Task');
    expect(Array.isArray(fields.Labels)).toBe(true);
    expect(diagnostics.formattedCount).toBe(2);
  });

  test('supports issue type names in validateInputPayload', async () => {
    const service = createServiceWithMockSchemas();
    const result = await service.validateInputPayload(
      { Summary: 'Valid summary' }, 
      'PROJ', 
      'Bug', // Using issue type name
      logger
    );
    expect(result.valid).toBe(true);
  });

  test('backward compatibility with numeric issue type IDs', async () => {
    const service = createServiceWithMockSchemas();
    const { fields } = await service.formatInputPayload(
      { Summary: '  Legacy Test ' }, 
      'PROJ', 
      '10001', // Still using numeric ID
      logger
    );
    expect(fields.Summary).toBe('Legacy Test');
  });
});
