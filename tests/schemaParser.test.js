// Test for the enhanced schema parsing capabilities
import { describe, test, expect } from '@jest/globals';
import Field from '../src/domain/Field.js';
import { mapSchemaToFieldType } from '../src/domain/Field.js';
import { FieldTypes } from '../src/domain/Field.js';

describe('Enhanced Schema Parsing', () => {
  describe('Primitive array items format (Jira Server)', () => {
    test('should parse labels schema with primitive string items', () => {
      const schema = {
        schema: {
          type: 'array',
          items: 'string',  // Primitive format
          system: 'labels'
        }
      };
      
      const field = new Field({ key: 'labels', name: 'Labels', schema });
      expect(field.fieldType).toBe(FieldTypes.ARRAY);
      expect(field.arrayItemType).toBe(FieldTypes.STRING);
      
      const result = field.format('tag1, tag2, tag3');
      expect(result).toEqual(['tag1', 'tag2', 'tag3']);
    });

    test('should parse fixVersions schema with primitive version items', () => {
      const schema = {
        schema: {
          type: 'array',
          items: 'version'  // Primitive format
        }
      };
      
      const field = new Field({ key: 'fixVersions', name: 'Fix Version/s', schema });
      expect(field.fieldType).toBe(FieldTypes.ARRAY);
      expect(field.arrayItemType).toBe(FieldTypes.VERSION);
      
      const result = field.format('v1.0, v2.0');
      expect(result).toEqual([{ name: 'v1.0' }, { name: 'v2.0' }]);
    });

    test('should parse components schema with primitive component items', () => {
      const schema = {
        schema: {
          type: 'array',
          items: 'component'  // Primitive format
        }
      };
      
      const field = new Field({ key: 'components', name: 'Components', schema });
      expect(field.fieldType).toBe(FieldTypes.ARRAY);
      expect(field.arrayItemType).toBe(FieldTypes.COMPONENT);
      
      const result = field.format('Frontend, Backend');
      expect(result).toEqual([{ name: 'Frontend' }, { name: 'Backend' }]);
    });
  });

  describe('Object array items format (Jira Cloud)', () => {
    test('should parse labels schema with object string items', () => {
      const schema = {
        schema: {
          type: 'array',
          items: { type: 'string' }  // Object format
        }
      };
      
      const field = new Field({ key: 'labels', name: 'Labels', schema });
      expect(field.fieldType).toBe(FieldTypes.ARRAY);
      expect(field.arrayItemType).toBe(FieldTypes.STRING);
      
      const result = field.format('tag1, tag2, tag3');
      expect(result).toEqual(['tag1', 'tag2', 'tag3']);
    });

    test('should parse fixVersions schema with object version items', () => {
      const schema = {
        schema: {
          type: 'array',
          items: { type: 'version' }  // Object format
        }
      };
      
      const field = new Field({ key: 'fixVersions', name: 'Fix Version/s', schema });
      expect(field.fieldType).toBe(FieldTypes.ARRAY);
      expect(field.arrayItemType).toBe(FieldTypes.VERSION);
      
      const result = field.format('v1.0, v2.0');
      expect(result).toEqual([{ name: 'v1.0' }, { name: 'v2.0' }]);
    });
  });

  describe('New Jira-specific field types', () => {
    test('should parse priority field type', () => {
      const schema = {
        schema: {
          type: 'priority',
          system: 'priority'
        }
      };
      
      const field = new Field({ key: 'priority', name: 'Priority', schema });
      expect(field.fieldType).toBe(FieldTypes.PRIORITY);
      
      const result = field.format('High');
      expect(result).toEqual({ name: 'High' });
    });

    test('should parse version field type', () => {
      const schema = {
        schema: {
          type: 'version'
        }
      };
      
      const field = new Field({ key: 'version', name: 'Version', schema });
      expect(field.fieldType).toBe(FieldTypes.VERSION);
      
      const result = field.format('1.0.0');
      expect(result).toEqual({ name: '1.0.0' });
    });

    test('should parse component field type', () => {
      const schema = {
        schema: {
          type: 'component'
        }
      };
      
      const field = new Field({ key: 'component', name: 'Component', schema });
      expect(field.fieldType).toBe(FieldTypes.COMPONENT);
      
      const result = field.format('Frontend');
      expect(result).toEqual({ name: 'Frontend' });
    });
  });

  describe('mapSchemaToFieldType direct testing', () => {
    test('should handle unknown primitive types gracefully', () => {
      const schema = {
        schema: {
          type: 'array',
          items: 'unknowntype'
        }
      };
      
      // Should not throw, should log warning and default to ANY
      const field = new Field({ key: 'test', name: 'Test', schema });
      expect(field.fieldType).toBe(FieldTypes.ARRAY);
      expect(field.arrayItemType).toBe(FieldTypes.ANY);
    });

    test('should throw error for invalid array items type', () => {
      expect(() => {
        mapSchemaToFieldType({
          type: 'array',
          items: 123  // Invalid type
        });
      }).toThrow('Invalid array items type: number');
    });
  });
});
