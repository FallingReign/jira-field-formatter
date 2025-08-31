import { Field, FieldTypes } from '..';

describe('Field domain object', () => {
  const logger = { info: () => {}, error: () => {} };

  test('should map simple string schema', () => {
    const field = new Field({ key: 'summary', name: 'Summary', required: true, schema: { schema: { type: 'string' } } });
    expect(field.fieldType).toBe(FieldTypes.STRING);
    const formatted = field.format('  My Issue  ');
    expect(formatted).toBe('My Issue');
  });

  test('should map array of strings schema', () => {
    const field = new Field({ key: 'labels', name: 'Labels', schema: { schema: { type: 'array', items: { type: 'string' } } } });
    expect(field.fieldType).toBe(FieldTypes.ARRAY);
    expect(field.arrayItemType).toBe(FieldTypes.STRING);
    const formatted = field.format('one, two , three');
    expect(Array.isArray(formatted)).toBe(true);
    expect(formatted).toEqual(['one', 'two', 'three']);
  });

  test('should validate required empty value', () => {
    const field = new Field({ key: 'summary', required: true, schema: { schema: { type: 'string' } } });
    const result = field.validate('');
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toMatch(/required/i);
  });

  test('should format array of option names', () => {
    const field = new Field({ key: 'components', name: 'Components', schema: { schema: { type: 'array', items: { type: 'option' } } } });
    const formatted = field.format('Backend, Frontend');
    expect(formatted).toEqual([{ name: 'Backend' }, { name: 'Frontend' }]);
  });

  test('should gracefully fallback for unsupported schema', () => {
    const field = new Field({ key: 'mystery', schema: { schema: { type: 'complex-weird' } } });
    // Fallback becomes ANY
    expect(field.fieldType).toBe(FieldTypes.ANY);
    // Should just echo sanitized string
    expect(field.format(' value ')).toBe('value');
  });
});
