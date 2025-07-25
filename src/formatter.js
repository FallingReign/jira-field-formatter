/**
 * Main field formatter for Jira API compatibility
 * Converts various input types to properly formatted JSON objects for Jira REST API
 */

import { FieldTypes, NAME_FORMAT_TYPES, KEY_FORMAT_TYPES } from './fieldTypes.js';
import { formatDateValue, formatDateTimeValue } from './utils/dateUtils.js';
import { parseTimeTracking } from './utils/timeUtils.js';
import { isEmpty, sanitizeString, parseNumber, validateFieldTypes, validateValueForFieldType } from './utils/validationUtils.js';

/**
 * Format a value for Jira API based on field type
 * @param {any} value - The value to format
 * @param {string} fieldType - The Jira field type
 * @param {string} [arrayFieldType] - The type of items in an array field
 * @returns {any} Formatted value ready for Jira API
 * @throws {Error} If field types are invalid or value cannot be formatted
 */
export function formatValue(value, fieldType, arrayFieldType) {
  // Validate field types
  const validation = validateFieldTypes(fieldType, arrayFieldType);
  if (!validation.isValid) {
    throw new Error(validation.error);
  }

  // Handle empty values - return null to avoid Jira API errors
  // Exception: watches field should return empty array instead of null
  if (isEmpty(value)) {
    if (fieldType === FieldTypes.WATCHES || fieldType === 'watches') {
      return { watchers: [] };
    }
    return null;
  }

  // Validate value for field type
  const valueValidation = validateValueForFieldType(value, fieldType);
  if (!valueValidation.isValid) {
    throw new Error(valueValidation.error);
  }

  const strValue = sanitizeString(value);

  switch (fieldType) {
    // Types that use { name: value } format
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

    // Types that use { key: value } format
    case FieldTypes.ISSUE_LINK:
    case FieldTypes.ISSUE_LINKS:
    case FieldTypes.PROJECT:
      return { key: strValue };

    // Handle option-with-child (cascading select fields)
    case FieldTypes.OPTION_WITH_CHILD:
      return parseOptionWithChild(strValue);

    // Handle watches field (special object format)
    case FieldTypes.WATCHES:
      return parseWatches(strValue);

    // Handle date types
    case FieldTypes.DATE:
      return formatDateValue(value);

    // Handle datetime types
    case FieldTypes.DATETIME:
      return formatDateTimeValue(value);

    // Handle timetracking fields
    case FieldTypes.TIME_TRACKING:
      return parseTimeTracking(strValue);

    // Handle array types based on the items they contain
    case FieldTypes.ARRAY:
      return formatArrayValue(strValue, arrayFieldType);

    // Handle numbers
    case FieldTypes.NUMBER:
      return parseNumber(strValue);

    // String, any, and default - just return the string value
    case FieldTypes.STRING:
    case FieldTypes.ANY:
    default:
      return strValue;
  }
}

/**
 * Format an array value based on the array field type
 * @param {string} value - The value to format (comma-separated or JSON)
 * @param {string} arrayFieldType - The type of items in the array
 * @returns {array} Formatted array for Jira API
 */
function formatArrayValue(value, arrayFieldType) {
  if (!arrayFieldType) {
    throw new Error('Array field type is required for array fields');
  }

  // Handle special case for checklist items (JSON format)
  if (arrayFieldType === 'checklist-item') {
    try {
      return JSON.parse(value);
    } catch (error) {
      throw new Error(`Invalid JSON format for checklist-item: ${error.message}`);
    }
  }

  // Split comma-separated values and format each item
  const items = value.split(',').map(val => val.trim()).filter(val => val !== '');
  
  return items.map(item => formatValue(item, arrayFieldType));
}

/**
 * Parse cascading select field values (option-with-child)
 * @param {string} value - Value in "parent->child" format
 * @returns {object} Formatted cascading select object
 */
