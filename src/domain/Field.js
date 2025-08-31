// Domain Field model encapsulating single-field behavior
// Uses existing formatting & validation utilities – no duplication of logic
// Schema mapping kept intentionally focused; service-layer orchestration comes later.

import { formatValue } from './formatter.js';
import { isEmpty, validateValueForFieldType } from '../utils/validationUtils.js';
import { FieldTypes } from './fieldTypes.js';

// Cache deprecation / warning guards (if needed later)
let schemaWarningShown = false;

/**
 * Map a Jira createmeta schema object to internal field type + optional array item type.
 * This is a focused, conservative mapper; unknown patterns throw explicit errors.
 */
export function mapSchemaToFieldType(schema) {
  if (!schema || typeof schema !== 'object') {
    throw new Error('Invalid schema: expected object');
  }

  // Jira schema patterns considered:
  // - schema.type: standard types ("string", "number", "date", "datetime", etc.)
  // - schema.custom: e.g. "com.atlassian.jira.plugin.system.customfieldtypes:select"
  // - schema.items: indicates array item type

  const { type, custom, items } = schema.schema || schema; // allow schema already nested

  // Basic primitives
  if (type === 'string') return { fieldType: FieldTypes.STRING };
  if (type === 'number') return { fieldType: FieldTypes.NUMBER };
  if (type === 'date') return { fieldType: FieldTypes.DATE };
  if (type === 'datetime') return { fieldType: FieldTypes.DATETIME };
  if (type === 'any') return { fieldType: FieldTypes.ANY };

  // User / people references
  if (type === 'user') return { fieldType: FieldTypes.USER };

  // Option / select patterns
  if (type === 'option') return { fieldType: FieldTypes.OPTION };

  // Complex with custom identifier (cascading select, etc.)
  if (custom && typeof custom === 'string') {
    if (custom.includes('cascadingselect')) {
      return { fieldType: FieldTypes.OPTION_WITH_CHILD };
    }
    if (custom.includes('select')) {
      return { fieldType: FieldTypes.OPTION };
    }
    if (custom.includes('userpicker')) {
      return { fieldType: FieldTypes.USER };
    }
  }

  // Arrays – map item type recursively
  if (type === 'array') {
    // items may be primitive or object with type/custom
    if (!items) {
      throw new Error('Array schema missing items definition');
    }
    let itemMap;
    try {
      itemMap = mapSchemaToFieldType({ schema: items });
    } catch (e) {
      throw new Error(`Failed to map array item schema: ${e.message}`);
    }
    return { fieldType: FieldTypes.ARRAY, arrayItemType: itemMap.fieldType };
  }

  // Fallback – raise explicit error for visibility
  throw new Error(`Unsupported schema mapping (type=${type}, custom=${custom || 'n/a'})`);
}

/**
 * Field domain object
 * Responsibilities:
 *  - Understand its schema (mapped to internal fieldType)
 *  - Provide format(value), validate(value), isEmpty(value)
 */
export default class Field {
  constructor({ key, name, required = false, schema }) {
    this.key = key;
    this.name = name || key;
    this.required = !!required;
    this.rawSchema = schema || null;

    if (schema) {
      try {
        const mapping = mapSchemaToFieldType(schema);
        this.fieldType = mapping.fieldType;
        this.arrayItemType = mapping.arrayItemType;
      } catch (e) {
        // Defer hard failure; store diagnostic for later
        this.fieldType = FieldTypes.ANY;
        this.arrayItemType = undefined;
        if (!schemaWarningShown) {
          console.warn(`[Field] Schema mapping warning for ${key}: ${e.message}`);
          schemaWarningShown = true;
        }
      }
    } else {
      // Default fallback
      this.fieldType = FieldTypes.ANY;
    }
  }

  /**
   * Format a raw input value using existing formatter logic.
   */
  format(value) {
    return formatValue(value, this.fieldType, this.arrayItemType);
  }

  /**
   * Validate a provided value; returns structured result.
   */
  validate(value) {
    if (this.isEmpty(value)) {
      if (this.required) {
        return { valid: false, errors: ['Value is required'] };
      }
      return { valid: true, errors: [] };
    }
    const result = validateValueForFieldType(value, this.fieldType);
    if (!result.isValid) {
      return { valid: false, errors: [result.error] };
    }
    return { valid: true, errors: [] };
  }

  /**
   * Check if the value is considered empty.
   */
  isEmpty(value) {
    return isEmpty(value);
  }
}
