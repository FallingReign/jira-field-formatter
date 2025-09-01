// Domain Field model encapsulating single-field behavior
// Uses existing formatting & validation utilities – no duplication of logic
// Schema mapping kept intentionally focused; service-layer orchestration comes later.

// Consolidated single-source for field types & formatting logic (v3.0.0)
import { formatDateValue, formatDateTimeValue } from '../utils/dateUtils.js';
import { parseTimeTracking } from '../utils/timeUtils.js';
import { isEmpty, sanitizeString, parseNumber, validateFieldTypes, validateValueForFieldType } from '../utils/validationUtils.js';

export const FieldTypes = {
  ISSUE_TYPE: 'issuetype',
  ASSIGNEE: 'assignee',
  REPORTER: 'reporter',
  PRIORITY: 'priority',
  RESOLUTION: 'resolution',
  STATUS: 'status',
  SECURITY_LEVEL: 'securitylevel',
  USER: 'user',
  OPTION: 'option',
  VERSION: 'version',
  COMPONENT: 'component',
  ISSUE_LINK: 'issuelink',
  ISSUE_LINKS: 'issuelinks',
  PROJECT: 'project',
  OPTION_WITH_CHILD: 'option-with-child',
  TIME_TRACKING: 'timetracking',
  ATTACHMENT: 'attachment',
  WATCHES: 'watches',
  SD_SERVICE_LEVEL_AGREEMENT: 'sd-servicelevelagreement',
  SD_APPROVALS: 'sd-approvals',
  SD_CUSTOMER_REQUEST_TYPE: 'sd-customerrequesttype',
  DATE: 'date',
  DATETIME: 'datetime',
  ARRAY: 'array',
  STRING: 'string',
  NUMBER: 'number',
  ANY: 'any'
};

export const ARRAY_ITEM_TYPES = new Set([
  FieldTypes.ISSUE_TYPE,
  FieldTypes.ASSIGNEE,
  FieldTypes.REPORTER,
  FieldTypes.PRIORITY,
  FieldTypes.RESOLUTION,
  FieldTypes.STATUS,
  FieldTypes.SECURITY_LEVEL,
  FieldTypes.USER,
  FieldTypes.OPTION,
  FieldTypes.VERSION,
  FieldTypes.COMPONENT,
  FieldTypes.ISSUE_LINK,
  FieldTypes.ISSUE_LINKS,
  FieldTypes.PROJECT,
  FieldTypes.OPTION_WITH_CHILD,
  FieldTypes.TIME_TRACKING,
  FieldTypes.ATTACHMENT,
  FieldTypes.WATCHES,
  FieldTypes.SD_SERVICE_LEVEL_AGREEMENT,
  FieldTypes.SD_APPROVALS,
  FieldTypes.SD_CUSTOMER_REQUEST_TYPE,
  FieldTypes.DATE,
  FieldTypes.DATETIME,
  FieldTypes.STRING,
  FieldTypes.NUMBER,
  FieldTypes.ANY,
  'checklist-item'
]);

export const NAME_FORMAT_TYPES = new Set([
  FieldTypes.ISSUE_TYPE,
  FieldTypes.ASSIGNEE,
  FieldTypes.REPORTER,
  FieldTypes.PRIORITY,
  FieldTypes.RESOLUTION,
  FieldTypes.STATUS,
  FieldTypes.SECURITY_LEVEL,
  FieldTypes.USER,
  FieldTypes.OPTION,
  FieldTypes.VERSION,
  FieldTypes.COMPONENT,
  FieldTypes.ATTACHMENT,
  FieldTypes.SD_SERVICE_LEVEL_AGREEMENT,
  FieldTypes.SD_APPROVALS,
  FieldTypes.SD_CUSTOMER_REQUEST_TYPE
]);

export const KEY_FORMAT_TYPES = new Set([
  FieldTypes.ISSUE_LINK,
  FieldTypes.ISSUE_LINKS,
  FieldTypes.PROJECT
]);

