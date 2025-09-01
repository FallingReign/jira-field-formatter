/**
 * Tests for the main formatter functionality
 */

// Import from public API (post-consolidation)
import { formatFieldValue, getFieldTypeDefinitions, validateFieldType, getFieldTypeInfo, FieldTypes } from '..';
describe('formatFieldValue', () => {
  describe('Empty values', () => {
    test('should return null for empty string', () => {
  expect(formatFieldValue('', FieldTypes.STRING)).toBeNull();
    });

    test('should return null for null value', () => {
  expect(formatFieldValue(null, FieldTypes.STRING)).toBeNull();
    });

    test('should return null for undefined value', () => {
  expect(formatFieldValue(undefined, FieldTypes.STRING)).toBeNull();
    });

    test('should return null for whitespace-only string', () => {
  expect(formatFieldValue('   ', FieldTypes.STRING)).toBeNull();
    });
  });

  describe('Name format types', () => {
    test('should format issue type correctly', () => {
  expect(formatFieldValue('Bug', FieldTypes.ISSUE_TYPE)).toEqual({ name: 'Bug' });
    });

    test('should format assignee correctly', () => {
  expect(formatFieldValue('john.doe', FieldTypes.ASSIGNEE)).toEqual({ name: 'john.doe' });
    });

    test('should format priority correctly', () => {
  expect(formatFieldValue('High', FieldTypes.PRIORITY)).toEqual({ name: 'High' });
    });

    test('should format attachment correctly', () => {
  expect(formatFieldValue('document.pdf', FieldTypes.ATTACHMENT)).toEqual({ name: 'document.pdf' });
    });

    test('should trim whitespace in name format', () => {
  expect(formatFieldValue('  Bug  ', FieldTypes.ISSUE_TYPE)).toEqual({ name: 'Bug' });
    });
  });

  describe('Key format types', () => {
    test('should format project correctly', () => {
  expect(formatFieldValue('PROJ', FieldTypes.PROJECT)).toEqual({ key: 'PROJ' });
    });

    test('should format issue link correctly', () => {
  expect(formatFieldValue('PROJ-123', FieldTypes.ISSUE_LINK)).toEqual({ key: 'PROJ-123' });
    });

    test('should format issue links correctly', () => {
  expect(formatFieldValue('PROJ-123', FieldTypes.ISSUE_LINKS)).toEqual({ key: 'PROJ-123' });
    });
  });

  describe('Option with child (cascading select)', () => {
    test('should format parent and child option', () => {
  expect(formatFieldValue('Parent -> Child', FieldTypes.OPTION_WITH_CHILD)).toEqual({
        value: 'Parent',
        child: { value: 'Child' }
      });
    });

    test('should format parent only option', () => {
  expect(formatFieldValue('Parent', FieldTypes.OPTION_WITH_CHILD)).toEqual({
        value: 'Parent'
      });
    });

    test('should handle extra whitespace in cascading select', () => {
  expect(formatFieldValue('Parent  ->  Child', FieldTypes.OPTION_WITH_CHILD)).toEqual({
        value: 'Parent',
        child: { value: 'Child' }
      });
    });
  });

  describe('Numbers', () => {
    test('should format integer correctly', () => {
  expect(formatFieldValue('123', FieldTypes.NUMBER)).toBe(123);
    });

    test('should format float correctly', () => {
  expect(formatFieldValue('123.45', FieldTypes.NUMBER)).toBe(123.45);
    });

    test('should return null for invalid number', () => {
  expect(formatFieldValue('not-a-number', FieldTypes.NUMBER)).toBeNull();
    });
  });

  describe('Strings', () => {
    test('should format string correctly', () => {
  expect(formatFieldValue('Hello World', FieldTypes.STRING)).toBe('Hello World');
    });

    test('should trim whitespace from strings', () => {
  expect(formatFieldValue('  Hello World  ', FieldTypes.STRING)).toBe('Hello World');
    });
  });

  describe('Arrays', () => {
    test('should format array of options', () => {
  const result = formatFieldValue('Option1,Option2,Option3', FieldTypes.ARRAY, FieldTypes.OPTION);
      expect(result).toEqual([
        { name: 'Option1' },
        { name: 'Option2' },
        { name: 'Option3' }
      ]);
    });

    test('should format array of strings', () => {
  const result = formatFieldValue('Item1,Item2,Item3', FieldTypes.ARRAY, FieldTypes.STRING);
      expect(result).toEqual(['Item1', 'Item2', 'Item3']);
    });

    test('should handle whitespace in array items', () => {
  const result = formatFieldValue('Item1, Item2 , Item3', FieldTypes.ARRAY, FieldTypes.STRING);
      expect(result).toEqual(['Item1', 'Item2', 'Item3']);
    });

    test('should filter empty array items', () => {
  const result = formatFieldValue('Item1,,Item3,', FieldTypes.ARRAY, FieldTypes.STRING);
      expect(result).toEqual(['Item1', 'Item3']);
    });

    test('should parse JSON for checklist items', () => {
      const jsonValue = JSON.stringify([{ name: 'Item 1', completed: false }]);
  const result = formatFieldValue(jsonValue, FieldTypes.ARRAY, 'checklist-item');
      expect(result).toEqual([{ name: 'Item 1', completed: false }]);
    });
  });

  describe('String field types', () => {
    test('should accept string field types directly', () => {
  expect(formatFieldValue('Bug', 'issuetype')).toEqual({ name: 'Bug' });
  expect(formatFieldValue('High', 'priority')).toEqual({ name: 'High' });
  expect(formatFieldValue('PROJ', 'project')).toEqual({ key: 'PROJ' });
  expect(formatFieldValue('2023-12-25', 'date')).toBe('2023-12-25');
  expect(formatFieldValue('42', 'number')).toBe(42);
  expect(formatFieldValue('Hello', 'string')).toBe('Hello');
    });

    test('should handle arrays with string field types', () => {
  const result = formatFieldValue('Red,Green,Blue', 'array', 'option');
      expect(result).toEqual([
        { name: 'Red' },
        { name: 'Green' },
        { name: 'Blue' }
      ]);
    });

    test('should handle all Jira field type strings', () => {
      // Test all field types work as strings
  expect(formatFieldValue('Bug', 'issuetype')).toEqual({ name: 'Bug' });
  expect(formatFieldValue('user123', 'user')).toEqual({ name: 'user123' });
  expect(formatFieldValue('High', 'priority')).toEqual({ name: 'High' });
  expect(formatFieldValue('Done', 'resolution')).toEqual({ name: 'Done' });
  expect(formatFieldValue('In Progress', 'status')).toEqual({ name: 'In Progress' });
  expect(formatFieldValue('Restricted', 'securitylevel')).toEqual({ name: 'Restricted' });
  expect(formatFieldValue('TEST-123', 'project')).toEqual({ key: 'TEST-123' });
  expect(formatFieldValue('attachment123', 'attachment')).toEqual({ name: 'attachment123' });
  expect(formatFieldValue('user1,user2', 'watches')).toEqual({ 
        watchers: [{ name: 'user1' }, { name: 'user2' }] 
      });
  expect(formatFieldValue('SLA Level 1', 'sd-servicelevelagreement')).toEqual({ name: 'SLA Level 1' });
  expect(formatFieldValue('Approval 1', 'sd-approvals')).toEqual({ name: 'Approval 1' });
  expect(formatFieldValue('Service Request', 'sd-customerrequesttype')).toEqual({ name: 'Service Request' });
    });
  });

  describe('Error handling', () => {
    test('should throw error for invalid field type', () => {
  expect(() => formatFieldValue('test', 'invalid-type')).toThrow('Invalid field type: invalid-type');
    });

    test('should throw error for array without array field type', () => {
  expect(() => formatFieldValue('test', FieldTypes.ARRAY)).toThrow('Array field type is required when fieldType is "array"');
    });

    test('should throw error for invalid array field type', () => {
  expect(() => formatFieldValue('test', FieldTypes.ARRAY, 'invalid-array-type')).toThrow('Invalid array field type: invalid-array-type');
    });

    test('should throw error for invalid JSON in checklist items', () => {
  expect(() => formatFieldValue('invalid-json', FieldTypes.ARRAY, 'checklist-item'))
        .toThrow('Invalid JSON format for checklist-item');
    });
  });

  describe('Watches field', () => {
    it('should format single watcher', () => {
  expect(formatFieldValue('user123', FieldTypes.WATCHES)).toEqual({ 
        watchers: [{ name: 'user123' }] 
      });
    });

    it('should format multiple watchers', () => {
  expect(formatFieldValue('user1,user2,user3', FieldTypes.WATCHES)).toEqual({ 
        watchers: [
          { name: 'user1' }, 
          { name: 'user2' }, 
          { name: 'user3' }
        ] 
      });
    });

    it('should handle whitespace in watchers list', () => {
  expect(formatFieldValue(' user1 , user2 , user3 ', FieldTypes.WATCHES)).toEqual({ 
        watchers: [
          { name: 'user1' }, 
          { name: 'user2' }, 
          { name: 'user3' }
        ] 
      });
    });

    it('should return empty array for empty watchers', () => {
  expect(formatFieldValue('', FieldTypes.WATCHES)).toEqual({ watchers: [] });
  expect(formatFieldValue('   ', FieldTypes.WATCHES)).toEqual({ watchers: [] });
    });

    it('should filter out empty watchers', () => {
  expect(formatFieldValue('user1,,user2,', FieldTypes.WATCHES)).toEqual({ 
        watchers: [
          { name: 'user1' }, 
          { name: 'user2' }
        ] 
      });
    });
  });

  describe('New field types', () => {
    it('should format resolution correctly', () => {
  expect(formatFieldValue('Done', FieldTypes.RESOLUTION)).toEqual({ name: 'Done' });
  expect(formatFieldValue('Won\'t Fix', FieldTypes.RESOLUTION)).toEqual({ name: 'Won\'t Fix' });
    });

    it('should format status correctly', () => {
  expect(formatFieldValue('In Progress', FieldTypes.STATUS)).toEqual({ name: 'In Progress' });
  expect(formatFieldValue('Done', FieldTypes.STATUS)).toEqual({ name: 'Done' });
    });

    it('should format security level correctly', () => {
  expect(formatFieldValue('Restricted', FieldTypes.SECURITY_LEVEL)).toEqual({ name: 'Restricted' });
  expect(formatFieldValue('Public', FieldTypes.SECURITY_LEVEL)).toEqual({ name: 'Public' });
    });

    it('should format Service Desk fields correctly', () => {
  expect(formatFieldValue('SLA Level 1', FieldTypes.SD_SERVICE_LEVEL_AGREEMENT)).toEqual({ name: 'SLA Level 1' });
  expect(formatFieldValue('Manager Approval', FieldTypes.SD_APPROVALS)).toEqual({ name: 'Manager Approval' });
  expect(formatFieldValue('Service Request', FieldTypes.SD_CUSTOMER_REQUEST_TYPE)).toEqual({ name: 'Service Request' });
    });
  });
});