function parseOptionWithChild(value) {
  const parts = value.split('->').map(v => v.trim());
  
  if (parts.length > 1) {
    return {
      value: parts[0],
      child: { value: parts[1] }
    };
  }
  
  return { value: parts[0] };
}

/**
 * Parse watches field values
 * @param {string} value - Comma-separated list of usernames or user keys
 * @returns {object} Formatted watches object
 */
function parseWatches(value) {
  if (!value || value.trim() === '') {
    return { watchers: [] };
  }
  
  const usernames = value.split(',').map(v => v.trim()).filter(v => v);
  const watchers = usernames.map(username => ({ name: username }));
  
  return { watchers };
}

/**
 * Get all supported field types
 * @returns {object} Object containing all field type constants
 */
export function getFieldTypeDefinitions() {
  return FieldTypes;
}

/**
 * Check if a field type is valid
 * @param {string} fieldType - The field type to validate
 * @returns {boolean} True if the field type is valid
 */
export function validateFieldType(fieldType) {
  return Object.values(FieldTypes).includes(fieldType);
}

/**
 * Get formatting information for a field type
 * @param {string} fieldType - The field type
 * @returns {object} Information about how the field type is formatted
 */
export function getFieldTypeInfo(fieldType) {
  if (!validateFieldType(fieldType)) {
    throw new Error(`Invalid field type: ${fieldType}`);
  }

  return {
    fieldType,
    format: getFieldFormat(fieldType),
    isArray: fieldType === FieldTypes.ARRAY,
    requiresArrayType: fieldType === FieldTypes.ARRAY,
    description: getFieldTypeDescription(fieldType)
  };
}

/**
 * Get the format category for a field type
 * @param {string} fieldType - The field type
 * @returns {string} The format category
 */
function getFieldFormat(fieldType) {
  if (NAME_FORMAT_TYPES.has(fieldType)) {
    return 'name';
  }
  if (KEY_FORMAT_TYPES.has(fieldType)) {
    return 'key';
  }
  if ([FieldTypes.DATE, FieldTypes.DATETIME, FieldTypes.OPTION_WITH_CHILD, FieldTypes.TIME_TRACKING].includes(fieldType)) {
    return 'object';
  }
  if (fieldType === FieldTypes.ARRAY) {
    return 'array';
  }
  return 'primitive';
}

/**
 * Get a description for a field type
 * @param {string} fieldType - The field type
 * @returns {string} Description of the field type
 */
function getFieldTypeDescription(fieldType) {
  const descriptions = {
    [FieldTypes.ISSUE_TYPE]: 'Issue type (e.g., "Bug", "Story")',
    [FieldTypes.ASSIGNEE]: 'User assigned to the issue',
    [FieldTypes.REPORTER]: 'User who reported the issue',
    [FieldTypes.PRIORITY]: 'Issue priority (e.g., "High", "Low")',
    [FieldTypes.USER]: 'Generic user field',
    [FieldTypes.OPTION]: 'Single select option',
    [FieldTypes.VERSION]: 'Version field',
    [FieldTypes.COMPONENT]: 'Component field',
    [FieldTypes.ATTACHMENT]: 'File attachment reference',
    [FieldTypes.ISSUE_LINK]: 'Link to another issue',
    [FieldTypes.ISSUE_LINKS]: 'Multiple links to other issues',
    [FieldTypes.PROJECT]: 'Project reference',
    [FieldTypes.OPTION_WITH_CHILD]: 'Cascading select field (Parent -> Child)',
    [FieldTypes.TIME_TRACKING]: 'Time tracking (e.g., "2w 3d 4h 30m")',
    [FieldTypes.DATE]: 'Date field (YYYY-MM-DD)',
    [FieldTypes.DATETIME]: 'DateTime field (ISO format)',
    [FieldTypes.ARRAY]: 'Array of values',
    [FieldTypes.STRING]: 'Text string',
    [FieldTypes.NUMBER]: 'Numeric value',
    [FieldTypes.ANY]: 'Any value type'
  };

  return descriptions[fieldType] || 'Unknown field type';
}
