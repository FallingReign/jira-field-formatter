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
});