describe('getFieldTypeDefinitions', () => {
  test('should return all field types', () => {
    const definitions = getFieldTypeDefinitions();
    expect(definitions).toBe(FieldTypes);
    expect(definitions.STRING).toBe('string');
    expect(definitions.ARRAY).toBe('array');
  });
});

describe('validateFieldType', () => {
  test('should return true for valid field types', () => {
    expect(validateFieldType(FieldTypes.STRING)).toBe(true);
    expect(validateFieldType(FieldTypes.ARRAY)).toBe(true);
    expect(validateFieldType(FieldTypes.DATE)).toBe(true);
  });

  test('should return false for invalid field types', () => {
    expect(validateFieldType('invalid-type')).toBe(false);
    expect(validateFieldType('')).toBe(false);
    expect(validateFieldType(null)).toBe(false);
  });
});

describe('getFieldTypeInfo', () => {
  test('should return correct info for string field', () => {
    const info = getFieldTypeInfo(FieldTypes.STRING);
  expect(info.fieldType).toBe(FieldTypes.STRING);
  expect(info.format).toBe('primitive');
  expect(info.isArray).toBe(false);
  expect(info.requiresArrayType).toBe(false);
  expect(typeof info.description).toBe('string');
  });

  test('should return correct info for array field', () => {
    const info = getFieldTypeInfo(FieldTypes.ARRAY);
  expect(info.fieldType).toBe(FieldTypes.ARRAY);
  expect(info.format).toBe('array');
  expect(info.isArray).toBe(true);
  expect(info.requiresArrayType).toBe(true);
  expect(typeof info.description).toBe('string');
  });

  test('should return correct info for name format field', () => {
    const info = getFieldTypeInfo(FieldTypes.ASSIGNEE);
  expect(info.fieldType).toBe(FieldTypes.ASSIGNEE);
  expect(info.format).toBe('name');
  expect(info.isArray).toBe(false);
  expect(info.requiresArrayType).toBe(false);
  expect(typeof info.description).toBe('string');
  });

  test('should throw error for invalid field type', () => {
    expect(() => getFieldTypeInfo('invalid-type')).toThrow('Invalid field type: invalid-type');
  });
});