export const DATE_TIME_TYPES = new Set([
  FieldTypes.DATE,
  FieldTypes.DATETIME
]);

export function isValidFieldType(fieldType) { return Object.values(FieldTypes).includes(fieldType); }
export function isValidArrayFieldType(arrayFieldType) { return ARRAY_ITEM_TYPES.has(arrayFieldType); }
export function getFieldFormat(fieldType) {
  if (NAME_FORMAT_TYPES.has(fieldType)) return 'name';
  if (KEY_FORMAT_TYPES.has(fieldType)) return 'key';
  if (DATE_TIME_TYPES.has(fieldType) || fieldType === FieldTypes.OPTION_WITH_CHILD || fieldType === FieldTypes.TIME_TRACKING) return 'object';
  if (fieldType === FieldTypes.ARRAY) return 'array';
  return 'primitive';
}

// Core formatting previously in formatter.js now local here
export function formatFieldValue(value, fieldType, arrayFieldType) {
  const validation = validateFieldTypes(fieldType, arrayFieldType);
  if (!validation.isValid) throw new Error(validation.error);
  if (isEmpty(value)) {
    if (fieldType === FieldTypes.WATCHES) return { watchers: [] };
    return null;
  }
  const valueValidation = validateValueForFieldType(value, fieldType);
  if (!valueValidation.isValid) throw new Error(valueValidation.error);
  const strValue = sanitizeString(value);
  switch (fieldType) {
    case FieldTypes.ISSUE_TYPE:
    case FieldTypes.ASSIGNEE:
    case FieldTypes.REPORTER:
    case FieldTypes.PRIORITY:
    case FieldTypes.RESOLUTION:
    case FieldTypes.STATUS:
    case FieldTypes.SECURITY_LEVEL:
    case FieldTypes.USER:
    case FieldTypes.OPTION:
    case FieldTypes.VERSION:
    case FieldTypes.COMPONENT:
    case FieldTypes.ATTACHMENT:
    case FieldTypes.SD_SERVICE_LEVEL_AGREEMENT:
    case FieldTypes.SD_APPROVALS:
    case FieldTypes.SD_CUSTOMER_REQUEST_TYPE:
      return { name: strValue };
    case FieldTypes.ISSUE_LINK:
    case FieldTypes.ISSUE_LINKS:
    case FieldTypes.PROJECT:
      return { key: strValue };
    case FieldTypes.OPTION_WITH_CHILD:
      return parseOptionWithChild(strValue);
    case FieldTypes.WATCHES:
      return parseWatches(strValue);
    case FieldTypes.DATE:
      return formatDateValue(value);
    case FieldTypes.DATETIME:
      return formatDateTimeValue(value);
    case FieldTypes.TIME_TRACKING:
      return parseTimeTracking(strValue);
    case FieldTypes.ARRAY:
      return formatArrayValue(strValue, arrayFieldType);
    case FieldTypes.NUMBER:
      return parseNumber(strValue);
    case FieldTypes.STRING:
    case FieldTypes.ANY:
    default:
      return strValue;
  }
}

function formatArrayValue(value, arrayFieldType) {
  if (!arrayFieldType) throw new Error('Array field type is required for array fields');
  if (arrayFieldType === 'checklist-item') {
    try { return JSON.parse(value); } catch (e) { throw new Error(`Invalid JSON format for checklist-item: ${e.message}`); }
  }
  return value.split(',').map(v => v.trim()).filter(v => v !== '').map(item => formatFieldValue(item, arrayFieldType));
}

function parseOptionWithChild(value) {
  const parts = value.split('->').map(v => v.trim());
  if (parts.length > 1) return { value: parts[0], child: { value: parts[1] } };
  return { value: parts[0] };
}

function parseWatches(value) {
  if (!value || value.trim() === '') return { watchers: [] };
  const watchers = value.split(',').map(v => v.trim()).filter(Boolean).map(name => ({ name }));
  return { watchers };
}

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
    return formatFieldValue(value, this.fieldType, this.arrayItemType);
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
