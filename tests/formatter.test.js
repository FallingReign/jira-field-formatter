/**
 * Tests for the main formatter functionality
 */

// Import from public API (post-consolidation)
import { formatValue, getFieldTypeDefinitions, validateFieldType, getFieldTypeInfo, FieldTypes } from '..';

describe('formatValue', () => {
  describe('Empty values', () => {
    test('should return null for empty string', () => {
      expect(formatValue('', FieldTypes.STRING)).toBeNull();
    });

    test('should return null for null value', () => {
      expect(formatValue(null, FieldTypes.STRING)).toBeNull();
    });

    test('should return null for undefined value', () => {
      expect(formatValue(undefined, FieldTypes.STRING)).toBeNull();
    });

    test('should return null for whitespace-only string', () => {
      expect(formatValue('   ', FieldTypes.STRING)).toBeNull();
    });
  });

  describe('Name format types', () => {
    test('should format issue type correctly', () => {
      expect(formatValue('Bug', FieldTypes.ISSUE_TYPE)).toEqual({ name: 'Bug' });
    });

    test('should format assignee correctly', () => {
      expect(formatValue('john.doe', FieldTypes.ASSIGNEE)).toEqual({ name: 'john.doe' });
    });

    test('should format priority correctly', () => {
      expect(formatValue('High', FieldTypes.PRIORITY)).toEqual({ name: 'High' });
    });

    test('should format attachment correctly', () => {
      expect(formatValue('document.pdf', FieldTypes.ATTACHMENT)).toEqual({ name: 'document.pdf' });
    });

    test('should trim whitespace in name format', () => {
      expect(formatValue('  Bug  ', FieldTypes.ISSUE_TYPE)).toEqual({ name: 'Bug' });
    });
  });

  describe('Key format types', () => {
    test('should format project correctly', () => {
      expect(formatValue('PROJ', FieldTypes.PROJECT)).toEqual({ key: 'PROJ' });
    });

    test('should format issue link correctly', () => {
      expect(formatValue('PROJ-123', FieldTypes.ISSUE_LINK)).toEqual({ key: 'PROJ-123' });
    });

    test('should format issue links correctly', () => {
      expect(formatValue('PROJ-123', FieldTypes.ISSUE_LINKS)).toEqual({ key: 'PROJ-123' });
    });
  });

  describe('Option with child (cascading select)', () => {
    test('should format parent and child option', () => {
      expect(formatValue('Parent -> Child', FieldTypes.OPTION_WITH_CHILD)).toEqual({
        value: 'Parent',
        child: { value: 'Child' }
      });
    });

    test('should format parent only option', () => {
      expect(formatValue('Parent', FieldTypes.OPTION_WITH_CHILD)).toEqual({
        value: 'Parent'
      });
    });

    test('should handle extra whitespace in cascading select', () => {
      expect(formatValue('Parent  ->  Child', FieldTypes.OPTION_WITH_CHILD)).toEqual({
        value: 'Parent',
        child: { value: 'Child' }
      });
    });
  });

  describe('Numbers', () => {
    test('should format integer correctly', () => {
      expect(formatValue('123', FieldTypes.NUMBER)).toBe(123);
    });

    test('should format float correctly', () => {
      expect(formatValue('123.45', FieldTypes.NUMBER)).toBe(123.45);
    });

    test('should return null for invalid number', () => {
      expect(formatValue('not-a-number', FieldTypes.NUMBER)).toBeNull();
    });
  });

  describe('Strings', () => {
    test('should format string correctly', () => {
      expect(formatValue('Hello World', FieldTypes.STRING)).toBe('Hello World');
    });

    test('should trim whitespace from strings', () => {
      expect(formatValue('  Hello World  ', FieldTypes.STRING)).toBe('Hello World');
    });
  });

  describe('Arrays', () => {
    test('should format array of options', () => {
      const result = formatValue('Option1,Option2,Option3', FieldTypes.ARRAY, FieldTypes.OPTION);
      expect(result).toEqual([
        { name: 'Option1' },
        { name: 'Option2' },
        { name: 'Option3' }
      ]);
    });

    test('should format array of strings', () => {
      const result = formatValue('Item1,Item2,Item3', FieldTypes.ARRAY, FieldTypes.STRING);
      expect(result).toEqual(['Item1', 'Item2', 'Item3']);
    });

    test('should handle whitespace in array items', () => {
      const result = formatValue('Item1, Item2 , Item3', FieldTypes.ARRAY, FieldTypes.STRING);
      expect(result).toEqual(['Item1', 'Item2', 'Item3']);
    });

    test('should filter empty array items', () => {
      const result = formatValue('Item1,,Item3,', FieldTypes.ARRAY, FieldTypes.STRING);
      expect(result).toEqual(['Item1', 'Item3']);
    });

    test('should parse JSON for checklist items', () => {
      const jsonValue = JSON.stringify([{ name: 'Item 1', completed: false }]);
      const result = formatValue(jsonValue, FieldTypes.ARRAY, 'checklist-item');
      expect(result).toEqual([{ name: 'Item 1', completed: false }]);
    });
  });

  describe('String field types', () => {
    test('should accept string field types directly', () => {
      expect(formatValue('Bug', 'issuetype')).toEqual({ name: 'Bug' });
      expect(formatValue('High', 'priority')).toEqual({ name: 'High' });
      expect(formatValue('PROJ', 'project')).toEqual({ key: 'PROJ' });
      expect(formatValue('2023-12-25', 'date')).toBe('2023-12-25');
      expect(formatValue('42', 'number')).toBe(42);
      expect(formatValue('Hello', 'string')).toBe('Hello');
    });

    test('should handle arrays with string field types', () => {
      const result = formatValue('Red,Green,Blue', 'array', 'option');
      expect(result).toEqual([
        { name: 'Red' },
        { name: 'Green' },
        { name: 'Blue' }
      ]);
    });

    test('should handle all Jira field type strings', () => {
      // Test all field types work as strings
      expect(formatValue('Bug', 'issuetype')).toEqual({ name: 'Bug' });
      expect(formatValue('user123', 'user')).toEqual({ name: 'user123' });
      expect(formatValue('High', 'priority')).toEqual({ name: 'High' });
      expect(formatValue('Done', 'resolution')).toEqual({ name: 'Done' });
      expect(formatValue('In Progress', 'status')).toEqual({ name: 'In Progress' });
      expect(formatValue('Restricted', 'securitylevel')).toEqual({ name: 'Restricted' });
      expect(formatValue('TEST-123', 'project')).toEqual({ key: 'TEST-123' });
      expect(formatValue('attachment123', 'attachment')).toEqual({ name: 'attachment123' });
      expect(formatValue('user1,user2', 'watches')).toEqual({ 
        watchers: [{ name: 'user1' }, { name: 'user2' }] 
      });
      expect(formatValue('SLA Level 1', 'sd-servicelevelagreement')).toEqual({ name: 'SLA Level 1' });
      expect(formatValue('Approval 1', 'sd-approvals')).toEqual({ name: 'Approval 1' });
      expect(formatValue('Service Request', 'sd-customerrequesttype')).toEqual({ name: 'Service Request' });
    });
  });

  describe('Error handling', () => {
    test('should throw error for invalid field type', () => {
      expect(() => formatValue('test', 'invalid-type')).toThrow('Invalid field type: invalid-type');
    });

    test('should throw error for array without array field type', () => {
      expect(() => formatValue('test', FieldTypes.ARRAY)).toThrow('Array field type is required when fieldType is "array"');
    });

    test('should throw error for invalid array field type', () => {
      expect(() => formatValue('test', FieldTypes.ARRAY, 'invalid-array-type')).toThrow('Invalid array field type: invalid-array-type');
    });

    test('should throw error for invalid JSON in checklist items', () => {
      expect(() => formatValue('invalid-json', FieldTypes.ARRAY, 'checklist-item'))
        .toThrow('Invalid JSON format for checklist-item');
    });
  });

  describe('Watches field', () => {
    it('should format single watcher', () => {
      expect(formatValue('user123', FieldTypes.WATCHES)).toEqual({ 
        watchers: [{ name: 'user123' }] 
      });
    });

    it('should format multiple watchers', () => {
      expect(formatValue('user1,user2,user3', FieldTypes.WATCHES)).toEqual({ 
        watchers: [
          { name: 'user1' }, 
          { name: 'user2' }, 
          { name: 'user3' }
        ] 
      });
    });

    it('should handle whitespace in watchers list', () => {
      expect(formatValue(' user1 , user2 , user3 ', FieldTypes.WATCHES)).toEqual({ 
        watchers: [
          { name: 'user1' }, 
          { name: 'user2' }, 
          { name: 'user3' }
        ] 
      });
    });

    it('should return empty array for empty watchers', () => {
      expect(formatValue('', FieldTypes.WATCHES)).toEqual({ watchers: [] });
      expect(formatValue('   ', FieldTypes.WATCHES)).toEqual({ watchers: [] });
    });

    it('should filter out empty watchers', () => {
      expect(formatValue('user1,,user2,', FieldTypes.WATCHES)).toEqual({ 
        watchers: [
          { name: 'user1' }, 
          { name: 'user2' }
        ] 
      });
    });
  });

  describe('New field types', () => {
    it('should format resolution correctly', () => {
      expect(formatValue('Done', FieldTypes.RESOLUTION)).toEqual({ name: 'Done' });
      expect(formatValue('Won\'t Fix', FieldTypes.RESOLUTION)).toEqual({ name: 'Won\'t Fix' });
    });

    it('should format status correctly', () => {
      expect(formatValue('In Progress', FieldTypes.STATUS)).toEqual({ name: 'In Progress' });
      expect(formatValue('Done', FieldTypes.STATUS)).toEqual({ name: 'Done' });
    });

    it('should format security level correctly', () => {
      expect(formatValue('Restricted', FieldTypes.SECURITY_LEVEL)).toEqual({ name: 'Restricted' });
      expect(formatValue('Public', FieldTypes.SECURITY_LEVEL)).toEqual({ name: 'Public' });
    });

    it('should format Service Desk fields correctly', () => {
      expect(formatValue('SLA Level 1', FieldTypes.SD_SERVICE_LEVEL_AGREEMENT)).toEqual({ name: 'SLA Level 1' });
      expect(formatValue('Manager Approval', FieldTypes.SD_APPROVALS)).toEqual({ name: 'Manager Approval' });
      expect(formatValue('Service Request', FieldTypes.SD_CUSTOMER_REQUEST_TYPE)).toEqual({ name: 'Service Request' });
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
    expect(info).toEqual({
      fieldType: FieldTypes.STRING,
      format: 'primitive',
      isArray: false,
      requiresArrayType: false,
      description: 'Text string'
    });
  });

  test('should return correct info for array field', () => {
    const info = getFieldTypeInfo(FieldTypes.ARRAY);
    expect(info).toEqual({
      fieldType: FieldTypes.ARRAY,
      format: 'array',
      isArray: true,
      requiresArrayType: true,
      description: 'Array of values'
    });
  });

  test('should return correct info for name format field', () => {
    const info = getFieldTypeInfo(FieldTypes.ASSIGNEE);
    expect(info).toEqual({
      fieldType: FieldTypes.ASSIGNEE,
      format: 'name',
      isArray: false,
      requiresArrayType: false,
      description: 'User assigned to the issue'
    });
  });

  test('should throw error for invalid field type', () => {
    expect(() => getFieldTypeInfo('invalid-type')).toThrow('Invalid field type: invalid-type');
  });
});
